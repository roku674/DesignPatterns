using System;
using System.Collections.Generic;
using System.Threading;

namespace Concurrency.LeaderFollowers;

/// <summary>
/// Concrete implementation of LeaderFollowers pattern.
/// Provides efficient concurrency model with thread pool
/// </summary>
public class LeaderFollowersImplementation : ILeaderFollowers
{
    public void Execute()
    {
        Console.WriteLine("LeaderFollowers pattern executing...");
        Console.WriteLine("Demonstrating thread pool with leader/follower roles\n");

        // Create a thread pool with leader/follower pattern
        LeaderFollowersThreadPool threadPool = new LeaderFollowersThreadPool(threadCount: 4);

        // Simulate 10 events being processed
        Console.WriteLine("Submitting 10 events for processing...\n");
        for (int i = 1; i <= 10; i++)
        {
            Event evt = new Event(i, $"Event-{i}");
            threadPool.SubmitEvent(evt);
            Thread.Sleep(100); // Simulate events arriving over time
        }

        // Allow time for all events to be processed
        Thread.Sleep(2000);

        // Shutdown the thread pool
        Console.WriteLine("\nShutting down thread pool...");
        threadPool.Shutdown();

        Console.WriteLine("All events processed. Thread pool shutdown complete.");
    }
}

/// <summary>
/// Represents an event to be processed
/// </summary>
public class Event
{
    public int Id { get; }
    public string Data { get; }
    public DateTime Timestamp { get; }

    public Event(int id, string data)
    {
        Id = id;
        Data = data;
        Timestamp = DateTime.Now;
    }
}

/// <summary>
/// Thread pool implementing the Leader/Followers pattern
/// </summary>
public class LeaderFollowersThreadPool
{
    private readonly object lockObject = new object();
    private readonly Queue<Event> eventQueue = new Queue<Event>();
    private readonly List<Thread> threads = new List<Thread>();
    private Thread? currentLeader = null;
    private bool isShutdown = false;
    private readonly int threadCount;

    public LeaderFollowersThreadPool(int threadCount)
    {
        this.threadCount = threadCount;
        InitializeThreadPool();
    }

    /// <summary>
    /// Initialize the thread pool with follower threads
    /// </summary>
    private void InitializeThreadPool()
    {
        Console.WriteLine($"Initializing thread pool with {threadCount} threads...");

        for (int i = 0; i < threadCount; i++)
        {
            Thread thread = new Thread(ThreadWorker);
            thread.Name = $"Worker-{i + 1}";
            threads.Add(thread);
            thread.Start();
        }

        Console.WriteLine("Thread pool initialized.\n");
    }

    /// <summary>
    /// Submit an event to be processed by the leader
    /// </summary>
    public void SubmitEvent(Event evt)
    {
        lock (lockObject)
        {
            eventQueue.Enqueue(evt);
            Console.WriteLine($"[EventQueue] Event {evt.Id} queued. Queue size: {eventQueue.Count}");

            // Notify waiting followers that an event is available
            Monitor.Pulse(lockObject);
        }
    }

    /// <summary>
    /// Worker thread function implementing leader/follower pattern
    /// </summary>
    private void ThreadWorker()
    {
        string? threadName = Thread.CurrentThread.Name;

        while (true)
        {
            Event? eventToProcess = null;

            lock (lockObject)
            {
                // Wait while not the leader and no shutdown
                while (currentLeader != null && currentLeader != Thread.CurrentThread && !isShutdown)
                {
                    Console.WriteLine($"[{threadName}] Waiting as FOLLOWER...");
                    Monitor.Wait(lockObject);
                }

                // Check for shutdown
                if (isShutdown)
                {
                    Console.WriteLine($"[{threadName}] Received shutdown signal. Exiting.");
                    break;
                }

                // Become the leader if no current leader
                if (currentLeader == null)
                {
                    currentLeader = Thread.CurrentThread;
                    Console.WriteLine($"[{threadName}] Promoted to LEADER");
                }

                // As leader, wait for events
                while (eventQueue.Count == 0 && !isShutdown)
                {
                    Console.WriteLine($"[{threadName}] LEADER waiting for events...");
                    Monitor.Wait(lockObject);
                }

                // Check for shutdown again
                if (isShutdown)
                {
                    Console.WriteLine($"[{threadName}] Received shutdown signal. Exiting.");
                    currentLeader = null;
                    Monitor.PulseAll(lockObject); // Wake up other threads
                    break;
                }

                // Dequeue event and promote next follower
                if (eventQueue.Count > 0)
                {
                    eventToProcess = eventQueue.Dequeue();
                    Console.WriteLine($"[{threadName}] LEADER dequeued Event {eventToProcess.Id}. Queue size: {eventQueue.Count}");

                    // Promote a follower to become the new leader
                    currentLeader = null;
                    Monitor.Pulse(lockObject); // Wake up one follower to become leader
                }
            }

            // Process event outside the lock (as a processing thread, no longer leader)
            if (eventToProcess != null)
            {
                ProcessEvent(eventToProcess);
            }
        }
    }

    /// <summary>
    /// Process an event (simulated work)
    /// </summary>
    private void ProcessEvent(Event evt)
    {
        string? threadName = Thread.CurrentThread.Name;
        Console.WriteLine($"[{threadName}] Processing Event {evt.Id}: {evt.Data}");

        // Simulate processing time
        Thread.Sleep(300);

        Console.WriteLine($"[{threadName}] Completed Event {evt.Id}");
    }

    /// <summary>
    /// Shutdown the thread pool gracefully
    /// </summary>
    public void Shutdown()
    {
        lock (lockObject)
        {
            isShutdown = true;
            Monitor.PulseAll(lockObject); // Wake up all waiting threads
        }

        // Wait for all threads to complete
        foreach (Thread thread in threads)
        {
            thread.Join();
        }
    }
}
