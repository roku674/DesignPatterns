# JavaScript Concurrency Design Patterns

This directory contains comprehensive implementations of 18 advanced concurrency patterns in JavaScript using modern ES6+ features including Promises, async/await, and Worker threads.

## Newly Implemented Patterns (9 Additional)

### 1. Scheduler.js (~400 lines)
**Purpose:** Controls the execution order and timing of asynchronous tasks with priority support and concurrent execution limits.

**Key Components:**
- Priority-based task scheduling
- Concurrent execution limits
- Retry logic with exponential backoff
- Recurring task support (CronScheduler)
- Event-driven architecture

**Use Cases:**
- Rate limiting API calls
- Job queue processing
- Task prioritization
- Background job scheduling

### 2. ReadWriteLock.js (~500 lines)
**Purpose:** Allows multiple concurrent readers or a single writer, maximizing parallelism for read operations.

**Key Components:**
- Multiple concurrent readers
- Exclusive writer access
- Priority support (readers/writers-preferred)
- Timeout handling
- Thread-safe resource management

**Use Cases:**
- Shared cache access
- Configuration management
- Database connection pools
- Shared resource management

### 3. GuardedSuspension.js (~500 lines)
**Purpose:** Suspends execution until a guard condition is met, enabling conditional waiting and synchronization.

**Key Components:**
- Guard condition evaluation
- Timeout support
- Producer-consumer queues
- Resource availability waiting
- Event-driven coordination

**Use Cases:**
- Producer-consumer patterns
- Resource pool management
- Event-driven workflows
- Multi-stage pipelines

### 4. Balking.js (~500 lines)
**Purpose:** Prevents an action from executing if the object is not in an appropriate state.

**Key Components:**
- State-based execution control
- Duplicate operation prevention
- Rate limiting
- Connection management
- Idempotent operations

**Use Cases:**
- Auto-save managers
- Single-execution enforcement
- Rate limiting
- Connection pooling

### 5. DoubleCheckedLocking.js (~500 lines)
**Purpose:** Reduces overhead of acquiring a lock by first testing the locking criterion without acquiring the lock.

**Key Components:**
- Lazy initialization optimization
- Reduced lock contention
- Cache invalidation support
- Singleton pattern optimization
- Metrics tracking

**Use Cases:**
- Lazy resource initialization
- Configuration loading
- Database connection pools
- Cache initialization

### 6. ThreadSpecificStorage.js (~500 lines)
**Purpose:** Provides isolated storage for each execution context using AsyncLocalStorage.

**Key Components:**
- Async context isolation
- Request-scoped data
- Transaction contexts
- Contextual logging
- Session management

**Use Cases:**
- Request context in web servers
- Transaction management
- User session tracking
- Distributed tracing

### 7. WrapperFacade.js (~500 lines)
**Purpose:** Encapsulates low-level system APIs behind a higher-level, easier-to-use interface.

**Key Components:**
- Simplified API interfaces
- Automatic error handling
- Retry logic
- Configuration management
- Event-driven communication

**Use Cases:**
- File system operations
- HTTP client abstractions
- Database drivers
- WebSocket management

### 8. Promise.js (~500 lines)
**Purpose:** Represents a value that may be available now, in the future, or never.

**Key Components:**
- Custom Promise implementation
- Promise utilities (delay, timeout, retry)
- Cancellable promises
- Promise pool
- Async queue

**Use Cases:**
- Asynchronous computations
- Event handling
- Deferred execution
- Async operation chaining

### 9. PromisePattern.js (~500 lines)
**Purpose:** Advanced promise patterns including pipeline, circuit breaker, bulkhead, and sophisticated async control flow.

**Key Components:**
- Promise pipeline
- Circuit breaker
- Bulkhead isolation
- Async semaphore
- Async barrier and latch
- Debouncing and throttling
- Async cache

**Use Cases:**
- Complex async workflows
- Fault tolerance
- Resource isolation
- Rate limiting
- Async coordination

## Previously Implemented Patterns (9 Original)

### 10. ReactorPattern.js (443 lines)
**Purpose:** Handles service requests delivered concurrently by demultiplexing incoming events and dispatching them synchronously to request handlers.

**Key Components:**
- Event Demultiplexer
- Event Handlers (Connection, Data, Timer, HTTP)
- Reactor event loop
- Handle management

**Use Cases:**
- Web servers
- Network event processing
- I/O multiplexing
- Event-driven architectures

### 11. ProactorPattern.js (566 lines)
**Purpose:** Handles asynchronous operations efficiently by initiating operations and processing their completions asynchronously.

**Key Components:**
- Asynchronous Operation Processor
- Completion Event handling
- Completion Dispatcher
- Priority queue management

**Use Cases:**
- Asynchronous I/O operations
- High-performance servers
- Non-blocking operations
- Completion-based workflows

### 12. AcceptorConnector.js (651 lines)
**Purpose:** Decouples connection establishment from service processing in networked systems.

**Key Components:**
- Acceptor (passive connection acceptance)
- Connector (active connection initiation)
- Service Handlers
- Connection strategies (Simple, Retry, Timeout)

**Use Cases:**
- Network servers and clients
- Connection pooling
- Service-oriented architectures
- Distributed systems

### 13. ActiveObject.js (672 lines)
**Purpose:** Decouples method execution from invocation to enhance concurrency and simplify synchronized access.

**Key Components:**
- Method Request queue
- Activation Queue
- Scheduler
- Future pattern for results
- Servant implementations

**Use Cases:**
- Thread-safe object access
- Asynchronous method invocation
- Concurrent data structures
- Banking systems

### 14. MonitorObject.js (711 lines)
**Purpose:** Synchronizes concurrent method execution ensuring only one method runs at a time within an object.

**Key Components:**
- Monitor Lock
- Monitor Conditions
- Synchronized methods
- Read-Write locks
- Semaphores and Barriers

**Use Cases:**
- Producer-consumer problems
- Thread-safe collections
- Resource synchronization
- Concurrent access control

### 15. AsynchronousCompletionToken.js (630 lines)
**Purpose:** Associates application-specific context with asynchronous operations for efficient response demultiplexing.

**Key Components:**
- Completion Tokens with context
- Token Factory
- Async Operation Processor
- Context-aware handlers

**Use Cases:**
- HTTP request tracking
- Database query management
- Batch processing
- Notification systems

### 16. HalfSyncHalfAsync.js (682 lines)
**Purpose:** Decouples asynchronous and synchronous service processing to simplify programming without reducing performance.

**Key Components:**
- Async Layer (I/O handling)
- Sync Layer (processing)
- Queueing Layer (mediation)
- Worker threads

**Use Cases:**
- Web servers
- Database servers
- Image processing services
- Message brokers

### 17. LeaderFollowers.js (664 lines)
**Purpose:** Provides efficient concurrency where threads take turns sharing event sources.

**Key Components:**
- Leader thread selection
- Follower thread pool
- Handle Set for event sources
- Thread promotion mechanism

**Use Cases:**
- High-performance event processing
- Network servers
- Event-driven systems
- Message queues

### 18. ThreadPool.js (697 lines)
**Purpose:** Manages a pool of worker threads to execute tasks concurrently with controlled resource usage.

**Key Components:**
- Work Queue
- Worker threads
- Task scheduling
- Priority support
- Dynamic resizing
- Scheduled execution

**Use Cases:**
- Parallel task execution
- CPU-intensive operations
- Batch processing
- Image/video processing

## Features

All implementations include:

- **Modern JavaScript:** ES6+ syntax, Promises, async/await
- **Comprehensive Examples:** 5-8 demonstration functions per pattern
- **Event-Driven Architecture:** EventEmitter-based communication
- **Error Handling:** Robust error handling and recovery
- **Statistics & Monitoring:** Built-in performance metrics
- **Production-Ready:** Complete with proper cleanup and resource management
- **Well-Documented:** Extensive comments explaining concepts and usage

## Running the Examples

Each pattern file can be run independently:

```bash
# New patterns
node Scheduler.js
node ReadWriteLock.js
node GuardedSuspension.js
node Balking.js
node DoubleCheckedLocking.js
node ThreadSpecificStorage.js
node WrapperFacade.js
node Promise.js
node PromisePattern.js

# Original patterns
node ReactorPattern.js
node ProactorPattern.js
node AcceptorConnector.js
node ActiveObject.js
node MonitorObject.js
node AsynchronousCompletionToken.js
node HalfSyncHalfAsync.js
node LeaderFollowers.js
node ThreadPool.js
```

## Pattern Relationships

- **Reactor vs Proactor:** Reactor handles synchronous event demultiplexing, Proactor handles asynchronous completion events
- **Acceptor-Connector vs Reactor:** Acceptor-Connector handles connection establishment, Reactor handles event processing
- **Active Object vs Monitor Object:** Active Object decouples execution, Monitor Object synchronizes access
- **Half-Sync/Half-Async vs Leader/Followers:** Both manage concurrency but with different threading models
- **Thread Pool:** Foundation pattern used by many others for concurrent execution

## Dependencies

- Node.js 12+ (for ES6+ features)
- `events` module (built-in)
- `worker_threads` module (built-in, Node.js 10.5+)
- `crypto` module (built-in)

## Best Practices

1. **Choose the Right Pattern:**
   - I/O-heavy: Reactor or Proactor
   - Connection management: Acceptor-Connector
   - Thread-safe objects: Active Object or Monitor Object
   - Context tracking: Asynchronous Completion Token
   - Mixed sync/async: Half-Sync/Half-Async
   - Event processing: Leader/Followers
   - General concurrency: Thread Pool

2. **Performance Considerations:**
   - Monitor resource usage (threads, memory)
   - Tune pool sizes based on workload
   - Use priority queues for critical tasks
   - Implement backpressure mechanisms

3. **Error Handling:**
   - Always handle promise rejections
   - Implement timeout mechanisms
   - Clean up resources on shutdown
   - Log errors for debugging

## License

These implementations are provided for educational purposes demonstrating concurrency design patterns in JavaScript.
