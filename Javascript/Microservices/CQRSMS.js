/**
 * CQRS Microservices Pattern
 *
 * Purpose: Implement CQRS across multiple microservices with separate
 * services for commands and queries. This allows independent scaling,
 * deployment, and evolution of read and write services.
 *
 * Key Differences from CQRS.js:
 * - Separate microservices for reads and writes
 * - Event-driven synchronization between services
 * - Multiple specialized read services
 * - Distributed event sourcing
 * - Cross-service projections
 *
 * Key Components:
 * - Command Service: Handles all write operations
 * - Query Services: Multiple read-optimized services
 * - Event Publisher: Publishes domain events
 * - Event Subscriber: Subscribes to events for projections
 * - Distributed Event Store: Shared event storage
 * - Projection Services: Build and maintain read models
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Service Message - Communication between services
 */
class ServiceMessage {
    constructor(type, payload, metadata = {}) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.payload = payload;
        this.metadata = {
            ...metadata,
            timestamp: new Date().toISOString(),
            serviceId: metadata.serviceId || null
        };
    }
}

/**
 * Message Bus - Inter-service communication
 */
class MessageBus extends EventEmitter {
    constructor() {
        super();
        this.messages = [];
        this.subscriptions = new Map();
    }

    async publish(message) {
        console.log(`[MessageBus] Publishing: ${message.type}`);
        this.messages.push(message);
        this.emit('message', message);
        this.emit(message.type, message);
    }

    subscribe(messageType, handler, serviceId) {
        if (!this.subscriptions.has(messageType)) {
            this.subscriptions.set(messageType, []);
        }

        this.subscriptions.get(messageType).push({ serviceId, handler });

        this.on(messageType, async (message) => {
            if (message.metadata.serviceId !== serviceId) {
                try {
                    await handler(message);
                } catch (error) {
                    console.error(`[MessageBus] Handler error in ${serviceId}:`, error);
                }
            }
        });
    }

    getMessageHistory() {
        return [...this.messages];
    }
}

/**
 * Distributed Event Store - Shared across services
 */
class DistributedEventStore extends EventEmitter {
    constructor() {
        super();
        this.events = [];
        this.partitions = new Map();
        this.subscriptions = [];
    }

    async append(event) {
        event.sequence = this.events.length + 1;
        this.events.push(event);

        // Partition by aggregate ID for efficient querying
        if (!this.partitions.has(event.aggregateId)) {
            this.partitions.set(event.aggregateId, []);
        }
        this.partitions.get(event.aggregateId).push(event);

        this.emit('event-appended', event);

        // Notify subscribers
        for (const subscription of this.subscriptions) {
            try {
                await subscription.handler(event);
            } catch (error) {
                console.error('[DistributedEventStore] Subscription handler error:', error);
            }
        }
    }

    getEvents(aggregateId) {
        return this.partitions.get(aggregateId) || [];
    }

    getAllEvents(fromSequence = 0) {
        return this.events.filter(e => e.sequence > fromSequence);
    }

    subscribe(handler, serviceId) {
        this.subscriptions.push({ handler, serviceId });
    }

    getStats() {
        return {
            totalEvents: this.events.length,
            partitions: this.partitions.size,
            subscriptions: this.subscriptions.length
        };
    }
}

/**
 * Command Service - Handles all write operations
 */
class CommandService extends EventEmitter {
    constructor(serviceId, eventStore, messageBus) {
        super();
        this.serviceId = serviceId;
        this.eventStore = eventStore;
        this.messageBus = messageBus;
        this.commandHandlers = new Map();
        this.aggregates = new Map();
    }

    registerHandler(commandType, handler) {
        this.commandHandlers.set(commandType, handler);
        console.log(`[${this.serviceId}] Registered handler for ${commandType}`);
    }

    async executeCommand(command) {
        console.log(`[${this.serviceId}] Executing command: ${command.type}`);

        const handler = this.commandHandlers.get(command.type);
        if (!handler) {
            throw new Error(`No handler for command: ${command.type}`);
        }

        try {
            // Load aggregate from event store
            const aggregateId = command.aggregateId;
            const events = this.eventStore.getEvents(aggregateId);

            // Execute command
            const result = await handler(command, events);

            // Append new events
            if (result.events && result.events.length > 0) {
                for (const event of result.events) {
                    await this.eventStore.append(event);

                    // Publish event to message bus
                    await this.messageBus.publish(new ServiceMessage('DomainEvent', event, {
                        serviceId: this.serviceId
                    }));
                }
            }

            console.log(`[${this.serviceId}] Command executed successfully`);
            return result.data;
        } catch (error) {
            console.error(`[${this.serviceId}] Command execution failed:`, error);
            throw error;
        }
    }

    async handleRequest(request) {
        const { command } = request.payload;
        const result = await this.executeCommand(command);
        return { success: true, data: result };
    }
}

/**
 * Query Service - Handles read operations
 */
class QueryService extends EventEmitter {
    constructor(serviceId, messageBus) {
        super();
        this.serviceId = serviceId;
        this.messageBus = messageBus;
        this.readModels = new Map();
        this.queryHandlers = new Map();
        this.projections = new Map();
    }

    addReadModel(name, readModel) {
        this.readModels.set(name, readModel);
        console.log(`[${this.serviceId}] Added read model: ${name}`);
    }

    registerQueryHandler(queryType, handler) {
        this.queryHandlers.set(queryType, handler);
        console.log(`[${this.serviceId}] Registered query handler: ${queryType}`);
    }

    registerProjection(eventType, readModelName, projectionFn) {
        if (!this.projections.has(eventType)) {
            this.projections.set(eventType, []);
        }

        this.projections.get(eventType).push({ readModelName, projectionFn });

        // Subscribe to events
        this.messageBus.subscribe('DomainEvent', async (message) => {
            const event = message.payload;
            if (event.type === eventType) {
                await this.projectEvent(event);
            }
        }, this.serviceId);
    }

    async projectEvent(event) {
        const projectionList = this.projections.get(event.type) || [];

        for (const { readModelName, projectionFn } of projectionList) {
            const readModel = this.readModels.get(readModelName);
            if (readModel) {
                try {
                    await projectionFn(readModel, event);
                    console.log(`[${this.serviceId}] Projected ${event.type} to ${readModelName}`);
                } catch (error) {
                    console.error(`[${this.serviceId}] Projection error:`, error);
                }
            }
        }
    }

    async executeQuery(query) {
        console.log(`[${this.serviceId}] Executing query: ${query.type}`);

        const handler = this.queryHandlers.get(query.type);
        if (!handler) {
            throw new Error(`No handler for query: ${query.type}`);
        }

        try {
            const result = await handler(query, this.readModels);
            console.log(`[${this.serviceId}] Query executed successfully`);
            return result;
        } catch (error) {
            console.error(`[${this.serviceId}] Query execution failed:`, error);
            throw error;
        }
    }

    async handleRequest(request) {
        const { query } = request.payload;
        const result = await this.executeQuery(query);
        return { success: true, data: result };
    }

    getReadModel(name) {
        return this.readModels.get(name);
    }
}

/**
 * Simple Read Model Implementation
 */
class SimpleReadModel {
    constructor() {
        this.data = new Map();
    }

    set(key, value) {
        this.data.set(key, value);
    }

    get(key) {
        return this.data.get(key);
    }

    query(filter = {}) {
        const results = [];
        for (const item of this.data.values()) {
            if (this.matches(item, filter)) {
                results.push(item);
            }
        }
        return results;
    }

    matches(item, filter) {
        for (const [key, value] of Object.entries(filter)) {
            if (item[key] !== value) {
                return false;
            }
        }
        return true;
    }

    delete(key) {
        this.data.delete(key);
    }

    clear() {
        this.data.clear();
    }

    size() {
        return this.data.size;
    }
}

/**
 * API Gateway - Routes requests to appropriate services
 */
class APIGateway {
    constructor() {
        this.commandService = null;
        this.queryServices = new Map();
    }

    setCommandService(service) {
        this.commandService = service;
    }

    addQueryService(name, service) {
        this.queryServices.set(name, service);
    }

    async executeCommand(command) {
        if (!this.commandService) {
            throw new Error('Command service not configured');
        }

        return await this.commandService.handleRequest({
            type: 'command',
            payload: { command }
        });
    }

    async executeQuery(queryServiceName, query) {
        const service = this.queryServices.get(queryServiceName);
        if (!service) {
            throw new Error(`Query service ${queryServiceName} not found`);
        }

        return await service.handleRequest({
            type: 'query',
            payload: { query }
        });
    }
}

// Example: E-commerce Order System

/**
 * Order Aggregate
 */
class Order {
    constructor(id) {
        this.id = id;
        this.customerId = null;
        this.items = [];
        this.status = 'new';
        this.total = 0;
        this.version = 0;
    }

    static createFromEvents(events) {
        const order = new Order(events[0].aggregateId);
        for (const event of events) {
            order.apply(event);
        }
        return order;
    }

    apply(event) {
        switch (event.type) {
            case 'OrderCreated':
                this.customerId = event.payload.customerId;
                this.items = event.payload.items;
                this.total = event.payload.total;
                this.status = 'created';
                break;
            case 'OrderConfirmed':
                this.status = 'confirmed';
                break;
            case 'OrderShipped':
                this.status = 'shipped';
                this.shippingInfo = event.payload.shippingInfo;
                break;
            case 'OrderCancelled':
                this.status = 'cancelled';
                this.cancellationReason = event.payload.reason;
                break;
        }
        this.version = event.version;
    }
}

// Command Handlers
function createOrderHandler(command, existingEvents) {
    if (existingEvents.length > 0) {
        throw new Error('Order already exists');
    }

    const event = {
        id: crypto.randomUUID(),
        type: 'OrderCreated',
        aggregateId: command.aggregateId,
        payload: command.payload,
        version: 1,
        timestamp: new Date().toISOString()
    };

    return {
        events: [event],
        data: { orderId: command.aggregateId }
    };
}

function confirmOrderHandler(command, existingEvents) {
    if (existingEvents.length === 0) {
        throw new Error('Order not found');
    }

    const order = Order.createFromEvents(existingEvents);
    if (order.status !== 'created') {
        throw new Error(`Cannot confirm order in status: ${order.status}`);
    }

    const event = {
        id: crypto.randomUUID(),
        type: 'OrderConfirmed',
        aggregateId: command.aggregateId,
        payload: {},
        version: order.version + 1,
        timestamp: new Date().toISOString()
    };

    return {
        events: [event],
        data: { orderId: command.aggregateId }
    };
}

// Query Handlers
function getOrderHandler(query, readModels) {
    const orderListModel = readModels.get('order-list');
    const order = orderListModel.get(query.parameters.orderId);

    if (!order) {
        throw new Error('Order not found');
    }

    return order;
}

function getOrdersByCustomerHandler(query, readModels) {
    const orderListModel = readModels.get('order-list');
    return orderListModel.query({ customerId: query.parameters.customerId });
}

function getOrdersByStatusHandler(query, readModels) {
    const orderListModel = readModels.get('order-list');
    return orderListModel.query({ status: query.parameters.status });
}

// Projections
function orderCreatedProjection(readModel, event) {
    readModel.set(event.aggregateId, {
        id: event.aggregateId,
        customerId: event.payload.customerId,
        items: event.payload.items,
        total: event.payload.total,
        status: 'created',
        createdAt: event.timestamp
    });
}

function orderConfirmedProjection(readModel, event) {
    const order = readModel.get(event.aggregateId);
    if (order) {
        order.status = 'confirmed';
        order.confirmedAt = event.timestamp;
        readModel.set(event.aggregateId, order);
    }
}

// Demonstration
async function demonstrateCQRSMicroservices() {
    console.log('=== CQRS Microservices Pattern Demo ===\n');

    // Infrastructure
    const eventStore = new DistributedEventStore();
    const messageBus = new MessageBus();

    // Command Service
    const commandService = new CommandService('order-command-service', eventStore, messageBus);
    commandService.registerHandler('CreateOrder', createOrderHandler);
    commandService.registerHandler('ConfirmOrder', confirmOrderHandler);

    // Query Service
    const queryService = new QueryService('order-query-service', messageBus);
    const orderListModel = new SimpleReadModel();
    queryService.addReadModel('order-list', orderListModel);

    // Register projections
    queryService.registerProjection('OrderCreated', 'order-list', orderCreatedProjection);
    queryService.registerProjection('OrderConfirmed', 'order-list', orderConfirmedProjection);

    // Register query handlers
    queryService.registerQueryHandler('GetOrder', getOrderHandler);
    queryService.registerQueryHandler('GetOrdersByCustomer', getOrdersByCustomerHandler);
    queryService.registerQueryHandler('GetOrdersByStatus', getOrdersByStatusHandler);

    // API Gateway
    const gateway = new APIGateway();
    gateway.setCommandService(commandService);
    gateway.addQueryService('orders', queryService);

    console.log('--- Creating Orders (via Command Service) ---\n');

    // Create orders
    const order1Id = crypto.randomUUID();
    await gateway.executeCommand({
        type: 'CreateOrder',
        aggregateId: order1Id,
        payload: {
            customerId: 'customer-1',
            items: [
                { productId: 'product-1', quantity: 2, price: 50 },
                { productId: 'product-2', quantity: 1, price: 30 }
            ],
            total: 130
        }
    });

    const order2Id = crypto.randomUUID();
    await gateway.executeCommand({
        type: 'CreateOrder',
        aggregateId: order2Id,
        payload: {
            customerId: 'customer-1',
            items: [
                { productId: 'product-3', quantity: 1, price: 100 }
            ],
            total: 100
        }
    });

    const order3Id = crypto.randomUUID();
    await gateway.executeCommand({
        type: 'CreateOrder',
        aggregateId: order3Id,
        payload: {
            customerId: 'customer-2',
            items: [
                { productId: 'product-1', quantity: 5, price: 50 }
            ],
            total: 250
        }
    });

    // Wait for projections to update
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('\n--- Querying Orders (via Query Service) ---\n');

    // Get specific order
    const order1 = await gateway.executeQuery('orders', {
        type: 'GetOrder',
        parameters: { orderId: order1Id }
    });
    console.log('Order 1:', JSON.stringify(order1.data, null, 2));

    // Get orders by customer
    const customer1Orders = await gateway.executeQuery('orders', {
        type: 'GetOrdersByCustomer',
        parameters: { customerId: 'customer-1' }
    });
    console.log(`\nCustomer 1 orders: ${customer1Orders.data.length}`);

    // Get orders by status
    const createdOrders = await gateway.executeQuery('orders', {
        type: 'GetOrdersByStatus',
        parameters: { status: 'created' }
    });
    console.log(`\nOrders with status 'created': ${createdOrders.data.length}`);

    console.log('\n--- Confirming Order ---\n');

    await gateway.executeCommand({
        type: 'ConfirmOrder',
        aggregateId: order1Id,
        payload: {}
    });

    // Wait for projection
    await new Promise(resolve => setTimeout(resolve, 100));

    // Query confirmed orders
    const confirmedOrders = await gateway.executeQuery('orders', {
        type: 'GetOrdersByStatus',
        parameters: { status: 'confirmed' }
    });
    console.log(`Orders with status 'confirmed': ${confirmedOrders.data.length}`);

    console.log('\n--- Event Store Statistics ---\n');
    console.log(JSON.stringify(eventStore.getStats(), null, 2));

    console.log('\n--- Read Model Statistics ---\n');
    console.log(`Orders in read model: ${orderListModel.size()}`);

    console.log('\n--- Sample Events ---\n');
    const order1Events = eventStore.getEvents(order1Id);
    order1Events.forEach(event => {
        console.log(`  ${event.type} (v${event.version}) at ${event.timestamp}`);
    });

    console.log('\n--- Architecture Benefits ---');
    console.log('- Command and Query services can scale independently');
    console.log('- Read models optimized for specific query patterns');
    console.log('- Event-driven synchronization between services');
    console.log('- Services can be deployed and updated independently');
}

// Run demonstration
if (require.main === module) {
    demonstrateCQRSMicroservices().catch(console.error);
}

module.exports = {
    ServiceMessage,
    MessageBus,
    DistributedEventStore,
    CommandService,
    QueryService,
    SimpleReadModel,
    APIGateway,
    Order
};
