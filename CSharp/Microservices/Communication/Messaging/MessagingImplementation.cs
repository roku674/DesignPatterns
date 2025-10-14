using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Microservices.Communication.Messaging;

/// <summary>
/// Implementation of Messaging pattern.
/// Uses asynchronous messaging for inter-service communication with pub/sub and message queues
/// </summary>
public class MessagingImplementation : IMessaging
{
    public void Execute()
    {
        Console.WriteLine("Messaging pattern executing...");
        Console.WriteLine("Demonstrating event-driven messaging with pub/sub and message queues\n");
    }
}

/// <summary>
/// Represents a message in the system
/// </summary>
public class Message
{
    public string Id { get; set; }
    public string Type { get; set; }
    public string Payload { get; set; }
    public Dictionary<string, string> Headers { get; set; }
    public DateTime Timestamp { get; set; }
    public string CorrelationId { get; set; }
    public int RetryCount { get; set; }

    public Message()
    {
        Id = Guid.NewGuid().ToString();
        Headers = new Dictionary<string, string>();
        Timestamp = DateTime.UtcNow;
        RetryCount = 0;
    }
}

/// <summary>
/// Message handler interface
/// </summary>
public interface IMessageHandler
{
    string MessageType { get; }
    Task HandleAsync(Message message);
}

/// <summary>
/// Message broker that manages pub/sub and message queues
/// </summary>
public class MessageBroker
{
    private Dictionary<string, List<IMessageHandler>> subscribers;
    private Dictionary<string, Queue<Message>> messageQueues;
    private List<Message> deadLetterQueue;
    private int maxRetries = 3;
    private bool isRunning;

    public MessageBroker()
    {
        subscribers = new Dictionary<string, List<IMessageHandler>>();
        messageQueues = new Dictionary<string, Queue<Message>>();
        deadLetterQueue = new List<Message>();
        isRunning = false;
    }

    /// <summary>
    /// Subscribe a handler to messages of a specific type
    /// </summary>
    public void Subscribe(string messageType, IMessageHandler handler)
    {
        if (!subscribers.ContainsKey(messageType))
        {
            subscribers[messageType] = new List<IMessageHandler>();
        }

        subscribers[messageType].Add(handler);
        Console.WriteLine($"[Broker] Handler subscribed to '{messageType}' messages");
    }

    /// <summary>
    /// Unsubscribe a handler from messages
    /// </summary>
    public void Unsubscribe(string messageType, IMessageHandler handler)
    {
        if (subscribers.ContainsKey(messageType))
        {
            subscribers[messageType].Remove(handler);
            Console.WriteLine($"[Broker] Handler unsubscribed from '{messageType}' messages");
        }
    }

    /// <summary>
    /// Publish a message to all subscribers
    /// </summary>
    public async Task PublishAsync(Message message)
    {
        Console.WriteLine($"[Broker] Publishing message: {message.Type} (ID: {message.Id})");

        if (!subscribers.ContainsKey(message.Type))
        {
            Console.WriteLine($"[Broker] No subscribers for message type '{message.Type}'");
            return;
        }

        List<Task> handlerTasks = new List<Task>();
        foreach (IMessageHandler handler in subscribers[message.Type])
        {
            handlerTasks.Add(DeliverMessageAsync(handler, message));
        }

        await Task.WhenAll(handlerTasks);
    }

    /// <summary>
    /// Send a message to a specific queue for point-to-point communication
    /// </summary>
    public void SendToQueue(string queueName, Message message)
    {
        if (!messageQueues.ContainsKey(queueName))
        {
            messageQueues[queueName] = new Queue<Message>();
        }

        messageQueues[queueName].Enqueue(message);
        Console.WriteLine($"[Broker] Message sent to queue '{queueName}' (ID: {message.Id})");
    }

    /// <summary>
    /// Receive a message from a queue
    /// </summary>
    public Message ReceiveFromQueue(string queueName)
    {
        if (messageQueues.ContainsKey(queueName) && messageQueues[queueName].Count > 0)
        {
            Message message = messageQueues[queueName].Dequeue();
            Console.WriteLine($"[Broker] Message received from queue '{queueName}' (ID: {message.Id})");
            return message;
        }

        return null;
    }

    /// <summary>
    /// Get queue depth
    /// </summary>
    public int GetQueueDepth(string queueName)
    {
        if (messageQueues.ContainsKey(queueName))
        {
            return messageQueues[queueName].Count;
        }
        return 0;
    }

    /// <summary>
    /// Deliver message to handler with retry logic
    /// </summary>
    private async Task DeliverMessageAsync(IMessageHandler handler, Message message)
    {
        try
        {
            await handler.HandleAsync(message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Broker] Error delivering message to handler: {ex.Message}");

            if (message.RetryCount < maxRetries)
            {
                message.RetryCount++;
                Console.WriteLine($"[Broker] Retrying message delivery (attempt {message.RetryCount}/{maxRetries})");
                await Task.Delay(1000 * message.RetryCount); // Exponential backoff
                await DeliverMessageAsync(handler, message);
            }
            else
            {
                Console.WriteLine($"[Broker] Message delivery failed after {maxRetries} retries. Moving to DLQ.");
                MoveToDeadLetterQueue(message);
            }
        }
    }

    /// <summary>
    /// Move failed message to dead letter queue
    /// </summary>
    private void MoveToDeadLetterQueue(Message message)
    {
        deadLetterQueue.Add(message);
    }

    /// <summary>
    /// Get dead letter queue messages
    /// </summary>
    public List<Message> GetDeadLetterQueue()
    {
        return new List<Message>(deadLetterQueue);
    }

    /// <summary>
    /// Get broker statistics
    /// </summary>
    public Dictionary<string, object> GetStatistics()
    {
        return new Dictionary<string, object>
        {
            { "Subscribers", subscribers.Sum(s => s.Value.Count) },
            { "MessageTypes", subscribers.Keys.Count },
            { "Queues", messageQueues.Keys.Count },
            { "TotalQueuedMessages", messageQueues.Sum(q => q.Value.Count) },
            { "DeadLetterQueueSize", deadLetterQueue.Count }
        };
    }
}

/// <summary>
/// Order created event message
/// </summary>
public class OrderCreatedMessage : Message
{
    public string OrderId { get; set; }
    public string CustomerId { get; set; }
    public decimal TotalAmount { get; set; }

    public OrderCreatedMessage(string orderId, string customerId, decimal totalAmount)
    {
        Type = "OrderCreated";
        OrderId = orderId;
        CustomerId = customerId;
        TotalAmount = totalAmount;
        Payload = $"Order {orderId} created for customer {customerId} with total ${totalAmount}";
    }
}

/// <summary>
/// Payment processed event message
/// </summary>
public class PaymentProcessedMessage : Message
{
    public string PaymentId { get; set; }
    public string OrderId { get; set; }
    public decimal Amount { get; set; }
    public bool Success { get; set; }

    public PaymentProcessedMessage(string paymentId, string orderId, decimal amount, bool success)
    {
        Type = "PaymentProcessed";
        PaymentId = paymentId;
        OrderId = orderId;
        Amount = amount;
        Success = success;
        Payload = success
            ? $"Payment {paymentId} processed successfully for order {orderId}"
            : $"Payment {paymentId} failed for order {orderId}";
    }
}

/// <summary>
/// Inventory updated event message
/// </summary>
public class InventoryUpdatedMessage : Message
{
    public string ProductId { get; set; }
    public int Quantity { get; set; }
    public string Operation { get; set; }

    public InventoryUpdatedMessage(string productId, int quantity, string operation)
    {
        Type = "InventoryUpdated";
        ProductId = productId;
        Quantity = quantity;
        Operation = operation;
        Payload = $"Inventory {operation}: Product {productId}, Quantity {quantity}";
    }
}

/// <summary>
/// Order service that publishes order events
/// </summary>
public class OrderService
{
    private MessageBroker broker;
    private Dictionary<string, OrderCreatedMessage> orders;

    public OrderService(MessageBroker broker)
    {
        this.broker = broker;
        orders = new Dictionary<string, OrderCreatedMessage>();
    }

    public async Task CreateOrderAsync(string orderId, string customerId, decimal totalAmount)
    {
        Console.WriteLine($"\n[OrderService] Creating order {orderId}...");

        OrderCreatedMessage message = new OrderCreatedMessage(orderId, customerId, totalAmount)
        {
            CorrelationId = Guid.NewGuid().ToString()
        };

        orders[orderId] = message;

        // Publish event to all subscribers
        await broker.PublishAsync(message);

        Console.WriteLine($"[OrderService] Order {orderId} created and event published");
    }
}

/// <summary>
/// Payment service that handles order events and publishes payment events
/// </summary>
public class PaymentService : IMessageHandler
{
    private MessageBroker broker;
    public string MessageType => "OrderCreated";

    public PaymentService(MessageBroker broker)
    {
        this.broker = broker;
    }

    public async Task HandleAsync(Message message)
    {
        if (message is OrderCreatedMessage orderMessage)
        {
            Console.WriteLine($"[PaymentService] Processing payment for order {orderMessage.OrderId}");

            // Simulate payment processing
            await Task.Delay(100);

            bool success = orderMessage.TotalAmount < 10000; // Simulate payment validation

            PaymentProcessedMessage paymentMessage = new PaymentProcessedMessage(
                Guid.NewGuid().ToString(),
                orderMessage.OrderId,
                orderMessage.TotalAmount,
                success
            )
            {
                CorrelationId = orderMessage.CorrelationId
            };

            await broker.PublishAsync(paymentMessage);

            Console.WriteLine($"[PaymentService] Payment {(success ? "successful" : "failed")} for order {orderMessage.OrderId}");
        }
    }
}

/// <summary>
/// Inventory service that handles order events
/// </summary>
public class InventoryService : IMessageHandler
{
    private MessageBroker broker;
    public string MessageType => "OrderCreated";

    public InventoryService(MessageBroker broker)
    {
        this.broker = broker;
    }

    public async Task HandleAsync(Message message)
    {
        if (message is OrderCreatedMessage orderMessage)
        {
            Console.WriteLine($"[InventoryService] Reserving inventory for order {orderMessage.OrderId}");

            // Simulate inventory reservation
            await Task.Delay(50);

            InventoryUpdatedMessage inventoryMessage = new InventoryUpdatedMessage(
                "PRODUCT-001",
                1,
                "RESERVED"
            )
            {
                CorrelationId = orderMessage.CorrelationId
            };

            await broker.PublishAsync(inventoryMessage);

            Console.WriteLine($"[InventoryService] Inventory reserved for order {orderMessage.OrderId}");
        }
    }
}

/// <summary>
/// Notification service that handles multiple event types
/// </summary>
public class NotificationService : IMessageHandler
{
    public string MessageType => "All"; // Handles multiple types

    public async Task HandleAsync(Message message)
    {
        Console.WriteLine($"[NotificationService] Sending notification for event: {message.Type}");

        // Simulate notification sending
        await Task.Delay(30);

        if (message is OrderCreatedMessage)
        {
            Console.WriteLine($"[NotificationService] Email sent: 'Your order has been received'");
        }
        else if (message is PaymentProcessedMessage paymentMsg)
        {
            string status = paymentMsg.Success ? "confirmed" : "failed";
            Console.WriteLine($"[NotificationService] SMS sent: 'Your payment has been {status}'");
        }
    }
}

/// <summary>
/// Analytics service that consumes messages from a queue
/// </summary>
public class AnalyticsService
{
    private MessageBroker broker;
    private string queueName = "analytics-queue";

    public AnalyticsService(MessageBroker broker)
    {
        this.broker = broker;
    }

    public void ProcessAnalytics()
    {
        Console.WriteLine($"\n[AnalyticsService] Checking analytics queue...");

        Message message = broker.ReceiveFromQueue(queueName);
        if (message != null)
        {
            Console.WriteLine($"[AnalyticsService] Processing analytics for message: {message.Type}");
            Console.WriteLine($"[AnalyticsService] Data: {message.Payload}");
        }
        else
        {
            Console.WriteLine($"[AnalyticsService] No messages in queue");
        }
    }

    public void EnqueueAnalyticsData(Message message)
    {
        broker.SendToQueue(queueName, message);
    }
}
