using System;
using System.Collections.Generic;
using System.Text;

namespace Integration.MessageConstruction.Message;

/// <summary>
/// Represents the fundamental unit of data transmission in messaging systems.
/// A Message contains a header (metadata) and a body (payload).
/// </summary>
public class MessageImplementation : IMessage
{
    public void Execute()
    {
        Console.WriteLine("Message pattern: Basic unit of data transmitted between systems\n");

        // Scenario 1: Simple text message
        TextMessage textMsg = new TextMessage("Hello, World!");
        textMsg.Headers["MessageId"] = Guid.NewGuid().ToString();
        textMsg.Headers["Timestamp"] = DateTime.UtcNow.ToString("o");
        textMsg.Headers["Sender"] = "OrderService";
        Console.WriteLine("1. Simple Text Message:");
        Console.WriteLine(textMsg.ToString());

        // Scenario 2: JSON message with complex payload
        OrderMessage orderMsg = new OrderMessage
        {
            OrderId = "ORD-12345",
            CustomerId = "CUST-789",
            TotalAmount = 299.99m,
            Items = new List<OrderItem>
            {
                new OrderItem { ProductId = "PROD-1", Quantity = 2, Price = 99.99m },
                new OrderItem { ProductId = "PROD-2", Quantity = 1, Price = 100.01m }
            }
        };
        orderMsg.Headers["MessageId"] = Guid.NewGuid().ToString();
        orderMsg.Headers["Timestamp"] = DateTime.UtcNow.ToString("o");
        orderMsg.Headers["MessageType"] = "OrderCreated";
        orderMsg.Headers["Priority"] = "High";
        Console.WriteLine("\n2. Order Message with Structured Payload:");
        Console.WriteLine(orderMsg.ToString());

        // Scenario 3: Binary message
        byte[] imageData = Encoding.UTF8.GetBytes("BINARY_IMAGE_DATA_HERE");
        BinaryMessage binaryMsg = new BinaryMessage(imageData);
        binaryMsg.Headers["MessageId"] = Guid.NewGuid().ToString();
        binaryMsg.Headers["ContentType"] = "image/png";
        binaryMsg.Headers["ContentLength"] = imageData.Length.ToString();
        Console.WriteLine("\n3. Binary Message:");
        Console.WriteLine(binaryMsg.ToString());

        // Scenario 4: Message with expiration
        TextMessage expiringMsg = new TextMessage("This message expires soon");
        expiringMsg.Headers["MessageId"] = Guid.NewGuid().ToString();
        expiringMsg.Headers["ExpiresAt"] = DateTime.UtcNow.AddMinutes(5).ToString("o");
        Console.WriteLine("\n4. Message with Expiration:");
        Console.WriteLine(expiringMsg.ToString());

        // Scenario 5: Message routing
        MessageRouter router = new MessageRouter();
        router.Route(orderMsg);
        router.Route(textMsg);
        router.Route(binaryMsg);

        // Scenario 6: Message validation
        MessageValidator validator = new MessageValidator();
        Console.WriteLine("\n6. Message Validation:");
        Console.WriteLine($"Order message valid: {validator.Validate(orderMsg)}");

        TextMessage invalidMsg = new TextMessage("");
        Console.WriteLine($"Empty message valid: {validator.Validate(invalidMsg)}");

        // Scenario 7: Message serialization and deserialization
        Console.WriteLine("\n7. Message Serialization:");
        MessageSerializer serializer = new MessageSerializer();
        string serialized = serializer.Serialize(orderMsg);
        Console.WriteLine($"Serialized: {serialized.Substring(0, Math.Min(100, serialized.Length))}...");

        BaseMessage deserialized = serializer.Deserialize(serialized);
        Console.WriteLine($"Deserialized MessageId: {deserialized.Headers["MessageId"]}");

        // Scenario 8: Message channel delivery
        MessageChannel channel = new MessageChannel("OrderChannel");
        channel.Send(orderMsg);
        BaseMessage received = channel.Receive();
        Console.WriteLine($"\n8. Channel Delivery - Received: {received.Headers["MessageType"]}");
    }
}

/// <summary>
/// Abstract base class for all messages containing common header functionality.
/// </summary>
public abstract class BaseMessage
{
    /// <summary>
    /// Message headers containing metadata (MessageId, Timestamp, ContentType, etc.)
    /// </summary>
    public Dictionary<string, string> Headers { get; set; }

    /// <summary>
    /// When the message was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    protected BaseMessage()
    {
        Headers = new Dictionary<string, string>();
        CreatedAt = DateTime.UtcNow;
    }

    public abstract string GetPayloadType();
    public abstract object GetPayload();
}

/// <summary>
/// Simple text message implementation.
/// </summary>
public class TextMessage : BaseMessage
{
    public string Content { get; set; }

    public TextMessage(string content)
    {
        Content = content;
    }

    public override string GetPayloadType() => "text/plain";

    public override object GetPayload() => Content;

    public override string ToString()
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine($"[TextMessage]");
        sb.AppendLine($"Headers:");
        foreach (KeyValuePair<string, string> header in Headers)
        {
            sb.AppendLine($"  {header.Key}: {header.Value}");
        }
        sb.AppendLine($"Content: {Content}");
        return sb.ToString();
    }
}

/// <summary>
/// Binary message for non-text data (images, files, etc.)
/// </summary>
public class BinaryMessage : BaseMessage
{
    public byte[] Data { get; set; }

    public BinaryMessage(byte[] data)
    {
        Data = data;
    }

    public override string GetPayloadType() => "application/octet-stream";

    public override object GetPayload() => Data;

    public override string ToString()
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine($"[BinaryMessage]");
        sb.AppendLine($"Headers:");
        foreach (KeyValuePair<string, string> header in Headers)
        {
            sb.AppendLine($"  {header.Key}: {header.Value}");
        }
        sb.AppendLine($"Data Length: {Data.Length} bytes");
        return sb.ToString();
    }
}

/// <summary>
/// Structured message for order data.
/// </summary>
public class OrderMessage : BaseMessage
{
    public string OrderId { get; set; }
    public string CustomerId { get; set; }
    public decimal TotalAmount { get; set; }
    public List<OrderItem> Items { get; set; }

    public OrderMessage()
    {
        Items = new List<OrderItem>();
    }

    public override string GetPayloadType() => "application/json";

    public override object GetPayload() => this;

    public override string ToString()
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine($"[OrderMessage]");
        sb.AppendLine($"Headers:");
        foreach (KeyValuePair<string, string> header in Headers)
        {
            sb.AppendLine($"  {header.Key}: {header.Value}");
        }
        sb.AppendLine($"OrderId: {OrderId}");
        sb.AppendLine($"CustomerId: {CustomerId}");
        sb.AppendLine($"TotalAmount: ${TotalAmount:F2}");
        sb.AppendLine($"Items: {Items.Count}");
        foreach (OrderItem item in Items)
        {
            sb.AppendLine($"  - {item.ProductId}: {item.Quantity} x ${item.Price:F2}");
        }
        return sb.ToString();
    }
}

/// <summary>
/// Order line item.
/// </summary>
public class OrderItem
{
    public string ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

/// <summary>
/// Routes messages to appropriate handlers based on message type.
/// </summary>
public class MessageRouter
{
    public void Route(BaseMessage message)
    {
        Console.WriteLine($"\n5. Routing message type: {message.GetType().Name}");

        if (message is OrderMessage)
        {
            Console.WriteLine("   -> Routing to Order Processing Service");
        }
        else if (message is TextMessage)
        {
            Console.WriteLine("   -> Routing to Text Message Handler");
        }
        else if (message is BinaryMessage)
        {
            Console.WriteLine("   -> Routing to Binary Data Handler");
        }
    }
}

/// <summary>
/// Validates message structure and content.
/// </summary>
public class MessageValidator
{
    public bool Validate(BaseMessage message)
    {
        if (message == null)
        {
            return false;
        }

        if (!message.Headers.ContainsKey("MessageId"))
        {
            Console.WriteLine("   Validation failed: Missing MessageId");
            return false;
        }

        if (message is TextMessage textMsg)
        {
            if (string.IsNullOrEmpty(textMsg.Content))
            {
                Console.WriteLine("   Validation failed: Empty content");
                return false;
            }
        }
        else if (message is OrderMessage orderMsg)
        {
            if (string.IsNullOrEmpty(orderMsg.OrderId))
            {
                Console.WriteLine("   Validation failed: Missing OrderId");
                return false;
            }
            if (orderMsg.Items == null || orderMsg.Items.Count == 0)
            {
                Console.WriteLine("   Validation failed: No order items");
                return false;
            }
        }

        Console.WriteLine("   Validation passed");
        return true;
    }
}

/// <summary>
/// Serializes and deserializes messages.
/// </summary>
public class MessageSerializer
{
    public string Serialize(BaseMessage message)
    {
        StringBuilder sb = new StringBuilder();
        sb.Append($"Type:{message.GetType().Name}|");

        foreach (KeyValuePair<string, string> header in message.Headers)
        {
            sb.Append($"{header.Key}:{header.Value};");
        }

        sb.Append($"|Payload:{message.GetPayload()}");

        return sb.ToString();
    }

    public BaseMessage Deserialize(string data)
    {
        // Simplified deserialization for demo
        string[] parts = data.Split('|');

        TextMessage message = new TextMessage("Deserialized content");

        if (parts.Length > 1)
        {
            string[] headers = parts[1].Split(';');
            foreach (string header in headers)
            {
                if (string.IsNullOrEmpty(header)) continue;
                string[] headerParts = header.Split(':');
                if (headerParts.Length == 2)
                {
                    message.Headers[headerParts[0]] = headerParts[1];
                }
            }
        }

        return message;
    }
}

/// <summary>
/// Simple message channel for sending and receiving messages.
/// </summary>
public class MessageChannel
{
    private readonly string channelName;
    private readonly Queue<BaseMessage> messageQueue;

    public MessageChannel(string name)
    {
        channelName = name;
        messageQueue = new Queue<BaseMessage>();
    }

    public void Send(BaseMessage message)
    {
        Console.WriteLine($"\n   Sending message to channel: {channelName}");
        messageQueue.Enqueue(message);
    }

    public BaseMessage Receive()
    {
        if (messageQueue.Count > 0)
        {
            return messageQueue.Dequeue();
        }
        return null;
    }
}
