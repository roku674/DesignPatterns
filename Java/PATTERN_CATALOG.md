# Complete Pattern Catalog

This document lists all 225+ design patterns implemented in this repository.

## Table of Contents
- [Gang of Four Patterns (23)](#gang-of-four-patterns-23)
- [Enterprise Application Patterns (51)](#enterprise-application-patterns-51)
- [Concurrency Patterns (17)](#concurrency-patterns-17)
- [Enterprise Integration Patterns (62)](#enterprise-integration-patterns-62)
- [Cloud Design Patterns (42)](#cloud-design-patterns-42)
- [Microservices Patterns (30)](#microservices-patterns-30)

---

## Gang of Four Patterns (23)

### Creational Patterns (5)
1. **Singleton** - Ensure only one instance exists
2. **Factory Method** - Create objects without specifying exact class
3. **Abstract Factory** - Create families of related objects
4. **Builder** - Construct complex objects step by step
5. **Prototype** - Clone existing objects

### Structural Patterns (7)
6. **Adapter** - Make incompatible interfaces work together
7. **Bridge** - Separate abstraction from implementation
8. **Composite** - Compose objects into tree structures
9. **Decorator** - Add responsibilities to objects dynamically
10. **Facade** - Provide simplified interface to complex system
11. **Flyweight** - Share objects to save memory
12. **Proxy** - Control access to objects

### Behavioral Patterns (11)
13. **Chain of Responsibility** - Pass request along chain of handlers
14. **Command** - Encapsulate requests as objects
15. **Interpreter** - Define grammar and interpreter
16. **Iterator** - Access elements sequentially
17. **Mediator** - Encapsulate object interactions
18. **Memento** - Capture and restore object state
19. **Observer** - Notify dependents of state changes
20. **State** - Alter behavior when state changes
21. **Strategy** - Define family of interchangeable algorithms
22. **Template Method** - Define algorithm skeleton
23. **Visitor** - Add operations without changing classes

---

## Enterprise Application Patterns (51)

### Domain Logic Patterns
1. **Transaction Script** - Organizes logic by procedures
2. **Domain Model** - Rich objects with behavior and data
3. **Table Module** - One class per database table
4. **Service Layer** - Application boundary with services

### Data Source Architectural Patterns
5. **Data Mapper** - Maps between objects and database independently
6. **Active Record** - Wraps database row with domain logic
7. **Row Data Gateway** - Gateway to a single record
8. **Table Data Gateway** - Gateway to a database table

### Object-Relational Behavioral Patterns
9. **Data Transfer Object** - Carries data between processes
10. **Repository Pattern** - Mediates between domain and data layers
11. **Unit of Work** - Maintains list of affected objects
12. **Identity Map** - Ensures each object loaded only once
13. **Lazy Load** - Defers initialization until needed

### Object-Relational Lazy Loading Patterns
14. **Virtual Proxy** - Looks like object but loads lazily
15. **Value Holder** - Wraps value for lazy loading
16. **Ghost Object** - Loads partial data first

### Object-Relational Structural Patterns
17. **Domain Object Factory** - Creates domain objects
18. **Identity Field** - Saves database ID in object
19. **Foreign Key Mapping** - Maps associations via foreign keys
20. **Association Table Mapping** - Uses intermediary table
21. **Dependent Mapping** - Maps child objects
22. **Embedded Value** - Maps object into fields
23. **Serialized LOB** - Serializes graph into single field

### Object-Relational Inheritance Patterns
24. **Single Table Inheritance** - Hierarchy to single table
25. **Class Table Inheritance** - Each class to own table
26. **Concrete Table Inheritance** - Each concrete class to table
27. **Inheritance Mappers** - Handles mapping hierarchies

### Object-Relational Metadata Mapping
28. **Gateway** - Encapsulates external access
29. **Mapper** - Separates objects from database
30. **Layer** - Organizes into layers
31. **Separated** - Separates domain from presentation

### Distribution Patterns
32. **Optimistic Offline Lock** - Detects conflicts and rolls back
33. **Pessimistic Offline Lock** - Prevents conflicts with locks
34. **Coarse Grained Lock** - Locks set of objects
35. **Implicit Lock** - Manages locks implicitly

### Session State Patterns
36. **Client Session State** - Stores state on client
37. **Server Session State** - Stores state in server memory
38. **Database Session State** - Stores state in database

### Base Patterns
39. **Money Pattern** - Represents monetary values
40. **Special Case** - Special behavior for particular cases
41. **Plugin** - Links classes during configuration
42. **Record Set** - In-memory tabular data
43. **Query Object** - Represents database query
44. **Registry** - Well-known object for finding services
45. **Value Object** - Value-based equality

### Web Presentation Patterns
46. **Page Controller** - Handles request for specific page
47. **Front Controller** - Central controller for all requests
48. **Application Controller** - Centralizes request processing
49. **Template View** - Embeds markers in HTML
50. **Transform View** - Transforms domain to HTML
51. **Two Step View** - Two-step HTML transformation

---

## Concurrency Patterns (17)

1. **Wrapper Facade** - Encapsulates non-OO API functions
2. **Reactor Pattern** - Handles concurrent service requests
3. **Proactor Pattern** - Handles async operations
4. **Asynchronous Completion Token** - Demuxes async operations
5. **Acceptor** - Decouples passive connection
6. **Connector** - Decouples active connection
7. **Half-Sync/Half-Async** - Decouples async/sync processing
8. **Leader/Followers** - Thread pool with single processor
9. **Monitor Object** - Synchronizes with monitor lock
10. **Active Object** - Decouples execution from invocation
11. **Double-Checked Locking** - Reduces synchronization overhead
12. **Thread Pool** - Manages worker thread pool
13. **Read-Write Lock** - Concurrent reads, exclusive writes
14. **Thread-Specific Storage** - Thread-specific objects
15. **Scheduler** - Manages execution order
16. **Strategy Pattern** - Runtime algorithm selection
17. **Balking** - Executes only in appropriate state

---

## Enterprise Integration Patterns (62)

### Message Construction
1. **Command Message** - Sends command to execute
2. **Document Message** - Transfers data
3. **Event Message** - Notifies about event
4. **Request-Reply** - Sends request, expects reply
5. **Return Address** - Specifies reply destination
6. **Correlation Identifier** - Marks request/reply
7. **Message Sequence** - Transmits in chunks
8. **Message Expiration** - Sets expiration time
9. **Format Indicator** - Indicates message format

### Message Routing
10. **Content-Based Router** - Routes by content
11. **Message Filter** - Removes unwanted messages
12. **Dynamic Router** - Dynamically configured routing
13. **Recipient List** - Routes to recipient list
14. **Splitter** - Breaks into parts
15. **Aggregator** - Combines results
16. **Resequencer** - Converts to correct order
17. **Composed Message Processor** - Processes elements
18. **Scatter-Gather** - Broadcasts and aggregates
19. **Routing Slip** - Routes through dynamic steps
20. **Process Manager** - Routes through steps
21. **Message Broker** - Decouples destination

### Message Transformation
22. **Envelope Wrapper** - Wraps with routing info
23. **Content Enricher** - Adds missing information
24. **Content Filter** - Removes unwanted data
25. **Claim Check** - Uses reference to stored data
26. **Normalizer** - Routes through translator
27. **Canonical Data Model** - Common data model

### Messaging Endpoints
28. **Messaging Gateway** - Encapsulates messaging access
29. **Messaging Mapper** - Moves data to/from messages
30. **Transactional Client** - Controls transactions
31. **Polling Consumer** - Explicitly polls
32. **Event-Driven Consumer** - Automatically consumes
33. **Competing Consumers** - Multiple consumers compete
34. **Message Dispatcher** - Distributes messages
35. **Selective Consumer** - Filters at consumer
36. **Durable Subscriber** - Maintains subscription
37. **Idempotent Receiver** - Handles duplicates
38. **Service Activator** - Invokes service on message

### Message Channels
39. **Point-to-Point Channel** - One receiver
40. **Publish-Subscribe Channel** - All subscribers
41. **Datatype Channel** - Separate channels per type
42. **Invalid Message Channel** - Unprocessable messages
43. **Dead Letter Channel** - Undeliverable messages
44. **Guaranteed Delivery** - Ensures delivery
45. **Channel Adapter** - Connects to messaging
46. **Messaging Bridge** - Connects systems
47. **Message Bus** - Enables application collaboration

### System Management
48. **Control Bus** - Manages messaging system
49. **Detour** - Routes through intermediate steps
50. **Wire Tap** - Inspects without affecting
51. **Message Store** - Stores for future retrieval
52. **Smart Proxy** - Tracks message delivery
53. **Test Message** - Tests messaging system
54. **Channel Purger** - Removes unwanted messages
55. **Message History** - Tracks through system
56. **Message Router** - Routes to destinations
57. **Content-Based Filter** - Filters by content
58. **Header Enricher** - Adds headers
59. **Priority Channel** - Prioritizes messages
60. **Data Type Transformer** - Transforms types
61. **Claim Check Transformer** - Implements claim check
62. **Sampling Filter** - Samples subset

---

## Cloud Design Patterns (42)

### Design and Implementation
1. **Ambassador** - Helper services for network requests
2. **Anti-Corruption** - Façade between new/legacy
3. **Backends for Frontends** - Separate backends per frontend
4. **Bulkhead** - Isolates to prevent cascade failures
5. **Cache-Aside** - Loads data on demand to cache
6. **Choreography** - Lets services react to events
7. **Circuit Breaker** - Handles variable recovery faults
8. **Claim Check** - Splits large messages
9. **Compensating Transaction** - Undoes work
10. **Competing Consumers** - Multiple concurrent consumers

### Data Management
11. **Compute Resource Consolidation** - Consolidates tasks
12. **CQRS** - Segregates read/write operations
13. **Deployment Stamps** - Deploys independent copies
14. **Event Sourcing** - Append-only event store
15. **External Configuration Store** - Centralized config
16. **Federated Identity** - External identity provider

### Messaging
17. **Gatekeeper** - Protects using dedicated host
18. **Gateway Aggregation** - Aggregates to multiple services
19. **Gateway Offloading** - Offloads shared functionality
20. **Gateway Routing** - Routes using single endpoint
21. **Geode** - Deploys to geographical nodes

### Monitoring and Health
22. **Health Endpoint Monitoring** - Implements health checks
23. **Index Table** - Creates indexes over fields
24. **Leader Election** - Elects leader for coordination
25. **Materialized View** - Prepopulated views

### Performance and Scalability
26. **Pipes and Filters** - Reusable processing components
27. **Priority Queue** - Prioritizes requests
28. **Publisher-Subscriber** - Async via messaging
29. **Queue-Based Load Leveling** - Queue as buffer
30. **Retry** - Handles transient failures

### Reliability
31. **Scheduler Agent Supervisor** - Coordinates distributed actions
32. **Sharding** - Horizontal data partitions
33. **Sidecar** - Helper components alongside app
34. **Static Content Hosting** - Cloud-based static content
35. **Strangler Fig** - Incrementally migrates legacy

### Security
36. **Throttling** - Controls resource consumption
37. **Valet Key** - Token for restricted access
38. **Backpressure** - Handles overload
39. **Bulkhead Isolation** - Isolates critical resources
40. **Fan-Out** - Distributes work
41. **Saga** - Manages distributed transactions
42. **Timeout** - Sets time limits

---

## Microservices Patterns (30)

### Service Collaboration
1. **API Gateway** - Single entry point
2. **Service Registry** - Central registry for discovery
3. **Circuit Breaker** - Prevents cascading failures
4. **Saga** - Distributed transaction management
5. **Event-Driven Architecture** - Event-based communication

### Data Management
6. **CQRS** - Read/write separation
7. **Event Sourcing** - State as event sequence
8. **Database Per Service** - Each service owns database
9. **Shared Database** - Multiple services share DB
10. **API Composition** - Composes data from services

### Integration
11. **Strangler** - Incrementally replaces legacy
12. **Anti-Corruption Layer** - Isolates subsystems
13. **Service Mesh** - Service-to-service communication
14. **Sidecar** - Components alongside services
15. **Backend for Frontend** - Separate backends per client

### Discovery
16. **Client-Side Load Balancing** - Client selects instance
17. **Server-Side Load Balancing** - Load balancer selects
18. **Service Discovery** - Automatically detects instances
19. **Self Registration** - Service registers itself
20. **Third-Party Registration** - External registration

### Communication
21. **Remote Procedure Invocation** - RPC-based communication
22. **Messaging** - Async messaging
23. **Domain Event** - Communicates state changes
24. **Transactional Outbox** - Reliable event publishing
25. **Transaction Log Tailing** - Publishes via log tailing
26. **Polling** - Periodically polls for changes

### Testing
27. **Contract Testing** - Tests service contracts
28. **Consumer-Driven Contract** - Consumers define contracts
29. **Service Component** - Tests in isolation
30. **Deployment Pattern** - Deployment strategies

---

## Pattern Selection Guide

### By Problem Domain

**Building Web Applications?**
- Start with: Service Layer, Repository, Domain Model
- Add: API Gateway, CQRS, Event Sourcing

**Building Microservices?**
- Start with: API Gateway, Service Registry, Circuit Breaker
- Add: Saga, Event-Driven Architecture, CQRS

**Handling Concurrency?**
- Start with: Thread Pool, Monitor Object
- Add: Active Object, Read-Write Lock

**Integrating Systems?**
- Start with: Message Router, Message Filter
- Add: Aggregator, Splitter, Content-Based Router

**Building Cloud Applications?**
- Start with: Circuit Breaker, Retry, Cache-Aside
- Add: Bulkhead, Queue-Based Load Leveling, CQRS

### By Characteristics

**Need Resilience?**
- Circuit Breaker, Bulkhead, Retry, Timeout, Compensating Transaction

**Need Scalability?**
- Sharding, CQRS, Event Sourcing, Cache-Aside, Competing Consumers

**Need Performance?**
- Cache-Aside, Materialized View, Index Table, Thread Pool

**Need Maintainability?**
- Domain Model, Repository, Service Layer, CQRS

---

## Learning Path

### Beginner
1. Start with GoF patterns (23 patterns)
2. Focus on Creational and Structural first
3. Then learn Behavioral patterns

### Intermediate
1. Enterprise Application Patterns (51 patterns)
2. Focus on Repository, Service Layer, Domain Model
3. Learn data access patterns

### Advanced
1. Cloud Design Patterns (42 patterns)
2. Microservices Patterns (30 patterns)
3. Integration Patterns (62 patterns)
4. Concurrency Patterns (17 patterns)

---

## References

- **Design Patterns** by Gang of Four
- **Patterns of Enterprise Application Architecture** by Martin Fowler
- **Enterprise Integration Patterns** by Gregor Hohpe
- **Cloud Design Patterns** by Microsoft Azure
- **Microservices Patterns** by Chris Richardson
- **Pattern-Oriented Software Architecture** (POSA)

---

**Total: 225 Patterns Implemented**
- Gang of Four: 23
- Enterprise: 51
- Concurrency: 17
- Integration: 62
- Cloud: 42
- Microservices: 30
