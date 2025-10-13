using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Concurrency.Proactor;

/// <summary>
/// Represents a completion handler callback
/// </summary>
/// <param name="result">The result of the async operation</param>
public delegate void CompletionHandler(object result);

/// <summary>
/// Represents an asynchronous operation
/// </summary>
public class AsyncOperation
{
    public string OperationId { get; set; }
    public Task<object> OperationTask { get; set; }
    public CompletionHandler Handler { get; set; }

    public AsyncOperation(string operationId, Task<object> operationTask, CompletionHandler handler)
    {
        OperationId = operationId;
        OperationTask = operationTask;
        Handler = handler;
    }
}

/// <summary>
/// Completion event that is queued when an async operation completes
/// </summary>
public class CompletionEvent
{
    public string OperationId { get; set; }
    public object Result { get; set; }
    public CompletionHandler Handler { get; set; }
    public DateTime CompletedAt { get; set; }

    public CompletionEvent(string operationId, object result, CompletionHandler handler)
    {
        OperationId = operationId;
        Result = result;
        Handler = handler;
        CompletedAt = DateTime.Now;
    }
}

/// <summary>
/// Proactor - manages async operations and dispatches completion events
/// </summary>
public class Proactor
{
    private readonly ConcurrentQueue<CompletionEvent> _completionQueue;
    private readonly List<AsyncOperation> _pendingOperations;
    private readonly object _lock = new object();
    private bool _isRunning;

    public Proactor()
    {
        _completionQueue = new ConcurrentQueue<CompletionEvent>();
        _pendingOperations = new List<AsyncOperation>();
        _isRunning = false;
    }

    /// <summary>
    /// Initiates an asynchronous operation
    /// </summary>
    public void InitiateAsyncOperation(string operationId, Task<object> operation, CompletionHandler handler)
    {
        AsyncOperation asyncOp = new AsyncOperation(operationId, operation, handler);

        lock (_lock)
        {
            _pendingOperations.Add(asyncOp);
        }

        // Set up continuation to queue completion event when operation finishes
        asyncOp.OperationTask.ContinueWith(task =>
        {
            object result = task.IsCompletedSuccessfully ? task.Result : task.Exception;
            CompletionEvent completionEvent = new CompletionEvent(operationId, result, handler);
            _completionQueue.Enqueue(completionEvent);

            lock (_lock)
            {
                _pendingOperations.Remove(asyncOp);
            }
        });

        Console.WriteLine($"[Proactor] Initiated async operation: {operationId}");
    }

    /// <summary>
    /// Event loop that processes completion events
    /// </summary>
    public async Task RunEventLoopAsync(CancellationToken cancellationToken)
    {
        _isRunning = true;
        Console.WriteLine("[Proactor] Event loop started");

        while (_isRunning && !cancellationToken.IsCancellationRequested)
        {
            if (_completionQueue.TryDequeue(out CompletionEvent completionEvent))
            {
                Console.WriteLine($"[Proactor] Processing completion event: {completionEvent.OperationId}");

                // Dispatch to completion handler
                try
                {
                    completionEvent.Handler?.Invoke(completionEvent.Result);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Proactor] Error in completion handler: {ex.Message}");
                }
            }
            else
            {
                // No events to process, wait a bit
                await Task.Delay(50, cancellationToken);
            }

            // Check if we should stop (no pending operations and queue is empty)
            lock (_lock)
            {
                if (_pendingOperations.Count == 0 && _completionQueue.IsEmpty)
                {
                    await Task.Delay(100, cancellationToken); // Wait a bit more to see if new operations arrive

                    if (_pendingOperations.Count == 0 && _completionQueue.IsEmpty)
                    {
                        _isRunning = false;
                    }
                }
            }
        }

        Console.WriteLine("[Proactor] Event loop stopped");
    }

    /// <summary>
    /// Stops the event loop
    /// </summary>
    public void Stop()
    {
        _isRunning = false;
    }

    public int GetPendingOperationCount()
    {
        lock (_lock)
        {
            return _pendingOperations.Count;
        }
    }
}

/// <summary>
/// Simulates async I/O operations
/// </summary>
public class AsyncIOSimulator
{
    /// <summary>
    /// Simulates reading a file asynchronously
    /// </summary>
    public static async Task<object> ReadFileAsync(string filename, int delayMs)
    {
        await Task.Delay(delayMs); // Simulate I/O delay
        string content = $"Content of {filename} (simulated)";
        return content;
    }

    /// <summary>
    /// Simulates writing to a file asynchronously
    /// </summary>
    public static async Task<object> WriteFileAsync(string filename, string content, int delayMs)
    {
        await Task.Delay(delayMs); // Simulate I/O delay
        return $"Successfully wrote to {filename}: {content.Length} bytes";
    }

    /// <summary>
    /// Simulates a network request asynchronously
    /// </summary>
    public static async Task<object> FetchDataAsync(string url, int delayMs)
    {
        await Task.Delay(delayMs); // Simulate network delay
        return $"Data fetched from {url} (simulated)";
    }

    /// <summary>
    /// Simulates a database query asynchronously
    /// </summary>
    public static async Task<object> QueryDatabaseAsync(string query, int delayMs)
    {
        await Task.Delay(delayMs); // Simulate query execution
        return $"Query result for: {query} (simulated)";
    }
}

/// <summary>
/// Concrete implementation of Proactor pattern.
/// Demultiplexes and dispatches event handlers asynchronously
/// </summary>
public class ProactorImplementation : IProactor
{
    public void Execute()
    {
        Console.WriteLine("Proactor pattern executing...");
        Console.WriteLine("Demonstrating asynchronous event-driven architecture\n");

        // Create the proactor
        Proactor proactor = new Proactor();

        // Create cancellation token source for the event loop
        CancellationTokenSource cts = new CancellationTokenSource();

        // Start the event loop in a separate task
        Task eventLoopTask = Task.Run(() => proactor.RunEventLoopAsync(cts.Token));

        Console.WriteLine("=== Initiating Multiple Async I/O Operations ===\n");

        // 1. Initiate async file read operation
        Task<object> readTask = AsyncIOSimulator.ReadFileAsync("document.txt", 800);
        proactor.InitiateAsyncOperation(
            "READ_FILE_1",
            readTask,
            result =>
            {
                Console.WriteLine($"[Handler] File read completed: {result}");
            }
        );

        // 2. Initiate async file write operation
        Task<object> writeTask = AsyncIOSimulator.WriteFileAsync("output.txt", "Hello, Proactor!", 600);
        proactor.InitiateAsyncOperation(
            "WRITE_FILE_1",
            writeTask,
            result =>
            {
                Console.WriteLine($"[Handler] File write completed: {result}");
            }
        );

        // 3. Initiate async network fetch operation
        Task<object> fetchTask = AsyncIOSimulator.FetchDataAsync("https://api.example.com/data", 1000);
        proactor.InitiateAsyncOperation(
            "FETCH_DATA_1",
            fetchTask,
            result =>
            {
                Console.WriteLine($"[Handler] Network fetch completed: {result}");

                // Chain another operation upon completion
                Task<object> chainedTask = AsyncIOSimulator.WriteFileAsync("fetched_data.txt", result.ToString(), 400);
                proactor.InitiateAsyncOperation(
                    "WRITE_FILE_2",
                    chainedTask,
                    chainedResult =>
                    {
                        Console.WriteLine($"[Handler] Chained write completed: {chainedResult}");
                    }
                );
            }
        );

        // 4. Initiate async database query operation
        Task<object> queryTask = AsyncIOSimulator.QueryDatabaseAsync("SELECT * FROM users WHERE active = true", 700);
        proactor.InitiateAsyncOperation(
            "QUERY_DB_1",
            queryTask,
            result =>
            {
                Console.WriteLine($"[Handler] Database query completed: {result}");
            }
        );

        // 5. Initiate another file read with different timing
        Task<object> readTask2 = AsyncIOSimulator.ReadFileAsync("config.json", 500);
        proactor.InitiateAsyncOperation(
            "READ_FILE_2",
            readTask2,
            result =>
            {
                Console.WriteLine($"[Handler] Config file read completed: {result}");
            }
        );

        Console.WriteLine($"\nPending operations: {proactor.GetPendingOperationCount()}");
        Console.WriteLine("\n=== Proactor Event Loop Processing Completions ===\n");

        // Wait for event loop to complete all operations
        eventLoopTask.Wait();

        Console.WriteLine("\n=== All Operations Completed ===");
        Console.WriteLine("\nKey Concepts Demonstrated:");
        Console.WriteLine("1. Asynchronous operation initiation - operations started without blocking");
        Console.WriteLine("2. Completion handler callbacks - handlers invoked when operations complete");
        Console.WriteLine("3. Proactor event loop - central loop demultiplexes completion events");
        Console.WriteLine("4. Event-driven I/O - completions processed in order they finish, not order initiated");
        Console.WriteLine("5. Operation chaining - new operations initiated from completion handlers");
    }
}
