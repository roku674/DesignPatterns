using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Microservices.Communication.Messaging;

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== Messaging Pattern Demo ===\n");

        // Create message broker
        MessageBroker broker = new MessageBroker();

        // Create services
        OrderService orderService = new OrderService(broker);
        PaymentService paymentService = new PaymentService(broker);
        InventoryService inventoryService = new InventoryService(broker);
        NotificationService notificationService = new NotificationService();
        AnalyticsService analyticsService = new AnalyticsService(broker);

        // Scenario 1: Subscribe services to events
        Console.WriteLine("1. Setting up pub/sub subscriptions:");
        broker.Subscribe("OrderCreated", paymentService);
        broker.Subscribe("OrderCreated", inventoryService);
        broker.Subscribe("OrderCreated", notificationService);
        broker.Subscribe("PaymentProcessed", notificationService);
        broker.Subscribe("InventoryUpdated", notificationService);

        // Scenario 2: Create order and trigger event cascade
        Console.WriteLine("\n2. Creating order and triggering event cascade:");
        await orderService.CreateOrderAsync("ORD-001", "CUST-123", 500.00m);

        await Task.Delay(500); // Wait for async processing

        // Scenario 3: Create another order
        Console.WriteLine("\n3. Creating second order:");
        await orderService.CreateOrderAsync("ORD-002", "CUST-456", 1200.00m);

        await Task.Delay(500);

        // Scenario 4: Point-to-point messaging with queues
        Console.WriteLine("\n4. Point-to-point messaging with message queues:");
        Message analyticsMsg1 = new Message
        {
            Type = "UserActivity",
            Payload = "User CUST-123 viewed product catalog"
        };
        analyticsService.EnqueueAnalyticsData(analyticsMsg1);

        Message analyticsMsg2 = new Message
        {
            Type = "UserActivity",
            Payload = "User CUST-456 added item to cart"
        };
        analyticsService.EnqueueAnalyticsData(analyticsMsg2);

        // Process messages from queue
        analyticsService.ProcessAnalytics();
        analyticsService.ProcessAnalytics();
        analyticsService.ProcessAnalytics(); // This should show empty queue

        // Scenario 5: Broker statistics
        Console.WriteLine("\n5. Message Broker Statistics:");
        Dictionary<string, object> stats = broker.GetStatistics();
        foreach (KeyValuePair<string, object> stat in stats)
        {
            Console.WriteLine($"   {stat.Key}: {stat.Value}");
        }

        // Scenario 6: Unsubscribe and demonstrate
        Console.WriteLine("\n6. Unsubscribing payment service:");
        broker.Unsubscribe("OrderCreated", paymentService);

        Console.WriteLine("\n7. Creating order after unsubscription:");
        await orderService.CreateOrderAsync("ORD-003", "CUST-789", 750.00m);

        await Task.Delay(500);

        // Scenario 8: High-value order (will fail payment)
        Console.WriteLine("\n8. Creating high-value order (will fail payment validation):");
        broker.Subscribe("OrderCreated", paymentService); // Re-subscribe
        await orderService.CreateOrderAsync("ORD-004", "CUST-999", 15000.00m);

        await Task.Delay(500);

        // Scenario 9: Final statistics
        Console.WriteLine("\n9. Final Broker Statistics:");
        Dictionary<string, object> finalStats = broker.GetStatistics();
        foreach (KeyValuePair<string, object> stat in finalStats)
        {
            Console.WriteLine($"   {stat.Key}: {stat.Value}");
        }

        // Scenario 10: Check dead letter queue
        Console.WriteLine("\n10. Dead Letter Queue:");
        List<Message> dlq = broker.GetDeadLetterQueue();
        if (dlq.Count > 0)
        {
            foreach (Message msg in dlq)
            {
                Console.WriteLine($"   DLQ Message: {msg.Type} - {msg.Payload}");
            }
        }
        else
        {
            Console.WriteLine("   No messages in Dead Letter Queue");
        }

        Console.WriteLine("\n=== Demo Complete ===");
        Console.WriteLine("\nKey Features Demonstrated:");
        Console.WriteLine("- Publish/Subscribe pattern with multiple subscribers");
        Console.WriteLine("- Point-to-point messaging with queues");
        Console.WriteLine("- Event-driven architecture");
        Console.WriteLine("- Message correlation across services");
        Console.WriteLine("- Asynchronous message handling");
        Console.WriteLine("- Service decoupling through messaging");
        Console.WriteLine("- Dead letter queue for failed messages");
        Console.WriteLine("- Dynamic subscription management");
    }
}
