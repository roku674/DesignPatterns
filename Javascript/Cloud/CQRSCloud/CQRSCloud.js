/**
 * CQRS Cloud Pattern Implementation
 *
 * Command Query Responsibility Segregation (CQRS) separates read and write operations
 * into different models. This cloud implementation includes distributed command handlers,
 * query processors, event buses, and eventual consistency management.
 *
 * Key Components:
 * - Command Bus: Routes commands to appropriate handlers
 * - Query Bus: Routes queries to read models
 * - Event Bus: Publishes domain events
 * - Command Handlers: Process write operations
 * - Query Handlers: Process read operations
 * - Read Model: Optimized for queries
 * - Write Model: Optimized for commands
 */

/**
 * Event Bus for publishing domain events
 */
class EventBus {
    constructor() {
        this.subscribers = new Map();
        this.eventStore = [];
    }

    subscribe(eventType, handler) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        this.subscribers.get(eventType).push(handler);
    }

    async publish(event) {
        this.eventStore.push({
            ...event,
            timestamp: new Date(),
            id: this.generateEventId()
        });

        const handlers = this.subscribers.get(event.type) || [];
        const promises = handlers.map(handler => {
            try {
                return Promise.resolve(handler(event));
            } catch (error) {
                console.error(`Error handling event ${event.type}:`, error);
                return Promise.resolve();
            }
        });

        await Promise.all(promises);
    }

    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getEvents(filter = {}) {
        let events = [...this.eventStore];

        if (filter.type) {
            events = events.filter(e => e.type === filter.type);
        }
        if (filter.aggregateId) {
            events = events.filter(e => e.aggregateId === filter.aggregateId);
        }
        if (filter.from) {
            events = events.filter(e => e.timestamp >= filter.from);
        }

        return events;
    }
}

/**
 * Command Bus for routing commands to handlers
 */
class CommandBus {
    constructor(eventBus) {
        this.handlers = new Map();
        this.eventBus = eventBus;
        this.commandLog = [];
    }

    registerHandler(commandType, handler) {
        if (this.handlers.has(commandType)) {
            throw new Error(`Handler already registered for command: ${commandType}`);
        }
        this.handlers.set(commandType, handler);
    }

    async execute(command) {
        const logEntry = {
            commandId: this.generateCommandId(),
            command,
            timestamp: new Date(),
            status: 'pending'
        };
        this.commandLog.push(logEntry);

        const handler = this.handlers.get(command.type);
        if (!handler) {
            logEntry.status = 'failed';
            logEntry.error = `No handler registered for command: ${command.type}`;
            throw new Error(logEntry.error);
        }

        try {
            const result = await handler(command, this.eventBus);
            logEntry.status = 'completed';
            logEntry.result = result;
            return result;
        } catch (error) {
            logEntry.status = 'failed';
            logEntry.error = error.message;
            throw error;
        }
    }

    generateCommandId() {
        return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getCommandHistory(filter = {}) {
        let commands = [...this.commandLog];

        if (filter.status) {
            commands = commands.filter(c => c.status === filter.status);
        }
        if (filter.type) {
            commands = commands.filter(c => c.command.type === filter.type);
        }

        return commands;
    }
}

/**
 * Query Bus for routing queries to handlers
 */
class QueryBus {
    constructor() {
        this.handlers = new Map();
        this.queryLog = [];
        this.cache = new Map();
    }

    registerHandler(queryType, handler) {
        if (this.handlers.has(queryType)) {
            throw new Error(`Handler already registered for query: ${queryType}`);
        }
        this.handlers.set(queryType, handler);
    }

    async execute(query, useCache = true) {
        const cacheKey = this.generateCacheKey(query);

        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
                return cached.data;
            }
        }

        const logEntry = {
            queryId: this.generateQueryId(),
            query,
            timestamp: new Date()
        };
        this.queryLog.push(logEntry);

        const handler = this.handlers.get(query.type);
        if (!handler) {
            throw new Error(`No handler registered for query: ${query.type}`);
        }

        const result = await handler(query);

        if (useCache) {
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
        }

        return result;
    }

    invalidateCache(pattern) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    generateQueryId() {
        return `qry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateCacheKey(query) {
        return `${query.type}_${JSON.stringify(query.params || {})}`;
    }
}

/**
 * Write Model - Optimized for commands
 */
class WriteModel {
    constructor() {
        this.aggregates = new Map();
    }

    getAggregate(id) {
        return this.aggregates.get(id);
    }

    saveAggregate(id, aggregate) {
        this.aggregates.set(id, {
            ...aggregate,
            version: (this.aggregates.get(id)?.version || 0) + 1,
            lastModified: new Date()
        });
    }

    deleteAggregate(id) {
        this.aggregates.delete(id);
    }

    getAllAggregates() {
        return Array.from(this.aggregates.values());
    }
}

/**
 * Read Model - Optimized for queries
 */
class ReadModel {
    constructor() {
        this.projections = new Map();
        this.indexes = new Map();
    }

    updateProjection(id, data) {
        this.projections.set(id, {
            ...data,
            lastUpdated: new Date()
        });
        this.updateIndexes(id, data);
    }

    getProjection(id) {
        return this.projections.get(id);
    }

    queryProjections(criteria) {
        const results = [];
        for (const [id, projection] of this.projections) {
            if (this.matchesCriteria(projection, criteria)) {
                results.push({ id, ...projection });
            }
        }
        return results;
    }

    matchesCriteria(projection, criteria) {
        for (const [key, value] of Object.entries(criteria)) {
            if (projection[key] !== value) {
                return false;
            }
        }
        return true;
    }

    updateIndexes(id, data) {
        // Create indexes for common query patterns
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string' || typeof value === 'number') {
                const indexKey = `${key}:${value}`;
                if (!this.indexes.has(indexKey)) {
                    this.indexes.set(indexKey, new Set());
                }
                this.indexes.get(indexKey).add(id);
            }
        }
    }

    queryByIndex(key, value) {
        const indexKey = `${key}:${value}`;
        const ids = this.indexes.get(indexKey) || new Set();
        return Array.from(ids).map(id => ({
            id,
            ...this.projections.get(id)
        }));
    }

    clear() {
        this.projections.clear();
        this.indexes.clear();
    }
}

/**
 * CQRS Cloud System orchestrator
 */
class CQRSCloudSystem {
    constructor() {
        this.eventBus = new EventBus();
        this.commandBus = new CommandBus(this.eventBus);
        this.queryBus = new QueryBus();
        this.writeModel = new WriteModel();
        this.readModel = new ReadModel();

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Sync read model when write model changes
        this.eventBus.subscribe('AggregateCreated', (event) => {
            this.readModel.updateProjection(event.aggregateId, event.data);
        });

        this.eventBus.subscribe('AggregateUpdated', (event) => {
            this.readModel.updateProjection(event.aggregateId, event.data);
        });

        this.eventBus.subscribe('AggregateDeleted', (event) => {
            // In a real system, might mark as deleted rather than remove
            this.readModel.updateProjection(event.aggregateId, {
                ...event.data,
                deleted: true
            });
        });
    }

    registerCommandHandler(commandType, handler) {
        this.commandBus.registerHandler(commandType, handler);
    }

    registerQueryHandler(queryType, handler) {
        this.queryBus.registerHandler(queryType, handler);
    }

    async executeCommand(command) {
        return await this.commandBus.execute(command);
    }

    async executeQuery(query, useCache = true) {
        return await this.queryBus.execute(query, useCache);
    }

    getMetrics() {
        return {
            commands: {
                total: this.commandBus.commandLog.length,
                completed: this.commandBus.getCommandHistory({ status: 'completed' }).length,
                failed: this.commandBus.getCommandHistory({ status: 'failed' }).length
            },
            queries: {
                total: this.queryBus.queryLog.length,
                cacheSize: this.queryBus.cache.size
            },
            events: {
                total: this.eventBus.eventStore.length
            },
            writeModel: {
                aggregates: this.writeModel.aggregates.size
            },
            readModel: {
                projections: this.readModel.projections.size,
                indexes: this.readModel.indexes.size
            }
        };
    }
}

/**
 * Example: E-commerce Order System using CQRS Cloud
 */
function demonstrateCQRSCloud() {
    console.log('=== CQRS Cloud Pattern Demonstration ===\n');

    const system = new CQRSCloudSystem();

    // Register Command Handlers
    system.registerCommandHandler('CreateOrder', async (command, eventBus) => {
        const orderId = `order_${Date.now()}`;
        const order = {
            id: orderId,
            customerId: command.customerId,
            items: command.items,
            totalAmount: command.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            status: 'created',
            createdAt: new Date()
        };

        system.writeModel.saveAggregate(orderId, order);

        await eventBus.publish({
            type: 'AggregateCreated',
            aggregateId: orderId,
            data: order
        });

        await eventBus.publish({
            type: 'OrderCreated',
            aggregateId: orderId,
            customerId: command.customerId,
            amount: order.totalAmount
        });

        return { orderId, status: 'created' };
    });

    system.registerCommandHandler('UpdateOrderStatus', async (command, eventBus) => {
        const order = system.writeModel.getAggregate(command.orderId);
        if (!order) {
            throw new Error(`Order not found: ${command.orderId}`);
        }

        const updatedOrder = {
            ...order,
            status: command.status,
            updatedAt: new Date()
        };

        system.writeModel.saveAggregate(command.orderId, updatedOrder);

        await eventBus.publish({
            type: 'AggregateUpdated',
            aggregateId: command.orderId,
            data: updatedOrder
        });

        await eventBus.publish({
            type: 'OrderStatusChanged',
            aggregateId: command.orderId,
            oldStatus: order.status,
            newStatus: command.status
        });

        return { orderId: command.orderId, status: command.status };
    });

    // Register Query Handlers
    system.registerQueryHandler('GetOrderById', async (query) => {
        const projection = system.readModel.getProjection(query.orderId);
        if (!projection) {
            throw new Error(`Order not found: ${query.orderId}`);
        }
        return projection;
    });

    system.registerQueryHandler('GetOrdersByCustomer', async (query) => {
        return system.readModel.queryByIndex('customerId', query.customerId);
    });

    system.registerQueryHandler('GetOrdersByStatus', async (query) => {
        return system.readModel.queryByIndex('status', query.status);
    });

    // Execute Commands
    console.log('1. Creating orders...');

    const order1 = system.executeCommand({
        type: 'CreateOrder',
        customerId: 'customer_123',
        items: [
            { productId: 'prod_1', name: 'Laptop', price: 1200, quantity: 1 },
            { productId: 'prod_2', name: 'Mouse', price: 25, quantity: 2 }
        ]
    });

    const order2 = system.executeCommand({
        type: 'CreateOrder',
        customerId: 'customer_123',
        items: [
            { productId: 'prod_3', name: 'Keyboard', price: 80, quantity: 1 }
        ]
    });

    Promise.all([order1, order2]).then(async ([result1, result2]) => {
        console.log('Order 1 created:', result1);
        console.log('Order 2 created:', result2);

        // Update order status
        console.log('\n2. Updating order status...');
        await system.executeCommand({
            type: 'UpdateOrderStatus',
            orderId: result1.orderId,
            status: 'processing'
        });

        // Execute Queries
        console.log('\n3. Querying orders...');

        const orderById = await system.executeQuery({
            type: 'GetOrderById',
            orderId: result1.orderId
        });
        console.log('Query by ID:', orderById);

        const customerOrders = await system.executeQuery({
            type: 'GetOrdersByCustomer',
            customerId: 'customer_123'
        });
        console.log('Customer orders:', customerOrders.length, 'orders');

        const processingOrders = await system.executeQuery({
            type: 'GetOrdersByStatus',
            status: 'processing'
        });
        console.log('Processing orders:', processingOrders.length, 'orders');

        // Show metrics
        console.log('\n4. System Metrics:');
        console.log(JSON.stringify(system.getMetrics(), null, 2));
    });
}

// Run demonstration
if (require.main === module) {
    demonstrateCQRSCloud();
}

module.exports = {
    EventBus,
    CommandBus,
    QueryBus,
    WriteModel,
    ReadModel,
    CQRSCloudSystem
};
