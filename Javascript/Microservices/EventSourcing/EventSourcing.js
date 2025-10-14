/**
 * Event Sourcing Pattern
 *
 * Persists the state of an entity as a sequence of state-changing events.
 * Instead of storing just the current state, stores the full history of events
 * that led to the current state. The current state can be rebuilt by replaying events.
 *
 * Key Components:
 * - Event Store: Append-only database of events
 * - Event: Immutable fact that something happened
 * - Aggregate: Entity whose state is derived from events
 * - Snapshots: Performance optimization for long event histories
 * - Event Replay: Reconstructing state from events
 */

/**
 * Represents an immutable domain event
 */
class DomainEvent {
  constructor(type, aggregateId, data, metadata = {}) {
    this.eventId = this.generateEventId();
    this.type = type;
    this.aggregateId = aggregateId;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.version = metadata.version || 1;
    this.metadata = {
      userId: metadata.userId || 'system',
      correlationId: metadata.correlationId || this.eventId,
      causationId: metadata.causationId || this.eventId,
      ...metadata
    };
  }

  generateEventId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      eventId: this.eventId,
      type: this.type,
      aggregateId: this.aggregateId,
      data: this.data,
      timestamp: this.timestamp,
      version: this.version,
      metadata: this.metadata
    };
  }
}

/**
 * Event Store - Append-only storage for events
 */
class EventStore {
  constructor() {
    this.events = new Map(); // aggregateId -> events[]
    this.globalEventLog = []; // All events in order
    this.snapshots = new Map(); // aggregateId -> snapshot
    this.subscribers = new Map(); // eventType -> handlers[]
    this.snapshotInterval = 100; // Create snapshot every N events
  }

  /**
   * Append events to the store
   */
  async appendEvents(aggregateId, expectedVersion, events) {
    const existingEvents = this.events.get(aggregateId) || [];

    // Optimistic concurrency control
    if (existingEvents.length !== expectedVersion) {
      throw new Error(
        `Concurrency conflict: Expected version ${expectedVersion}, ` +
        `but found ${existingEvents.length}`
      );
    }

    // Append events
    for (const event of events) {
      existingEvents.push(event);
      this.globalEventLog.push(event);

      // Publish event to subscribers
      await this.publishEvent(event);
    }

    this.events.set(aggregateId, existingEvents);

    // Create snapshot if needed
    if (existingEvents.length % this.snapshotInterval === 0) {
      await this.createSnapshot(aggregateId);
    }

    return existingEvents.length;
  }

  /**
   * Get all events for an aggregate
   */
  async getEvents(aggregateId, fromVersion = 0) {
    const events = this.events.get(aggregateId) || [];
    return events.slice(fromVersion);
  }

  /**
   * Get events from a specific point in time
   */
  async getEventsSince(timestamp) {
    return this.globalEventLog.filter(event =>
      new Date(event.timestamp) >= new Date(timestamp)
    );
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType) {
    return this.globalEventLog.filter(event => event.type === eventType);
  }

  /**
   * Subscribe to events
   */
  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(handler);
  }

  /**
   * Publish event to subscribers
   */
  async publishEvent(event) {
    const handlers = this.subscribers.get(event.type) || [];
    const allHandlers = this.subscribers.get('*') || [];

    for (const handler of [...handlers, ...allHandlers]) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }
  }

  /**
   * Create snapshot for aggregate
   */
  async createSnapshot(aggregateId) {
    const events = this.events.get(aggregateId) || [];
    if (events.length === 0) return;

    const snapshot = {
      aggregateId,
      version: events.length,
      timestamp: new Date().toISOString(),
      state: null // Will be set by aggregate
    };

    this.snapshots.set(aggregateId, snapshot);
    return snapshot;
  }

  /**
   * Get snapshot for aggregate
   */
  async getSnapshot(aggregateId) {
    return this.snapshots.get(aggregateId);
  }

  /**
   * Get aggregate version
   */
  async getAggregateVersion(aggregateId) {
    const events = this.events.get(aggregateId) || [];
    return events.length;
  }

  /**
   * Get all events (for debugging/analysis)
   */
  async getAllEvents() {
    return [...this.globalEventLog];
  }

  /**
   * Get event statistics
   */
  getStatistics() {
    const aggregateCount = this.events.size;
    const eventCount = this.globalEventLog.length;
    const snapshotCount = this.snapshots.size;

    const eventTypeDistribution = this.globalEventLog.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    return {
      aggregateCount,
      eventCount,
      snapshotCount,
      eventTypeDistribution,
      averageEventsPerAggregate: aggregateCount > 0
        ? (eventCount / aggregateCount).toFixed(2)
        : 0
    };
  }
}

/**
 * Base class for event-sourced aggregates
 */
class EventSourcedAggregate {
  constructor(id) {
    this.id = id;
    this.version = 0;
    this.uncommittedEvents = [];
  }

  /**
   * Apply an event to update state
   */
  apply(event) {
    this.version++;
    this.when(event);
    this.uncommittedEvents.push(event);
  }

  /**
   * Override this to handle events
   */
  when(event) {
    const handler = this[`on${event.type}`];
    if (handler) {
      handler.call(this, event);
    }
  }

  /**
   * Get uncommitted events
   */
  getUncommittedEvents() {
    return [...this.uncommittedEvents];
  }

  /**
   * Mark events as committed
   */
  markEventsAsCommitted() {
    this.uncommittedEvents = [];
  }

  /**
   * Load from history
   */
  loadFromHistory(events) {
    for (const event of events) {
      this.when(event);
      this.version++;
    }
  }

  /**
   * Create snapshot of current state
   */
  createSnapshot() {
    return {
      id: this.id,
      version: this.version,
      state: this.getState()
    };
  }

  /**
   * Override this to return current state
   */
  getState() {
    return {};
  }

  /**
   * Load from snapshot
   */
  loadFromSnapshot(snapshot) {
    this.version = snapshot.version;
    this.applyState(snapshot.state);
  }

  /**
   * Override this to apply state from snapshot
   */
  applyState(state) {
    Object.assign(this, state);
  }
}

/**
 * Example: Bank Account Aggregate
 */
class BankAccount extends EventSourcedAggregate {
  constructor(id) {
    super(id);
    this.balance = 0;
    this.isActive = false;
    this.transactions = [];
  }

  /**
   * Commands (business logic)
   */
  openAccount(accountHolder, initialDeposit, metadata) {
    if (this.isActive) {
      throw new Error('Account is already open');
    }

    const event = new DomainEvent(
      'AccountOpened',
      this.id,
      { accountHolder, initialDeposit },
      metadata
    );

    this.apply(event);
  }

  deposit(amount, description, metadata) {
    if (!this.isActive) {
      throw new Error('Account is not active');
    }
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    const event = new DomainEvent(
      'MoneyDeposited',
      this.id,
      { amount, description, previousBalance: this.balance },
      metadata
    );

    this.apply(event);
  }

  withdraw(amount, description, metadata) {
    if (!this.isActive) {
      throw new Error('Account is not active');
    }
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (amount > this.balance) {
      throw new Error('Insufficient funds');
    }

    const event = new DomainEvent(
      'MoneyWithdrawn',
      this.id,
      { amount, description, previousBalance: this.balance },
      metadata
    );

    this.apply(event);
  }

  closeAccount(reason, metadata) {
    if (!this.isActive) {
      throw new Error('Account is not active');
    }
    if (this.balance > 0) {
      throw new Error('Cannot close account with positive balance');
    }

    const event = new DomainEvent(
      'AccountClosed',
      this.id,
      { reason, finalBalance: this.balance },
      metadata
    );

    this.apply(event);
  }

  /**
   * Event handlers (state changes)
   */
  onAccountOpened(event) {
    this.accountHolder = event.data.accountHolder;
    this.balance = event.data.initialDeposit;
    this.isActive = true;
    this.createdAt = event.timestamp;
  }

  onMoneyDeposited(event) {
    this.balance += event.data.amount;
    this.transactions.push({
      type: 'deposit',
      amount: event.data.amount,
      description: event.data.description,
      timestamp: event.timestamp,
      balance: this.balance
    });
  }

  onMoneyWithdrawn(event) {
    this.balance -= event.data.amount;
    this.transactions.push({
      type: 'withdrawal',
      amount: event.data.amount,
      description: event.data.description,
      timestamp: event.timestamp,
      balance: this.balance
    });
  }

  onAccountClosed(event) {
    this.isActive = false;
    this.closedAt = event.timestamp;
    this.closureReason = event.data.reason;
  }

  getState() {
    return {
      accountHolder: this.accountHolder,
      balance: this.balance,
      isActive: this.isActive,
      transactions: this.transactions,
      createdAt: this.createdAt,
      closedAt: this.closedAt,
      closureReason: this.closureReason
    };
  }
}

/**
 * Repository for event-sourced aggregates
 */
class EventSourcedRepository {
  constructor(eventStore, AggregateClass) {
    this.eventStore = eventStore;
    this.AggregateClass = AggregateClass;
  }

  /**
   * Load aggregate from event store
   */
  async load(aggregateId) {
    const aggregate = new this.AggregateClass(aggregateId);

    // Try to load from snapshot first
    const snapshot = await this.eventStore.getSnapshot(aggregateId);
    if (snapshot) {
      aggregate.loadFromSnapshot(snapshot);

      // Load events after snapshot
      const events = await this.eventStore.getEvents(aggregateId, snapshot.version);
      aggregate.loadFromHistory(events);
    } else {
      // Load all events
      const events = await this.eventStore.getEvents(aggregateId);
      aggregate.loadFromHistory(events);
    }

    return aggregate;
  }

  /**
   * Save aggregate to event store
   */
  async save(aggregate) {
    const uncommittedEvents = aggregate.getUncommittedEvents();

    if (uncommittedEvents.length === 0) {
      return;
    }

    const expectedVersion = aggregate.version - uncommittedEvents.length;
    await this.eventStore.appendEvents(
      aggregate.id,
      expectedVersion,
      uncommittedEvents
    );

    aggregate.markEventsAsCommitted();
  }

  /**
   * Check if aggregate exists
   */
  async exists(aggregateId) {
    const version = await this.eventStore.getAggregateVersion(aggregateId);
    return version > 0;
  }
}

/**
 * Demo function
 */
async function demonstrateEventSourcing() {
  console.log('=== Event Sourcing Pattern Demo ===\n');

  // Create event store
  const eventStore = new EventStore();

  // Subscribe to events
  eventStore.subscribe('AccountOpened', (event) => {
    console.log(`📢 Event: Account ${event.aggregateId} opened for ${event.data.accountHolder}`);
  });

  eventStore.subscribe('MoneyDeposited', (event) => {
    console.log(`📢 Event: $${event.data.amount} deposited to account ${event.aggregateId}`);
  });

  eventStore.subscribe('MoneyWithdrawn', (event) => {
    console.log(`📢 Event: $${event.data.amount} withdrawn from account ${event.aggregateId}`);
  });

  // Create repository
  const repository = new EventSourcedRepository(eventStore, BankAccount);

  // Create and operate on account
  console.log('Creating new bank account...');
  const account1 = new BankAccount('ACC-001');
  account1.openAccount('John Doe', 1000, { userId: 'user-123' });
  await repository.save(account1);

  console.log('\nPerforming transactions...');
  account1.deposit(500, 'Salary', { userId: 'user-123' });
  account1.withdraw(200, 'ATM Withdrawal', { userId: 'user-123' });
  account1.deposit(300, 'Bonus', { userId: 'user-123' });
  await repository.save(account1);

  // Load account from events
  console.log('\n📖 Loading account from event store...');
  const loadedAccount = await repository.load('ACC-001');
  console.log('Account state:', loadedAccount.getState());

  // Display event statistics
  console.log('\n📊 Event Store Statistics:');
  console.log(eventStore.getStatistics());

  // Get all events for account
  console.log('\n📜 Event History for Account ACC-001:');
  const events = await eventStore.getEvents('ACC-001');
  events.forEach((event, index) => {
    console.log(`${index + 1}. [${event.type}] at ${event.timestamp}`);
    console.log(`   Data:`, event.data);
  });

  // Demonstrate time travel - rebuild state at specific point
  console.log('\n⏮️  Time Travel: Rebuilding state after 2 events...');
  const historicalAccount = new BankAccount('ACC-001');
  historicalAccount.loadFromHistory(events.slice(0, 2));
  console.log('Historical state:', historicalAccount.getState());

  return {
    eventStore,
    repository,
    currentAccount: loadedAccount
  };
}

// Export components
module.exports = {
  DomainEvent,
  EventStore,
  EventSourcedAggregate,
  EventSourcedRepository,
  BankAccount,
  demonstrateEventSourcing
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateEventSourcing()
    .then(() => console.log('\n✅ Event Sourcing demo completed'))
    .catch(error => console.error('❌ Error:', error));
}
