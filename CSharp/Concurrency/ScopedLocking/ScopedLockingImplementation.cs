using System;
using System.Threading;

namespace Concurrency.ScopedLocking;

/// <summary>
/// Concrete implementation of ScopedLocking pattern.
/// Ensures lock automatically released when control leaves scope
/// </summary>
public class ScopedLockingImplementation : IScopedLocking
{
    private readonly object _lockObject = new object();
    private int _sharedResource = 0;

    public void Execute()
    {
        Console.WriteLine("ScopedLocking pattern executing...");
        Console.WriteLine("Demonstrating RAII-style lock management with IDisposable\n");

        // Simulate multiple threads accessing shared resource
        Thread thread1 = new Thread(() => ModifyResourceWithScopedLock("Thread 1"));
        Thread thread2 = new Thread(() => ModifyResourceWithScopedLock("Thread 2"));
        Thread thread3 = new Thread(() => ModifyResourceWithScopedLock("Thread 3"));

        thread1.Start();
        thread2.Start();
        thread3.Start();

        thread1.Join();
        thread2.Join();
        thread3.Join();

        Console.WriteLine($"\nFinal shared resource value: {_sharedResource}");
        Console.WriteLine("\nAll locks were automatically released when scope ended");
    }

    private void ModifyResourceWithScopedLock(string threadName)
    {
        Console.WriteLine($"{threadName} attempting to acquire lock...");

        // Using statement ensures lock is released automatically
        // even if exception occurs
        using (ScopedLock scopedLock = new ScopedLock(_lockObject))
        {
            Console.WriteLine($"{threadName} acquired lock");

            // Critical section - modify shared resource
            int currentValue = _sharedResource;
            Thread.Sleep(100); // Simulate work
            _sharedResource = currentValue + 1;

            Console.WriteLine($"{threadName} incremented resource to {_sharedResource}");

            // Lock will be automatically released when using block ends
        }

        Console.WriteLine($"{threadName} lock automatically released");
    }
}

/// <summary>
/// ScopedLock class implementing IDisposable for RAII-style resource management.
/// Lock is acquired in constructor and released in Dispose.
/// </summary>
public class ScopedLock : IDisposable
{
    private readonly object _lockObject;
    private bool _isLockAcquired;
    private bool _disposed;

    /// <summary>
    /// Constructor acquires the lock immediately.
    /// </summary>
    /// <param name="lockObject">The object to lock on</param>
    public ScopedLock(object lockObject)
    {
        if (lockObject == null)
        {
            throw new ArgumentNullException(nameof(lockObject));
        }

        _lockObject = lockObject;
        _isLockAcquired = false;
        _disposed = false;

        // Acquire lock in constructor
        Monitor.Enter(_lockObject, ref _isLockAcquired);
    }

    /// <summary>
    /// Dispose releases the lock automatically.
    /// Called automatically when using statement ends.
    /// </summary>
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Protected dispose pattern implementation.
    /// </summary>
    /// <param name="disposing">True if called from Dispose, false if from finalizer</param>
    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                // Release lock if it was acquired
                if (_isLockAcquired)
                {
                    Monitor.Exit(_lockObject);
                    _isLockAcquired = false;
                }
            }

            _disposed = true;
        }
    }

    /// <summary>
    /// Finalizer ensures lock is released even if Dispose is not called.
    /// </summary>
    ~ScopedLock()
    {
        Dispose(false);
    }
}
