/**
 * Application Events Pattern
 *
 * Purpose: Enable loose coupling between microservices through event-driven
 * communication. Services publish domain events when state changes occur,
 * and other services subscribe to events they're interested in.
 *
 * Key Components:
 * - Event: Immutable record of something that happened
 * - Event Publisher: Service that emits events
 * - Event Subscriber: Service that reacts to events
 * - Event Bus: Infrastructure for routing events
 * - Event Store: Optional persistent storage for events
 *
 * Benefits:
 * - Loose coupling between services
 * - Asynchronous communication
 * - Scalability and resilience
 * - Audit trail and event sourcing
 * - Complex event processing
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Domain Event - Represents something that happened in the system
 */
class DomainEvent {
    constructor(type, aggregateId, payload, metadata = {}) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.metadata = {
            ...metadata,
            timestamp: new Date().toISOString(),
            version: metadata.version || 1
        };
        this.correlationId = metadata.correlationId || null;
        this.causationId = metadata.causationId || null;
    }

    toString() {
        return JSON.stringify(this, null, 2);
    }
}

/**
 * Event Bus - Routes events from publishers to subscribers
 */
class EventBus extends EventEmitter {
    constructor() {
        super();
        this.subscribers = new Map();
        this.eventHistory = [];
        this.middleware = [];
        this.deadLetterQueue = [];
    }

    use(middleware) {
        this.middleware.push(middleware);
    }

    async publish(event) {
        if (!(event instanceof DomainEvent)) {
            throw new Error('Event must be an instance of DomainEvent');
        }

        // Run middleware
        let processedEvent = event;
        for (const middleware of this.middleware) {
            processedEvent = await middleware(processedEvent);
            if (!processedEvent) {
                return; // Middleware cancelled event
            }
        }

        this.eventHistory.push(processedEvent);
        this.emit('event', processedEvent);
        this.emit(processedEvent.type, processedEvent);

        // Notify specific subscribers
        const subscribers = this.subscribers.get(processedEvent.type) || [];
        for (const subscriber of subscribers) {
            try {
                await subscriber.handle(processedEvent);
            } catch (error) {
                this.handleSubscriberError(processedEvent, subscriber, error);
            }
        }
    }

    subscribe(eventType, handler) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }

        const subscriber = {
            id: crypto.randomUUID(),
            eventType,
            handle: handler
        };

        this.subscribers.get(eventType).push(subscriber);
        return subscriber.id;
    }

    unsubscribe(subscriptionId) {
        for (const [eventType, subscribers] of this.subscribers.entries()) {
            const index = subscribers.findIndex(s => s.id === subscriptionId);
            if (index !== -1) {
                subscribers.splice(index, 1);
                if (subscribers.length === 0) {
                    this.subscribers.delete(eventType);
                }
                return true;
            }
        }
        return false;
    }

    handleSubscriberError(event, subscriber, error) {
        console.error(`Subscriber error for event ${event.type}:`, error);
        this.deadLetterQueue.push({
            event,
            subscriber: subscriber.id,
            error: error.message,
            timestamp: new Date().toISOString()
        });
        this.emit('subscriber-error', { event, subscriber, error });
    }

    getEventHistory(filter = {}) {
        let events = [...this.eventHistory];

        if (filter.type) {
            events = events.filter(e => e.type === filter.type);
        }

        if (filter.aggregateId) {
            events = events.filter(e => e.aggregateId === filter.aggregateId);
        }

        if (filter.correlationId) {
            events = events.filter(e => e.correlationId === filter.correlationId);
        }

        return events;
    }

    getDeadLetterQueue() {
        return [...this.deadLetterQueue];
    }

    clearDeadLetterQueue() {
        this.deadLetterQueue = [];
    }
}

/**
 * Event Publisher - Service that publishes events
 */
class EventPublisher {
    constructor(serviceId, eventBus) {
        this.serviceId = serviceId;
        this.eventBus = eventBus;
    }

    async publish(type, aggregateId, payload, metadata = {}) {
        const event = new DomainEvent(type, aggregateId, payload, {
            ...metadata,
            publisherId: this.serviceId
        });

        await this.eventBus.publish(event);
        return event;
    }

    withCorrelation(correlationId) {
        return new CorrelatedPublisher(this, correlationId);
    }
}

/**
 * Correlated Publisher - Maintains correlation across events
 */
class CorrelatedPublisher {
    constructor(publisher, correlationId) {
        this.publisher = publisher;
        this.correlationId = correlationId;
    }

    async publish(type, aggregateId, payload, metadata = {}) {
        return this.publisher.publish(type, aggregateId, payload, {
            ...metadata,
            correlationId: this.correlationId
        });
    }
}

/**
 * Event Subscriber - Service that reacts to events
 */
class EventSubscriber {
    constructor(serviceId, eventBus) {
        this.serviceId = serviceId;
        this.eventBus = eventBus;
        this.subscriptions = new Map();
        this.handlers = new Map();
    }

    on(eventType, handler) {
        const subscriptionId = this.eventBus.subscribe(eventType, handler);
        this.subscriptions.set(eventType, subscriptionId);
        this.handlers.set(eventType, handler);
        return subscriptionId;
    }

    off(eventType) {
        const subscriptionId = this.subscriptions.get(eventType);
        if (subscriptionId) {
            this.eventBus.unsubscribe(subscriptionId);
            this.subscriptions.delete(eventType);
            this.handlers.delete(eventType);
            return true;
        }
        return false;
    }

    offAll() {
        for (const eventType of this.subscriptions.keys()) {
            this.off(eventType);
        }
    }
}

/**
 * Event Store - Persistent storage for events
 */
class EventStore {
    constructor() {
        this.events = [];
        this.snapshots = new Map();
    }

    async append(event) {
        this.events.push({
            ...event,
            sequence: this.events.length + 1,
            storedAt: new Date().toISOString()
        });
    }

    async getEvents(aggregateId, fromVersion = 0) {
        return this.events.filter(e =>
            e.aggregateId === aggregateId &&
            e.metadata.version > fromVersion
        );
    }

    async getAllEvents(filter = {}) {
        let events = [...this.events];

        if (filter.type) {
            events = events.filter(e => e.type === filter.type);
        }

        if (filter.aggregateId) {
            events = events.filter(e => e.aggregateId === filter.aggregateId);
        }

        if (filter.fromSequence) {
            events = events.filter(e => e.sequence >= filter.fromSequence);
        }

        if (filter.toSequence) {
            events = events.filter(e => e.sequence <= filter.toSequence);
        }

        return events;
    }

    async saveSnapshot(aggregateId, state, version) {
        this.snapshots.set(aggregateId, {
            aggregateId,
            state,
            version,
            timestamp: new Date().toISOString()
        });
    }

    async getSnapshot(aggregateId) {
        return this.snapshots.get(aggregateId) || null;
    }

    async replay(aggregateId, reducerFn, initialState = {}) {
        const snapshot = await this.getSnapshot(aggregateId);
        let state = snapshot ? snapshot.state : initialState;
        let fromVersion = snapshot ? snapshot.version : 0;

        const events = await this.getEvents(aggregateId, fromVersion);
        for (const event of events) {
            state = reducerFn(state, event);
        }

        return state;
    }
}

/**
 * Event Projection - Materialized view built from events
 */
class EventProjection {
    constructor(eventBus, eventStore) {
        this.eventBus = eventBus;
        this.eventStore = eventStore;
        this.projections = new Map();
        this.subscriptions = [];
    }

    register(name, eventTypes, reducerFn, initialState = {}) {
        const projection = {
            name,
            state: initialState,
            version: 0
        };

        this.projections.set(name, projection);

        // Subscribe to events
        for (const eventType of eventTypes) {
            const subscription = this.eventBus.subscribe(eventType, async (event) => {
                projection.state = reducerFn(projection.state, event);
                projection.version++;
            });
            this.subscriptions.push(subscription);
        }

        return projection;
    }

    async rebuild(name) {
        const projection = this.projections.get(name);
        if (!projection) {
            throw new Error(`Projection ${name} not found`);
        }

        // Get all events from store
        const events = await this.eventStore.getAllEvents();

        // Rebuild projection
        projection.state = {};
        projection.version = 0;

        for (const event of events) {
            // Apply each event through the reducer
            projection.state = projection.reducer(projection.state, event);
            projection.version++;
        }

        return projection;
    }

    get(name) {
        const projection = this.projections.get(name);
        return projection ? projection.state : null;
    }
}

// Example Domain: E-commerce Order System
class OrderService {
    constructor(eventBus) {
        this.publisher = new EventPublisher('order-service', eventBus);
        this.orders = new Map();
    }

    async createOrder(orderId, userId, items) {
        const order = {
            orderId,
            userId,
            items,
            status: 'pending',
            total: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        };

        this.orders.set(orderId, order);

        await this.publisher.publish('OrderCreated', orderId, {
            userId,
            items,
            total: order.total
        });

        return order;
    }

    async confirmOrder(orderId) {
        const order = this.orders.get(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        order.status = 'confirmed';

        await this.publisher.publish('OrderConfirmed', orderId, {
            userId: order.userId,
            total: order.total
        });
    }
}

class InventoryService {
    constructor(eventBus) {
        this.subscriber = new EventSubscriber('inventory-service', eventBus);
        this.publisher = new EventPublisher('inventory-service', eventBus);
        this.inventory = new Map();
    }

    initialize() {
        this.subscriber.on('OrderCreated', async (event) => {
            console.log(`[InventoryService] Received OrderCreated: ${event.aggregateId}`);

            const { items } = event.payload;
            let allAvailable = true;

            for (const item of items) {
                const stock = this.inventory.get(item.productId) || 0;
                if (stock < item.quantity) {
                    allAvailable = false;
                    break;
                }
            }

            if (allAvailable) {
                // Reserve items
                for (const item of items) {
                    const stock = this.inventory.get(item.productId);
                    this.inventory.set(item.productId, stock - item.quantity);
                }

                await this.publisher.publish('InventoryReserved', event.aggregateId, {
                    items,
                    reservationId: crypto.randomUUID()
                }, {
                    correlationId: event.correlationId
                });
            } else {
                await this.publisher.publish('InventoryInsufficient', event.aggregateId, {
                    items
                }, {
                    correlationId: event.correlationId
                });
            }
        });
    }

    setStock(productId, quantity) {
        this.inventory.set(productId, quantity);
    }
}

class ShippingService {
    constructor(eventBus) {
        this.subscriber = new EventSubscriber('shipping-service', eventBus);
        this.publisher = new EventPublisher('shipping-service', eventBus);
    }

    initialize() {
        this.subscriber.on('OrderConfirmed', async (event) => {
            console.log(`[ShippingService] Received OrderConfirmed: ${event.aggregateId}`);

            const shipmentId = crypto.randomUUID();

            await this.publisher.publish('ShipmentCreated', event.aggregateId, {
                shipmentId,
                userId: event.payload.userId,
                estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            }, {
                correlationId: event.correlationId
            });
        });
    }
}

class NotificationService {
    constructor(eventBus) {
        this.subscriber = new EventSubscriber('notification-service', eventBus);
    }

    initialize() {
        this.subscriber.on('OrderCreated', (event) => {
            console.log(`[NotificationService] Sending order confirmation to user ${event.payload.userId}`);
        });

        this.subscriber.on('ShipmentCreated', (event) => {
            console.log(`[NotificationService] Sending shipment notification for order ${event.aggregateId}`);
        });
    }
}

// Demonstration
async function demonstrateApplicationEvents() {
    console.log('=== Application Events Pattern Demo ===\n');

    const eventBus = new EventBus();
    const eventStore = new EventStore();

    // Middleware: Log all events
    eventBus.use(async (event) => {
        console.log(`[EventBus] Event published: ${event.type} (${event.id})`);
        await eventStore.append(event);
        return event;
    });

    // Create services
    const orderService = new OrderService(eventBus);
    const inventoryService = new InventoryService(eventBus);
    const shippingService = new ShippingService(eventBus);
    const notificationService = new NotificationService(eventBus);

    // Initialize subscribers
    inventoryService.initialize();
    shippingService.initialize();
    notificationService.initialize();

    // Set up inventory
    inventoryService.setStock('product-1', 100);
    inventoryService.setStock('product-2', 50);

    console.log('Creating order...\n');

    // Create order
    const order = await orderService.createOrder('order-123', 'user-456', [
        { productId: 'product-1', name: 'Widget', quantity: 2, price: 25.00 },
        { productId: 'product-2', name: 'Gadget', quantity: 1, price: 50.00 }
    ]);

    // Wait for events to propagate
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('\nConfirming order...\n');

    // Confirm order
    await orderService.confirmOrder('order-123');

    // Wait for events to propagate
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('\nEvent History:');
    const history = eventBus.getEventHistory();
    history.forEach(event => {
        console.log(`  ${event.type} - ${event.aggregateId}`);
    });

    console.log('\nStored Events:');
    const storedEvents = await eventStore.getAllEvents();
    console.log(`  Total events: ${storedEvents.length}`);

    console.log('\nOrder Events:');
    const orderEvents = await eventStore.getEvents('order-123');
    orderEvents.forEach(event => {
        console.log(`  ${event.type} - ${JSON.stringify(event.payload)}`);
    });
}

// Run demonstration
if (require.main === module) {
    demonstrateApplicationEvents().catch(console.error);
}

module.exports = {
    DomainEvent,
    EventBus,
    EventPublisher,
    EventSubscriber,
    EventStore,
    EventProjection
};
