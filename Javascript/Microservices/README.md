# JavaScript Microservices Design Patterns

This directory contains comprehensive implementations of 10 essential microservices patterns in JavaScript, each with 500-700+ lines of production-ready code.

## Patterns Implemented

### 1. LogAggregation.js (508 lines)
**Purpose**: Centralize logging from multiple microservices into a single aggregation point.

**Key Features**:
- Structured log entries with correlation IDs
- Log producers for individual services
- Batch log shipping with configurable intervals
- Centralized log aggregator with indexing
- Query service for log search and analysis
- Alert monitoring for errors
- Statistics and reporting

**Components**:
- `LogEntry`: Structured log records
- `LogProducer`: Generates logs from services
- `LogShipper`: Batches and transports logs
- `LogAggregator`: Centralizes log collection
- `LogQueryService`: Advanced search capabilities

**Run Demo**: `node LogAggregation.js`

---

### 2. ApplicationEvents.js (579 lines)
**Purpose**: Enable loose coupling between microservices through event-driven communication.

**Key Features**:
- Domain event publishing and subscription
- Event bus for routing events
- Event store for persistence
- Event projections for materialized views
- Correlation tracking across services
- Dead letter queue handling

**Components**:
- `DomainEvent`: Immutable event records
- `EventBus`: Routes events to subscribers
- `EventPublisher`: Service event emission
- `EventSubscriber`: Service event handling
- `EventStore`: Persistent event storage
- `EventProjection`: Builds views from events

**Run Demo**: `node ApplicationEvents.js`

---

### 3. AsyncMessaging.js (608 lines)
**Purpose**: Reliable, decoupled communication using message queues.

**Key Features**:
- Message queues with priority support
- Message broker with exchange routing
- Producer/consumer pattern
- Request-reply pattern
- Message expiration (TTL)
- Retry and dead letter queues
- Multiple routing strategies (direct, fanout, topic)

**Components**:
- `Message`: Communication unit with metadata
- `MessageQueue`: FIFO buffer with priorities
- `MessageBroker`: Manages queues and routing
- `MessageProducer`: Sends messages
- `MessageConsumer`: Receives and processes messages
- `RequestReplyClient`: Synchronous request pattern

**Run Demo**: `node AsyncMessaging.js`

---

### 4. DatabasePerService.js (738 lines)
**Purpose**: Each microservice has its own private database ensuring complete data isolation.

**Key Features**:
- Private database per service
- Service-specific data access layers
- Event-driven data synchronization
- Independent schema evolution
- Transaction management
- Event routing between services

**Components**:
- `Database`: Abstract database interface
- `Collection`: Table/collection representation
- `ServiceWithDatabase`: Service with private DB
- `EventRouter`: Coordinates inter-service events
- Example services: User, Order, Payment, Inventory

**Run Demo**: `node DatabasePerService.js`

---

### 5. DatabaseperService.js (685 lines)
**Purpose**: Advanced database per service with data replication and eventual consistency.

**Key Features**:
- Change data capture (CDC)
- Data replication across services
- Eventual consistency patterns
- Materialized views for cross-service queries
- Data synchronization engine
- Consistency monitoring

**Components**:
- `ChangeDataCapture`: Tracks database changes
- `ReplicatedDataStore`: Local copies of foreign data
- `DataSynchronizer`: Keeps replicas current
- `MaterializedView`: Pre-computed queries
- `EnhancedService`: Service with replication support

**Run Demo**: `node DatabaseperService.js`

---

### 6. SharedDatabase.js (742 lines)
**Purpose**: Multiple microservices share a single database with proper isolation.

**Key Features**:
- Multi-tenant data isolation
- Schema ownership management
- Transaction coordination
- Access control per service
- Database access layers
- Audit logging

**Components**:
- `SharedDatabase`: Central database
- `DatabaseAccessLayer`: Service-specific access
- `ServiceWithSharedDatabase`: Base service class
- `MultiTenantContextManager`: Tenant isolation
- Example services: User Management, Orders, Products

**Run Demo**: `node SharedDatabase.js`

---

### 7. Saga.js (610 lines)
**Purpose**: Manage distributed transactions using orchestration-based saga pattern.

**Key Features**:
- Saga step definitions with compensations
- Central saga coordinator
- Automatic compensation on failure
- Saga state tracking
- Event emission for monitoring
- Transaction history

**Components**:
- `SagaStep`: Individual transaction step
- `SagaDefinition`: Workflow definition
- `SagaInstance`: Running saga execution
- `SagaCoordinator`: Manages saga lifecycle
- Example: E-commerce order processing saga

**Run Demo**: `node Saga.js`

---

### 8. SagaMS.js (667 lines)
**Purpose**: Choreography-based saga implementation across microservices.

**Key Features**:
- Event-driven choreography (no central coordinator)
- Distributed saga state tracking
- Service-to-service event reactions
- Compensation events
- Saga monitoring and tracing
- Decentralized decision making

**Components**:
- `SagaEvent`: Domain event with saga context
- `DistributedEventBus`: Decentralized event routing
- `SagaStateTracker`: Per-service saga state
- `SagaParticipantService`: Base for saga services
- `SagaMonitor`: Cross-service saga tracking

**Run Demo**: `node SagaMS.js`

---

### 9. CQRS.js (701 lines)
**Purpose**: Separate read and write operations into different models.

**Key Features**:
- Command/Query separation
- Event sourcing integration
- Aggregate root pattern
- Read model projections
- Command and query buses
- Event store with snapshots

**Components**:
- `Command`: Write operation intent
- `Query`: Read operation request
- `CommandBus`: Routes commands to handlers
- `QueryBus`: Routes queries to handlers
- `EventStore`: Stores domain events
- `ProjectionEngine`: Builds read models
- `AggregateRoot`: Domain model base class

**Run Demo**: `node CQRS.js`

---

### 10. CQRSMS.js (659 lines)
**Purpose**: CQRS across multiple microservices with separate read/write services.

**Key Features**:
- Separate command and query services
- Distributed event store
- Multiple specialized read services
- Event-driven synchronization
- API gateway for routing
- Service message bus

**Components**:
- `CommandService`: Handles all writes
- `QueryService`: Handles all reads
- `DistributedEventStore`: Shared event storage
- `MessageBus`: Inter-service communication
- `APIGateway`: Routes requests to services
- `SimpleReadModel`: Optimized read storage

**Run Demo**: `node CQRSMS.js`

---

## Pattern Categories

### Communication Patterns
- **LogAggregation**: Monitoring and observability
- **ApplicationEvents**: Event-driven architecture
- **AsyncMessaging**: Asynchronous communication

### Data Management Patterns
- **DatabasePerService**: Data isolation
- **DatabaseperService**: Advanced replication
- **SharedDatabase**: Shared data with isolation

### Transaction Patterns
- **Saga**: Orchestrated distributed transactions
- **SagaMS**: Choreographed distributed transactions

### Architectural Patterns
- **CQRS**: Command/Query separation
- **CQRSMS**: Distributed CQRS

## Common Features

All patterns include:
- ✅ 500-700+ lines of code
- ✅ Comprehensive documentation
- ✅ Working demonstration examples
- ✅ Logging infrastructure
- ✅ Event-driven messaging
- ✅ Error handling
- ✅ Statistics and monitoring
- ✅ Production-ready structure

## Running the Demos

Each pattern file can be run independently:

```bash
# Test individual patterns
node LogAggregation.js
node ApplicationEvents.js
node AsyncMessaging.js
node DatabasePerService.js
node DatabaseperService.js
node SharedDatabase.js
node Saga.js
node SagaMS.js
node CQRS.js
node CQRSMS.js
```

## Key Concepts Demonstrated

### Event Sourcing
- Event stores track all state changes
- Events are immutable records
- State rebuilt from event history
- Implemented in: ApplicationEvents, CQRS, CQRSMS

### Event-Driven Architecture
- Services communicate via events
- Loose coupling between services
- Asynchronous processing
- Implemented in: All patterns

### Distributed Transactions
- Saga pattern for long transactions
- Compensation for rollback
- Both orchestration and choreography
- Implemented in: Saga, SagaMS

### Data Isolation
- Each service owns its data
- Data replication for queries
- Eventual consistency
- Implemented in: DatabasePerService, DatabaseperService

### Command Query Responsibility Segregation
- Separate read and write models
- Optimized for different purposes
- Independent scaling
- Implemented in: CQRS, CQRSMS

## Architecture Benefits

1. **Scalability**: Independent service scaling
2. **Resilience**: Fault isolation and recovery
3. **Flexibility**: Technology diversity per service
4. **Maintainability**: Clear service boundaries
5. **Observability**: Comprehensive logging and monitoring

## Best Practices Implemented

- ✅ Correlation IDs for request tracing
- ✅ Event versioning for schema evolution
- ✅ Dead letter queues for failed messages
- ✅ Idempotency for reliable processing
- ✅ Circuit breakers for fault tolerance
- ✅ Health checks and monitoring
- ✅ Structured logging
- ✅ Event sourcing and CQRS

## Production Considerations

When implementing these patterns in production:

1. **Persistence**: Replace in-memory stores with databases
2. **Message Brokers**: Use RabbitMQ, Kafka, or similar
3. **Service Discovery**: Implement service registry
4. **API Gateway**: Use Kong, Nginx, or cloud solutions
5. **Monitoring**: Integrate with Prometheus, Grafana
6. **Tracing**: Add distributed tracing (Jaeger, Zipkin)
7. **Security**: Implement authentication and authorization
8. **Testing**: Add unit, integration, and contract tests

## Further Reading

- Microservices Patterns by Chris Richardson
- Building Microservices by Sam Newman
- Domain-Driven Design by Eric Evans
- Enterprise Integration Patterns by Gregor Hohpe

## License

MIT License - See main repository LICENSE file
