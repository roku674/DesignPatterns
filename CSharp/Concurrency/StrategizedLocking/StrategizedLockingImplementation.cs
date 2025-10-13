using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Diagnostics;

namespace Concurrency.StrategizedLocking;

/// <summary>
/// Concrete implementation of StrategizedLocking pattern.
/// Parameterizes synchronization mechanisms
/// </summary>
public class StrategizedLockingImplementation : IStrategizedLocking
{
    public void Execute()
    {
        Console.WriteLine("=== StrategizedLocking Pattern - Parameterized Synchronization Mechanisms ===\n");

        try
        {
            // Test with different lock strategies
            Console.WriteLine("--- Testing Mutex Lock Strategy ---");
            TestLockStrategy(new MutexLockStrategy(), "Mutex Lock");

            Console.WriteLine("\n--- Testing ReaderWriterLock Strategy ---");
            TestLockStrategy(new ReaderWriterLockStrategy(), "ReaderWriter Lock");

            Console.WriteLine("\n--- Testing SemaphoreLock Strategy ---");
            TestLockStrategy(new SemaphoreLockStrategy(3), "Semaphore Lock (3 concurrent)");

            Console.WriteLine("\n--- Testing NullLock Strategy (No Synchronization) ---");
            TestLockStrategy(new NullLockStrategy(), "Null Lock");

            Console.WriteLine("\n--- Testing MonitorLock Strategy ---");
            TestLockStrategy(new MonitorLockStrategy(), "Monitor Lock");

            Console.WriteLine("\n--- Demonstrating Strategy Selection at Runtime ---");
            DemonstrateRuntimeStrategySelection();

            Console.WriteLine("\n=== Pattern Demonstration Complete ===");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\nERROR: {ex.Message}");
            Console.WriteLine($"Stack Trace: {ex.StackTrace}");
        }
    }

    private void TestLockStrategy(ILockStrategy lockStrategy, string strategyName)
    {
        Console.WriteLine($"\nUsing {strategyName}:");

        SharedResource resource = new SharedResource(lockStrategy);
        int taskCount = 5;
        Task[] tasks = new Task[taskCount];

        Stopwatch stopwatch = Stopwatch.StartNew();

        for (int i = 0; i < taskCount; i++)
        {
            int taskId = i + 1;
            tasks[i] = Task.Run(() =>
            {
                for (int j = 0; j < 3; j++)
                {
                    resource.IncrementCounter(taskId);
                    Thread.Sleep(10);
                }
            });
        }

        Task.WaitAll(tasks);
        stopwatch.Stop();

        Console.WriteLine($"Final counter value: {resource.GetCounter()}");
        Console.WriteLine($"Expected value: {taskCount * 3}");
        Console.WriteLine($"Time taken: {stopwatch.ElapsedMilliseconds}ms");
    }

    private void DemonstrateRuntimeStrategySelection()
    {
        Console.WriteLine("\nSelecting lock strategy based on workload type:");

        // High contention scenario - use Monitor
        Console.WriteLine("\n1. High contention workload -> Monitor Lock:");
        SharedResource highContentionResource = new SharedResource(new MonitorLockStrategy());
        RunWorkload(highContentionResource, 10, 5);

        // Read-heavy scenario - use ReaderWriter
        Console.WriteLine("\n2. Read-heavy workload -> ReaderWriter Lock:");
        SharedResource readHeavyResource = new SharedResource(new ReaderWriterLockStrategy());
        RunReadHeavyWorkload(readHeavyResource);

        // Low contention scenario - use simple lock
        Console.WriteLine("\n3. Low contention workload -> Mutex Lock:");
        SharedResource lowContentionResource = new SharedResource(new MutexLockStrategy());
        RunWorkload(lowContentionResource, 3, 2);

        // Testing/debugging scenario - use null lock
        Console.WriteLine("\n4. Single-threaded testing -> Null Lock:");
        SharedResource testResource = new SharedResource(new NullLockStrategy());
        testResource.IncrementCounter(1);
        testResource.IncrementCounter(1);
        Console.WriteLine($"Test counter: {testResource.GetCounter()}");
    }

    private void RunWorkload(SharedResource resource, int threadCount, int operationsPerThread)
    {
        Task[] tasks = new Task[threadCount];
        Stopwatch stopwatch = Stopwatch.StartNew();

        for (int i = 0; i < threadCount; i++)
        {
            int taskId = i + 1;
            tasks[i] = Task.Run(() =>
            {
                for (int j = 0; j < operationsPerThread; j++)
                {
                    resource.IncrementCounter(taskId);
                }
            });
        }

        Task.WaitAll(tasks);
        stopwatch.Stop();

        Console.WriteLine($"Threads: {threadCount}, Operations per thread: {operationsPerThread}");
        Console.WriteLine($"Final counter: {resource.GetCounter()}, Time: {stopwatch.ElapsedMilliseconds}ms");
    }

    private void RunReadHeavyWorkload(SharedResource resource)
    {
        int readerCount = 8;
        int writerCount = 2;
        List<Task> tasks = new List<Task>();

        Stopwatch stopwatch = Stopwatch.StartNew();

        // Readers
        for (int i = 0; i < readerCount; i++)
        {
            int taskId = i + 1;
            tasks.Add(Task.Run(() =>
            {
                for (int j = 0; j < 5; j++)
                {
                    int value = resource.GetCounter();
                    Console.WriteLine($"  Reader {taskId} read: {value}");
                    Thread.Sleep(5);
                }
            }));
        }

        // Writers
        for (int i = 0; i < writerCount; i++)
        {
            int taskId = i + 1;
            tasks.Add(Task.Run(() =>
            {
                for (int j = 0; j < 2; j++)
                {
                    resource.IncrementCounter(taskId + 100);
                    Thread.Sleep(20);
                }
            }));
        }

        Task.WaitAll(tasks.ToArray());
        stopwatch.Stop();

        Console.WriteLine($"Readers: {readerCount}, Writers: {writerCount}");
        Console.WriteLine($"Final counter: {resource.GetCounter()}, Time: {stopwatch.ElapsedMilliseconds}ms");
    }
}

/// <summary>
/// Strategy interface for different locking mechanisms
/// </summary>
public interface ILockStrategy
{
    void Lock();
    void Unlock();
    string GetStrategyName();
}

/// <summary>
/// Mutex-based locking strategy
/// </summary>
public class MutexLockStrategy : ILockStrategy, IDisposable
{
    private readonly Mutex _mutex;

    public MutexLockStrategy()
    {
        _mutex = new Mutex();
    }

    public void Lock()
    {
        _mutex.WaitOne();
    }

    public void Unlock()
    {
        _mutex.ReleaseMutex();
    }

    public string GetStrategyName()
    {
        return "Mutex Lock";
    }

    public void Dispose()
    {
        _mutex?.Dispose();
    }
}

/// <summary>
/// ReaderWriterLock-based strategy for read-heavy scenarios
/// </summary>
public class ReaderWriterLockStrategy : ILockStrategy
{
    private readonly ReaderWriterLockSlim _rwLock;

    public ReaderWriterLockStrategy()
    {
        _rwLock = new ReaderWriterLockSlim();
    }

    public void Lock()
    {
        _rwLock.EnterWriteLock();
    }

    public void Unlock()
    {
        _rwLock.ExitWriteLock();
    }

    public void EnterReadLock()
    {
        _rwLock.EnterReadLock();
    }

    public void ExitReadLock()
    {
        _rwLock.ExitReadLock();
    }

    public string GetStrategyName()
    {
        return "ReaderWriter Lock";
    }
}

/// <summary>
/// Semaphore-based locking strategy for limited concurrency
/// </summary>
public class SemaphoreLockStrategy : ILockStrategy, IDisposable
{
    private readonly SemaphoreSlim _semaphore;
    private readonly int _maxConcurrency;

    public SemaphoreLockStrategy(int maxConcurrency)
    {
        if (maxConcurrency <= 0)
        {
            throw new ArgumentException("Max concurrency must be greater than 0", nameof(maxConcurrency));
        }

        _maxConcurrency = maxConcurrency;
        _semaphore = new SemaphoreSlim(maxConcurrency, maxConcurrency);
    }

    public void Lock()
    {
        _semaphore.Wait();
    }

    public void Unlock()
    {
        _semaphore.Release();
    }

    public string GetStrategyName()
    {
        return $"Semaphore Lock (max {_maxConcurrency})";
    }

    public void Dispose()
    {
        _semaphore?.Dispose();
    }
}

/// <summary>
/// Monitor-based locking strategy using C# lock statement
/// </summary>
public class MonitorLockStrategy : ILockStrategy
{
    private readonly object _lockObject;

    public MonitorLockStrategy()
    {
        _lockObject = new object();
    }

    public void Lock()
    {
        Monitor.Enter(_lockObject);
    }

    public void Unlock()
    {
        Monitor.Exit(_lockObject);
    }

    public string GetStrategyName()
    {
        return "Monitor Lock";
    }
}

/// <summary>
/// Null object pattern - no synchronization (for single-threaded or testing)
/// </summary>
public class NullLockStrategy : ILockStrategy
{
    public void Lock()
    {
        // No-op
    }

    public void Unlock()
    {
        // No-op
    }

    public string GetStrategyName()
    {
        return "Null Lock (No Synchronization)";
    }
}

/// <summary>
/// Shared resource that uses a lock strategy for synchronization
/// </summary>
public class SharedResource
{
    private readonly ILockStrategy _lockStrategy;
    private int _counter;

    public SharedResource(ILockStrategy lockStrategy)
    {
        _lockStrategy = lockStrategy ?? throw new ArgumentNullException(nameof(lockStrategy));
        _counter = 0;
    }

    public void IncrementCounter(int taskId)
    {
        _lockStrategy.Lock();
        try
        {
            int temp = _counter;
            Thread.Sleep(1); // Simulate some work
            _counter = temp + 1;
            Console.WriteLine($"  Task {taskId} incremented counter to {_counter}");
        }
        finally
        {
            _lockStrategy.Unlock();
        }
    }

    public int GetCounter()
    {
        _lockStrategy.Lock();
        try
        {
            return _counter;
        }
        finally
        {
            _lockStrategy.Unlock();
        }
    }

    public string GetLockStrategyName()
    {
        return _lockStrategy.GetStrategyName();
    }
}
