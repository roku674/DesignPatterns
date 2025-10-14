using System;
using System.Threading.Tasks;

namespace Microservices.DataManagement.TransactionOutbox;

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== Transaction Outbox Pattern Demo ===\n");

        // Setup
        OutboxRepository outboxRepository = new OutboxRepository();
        SimpleEventBus eventBus = new SimpleEventBus();
        OrderServiceWithOutbox orderService = new OrderServiceWithOutbox(outboxRepository);
        OutboxPublisher publisher = new OutboxPublisher(outboxRepository, eventBus);

        // Scenario 1: Create order (event stored in outbox)
        Console.WriteLine("=== Scenario 1: Create Order with Outbox ===");
        OrderData order1 = await orderService.CreateOrderAsync(userId: 1, amount: 250.00m);

        // Scenario 2: Create another order
        Console.WriteLine("\n=== Scenario 2: Create Second Order ===");
        OrderData order2 = await orderService.CreateOrderAsync(userId: 2, amount: 500.00m);

        // Scenario 3: Check outbox statistics before publishing
        Console.WriteLine("\n=== Scenario 3: Outbox Statistics (Before Publishing) ===");
        var statsBefore = outboxRepository.GetStatistics();
        foreach (var kvp in statsBefore)
        {
            Console.WriteLine($"   {kvp.Key}: {kvp.Value}");
        }

        // Scenario 4: Publish pending events
        Console.WriteLine("\n=== Scenario 4: Publish Pending Events ===");
        await publisher.PublishPendingEventsAsync();

        // Scenario 5: Check outbox statistics after publishing
        Console.WriteLine("\n=== Scenario 5: Outbox Statistics (After Publishing) ===");
        var statsAfter = outboxRepository.GetStatistics();
        foreach (var kvp in statsAfter)
        {
            Console.WriteLine($"   {kvp.Key}: {kvp.Value}");
        }

        // Scenario 6: Create more orders
        Console.WriteLine("\n=== Scenario 6: Create More Orders ===");
        await orderService.CreateOrderAsync(userId: 1, amount: 750.00m);
        await orderService.CreateOrderAsync(userId: 3, amount: 300.00m);

        // Scenario 7: Publish again
        Console.WriteLine("\n=== Scenario 7: Publish New Pending Events ===");
        await publisher.PublishPendingEventsAsync();

        // Scenario 8: Try publishing when no pending events
        Console.WriteLine("\n=== Scenario 8: Publish When No Pending Events ===");
        await publisher.PublishPendingEventsAsync();

        // Scenario 9: Final statistics
        Console.WriteLine("\n=== Scenario 9: Final Statistics ===");
        var finalStats = outboxRepository.GetStatistics();
        foreach (var kvp in finalStats)
        {
            Console.WriteLine($"   {kvp.Key}: {kvp.Value}");
        }
        Console.WriteLine($"   Total Published: {publisher.GetPublishedCount()}");

        // Scenario 10: Show all published events
        Console.WriteLine("\n=== Scenario 10: Published Events ===");
        var publishedEvents = eventBus.GetPublishedEvents();
        for (int i = 0; i < publishedEvents.Count; i++)
        {
            Console.WriteLine($"   {i + 1}. {publishedEvents[i]}");
        }

        Console.WriteLine("\n=== Demo Complete ===");
        Console.WriteLine("\nKey Features Demonstrated:");
        Console.WriteLine("- Transactional event storage");
        Console.WriteLine("- Atomic order creation and event persistence");
        Console.WriteLine("- Asynchronous event publishing");
        Console.WriteLine("- Guaranteed event delivery");
        Console.WriteLine("- Event status tracking");
        Console.WriteLine("- Retry mechanism for failed events");
    }
}
