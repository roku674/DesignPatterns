using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Integration.MessageConstruction.CommandMessage;

/// <summary>
/// Command Message pattern implementation.
/// Uses messaging to invoke a procedure in another application.
/// Commands are imperative - they tell the receiver what to do.
/// </summary>
public class CommandMessageImplementation : ICommandMessage
{
    public void Execute()
    {
        Console.WriteLine("Command Message Pattern: Use messaging to invoke a procedure in another application\n");

        // Scenario 1: Simple command execution
        CreateOrderCommand createOrder = new CreateOrderCommand
        {
            CommandId = Guid.NewGuid().ToString(),
            Timestamp = DateTime.UtcNow,
            CustomerId = "CUST-123",
            ProductId = "PROD-456",
            Quantity = 5
        };

        CommandProcessor processor = new CommandProcessor();
        Console.WriteLine("1. Simple Command Execution:");
        processor.Process(createOrder);

        // Scenario 2: Batch commands
        Console.WriteLine("\n2. Batch Command Processing:");
        List<ICommand> commands = new List<ICommand>
        {
            new UpdateInventoryCommand { ProductId = "PROD-456", Delta = -5 },
            new SendNotificationCommand { Recipient = "customer@example.com", Message = "Order created" },
            new CreateInvoiceCommand { OrderId = "ORD-789", Amount = 99.99m }
        };

        foreach (ICommand cmd in commands)
        {
            processor.Process(cmd);
        }

        // Scenario 3: Asynchronous command execution
        Console.WriteLine("\n3. Asynchronous Command Execution:");
        AsyncCommandProcessor asyncProcessor = new AsyncCommandProcessor();
        Task.Run(async () =>
        {
            await asyncProcessor.ProcessAsync(new ProcessPaymentCommand
            {
                PaymentId = "PAY-123",
                Amount = 99.99m,
                Currency = "USD"
            });
        }).Wait();

        // Scenario 4: Command validation
        Console.WriteLine("\n4. Command Validation:");
        CommandValidator validator = new CommandValidator();

        CreateOrderCommand validCmd = new CreateOrderCommand
        {
            CommandId = Guid.NewGuid().ToString(),
            CustomerId = "CUST-123",
            ProductId = "PROD-456",
            Quantity = 1
        };
        Console.WriteLine($"Valid command: {validator.Validate(validCmd)}");

        CreateOrderCommand invalidCmd = new CreateOrderCommand
        {
            CommandId = Guid.NewGuid().ToString(),
            Quantity = -1
        };
        Console.WriteLine($"Invalid command: {validator.Validate(invalidCmd)}");

        // Scenario 5: Command with retry logic
        Console.WriteLine("\n5. Command with Retry Logic:");
        RetryableCommandExecutor retryExecutor = new RetryableCommandExecutor(maxRetries: 3);
        retryExecutor.Execute(new UnreliableCommand { SuccessRate = 0.7 });

        // Scenario 6: Command routing
        Console.WriteLine("\n6. Command Router:");
        CommandRouter router = new CommandRouter();
        router.RegisterHandler("CreateOrder", new OrderCommandHandler());
        router.RegisterHandler("ProcessPayment", new PaymentCommandHandler());
        router.RegisterHandler("UpdateInventory", new InventoryCommandHandler());

        router.Route("CreateOrder", createOrder);
        router.Route("ProcessPayment", new ProcessPaymentCommand { Amount = 50.00m });

        // Scenario 7: Command queue
        Console.WriteLine("\n7. Command Queue:");
        CommandQueue queue = new CommandQueue();
        queue.Enqueue(new CreateOrderCommand { ProductId = "PROD-1" });
        queue.Enqueue(new ProcessPaymentCommand { Amount = 100.00m });
        queue.Enqueue(new SendNotificationCommand { Recipient = "admin@example.com" });

        Console.WriteLine($"Commands in queue: {queue.Count}");
        queue.ProcessAll();

        // Scenario 8: Command with compensation (saga pattern)
        Console.WriteLine("\n8. Compensatable Commands:");
        CompensatableCommandExecutor sagaExecutor = new CompensatableCommandExecutor();
        sagaExecutor.Execute(new ReserveInventoryCommand { ProductId = "PROD-789", Quantity = 3 });
    }
}

/// <summary>
/// Base interface for all commands.
/// </summary>
public interface ICommand
{
    string CommandId { get; set; }
    DateTime Timestamp { get; set; }
    string GetCommandName();
    void Execute();
}

/// <summary>
/// Command to create a new order.
/// </summary>
public class CreateOrderCommand : ICommand
{
    public string CommandId { get; set; }
    public DateTime Timestamp { get; set; }
    public string CustomerId { get; set; }
    public string ProductId { get; set; }
    public int Quantity { get; set; }

    public CreateOrderCommand()
    {
        CommandId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
    }

    public string GetCommandName() => "CreateOrder";

    public void Execute()
    {
        Console.WriteLine($"   Executing CreateOrder: Customer={CustomerId}, Product={ProductId}, Qty={Quantity}");
    }
}

/// <summary>
/// Command to update inventory levels.
/// </summary>
public class UpdateInventoryCommand : ICommand
{
    public string CommandId { get; set; }
    public DateTime Timestamp { get; set; }
    public string ProductId { get; set; }
    public int Delta { get; set; }

    public UpdateInventoryCommand()
    {
        CommandId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
    }

    public string GetCommandName() => "UpdateInventory";

    public void Execute()
    {
        Console.WriteLine($"   Executing UpdateInventory: Product={ProductId}, Delta={Delta}");
    }
}

/// <summary>
/// Command to send notification.
/// </summary>
public class SendNotificationCommand : ICommand
{
    public string CommandId { get; set; }
    public DateTime Timestamp { get; set; }
    public string Recipient { get; set; }
    public string Message { get; set; }

    public SendNotificationCommand()
    {
        CommandId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
    }

    public string GetCommandName() => "SendNotification";

    public void Execute()
    {
        Console.WriteLine($"   Executing SendNotification: To={Recipient}");
    }
}

/// <summary>
/// Command to create invoice.
/// </summary>
public class CreateInvoiceCommand : ICommand
{
    public string CommandId { get; set; }
    public DateTime Timestamp { get; set; }
    public string OrderId { get; set; }
    public decimal Amount { get; set; }

    public CreateInvoiceCommand()
    {
        CommandId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
    }

    public string GetCommandName() => "CreateInvoice";

    public void Execute()
    {
        Console.WriteLine($"   Executing CreateInvoice: Order={OrderId}, Amount=${Amount:F2}");
    }
}

/// <summary>
/// Command to process payment.
/// </summary>
public class ProcessPaymentCommand : ICommand
{
    public string CommandId { get; set; }
    public DateTime Timestamp { get; set; }
    public string PaymentId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; }

    public ProcessPaymentCommand()
    {
        CommandId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
        Currency = "USD";
    }

    public string GetCommandName() => "ProcessPayment";

    public void Execute()
    {
        Console.WriteLine($"   Executing ProcessPayment: Amount={Amount:F2} {Currency}");
    }
}

/// <summary>
/// Unreliable command for testing retry logic.
/// </summary>
public class UnreliableCommand : ICommand
{
    public string CommandId { get; set; }
    public DateTime Timestamp { get; set; }
    public double SuccessRate { get; set; }
    private static Random random = new Random();

    public UnreliableCommand()
    {
        CommandId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
    }

    public string GetCommandName() => "UnreliableCommand";

    public void Execute()
    {
        if (random.NextDouble() > SuccessRate)
        {
            throw new Exception("Command execution failed (simulated)");
        }
        Console.WriteLine("   Command succeeded");
    }
}

/// <summary>
/// Command with compensation logic for saga pattern.
/// </summary>
public class ReserveInventoryCommand : ICommand
{
    public string CommandId { get; set; }
    public DateTime Timestamp { get; set; }
    public string ProductId { get; set; }
    public int Quantity { get; set; }

    public ReserveInventoryCommand()
    {
        CommandId = Guid.NewGuid().ToString();
        Timestamp = DateTime.UtcNow;
    }

    public string GetCommandName() => "ReserveInventory";

    public void Execute()
    {
        Console.WriteLine($"   Reserving {Quantity} units of {ProductId}");
    }

    public void Compensate()
    {
        Console.WriteLine($"   COMPENSATING: Releasing {Quantity} units of {ProductId}");
    }
}

/// <summary>
/// Basic command processor.
/// </summary>
public class CommandProcessor
{
    public void Process(ICommand command)
    {
        Console.WriteLine($"Processing command: {command.GetCommandName()} (ID: {command.CommandId})");
        command.Execute();
    }
}

/// <summary>
/// Asynchronous command processor.
/// </summary>
public class AsyncCommandProcessor
{
    public async Task ProcessAsync(ICommand command)
    {
        Console.WriteLine($"Async processing: {command.GetCommandName()}");
        await Task.Delay(100); // Simulate async work
        command.Execute();
        Console.WriteLine($"   Async processing complete");
    }
}

/// <summary>
/// Validates commands before execution.
/// </summary>
public class CommandValidator
{
    public bool Validate(ICommand command)
    {
        if (command == null)
        {
            Console.WriteLine("   Validation failed: Command is null");
            return false;
        }

        if (string.IsNullOrEmpty(command.CommandId))
        {
            Console.WriteLine("   Validation failed: Missing CommandId");
            return false;
        }

        if (command is CreateOrderCommand orderCmd)
        {
            if (string.IsNullOrEmpty(orderCmd.CustomerId))
            {
                Console.WriteLine("   Validation failed: Missing CustomerId");
                return false;
            }
            if (string.IsNullOrEmpty(orderCmd.ProductId))
            {
                Console.WriteLine("   Validation failed: Missing ProductId");
                return false;
            }
            if (orderCmd.Quantity <= 0)
            {
                Console.WriteLine("   Validation failed: Invalid quantity");
                return false;
            }
        }

        Console.WriteLine("   Validation passed");
        return true;
    }
}

/// <summary>
/// Retries command execution on failure.
/// </summary>
public class RetryableCommandExecutor
{
    private readonly int maxRetries;

    public RetryableCommandExecutor(int maxRetries)
    {
        this.maxRetries = maxRetries;
    }

    public void Execute(ICommand command)
    {
        int attempts = 0;
        while (attempts < maxRetries)
        {
            attempts++;
            Console.WriteLine($"   Attempt {attempts}/{maxRetries}");

            try
            {
                command.Execute();
                return;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"   Failed: {ex.Message}");
                if (attempts >= maxRetries)
                {
                    Console.WriteLine($"   Max retries reached. Command failed.");
                    throw;
                }
            }
        }
    }
}

/// <summary>
/// Routes commands to appropriate handlers.
/// </summary>
public class CommandRouter
{
    private readonly Dictionary<string, ICommandHandler> handlers;

    public CommandRouter()
    {
        handlers = new Dictionary<string, ICommandHandler>();
    }

    public void RegisterHandler(string commandType, ICommandHandler handler)
    {
        handlers[commandType] = handler;
    }

    public void Route(string commandType, ICommand command)
    {
        if (handlers.ContainsKey(commandType))
        {
            Console.WriteLine($"Routing {commandType} to handler");
            handlers[commandType].Handle(command);
        }
        else
        {
            Console.WriteLine($"No handler found for {commandType}");
        }
    }
}

/// <summary>
/// Command handler interface.
/// </summary>
public interface ICommandHandler
{
    void Handle(ICommand command);
}

/// <summary>
/// Handler for order commands.
/// </summary>
public class OrderCommandHandler : ICommandHandler
{
    public void Handle(ICommand command)
    {
        Console.WriteLine($"   OrderCommandHandler processing: {command.GetCommandName()}");
        command.Execute();
    }
}

/// <summary>
/// Handler for payment commands.
/// </summary>
public class PaymentCommandHandler : ICommandHandler
{
    public void Handle(ICommand command)
    {
        Console.WriteLine($"   PaymentCommandHandler processing: {command.GetCommandName()}");
        command.Execute();
    }
}

/// <summary>
/// Handler for inventory commands.
/// </summary>
public class InventoryCommandHandler : ICommandHandler
{
    public void Handle(ICommand command)
    {
        Console.WriteLine($"   InventoryCommandHandler processing: {command.GetCommandName()}");
        command.Execute();
    }
}

/// <summary>
/// Queue for storing and processing commands.
/// </summary>
public class CommandQueue
{
    private readonly Queue<ICommand> queue;

    public CommandQueue()
    {
        queue = new Queue<ICommand>();
    }

    public int Count => queue.Count;

    public void Enqueue(ICommand command)
    {
        Console.WriteLine($"Enqueuing command: {command.GetCommandName()}");
        queue.Enqueue(command);
    }

    public ICommand Dequeue()
    {
        if (queue.Count > 0)
        {
            return queue.Dequeue();
        }
        return null;
    }

    public void ProcessAll()
    {
        Console.WriteLine($"Processing {queue.Count} commands from queue");
        while (queue.Count > 0)
        {
            ICommand command = queue.Dequeue();
            command.Execute();
        }
    }
}

/// <summary>
/// Executes compensatable commands (saga pattern).
/// </summary>
public class CompensatableCommandExecutor
{
    public void Execute(ReserveInventoryCommand command)
    {
        Console.WriteLine($"Executing compensatable command: {command.GetCommandName()}");

        try
        {
            command.Execute();
            // Simulate failure requiring compensation
            Random random = new Random();
            if (random.Next(0, 2) == 0)
            {
                throw new Exception("Downstream failure - compensation required");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"   Error: {ex.Message}");
            command.Compensate();
        }
    }
}
