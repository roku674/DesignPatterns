using System;
using System.Threading;
using System.Threading.Tasks;

namespace Concurrency.ThreadSpecificStorage;

/// <summary>
/// Concrete implementation of ThreadSpecificStorage pattern.
/// Allows multiple threads to use logically global access
/// </summary>
public class ThreadSpecificStorageImplementation : IThreadSpecificStorage
{
    // Thread-local storage for user context
    private readonly ThreadLocal<UserContext> _userContext;

    // Thread-local storage for transaction ID
    private readonly ThreadLocal<int> _transactionId;

    // Thread-local storage for request counter
    private readonly ThreadLocal<int> _requestCounter;

    // Shared counter to generate unique transaction IDs
    private int _globalTransactionCounter;

    public ThreadSpecificStorageImplementation()
    {
        // Initialize thread-local storage with factory methods
        _userContext = new ThreadLocal<UserContext>(() => new UserContext());

        _transactionId = new ThreadLocal<int>(() =>
            Interlocked.Increment(ref _globalTransactionCounter));

        _requestCounter = new ThreadLocal<int>(() => 0);
    }

    public void Execute()
    {
        Console.WriteLine("ThreadSpecificStorage pattern executing...");
        Console.WriteLine("===========================================\n");

        // Demonstrate thread-specific storage with multiple threads
        DemonstrateThreadSpecificStorage();

        Console.WriteLine("\n===========================================");
    }

    /// <summary>
    /// Demonstrates how each thread maintains its own storage
    /// </summary>
    private void DemonstrateThreadSpecificStorage()
    {
        Console.WriteLine("Creating 5 threads, each with their own storage...\n");

        Task[] tasks = new Task[5];

        for (int i = 0; i < 5; i++)
        {
            int threadIndex = i;
            tasks[i] = Task.Run(() => ProcessThread(threadIndex));
        }

        // Wait for all threads to complete
        Task.WaitAll(tasks);

        Console.WriteLine("\nAll threads completed. Each had isolated storage.");

        // Demonstrate accessing storage from main thread
        Console.WriteLine("\n--- Main Thread Storage ---");
        AccessThreadStorage("MainUser");
    }

    /// <summary>
    /// Simulates thread-specific processing with isolated storage
    /// </summary>
    private void ProcessThread(int threadIndex)
    {
        string userName = $"User{threadIndex}";

        // Each thread has its own storage
        AccessThreadStorage(userName);

        // Simulate some work
        Thread.Sleep(100);

        // Access storage again - values are preserved within the same thread
        IncrementRequestCounter();

        Console.WriteLine($"[Thread {Thread.CurrentThread.ManagedThreadId}] " +
                         $"Request count: {GetRequestCount()}");
    }

    /// <summary>
    /// Access thread-specific storage
    /// </summary>
    private void AccessThreadStorage(string userName)
    {
        // Set user context in thread-local storage
        UserContext context = _userContext.Value;
        context.UserName = userName;
        context.LoginTime = DateTime.Now;

        // Get thread-local transaction ID
        int txId = _transactionId.Value;

        Console.WriteLine($"[Thread {Thread.CurrentThread.ManagedThreadId}] " +
                         $"User: {context.UserName}, " +
                         $"Transaction ID: {txId}, " +
                         $"Login Time: {context.LoginTime:HH:mm:ss.fff}");
    }

    /// <summary>
    /// Increment the thread-local request counter
    /// </summary>
    private void IncrementRequestCounter()
    {
        _requestCounter.Value++;
    }

    /// <summary>
    /// Get the current thread's request count
    /// </summary>
    private int GetRequestCount()
    {
        return _requestCounter.Value;
    }
}

/// <summary>
/// User context stored in thread-local storage
/// </summary>
public class UserContext
{
    public string UserName { get; set; } = "Anonymous";
    public DateTime LoginTime { get; set; } = DateTime.Now;
}
