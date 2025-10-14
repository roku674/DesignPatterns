using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

namespace Integration.Channels.PointToPointChannel;

// ============================================================================
// Core Message Types
// ============================================================================

/// <summary>
/// Basic message wrapper with ID and payload
/// </summary>
public class Message<T>
{
    public string MessageId { get; set; }
    public T Payload { get; set; }
    public DateTime Timestamp { get; set; }
    public Dictionary<string, string> Headers { get; set; }

    public Message(string messageId, T payload)
    {
        MessageId = messageId;
        Payload = payload;
        Timestamp = DateTime.UtcNow;
        Headers = new Dictionary<string, string>();
    }
}

/// <summary>
/// Message with reliability features (acknowledgment/rejection)
/// </summary>
public class ReliableMessage<T>
{
    public string MessageId { get; }
    public T Payload { get; }
    public DateTime Timestamp { get; }
    public int DeliveryCount { get; internal set; }

    private bool _acknowledged;
    private bool _rejected;
    private readonly Action<string> _onAck;
    private readonly Action<string, string> _onReject;

    public ReliableMessage(string messageId, T payload, Action<string> onAck, Action<string, string> onReject)
    {
        MessageId = messageId;
        Payload = payload;
        Timestamp = DateTime.UtcNow;
        DeliveryCount = 1;
        _onAck = onAck;
        _onReject = onReject;
    }

    public void Acknowledge()
    {
        if (_acknowledged || _rejected)
            throw new InvalidOperationException("Message already processed");

        _acknowledged = true;
        _onAck(MessageId);
    }

    public void Reject(string reason)
    {
        if (_acknowledged || _rejected)
            throw new InvalidOperationException("Message already processed");

        _rejected = true;
        _onReject(MessageId, reason);
    }
}

/// <summary>
/// Priority levels for message ordering
/// </summary>
public enum Priority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3
}

/// <summary>
/// Message with priority support
/// </summary>
public class PriorityMessage<T>
{
    public string MessageId { get; set; }
    public T Payload { get; set; }
    public Priority Priority { get; set; }
    public DateTime Timestamp { get; set; }

    public PriorityMessage(string messageId, T payload, Priority priority)
    {
        MessageId = messageId;
        Payload = payload;
        Priority = priority;
        Timestamp = DateTime.UtcNow;
    }
}

/// <summary>
/// Message with timeout and retry support
/// </summary>
public class TimeoutMessage<T>
{
    public string MessageId { get; }
    public T Payload { get; }
    public int RetryCount { get; internal set; }
    public DateTime FirstAttempt { get; }
    public DateTime LastAttempt { get; internal set; }

    private readonly Action<string> _onComplete;
    private bool _completed;

    public TimeoutMessage(string messageId, T payload, Action<string> onComplete)
    {
        MessageId = messageId;
        Payload = payload;
        FirstAttempt = DateTime.UtcNow;
        LastAttempt = DateTime.UtcNow;
        _onComplete = onComplete;
    }

    public void Complete()
    {
        if (_completed)
            throw new InvalidOperationException("Message already completed");

        _completed = true;
        _onComplete(MessageId);
    }
}

/// <summary>
/// Transaction support for message processing
/// </summary>
public class Transaction : IDisposable
{
    private readonly Action _onCommit;
    private readonly Action _onRollback;
    private bool _committed;
    private bool _rolledBack;
    private bool _disposed;

    public Transaction(Action onCommit, Action onRollback)
    {
        _onCommit = onCommit;
        _onRollback = onRollback;
    }

    public void Commit()
    {
        if (_committed || _rolledBack)
            throw new InvalidOperationException("Transaction already completed");

        _committed = true;
        _onCommit();
    }

    public void Rollback()
    {
        if (_committed || _rolledBack)
            throw new InvalidOperationException("Transaction already completed");

        _rolledBack = true;
        _onRollback();
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;

        if (!_committed && !_rolledBack)
        {
            _onRollback();
        }
    }
}

/// <summary>
/// Transactional message wrapper
/// </summary>
public class TransactionalMessage<T>
{
    public string MessageId { get; }
    public T Payload { get; }
    private readonly Func<Transaction> _transactionFactory;

    public TransactionalMessage(string messageId, T payload, Func<Transaction> transactionFactory)
    {
        MessageId = messageId;
        Payload = payload;
        _transactionFactory = transactionFactory;
    }

    public Transaction BeginTransaction()
    {
        return _transactionFactory();
    }
}

// ============================================================================
// Channel Implementations
// ============================================================================

/// <summary>
/// Basic Point-to-Point Channel using System.Threading.Channels for thread-safety
/// </summary>
public class PointToPointChannel<T>
{
    private readonly Channel<Message<T>> _channel;
    private readonly string _channelName;
    private bool _closed;

    public PointToPointChannel(string channelName, int capacity = 100)
    {
        _channelName = channelName;
        _channel = Channel.CreateUnbounded<Message<T>>(new UnboundedChannelOptions
        {
            SingleReader = false,
            SingleWriter = false
        });
    }

    public async Task SendAsync(Message<T> message)
    {
        if (_closed)
            throw new InvalidOperationException("Channel is closed");

        await _channel.Writer.WriteAsync(message);
    }

    public async Task<Message<T>> ReceiveAsync()
    {
        try
        {
            return await _channel.Reader.ReadAsync();
        }
        catch (ChannelClosedException)
        {
            return null;
        }
    }

    public void Close()
    {
        _closed = true;
        _channel.Writer.Complete();
    }
}

/// <summary>
/// Load balancing channel that distributes work to registered workers
/// </summary>
public class LoadBalancingChannel<T>
{
    private readonly ConcurrentQueue<T> _messageQueue;
    private readonly Dictionary<string, Func<T, Task<bool>>> _workers;
    private readonly SemaphoreSlim _signal;
    private int _currentWorkerIndex;
    private readonly object _lock = new object();
    private bool _shutdown;

    public LoadBalancingChannel()
    {
        _messageQueue = new ConcurrentQueue<T>();
        _workers = new Dictionary<string, Func<T, Task<bool>>>();
        _signal = new SemaphoreSlim(0);
    }

    public void RegisterWorker(string workerId, Func<T, Task<bool>> handler)
    {
        lock (_lock)
        {
            _workers[workerId] = handler;
        }

        Task.Run(async () => await WorkerLoop(workerId, handler));
    }

    private async Task WorkerLoop(string workerId, Func<T, Task<bool>> handler)
    {
        while (!_shutdown)
        {
            await _signal.WaitAsync();

            if (_messageQueue.TryDequeue(out T message))
            {
                await handler(message);
            }
        }
    }

    public async Task SendAsync(T message)
    {
        _messageQueue.Enqueue(message);
        _signal.Release();
        await Task.CompletedTask;
    }

    public async Task ShutdownAsync()
    {
        _shutdown = true;

        // Release all waiting workers
        for (int i = 0; i < _workers.Count * 10; i++)
        {
            _signal.Release();
        }

        await Task.Delay(100);
    }
}

/// <summary>
/// Reliable channel with acknowledgment support
/// </summary>
public class ReliablePointToPointChannel<T>
{
    private readonly Channel<ReliableMessage<T>> _channel;
    private readonly ConcurrentDictionary<string, ReliableMessage<T>> _unacknowledged;
    private bool _closed;

    public ReliablePointToPointChannel()
    {
        _channel = Channel.CreateUnbounded<ReliableMessage<T>>();
        _unacknowledged = new ConcurrentDictionary<string, ReliableMessage<T>>();
    }

    public async Task SendAsync(T payload)
    {
        if (_closed)
            throw new InvalidOperationException("Channel is closed");

        string messageId = Guid.NewGuid().ToString();
        ReliableMessage<T> message = new ReliableMessage<T>(
            messageId,
            payload,
            OnAcknowledge,
            OnReject
        );

        _unacknowledged[messageId] = message;
        await _channel.Writer.WriteAsync(message);
    }

    private void OnAcknowledge(string messageId)
    {
        _unacknowledged.TryRemove(messageId, out _);
    }

    private void OnReject(string messageId, string reason)
    {
        if (_unacknowledged.TryRemove(messageId, out ReliableMessage<T> message))
        {
            // Could implement dead letter queue here
            Console.WriteLine($"Message {messageId} rejected: {reason}");
        }
    }

    public async Task<ReliableMessage<T>> ReceiveAsync()
    {
        try
        {
            return await _channel.Reader.ReadAsync();
        }
        catch (ChannelClosedException)
        {
            return null;
        }
    }

    public void Close()
    {
        _closed = true;
        _channel.Writer.Complete();
    }

    public int GetUnacknowledgedCount()
    {
        return _unacknowledged.Count;
    }
}

/// <summary>
/// Priority-based channel that processes high-priority messages first
/// </summary>
public class PriorityPointToPointChannel<T>
{
    private readonly ConcurrentDictionary<Priority, ConcurrentQueue<PriorityMessage<T>>> _queues;
    private readonly SemaphoreSlim _signal;
    private readonly Channel<PriorityMessage<T>> _outputChannel;
    private bool _closed;

    public PriorityPointToPointChannel()
    {
        _queues = new ConcurrentDictionary<Priority, ConcurrentQueue<PriorityMessage<T>>>();
        foreach (Priority priority in Enum.GetValues<Priority>())
        {
            _queues[priority] = new ConcurrentQueue<PriorityMessage<T>>();
        }

        _signal = new SemaphoreSlim(0);
        _outputChannel = Channel.CreateUnbounded<PriorityMessage<T>>();

        Task.Run(ProcessMessages);
    }

    private async Task ProcessMessages()
    {
        while (!_closed || _signal.CurrentCount > 0)
        {
            await _signal.WaitAsync();

            // Check queues from highest to lowest priority
            foreach (Priority priority in Enum.GetValues<Priority>().Cast<Priority>().OrderByDescending(p => p))
            {
                if (_queues[priority].TryDequeue(out PriorityMessage<T> message))
                {
                    await _outputChannel.Writer.WriteAsync(message);
                    break;
                }
            }
        }

        _outputChannel.Writer.Complete();
    }

    public async Task SendAsync(T payload, Priority priority)
    {
        if (_closed)
            throw new InvalidOperationException("Channel is closed");

        PriorityMessage<T> message = new PriorityMessage<T>(
            Guid.NewGuid().ToString(),
            payload,
            priority
        );

        _queues[priority].Enqueue(message);
        _signal.Release();
        await Task.CompletedTask;
    }

    public async Task<PriorityMessage<T>> ReceiveAsync()
    {
        try
        {
            return await _outputChannel.Reader.ReadAsync();
        }
        catch (ChannelClosedException)
        {
            return null;
        }
    }

    public void Close()
    {
        _closed = true;
        _signal.Release();
    }
}

/// <summary>
/// Channel with timeout and retry support
/// </summary>
public class TimeoutPointToPointChannel<T>
{
    private readonly Channel<TimeoutMessage<T>> _channel;
    private readonly TimeSpan _timeout;
    private readonly int _maxRetries;
    private readonly ConcurrentDictionary<string, TimeoutMessage<T>> _inFlight;
    private bool _closed;

    public TimeoutPointToPointChannel(TimeSpan messageTimeout, int maxRetries)
    {
        _channel = Channel.CreateUnbounded<TimeoutMessage<T>>();
        _timeout = messageTimeout;
        _maxRetries = maxRetries;
        _inFlight = new ConcurrentDictionary<string, TimeoutMessage<T>>();

        Task.Run(MonitorTimeouts);
    }

    private async Task MonitorTimeouts()
    {
        while (!_closed)
        {
            await Task.Delay(50);

            foreach (KeyValuePair<string, TimeoutMessage<T>> kvp in _inFlight)
            {
                TimeoutMessage<T> message = kvp.Value;
                if (DateTime.UtcNow - message.LastAttempt > _timeout)
                {
                    if (message.RetryCount < _maxRetries)
                    {
                        message.RetryCount++;
                        message.LastAttempt = DateTime.UtcNow;
                        await _channel.Writer.WriteAsync(message);
                    }
                    else
                    {
                        _inFlight.TryRemove(kvp.Key, out _);
                        Console.WriteLine($"Message {message.MessageId} exceeded max retries");
                    }
                }
            }
        }
    }

    public async Task SendAsync(T payload)
    {
        if (_closed)
            throw new InvalidOperationException("Channel is closed");

        string messageId = Guid.NewGuid().ToString();
        TimeoutMessage<T> message = new TimeoutMessage<T>(messageId, payload, OnComplete);

        _inFlight[messageId] = message;
        await _channel.Writer.WriteAsync(message);
    }

    private void OnComplete(string messageId)
    {
        _inFlight.TryRemove(messageId, out _);
    }

    public async Task<TimeoutMessage<T>> ReceiveAsync()
    {
        try
        {
            return await _channel.Reader.ReadAsync();
        }
        catch (ChannelClosedException)
        {
            return null;
        }
    }

    public void Close()
    {
        _closed = true;
        _channel.Writer.Complete();
    }
}

/// <summary>
/// Transactional channel with commit/rollback support
/// </summary>
public class TransactionalChannel<T>
{
    private readonly Channel<TransactionalMessage<T>> _channel;
    private readonly ConcurrentDictionary<string, T> _pendingTransactions;
    private bool _closed;

    public TransactionalChannel()
    {
        _channel = Channel.CreateUnbounded<TransactionalMessage<T>>();
        _pendingTransactions = new ConcurrentDictionary<string, T>();
    }

    public async Task SendAsync(T payload)
    {
        if (_closed)
            throw new InvalidOperationException("Channel is closed");

        string messageId = Guid.NewGuid().ToString();
        TransactionalMessage<T> message = new TransactionalMessage<T>(
            messageId,
            payload,
            () => CreateTransaction(messageId, payload)
        );

        await _channel.Writer.WriteAsync(message);
    }

    private Transaction CreateTransaction(string messageId, T payload)
    {
        _pendingTransactions[messageId] = payload;

        return new Transaction(
            onCommit: () => OnCommit(messageId),
            onRollback: () => OnRollback(messageId)
        );
    }

    private void OnCommit(string messageId)
    {
        _pendingTransactions.TryRemove(messageId, out _);
    }

    private void OnRollback(string messageId)
    {
        if (_pendingTransactions.TryRemove(messageId, out T payload))
        {
            // Could requeue or send to dead letter
            Console.WriteLine($"Transaction {messageId} rolled back");
        }
    }

    public async Task<TransactionalMessage<T>> ReceiveAsync()
    {
        try
        {
            return await _channel.Reader.ReadAsync();
        }
        catch (ChannelClosedException)
        {
            return null;
        }
    }

    public void Close()
    {
        _closed = true;
        _channel.Writer.Complete();
    }
}

/// <summary>
/// Bounded channel with capacity management and backpressure
/// </summary>
public class BoundedPointToPointChannel<T>
{
    private readonly Channel<T> _channel;
    private bool _closed;

    public BoundedPointToPointChannel(int capacity)
    {
        _channel = Channel.CreateBounded<T>(new BoundedChannelOptions(capacity)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = false,
            SingleWriter = false
        });
    }

    public async Task<bool> TrySendAsync(T message, TimeSpan timeout)
    {
        if (_closed)
            return false;

        using CancellationTokenSource cts = new CancellationTokenSource(timeout);

        try
        {
            await _channel.Writer.WriteAsync(message, cts.Token);
            return true;
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }

    public async Task<T> ReceiveAsync()
    {
        try
        {
            return await _channel.Reader.ReadAsync();
        }
        catch (ChannelClosedException)
        {
            return default(T);
        }
    }

    public void Close()
    {
        _closed = true;
        _channel.Writer.Complete();
    }

    public int Count => _channel.Reader.Count;
}

// ============================================================================
// Domain Models
// ============================================================================

public class WorkItem
{
    public int Id { get; set; }
    public string Description { get; set; }
}

public class ProcessingTask
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class Order
{
    public string OrderId { get; set; }
    public decimal Amount { get; set; }
}

public class Notification
{
    public string Text { get; set; }
}

public class PaymentRequest
{
    public string PaymentId { get; set; }
    public decimal Amount { get; set; }
}
