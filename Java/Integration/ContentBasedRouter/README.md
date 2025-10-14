# ContentBasedRouter Pattern

## Category
**Message Routing**

## Intent
Routes messages to different channels based on message content

## Overview
The ContentBasedRouter pattern is a core Enterprise Integration Pattern that enables
routes messages to different channels based on message content. This pattern is essential for building robust, scalable,
and maintainable integration solutions.

## Key Concepts
- Examines message content to determine routing destination
- Uses conditional logic to select output channel
- Decouples sender from routing logic
- Supports complex routing rules

## When to Use

Use the ContentBasedRouter pattern when:
- You need reliable message integration between systems
- You want to decouple sender and receiver components
- You require scalable message processing
- You need to maintain system flexibility
- You want testable integration components

## Structure

```
┌──────────────┐       ┌──────────────────────┐       ┌──────────────┐
│   Sender     │──────>│  ContentBasedRouter       │──────>│   Receiver   │
│  (Producer)  │       │  (Implementation)    │       │  (Consumer)  │
└──────────────┘       └──────────────────────┘       └──────────────┘
```

## Components

### ContentBasedRouterImplementation
The core implementation that provides the pattern functionality.

**Responsibilities:**
- Implements the pattern logic
- Manages message processing
- Maintains metrics and configuration
- Handles errors and edge cases

### Message
Represents integration messages with headers and payload.

**Attributes:**
- `messageId`: Unique identifier
- `timestamp`: Creation time
- `headers`: Metadata map
- `payload`: Business data

## Real-World Scenarios

This implementation demonstrates the following scenarios:

### 1. High priority orders
Route urgent orders to express processing queue

### 2. Regional distribution
Route orders to regional fulfillment centers

### 3. Product category routing
Route products to category-specific handlers

### 4. Customer tier routing
Route VIP customers to premium service

### 5. Error routing
Route failed messages to error handling

## Benefits

### Loose Coupling
Components are decoupled, allowing independent evolution and deployment.

### Scalability
The pattern supports horizontal scaling of message processing.

### Maintainability
Clear separation of concerns makes the system easier to maintain.

### Testability
Components can be tested independently with mock implementations.

### Flexibility
Easy to modify behavior without changing core application code.

## Drawbacks

### Complexity
Additional infrastructure and concepts to understand.

### Latency
Message queuing and routing adds processing time.

### Debugging
Asynchronous processing makes debugging more challenging.

### Overhead
Messaging infrastructure requires resources and management.

## Implementation Notes

### Performance Considerations
- Keep messages small for better throughput
- Use appropriate timeouts for blocking operations
- Consider batch processing for high volumes
- Monitor queue depths and processing rates

### Reliability
- Implement retry logic for transient failures
- Use dead letter queues for failed messages
- Consider message persistence for critical data
- Implement health checks and monitoring

### Security
- Encrypt sensitive message data
- Authenticate message senders
- Authorize message receivers
- Audit message flow for compliance

### Monitoring
- Track message throughput and latency
- Monitor error rates and failures
- Alert on queue depth thresholds
- Log message flow for debugging

## Usage Example

```java
// Create implementation
ContentBasedRouterImplementation implementation = new ContentBasedRouterImplementation();

// Process a scenario
implementation.processScenario("Example Scenario", "Description of scenario");

// Get metrics
Map<String, Object> metrics = implementation.getAllMetrics();
System.out.println("Messages processed: " + metrics.get("messagesProcessed"));
```

## Compile and Run

```bash
# Navigate to Java directory
cd /home/roku674/Alex/DesignPatterns/Java

# Compile all pattern files
javac Integration/ContentBasedRouter/*.java

# Run the demonstration
java Integration.ContentBasedRouter.Main
```

## Sample Output

```
╔══════════════════════════════════════════════════════════════════════╗
║  ContentBasedRouter Pattern Demonstration                                ║
║  Category: Message Routing                                                ║
╚══════════════════════════════════════════════════════════════════════╝

Description:
  Routes messages to different channels based on message content

Initializing ContentBasedRouter infrastructure...
  ℹ ContentBasedRouter instance [ID] initialized
  ✓ Infrastructure initialized

────────────────────────────────────────────────────────────────────────
Scenario 1: High priority orders
────────────────────────────────────────────────────────────────────────
Description: Route urgent orders to express processing queue

  → Processing: High priority orders
  ℹ Created message: [MESSAGE-ID]
  → Executing ContentBasedRouter logic...
  ✓ Pattern logic executed for: High priority orders
  ✓ Scenario processing completed

  ✓ Scenario completed successfully in 52ms
```

## Related Patterns

### Complementary Patterns
- **Message Channel**: Provides transport for messages
- **Message Router**: Routes messages to destinations
- **Message Translator**: Transforms message formats
- **Message Endpoint**: Connects applications to channels

### Alternative Patterns
- Consider different patterns based on specific requirements
- Combine patterns to solve complex integration challenges
- Refer to Enterprise Integration Patterns book for full pattern catalog

## Best Practices

1. **Keep Messages Small**: Optimize for network transmission
2. **Use Correlation IDs**: Track related messages through the system
3. **Implement Idempotency**: Handle duplicate messages gracefully
4. **Log Comprehensively**: Enable debugging and troubleshooting
5. **Monitor Actively**: Track metrics and set up alerts
6. **Plan for Failure**: Implement retry logic and error handling
7. **Document Contracts**: Clearly specify message formats
8. **Version Messages**: Support schema evolution
9. **Test Thoroughly**: Unit, integration, and end-to-end tests
10. **Review Regularly**: Continuously improve the implementation

## Common Pitfalls

- **Ignoring error handling**: Always handle failures gracefully
- **Not monitoring**: Lack of visibility into message flow
- **Tight coupling**: Defeating the purpose of the pattern
- **Poor performance**: Not optimizing message size and throughput
- **Missing documentation**: Unclear message contracts
- **No versioning**: Breaking changes without versioning
- **Inadequate testing**: Missing edge cases and error scenarios

## Further Reading

- Enterprise Integration Patterns by Gregor Hohpe and Bobby Woolf
- https://www.enterpriseintegrationpatterns.com
- Message-Oriented Middleware documentation
- Cloud integration patterns and best practices

## Version History

- **1.0** - Initial implementation with comprehensive scenarios
- Demonstrates all key concepts of the ContentBasedRouter pattern
- Includes metrics, monitoring, and error handling
- Production-ready foundation for enterprise integration

## License

This implementation is provided as an educational example of the
ContentBasedRouter pattern from Enterprise Integration Patterns.

---

**Pattern**: ContentBasedRouter
**Category**: Message Routing
**Complexity**: Medium to High
**Use Cases**: Enterprise Integration, Microservices, Event-Driven Architecture
