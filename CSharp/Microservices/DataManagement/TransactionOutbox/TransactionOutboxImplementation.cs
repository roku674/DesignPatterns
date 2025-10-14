using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace Microservices.DataManagement.TransactionOutbox;

/// <summary>
/// Implementation of Transaction Outbox pattern.
/// Publishes events reliably by storing them in database transaction, then publishing asynchronously.
/// </summary>
public class TransactionOutboxImplementation : ITransactionOutbox
{
    public void Execute()
    {
        Console.WriteLine("TransactionOutbox pattern executing...");
        Console.WriteLine("Events are stored in outbox table as part of database transaction.");
    }
}

// Outbox Event - Represents an event stored in the outbox
public class OutboxEvent
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string EventType { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public OutboxEventStatus Status { get; set; } = OutboxEventStatus.Pending;
    public int RetryCount { get; set; } = 0;
    public DateTime? ProcessedAt { get; set; }
}

public enum OutboxEventStatus
{
    Pending,
    Published,
    Failed
}

// Outbox Repository - Stores and retrieves outbox events
public class OutboxRepository
{
    private readonly Dictionary<string, OutboxEvent> _outboxEvents = new Dictionary<string, OutboxEvent>();

    public void Save(OutboxEvent outboxEvent)
    {
        _outboxEvents[outboxEvent.Id] = outboxEvent;
        Console.WriteLine($"[Outbox] Event saved: {outboxEvent.EventType} (ID: {outboxEvent.Id})");
    }

    public List<OutboxEvent> GetPendingEvents()
    {
        return _outboxEvents.Values
            .Where(e => e.Status == OutboxEventStatus.Pending)
            .OrderBy(e => e.CreatedAt)
            .ToList();
    }

    public void MarkAsPublished(string eventId)
    {
        if (_outboxEvents.ContainsKey(eventId))
        {
            _outboxEvents[eventId].Status = OutboxEventStatus.Published;
            _outboxEvents[eventId].ProcessedAt = DateTime.UtcNow;
            Console.WriteLine($"[Outbox] Event marked as published: {eventId}");
        }
    }

    public void MarkAsFailed(string eventId)
    {
        if (_outboxEvents.ContainsKey(eventId))
        {
            _outboxEvents[eventId].Status = OutboxEventStatus.Failed;
            _outboxEvents[eventId].RetryCount++;
            Console.WriteLine($"[Outbox] Event marked as failed: {eventId} (Retry: {_outboxEvents[eventId].RetryCount})");
        }
    }

    public Dictionary<string, int> GetStatistics()
    {
        return new Dictionary<string, int>
        {
            { "Total", _outboxEvents.Count },
            { "Pending", _outboxEvents.Values.Count(e => e.Status == OutboxEventStatus.Pending) },
            { "Published", _outboxEvents.Values.Count(e => e.Status == OutboxEventStatus.Published) },
            { "Failed", _outboxEvents.Values.Count(e => e.Status == OutboxEventStatus.Failed) }
        };
    }
}

// Order Service with Outbox - Creates orders and stores events transactionally
public class OrderServiceWithOutbox
{
    private readonly OutboxRepository _outboxRepository;
    private readonly Dictionary<int, OrderData> _orders = new Dictionary<int, OrderData>();
    private int _nextOrderId = 1;

    public OrderServiceWithOutbox(OutboxRepository outboxRepository)
    {
        _outboxRepository = outboxRepository;
    }

    public async Task<OrderData> CreateOrderAsync(int userId, decimal amount)
    {
        Console.WriteLine($"\n[OrderService] Creating order for user {userId}, amount ${amount}");

        // Start database transaction (simulated)
        Console.WriteLine("[OrderService] BEGIN TRANSACTION");

        try
        {
            // 1. Insert order into database
            OrderData order = new OrderData
            {
                Id = _nextOrderId++,
                UserId = userId,
                Amount = amount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            _orders[order.Id] = order;
            Console.WriteLine($"[OrderService] Order {order.Id} inserted into database");

            // 2. Insert event into outbox table (same transaction)
            OutboxEvent outboxEvent = new OutboxEvent
            {
                EventType = "OrderCreated",
                Payload = $"{{OrderId: {order.Id}, UserId: {userId}, Amount: {amount}}}"
            };
            _outboxRepository.Save(outboxEvent);

            // 3. Commit transaction
            Console.WriteLine("[OrderService] COMMIT TRANSACTION");
            Console.WriteLine("[OrderService] Order and outbox event committed atomically");

            await Task.Delay(10); // Simulate async operation
            return order;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[OrderService] ROLLBACK TRANSACTION: {ex.Message}");
            throw;
        }
    }

    public OrderData? GetOrder(int orderId)
    {
        return _orders.ContainsKey(orderId) ? _orders[orderId] : null;
    }
}

public class OrderData
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// Outbox Publisher - Polls outbox and publishes events
public class OutboxPublisher
{
    private readonly OutboxRepository _outboxRepository;
    private readonly IEventBus _eventBus;
    private int _publishedCount = 0;

    public OutboxPublisher(OutboxRepository outboxRepository, IEventBus eventBus)
    {
        _outboxRepository = outboxRepository;
        _eventBus = eventBus;
    }

    public async Task PublishPendingEventsAsync()
    {
        List<OutboxEvent> pendingEvents = _outboxRepository.GetPendingEvents();

        if (pendingEvents.Count == 0)
        {
            Console.WriteLine("[Publisher] No pending events to publish");
            return;
        }

        Console.WriteLine($"\n[Publisher] Publishing {pendingEvents.Count} pending event(s)");

        foreach (OutboxEvent outboxEvent in pendingEvents)
        {
            try
            {
                await _eventBus.PublishAsync(outboxEvent.EventType, outboxEvent.Payload);
                _outboxRepository.MarkAsPublished(outboxEvent.Id);
                _publishedCount++;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Publisher] Failed to publish event {outboxEvent.Id}: {ex.Message}");
                _outboxRepository.MarkAsFailed(outboxEvent.Id);
            }
        }

        Console.WriteLine($"[Publisher] Completed publishing. Total published: {_publishedCount}");
    }

    public int GetPublishedCount()
    {
        return _publishedCount;
    }
}

// Event Bus Interface
public interface IEventBus
{
    Task PublishAsync(string eventType, string payload);
}

// Simple Event Bus Implementation
public class SimpleEventBus : IEventBus
{
    private readonly List<string> _publishedEvents = new List<string>();

    public async Task PublishAsync(string eventType, string payload)
    {
        await Task.Delay(20); // Simulate network call
        _publishedEvents.Add($"{eventType}: {payload}");
        Console.WriteLine($"[EventBus] Published: {eventType}");
    }

    public List<string> GetPublishedEvents()
    {
        return new List<string>(_publishedEvents);
    }
}
