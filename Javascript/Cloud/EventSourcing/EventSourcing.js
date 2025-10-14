/**
 * Event Sourcing Pattern Implementation
 *
 * Event Sourcing stores the state of a business entity as a sequence of state-changing events.
 * Instead of storing just the current state, we store all events that led to the current state.
 *
 * Key Components:
 * - Event Store: Persistent storage for events
 * - Event Stream: Sequence of events for an aggregate
 * - Aggregate: Business entity that generates events
 * - Snapshot: Point-in-time state for performance
 * - Projection: Read model built from events
 * - Event Handler: Processes events for side effects
 */

/**
 * Base Event class
 */
class Event {
    constructor(aggregateId, eventType, data, metadata = {}) {
        this.eventId = this.generateEventId();
        this.aggregateId = aggregateId;
        this.eventType = eventType;
        this.data = data;
        this.metadata = metadata;
        this.timestamp = new Date();
        this.version = metadata.version || 1;
    }

    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Event Store - Persistent storage for events
 */
class EventStore {
    constructor() {
        this.events = [];
        this.snapshots = new Map();
        this.subscribers = new Map();
    }

    async append(event) {
        // Ensure events are appended in order
        const lastVersion = this.getLastVersion(event.aggregateId);
        if (event.version !== lastVersion + 1) {
            throw new Error(`Version conflict: expected ${lastVersion + 1}, got ${event.version}`);
        }

        this.events.push(event);
        await this.notifySubscribers(event);
        return event;
    }

    async appendMultiple(events) {
        for (const event of events) {
            await this.append(event);
        }
    }

    getEvents(aggregateId, fromVersion = 0) {
        return this.events.filter(e =>
            e.aggregateId === aggregateId && e.version > fromVersion
        );
    }

    getAllEvents(filter = {}) {
        let filtered = [...this.events];

        if (filter.aggregateId) {
            filtered = filtered.filter(e => e.aggregateId === filter.aggregateId);
        }
        if (filter.eventType) {
            filtered = filtered.filter(e => e.eventType === filter.eventType);
        }
        if (filter.from) {
            filtered = filtered.filter(e => e.timestamp >= filter.from);
        }
        if (filter.to) {
            filtered = filtered.filter(e => e.timestamp <= filter.to);
        }

        return filtered;
    }

    getLastVersion(aggregateId) {
        const events = this.getEvents(aggregateId);
        return events.length > 0 ? Math.max(...events.map(e => e.version)) : 0;
    }

    async saveSnapshot(aggregateId, state, version) {
        this.snapshots.set(aggregateId, {
            state,
            version,
            timestamp: new Date()
        });
    }

    getSnapshot(aggregateId) {
        return this.snapshots.get(aggregateId);
    }

    subscribe(eventType, handler) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        this.subscribers.get(eventType).push(handler);
    }

    async notifySubscribers(event) {
        const handlers = this.subscribers.get(event.eventType) || [];
        const allHandlers = this.subscribers.get('*') || [];

        for (const handler of [...handlers, ...allHandlers]) {
            try {
                await handler(event);
            } catch (error) {
                console.error(`Error in event handler for ${event.eventType}:`, error);
            }
        }
    }

    getStatistics() {
        const aggregateStats = new Map();

        for (const event of this.events) {
            if (!aggregateStats.has(event.aggregateId)) {
                aggregateStats.set(event.aggregateId, {
                    eventCount: 0,
                    firstEvent: event.timestamp,
                    lastEvent: event.timestamp
                });
            }

            const stats = aggregateStats.get(event.aggregateId);
            stats.eventCount++;
            stats.lastEvent = event.timestamp;
        }

        return {
            totalEvents: this.events.length,
            totalAggregates: aggregateStats.size,
            totalSnapshots: this.snapshots.size,
            aggregates: Array.from(aggregateStats.entries()).map(([id, stats]) => ({
                aggregateId: id,
                ...stats
            }))
        };
    }
}

/**
 * Aggregate Base Class
 */
class AggregateRoot {
    constructor(id) {
        this.id = id;
        this.version = 0;
        this.uncommittedEvents = [];
    }

    applyEvent(event) {
        this.version = event.version;
        const handler = this[`on${event.eventType}`];
        if (handler) {
            handler.call(this, event.data);
        }
    }

    raiseEvent(eventType, data) {
        const event = new Event(this.id, eventType, data, { version: this.version + 1 });
        this.uncommittedEvents.push(event);
        this.applyEvent(event);
        return event;
    }

    getUncommittedEvents() {
        return [...this.uncommittedEvents];
    }

    markEventsAsCommitted() {
        this.uncommittedEvents = [];
    }

    loadFromHistory(events) {
        for (const event of events) {
            this.applyEvent(event);
        }
    }
}

/**
 * Repository for managing aggregates
 */
class EventSourcedRepository {
    constructor(eventStore, AggregateClass, snapshotFrequency = 10) {
        this.eventStore = eventStore;
        this.AggregateClass = AggregateClass;
        this.snapshotFrequency = snapshotFrequency;
    }

    async getById(id) {
        const aggregate = new this.AggregateClass(id);

        // Try to load from snapshot first
        const snapshot = this.eventStore.getSnapshot(id);
        let fromVersion = 0;

        if (snapshot) {
            Object.assign(aggregate, snapshot.state);
            aggregate.version = snapshot.version;
            fromVersion = snapshot.version;
        }

        // Load events after snapshot
        const events = this.eventStore.getEvents(id, fromVersion);
        aggregate.loadFromHistory(events);

        return aggregate;
    }

    async save(aggregate) {
        const uncommittedEvents = aggregate.getUncommittedEvents();

        if (uncommittedEvents.length === 0) {
            return;
        }

        await this.eventStore.appendMultiple(uncommittedEvents);
        aggregate.markEventsAsCommitted();

        // Create snapshot if needed
        if (aggregate.version % this.snapshotFrequency === 0) {
            await this.eventStore.saveSnapshot(aggregate.id, aggregate, aggregate.version);
        }
    }
}

/**
 * Example: Bank Account Aggregate
 */
class BankAccount extends AggregateRoot {
    constructor(id) {
        super(id);
        this.balance = 0;
        this.owner = null;
        this.status = 'pending';
    }

    create(owner, initialBalance) {
        if (this.status !== 'pending') {
            throw new Error('Account already created');
        }
        this.raiseEvent('AccountCreated', { owner, initialBalance });
    }

    onAccountCreated(data) {
        this.owner = data.owner;
        this.balance = data.initialBalance;
        this.status = 'active';
    }

    deposit(amount) {
        if (this.status !== 'active') {
            throw new Error('Account is not active');
        }
        if (amount <= 0) {
            throw new Error('Deposit amount must be positive');
        }
        this.raiseEvent('MoneyDeposited', { amount });
    }

    onMoneyDeposited(data) {
        this.balance += data.amount;
    }

    withdraw(amount) {
        if (this.status !== 'active') {
            throw new Error('Account is not active');
        }
        if (amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }
        if (this.balance < amount) {
            throw new Error('Insufficient funds');
        }
        this.raiseEvent('MoneyWithdrawn', { amount });
    }

    onMoneyWithdrawn(data) {
        this.balance -= data.amount;
    }

    close() {
        if (this.status !== 'active') {
            throw new Error('Account is not active');
        }
        if (this.balance !== 0) {
            throw new Error('Cannot close account with non-zero balance');
        }
        this.raiseEvent('AccountClosed', {});
    }

    onAccountClosed(data) {
        this.status = 'closed';
    }
}

/**
 * Projection Builder
 */
class ProjectionBuilder {
    constructor(eventStore) {
        this.eventStore = eventStore;
        this.projections = new Map();
    }

    buildProjection(projectionName, eventHandlers) {
        const projection = {
            name: projectionName,
            data: new Map(),
            lastProcessedVersion: new Map()
        };

        this.eventStore.subscribe('*', async (event) => {
            const handler = eventHandlers[event.eventType];
            if (handler) {
                await handler(projection.data, event);
                projection.lastProcessedVersion.set(event.aggregateId, event.version);
            }
        });

        this.projections.set(projectionName, projection);
        return projection;
    }

    getProjection(projectionName) {
        return this.projections.get(projectionName);
    }

    async rebuildProjection(projectionName, eventHandlers) {
        const projection = this.projections.get(projectionName);
        if (!projection) {
            throw new Error(`Projection not found: ${projectionName}`);
        }

        projection.data.clear();
        projection.lastProcessedVersion.clear();

        const events = this.eventStore.getAllEvents();
        for (const event of events) {
            const handler = eventHandlers[event.eventType];
            if (handler) {
                await handler(projection.data, event);
                projection.lastProcessedVersion.set(event.aggregateId, event.version);
            }
        }
    }
}

/**
 * Demonstration
 */
function demonstrateEventSourcing() {
    console.log('=== Event Sourcing Pattern Demonstration ===\n');

    const eventStore = new EventStore();
    const repository = new EventSourcedRepository(eventStore, BankAccount, 5);

    // Create account and perform operations
    async function runDemo() {
        console.log('1. Creating bank account...');
        const account1 = new BankAccount('acc_001');
        account1.create('John Doe', 1000);
        await repository.save(account1);

        console.log('2. Making deposits and withdrawals...');
        const account = await repository.getById('acc_001');
        account.deposit(500);
        account.withdraw(200);
        account.deposit(300);
        await repository.save(account);

        console.log('3. Event Stream:');
        const events = eventStore.getEvents('acc_001');
        events.forEach(e => {
            console.log(`  - ${e.eventType} (v${e.version}):`, e.data);
        });

        console.log('\n4. Rebuilding state from events...');
        const rebuiltAccount = await repository.getById('acc_001');
        console.log('  Rebuilt Account:', {
            owner: rebuiltAccount.owner,
            balance: rebuiltAccount.balance,
            status: rebuiltAccount.status,
            version: rebuiltAccount.version
        });

        console.log('\n5. Creating projection for account balances...');
        const projectionBuilder = new ProjectionBuilder(eventStore);
        const balanceProjection = projectionBuilder.buildProjection('AccountBalances', {
            AccountCreated: (data, event) => {
                data.set(event.aggregateId, {
                    owner: event.data.owner,
                    balance: event.data.initialBalance
                });
            },
            MoneyDeposited: (data, event) => {
                const account = data.get(event.aggregateId);
                if (account) {
                    account.balance += event.data.amount;
                }
            },
            MoneyWithdrawn: (data, event) => {
                const account = data.get(event.aggregateId);
                if (account) {
                    account.balance -= event.data.amount;
                }
            }
        });

        // Rebuild projection from all events
        await projectionBuilder.rebuildProjection('AccountBalances', {
            AccountCreated: (data, event) => {
                data.set(event.aggregateId, {
                    owner: event.data.owner,
                    balance: event.data.initialBalance
                });
            },
            MoneyDeposited: (data, event) => {
                const account = data.get(event.aggregateId);
                if (account) {
                    account.balance += event.data.amount;
                }
            },
            MoneyWithdrawn: (data, event) => {
                const account = data.get(event.aggregateId);
                if (account) {
                    account.balance -= event.data.amount;
                }
            }
        });

        console.log('  Projection Data:', Array.from(balanceProjection.data.entries()));

        console.log('\n6. Event Store Statistics:');
        console.log(JSON.stringify(eventStore.getStatistics(), null, 2));
    }

    runDemo().catch(console.error);
}

// Run demonstration
if (require.main === module) {
    demonstrateEventSourcing();
}

module.exports = {
    Event,
    EventStore,
    AggregateRoot,
    EventSourcedRepository,
    BankAccount,
    ProjectionBuilder
};
