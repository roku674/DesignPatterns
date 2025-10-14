/**
 * CQRS Microservices Pattern
 *
 * Purpose: Implement CQRS (Command Query Responsibility Segregation) across multiple
 * microservices with separate services for commands and queries. This allows independent
 * scaling, deployment, and evolution of read and write services.
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
 *
 * @author Design Patterns Implementation
 * @version 2.0.0
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Service Message - Communication between services
 * @class
 */
class ServiceMessage {
    /**
     * Creates a service message
     * @param {string} type - Message type
     * @param {Object} payload - Message payload
     * @param {Object} metadata - Message metadata
     */
    constructor(type, payload, metadata = {}) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.payload = payload;
        this.metadata = {
            ...metadata,
            timestamp: new Date().toISOString(),
            serviceId: metadata.serviceId || null,
            correlationId: metadata.correlationId || crypto.randomUUID()
        };
    }

    /**
     * Create reply message
     * @param {string} replyType - Reply message type
     * @param {Object} replyPayload - Reply payload
     * @returns {ServiceMessage} Reply message
     */
    createReply(replyType, replyPayload) {
        return new ServiceMessage(replyType, replyPayload, {
            correlationId: this.metadata.correlationId,
            replyTo: this.id
        });
    }
}

/**
 * Message Bus - Inter-service communication
 * @class
 * @extends EventEmitter
 */
class MessageBus extends EventEmitter {
    constructor() {
        super();
        this.messages = [];
        this.subscriptions = new Map();
        this.dlq = []; // Dead letter queue
        this.maxRetries = 3;
    }

    /**
     * Publish message to bus
     * @async
     * @param {ServiceMessage} message - Message to publish
     */
    async publish(message) {
        console.log(`[MessageBus] Publishing: ${message.type}`);
        this.messages.push(message);
        this.emit('message', message);
        this.emit(message.type, message);
    }

    /**
     * Subscribe to message type
     * @param {string} messageType - Message type to subscribe to
     * @param {Function} handler - Handler function
     * @param {string} serviceId - Service ID
     */
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
                    await this.handleError(message, serviceId, error);
                }
            }
        });
    }

    /**
     * Handle message processing error
     * @async
     * @param {ServiceMessage} message - Failed message
     * @param {string} serviceId - Service that failed
     * @param {Error} error - Error that occurred
     */
    async handleError(message, serviceId, error) {
        console.error(`[MessageBus] Handler error in ${serviceId}:`, error.message);

        const retryCount = (message.metadata.retryCount || 0) + 1;

        if (retryCount < this.maxRetries) {
            message.metadata.retryCount = retryCount;
            console.log(`[MessageBus] Retrying message (attempt ${retryCount})`);
            await this.publish(message);
        } else {
            console.log(`[MessageBus] Moving message to DLQ after ${retryCount} attempts`);
            this.dlq.push({ message, serviceId, error: error.message, timestamp: new Date() });
        }
    }

    /**
     * Get message history
     * @returns {Array<ServiceMessage>} Message history
     */
    getMessageHistory() {
        return [...this.messages];
    }

    /**
     * Get dead letter queue
     * @returns {Array} Dead letter queue entries
     */
    getDeadLetterQueue() {
        return [...this.dlq];
    }

    /**
     * Get message statistics
     * @returns {Object} Message statistics
     */
    getStatistics() {
        return {
            totalMessages: this.messages.length,
            subscriptions: this.subscriptions.size,
            dlqSize: this.dlq.length
        };
    }
}

/**
 * Distributed Event Store - Shared across services
 * @class
 * @extends EventEmitter
 */
class DistributedEventStore extends EventEmitter {
    constructor() {
        super();
        this.events = [];
        this.partitions = new Map();
        this.subscriptions = [];
        this.snapshots = new Map();
        this.snapshotInterval = 10; // Create snapshot every N events
    }

    /**
     * Append event to store
     * @async
     * @param {Object} event - Event to append
     */
    async append(event) {
        event.sequence = this.events.length + 1;
        event.timestamp = event.timestamp || new Date().toISOString();
        this.events.push(event);

        // Partition by aggregate ID for efficient querying
        if (!this.partitions.has(event.aggregateId)) {
            this.partitions.set(event.aggregateId, []);
        }
        this.partitions.get(event.aggregateId).push(event);

        // Create snapshot if needed
        const aggregateEvents = this.partitions.get(event.aggregateId);
        if (aggregateEvents.length % this.snapshotInterval === 0) {
            await this.createSnapshot(event.aggregateId, aggregateEvents);
        }

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

    /**
     * Create snapshot of aggregate state
     * @async
     * @param {string} aggregateId - Aggregate ID
     * @param {Array} events - Events to snapshot
     */
    async createSnapshot(aggregateId, events) {
        const snapshot = {
            aggregateId,
            version: events.length,
            timestamp: new Date().toISOString(),
            events: events.slice(-this.snapshotInterval)
        };
        this.snapshots.set(aggregateId, snapshot);
        console.log(`[EventStore] Created snapshot for ${aggregateId} at version ${snapshot.version}`);
    }

    /**
     * Get events for aggregate
     * @param {string} aggregateId - Aggregate ID
     * @param {number} fromVersion - Start version
     * @returns {Array} Events
     */
    getEvents(aggregateId, fromVersion = 0) {
        const events = this.partitions.get(aggregateId) || [];
        return events.filter(e => e.version > fromVersion);
    }

    /**
     * Get all events
     * @param {number} fromSequence - Start sequence
     * @returns {Array} Events
     */
    getAllEvents(fromSequence = 0) {
        return this.events.filter(e => e.sequence > fromSequence);
    }

    /**
     * Subscribe to events
     * @param {Function} handler - Handler function
     * @param {string} serviceId - Service ID
     */
    subscribe(handler, serviceId) {
        this.subscriptions.push({ handler, serviceId });
    }

    /**
     * Get snapshot for aggregate
     * @param {string} aggregateId - Aggregate ID
     * @returns {Object|null} Snapshot or null
     */
    getSnapshot(aggregateId) {
        return this.snapshots.get(aggregateId) || null;
    }

    /**
     * Get event store statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            totalEvents: this.events.length,
            partitions: this.partitions.size,
            subscriptions: this.subscriptions.length,
            snapshots: this.snapshots.size
        };
    }

    /**
     * Replay events for aggregate
     * @async
     * @param {string} aggregateId - Aggregate ID
     * @param {Function} handler - Event handler
     */
    async replayEvents(aggregateId, handler) {
        const events = this.getEvents(aggregateId);
        for (const event of events) {
            await handler(event);
        }
    }
}

/**
 * Command Service - Handles all write operations
 * @class
 * @extends EventEmitter
 */
class CommandService extends EventEmitter {
    /**
     * Creates command service
     * @param {string} serviceId - Service ID
     * @param {DistributedEventStore} eventStore - Event store
     * @param {MessageBus} messageBus - Message bus
     */
    constructor(serviceId, eventStore, messageBus) {
        super();
        this.serviceId = serviceId;
        this.eventStore = eventStore;
        this.messageBus = messageBus;
        this.commandHandlers = new Map();
        this.validators = new Map();
        this.interceptors = [];
        this.metrics = {
            commandsProcessed: 0,
            commandsFailed: 0,
            averageExecutionTime: 0
        };
    }

    /**
     * Register command handler
     * @param {string} commandType - Command type
     * @param {Function} handler - Handler function
     */
    registerHandler(commandType, handler) {
        this.commandHandlers.set(commandType, handler);
        console.log(`[${this.serviceId}] Registered handler for ${commandType}`);
    }

    /**
     * Register command validator
     * @param {string} commandType - Command type
     * @param {Function} validator - Validator function
     */
    registerValidator(commandType, validator) {
        this.validators.set(commandType, validator);
    }

    /**
     * Add interceptor for commands
     * @param {Function} interceptor - Interceptor function
     */
    addInterceptor(interceptor) {
        this.interceptors.push(interceptor);
    }

    /**
     * Execute command
     * @async
     * @param {Object} command - Command to execute
     * @returns {Promise<Object>} Execution result
     */
    async executeCommand(command) {
        const startTime = Date.now();
        console.log(`[${this.serviceId}] Executing command: ${command.type}`);

        try {
            // Run interceptors
            for (const interceptor of this.interceptors) {
                command = await interceptor(command);
            }

            // Validate command
            const validator = this.validators.get(command.type);
            if (validator) {
                const validation = await validator(command);
                if (!validation.valid) {
                    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
                }
            }

            // Get handler
            const handler = this.commandHandlers.get(command.type);
            if (!handler) {
                throw new Error(`No handler for command: ${command.type}`);
            }

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
                        serviceId: this.serviceId,
                        commandType: command.type
                    }));
                }
            }

            // Update metrics
            const executionTime = Date.now() - startTime;
            this.updateMetrics(true, executionTime);

            console.log(`[${this.serviceId}] Command executed successfully in ${executionTime}ms`);
            return result.data;
        } catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(false, executionTime);
            console.error(`[${this.serviceId}] Command execution failed:`, error);
            throw error;
        }
    }

    /**
     * Update service metrics
     * @param {boolean} success - Whether command succeeded
     * @param {number} executionTime - Execution time in ms
     */
    updateMetrics(success, executionTime) {
        if (success) {
            this.metrics.commandsProcessed++;
        } else {
            this.metrics.commandsFailed++;
        }

        const total = this.metrics.commandsProcessed + this.metrics.commandsFailed;
        this.metrics.averageExecutionTime =
            ((this.metrics.averageExecutionTime * (total - 1)) + executionTime) / total;
    }

    /**
     * Handle service request
     * @async
     * @param {Object} request - Service request
     * @returns {Promise<Object>} Response
     */
    async handleRequest(request) {
        const { command } = request.payload;
        const result = await this.executeCommand(command);
        return { success: true, data: result };
    }

    /**
     * Get service metrics
     * @returns {Object} Service metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
}

/**
 * Query Service - Handles read operations
 * @class
 * @extends EventEmitter
 */
class QueryService extends EventEmitter {
    /**
     * Creates query service
     * @param {string} serviceId - Service ID
     * @param {MessageBus} messageBus - Message bus
     */
    constructor(serviceId, messageBus) {
        super();
        this.serviceId = serviceId;
        this.messageBus = messageBus;
        this.readModels = new Map();
        this.queryHandlers = new Map();
        this.projections = new Map();
        this.projectionLag = 0;
        this.metrics = {
            queriesProcessed: 0,
            queriesFailed: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        this.cache = new Map();
        this.cacheTTL = 60000; // 1 minute
    }

    /**
     * Add read model
     * @param {string} name - Read model name
     * @param {Object} readModel - Read model instance
     */
    addReadModel(name, readModel) {
        this.readModels.set(name, readModel);
        console.log(`[${this.serviceId}] Added read model: ${name}`);
    }

    /**
     * Register query handler
     * @param {string} queryType - Query type
     * @param {Function} handler - Handler function
     */
    registerQueryHandler(queryType, handler) {
        this.queryHandlers.set(queryType, handler);
        console.log(`[${this.serviceId}] Registered query handler: ${queryType}`);
    }

    /**
     * Register projection
     * @param {string} eventType - Event type
     * @param {string} readModelName - Read model name
     * @param {Function} projectionFn - Projection function
     */
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

    /**
     * Project event to read model
     * @async
     * @param {Object} event - Event to project
     */
    async projectEvent(event) {
        const projectionStartTime = Date.now();
        const projectionList = this.projections.get(event.type) || [];

        for (const { readModelName, projectionFn } of projectionList) {
            const readModel = this.readModels.get(readModelName);
            if (readModel) {
                try {
                    await projectionFn(readModel, event);
                    console.log(`[${this.serviceId}] Projected ${event.type} to ${readModelName}`);

                    // Invalidate cache for this read model
                    this.invalidateCache(readModelName);
                } catch (error) {
                    console.error(`[${this.serviceId}] Projection error:`, error);
                }
            }
        }

        this.projectionLag = Date.now() - projectionStartTime;
    }

    /**
     * Execute query
     * @async
     * @param {Object} query - Query to execute
     * @returns {Promise<Object>} Query result
     */
    async executeQuery(query) {
        console.log(`[${this.serviceId}] Executing query: ${query.type}`);

        try {
            // Check cache
            const cacheKey = this.getCacheKey(query);
            const cached = this.getFromCache(cacheKey);

            if (cached) {
                this.metrics.cacheHits++;
                return cached;
            }

            this.metrics.cacheMisses++;

            // Execute query
            const handler = this.queryHandlers.get(query.type);
            if (!handler) {
                throw new Error(`No handler for query: ${query.type}`);
            }

            const result = await handler(query, this.readModels);

            // Cache result
            this.setCache(cacheKey, result);

            this.metrics.queriesProcessed++;
            console.log(`[${this.serviceId}] Query executed successfully`);
            return result;
        } catch (error) {
            this.metrics.queriesFailed++;
            console.error(`[${this.serviceId}] Query execution failed:`, error);
            throw error;
        }
    }

    /**
     * Get cache key for query
     * @param {Object} query - Query object
     * @returns {string} Cache key
     */
    getCacheKey(query) {
        return `${query.type}:${JSON.stringify(query.parameters)}`;
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {*} Cached value or null
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.cacheTTL) {
            this.cache.delete(key);
            return null;
        }

        return cached.value;
    }

    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     */
    setCache(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    /**
     * Invalidate cache for read model
     * @param {string} readModelName - Read model name
     */
    invalidateCache(readModelName) {
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (key.includes(readModelName)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Handle service request
     * @async
     * @param {Object} request - Service request
     * @returns {Promise<Object>} Response
     */
    async handleRequest(request) {
        const { query } = request.payload;
        const result = await this.executeQuery(query);
        return { success: true, data: result };
    }

    /**
     * Get read model
     * @param {string} name - Read model name
     * @returns {Object|null} Read model
     */
    getReadModel(name) {
        return this.readModels.get(name);
    }

    /**
     * Get service metrics
     * @returns {Object} Service metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            projectionLag: this.projectionLag,
            cacheSize: this.cache.size
        };
    }
}

/**
 * Simple Read Model Implementation
 * @class
 */
class SimpleReadModel {
    constructor() {
        this.data = new Map();
        this.indexes = new Map();
    }

    /**
     * Set value
     * @param {string} key - Key
     * @param {*} value - Value
     */
    set(key, value) {
        this.data.set(key, value);
        this.updateIndexes(key, value);
    }

    /**
     * Get value
     * @param {string} key - Key
     * @returns {*} Value
     */
    get(key) {
        return this.data.get(key);
    }

    /**
     * Query data
     * @param {Object} filter - Filter criteria
     * @returns {Array} Matching items
     */
    query(filter = {}) {
        const results = [];
        for (const item of this.data.values()) {
            if (this.matches(item, filter)) {
                results.push(item);
            }
        }
        return results;
    }

    /**
     * Check if item matches filter
     * @param {Object} item - Item to check
     * @param {Object} filter - Filter criteria
     * @returns {boolean} Whether item matches
     */
    matches(item, filter) {
        for (const [key, value] of Object.entries(filter)) {
            if (item[key] !== value) {
                return false;
            }
        }
        return true;
    }

    /**
     * Update indexes
     * @param {string} key - Item key
     * @param {Object} value - Item value
     */
    updateIndexes(key, value) {
        // Simple indexing by specific fields
        if (value.status) {
            if (!this.indexes.has('status')) {
                this.indexes.set('status', new Map());
            }
            const statusIndex = this.indexes.get('status');
            if (!statusIndex.has(value.status)) {
                statusIndex.set(value.status, new Set());
            }
            statusIndex.get(value.status).add(key);
        }
    }

    /**
     * Delete value
     * @param {string} key - Key
     * @returns {boolean} Whether deleted
     */
    delete(key) {
        return this.data.delete(key);
    }

    /**
     * Clear all data
     */
    clear() {
        this.data.clear();
        this.indexes.clear();
    }

    /**
     * Get size
     * @returns {number} Number of items
     */
    size() {
        return this.data.size;
    }

    /**
     * Get all values
     * @returns {Array} All values
     */
    getAll() {
        return Array.from(this.data.values());
    }
}

/**
 * API Gateway - Routes requests to appropriate services
 * @class
 */
class APIGateway {
    constructor() {
        this.commandService = null;
        this.queryServices = new Map();
        this.circuitBreakers = new Map();
        this.requestLog = [];
    }

    /**
     * Set command service
     * @param {CommandService} service - Command service
     */
    setCommandService(service) {
        this.commandService = service;
    }

    /**
     * Add query service
     * @param {string} name - Service name
     * @param {QueryService} service - Query service
     */
    addQueryService(name, service) {
        this.queryServices.set(name, service);
    }

    /**
     * Execute command
     * @async
     * @param {Object} command - Command to execute
     * @returns {Promise<Object>} Result
     */
    async executeCommand(command) {
        if (!this.commandService) {
            throw new Error('Command service not configured');
        }

        const requestId = crypto.randomUUID();
        const startTime = Date.now();

        try {
            const result = await this.commandService.handleRequest({
                type: 'command',
                payload: { command },
                requestId
            });

            this.logRequest(requestId, 'command', command.type, Date.now() - startTime, true);
            return result;
        } catch (error) {
            this.logRequest(requestId, 'command', command.type, Date.now() - startTime, false);
            throw error;
        }
    }

    /**
     * Execute query
     * @async
     * @param {string} queryServiceName - Query service name
     * @param {Object} query - Query to execute
     * @returns {Promise<Object>} Result
     */
    async executeQuery(queryServiceName, query) {
        const service = this.queryServices.get(queryServiceName);
        if (!service) {
            throw new Error(`Query service ${queryServiceName} not found`);
        }

        const requestId = crypto.randomUUID();
        const startTime = Date.now();

        try {
            const result = await service.handleRequest({
                type: 'query',
                payload: { query },
                requestId
            });

            this.logRequest(requestId, 'query', query.type, Date.now() - startTime, true);
            return result;
        } catch (error) {
            this.logRequest(requestId, 'query', query.type, Date.now() - startTime, false);
            throw error;
        }
    }

    /**
     * Log request
     * @param {string} requestId - Request ID
     * @param {string} type - Request type
     * @param {string} operation - Operation name
     * @param {number} duration - Duration in ms
     * @param {boolean} success - Whether successful
     */
    logRequest(requestId, type, operation, duration, success) {
        this.requestLog.push({
            requestId,
            type,
            operation,
            duration,
            success,
            timestamp: new Date().toISOString()
        });

        // Keep only last 1000 requests
        if (this.requestLog.length > 1000) {
            this.requestLog.shift();
        }
    }

    /**
     * Get request statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        const total = this.requestLog.length;
        const successful = this.requestLog.filter(r => r.success).length;
        const avgDuration = total > 0
            ? this.requestLog.reduce((sum, r) => sum + r.duration, 0) / total
            : 0;

        return {
            totalRequests: total,
            successful,
            failed: total - successful,
            averageDuration: Math.round(avgDuration)
        };
    }
}

/**
 * Order Aggregate
 * @class
 */
class Order {
    /**
     * Creates order
     * @param {string} id - Order ID
     */
    constructor(id) {
        this.id = id;
        this.customerId = null;
        this.items = [];
        this.status = 'new';
        this.total = 0;
        this.version = 0;
    }

    /**
     * Create order from events
     * @static
     * @param {Array} events - Events to apply
     * @returns {Order} Reconstructed order
     */
    static createFromEvents(events) {
        const order = new Order(events[0].aggregateId);
        for (const event of events) {
            order.apply(event);
        }
        return order;
    }

    /**
     * Apply event to order
     * @param {Object} event - Event to apply
     */
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
            case 'OrderDelivered':
                this.status = 'delivered';
                this.deliveredAt = event.payload.deliveredAt;
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

/**
 * Create order command handler
 * @async
 * @param {Object} command - Create order command
 * @param {Array} existingEvents - Existing events
 * @returns {Promise<Object>} Result with events and data
 */
async function createOrderHandler(command, existingEvents) {
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

/**
 * Confirm order command handler
 * @async
 * @param {Object} command - Confirm order command
 * @param {Array} existingEvents - Existing events
 * @returns {Promise<Object>} Result with events and data
 */
async function confirmOrderHandler(command, existingEvents) {
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

/**
 * Ship order command handler
 * @async
 * @param {Object} command - Ship order command
 * @param {Array} existingEvents - Existing events
 * @returns {Promise<Object>} Result with events and data
 */
async function shipOrderHandler(command, existingEvents) {
    if (existingEvents.length === 0) {
        throw new Error('Order not found');
    }

    const order = Order.createFromEvents(existingEvents);
    if (order.status !== 'confirmed') {
        throw new Error(`Cannot ship order in status: ${order.status}`);
    }

    const event = {
        id: crypto.randomUUID(),
        type: 'OrderShipped',
        aggregateId: command.aggregateId,
        payload: command.payload,
        version: order.version + 1,
        timestamp: new Date().toISOString()
    };

    return {
        events: [event],
        data: { orderId: command.aggregateId, trackingNumber: command.payload.trackingNumber }
    };
}

/**
 * Cancel order command handler
 * @async
 * @param {Object} command - Cancel order command
 * @param {Array} existingEvents - Existing events
 * @returns {Promise<Object>} Result with events and data
 */
async function cancelOrderHandler(command, existingEvents) {
    if (existingEvents.length === 0) {
        throw new Error('Order not found');
    }

    const order = Order.createFromEvents(existingEvents);
    if (order.status === 'shipped' || order.status === 'delivered') {
        throw new Error(`Cannot cancel order in status: ${order.status}`);
    }

    const event = {
        id: crypto.randomUUID(),
        type: 'OrderCancelled',
        aggregateId: command.aggregateId,
        payload: command.payload,
        version: order.version + 1,
        timestamp: new Date().toISOString()
    };

    return {
        events: [event],
        data: { orderId: command.aggregateId }
    };
}

// Query Handlers

/**
 * Get order query handler
 * @async
 * @param {Object} query - Get order query
 * @param {Map} readModels - Read models
 * @returns {Promise<Object>} Order data
 */
async function getOrderHandler(query, readModels) {
    const orderListModel = readModels.get('order-list');
    const order = orderListModel.get(query.parameters.orderId);

    if (!order) {
        throw new Error('Order not found');
    }

    return order;
}

/**
 * Get orders by customer query handler
 * @async
 * @param {Object} query - Get orders by customer query
 * @param {Map} readModels - Read models
 * @returns {Promise<Array>} Orders
 */
async function getOrdersByCustomerHandler(query, readModels) {
    const orderListModel = readModels.get('order-list');
    return orderListModel.query({ customerId: query.parameters.customerId });
}

/**
 * Get orders by status query handler
 * @async
 * @param {Object} query - Get orders by status query
 * @param {Map} readModels - Read models
 * @returns {Promise<Array>} Orders
 */
async function getOrdersByStatusHandler(query, readModels) {
    const orderListModel = readModels.get('order-list');
    return orderListModel.query({ status: query.parameters.status });
}

/**
 * Get order statistics query handler
 * @async
 * @param {Object} query - Get order statistics query
 * @param {Map} readModels - Read models
 * @returns {Promise<Object>} Statistics
 */
async function getOrderStatisticsHandler(query, readModels) {
    const orderListModel = readModels.get('order-list');
    const allOrders = orderListModel.getAll();

    const stats = {
        total: allOrders.length,
        byStatus: {},
        totalRevenue: 0
    };

    for (const order of allOrders) {
        stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;
        stats.totalRevenue += order.total;
    }

    return stats;
}

// Projections

/**
 * Order created projection
 * @async
 * @param {Object} readModel - Read model
 * @param {Object} event - Event
 */
async function orderCreatedProjection(readModel, event) {
    readModel.set(event.aggregateId, {
        id: event.aggregateId,
        customerId: event.payload.customerId,
        items: event.payload.items,
        total: event.payload.total,
        status: 'created',
        createdAt: event.timestamp
    });
}

/**
 * Order confirmed projection
 * @async
 * @param {Object} readModel - Read model
 * @param {Object} event - Event
 */
async function orderConfirmedProjection(readModel, event) {
    const order = readModel.get(event.aggregateId);
    if (order) {
        order.status = 'confirmed';
        order.confirmedAt = event.timestamp;
        readModel.set(event.aggregateId, order);
    }
}

/**
 * Order shipped projection
 * @async
 * @param {Object} readModel - Read model
 * @param {Object} event - Event
 */
async function orderShippedProjection(readModel, event) {
    const order = readModel.get(event.aggregateId);
    if (order) {
        order.status = 'shipped';
        order.shippedAt = event.timestamp;
        order.shippingInfo = event.payload.shippingInfo;
        readModel.set(event.aggregateId, order);
    }
}

/**
 * Order cancelled projection
 * @async
 * @param {Object} readModel - Read model
 * @param {Object} event - Event
 */
async function orderCancelledProjection(readModel, event) {
    const order = readModel.get(event.aggregateId);
    if (order) {
        order.status = 'cancelled';
        order.cancelledAt = event.timestamp;
        order.cancellationReason = event.payload.reason;
        readModel.set(event.aggregateId, order);
    }
}

// Demonstration

/**
 * Demonstrate CQRS Microservices pattern
 * @async
 */
async function demonstrateCQRSMicroservices() {
    console.log('=== CQRS Microservices Pattern Demo ===\n');

    // Infrastructure
    const eventStore = new DistributedEventStore();
    const messageBus = new MessageBus();

    // Command Service
    const commandService = new CommandService('order-command-service', eventStore, messageBus);
    commandService.registerHandler('CreateOrder', createOrderHandler);
    commandService.registerHandler('ConfirmOrder', confirmOrderHandler);
    commandService.registerHandler('ShipOrder', shipOrderHandler);
    commandService.registerHandler('CancelOrder', cancelOrderHandler);

    // Query Service
    const queryService = new QueryService('order-query-service', messageBus);
    const orderListModel = new SimpleReadModel();
    queryService.addReadModel('order-list', orderListModel);

    // Register projections
    queryService.registerProjection('OrderCreated', 'order-list', orderCreatedProjection);
    queryService.registerProjection('OrderConfirmed', 'order-list', orderConfirmedProjection);
    queryService.registerProjection('OrderShipped', 'order-list', orderShippedProjection);
    queryService.registerProjection('OrderCancelled', 'order-list', orderCancelledProjection);

    // Register query handlers
    queryService.registerQueryHandler('GetOrder', getOrderHandler);
    queryService.registerQueryHandler('GetOrdersByCustomer', getOrdersByCustomerHandler);
    queryService.registerQueryHandler('GetOrdersByStatus', getOrdersByStatusHandler);
    queryService.registerQueryHandler('GetOrderStatistics', getOrderStatisticsHandler);

    // API Gateway
    const gateway = new APIGateway();
    gateway.setCommandService(commandService);
    gateway.addQueryService('orders', queryService);

    // Scenario 1: Create multiple orders
    console.log('--- Scenario 1: Creating Orders ---\n');

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

    // Wait for projections
    await new Promise(resolve => setTimeout(resolve, 100));

    // Scenario 2: Query orders
    console.log('\n--- Scenario 2: Querying Orders ---\n');

    const order1 = await gateway.executeQuery('orders', {
        type: 'GetOrder',
        parameters: { orderId: order1Id }
    });
    console.log('Order 1:', JSON.stringify(order1.data, null, 2));

    const customer1Orders = await gateway.executeQuery('orders', {
        type: 'GetOrdersByCustomer',
        parameters: { customerId: 'customer-1' }
    });
    console.log(`\nCustomer 1 orders: ${customer1Orders.data.length}`);

    // Scenario 3: Confirm and ship orders
    console.log('\n--- Scenario 3: Order Workflow ---\n');

    await gateway.executeCommand({
        type: 'ConfirmOrder',
        aggregateId: order1Id,
        payload: {}
    });

    await gateway.executeCommand({
        type: 'ShipOrder',
        aggregateId: order1Id,
        payload: {
            shippingInfo: {
                carrier: 'DHL',
                trackingNumber: 'TRK123456'
            }
        }
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Scenario 4: Check order statistics
    console.log('\n--- Scenario 4: Order Statistics ---\n');

    const stats = await gateway.executeQuery('orders', {
        type: 'GetOrderStatistics',
        parameters: {}
    });
    console.log('Order Statistics:', JSON.stringify(stats.data, null, 2));

    // Scenario 5: Cancel an order
    console.log('\n--- Scenario 5: Cancel Order ---\n');

    await gateway.executeCommand({
        type: 'CancelOrder',
        aggregateId: order2Id,
        payload: {
            reason: 'Customer requested cancellation'
        }
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const cancelledOrders = await gateway.executeQuery('orders', {
        type: 'GetOrdersByStatus',
        parameters: { status: 'cancelled' }
    });
    console.log(`Cancelled orders: ${cancelledOrders.data.length}`);

    // Scenario 6: Service metrics
    console.log('\n--- Scenario 6: Service Metrics ---\n');
    console.log('Command Service:', JSON.stringify(commandService.getMetrics(), null, 2));
    console.log('Query Service:', JSON.stringify(queryService.getMetrics(), null, 2));
    console.log('Gateway:', JSON.stringify(gateway.getStatistics(), null, 2));

    // Scenario 7: Event store statistics
    console.log('\n--- Scenario 7: Event Store ---\n');
    console.log(JSON.stringify(eventStore.getStats(), null, 2));

    // Scenario 8: Message bus statistics
    console.log('\n--- Scenario 8: Message Bus ---\n');
    console.log(JSON.stringify(messageBus.getStatistics(), null, 2));

    console.log('\n--- Architecture Benefits ---');
    console.log('- Command and Query services scale independently');
    console.log('- Read models optimized for specific query patterns');
    console.log('- Event-driven synchronization between services');
    console.log('- Services can be deployed and updated independently');
    console.log('- Built-in caching and performance optimization');
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
    Order,
    // Handlers
    createOrderHandler,
    confirmOrderHandler,
    shipOrderHandler,
    cancelOrderHandler,
    getOrderHandler,
    getOrdersByCustomerHandler,
    getOrdersByStatusHandler,
    getOrderStatisticsHandler,
    // Projections
    orderCreatedProjection,
    orderConfirmedProjection,
    orderShippedProjection,
    orderCancelledProjection
};
