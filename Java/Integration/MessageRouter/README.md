# MessageRouter Pattern

## Category
Message Routing

## Intent
Routes messages to different destinations based on conditions

## Motivation
In enterprise integration, applications need to communicate reliably and efficiently.
The MessageRouter pattern provides a proven solution for routes messages to different destinations based on conditions.

## Applicability
Use the MessageRouter pattern when:
- You need to integrate distributed applications
- You want to decouple senders from receivers
- You require reliable message delivery
- You need to support asynchronous communication
- You want to scale message processing

## Structure
```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   Sender     │──────>│  MessageRouter   │──────>│   Receiver   │
└──────────────┘       └──────────────────┘       └──────────────┘
```

## Participants

### MessageRouterImplementation
- Core implementation of the pattern
- Handles message processing logic
- Manages pattern-specific configuration
- Provides scenario execution

### Message
- Represents integration messages
- Contains headers, payload, and metadata
- Supports message tracking and correlation

## Real-World Scenarios

### 1. Conditional routing
Demonstrates how MessageRouter handles conditional routing.

### 2. Multi-destination routing
Demonstrates how MessageRouter handles multi-destination routing.

### 3. Filter-based routing
Demonstrates how MessageRouter handles filter-based routing.

### 4. Priority routing
Demonstrates how MessageRouter handles priority routing.

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
javac Integration/MessageRouter/*.java

# Run
java Integration.MessageRouter.Main
```

## Sample Output
```
=== MessageRouter Pattern Demo ===

Initializing MessageRouter infrastructure...

--- Scenario 1: Conditional routing ---
Setting up Conditional routing scenario...
MessageRouter initialized with ID: [UUID]
Processing scenario: Conditional routing
Instance ID: [UUID]
Executing MessageRouter logic for: Conditional routing
MessageRouter logic executed successfully
Scenario 'Conditional routing' completed at [Timestamp]
Conditional routing completed successfully!
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
