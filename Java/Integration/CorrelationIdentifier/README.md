# CorrelationIdentifier Pattern

## Category
Message Construction

## Intent
Matches request with corresponding reply using correlation ID

## Motivation
In enterprise integration, applications need to communicate reliably and efficiently.
The CorrelationIdentifier pattern provides a proven solution for matches request with corresponding reply using correlation id.

## Applicability
Use the CorrelationIdentifier pattern when:
- You need to integrate distributed applications
- You want to decouple senders from receivers
- You require reliable message delivery
- You need to support asynchronous communication
- You want to scale message processing

## Structure
```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   Sender     │──────>│  CorrelationIdentifier   │──────>│   Receiver   │
└──────────────┘       └──────────────────┘       └──────────────┘
```

## Participants

### CorrelationIdentifierImplementation
- Core implementation of the pattern
- Handles message processing logic
- Manages pattern-specific configuration
- Provides scenario execution

### Message
- Represents integration messages
- Contains headers, payload, and metadata
- Supports message tracking and correlation

## Real-World Scenarios

### 1. Track order status
Demonstrates how CorrelationIdentifier handles track order status.

### 2. Match payments to invoices
Demonstrates how CorrelationIdentifier handles match payments to invoices.

### 3. Link requests to responses
Demonstrates how CorrelationIdentifier handles link requests to responses.

### 4. Session tracking
Demonstrates how CorrelationIdentifier handles session tracking.

## Consequences

### Benefits
- **Decoupling**: Separates sender from receiver
- **Scalability**: Supports high message volumes
- **Reliability**: Ensures message delivery
- **Flexibility**: Easy to modify and extend
- **Maintainability**: Clear separation of concerns

### Drawbacks
- **Complexity**: Additional infrastructure required
- **Latency**: Message queuing adds delay
- **Debugging**: Harder to trace message flow
- **Overhead**: Resource consumption for messaging

## Implementation Considerations

### Performance
- Optimize message size
- Use efficient serialization
- Implement connection pooling
- Monitor message throughput

### Reliability
- Handle network failures
- Implement retry logic
- Use dead letter queues
- Monitor message delivery

### Security
- Encrypt sensitive data
- Authenticate senders
- Authorize receivers
- Audit message flow

## Compile and Run
```bash
# Navigate to Java directory
cd /home/roku674/Alex/DesignPatterns/Java

# Compile
javac Integration/CorrelationIdentifier/*.java

# Run
java Integration.CorrelationIdentifier.Main
```

## Sample Output
```
=== CorrelationIdentifier Pattern Demo ===

Initializing CorrelationIdentifier infrastructure...

--- Scenario 1: Track order status ---
Setting up Track order status scenario...
CorrelationIdentifier initialized with ID: [UUID]
Processing scenario: Track order status
Instance ID: [UUID]
Executing CorrelationIdentifier logic for: Track order status
CorrelationIdentifier logic executed successfully
Scenario 'Track order status' completed at [Timestamp]
Track order status completed successfully!
```

## Related Patterns
- Message Channel: Infrastructure for message transport
- Message Router: Directs messages to appropriate receivers
- Message Translator: Transforms message formats
- Message Endpoint: Connects applications to channels

## Best Practices
1. **Keep messages small**: Optimize for performance
2. **Use correlation IDs**: Track related messages
3. **Implement idempotency**: Handle duplicate messages
4. **Log everything**: Enable debugging and auditing
5. **Monitor actively**: Track message flow and errors
6. **Plan for failure**: Implement retry and error handling
7. **Document contracts**: Clear message specifications
8. **Version messages**: Support schema evolution

## References
- Enterprise Integration Patterns by Gregor Hohpe and Bobby Woolf
- https://www.enterpriseintegrationpatterns.com
- Message-Oriented Middleware patterns
- Cloud Integration Patterns
