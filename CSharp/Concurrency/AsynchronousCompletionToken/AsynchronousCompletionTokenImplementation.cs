using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Concurrency.AsynchronousCompletionToken;

/// <summary>
/// Concrete implementation of AsynchronousCompletionToken pattern.
/// Allows efficient demultiplexing of responses
/// </summary>
public class AsynchronousCompletionTokenImplementation : IAsynchronousCompletionToken
{
    public void Execute()
    {
        Console.WriteLine("AsynchronousCompletionToken pattern executing...");
        Console.WriteLine("Demonstrates efficient demultiplexing and dispatching of async completion events.\n");

        // Demonstrate the pattern with multiple async operations
        DemonstrateAsyncCompletionTokens();
    }

    private void DemonstrateAsyncCompletionTokens()
    {
        // Create a completion token manager
        AsyncCompletionTokenManager manager = new AsyncCompletionTokenManager();

        // Start multiple async operations with completion tokens
        Console.WriteLine("Starting multiple async operations with completion tokens...\n");

        CancellationTokenSource cancellationSource = new CancellationTokenSource();

        // Operation 1: Simulate file download
        AsyncCompletionToken<string> downloadToken = new AsyncCompletionToken<string>(
            "FileDownload",
            result => Console.WriteLine($"[Completion Handler] File downloaded: {result}"),
            ex => Console.WriteLine($"[Error Handler] Download failed: {ex.Message}")
        );

        Task<string> downloadTask = manager.ExecuteAsync(
            SimulateFileDownloadAsync("document.pdf", 1000),
            downloadToken,
            cancellationSource.Token
        );

        // Operation 2: Simulate database query
        AsyncCompletionToken<string> dbQueryToken = new AsyncCompletionToken<string>(
            "DatabaseQuery",
            result => Console.WriteLine($"[Completion Handler] Query result: {result}"),
            ex => Console.WriteLine($"[Error Handler] Query failed: {ex.Message}")
        );

        Task<string> dbTask = manager.ExecuteAsync(
            SimulateDatabaseQueryAsync("SELECT * FROM users", 800),
            dbQueryToken,
            cancellationSource.Token
        );

        // Operation 3: Simulate API call
        AsyncCompletionToken<string> apiToken = new AsyncCompletionToken<string>(
            "ApiCall",
            result => Console.WriteLine($"[Completion Handler] API response: {result}"),
            ex => Console.WriteLine($"[Error Handler] API call failed: {ex.Message}")
        );

        Task<string> apiTask = manager.ExecuteAsync(
            SimulateApiCallAsync("https://api.example.com/data", 600),
            apiToken,
            cancellationSource.Token
        );

        // Operation 4: Simulate operation that will be cancelled
        AsyncCompletionToken<string> cancelledToken = new AsyncCompletionToken<string>(
            "CancelledOperation",
            result => Console.WriteLine($"[Completion Handler] Operation completed: {result}"),
            ex => Console.WriteLine($"[Error Handler] Operation cancelled or failed: {ex.Message}")
        );

        Task<string> cancelledTask = manager.ExecuteAsync(
            SimulateSlowOperationAsync("SlowData", 5000),
            cancelledToken,
            cancellationSource.Token
        );

        // Cancel the slow operation after a short delay
        Task.Run(async () =>
        {
            await Task.Delay(500);
            Console.WriteLine("\n[Cancellation] Cancelling slow operation...\n");
            cancellationSource.Cancel();
        });

        // Wait for all operations to complete or be cancelled
        try
        {
            Task.WaitAll(new Task[] { downloadTask, dbTask, apiTask, cancelledTask });
        }
        catch (AggregateException)
        {
            // Expected for cancelled tasks
        }

        Console.WriteLine("\n--- Completion Statistics ---");
        manager.PrintStatistics();
    }

    private async Task<string> SimulateFileDownloadAsync(string fileName, int delayMs)
    {
        await Task.Delay(delayMs);
        return $"{fileName} (1.2 MB)";
    }

    private async Task<string> SimulateDatabaseQueryAsync(string query, int delayMs)
    {
        await Task.Delay(delayMs);
        return $"Retrieved 42 rows";
    }

    private async Task<string> SimulateApiCallAsync(string url, int delayMs)
    {
        await Task.Delay(delayMs);
        return $"{{\"status\": \"success\", \"data_count\": 15}}";
    }

    private async Task<string> SimulateSlowOperationAsync(string data, int delayMs)
    {
        await Task.Delay(delayMs);
        return data;
    }
}

/// <summary>
/// Represents a completion token for an async operation.
/// Contains callbacks for success and error handling.
/// </summary>
public class AsyncCompletionToken<T>
{
    public string OperationId { get; }
    public Action<T> OnSuccess { get; }
    public Action<Exception> OnError { get; }
    public DateTime StartTime { get; }
    public DateTime? CompletionTime { get; private set; }

    public AsyncCompletionToken(
        string operationId,
        Action<T> onSuccess,
        Action<Exception> onError)
    {
        if (string.IsNullOrEmpty(operationId))
        {
            throw new ArgumentException("Operation ID cannot be null or empty", nameof(operationId));
        }

        OperationId = operationId;
        OnSuccess = onSuccess ?? throw new ArgumentNullException(nameof(onSuccess));
        OnError = onError ?? throw new ArgumentNullException(nameof(onError));
        StartTime = DateTime.UtcNow;
    }

    public void MarkCompleted()
    {
        CompletionTime = DateTime.UtcNow;
    }

    public TimeSpan GetDuration()
    {
        if (CompletionTime.HasValue)
        {
            return CompletionTime.Value - StartTime;
        }
        return TimeSpan.Zero;
    }
}

/// <summary>
/// Manages async operations with completion tokens.
/// Handles demultiplexing and dispatching of completion events.
/// </summary>
public class AsyncCompletionTokenManager
{
    private readonly Dictionary<string, object> _activeOperations;
    private int _completedCount;
    private int _failedCount;
    private int _cancelledCount;
    private readonly object _lockObject;

    public AsyncCompletionTokenManager()
    {
        _activeOperations = new Dictionary<string, object>();
        _completedCount = 0;
        _failedCount = 0;
        _cancelledCount = 0;
        _lockObject = new object();
    }

    /// <summary>
    /// Executes an async operation with a completion token.
    /// The completion token's callbacks are invoked when the operation completes.
    /// </summary>
    public async Task<T> ExecuteAsync<T>(
        Task<T> operation,
        AsyncCompletionToken<T> completionToken,
        CancellationToken cancellationToken)
    {
        if (operation == null)
        {
            throw new ArgumentNullException(nameof(operation));
        }

        if (completionToken == null)
        {
            throw new ArgumentNullException(nameof(completionToken));
        }

        // Register the operation
        lock (_lockObject)
        {
            _activeOperations[completionToken.OperationId] = completionToken;
        }

        Console.WriteLine($"[{completionToken.OperationId}] Started at {completionToken.StartTime:HH:mm:ss.fff}");

        try
        {
            // Wait for either the operation to complete or cancellation
            T result = await operation.ConfigureAwait(false);

            // Check if cancelled before invoking success callback
            cancellationToken.ThrowIfCancellationRequested();

            // Mark completion
            completionToken.MarkCompleted();

            // Invoke success callback
            completionToken.OnSuccess(result);

            // Update statistics
            lock (_lockObject)
            {
                _completedCount++;
                _activeOperations.Remove(completionToken.OperationId);
            }

            Console.WriteLine($"[{completionToken.OperationId}] Completed in {completionToken.GetDuration().TotalMilliseconds:F0}ms");

            return result;
        }
        catch (OperationCanceledException ex)
        {
            // Handle cancellation
            completionToken.MarkCompleted();
            completionToken.OnError(ex);

            lock (_lockObject)
            {
                _cancelledCount++;
                _activeOperations.Remove(completionToken.OperationId);
            }

            Console.WriteLine($"[{completionToken.OperationId}] Cancelled after {completionToken.GetDuration().TotalMilliseconds:F0}ms");

            throw;
        }
        catch (Exception ex)
        {
            // Handle errors
            completionToken.MarkCompleted();
            completionToken.OnError(ex);

            lock (_lockObject)
            {
                _failedCount++;
                _activeOperations.Remove(completionToken.OperationId);
            }

            Console.WriteLine($"[{completionToken.OperationId}] Failed after {completionToken.GetDuration().TotalMilliseconds:F0}ms");

            throw;
        }
    }

    public void PrintStatistics()
    {
        lock (_lockObject)
        {
            Console.WriteLine($"Completed: {_completedCount}");
            Console.WriteLine($"Failed: {_failedCount}");
            Console.WriteLine($"Cancelled: {_cancelledCount}");
            Console.WriteLine($"Active: {_activeOperations.Count}");
        }
    }
}
