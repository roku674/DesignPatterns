using System;
using System.Collections.Generic;
using System.Linq;

namespace Integration.MessageConstruction.EventMessage;

/// <summary>
/// Event Message pattern implementation.
/// Uses messaging to transmit events from one application to another.
/// Events are declarative - they notify about something that has already happened.
/// </summary>
public class EventMessageImplementation : IEventMessage
{
    public void Execute()
    {
        Console.WriteLine("Event Message Pattern: Transmit events from one application to another\n");

        // Scenario 1: Simple event publishing
        Console.WriteLine("1. Simple Event Publishing:");
        EventPublisher publisher = new EventPublisher();
        OrderCreatedEvent orderEvent = new OrderCreatedEvent
        {
            EventId = Guid.NewGuid().ToString(),
            OrderId = "ORD-1001",
            CustomerId = "CUST-456",
            Amount = 299.99m,
            CreatedAt = DateTime.UtcNow
        };
        publisher.Publish(orderEvent);

        // Scenario 2: Event subscribers
        Console.WriteLine("\n2. Event Subscription:");
        EventBus eventBus = new EventBus();

        OrderEventHandler orderHandler = new OrderEventHandler();
        InventoryEventHandler inventoryHandler = new InventoryEventHandler();
        EmailEventHandler emailHandler = new EmailEventHandler();

        eventBus.Subscribe<OrderCreatedEvent>(orderHandler);
        eventBus.Subscribe<OrderCreatedEvent>(inventoryHandler);
        eventBus.Subscribe<OrderCreatedEvent>(emailHandler);

        eventBus.Publish(new OrderCreatedEvent
        {
            EventId = Guid.NewGuid().ToString(),
            OrderId = "ORD-1002",
            CustomerId = "CUST-789",
            Amount = 499.99m
        });

        // Scenario 3: Multiple event types
        Console.WriteLine("\n3. Multiple Event Types:");
        eventBus.Subscribe<PaymentProcessedEvent>(new PaymentEventHandler());
        eventBus.Subscribe<InventoryUpdatedEvent>(inventoryHandler);

        eventBus.Publish(new PaymentProcessedEvent
        {
            EventId = Guid.NewGuid().ToString(),
            PaymentId = "PAY-555",
            Amount = 299.99m,
            Status = "Completed"
        });

        eventBus.Publish(new InventoryUpdatedEvent
        {
            EventId = Guid.NewGuid().ToString(),
            ProductId = "PROD-123",
            Quantity = 50,
            UpdateType = "Restocked"
        });

        // Scenario 4: Event sourcing
        Console.WriteLine("\n4. Event Sourcing:");
        EventStore eventStore = new EventStore();
        string aggregateId = "ORDER-1003";

        eventStore.AppendEvent(aggregateId, new OrderCreatedEvent
        {
            OrderId = aggregateId,
            CustomerId = "CUST-100",
            Amount = 150.00m
        });

        eventStore.AppendEvent(aggregateId, new OrderShippedEvent
        {
            OrderId = aggregateId,
            TrackingNumber = "TRACK-123"
        });

        eventStore.AppendEvent(aggregateId, new OrderDeliveredEvent
        {
            OrderId = aggregateId,
            DeliveredAt = DateTime.UtcNow
        });

        Console.WriteLine($"Replaying events for {aggregateId}:");
        List<IEvent> events = eventStore.GetEvents(aggregateId);
        foreach (IEvent evt in events)
        {
            Console.WriteLine($"  - {evt.GetEventType()} at {evt.Timestamp:HH:mm:ss}");
        }

        // Scenario 5: Event filtering
        Console.WriteLine("\n5. Event Filtering:");
        EventFilter filter = new EventFilter();
        filter.AddRule(evt => evt is OrderCreatedEvent orderEvt && orderEvt.Amount > 200);

        Console.WriteLine($"Large order event passes filter: {filter.ShouldProcess(orderEvent)}");

        OrderCreatedEvent smallOrder = new OrderCreatedEvent
        {
            OrderId = "ORD-SMALL",
            Amount = 50.00m
        };
        Console.WriteLine($"Small order event passes filter: {filter.ShouldProcess(smallOrder)}");

        // Scenario 6: Event transformation
        Console.WriteLine("\n6. Event Transformation:");
        EventTransformer transformer = new EventTransformer();
        IEvent transformedEvent = transformer.Transform(orderEvent);
        Console.WriteLine($"Transformed event: {transformedEvent.GetEventType()}");

        // Scenario 7: Event replay
        Console.WriteLine("\n7. Event Replay:");
        EventReplayer replayer = new EventReplayer(eventStore);
        OrderState state = replayer.ReplayToState(aggregateId);
        Console.WriteLine($"Order state after replay: {state.Status}");

        // Scenario 8: Event versioning
        Console.WriteLine("\n8. Event Versioning:");
        EventVersionManager versionManager = new EventVersionManager();
        versionManager.RegisterVersion<OrderCreatedEvent>(1);
        versionManager.RegisterVersion<OrderCreatedEvent>(2); // New version

        Console.WriteLine($"Current version of OrderCreatedEvent: {versionManager.GetVersion<OrderCreatedEvent>()}");
    }
}

/// <summary>
/// Base interface for all events.
/// </summary>
public interface IEvent
{
    string EventId { get; set; }
    DateTime Timestamp { get; set; }
    string GetEventType();
}

/// <summary>
/// Order created event.
/// </summary>
public class OrderCreatedEvent : IEvent
{
    public string EventId { get; set; }
    public DateTime Timestamp { get; set; }
    public string OrderId { get; set; }
    public string CustomerId { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; }

    public OrderCreatedEvent()
    {
        EventId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
        CreatedAt = DateTime.UtcNow;
    }

    public string GetEventType() => "OrderCreated";
}

/// <summary>
/// Order shipped event.
/// </summary>
public class OrderShippedEvent : IEvent
{
    public string EventId { get; set; }
    public DateTime Timestamp { get; set; }
    public string OrderId { get; set; }
    public string TrackingNumber { get; set; }

    public OrderShippedEvent()
    {
        EventId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
    }

    public string GetEventType() => "OrderShipped";
}

/// <summary>
/// Order delivered event.
/// </summary>
public class OrderDeliveredEvent : IEvent
{
    public string EventId { get; set; }
    public DateTime Timestamp { get; set; }
    public string OrderId { get; set; }
    public DateTime DeliveredAt { get; set; }

    public OrderDeliveredEvent()
    {
        EventId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
    }

    public string GetEventType() => "OrderDelivered";
}

/// <summary>
/// Payment processed event.
/// </summary>
public class PaymentProcessedEvent : IEvent
{
    public string EventId { get; set; }
    public DateTime Timestamp { get; set; }
    public string PaymentId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; }

    public PaymentProcessedEvent()
    {
        EventId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
    }

    public string GetEventType() => "PaymentProcessed";
}

/// <summary>
/// Inventory updated event.
/// </summary>
public class InventoryUpdatedEvent : IEvent
{
    public string EventId { get; set; }
    public DateTime Timestamp { get; set; }
    public string ProductId { get; set; }
    public int Quantity { get; set; }
    public string UpdateType { get; set; }

    public InventoryUpdatedEvent()
    {
        EventId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
    }

    public string GetEventType() => "InventoryUpdated";
}

/// <summary>
/// Simple event publisher.
/// </summary>
public class EventPublisher
{
    public void Publish(IEvent evt)
    {
        Console.WriteLine($"Publishing event: {evt.GetEventType()} (ID: {evt.EventId})");
        Console.WriteLine($"  Timestamp: {evt.Timestamp:yyyy-MM-dd HH:mm:ss}");
    }
}

/// <summary>
/// Event bus for pub/sub messaging.
/// </summary>
public class EventBus
{
    private readonly Dictionary<Type, List<IEventHandler>> subscribers;

    public EventBus()
    {
        subscribers = new Dictionary<Type, List<IEventHandler>>();
    }

    public void Subscribe<T>(IEventHandler handler) where T : IEvent
    {
        Type eventType = typeof(T);
        if (!subscribers.ContainsKey(eventType))
        {
            subscribers[eventType] = new List<IEventHandler>();
        }
        subscribers[eventType].Add(handler);
        Console.WriteLine($"Subscribed {handler.GetType().Name} to {eventType.Name}");
    }

    public void Publish(IEvent evt)
    {
        Type eventType = evt.GetType();
        Console.WriteLine($"\nPublishing {evt.GetEventType()} to subscribers");

        if (subscribers.ContainsKey(eventType))
        {
            foreach (IEventHandler handler in subscribers[eventType])
            {
                handler.Handle(evt);
            }
        }
        else
        {
            Console.WriteLine("  No subscribers found");
        }
    }
}

/// <summary>
/// Event handler interface.
/// </summary>
public interface IEventHandler
{
    void Handle(IEvent evt);
}

/// <summary>
/// Handler for order events.
/// </summary>
public class OrderEventHandler : IEventHandler
{
    public void Handle(IEvent evt)
    {
        if (evt is OrderCreatedEvent orderEvt)
        {
            Console.WriteLine($"  OrderEventHandler: Processing order {orderEvt.OrderId} - ${orderEvt.Amount:F2}");
        }
    }
}

/// <summary>
/// Handler for inventory updates.
/// </summary>
public class InventoryEventHandler : IEventHandler
{
    public void Handle(IEvent evt)
    {
        if (evt is OrderCreatedEvent orderEvt)
        {
            Console.WriteLine($"  InventoryEventHandler: Reserving inventory for order {orderEvt.OrderId}");
        }
        else if (evt is InventoryUpdatedEvent invEvt)
        {
            Console.WriteLine($"  InventoryEventHandler: Product {invEvt.ProductId} - {invEvt.UpdateType}");
        }
    }
}

/// <summary>
/// Handler for email notifications.
/// </summary>
public class EmailEventHandler : IEventHandler
{
    public void Handle(IEvent evt)
    {
        if (evt is OrderCreatedEvent orderEvt)
        {
            Console.WriteLine($"  EmailEventHandler: Sending confirmation to customer {orderEvt.CustomerId}");
        }
    }
}

/// <summary>
/// Handler for payment events.
/// </summary>
public class PaymentEventHandler : IEventHandler
{
    public void Handle(IEvent evt)
    {
        if (evt is PaymentProcessedEvent paymentEvt)
        {
            Console.WriteLine($"  PaymentEventHandler: Payment {paymentEvt.PaymentId} - {paymentEvt.Status}");
        }
    }
}

/// <summary>
/// Stores events for event sourcing.
/// </summary>
public class EventStore
{
    private readonly Dictionary<string, List<IEvent>> events;

    public EventStore()
    {
        events = new Dictionary<string, List<IEvent>>();
    }

    public void AppendEvent(string aggregateId, IEvent evt)
    {
        if (!events.ContainsKey(aggregateId))
        {
            events[aggregateId] = new List<IEvent>();
        }
        events[aggregateId].Add(evt);
        Console.WriteLine($"Appended {evt.GetEventType()} to aggregate {aggregateId}");
    }

    public List<IEvent> GetEvents(string aggregateId)
    {
        return events.ContainsKey(aggregateId) ? events[aggregateId] : new List<IEvent>();
    }
}

/// <summary>
/// Filters events based on rules.
/// </summary>
public class EventFilter
{
    private readonly List<Func<IEvent, bool>> rules;

    public EventFilter()
    {
        rules = new List<Func<IEvent, bool>>();
    }

    public void AddRule(Func<IEvent, bool> rule)
    {
        rules.Add(rule);
    }

    public bool ShouldProcess(IEvent evt)
    {
        return rules.All(rule => rule(evt));
    }
}

/// <summary>
/// Transforms events from one format to another.
/// </summary>
public class EventTransformer
{
    public IEvent Transform(IEvent evt)
    {
        Console.WriteLine($"Transforming event: {evt.GetEventType()}");
        // In real scenario, would transform to different format
        return evt;
    }
}

/// <summary>
/// Replays events to rebuild state.
/// </summary>
public class EventReplayer
{
    private readonly EventStore eventStore;

    public EventReplayer(EventStore store)
    {
        eventStore = store;
    }

    public OrderState ReplayToState(string orderId)
    {
        OrderState state = new OrderState { OrderId = orderId, Status = "New" };
        List<IEvent> events = eventStore.GetEvents(orderId);

        foreach (IEvent evt in events)
        {
            if (evt is OrderCreatedEvent)
            {
                state.Status = "Created";
            }
            else if (evt is OrderShippedEvent)
            {
                state.Status = "Shipped";
            }
            else if (evt is OrderDeliveredEvent)
            {
                state.Status = "Delivered";
            }
        }

        return state;
    }
}

/// <summary>
/// Represents order state.
/// </summary>
public class OrderState
{
    public string OrderId { get; set; }
    public string Status { get; set; }
}

/// <summary>
/// Manages event versioning.
/// </summary>
public class EventVersionManager
{
    private readonly Dictionary<Type, int> versions;

    public EventVersionManager()
    {
        versions = new Dictionary<Type, int>();
    }

    public void RegisterVersion<T>(int version) where T : IEvent
    {
        versions[typeof(T)] = version;
        Console.WriteLine($"Registered version {version} for {typeof(T).Name}");
    }

    public int GetVersion<T>() where T : IEvent
    {
        return versions.ContainsKey(typeof(T)) ? versions[typeof(T)] : 1;
    }
}
