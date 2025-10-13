using System;
using System.Threading;
using System.Collections.Generic;

namespace Concurrency.ThreadSafeInterface;

/// <summary>
/// Concrete implementation of ThreadSafeInterface pattern.
/// Minimizes locking overhead by using ReaderWriterLockSlim
/// to allow multiple concurrent readers and exclusive writer access.
/// </summary>
public class ThreadSafeInterfaceImplementation : IThreadSafeInterface
{
    private readonly ReaderWriterLockSlim _lock;
    private readonly Dictionary<string, string> _data;

    public ThreadSafeInterfaceImplementation()
    {
        _lock = new ReaderWriterLockSlim(LockRecursionPolicy.NoRecursion);
        _data = new Dictionary<string, string>();
    }

    public void Execute()
    {
        Console.WriteLine("ThreadSafeInterface pattern executing...");
        Console.WriteLine("Demonstrating thread-safe read/write operations with ReaderWriterLockSlim");
        Console.WriteLine();

        // Initialize some test data
        WriteData("key1", "Initial Value 1");
        WriteData("key2", "Initial Value 2");
        WriteData("key3", "Initial Value 3");

        Console.WriteLine("\nStarting concurrent operations...\n");

        // Create multiple reader threads
        List<Thread> readerThreads = new List<Thread>();
        for (int i = 0; i < 3; i++)
        {
            int threadId = i;
            Thread readerThread = new Thread(() => PerformMultipleReads(threadId));
            readerThreads.Add(readerThread);
            readerThread.Start();
        }

        // Create writer threads
        List<Thread> writerThreads = new List<Thread>();
        for (int i = 0; i < 2; i++)
        {
            int threadId = i;
            Thread writerThread = new Thread(() => PerformWrites(threadId));
            writerThreads.Add(writerThread);
            writerThread.Start();
        }

        // Wait for all threads to complete
        foreach (Thread thread in readerThreads)
        {
            thread.Join();
        }
        foreach (Thread thread in writerThreads)
        {
            thread.Join();
        }

        Console.WriteLine("\nAll operations completed.");
        Console.WriteLine("Final data state:");
        ReadAllData();
    }

    /// <summary>
    /// Reads data with read lock - allows multiple concurrent readers
    /// </summary>
    private string ReadData(string key)
    {
        _lock.EnterReadLock();
        try
        {
            if (_data.ContainsKey(key))
            {
                string value = _data[key];
                Console.WriteLine($"[Reader {Thread.CurrentThread.ManagedThreadId}] Read '{key}' = '{value}'");
                return value;
            }
            else
            {
                Console.WriteLine($"[Reader {Thread.CurrentThread.ManagedThreadId}] Key '{key}' not found");
                return null;
            }
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    /// <summary>
    /// Writes data with write lock - exclusive access required
    /// </summary>
    private void WriteData(string key, string value)
    {
        _lock.EnterWriteLock();
        try
        {
            _data[key] = value;
            Console.WriteLine($"[Writer {Thread.CurrentThread.ManagedThreadId}] Wrote '{key}' = '{value}'");
            Thread.Sleep(50); // Simulate some work
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    /// <summary>
    /// Demonstrates upgradeable read lock - can be upgraded to write lock
    /// </summary>
    private void ReadAndConditionallyWrite(string key, string newValue, string expectedValue)
    {
        _lock.EnterUpgradeableReadLock();
        try
        {
            if (_data.ContainsKey(key) && _data[key] == expectedValue)
            {
                Console.WriteLine($"[Upgradeable {Thread.CurrentThread.ManagedThreadId}] Found expected value, upgrading to write lock");

                _lock.EnterWriteLock();
                try
                {
                    _data[key] = newValue;
                    Console.WriteLine($"[Upgradeable {Thread.CurrentThread.ManagedThreadId}] Updated '{key}' to '{newValue}'");
                }
                finally
                {
                    _lock.ExitWriteLock();
                }
            }
            else
            {
                Console.WriteLine($"[Upgradeable {Thread.CurrentThread.ManagedThreadId}] Condition not met for '{key}'");
            }
        }
        finally
        {
            _lock.ExitUpgradeableReadLock();
        }
    }

    /// <summary>
    /// Performs multiple read operations to demonstrate concurrent reader access
    /// </summary>
    private void PerformMultipleReads(int threadId)
    {
        for (int i = 0; i < 3; i++)
        {
            ReadData($"key{(i % 3) + 1}");
            Thread.Sleep(100);
        }
    }

    /// <summary>
    /// Performs write operations to demonstrate exclusive writer access
    /// </summary>
    private void PerformWrites(int threadId)
    {
        for (int i = 0; i < 2; i++)
        {
            WriteData($"key{threadId + 1}", $"Updated Value {threadId}-{i}");
            Thread.Sleep(150);
        }
    }

    /// <summary>
    /// Reads all data with appropriate locking
    /// </summary>
    private void ReadAllData()
    {
        _lock.EnterReadLock();
        try
        {
            foreach (KeyValuePair<string, string> entry in _data)
            {
                Console.WriteLine($"  {entry.Key}: {entry.Value}");
            }
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }
}
