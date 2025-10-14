/**
 * Event Sourcing Cloud Pattern Implementation
 *
 * Distributed Event Sourcing implementation for cloud environments with:
 * - Distributed event store with partitioning
 * - Event replication across regions
 * - Eventual consistency guarantees
 * - Saga pattern for distributed transactions
 * - Event stream processing
 * - Multi-tenant support
 *
 * Key Components:
 * - Distributed Event Store: Partitioned event storage
 * - Event Stream Processor: Process events in real-time
 * - Event Replicator: Replicate events across regions
 * - Saga Coordinator: Manage distributed transactions
 * - Event Publisher: Publish events to message bus
 */

/**
 * Partition Strategy for distributed event storage
 */
class PartitionStrategy {
    constructor(partitionCount = 10) {
        this.partitionCount = partitionCount;
    }

    getPartition(aggregateId) {
        let hash = 0;
        for (let i = 0; i < aggregateId.length; i++) {
            hash = ((hash << 5) - hash) + aggregateId.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash) % this.partitionCount;
    }

    getAllPartitions() {
        return Array.from({ length: this.partitionCount }, (_, i) => i);
    }
}

/**
 * Distributed Event Store with partitioning
 */
class DistributedEventStore {
    constructor(partitionCount = 10) {
        this.partitionStrategy = new PartitionStrategy(partitionCount);
        this.partitions = new Map();
        this.subscribers = [];
        this.replicationTargets = [];

        // Initialize partitions
        for (const partitionId of this.partitionStrategy.getAllPartitions()) {
            this.partitions.set(partitionId, {
                events: [],
                snapshots: new Map(),
                metadata: {
                    eventCount: 0,
                    lastUpdated: null
                }
            });
        }
    }

    async appendEvent(event) {
        const partitionId = this.partitionStrategy.getPartition(event.aggregateId);
        const partition = this.partitions.get(partitionId);

        // Add metadata
        event.partitionId = partitionId;
        event.timestamp = new Date();
        event.eventId = this.generateEventId();

        // Append to partition
        partition.events.push(event);
        partition.metadata.eventCount++;
        partition.metadata.lastUpdated = event.timestamp;

        // Notify subscribers
        await this.notifySubscribers(event);

        // Replicate to other regions
        await this.replicateEvent(event);

        return event;
    }

    async appendEvents(events) {
        const results = [];
        for (const event of events) {
            results.push(await this.appendEvent(event));
        }
        return results;
    }

    getEvents(aggregateId, fromVersion = 0) {
        const partitionId = this.partitionStrategy.getPartition(aggregateId);
        const partition = this.partitions.get(partitionId);

        return partition.events.filter(e =>
            e.aggregateId === aggregateId && e.version > fromVersion
        );
    }

    getAllEventsInPartition(partitionId, filter = {}) {
        const partition = this.partitions.get(partitionId);
        if (!partition) {
            return [];
        }

        let events = [...partition.events];

        if (filter.eventType) {
            events = events.filter(e => e.eventType === filter.eventType);
        }
        if (filter.from) {
            events = events.filter(e => e.timestamp >= filter.from);
        }
        if (filter.to) {
            events = events.filter(e => e.timestamp <= filter.to);
        }

        return events;
    }

    getLastVersion(aggregateId) {
        const events = this.getEvents(aggregateId);
        return events.length > 0 ? Math.max(...events.map(e => e.version)) : 0;
    }

    async saveSnapshot(aggregateId, state, version) {
        const partitionId = this.partitionStrategy.getPartition(aggregateId);
        const partition = this.partitions.get(partitionId);

        partition.snapshots.set(aggregateId, {
            state,
            version,
            timestamp: new Date(),
            partitionId
        });
    }

    getSnapshot(aggregateId) {
        const partitionId = this.partitionStrategy.getPartition(aggregateId);
        const partition = this.partitions.get(partitionId);
        return partition.snapshots.get(aggregateId);
    }

    subscribe(handler) {
        this.subscribers.push(handler);
    }

    async notifySubscribers(event) {
        for (const handler of this.subscribers) {
            try {
                await handler(event);
            } catch (error) {
                console.error('Error in event subscriber:', error);
            }
        }
    }

    addReplicationTarget(target) {
        this.replicationTargets.push(target);
    }

    async replicateEvent(event) {
        const replicationPromises = this.replicationTargets.map(async (target) => {
            try {
                await target.receiveReplicatedEvent(event);
            } catch (error) {
                console.error('Replication failed:', error);
            }
        });

        await Promise.all(replicationPromises);
    }

    async receiveReplicatedEvent(event) {
        const partitionId = this.partitionStrategy.getPartition(event.aggregateId);
        const partition = this.partitions.get(partitionId);

        // Check if event already exists (idempotency)
        const exists = partition.events.some(e => e.eventId === event.eventId);
        if (!exists) {
            partition.events.push(event);
            partition.metadata.eventCount++;
            partition.metadata.lastUpdated = new Date();
        }
    }

    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getStatistics() {
        const partitionStats = [];
        let totalEvents = 0;
        let totalSnapshots = 0;

        for (const [partitionId, partition] of this.partitions) {
            totalEvents += partition.metadata.eventCount;
            totalSnapshots += partition.snapshots.size;

            partitionStats.push({
                partitionId,
                eventCount: partition.metadata.eventCount,
                snapshotCount: partition.snapshots.size,
                lastUpdated: partition.metadata.lastUpdated
            });
        }

        return {
            totalPartitions: this.partitions.size,
            totalEvents,
            totalSnapshots,
            replicationTargets: this.replicationTargets.length,
            partitions: partitionStats
        };
    }
}

/**
 * Event Stream Processor for real-time processing
 */
class EventStreamProcessor {
    constructor(eventStore) {
        this.eventStore = eventStore;
        this.processors = new Map();
        this.processingState = new Map();
    }

    registerProcessor(name, handler, filter = {}) {
        this.processors.set(name, {
            handler,
            filter,
            statistics: {
                processed: 0,
                failed: 0,
                lastProcessed: null
            }
        });

        // Subscribe to event store
        this.eventStore.subscribe(async (event) => {
            if (this.matchesFilter(event, filter)) {
                await this.processEvent(name, event);
            }
        });
    }

    matchesFilter(event, filter) {
        if (filter.eventType && event.eventType !== filter.eventType) {
            return false;
        }
        if (filter.aggregateId && event.aggregateId !== filter.aggregateId) {
            return false;
        }
        return true;
    }

    async processEvent(processorName, event) {
        const processor = this.processors.get(processorName);
        if (!processor) {
            return;
        }

        try {
            await processor.handler(event);
            processor.statistics.processed++;
            processor.statistics.lastProcessed = new Date();
        } catch (error) {
            processor.statistics.failed++;
            console.error(`Error in processor ${processorName}:`, error);
        }
    }

    getStatistics() {
        const stats = {};
        for (const [name, processor] of this.processors) {
            stats[name] = { ...processor.statistics };
        }
        return stats;
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

    defineSaga(sagaName, steps, compensations) {
        this.sagas.set(sagaName, {
            steps,
            compensations
        });
    }

    async executeSaga(sagaName, data) {
        const saga = this.sagas.get(sagaName);
        if (!saga) {
            throw new Error(`Saga not found: ${sagaName}`);
        }

        const sagaId = this.generateSagaId();
        const sagaInstance = {
            sagaId,
            sagaName,
            data,
            completedSteps: [],
            status: 'running',
            startedAt: new Date()
        };

        this.activeSagas.set(sagaId, sagaInstance);

        try {
            // Execute steps
            for (let i = 0; i < saga.steps.length; i++) {
                const step = saga.steps[i];
                await step(data);
                sagaInstance.completedSteps.push(i);

                // Record step completion event
                await this.eventStore.appendEvent({
                    aggregateId: sagaId,
                    eventType: 'SagaStepCompleted',
                    version: i + 1,
                    data: { sagaName, step: i }
                });
            }

            sagaInstance.status = 'completed';
            sagaInstance.completedAt = new Date();

            await this.eventStore.appendEvent({
                aggregateId: sagaId,
                eventType: 'SagaCompleted',
                version: saga.steps.length + 1,
                data: { sagaName }
            });

            return { success: true, sagaId };
        } catch (error) {
            // Compensate completed steps in reverse order
            await this.compensateSaga(sagaInstance, saga);
            sagaInstance.status = 'compensated';
            sagaInstance.error = error.message;

            await this.eventStore.appendEvent({
                aggregateId: sagaId,
                eventType: 'SagaFailed',
                version: sagaInstance.completedSteps.length + 1,
                data: { sagaName, error: error.message }
            });

            throw error;
        }
    }

    async compensateSaga(sagaInstance, saga) {
        const compensations = saga.compensations;

        for (let i = sagaInstance.completedSteps.length - 1; i >= 0; i--) {
            const stepIndex = sagaInstance.completedSteps[i];
            const compensation = compensations[stepIndex];

            if (compensation) {
                try {
                    await compensation(sagaInstance.data);
                } catch (error) {
                    console.error(`Compensation failed for step ${stepIndex}:`, error);
                }
            }
        }
    }

    generateSagaId() {
        return `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getSagaStatus(sagaId) {
        return this.activeSagas.get(sagaId);
    }

    getAllSagas() {
        return Array.from(this.activeSagas.values());
    }
}

/**
 * Demonstration
 */
function demonstrateEventSourcingCloud() {
    console.log('=== Event Sourcing Cloud Pattern Demonstration ===\n');

    // Create distributed event stores (simulating multiple regions)
    const primaryStore = new DistributedEventStore(5);
    const replicaStore = new DistributedEventStore(5);

    // Setup replication
    primaryStore.addReplicationTarget(replicaStore);

    // Create event stream processor
    const processor = new EventStreamProcessor(primaryStore);

    // Register processors
    processor.registerProcessor('OrderProcessor', async (event) => {
        console.log(`Processing order event: ${event.eventType}`);
    }, { eventType: 'OrderCreated' });

    processor.registerProcessor('PaymentProcessor', async (event) => {
        console.log(`Processing payment event: ${event.eventType}`);
    }, { eventType: 'PaymentProcessed' });

    // Create saga coordinator
    const sagaCoordinator = new SagaCoordinator(primaryStore);

    // Define order placement saga
    sagaCoordinator.defineSaga(
        'PlaceOrder',
        [
            // Step 1: Reserve inventory
            async (data) => {
                console.log('  Step 1: Reserving inventory for', data.items);
                await primaryStore.appendEvent({
                    aggregateId: data.orderId,
                    eventType: 'InventoryReserved',
                    version: 1,
                    data: { items: data.items }
                });
            },
            // Step 2: Process payment
            async (data) => {
                console.log('  Step 2: Processing payment for', data.amount);
                await primaryStore.appendEvent({
                    aggregateId: data.orderId,
                    eventType: 'PaymentProcessed',
                    version: 2,
                    data: { amount: data.amount }
                });
            },
            // Step 3: Create order
            async (data) => {
                console.log('  Step 3: Creating order', data.orderId);
                await primaryStore.appendEvent({
                    aggregateId: data.orderId,
                    eventType: 'OrderCreated',
                    version: 3,
                    data: { orderId: data.orderId, items: data.items, amount: data.amount }
                });
            }
        ],
        [
            // Compensation 1: Release inventory
            async (data) => {
                console.log('  Compensating: Releasing inventory');
                await primaryStore.appendEvent({
                    aggregateId: data.orderId,
                    eventType: 'InventoryReleased',
                    version: 999,
                    data: { items: data.items }
                });
            },
            // Compensation 2: Refund payment
            async (data) => {
                console.log('  Compensating: Refunding payment');
                await primaryStore.appendEvent({
                    aggregateId: data.orderId,
                    eventType: 'PaymentRefunded',
                    version: 999,
                    data: { amount: data.amount }
                });
            },
            // Compensation 3: Cancel order
            async (data) => {
                console.log('  Compensating: Canceling order');
                await primaryStore.appendEvent({
                    aggregateId: data.orderId,
                    eventType: 'OrderCanceled',
                    version: 999,
                    data: { orderId: data.orderId }
                });
            }
        ]
    );

    // Execute saga
    async function runDemo() {
        console.log('1. Executing order placement saga...');
        try {
            const result = await sagaCoordinator.executeSaga('PlaceOrder', {
                orderId: 'order_001',
                items: [{ id: 'item_1', quantity: 2 }],
                amount: 100
            });
            console.log('  Saga completed:', result);
        } catch (error) {
            console.log('  Saga failed:', error.message);
        }

        console.log('\n2. Primary store statistics:');
        console.log(JSON.stringify(primaryStore.getStatistics(), null, 2));

        console.log('\n3. Replica store statistics (after replication):');
        console.log(JSON.stringify(replicaStore.getStatistics(), null, 2));

        console.log('\n4. Event stream processor statistics:');
        console.log(JSON.stringify(processor.getStatistics(), null, 2));

        console.log('\n5. Events in partition 0:');
        const partition0Events = primaryStore.getAllEventsInPartition(0);
        partition0Events.forEach(e => {
            console.log(`  - ${e.eventType} (${e.aggregateId})`);
        });
    }

    runDemo().catch(console.error);
}

// Run demonstration
if (require.main === module) {
    demonstrateEventSourcingCloud();
}

module.exports = {
    PartitionStrategy,
    DistributedEventStore,
    EventStreamProcessor,
    SagaCoordinator
};
