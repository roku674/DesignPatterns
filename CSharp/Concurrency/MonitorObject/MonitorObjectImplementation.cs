using System;
using System.Threading;

namespace Concurrency.MonitorObject;

/// <summary>
/// Concrete implementation of MonitorObject pattern.
/// Synchronizes concurrent method execution
/// </summary>
public class MonitorObjectImplementation : IMonitorObject
{
    public void Execute()
    {
        Console.WriteLine("MonitorObject pattern executing...");
        Console.WriteLine("Demonstrating thread synchronization with Monitor locks and condition variables\n");

        // Create a shared resource that multiple threads will access
        SharedResource sharedResource = new SharedResource();

        // Create multiple threads to demonstrate concurrent access
        Thread producerThread1 = new Thread(() => ProducerThread(sharedResource, "Producer-1"));
        Thread producerThread2 = new Thread(() => ProducerThread(sharedResource, "Producer-2"));
        Thread consumerThread1 = new Thread(() => ConsumerThread(sharedResource, "Consumer-1"));
        Thread consumerThread2 = new Thread(() => ConsumerThread(sharedResource, "Consumer-2"));

        // Start all threads
        consumerThread1.Start();
        consumerThread2.Start();
        Thread.Sleep(100); // Let consumers start waiting first
        producerThread1.Start();
        producerThread2.Start();

        // Wait for all threads to complete
        producerThread1.Join();
        producerThread2.Join();
        consumerThread1.Join();
        consumerThread2.Join();

        Console.WriteLine("\nAll threads completed successfully");
        Console.WriteLine($"Final queue count: {sharedResource.Count}");
    }

    private void ProducerThread(SharedResource resource, string threadName)
    {
        for (int i = 1; i <= 3; i++)
        {
            string item = $"{threadName}-Item{i}";
            resource.Produce(item);
            Thread.Sleep(200); // Simulate work
        }
    }

    private void ConsumerThread(SharedResource resource, string threadName)
    {
        for (int i = 1; i <= 3; i++)
        {
            string item = resource.Consume(threadName);
            Thread.Sleep(300); // Simulate processing
        }
    }
}

/// <summary>
/// Shared resource protected by Monitor Object pattern.
/// Uses lock keyword and Monitor.Wait/Pulse for synchronization.
/// </summary>
public class SharedResource
{
    private readonly object _lockObject = new object();
    private readonly System.Collections.Generic.Queue<string> _queue = new System.Collections.Generic.Queue<string>();
    private const int MaxCapacity = 5;

    public int Count
    {
        get
        {
            lock (_lockObject)
            {
                return _queue.Count;
            }
        }
    }

    /// <summary>
    /// Produces an item and adds it to the queue.
    /// Uses Monitor lock and Pulse to notify waiting consumers.
    /// </summary>
    public void Produce(string item)
    {
        lock (_lockObject)
        {
            // Wait while queue is full (condition variable pattern)
            while (_queue.Count >= MaxCapacity)
            {
                Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Queue full, producer waiting...");
                Monitor.Wait(_lockObject);
            }

            _queue.Enqueue(item);
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] Produced: {item} (Queue size: {_queue.Count})");

            // Notify waiting consumers that item is available
            Monitor.Pulse(_lockObject);
        }
    }

    /// <summary>
    /// Consumes an item from the queue.
    /// Uses Monitor lock and Wait/Pulse for synchronization.
    /// </summary>
    public string Consume(string consumerName)
    {
        lock (_lockObject)
        {
            // Wait while queue is empty (condition variable pattern)
            while (_queue.Count == 0)
            {
                Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] {consumerName}: Queue empty, waiting...");
                Monitor.Wait(_lockObject);
            }

            string item = _queue.Dequeue();
            Console.WriteLine($"[{Thread.CurrentThread.ManagedThreadId}] {consumerName}: Consumed: {item} (Queue size: {_queue.Count})");

            // Notify waiting producers that space is available
            Monitor.Pulse(_lockObject);

            return item;
        }
    }
}
