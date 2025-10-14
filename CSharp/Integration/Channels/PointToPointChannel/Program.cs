using System;
using System.Threading.Tasks;

namespace Integration.Channels.PointToPointChannel;

/// <summary>
/// Demonstrates the Point-to-Point Channel pattern.
/// A Point-to-Point Channel ensures that only one receiver consumes any given message.
/// If multiple receivers are listening, only one will receive each message.
/// </summary>
public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== Point-to-Point Channel Pattern Demo ===\n");

        // Scenario 1: Basic Point-to-Point messaging
        Console.WriteLine("Scenario 1: Basic Point-to-Point Messaging");
        Console.WriteLine("------------------------------------------");
        await DemoBasicPointToPoint();

        // Scenario 2: Multiple consumers competing for messages
        Console.WriteLine("\n\nScenario 2: Multiple Competing Consumers");
        Console.WriteLine("------------------------------------------");
        await DemoCompetingConsumers();

        // Scenario 3: Load balancing with Point-to-Point
        Console.WriteLine("\n\nScenario 3: Load Balancing");
        Console.WriteLine("---------------------------");
        await DemoLoadBalancing();

        // Scenario 4: Guaranteed delivery with acknowledgments
        Console.WriteLine("\n\nScenario 4: Guaranteed Delivery with ACK");
        Console.WriteLine("------------------------------------------");
        await DemoGuaranteedDelivery();

        // Scenario 5: Priority message handling
        Console.WriteLine("\n\nScenario 5: Priority Message Handling");
        Console.WriteLine("--------------------------------------");
        await DemoPriorityHandling();

        // Scenario 6: Message timeout and retry
        Console.WriteLine("\n\nScenario 6: Message Timeout and Retry");
        Console.WriteLine("--------------------------------------");
        await DemoTimeoutAndRetry();

        // Scenario 7: Transactional message consumption
        Console.WriteLine("\n\nScenario 7: Transactional Consumption");
        Console.WriteLine("--------------------------------------");
        await DemoTransactionalConsumption();

        // Scenario 8: Channel capacity and backpressure
        Console.WriteLine("\n\nScenario 8: Channel Capacity Management");
        Console.WriteLine("----------------------------------------");
        await DemoCapacityManagement();

        Console.WriteLine("\n\n=== Demo Complete ===");
    }

    private static async Task DemoBasicPointToPoint()
    {
        PointToPointChannel<string> channel = new PointToPointChannel<string>("OrderChannel");

        // Start a consumer
        Task consumer = Task.Run(async () =>
        {
            while (true)
            {
                Message<string> message = await channel.ReceiveAsync();
                if (message == null) break;
                Console.WriteLine($"  Consumer received: {message.Payload}");
                await Task.Delay(100);
            }
        });

        // Send messages
        await channel.SendAsync(new Message<string>("Order-001", "Order for Product A"));
        await channel.SendAsync(new Message<string>("Order-002", "Order for Product B"));
        await channel.SendAsync(new Message<string>("Order-003", "Order for Product C"));

        await Task.Delay(500);
        channel.Close();
        await consumer;
    }

    private static async Task DemoCompetingConsumers()
    {
        PointToPointChannel<WorkItem> channel = new PointToPointChannel<WorkItem>("WorkQueue");

        // Start multiple consumers
        Task[] consumers = new Task[3];
        for (int i = 0; i < 3; i++)
        {
            int consumerId = i + 1;
            consumers[i] = Task.Run(async () =>
            {
                while (true)
                {
                    Message<WorkItem> message = await channel.ReceiveAsync();
                    if (message == null) break;
                    Console.WriteLine($"  Consumer {consumerId} processing: {message.Payload.Description}");
                    await Task.Delay(50);
                }
            });
        }

        // Send work items
        for (int i = 1; i <= 9; i++)
        {
            await channel.SendAsync(new Message<WorkItem>(
                $"work-{i}",
                new WorkItem { Id = i, Description = $"Task {i}" }
            ));
        }

        await Task.Delay(600);
        channel.Close();
        await Task.WhenAll(consumers);
    }

    private static async Task DemoLoadBalancing()
    {
        LoadBalancingChannel<ProcessingTask> channel = new LoadBalancingChannel<ProcessingTask>();

        // Register workers
        for (int i = 1; i <= 3; i++)
        {
            int workerId = i;
            channel.RegisterWorker($"Worker-{workerId}", async task =>
            {
                Console.WriteLine($"  Worker-{workerId} executing: {task.Name}");
                await Task.Delay(100);
                return true;
            });
        }

        // Send tasks
        for (int i = 1; i <= 6; i++)
        {
            await channel.SendAsync(new ProcessingTask
            {
                Id = i,
                Name = $"ProcessTask-{i}"
            });
        }

        await Task.Delay(800);
        await channel.ShutdownAsync();
    }

    private static async Task DemoGuaranteedDelivery()
    {
        ReliablePointToPointChannel<Order> channel = new ReliablePointToPointChannel<Order>();

        // Consumer with acknowledgment
        Task consumer = Task.Run(async () =>
        {
            while (true)
            {
                ReliableMessage<Order> message = await channel.ReceiveAsync();
                if (message == null) break;

                try
                {
                    Console.WriteLine($"  Processing order: {message.Payload.OrderId}");

                    // Simulate processing
                    if (message.Payload.Amount > 0)
                    {
                        await Task.Delay(50);
                        message.Acknowledge();
                        Console.WriteLine($"  Order {message.Payload.OrderId} acknowledged");
                    }
                    else
                    {
                        message.Reject("Invalid amount");
                        Console.WriteLine($"  Order {message.Payload.OrderId} rejected");
                    }
                }
                catch (Exception ex)
                {
                    message.Reject(ex.Message);
                }
            }
        });

        // Send orders
        await channel.SendAsync(new Order { OrderId = "ORD-001", Amount = 100.50m });
        await channel.SendAsync(new Order { OrderId = "ORD-002", Amount = 250.00m });
        await channel.SendAsync(new Order { OrderId = "ORD-003", Amount = -10.00m }); // Invalid

        await Task.Delay(500);
        channel.Close();
        await consumer;

        Console.WriteLine($"\n  Unacknowledged messages: {channel.GetUnacknowledgedCount()}");
    }

    private static async Task DemoPriorityHandling()
    {
        PriorityPointToPointChannel<Notification> channel = new PriorityPointToPointChannel<Notification>();

        Task consumer = Task.Run(async () =>
        {
            while (true)
            {
                PriorityMessage<Notification> message = await channel.ReceiveAsync();
                if (message == null) break;

                Console.WriteLine($"  Processing {message.Priority} priority: {message.Payload.Text}");
                await Task.Delay(100);
            }
        });

        // Send messages with different priorities (will be processed in priority order)
        await channel.SendAsync(new Notification { Text = "Regular notification" }, Priority.Normal);
        await channel.SendAsync(new Notification { Text = "URGENT: System Alert!" }, Priority.High);
        await channel.SendAsync(new Notification { Text = "Low priority log" }, Priority.Low);
        await channel.SendAsync(new Notification { Text = "CRITICAL: Security breach!" }, Priority.Critical);
        await channel.SendAsync(new Notification { Text = "Another regular message" }, Priority.Normal);

        await Task.Delay(800);
        channel.Close();
        await consumer;
    }

    private static async Task DemoTimeoutAndRetry()
    {
        TimeoutPointToPointChannel<string> channel = new TimeoutPointToPointChannel<string>(
            messageTimeout: TimeSpan.FromMilliseconds(200),
            maxRetries: 2
        );

        Task consumer = Task.Run(async () =>
        {
            int messageCount = 0;
            while (true)
            {
                TimeoutMessage<string> message = await channel.ReceiveAsync();
                if (message == null) break;

                messageCount++;
                Console.WriteLine($"  Attempt {message.RetryCount + 1}: {message.Payload}");

                // Simulate processing failure on first attempt
                if (messageCount == 1 && message.RetryCount == 0)
                {
                    Console.WriteLine("  Processing failed, will retry...");
                    await Task.Delay(300); // Exceed timeout
                }
                else
                {
                    message.Complete();
                    Console.WriteLine($"  Successfully processed: {message.Payload}");
                }
            }
        });

        await channel.SendAsync("Important Message");

        await Task.Delay(1500);
        channel.Close();
        await consumer;
    }

    private static async Task DemoTransactionalConsumption()
    {
        TransactionalChannel<PaymentRequest> channel = new TransactionalChannel<PaymentRequest>();

        Task consumer = Task.Run(async () =>
        {
            while (true)
            {
                TransactionalMessage<PaymentRequest> message = await channel.ReceiveAsync();
                if (message == null) break;

                Console.WriteLine($"  Starting transaction for payment: {message.Payload.PaymentId}");

                using (Transaction transaction = message.BeginTransaction())
                {
                    try
                    {
                        // Simulate payment processing
                        Console.WriteLine($"  Processing payment of ${message.Payload.Amount}");
                        await Task.Delay(100);

                        if (message.Payload.Amount > 1000)
                        {
                            throw new InvalidOperationException("Amount exceeds limit");
                        }

                        transaction.Commit();
                        Console.WriteLine($"  Transaction committed for {message.Payload.PaymentId}");
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        Console.WriteLine($"  Transaction rolled back: {ex.Message}");
                    }
                }
            }
        });

        await channel.SendAsync(new PaymentRequest { PaymentId = "PAY-001", Amount = 500.00m });
        await channel.SendAsync(new PaymentRequest { PaymentId = "PAY-002", Amount = 1500.00m }); // Will fail
        await channel.SendAsync(new PaymentRequest { PaymentId = "PAY-003", Amount = 300.00m });

        await Task.Delay(800);
        channel.Close();
        await consumer;
    }

    private static async Task DemoCapacityManagement()
    {
        BoundedPointToPointChannel<string> channel = new BoundedPointToPointChannel<string>(capacity: 5);

        Task producer = Task.Run(async () =>
        {
            for (int i = 1; i <= 10; i++)
            {
                bool sent = await channel.TrySendAsync($"Message-{i}", TimeSpan.FromMilliseconds(100));
                if (sent)
                {
                    Console.WriteLine($"  Producer: Sent Message-{i}");
                }
                else
                {
                    Console.WriteLine($"  Producer: Channel full, Message-{i} blocked");
                }
                await Task.Delay(50);
            }
        });

        Task consumer = Task.Run(async () =>
        {
            await Task.Delay(300); // Delay to allow backpressure

            while (true)
            {
                string message = await channel.ReceiveAsync();
                if (message == null) break;

                Console.WriteLine($"  Consumer: Received {message}");
                await Task.Delay(150);
            }
        });

        await producer;
        await Task.Delay(1500);
        channel.Close();
        await consumer;

        Console.WriteLine($"\n  Final channel count: {channel.Count}");
    }
}
