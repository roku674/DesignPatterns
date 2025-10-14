# Point-to-Point Channel Pattern

## Intent
Ensure that only one receiver consumes any given message. When the channel has multiple subscribers, only one of them can successfully consume a particular message.

## Category
Enterprise Integration Pattern - Channels

## Problem
In a messaging system, you need to ensure that each message is processed exactly once by a single receiver, even when multiple receivers are listening to the channel. This is crucial for work distribution, load balancing, and preventing duplicate processing.

## Solution
Use a Point-to-Point Channel that guarantees exclusive message delivery. The channel maintains a queue of messages and delivers each message to exactly one receiver, even when multiple receivers are competing for messages.

## Key Components

### 1. Basic Point-to-Point Channel
- Thread-safe message delivery using `System.Threading.Channels`
- Single message consumption guarantee
- Support for multiple competing consumers

### 2. Load Balancing Channel
- Distributes work evenly across registered workers
- Worker registration and management
- Automatic load distribution

### 3. Reliable Channel
- Message acknowledgment support
- Rejection handling with reasons
- Unacknowledged message tracking

### 4. Priority Channel
- Priority-based message processing
- Four priority levels: Low, Normal, High, Critical
- High-priority messages processed first

### 5. Timeout Channel
- Message timeout monitoring
- Automatic retry with configurable attempts
- Failed message tracking

### 6. Transactional Channel
- ACID transaction support
- Commit/rollback operations
- Transaction isolation

### 7. Bounded Channel
- Capacity-limited channel
- Backpressure management
- Flow control with timeouts

## Scenarios Demonstrated

1. **Basic Point-to-Point Messaging**: Simple message delivery to a single consumer
2. **Multiple Competing Consumers**: Load distribution across three consumers
3. **Load Balancing**: Worker registration and task distribution
4. **Guaranteed Delivery with ACK**: Acknowledgment-based reliability
5. **Priority Message Handling**: Processing messages by priority
6. **Message Timeout and Retry**: Handling processing failures
7. **Transactional Consumption**: ACID guarantees for message processing
8. **Channel Capacity Management**: Handling backpressure and flow control

## C# Features Used

- **async/await**: Asynchronous message processing
- **System.Threading.Channels**: Thread-safe channel implementation
- **ConcurrentDictionary**: Thread-safe message tracking
- **ConcurrentQueue**: Thread-safe message queueing
- **SemaphoreSlim**: Signaling between producers and consumers
- **CancellationTokenSource**: Timeout management
- **IDisposable**: Resource cleanup for transactions

## Benefits

- **Exclusive Processing**: Each message processed by exactly one consumer
- **Load Distribution**: Work automatically distributed across consumers
- **Scalability**: Add more consumers to increase throughput
- **Reliability**: Message acknowledgment prevents loss
- **Priority Support**: Critical messages processed first
- **Fault Tolerance**: Automatic retry for failed messages
- **Flow Control**: Backpressure prevents system overload

## Trade-offs

- **No Broadcast**: Only one receiver gets each message (use Publish-Subscribe for broadcasting)
- **Ordering Challenges**: Message order may not be preserved with competing consumers
- **Complexity**: Advanced features like transactions add overhead
- **Resource Usage**: Bounded channels may block producers when full

## Real-World Use Cases

1. **Task Queues**: Distributing work items to worker processes
2. **Order Processing**: Processing customer orders exactly once
3. **Payment Processing**: Ensuring each payment is processed once
4. **Email Delivery**: Distributing email sending across servers
5. **Job Scheduling**: Distributing scheduled jobs to workers
6. **Data Processing Pipelines**: Processing data items in parallel

## Implementation Notes

- Uses `System.Threading.Channels` for thread-safe, high-performance messaging
- All channels are async-first, supporting efficient I/O operations
- Competing consumers automatically balance load
- No external dependencies required (pure .NET)
- Production-ready patterns with error handling

## Related Patterns

- **Publish-Subscribe Channel**: For broadcasting messages to multiple receivers
- **Competing Consumers**: Pattern for scaling message processing
- **Message Dispatcher**: Coordinates message distribution
- **Load Balancer**: Similar to Load Balancing Channel
- **Guaranteed Delivery**: Ensures messages aren't lost
- **Dead Letter Channel**: Handles messages that can't be processed

## How to Run

```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Integration/Channels/PointToPointChannel
dotnet run
```

Expected output demonstrates 8 scenarios with various channel features and capabilities.
