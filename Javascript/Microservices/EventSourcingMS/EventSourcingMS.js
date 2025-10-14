/**
 * Event Sourcing for Microservices Pattern
 *
 * Implements event sourcing specifically designed for microservices architecture.
 * Combines event sourcing with message bus, event publishing, and inter-service communication.
 *
 * Key Components:
 * - Event Store: Persistent storage for events
 * - Message Bus: Publish events to other microservices
 * - Event Projections: Create read models from events
 * - Saga Coordinator: Handle distributed transactions
 * - Event Versioning: Handle schema evolution
 */

const EventEmitter = require('events');

/**
 * Versioned Event - supports schema evolution
 */
class VersionedEvent {
  constructor(type, aggregateId, version, data, metadata = {}) {
    this.eventId = this.generateEventId();
    this.type = type;
    this.aggregateId = aggregateId;
    this.aggregateType = metadata.aggregateType || 'Unknown';
    this.version = version;
    this.schemaVersion = metadata.schemaVersion || 1;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.metadata = {
      userId: metadata.userId || 'system',
      correlationId: metadata.correlationId || this.eventId,
      causationId: metadata.causationId || this.eventId,
      serviceName: metadata.serviceName || 'unknown-service',
      ...metadata
    };
  }

  generateEventId() {
    return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Upgrade event to newer schema version
   */
  upgrade(upgrader) {
    if (upgrader[this.schemaVersion]) {
      const upgradedData = upgrader[this.schemaVersion](this.data);
      return new VersionedEvent(
        this.type,
        this.aggregateId,
        this.version,
        upgradedData,
        { ...this.metadata, schemaVersion: this.schemaVersion + 1 }
      );
    }
    return this;
  }

  toJSON() {
    return {
      eventId: this.eventId,
      type: this.type,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      version: this.version,
      schemaVersion: this.schemaVersion,
      data: this.data,
      timestamp: this.timestamp,
      metadata: this.metadata
    };
  }
}

/**
 * Message Bus for inter-service communication
 */
class MessageBus extends EventEmitter {
  constructor() {
    super();
    this.topics = new Map();
    this.deadLetterQueue = [];
    this.retryPolicy = {
      maxRetries: 3,
      backoffMs: 1000
    };
  }

  /**
   * Publish event to topic
   */
  async publish(topic, event) {
    console.log(`Publishing to topic '${topic}':`, event.type);

    // Store in topic history
    if (!this.topics.has(topic)) {
      this.topics.set(topic, []);
    }
    this.topics.get(topic).push(event);

    // Emit to subscribers
    this.emit(topic, event);
    this.emit('*', { topic, event });
  }

  /**
   * Subscribe to topic
   */
  subscribe(topic, handler, options = {}) {
    const wrappedHandler = async (event) => {
      let retries = 0;
      while (retries <= this.retryPolicy.maxRetries) {
        try {
          await handler(event);
          return;
        } catch (error) {
          retries++;
          if (retries > this.retryPolicy.maxRetries) {
            console.error(`Handler failed after ${retries} retries:`, error);
            this.deadLetterQueue.push({ topic, event, error: error.message });
            return;
          }
          await this.delay(this.retryPolicy.backoffMs * retries);
        }
      }
    };

    this.on(topic, wrappedHandler);
    return () => this.off(topic, wrappedHandler);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getDeadLetterQueue() {
    return [...this.deadLetterQueue];
  }

  clearDeadLetterQueue() {
    this.deadLetterQueue = [];
  }
}

/**
 * Microservice Event Store with partitioning
 */
class MicroserviceEventStore {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.partitions = new Map(); // partitionKey -> events[]
    this.globalLog = []; // All events across partitions
    this.snapshots = new Map();
    this.messageBus = new MessageBus();
    this.projections = new Map();
    this.eventUpgraders = new Map();
  }

  /**
   * Append events with partitioning support
   */
  async appendEvents(aggregateId, expectedVersion, events, partitionKey = null) {
    const partition = partitionKey || this.getPartitionKey(aggregateId);

    if (!this.partitions.has(partition)) {
      this.partitions.set(partition, new Map());
    }

    const partitionData = this.partitions.get(partition);
    const aggregateEvents = partitionData.get(aggregateId) || [];

    // Optimistic concurrency check
    if (aggregateEvents.length !== expectedVersion) {
      throw new Error(
        `Concurrency conflict on ${aggregateId}: ` +
        `Expected v${expectedVersion}, found v${aggregateEvents.length}`
      );
    }

    // Append and publish events
    for (const event of events) {
      aggregateEvents.push(event);
      this.globalLog.push(event);

      // Publish to message bus
      await this.messageBus.publish(event.type, event);
      await this.messageBus.publish('domain-events', event);

      // Update projections
      await this.updateProjections(event);
    }

    partitionData.set(aggregateId, aggregateEvents);
    return aggregateEvents.length;
  }

  /**
   * Get partition key for aggregate
   */
  getPartitionKey(aggregateId) {
    // Simple hash-based partitioning
    const hash = aggregateId.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    return `partition-${Math.abs(hash) % 4}`;
  }

  /**
   * Get events for aggregate with schema upgrade
   */
  async getEvents(aggregateId, fromVersion = 0, partitionKey = null) {
    const partition = partitionKey || this.getPartitionKey(aggregateId);
    const partitionData = this.partitions.get(partition);

    if (!partitionData) {
      return [];
    }

    const events = partitionData.get(aggregateId) || [];
    const slicedEvents = events.slice(fromVersion);

    // Upgrade events if needed
    return slicedEvents.map(event => {
      const upgrader = this.eventUpgraders.get(event.type);
      return upgrader ? event.upgrade(upgrader) : event;
    });
  }

  /**
   * Register event schema upgrader
   */
  registerEventUpgrader(eventType, upgrader) {
    this.eventUpgraders.set(eventType, upgrader);
  }

  /**
   * Create and register projection
   */
  registerProjection(name, projection) {
    this.projections.set(name, {
      state: projection.initialState || {},
      handler: projection.handler
    });
  }

  /**
   * Update all projections with new event
   */
  async updateProjections(event) {
    for (const [name, projection] of this.projections) {
      try {
        projection.state = await projection.handler(projection.state, event);
      } catch (error) {
        console.error(`Error updating projection '${name}':`, error);
      }
    }
  }

  /**
   * Get projection state
   */
  getProjection(name) {
    const projection = this.projections.get(name);
    return projection ? projection.state : null;
  }

  /**
   * Rebuild projection from scratch
   */
  async rebuildProjection(name) {
    const projection = this.projections.get(name);
    if (!projection) {
      throw new Error(`Projection '${name}' not found`);
    }

    projection.state = projection.initialState || {};

    for (const event of this.globalLog) {
      projection.state = await projection.handler(projection.state, event);
    }

    return projection.state;
  }

  /**
   * Get events across all partitions
   */
  async getAllEvents(filter = {}) {
    let events = [...this.globalLog];

    if (filter.type) {
      events = events.filter(e => e.type === filter.type);
    }
    if (filter.aggregateType) {
      events = events.filter(e => e.aggregateType === filter.aggregateType);
    }
    if (filter.since) {
      events = events.filter(e => new Date(e.timestamp) >= new Date(filter.since));
    }

    return events;
  }

  /**
   * Create snapshot
   */
  async createSnapshot(aggregateId, state) {
    const events = await this.getEvents(aggregateId);
    const snapshot = {
      aggregateId,
      version: events.length,
      state,
      timestamp: new Date().toISOString()
    };
    this.snapshots.set(aggregateId, snapshot);
    return snapshot;
  }

  /**
   * Get snapshot
   */
  async getSnapshot(aggregateId) {
    return this.snapshots.get(aggregateId);
  }
}

/**
 * Saga Coordinator for distributed transactions
 */
class SagaCoordinator {
  constructor(eventStore) {
    this.eventStore = eventStore;
    this.sagas = new Map();
    this.activeSagas = new Map();
  }

  /**
   * Register a saga
   */
  registerSaga(sagaName, sagaDefinition) {
    this.sagas.set(sagaName, sagaDefinition);

    // Subscribe to saga trigger events
    for (const triggerEvent of sagaDefinition.triggers) {
      this.eventStore.messageBus.subscribe(triggerEvent, async (event) => {
        await this.startSaga(sagaName, event);
      });
    }
  }

  /**
   * Start saga execution
   */
  async startSaga(sagaName, triggerEvent) {
    const sagaDefinition = this.sagas.get(sagaName);
    if (!sagaDefinition) {
      throw new Error(`Saga '${sagaName}' not found`);
    }

    const sagaId = `saga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sagaInstance = {
      id: sagaId,
      name: sagaName,
      state: 'running',
      currentStep: 0,
      data: {},
      startedAt: new Date().toISOString(),
      triggerEvent
    };

    this.activeSagas.set(sagaId, sagaInstance);

    try {
      await this.executeSagaSteps(sagaInstance, sagaDefinition);
      sagaInstance.state = 'completed';
      sagaInstance.completedAt = new Date().toISOString();
    } catch (error) {
      sagaInstance.state = 'failed';
      sagaInstance.error = error.message;
      await this.compensateSaga(sagaInstance, sagaDefinition);
    }

    return sagaInstance;
  }

  /**
   * Execute saga steps
   */
  async executeSagaSteps(sagaInstance, sagaDefinition) {
    for (let i = 0; i < sagaDefinition.steps.length; i++) {
      sagaInstance.currentStep = i;
      const step = sagaDefinition.steps[i];

      const result = await step.action(sagaInstance.data, sagaInstance.triggerEvent);
      sagaInstance.data = { ...sagaInstance.data, ...result };
    }
  }

  /**
   * Compensate saga on failure
   */
  async compensateSaga(sagaInstance, sagaDefinition) {
    console.log(`Compensating saga ${sagaInstance.id}...`);

    // Execute compensation in reverse order
    for (let i = sagaInstance.currentStep; i >= 0; i--) {
      const step = sagaDefinition.steps[i];
      if (step.compensation) {
        try {
          await step.compensation(sagaInstance.data, sagaInstance.triggerEvent);
        } catch (error) {
          console.error(`Compensation failed for step ${i}:`, error);
        }
      }
    }

    sagaInstance.state = 'compensated';
  }

  /**
   * Get active sagas
   */
  getActiveSagas() {
    return Array.from(this.activeSagas.values());
  }
}

/**
 * Example: Order Service using Event Sourcing
 */
class OrderService {
  constructor(serviceName = 'order-service') {
    this.eventStore = new MicroserviceEventStore(serviceName);
    this.sagaCoordinator = new SagaCoordinator(this.eventStore);
    this.setupProjections();
    this.setupSagas();
  }

  /**
   * Setup read model projections
   */
  setupProjections() {
    // Order summary projection
    this.eventStore.registerProjection('order-summary', {
      initialState: { totalOrders: 0, totalRevenue: 0, orders: [] },
      handler: async (state, event) => {
        switch (event.type) {
          case 'OrderCreated':
            return {
              ...state,
              totalOrders: state.totalOrders + 1,
              orders: [...state.orders, {
                id: event.aggregateId,
                customerId: event.data.customerId,
                total: event.data.total,
                status: 'pending'
              }]
            };

          case 'OrderCompleted':
            return {
              ...state,
              totalRevenue: state.totalRevenue + event.data.total,
              orders: state.orders.map(o =>
                o.id === event.aggregateId ? { ...o, status: 'completed' } : o
              )
            };

          case 'OrderCancelled':
            return {
              ...state,
              orders: state.orders.map(o =>
                o.id === event.aggregateId ? { ...o, status: 'cancelled' } : o
              )
            };

          default:
            return state;
        }
      }
    });
  }

  /**
   * Setup sagas for distributed transactions
   */
  setupSagas() {
    this.sagaCoordinator.registerSaga('order-fulfillment', {
      triggers: ['OrderCreated'],
      steps: [
        {
          action: async (data, event) => {
            console.log(`Step 1: Reserve inventory for order ${event.aggregateId}`);
            return { inventoryReserved: true };
          },
          compensation: async (data) => {
            console.log('Compensation: Release inventory reservation');
          }
        },
        {
          action: async (data, event) => {
            console.log(`Step 2: Process payment for order ${event.aggregateId}`);
            return { paymentProcessed: true };
          },
          compensation: async (data) => {
            console.log('Compensation: Refund payment');
          }
        },
        {
          action: async (data, event) => {
            console.log(`Step 3: Ship order ${event.aggregateId}`);
            return { orderShipped: true };
          },
          compensation: async (data) => {
            console.log('Compensation: Cancel shipment');
          }
        }
      ]
    });
  }

  /**
   * Create order
   */
  async createOrder(orderId, customerId, items, total) {
    const event = new VersionedEvent(
      'OrderCreated',
      orderId,
      0,
      { customerId, items, total },
      { aggregateType: 'Order', serviceName: this.eventStore.serviceName }
    );

    await this.eventStore.appendEvents(orderId, 0, [event]);
    return orderId;
  }

  /**
   * Complete order
   */
  async completeOrder(orderId) {
    const events = await this.eventStore.getEvents(orderId);
    const currentVersion = events.length;

    const event = new VersionedEvent(
      'OrderCompleted',
      orderId,
      currentVersion,
      { completedAt: new Date().toISOString(), total: events[0].data.total },
      { aggregateType: 'Order', serviceName: this.eventStore.serviceName }
    );

    await this.eventStore.appendEvents(orderId, currentVersion, [event]);
  }

  /**
   * Get order summary
   */
  getOrderSummary() {
    return this.eventStore.getProjection('order-summary');
  }
}

/**
 * Demo function
 */
async function demonstrateEventSourcingMS() {
  console.log('=== Event Sourcing for Microservices Demo ===\n');

  // Create order service
  const orderService = new OrderService();

  // Subscribe to events
  orderService.eventStore.messageBus.subscribe('OrderCreated', (event) => {
    console.log(`Order created: ${event.aggregateId}`);
  });

  orderService.eventStore.messageBus.subscribe('OrderCompleted', (event) => {
    console.log(`Order completed: ${event.aggregateId}`);
  });

  // Create orders
  console.log('Creating orders...\n');
  await orderService.createOrder('ORD-001', 'CUST-001', ['item1', 'item2'], 100);
  await orderService.createOrder('ORD-002', 'CUST-002', ['item3'], 50);
  await orderService.createOrder('ORD-003', 'CUST-001', ['item4', 'item5'], 150);

  // Complete orders
  console.log('\nCompleting orders...\n');
  await orderService.completeOrder('ORD-001');
  await orderService.completeOrder('ORD-002');

  // View projection
  console.log('\nOrder Summary Projection:');
  console.log(JSON.stringify(orderService.getOrderSummary(), null, 2));

  // View active sagas
  console.log('\nActive Sagas:');
  const sagas = orderService.sagaCoordinator.getActiveSagas();
  console.log(`Total sagas executed: ${sagas.length}`);

  // View events across partitions
  console.log('\nAll Events:');
  const allEvents = await orderService.eventStore.getAllEvents();
  allEvents.forEach((event, index) => {
    console.log(`${index + 1}. [${event.type}] ${event.aggregateId} at ${event.timestamp}`);
  });

  return orderService;
}

// Export components
module.exports = {
  VersionedEvent,
  MessageBus,
  MicroserviceEventStore,
  SagaCoordinator,
  OrderService,
  demonstrateEventSourcingMS
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateEventSourcingMS()
    .then(() => console.log('\n✅ Event Sourcing MS demo completed'))
    .catch(error => console.error('❌ Error:', error));
}
