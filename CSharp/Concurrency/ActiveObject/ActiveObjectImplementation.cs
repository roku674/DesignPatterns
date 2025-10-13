using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;

namespace Concurrency.ActiveObject;

/// <summary>
/// Represents a method request that can be executed asynchronously
/// </summary>
public interface IMethodRequest
{
    void Execute();
}

/// <summary>
/// Represents a future result that will be available after asynchronous execution
/// </summary>
public class Future<T>
{
    private readonly TaskCompletionSource<T> _taskCompletionSource;

    public Future()
    {
        _taskCompletionSource = new TaskCompletionSource<T>();
    }

    public void SetResult(T result)
    {
        _taskCompletionSource.SetResult(result);
    }

    public void SetException(Exception exception)
    {
        _taskCompletionSource.SetException(exception);
    }

    public T Get()
    {
        return _taskCompletionSource.Task.Result;
    }

    public async Task<T> GetAsync()
    {
        return await _taskCompletionSource.Task;
    }

    public bool IsCompleted => _taskCompletionSource.Task.IsCompleted;
}

/// <summary>
/// Scheduler that processes method requests from a queue
/// </summary>
public class Scheduler
{
    private readonly BlockingCollection<IMethodRequest> _requestQueue;
    private readonly Thread _workerThread;
    private volatile bool _isRunning;

    public Scheduler()
    {
        _requestQueue = new BlockingCollection<IMethodRequest>();
        _isRunning = true;
        _workerThread = new Thread(Run)
        {
            IsBackground = true,
            Name = "ActiveObject-Scheduler"
        };
        _workerThread.Start();
    }

    public void Enqueue(IMethodRequest request)
    {
        if (_isRunning)
        {
            _requestQueue.Add(request);
        }
    }

    private void Run()
    {
        while (_isRunning)
        {
            try
            {
                IMethodRequest request = _requestQueue.Take();
                request.Execute();
            }
            catch (InvalidOperationException)
            {
                // Queue was completed
                break;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error executing request: {ex.Message}");
            }
        }
    }

    public void Shutdown()
    {
        _isRunning = false;
        _requestQueue.CompleteAdding();
        _workerThread.Join();
    }
}

/// <summary>
/// Concrete implementation of ActiveObject pattern.
/// Decouples method execution from invocation using a request queue and scheduler
/// </summary>
public class ActiveObjectImplementation : IActiveObject
{
    private readonly Scheduler _scheduler;
    private int _counter;

    public ActiveObjectImplementation()
    {
        _scheduler = new Scheduler();
        _counter = 0;
    }

    /// <summary>
    /// Increments the counter asynchronously and returns a future result
    /// </summary>
    public Future<int> IncrementAsync(int value)
    {
        Future<int> future = new Future<int>();

        IMethodRequest request = new IncrementRequest(this, value, future);
        _scheduler.Enqueue(request);

        return future;
    }

    /// <summary>
    /// Gets the current counter value asynchronously and returns a future result
    /// </summary>
    public Future<int> GetValueAsync()
    {
        Future<int> future = new Future<int>();

        IMethodRequest request = new GetValueRequest(this, future);
        _scheduler.Enqueue(request);

        return future;
    }

    /// <summary>
    /// Performs a long-running computation asynchronously
    /// </summary>
    public Future<string> ComputeAsync(string input, int delayMs)
    {
        Future<string> future = new Future<string>();

        IMethodRequest request = new ComputeRequest(input, delayMs, future);
        _scheduler.Enqueue(request);

        return future;
    }

    private void Increment(int value)
    {
        _counter += value;
        Console.WriteLine($"[Thread {Thread.CurrentThread.ManagedThreadId}] Counter incremented by {value}, new value: {_counter}");
    }

    private int GetValue()
    {
        Console.WriteLine($"[Thread {Thread.CurrentThread.ManagedThreadId}] Getting counter value: {_counter}");
        return _counter;
    }

    public void Shutdown()
    {
        _scheduler.Shutdown();
    }

    public void Execute()
    {
        Console.WriteLine("ActiveObject pattern demonstration:");
        Console.WriteLine("Decouples method execution from invocation using:");
        Console.WriteLine("1. Asynchronous method invocation");
        Console.WriteLine("2. Request queue");
        Console.WriteLine("3. Scheduler that processes requests");
        Console.WriteLine("4. Future/Promise results");
        Console.WriteLine("5. Concurrent method calls\n");

        // Demonstrate concurrent operations
        Console.WriteLine($"Main thread: {Thread.CurrentThread.ManagedThreadId}\n");

        // Submit multiple asynchronous increment operations
        Console.WriteLine("Submitting 5 increment operations...");
        Future<int> future1 = IncrementAsync(10);
        Future<int> future2 = IncrementAsync(20);
        Future<int> future3 = IncrementAsync(15);
        Future<int> future4 = IncrementAsync(5);
        Future<int> future5 = IncrementAsync(30);

        // Submit a get value operation
        Console.WriteLine("Submitting get value operation...");
        Future<int> futureGet = GetValueAsync();

        // Submit long-running computations
        Console.WriteLine("Submitting long-running computations...\n");
        Future<string> futureCompute1 = ComputeAsync("Task-A", 100);
        Future<string> futureCompute2 = ComputeAsync("Task-B", 50);

        // Wait for results (this is where the decoupling happens)
        Console.WriteLine("\nWaiting for results...\n");

        string result1 = futureCompute1.Get();
        Console.WriteLine($"Received: {result1}");

        string result2 = futureCompute2.Get();
        Console.WriteLine($"Received: {result2}");

        int finalValue = futureGet.Get();
        Console.WriteLine($"\nFinal counter value: {finalValue}");

        // Demonstrate that we can check completion status
        Console.WriteLine($"All futures completed: {future1.IsCompleted && future2.IsCompleted}");
    }

    /// <summary>
    /// Method request for incrementing the counter
    /// </summary>
    private class IncrementRequest : IMethodRequest
    {
        private readonly ActiveObjectImplementation _activeObject;
        private readonly int _value;
        private readonly Future<int> _future;

        public IncrementRequest(ActiveObjectImplementation activeObject, int value, Future<int> future)
        {
            _activeObject = activeObject;
            _value = value;
            _future = future;
        }

        public void Execute()
        {
            try
            {
                _activeObject.Increment(_value);
                _future.SetResult(_activeObject._counter);
            }
            catch (Exception ex)
            {
                _future.SetException(ex);
            }
        }
    }

    /// <summary>
    /// Method request for getting the counter value
    /// </summary>
    private class GetValueRequest : IMethodRequest
    {
        private readonly ActiveObjectImplementation _activeObject;
        private readonly Future<int> _future;

        public GetValueRequest(ActiveObjectImplementation activeObject, Future<int> future)
        {
            _activeObject = activeObject;
            _future = future;
        }

        public void Execute()
        {
            try
            {
                int value = _activeObject.GetValue();
                _future.SetResult(value);
            }
            catch (Exception ex)
            {
                _future.SetException(ex);
            }
        }
    }

    /// <summary>
    /// Method request for long-running computation
    /// </summary>
    private class ComputeRequest : IMethodRequest
    {
        private readonly string _input;
        private readonly int _delayMs;
        private readonly Future<string> _future;

        public ComputeRequest(string input, int delayMs, Future<string> future)
        {
            _input = input;
            _delayMs = delayMs;
            _future = future;
        }

        public void Execute()
        {
            try
            {
                Console.WriteLine($"[Thread {Thread.CurrentThread.ManagedThreadId}] Processing {_input}...");
                Thread.Sleep(_delayMs); // Simulate work
                string result = $"{_input} completed after {_delayMs}ms";
                _future.SetResult(result);
            }
            catch (Exception ex)
            {
                _future.SetException(ex);
            }
        }
    }
}
