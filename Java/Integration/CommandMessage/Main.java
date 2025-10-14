package Integration.CommandMessage;

import java.util.HashMap;
import java.util.Map;

/**
 * CommandMessage Pattern Demonstration
 *
 * The Command Message pattern is used when you want to invoke a procedure
 * in another application. Unlike Document Messages (which contain data) or
 * Event Messages (which notify of occurrences), Command Messages explicitly
 * tell the receiver to perform a specific action.
 *
 * Key Concepts:
 * - Command messages invoke a procedure/method in the receiver
 * - They contain the command name and parameters needed for execution
 * - The sender expects the receiver to perform a side effect
 * - Commands can be synchronous or asynchronous
 *
 * Real-world examples:
 * - E-commerce: Process order, cancel shipment, refund payment
 * - Banking: Transfer funds, close account, update profile
 * - IoT: Turn on device, adjust temperature, lock door
 * - Workflow: Approve document, reject request, escalate ticket
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CommandMessage Pattern Demo ===\n");

        // Create message channel for command messages
        MessageChannel commandChannel = new MessageChannel("command-channel");

        // Scenario 1: E-commerce Order Processing
        System.out.println("--- Scenario 1: E-commerce Order Processing ---");
        demonstrateOrderProcessing(commandChannel);

        // Scenario 2: Banking Operations
        System.out.println("\n--- Scenario 2: Banking Operations ---");
        demonstrateBankingOperations(commandChannel);

        // Scenario 3: IoT Device Control
        System.out.println("\n--- Scenario 3: IoT Device Control ---");
        demonstrateIoTControl(commandChannel);

        // Scenario 4: Workflow Management
        System.out.println("\n--- Scenario 4: Workflow Management ---");
        demonstrateWorkflowManagement(commandChannel);

        // Scenario 5: Batch Command Processing
        System.out.println("\n--- Scenario 5: Batch Command Processing ---");
        demonstrateBatchCommands(commandChannel);

        // Scenario 6: Command with Priority
        System.out.println("\n--- Scenario 6: Priority Command Processing ---");
        demonstratePriorityCommands(commandChannel);

        // Scenario 7: Command Validation
        System.out.println("\n--- Scenario 7: Command Validation ---");
        demonstrateCommandValidation(commandChannel);

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates order processing commands in an e-commerce system.
     */
    private static void demonstrateOrderProcessing(MessageChannel channel) {
        // Create order service executor
        CommandExecutor orderService = new CommandExecutor("OrderService");

        // Register command handlers
        orderService.registerCommandHandler("ProcessOrder", command -> {
            String orderId = (String) command.getParameter("orderId");
            Double amount = (Double) command.getParameter("amount");
            System.out.println("Processing order " + orderId + " for $" + amount);
            System.out.println("Order processed successfully!");
        });

        orderService.registerCommandHandler("CancelOrder", command -> {
            String orderId = (String) command.getParameter("orderId");
            String reason = (String) command.getParameter("reason");
            System.out.println("Canceling order " + orderId + " - Reason: " + reason);
            System.out.println("Order canceled and refund initiated.");
        });

        // Create and send process order command
        Command processOrder = new Command("ProcessOrder", "OrderService")
            .addParameter("orderId", "ORD-2024-001")
            .addParameter("amount", 299.99)
            .addParameter("customerId", "CUST-456");

        CommandMessage processMessage = new CommandMessage(processOrder);
        channel.send(processMessage);

        // Execute the command
        Message received = channel.poll();
        if (received instanceof CommandMessage) {
            orderService.executeCommand((CommandMessage) received);
        }

        // Create and send cancel order command
        Command cancelOrder = new Command("CancelOrder", "OrderService")
            .addParameter("orderId", "ORD-2024-002")
            .addParameter("reason", "Customer changed mind");

        CommandMessage cancelMessage = new CommandMessage(cancelOrder);
        channel.send(cancelMessage);

        received = channel.poll();
        if (received instanceof CommandMessage) {
            orderService.executeCommand((CommandMessage) received);
        }
    }

    /**
     * Demonstrates banking operation commands.
     */
    private static void demonstrateBankingOperations(MessageChannel channel) {
        CommandExecutor bankingService = new CommandExecutor("BankingService");

        // Register banking command handlers
        bankingService.registerCommandHandler("TransferFunds", command -> {
            String fromAccount = (String) command.getParameter("fromAccount");
            String toAccount = (String) command.getParameter("toAccount");
            Double amount = (Double) command.getParameter("amount");
            System.out.println("Transferring $" + amount + " from " + fromAccount +
                " to " + toAccount);
            System.out.println("Transfer completed successfully!");
        });

        bankingService.registerCommandHandler("CloseAccount", command -> {
            String accountNumber = (String) command.getParameter("accountNumber");
            System.out.println("Closing account: " + accountNumber);
            System.out.println("Account closed. Final balance transferred to savings.");
        });

        // Send transfer funds command
        Command transfer = new Command("TransferFunds", "BankingService")
            .addParameter("fromAccount", "ACC-12345")
            .addParameter("toAccount", "ACC-67890")
            .addParameter("amount", 1500.00)
            .addParameter("currency", "USD");

        CommandMessage transferMessage = new CommandMessage(transfer);
        channel.send(transferMessage);

        Message received = channel.poll();
        if (received instanceof CommandMessage) {
            bankingService.executeCommand((CommandMessage) received);
        }
    }

    /**
     * Demonstrates IoT device control commands.
     */
    private static void demonstrateIoTControl(MessageChannel channel) {
        CommandExecutor iotService = new CommandExecutor("IoTService");

        // Register IoT command handlers
        iotService.registerCommandHandler("SetTemperature", command -> {
            String deviceId = (String) command.getParameter("deviceId");
            Integer temperature = (Integer) command.getParameter("temperature");
            System.out.println("Setting thermostat " + deviceId +
                " to " + temperature + "°F");
            System.out.println("Temperature adjusted successfully!");
        });

        iotService.registerCommandHandler("LockDoor", command -> {
            String doorId = (String) command.getParameter("doorId");
            System.out.println("Locking door: " + doorId);
            System.out.println("Door locked securely.");
        });

        // Send temperature control command
        Command setTemp = new Command("SetTemperature", "IoTService")
            .addParameter("deviceId", "THERMO-001")
            .addParameter("temperature", 72)
            .addParameter("mode", "auto");

        CommandMessage tempMessage = new CommandMessage(setTemp);
        channel.send(tempMessage);

        Message received = channel.poll();
        if (received instanceof CommandMessage) {
            iotService.executeCommand((CommandMessage) received);
        }

        // Send door lock command
        Command lockDoor = new Command("LockDoor", "IoTService")
            .addParameter("doorId", "DOOR-FRONT")
            .addParameter("userId", "USER-123");

        CommandMessage lockMessage = new CommandMessage(lockDoor);
        channel.send(lockMessage);

        received = channel.poll();
        if (received instanceof CommandMessage) {
            iotService.executeCommand((CommandMessage) received);
        }
    }

    /**
     * Demonstrates workflow management commands.
     */
    private static void demonstrateWorkflowManagement(MessageChannel channel) {
        CommandExecutor workflowService = new CommandExecutor("WorkflowService");

        // Register workflow command handlers
        workflowService.registerCommandHandler("ApproveDocument", command -> {
            String documentId = (String) command.getParameter("documentId");
            String approver = (String) command.getParameter("approver");
            System.out.println("Document " + documentId + " approved by " + approver);
            System.out.println("Workflow advanced to next stage.");
        });

        workflowService.registerCommandHandler("EscalateTicket", command -> {
            String ticketId = (String) command.getParameter("ticketId");
            String level = (String) command.getParameter("level");
            System.out.println("Escalating ticket " + ticketId + " to " + level);
            System.out.println("Ticket escalated. Senior team notified.");
        });

        // Send approve document command
        Command approve = new Command("ApproveDocument", "WorkflowService")
            .addParameter("documentId", "DOC-2024-789")
            .addParameter("approver", "manager@company.com")
            .addParameter("comments", "Approved with minor revisions");

        CommandMessage approveMessage = new CommandMessage(approve);
        channel.send(approveMessage);

        Message received = channel.poll();
        if (received instanceof CommandMessage) {
            workflowService.executeCommand((CommandMessage) received);
        }
    }

    /**
     * Demonstrates batch command processing.
     */
    private static void demonstrateBatchCommands(MessageChannel channel) {
        CommandExecutor batchService = new CommandExecutor("BatchService");

        batchService.registerCommandHandler("ProcessBatch", command -> {
            String batchId = (String) command.getParameter("batchId");
            Integer recordCount = (Integer) command.getParameter("recordCount");
            System.out.println("Processing batch " + batchId +
                " with " + recordCount + " records");
            System.out.println("Batch processing completed!");
        });

        // Send batch command with multiple parameters
        Command batch = new Command("ProcessBatch", "BatchService")
            .addParameter("batchId", "BATCH-2024-100")
            .addParameter("recordCount", 5000)
            .addParameter("priority", "high")
            .addParameter("notifyOnComplete", true);

        CommandMessage batchMessage = new CommandMessage(batch);
        channel.send(batchMessage);

        Message received = channel.poll();
        if (received instanceof CommandMessage) {
            batchService.executeCommand((CommandMessage) received);
        }
    }

    /**
     * Demonstrates priority command processing with custom headers.
     */
    private static void demonstratePriorityCommands(MessageChannel channel) {
        CommandExecutor priorityService = new CommandExecutor("PriorityService");

        priorityService.registerCommandHandler("UrgentTask", command -> {
            String taskId = (String) command.getParameter("taskId");
            System.out.println("Executing urgent task: " + taskId);
            System.out.println("Urgent task completed with high priority!");
        });

        // Create command with priority headers
        Command urgentCommand = new Command("UrgentTask", "PriorityService")
            .addParameter("taskId", "TASK-URGENT-001")
            .addParameter("deadline", "2024-10-13T23:59:59");

        Map<String, Object> headers = new HashMap<>();
        headers.put("priority", "URGENT");
        headers.put("timeout", 30000);
        headers.put("retryCount", 3);

        CommandMessage urgentMessage = new CommandMessage(urgentCommand, headers);
        channel.send(urgentMessage);

        System.out.println("Priority header: " + urgentMessage.getHeader("priority"));
        System.out.println("Timeout: " + urgentMessage.getHeader("timeout") + "ms");

        Message received = channel.poll();
        if (received instanceof CommandMessage) {
            priorityService.executeCommand((CommandMessage) received);
        }
    }

    /**
     * Demonstrates command validation and error handling.
     */
    private static void demonstrateCommandValidation(MessageChannel channel) {
        CommandExecutor validationService = new CommandExecutor("ValidationService");

        validationService.registerCommandHandler("ValidatedCommand", command -> {
            // Validate required parameters
            if (command.getParameter("requiredParam") == null) {
                throw new IllegalArgumentException("Missing required parameter");
            }
            System.out.println("Command validated and executed successfully!");
        });

        // Valid command
        Command validCommand = new Command("ValidatedCommand", "ValidationService")
            .addParameter("requiredParam", "value123")
            .addParameter("optionalParam", "optional");

        CommandMessage validMessage = new CommandMessage(validCommand);
        channel.send(validMessage);

        Message received = channel.poll();
        if (received instanceof CommandMessage) {
            validationService.executeCommand((CommandMessage) received);
        }

        // Invalid command (missing required parameter)
        Command invalidCommand = new Command("ValidatedCommand", "ValidationService")
            .addParameter("optionalParam", "optional");

        CommandMessage invalidMessage = new CommandMessage(invalidCommand);
        channel.send(invalidMessage);

        received = channel.poll();
        if (received instanceof CommandMessage) {
            validationService.executeCommand((CommandMessage) received);
        }

        // Command for wrong service
        Command wrongService = new Command("SomeCommand", "DifferentService")
            .addParameter("param", "value");

        CommandMessage wrongMessage = new CommandMessage(wrongService);
        channel.send(wrongMessage);

        received = channel.poll();
        if (received instanceof CommandMessage) {
            validationService.executeCommand((CommandMessage) received);
        }
    }
}
