# Command Message Pattern

## Intent
Use a **Command Message** to invoke a procedure in another application. The message contains the command name and the parameters needed to execute the command. The receiver extracts this information and invokes the appropriate procedure.

## Motivation
When integrating applications, you often need to invoke operations in remote systems. Command Messages provide a way to encapsulate procedural calls as messages that can be sent asynchronously across integration channels.

## Applicability
Use the Command Message pattern when:
- You need to invoke a procedure or method in another application
- You want to decouple the sender from knowing how to execute the operation
- You need to queue, log, or audit procedural invocations
- You want to invoke operations asynchronously
- You need to support distributed transactions across systems

## Structure
```
┌─────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Sender    │────────>│ CommandMessage  │────────>│ CommandExecutor │
└─────────────┘         └─────────────────┘         └─────────────────┘
                               │                            │
                               │                            │
                               v                            v
                        ┌──────────────┐          ┌──────────────────┐
                        │   Command    │          │ Command Handler  │
                        │  - name      │          │   (executes)     │
                        │  - params    │          └──────────────────┘
                        └──────────────┘
```

## Participants

### Message
- Base message class with common attributes (messageId, timestamp, headers, payload)
- Provides infrastructure for message transport

### Command
- Encapsulates the command name and parameters
- Contains the target service that should execute the command
- Supports parameter validation and type safety

### CommandMessage
- Extends Message to carry Command payloads
- Adds command-specific headers (commandName, targetService)
- Marks message type as COMMAND

### CommandExecutor
- Receives and executes command messages
- Maintains a registry of command handlers
- Routes commands to appropriate handlers based on command name
- Validates that commands are targeted to this service

### MessageChannel
- Provides communication pathway for messages
- Supports send/receive operations
- Implements message queuing and listener notifications

## Collaborations
1. Sender creates a Command with name and parameters
2. Sender wraps Command in a CommandMessage
3. Sender sends CommandMessage through MessageChannel
4. CommandExecutor receives CommandMessage
5. Executor validates command is for this service
6. Executor finds appropriate handler for command name
7. Handler executes the command with provided parameters

## Consequences

### Benefits
- **Decoupling**: Sender doesn't know how command is executed
- **Asynchronous**: Commands can be queued and executed later
- **Auditing**: All command invocations can be logged
- **Retry logic**: Failed commands can be retried
- **Load balancing**: Commands can be distributed across multiple executors
- **Versioning**: Command schema can evolve independently

### Drawbacks
- **Complexity**: More complex than direct method calls
- **Debugging**: Harder to trace execution flow
- **Latency**: Network and queuing add latency
- **No compile-time checking**: Command names are strings, not strongly typed
- **Error handling**: More complex error propagation

## Implementation Considerations

### Command Naming
- Use clear, action-oriented names (ProcessOrder, TransferFunds)
- Follow consistent naming conventions across services
- Consider versioning (ProcessOrderV2)

### Parameter Handling
- Validate required parameters before execution
- Use type-safe parameter extraction
- Document expected parameter types
- Handle missing or invalid parameters gracefully

### Error Handling
- Distinguish between validation errors and execution errors
- Return meaningful error messages
- Consider retry strategies for transient failures
- Implement dead letter queues for failed commands

### Security
- Authenticate command senders
- Authorize command execution based on permissions
- Validate command parameters to prevent injection attacks
- Audit all command executions

## Real-World Examples

### E-Commerce
```java
Command processOrder = new Command("ProcessOrder", "OrderService")
    .addParameter("orderId", "ORD-2024-001")
    .addParameter("amount", 299.99);
```

### Banking
```java
Command transfer = new Command("TransferFunds", "BankingService")
    .addParameter("fromAccount", "ACC-12345")
    .addParameter("toAccount", "ACC-67890")
    .addParameter("amount", 1500.00);
```

### IoT Device Control
```java
Command setTemp = new Command("SetTemperature", "IoTService")
    .addParameter("deviceId", "THERMO-001")
    .addParameter("temperature", 72);
```

### Workflow Management
```java
Command approve = new Command("ApproveDocument", "WorkflowService")
    .addParameter("documentId", "DOC-2024-789")
    .addParameter("approver", "manager@company.com");
```

## Related Patterns

### Document Message
- Carries data rather than commands
- Used for data transfer, not procedure invocation
- Typically larger payload size

### Event Message
- Notifies of something that happened
- Past tense naming (OrderProcessed vs ProcessOrder)
- Receivers react to events, commands execute actions

### Request-Reply
- Command Messages often used with Request-Reply
- Command is the request, result is the reply
- Adds synchronous semantics to command execution

### Message Channel
- Infrastructure for transporting Command Messages
- Provides queuing and routing capabilities

### Message Endpoint
- Consumes Command Messages from channels
- Executes commands or forwards to handlers

## Best Practices

1. **Use descriptive command names**: Make it clear what action will be performed
2. **Validate parameters**: Check required parameters before execution
3. **Implement idempotency**: Commands should be safe to execute multiple times
4. **Log command execution**: Audit trail for compliance and debugging
5. **Handle errors gracefully**: Don't let one failed command crash the service
6. **Set appropriate timeouts**: Commands shouldn't block indefinitely
7. **Version your commands**: Allow for schema evolution
8. **Document expected behavior**: Clear contracts for command execution

## Compile and Run
```bash
# Navigate to Java directory
cd /home/roku674/Alex/DesignPatterns/Java

# Compile
javac Integration/CommandMessage/*.java

# Run
java Integration.CommandMessage.Main
```

## Sample Output
```
=== CommandMessage Pattern Demo ===

--- Scenario 1: E-commerce Order Processing ---
Registered handler for command: ProcessOrder
Registered handler for command: CancelOrder
Message sent to channel: command-channel
Message polled from channel: command-channel

--- Executing Command ---
Service: OrderService
Command: ProcessOrder
Parameters: {customerId=CUST-456, amount=299.99, orderId=ORD-2024-001}
Processing order ORD-2024-001 for $299.99
Order processed successfully!
Command executed successfully
```

## References
- Enterprise Integration Patterns by Gregor Hohpe and Bobby Woolf
- https://www.enterpriseintegrationpatterns.com/patterns/messaging/CommandMessage.html
- Pattern-Oriented Software Architecture Vol 4: A Pattern Language for Distributed Computing
