using System;
using System.Collections.Generic;
using System.Threading;

namespace Concurrency.Reactor;

/// <summary>
/// Represents an event that can occur in the system
/// </summary>
public class Event
{
    public string EventType { get; set; }
    public string Data { get; set; }
    public DateTime Timestamp { get; set; }

    public Event(string eventType, string data)
    {
        EventType = eventType;
        Data = data;
        Timestamp = DateTime.Now;
    }
}

/// <summary>
/// Abstract event handler interface
/// </summary>
public interface IEventHandler
{
    string HandlerType { get; }
    void HandleEvent(Event eventData);
}

/// <summary>
/// Concrete event handler for connection events
/// </summary>
public class ConnectionHandler : IEventHandler
{
    public string HandlerType => "CONNECTION";

    public void HandleEvent(Event eventData)
    {
        Console.WriteLine($"[ConnectionHandler] Processing {eventData.EventType} event at {eventData.Timestamp:HH:mm:ss.fff}");
        Console.WriteLine($"[ConnectionHandler] Data: {eventData.Data}");
        // Simulate connection processing
        Thread.Sleep(100);
        Console.WriteLine($"[ConnectionHandler] Connection established successfully");
    }
}

/// <summary>
/// Concrete event handler for data events
/// </summary>
public class DataHandler : IEventHandler
{
    public string HandlerType => "DATA";

    public void HandleEvent(Event eventData)
    {
        Console.WriteLine($"[DataHandler] Processing {eventData.EventType} event at {eventData.Timestamp:HH:mm:ss.fff}");
        Console.WriteLine($"[DataHandler] Data: {eventData.Data}");
        // Simulate data processing
        Thread.Sleep(150);
        Console.WriteLine($"[DataHandler] Data processed successfully");
    }
}

/// <summary>
/// Concrete event handler for timeout events
/// </summary>
public class TimeoutHandler : IEventHandler
{
    public string HandlerType => "TIMEOUT";

    public void HandleEvent(Event eventData)
    {
        Console.WriteLine($"[TimeoutHandler] Processing {eventData.EventType} event at {eventData.Timestamp:HH:mm:ss.fff}");
        Console.WriteLine($"[TimeoutHandler] Data: {eventData.Data}");
        // Simulate timeout processing
        Thread.Sleep(50);
        Console.WriteLine($"[TimeoutHandler] Timeout handled successfully");
    }
}

/// <summary>
/// Event Demultiplexer - waits for events to occur on a set of event sources
/// and returns when it is possible to initiate an operation without blocking
/// </summary>
public class EventDemultiplexer
{
    private readonly Queue<Event> eventQueue;
    private readonly object queueLock;

    public EventDemultiplexer()
    {
        eventQueue = new Queue<Event>();
        queueLock = new object();
    }

    /// <summary>
    /// Register an event to be processed
    /// </summary>
    public void RegisterEvent(Event eventData)
    {
        lock (queueLock)
        {
            eventQueue.Enqueue(eventData);
            Console.WriteLine($"[Demultiplexer] Event registered: {eventData.EventType} (Queue size: {eventQueue.Count})");
        }
    }

    /// <summary>
    /// Wait for and return the next event (blocking call)
    /// </summary>
    public Event WaitForEvent()
    {
        while (true)
        {
            lock (queueLock)
            {
                if (eventQueue.Count > 0)
                {
                    Event nextEvent = eventQueue.Dequeue();
                    Console.WriteLine($"[Demultiplexer] Event dequeued: {nextEvent.EventType} (Queue size: {eventQueue.Count})");
                    return nextEvent;
                }
            }
            // Simulate waiting for events
            Thread.Sleep(10);
        }
    }

    /// <summary>
    /// Check if there are pending events
    /// </summary>
    public bool HasPendingEvents()
    {
        lock (queueLock)
        {
            return eventQueue.Count > 0;
        }
    }

    /// <summary>
    /// Get the number of pending events
    /// </summary>
    public int PendingEventCount()
    {
        lock (queueLock)
        {
            return eventQueue.Count;
        }
    }
}

/// <summary>
/// Dispatcher - manages event handlers and dispatches events to appropriate handlers
/// </summary>
public class EventDispatcher
{
    private readonly Dictionary<string, IEventHandler> handlers;

    public EventDispatcher()
    {
        handlers = new Dictionary<string, IEventHandler>();
    }

    /// <summary>
    /// Register an event handler for a specific event type
    /// </summary>
    public void RegisterHandler(string eventType, IEventHandler handler)
    {
        handlers[eventType] = handler;
        Console.WriteLine($"[Dispatcher] Handler registered for event type: {eventType}");
    }

    /// <summary>
    /// Dispatch an event to the appropriate handler
    /// </summary>
    public void Dispatch(Event eventData)
    {
        if (handlers.ContainsKey(eventData.EventType))
        {
            Console.WriteLine($"[Dispatcher] Dispatching {eventData.EventType} event to handler");
            IEventHandler handler = handlers[eventData.EventType];
            handler.HandleEvent(eventData);
        }
        else
        {
            Console.WriteLine($"[Dispatcher] No handler registered for event type: {eventData.EventType}");
        }
    }
}

/// <summary>
/// Concrete implementation of Reactor pattern.
/// Demultiplexes and dispatches event handlers synchronously
/// The Reactor pattern handles service requests delivered concurrently to an application
/// by one or more clients through synchronous event demultiplexing and dispatching.
/// </summary>
public class ReactorImplementation : IReactor
{
    private readonly EventDemultiplexer demultiplexer;
    private readonly EventDispatcher dispatcher;
    private bool isRunning;
    private int maxEvents;

    public ReactorImplementation()
    {
        demultiplexer = new EventDemultiplexer();
        dispatcher = new EventDispatcher();
        isRunning = false;
        maxEvents = 10;
    }

    /// <summary>
    /// Initialize the reactor with event handlers
    /// </summary>
    private void Initialize()
    {
        Console.WriteLine("\n--- Initializing Reactor ---");

        // Register event handlers
        dispatcher.RegisterHandler("CONNECTION", new ConnectionHandler());
        dispatcher.RegisterHandler("DATA", new DataHandler());
        dispatcher.RegisterHandler("TIMEOUT", new TimeoutHandler());

        Console.WriteLine("--- Reactor Initialized ---\n");
    }

    /// <summary>
    /// Simulate multiple concurrent event sources
    /// </summary>
    private void SimulateEventSources()
    {
        Console.WriteLine("\n--- Simulating Multiple Event Sources ---");

        // Simulate events from different sources
        demultiplexer.RegisterEvent(new Event("CONNECTION", "Client 1 connecting from 192.168.1.100"));
        Thread.Sleep(50);
        demultiplexer.RegisterEvent(new Event("CONNECTION", "Client 2 connecting from 192.168.1.101"));
        Thread.Sleep(30);
        demultiplexer.RegisterEvent(new Event("DATA", "Client 1 sending data: 'Hello Server'"));
        Thread.Sleep(20);
        demultiplexer.RegisterEvent(new Event("TIMEOUT", "Client 3 connection timeout after 30s"));
        Thread.Sleep(40);
        demultiplexer.RegisterEvent(new Event("DATA", "Client 2 sending data: 'Request payload'"));
        Thread.Sleep(25);
        demultiplexer.RegisterEvent(new Event("CONNECTION", "Client 3 reconnecting from 192.168.1.102"));
        Thread.Sleep(35);
        demultiplexer.RegisterEvent(new Event("DATA", "Client 1 sending data: 'Additional request'"));
        Thread.Sleep(15);
        demultiplexer.RegisterEvent(new Event("TIMEOUT", "Client 2 idle timeout after 60s"));

        Console.WriteLine("--- Event Sources Simulation Complete ---\n");
    }

    /// <summary>
    /// The synchronous event loop - core of the Reactor pattern
    /// </summary>
    private void EventLoop()
    {
        Console.WriteLine("\n--- Starting Synchronous Event Loop ---");
        isRunning = true;
        int processedEvents = 0;

        while (isRunning && processedEvents < maxEvents)
        {
            // Check if there are pending events
            if (!demultiplexer.HasPendingEvents())
            {
                Console.WriteLine("[EventLoop] No pending events, waiting...");
                Thread.Sleep(100);
                continue;
            }

            // Wait for an event to occur (synchronous demultiplexing)
            Event eventData = demultiplexer.WaitForEvent();

            // Dispatch the event to the appropriate handler (synchronous dispatching)
            dispatcher.Dispatch(eventData);

            processedEvents++;
            Console.WriteLine($"[EventLoop] Processed {processedEvents} events\n");

            // Small delay to make output readable
            Thread.Sleep(100);
        }

        isRunning = false;
        Console.WriteLine("--- Event Loop Terminated ---");
    }

    /// <summary>
    /// Execute the Reactor pattern demonstration
    /// </summary>
    public void Execute()
    {
        Console.WriteLine("=== Reactor Pattern Implementation ===");
        Console.WriteLine("\nThe Reactor pattern handles service requests delivered concurrently");
        Console.WriteLine("by one or more clients through synchronous event demultiplexing and dispatching.");
        Console.WriteLine("\nKey Components:");
        Console.WriteLine("1. Event Demultiplexer - Waits for events on multiple sources");
        Console.WriteLine("2. Event Handlers - Process specific event types");
        Console.WriteLine("3. Dispatcher - Routes events to appropriate handlers");
        Console.WriteLine("4. Synchronous Event Loop - Processes events one at a time");

        // Initialize the reactor
        Initialize();

        // Simulate concurrent event sources
        SimulateEventSources();

        // Run the synchronous event loop
        EventLoop();

        Console.WriteLine("\n=== Reactor Pattern Demonstration Complete ===");
        Console.WriteLine("\nKey Observations:");
        Console.WriteLine("- Events are processed synchronously (one at a time)");
        Console.WriteLine("- Event demultiplexer queues events from multiple sources");
        Console.WriteLine("- Each event is dispatched to the appropriate handler");
        Console.WriteLine("- No thread-per-connection overhead");
        Console.WriteLine("- Suitable for I/O-bound operations with many concurrent clients");
    }
}
