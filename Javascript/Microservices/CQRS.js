/**
 * CQRS (Command Query Responsibility Segregation) Pattern
 *
 * Purpose: Separate read and write operations into different models.
 * Commands modify state, queries retrieve data. This allows independent
 * optimization, scaling, and evolution of read and write sides.
 *
 * Key Components:
 * - Command: Represents an intent to change state
 * - Command Handler: Executes commands and updates write model
 * - Query: Represents a request for data
 * - Query Handler: Retrieves data from read model
 * - Write Model: Optimized for updates
 * - Read Model: Optimized for queries
 * - Event Store: Records all state changes
 * - Projection: Builds read models from events
 *
 * Benefits:
 * - Independent scaling of reads and writes
 * - Optimized data models for different purposes
 * - Better performance
 * - Simplified complex domain models
 * - Event sourcing integration
 * - Multiple read models for different views
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Command - Represents an intent to change state
 * @class
 */
class Command {
    /**
     * Create a new command
     * @param {string} type - Command type
     * @param {string} aggregateId - ID of the aggregate
     * @param {Object} payload - Command payload
     * @param {Object} metadata - Additional metadata
     */
    constructor(type, aggregateId, payload, metadata = {}) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.metadata = {
            ...metadata,
            timestamp: new Date().toISOString(),
            userId: metadata.userId || null
        };
    }
}

/**
 * Query - Represents a request for data
 * @class
 */
class Query {
    /**
     * Create a new query
     * @param {string} type - Query type
     * @param {Object} parameters - Query parameters
     */
    constructor(type, parameters = {}) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.parameters = parameters;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Domain Event - Represents something that happened
 * @class
 */
class DomainEvent {
    /**
     * Create a new domain event
     * @param {string} type - Event type
     * @param {string} aggregateId - ID of the aggregate
     * @param {Object} payload - Event payload
     * @param {number} version - Event version
     */
    constructor(type, aggregateId, payload, version) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.version = version;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Command Bus - Routes commands to handlers
 * @class
 * @extends EventEmitter
 */
class CommandBus extends EventEmitter {
    constructor() {
        super();
        this.handlers = new Map();
        this.middleware = [];
    }

    /**
     * Register a command handler
     * @param {string} commandType - Type of command
     * @param {Object} handler - Handler instance
     */
    registerHandler(commandType, handler) {
        if (this.handlers.has(commandType)) {
            throw new Error(`Handler for ${commandType} already registered`);
        }
        this.handlers.set(commandType, handler);
        console.log(`[CommandBus] Registered handler for ${commandType}`);
    }

    /**
     * Add middleware to the command bus
     * @param {Function} middleware - Middleware function
     */
    use(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * Execute a command
     * @param {Command} command - Command to execute
     * @returns {Promise<Object>} Command execution result
     */
    async execute(command) {
        if (!(command instanceof Command)) {
            throw new Error('Invalid command');
        }

        console.log(`[CommandBus] Executing command: ${command.type}`);

        // Run middleware
        let processedCommand = command;
        for (const middleware of this.middleware) {
            processedCommand = await middleware(processedCommand);
            if (!processedCommand) {
                throw new Error('Command rejected by middleware');
            }
        }

        const handler = this.handlers.get(command.type);
        if (!handler) {
            throw new Error(`No handler for command: ${command.type}`);
        }

        try {
            const result = await handler.handle(processedCommand);
            this.emit('command-executed', { command, result });
            return result;
        } catch (error) {
            this.emit('command-failed', { command, error });
            throw error;
        }
    }
}

/**
 * Query Bus - Routes queries to handlers
 * @class
 * @extends EventEmitter
 */
class QueryBus extends EventEmitter {
    constructor() {
        super();
        this.handlers = new Map();
        this.cache = new Map();
        this.cacheEnabled = false;
    }

    /**
     * Register a query handler
     * @param {string} queryType - Type of query
     * @param {Object} handler - Handler instance
     */
    registerHandler(queryType, handler) {
        if (this.handlers.has(queryType)) {
            throw new Error(`Handler for ${queryType} already registered`);
        }
        this.handlers.set(queryType, handler);
        console.log(`[QueryBus] Registered handler for ${queryType}`);
    }

    /**
     * Enable query result caching
     * @param {number} ttl - Time to live in milliseconds
     */
    enableCache(ttl = 60000) {
        this.cacheEnabled = true;
        this.cacheTTL = ttl;
    }

    /**
     * Execute a query
     * @param {Query} query - Query to execute
     * @returns {Promise<Object>} Query execution result
     */
    async execute(query) {
        if (!(query instanceof Query)) {
            throw new Error('Invalid query');
        }

        console.log(`[QueryBus] Executing query: ${query.type}`);

        // Check cache
        if (this.cacheEnabled) {
            const cacheKey = this.getCacheKey(query);
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() < cached.expiresAt) {
                console.log(`[QueryBus] Cache hit for ${query.type}`);
                return cached.data;
            }
        }

        const handler = this.handlers.get(query.type);
        if (!handler) {
            throw new Error(`No handler for query: ${query.type}`);
        }

        try {
            const result = await handler.handle(query);
            this.emit('query-executed', { query, result });

            // Cache result
            if (this.cacheEnabled) {
                const cacheKey = this.getCacheKey(query);
                this.cache.set(cacheKey, {
                    data: result,
                    expiresAt: Date.now() + this.cacheTTL
                });
            }

            return result;
        } catch (error) {
            this.emit('query-failed', { query, error });
            throw error;
        }
    }

    /**
     * Generate cache key for query
     * @param {Query} query - Query to generate key for
     * @returns {string} Cache key
     */
    getCacheKey(query) {
        return `${query.type}:${JSON.stringify(query.parameters)}`;
    }

    /**
     * Clear query cache
     */
    clearCache() {
        this.cache.clear();
    }
}

/**
 * Event Store - Stores all domain events
 * @class
 * @extends EventEmitter
 */
class EventStore extends EventEmitter {
    constructor() {
        super();
        this.events = [];
        this.snapshots = new Map();
        this.subscriptions = [];
    }

    /**
     * Append events to the store
     * @param {string} aggregateId - ID of the aggregate
     * @param {Array<DomainEvent>} events - Events to append
     * @param {number} expectedVersion - Expected version for optimistic locking
     * @returns {Promise<void>}
     */
    async appendEvents(aggregateId, events, expectedVersion) {
        const existingEvents = this.getEvents(aggregateId);
        const currentVersion = existingEvents.length;

        if (expectedVersion !== null && currentVersion !== expectedVersion) {
            throw new Error('Concurrency conflict');
        }

        for (const event of events) {
            this.events.push(event);
            this.emit('event-appended', event);

            // Notify subscribers
            for (const subscription of this.subscriptions) {
                try {
                    await subscription.handler(event);
                } catch (error) {
                    console.error('[EventStore] Subscription error:', error);
                }
            }
        }

        console.log(`[EventStore] Appended ${events.length} events for ${aggregateId}`);
    }

    /**
     * Get events for an aggregate
     * @param {string} aggregateId - ID of the aggregate
     * @param {number} fromVersion - Starting version
     * @returns {Array<DomainEvent>} List of events
     */
    getEvents(aggregateId, fromVersion = 0) {
        return this.events
            .filter(e => e.aggregateId === aggregateId && e.version > fromVersion)
            .sort((a, b) => a.version - b.version);
    }

    /**
     * Get all events
     * @returns {Array<DomainEvent>} All events
     */
    getAllEvents() {
        return [...this.events];
    }

    /**
     * Subscribe to events
     * @param {Function} handler - Event handler function
     * @returns {Function} Unsubscribe function
     */
    subscribe(handler) {
        const subscription = { handler };
        this.subscriptions.push(subscription);
        return () => {
            const index = this.subscriptions.indexOf(subscription);
            if (index > -1) {
                this.subscriptions.splice(index, 1);
            }
        };
    }

    /**
     * Save aggregate snapshot
     * @param {string} aggregateId - ID of the aggregate
     * @param {Object} state - Aggregate state
     * @param {number} version - Snapshot version
     * @returns {Promise<void>}
     */
    async saveSnapshot(aggregateId, state, version) {
        this.snapshots.set(aggregateId, {
            aggregateId,
            state,
            version,
            timestamp: new Date().toISOString()
        });
        console.log(`[EventStore] Snapshot saved for ${aggregateId} at version ${version}`);
    }

    /**
     * Get aggregate snapshot
     * @param {string} aggregateId - ID of the aggregate
     * @returns {Promise<Object|null>} Snapshot or null
     */
    async getSnapshot(aggregateId) {
        return this.snapshots.get(aggregateId) || null;
    }
}

/**
 * Write Model - Aggregate Root
 * @class
 */
class AggregateRoot {
    /**
     * Create a new aggregate root
     * @param {string} id - Aggregate ID
     */
    constructor(id) {
        this.id = id;
        this.version = 0;
        this.uncommittedEvents = [];
    }

    /**
     * Apply and record an event
     * @param {DomainEvent} event - Event to apply
     */
    applyEvent(event) {
        this.version = event.version;
        this.uncommittedEvents.push(event);
    }

    /**
     * Get uncommitted events
     * @returns {Array<DomainEvent>} Uncommitted events
     */
    getUncommittedEvents() {
        return [...this.uncommittedEvents];
    }

    /**
     * Clear uncommitted events
     */
    clearUncommittedEvents() {
        this.uncommittedEvents = [];
    }

    /**
     * Load aggregate from event history
     * @param {Array<DomainEvent>} events - Event history
     */
    loadFromHistory(events) {
        for (const event of events) {
            this.apply(event);
            this.version = event.version;
        }
    }

    /**
     * Apply an event to update state
     * @param {DomainEvent} event - Event to apply
     */
    apply(event) {
        const handler = this[`on${event.type}`];
        if (handler) {
            handler.call(this, event);
        }
    }
}

/**
 * Read Model - Projection
 * @class
 */
class ReadModel {
    /**
     * Create a new read model
     * @param {string} name - Read model name
     */
    constructor(name) {
        this.name = name;
        this.data = new Map();
        this.indexes = new Map();
    }

    /**
     * Set data in read model
     * @param {string} key - Data key
     * @param {Object} value - Data value
     */
    set(key, value) {
        this.data.set(key, value);
        this.updateIndexes(key, value);
    }

    /**
     * Get data from read model
     * @param {string} key - Data key
     * @returns {Object|null} Data value or null
     */
    get(key) {
        return this.data.get(key) || null;
    }

    /**
     * Query read model with filter
     * @param {Object} filter - Query filter
     * @returns {Array<Object>} Query results
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
     * @returns {boolean} True if matches
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
     * Update indexes for faster queries
     * @param {string} key - Data key
     * @param {Object} value - Data value
     */
    updateIndexes(key, value) {
        // Index by category if exists
        if (value.category) {
            if (!this.indexes.has('category')) {
                this.indexes.set('category', new Map());
            }
            const categoryIndex = this.indexes.get('category');
            if (!categoryIndex.has(value.category)) {
                categoryIndex.set(value.category, new Set());
            }
            categoryIndex.get(value.category).add(key);
        }
    }

    /**
     * Clear read model
     */
    clear() {
        this.data.clear();
        this.indexes.clear();
    }

    /**
     * Get read model size
     * @returns {number} Number of items
     */
    size() {
        return this.data.size;
    }
}

/**
 * Projection Engine - Builds read models from events
 * @class
 * @extends EventEmitter
 */
class ProjectionEngine extends EventEmitter {
    /**
     * Create a new projection engine
     * @param {EventStore} eventStore - Event store instance
     */
    constructor(eventStore) {
        super();
        this.eventStore = eventStore;
        this.projections = new Map();
        this.eventHandlers = new Map();

        this.eventStore.on('event-appended', async (event) => {
            await this.processEvent(event);
        });
    }

    /**
     * Register a projection
     * @param {string} eventType - Type of event
     * @param {string} readModelName - Name of read model
     * @param {Function} handler - Projection handler
     */
    registerProjection(eventType, readModelName, handler) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }

        this.eventHandlers.get(eventType).push({
            readModelName,
            handler
        });

        console.log(`[ProjectionEngine] Registered projection for ${eventType} -> ${readModelName}`);
    }

    /**
     * Add a read model
     * @param {ReadModel} readModel - Read model instance
     */
    addReadModel(readModel) {
        this.projections.set(readModel.name, readModel);
    }

    /**
     * Get a read model
     * @param {string} name - Read model name
     * @returns {ReadModel|undefined} Read model
     */
    getReadModel(name) {
        return this.projections.get(name);
    }

    /**
     * Process an event
     * @param {DomainEvent} event - Event to process
     * @returns {Promise<void>}
     */
    async processEvent(event) {
        const handlers = this.eventHandlers.get(event.type) || [];

        for (const { readModelName, handler } of handlers) {
            const readModel = this.projections.get(readModelName);
            if (readModel) {
                try {
                    await handler(readModel, event);
                    this.emit('projection-updated', { readModelName, event });
                } catch (error) {
                    console.error(`[ProjectionEngine] Error updating ${readModelName}:`, error);
                    this.emit('projection-error', { readModelName, event, error });
                }
            }
        }
    }

    /**
     * Rebuild a projection from scratch
     * @param {string} readModelName - Name of read model to rebuild
     * @returns {Promise<void>}
     */
    async rebuildProjection(readModelName) {
        const readModel = this.projections.get(readModelName);
        if (!readModel) {
            throw new Error(`Read model ${readModelName} not found`);
        }

        console.log(`[ProjectionEngine] Rebuilding ${readModelName}...`);
        readModel.clear();

        const allEvents = this.eventStore.getAllEvents();
        for (const event of allEvents) {
            await this.processEvent(event);
        }

        console.log(`[ProjectionEngine] Rebuilt ${readModelName} (${readModel.size()} items)`);
    }
}

// Example Domain: E-commerce Product Catalog

/**
 * Product Aggregate (Write Model)
 * @class
 * @extends AggregateRoot
 */
class Product extends AggregateRoot {
    constructor(id) {
        super(id);
        this.name = null;
        this.price = 0;
        this.stock = 0;
        this.category = null;
        this.isActive = false;
        this.reviews = [];
        this.rating = 0;
    }

    /**
     * Create a new product
     * @param {string} name - Product name
     * @param {number} price - Product price
     * @param {string} category - Product category
     * @param {number} stock - Initial stock
     */
    create(name, price, category, stock) {
        if (this.name) {
            throw new Error('Product already created');
        }

        const event = new DomainEvent('ProductCreated', this.id, {
            name,
            price,
            category,
            stock
        }, this.version + 1);

        this.apply(event);
        this.applyEvent(event);
    }

    onProductCreated(event) {
        this.name = event.payload.name;
        this.price = event.payload.price;
        this.category = event.payload.category;
        this.stock = event.payload.stock;
        this.isActive = true;
    }

    /**
     * Update product price
     * @param {number} newPrice - New price
     */
    updatePrice(newPrice) {
        if (!this.isActive) {
            throw new Error('Product is not active');
        }
        if (newPrice < 0) {
            throw new Error('Price cannot be negative');
        }

        const event = new DomainEvent('ProductPriceUpdated', this.id, {
            oldPrice: this.price,
            newPrice
        }, this.version + 1);

        this.apply(event);
        this.applyEvent(event);
    }

    onProductPriceUpdated(event) {
        this.price = event.payload.newPrice;
    }

    /**
     * Adjust product stock
     * @param {number} quantity - Quantity adjustment (positive or negative)
     */
    adjustStock(quantity) {
        if (!this.isActive) {
            throw new Error('Product is not active');
        }

        if (this.stock + quantity < 0) {
            throw new Error('Insufficient stock');
        }

        const event = new DomainEvent('ProductStockAdjusted', this.id, {
            oldStock: this.stock,
            adjustment: quantity,
            newStock: this.stock + quantity
        }, this.version + 1);

        this.apply(event);
        this.applyEvent(event);
    }

    onProductStockAdjusted(event) {
        this.stock = event.payload.newStock;
    }

    /**
     * Add product review
     * @param {string} customerId - Customer ID
     * @param {number} rating - Rating (1-5)
     * @param {string} comment - Review comment
     */
    addReview(customerId, rating, comment) {
        if (!this.isActive) {
            throw new Error('Product is not active');
        }
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        const event = new DomainEvent('ProductReviewAdded', this.id, {
            customerId,
            rating,
            comment
        }, this.version + 1);

        this.apply(event);
        this.applyEvent(event);
    }

    onProductReviewAdded(event) {
        this.reviews.push({
            customerId: event.payload.customerId,
            rating: event.payload.rating,
            comment: event.payload.comment,
            timestamp: event.timestamp
        });
        this.calculateAverageRating();
    }

    /**
     * Deactivate product
     */
    deactivate() {
        if (!this.isActive) {
            throw new Error('Product is already inactive');
        }

        const event = new DomainEvent('ProductDeactivated', this.id, {}, this.version + 1);
        this.apply(event);
        this.applyEvent(event);
    }

    onProductDeactivated(event) {
        this.isActive = false;
    }

    /**
     * Calculate average rating
     */
    calculateAverageRating() {
        if (this.reviews.length === 0) {
            this.rating = 0;
            return;
        }
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.rating = sum / this.reviews.length;
    }
}

/**
 * Command Handlers
 */

/**
 * Create Product Command Handler
 * @class
 */
class CreateProductCommandHandler {
    constructor(eventStore) {
        this.eventStore = eventStore;
    }

    async handle(command) {
        const product = new Product(command.aggregateId);
        const { name, price, category, stock } = command.payload;

        product.create(name, price, category, stock);

        const events = product.getUncommittedEvents();
        await this.eventStore.appendEvents(product.id, events, null);

        return { productId: product.id };
    }
}

/**
 * Update Product Price Command Handler
 * @class
 */
class UpdateProductPriceCommandHandler {
    constructor(eventStore) {
        this.eventStore = eventStore;
    }

    async handle(command) {
        const events = this.eventStore.getEvents(command.aggregateId);
        if (events.length === 0) {
            throw new Error('Product not found');
        }

        const product = new Product(command.aggregateId);
        product.loadFromHistory(events);

        product.updatePrice(command.payload.newPrice);

        const newEvents = product.getUncommittedEvents();
        await this.eventStore.appendEvents(product.id, newEvents, product.version - newEvents.length);

        return { productId: product.id };
    }
}

/**
 * Adjust Product Stock Command Handler
 * @class
 */
class AdjustProductStockCommandHandler {
    constructor(eventStore) {
        this.eventStore = eventStore;
    }

    async handle(command) {
        const events = this.eventStore.getEvents(command.aggregateId);
        if (events.length === 0) {
            throw new Error('Product not found');
        }

        const product = new Product(command.aggregateId);
        product.loadFromHistory(events);

        product.adjustStock(command.payload.quantity);

        const newEvents = product.getUncommittedEvents();
        await this.eventStore.appendEvents(product.id, newEvents, product.version - newEvents.length);

        return { productId: product.id };
    }
}

/**
 * Add Product Review Command Handler
 * @class
 */
class AddProductReviewCommandHandler {
    constructor(eventStore) {
        this.eventStore = eventStore;
    }

    async handle(command) {
        const events = this.eventStore.getEvents(command.aggregateId);
        if (events.length === 0) {
            throw new Error('Product not found');
        }

        const product = new Product(command.aggregateId);
        product.loadFromHistory(events);

        const { customerId, rating, comment } = command.payload;
        product.addReview(customerId, rating, comment);

        const newEvents = product.getUncommittedEvents();
        await this.eventStore.appendEvents(product.id, newEvents, product.version - newEvents.length);

        return { productId: product.id };
    }
}

/**
 * Deactivate Product Command Handler
 * @class
 */
class DeactivateProductCommandHandler {
    constructor(eventStore) {
        this.eventStore = eventStore;
    }

    async handle(command) {
        const events = this.eventStore.getEvents(command.aggregateId);
        if (events.length === 0) {
            throw new Error('Product not found');
        }

        const product = new Product(command.aggregateId);
        product.loadFromHistory(events);

        product.deactivate();

        const newEvents = product.getUncommittedEvents();
        await this.eventStore.appendEvents(product.id, newEvents, product.version - newEvents.length);

        return { productId: product.id };
    }
}

/**
 * Query Handlers
 */

/**
 * Get Product Query Handler
 * @class
 */
class GetProductQueryHandler {
    constructor(readModel) {
        this.readModel = readModel;
    }

    async handle(query) {
        const product = this.readModel.get(query.parameters.productId);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
}

/**
 * Get Products By Category Query Handler
 * @class
 */
class GetProductsByCategoryQueryHandler {
    constructor(readModel) {
        this.readModel = readModel;
    }

    async handle(query) {
        return this.readModel.query({ category: query.parameters.category });
    }
}

/**
 * Get Low Stock Products Query Handler
 * @class
 */
class GetLowStockProductsQueryHandler {
    constructor(readModel) {
        this.readModel = readModel;
    }

    async handle(query) {
        const threshold = query.parameters.threshold || 10;
        const allProducts = this.readModel.query({});
        return allProducts.filter(p => p.stock < threshold);
    }
}

/**
 * Get Top Rated Products Query Handler
 * @class
 */
class GetTopRatedProductsQueryHandler {
    constructor(readModel) {
        this.readModel = readModel;
    }

    async handle(query) {
        const limit = query.parameters.limit || 10;
        const allProducts = this.readModel.query({});
        return allProducts
            .filter(p => p.rating > 0)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }
}

/**
 * Setup product projections
 * @param {ProjectionEngine} projectionEngine - Projection engine
 * @param {ReadModel} productListReadModel - Product list read model
 */
function setupProductProjections(projectionEngine, productListReadModel) {
    // Product created
    projectionEngine.registerProjection('ProductCreated', 'product-list', (readModel, event) => {
        readModel.set(event.aggregateId, {
            id: event.aggregateId,
            name: event.payload.name,
            price: event.payload.price,
            category: event.payload.category,
            stock: event.payload.stock,
            isActive: true,
            reviews: [],
            rating: 0,
            createdAt: event.timestamp
        });
    });

    // Price updated
    projectionEngine.registerProjection('ProductPriceUpdated', 'product-list', (readModel, event) => {
        const product = readModel.get(event.aggregateId);
        if (product) {
            product.price = event.payload.newPrice;
            product.updatedAt = event.timestamp;
            readModel.set(event.aggregateId, product);
        }
    });

    // Stock adjusted
    projectionEngine.registerProjection('ProductStockAdjusted', 'product-list', (readModel, event) => {
        const product = readModel.get(event.aggregateId);
        if (product) {
            product.stock = event.payload.newStock;
            product.updatedAt = event.timestamp;
            readModel.set(event.aggregateId, product);
        }
    });

    // Review added
    projectionEngine.registerProjection('ProductReviewAdded', 'product-list', (readModel, event) => {
        const product = readModel.get(event.aggregateId);
        if (product) {
            product.reviews.push({
                customerId: event.payload.customerId,
                rating: event.payload.rating,
                comment: event.payload.comment,
                timestamp: event.timestamp
            });
            // Recalculate rating
            const sum = product.reviews.reduce((acc, review) => acc + review.rating, 0);
            product.rating = sum / product.reviews.length;
            product.updatedAt = event.timestamp;
            readModel.set(event.aggregateId, product);
        }
    });

    // Product deactivated
    projectionEngine.registerProjection('ProductDeactivated', 'product-list', (readModel, event) => {
        const product = readModel.get(event.aggregateId);
        if (product) {
            product.isActive = false;
            product.updatedAt = event.timestamp;
            readModel.set(event.aggregateId, product);
        }
    });
}

/**
 * Demonstration - 10 Comprehensive Scenarios
 */
async function demonstrateCQRS() {
    console.log('=== CQRS Pattern Demo - 10 Scenarios ===\n');

    // Setup infrastructure
    const eventStore = new EventStore();
    const commandBus = new CommandBus();
    const queryBus = new QueryBus();

    // Enable query caching
    queryBus.enableCache(30000);

    // Setup read models
    const productListReadModel = new ReadModel('product-list');
    const projectionEngine = new ProjectionEngine(eventStore);
    projectionEngine.addReadModel(productListReadModel);

    // Setup projections
    setupProductProjections(projectionEngine, productListReadModel);

    // Register command handlers
    commandBus.registerHandler('CreateProduct', new CreateProductCommandHandler(eventStore));
    commandBus.registerHandler('UpdateProductPrice', new UpdateProductPriceCommandHandler(eventStore));
    commandBus.registerHandler('AdjustProductStock', new AdjustProductStockCommandHandler(eventStore));
    commandBus.registerHandler('AddProductReview', new AddProductReviewCommandHandler(eventStore));
    commandBus.registerHandler('DeactivateProduct', new DeactivateProductCommandHandler(eventStore));

    // Register query handlers
    queryBus.registerHandler('GetProduct', new GetProductQueryHandler(productListReadModel));
    queryBus.registerHandler('GetProductsByCategory', new GetProductsByCategoryQueryHandler(productListReadModel));
    queryBus.registerHandler('GetLowStockProducts', new GetLowStockProductsQueryHandler(productListReadModel));
    queryBus.registerHandler('GetTopRatedProducts', new GetTopRatedProductsQueryHandler(productListReadModel));

    // Scenario 1: Create multiple products
    console.log('--- Scenario 1: Create Multiple Products ---\n');
    const productIds = [];

    const product1Id = crypto.randomUUID();
    productIds.push(product1Id);
    await commandBus.execute(new Command('CreateProduct', product1Id, {
        name: 'Laptop Pro 15',
        price: 1299.99,
        category: 'Electronics',
        stock: 15
    }));

    const product2Id = crypto.randomUUID();
    productIds.push(product2Id);
    await commandBus.execute(new Command('CreateProduct', product2Id, {
        name: 'Wireless Mouse',
        price: 39.99,
        category: 'Accessories',
        stock: 5
    }));

    const product3Id = crypto.randomUUID();
    productIds.push(product3Id);
    await commandBus.execute(new Command('CreateProduct', product3Id, {
        name: 'USB-C Cable',
        price: 19.99,
        category: 'Accessories',
        stock: 3
    }));

    const product4Id = crypto.randomUUID();
    productIds.push(product4Id);
    await commandBus.execute(new Command('CreateProduct', product4Id, {
        name: 'Mechanical Keyboard',
        price: 149.99,
        category: 'Accessories',
        stock: 12
    }));

    console.log(`Created ${productIds.length} products\n`);

    // Scenario 2: Query products by category
    console.log('--- Scenario 2: Query Products by Category ---\n');
    const accessories = await queryBus.execute(new Query('GetProductsByCategory', { category: 'Accessories' }));
    console.log(`Accessories (${accessories.length} items):`, JSON.stringify(accessories.map(p => p.name), null, 2));
    console.log();

    // Scenario 3: Update product prices
    console.log('--- Scenario 3: Update Product Prices ---\n');
    await commandBus.execute(new Command('UpdateProductPrice', product1Id, { newPrice: 1199.99 }));
    await commandBus.execute(new Command('UpdateProductPrice', product2Id, { newPrice: 34.99 }));
    console.log('Updated prices for 2 products\n');

    // Scenario 4: Adjust stock levels
    console.log('--- Scenario 4: Adjust Stock Levels ---\n');
    await commandBus.execute(new Command('AdjustProductStock', product1Id, { quantity: -3 }));
    await commandBus.execute(new Command('AdjustProductStock', product2Id, { quantity: -2 }));
    await commandBus.execute(new Command('AdjustProductStock', product3Id, { quantity: 10 }));
    console.log('Adjusted stock for 3 products\n');

    // Scenario 5: Add product reviews
    console.log('--- Scenario 5: Add Product Reviews ---\n');
    await commandBus.execute(new Command('AddProductReview', product1Id, {
        customerId: 'customer-1',
        rating: 5,
        comment: 'Excellent laptop, very fast!'
    }));
    await commandBus.execute(new Command('AddProductReview', product1Id, {
        customerId: 'customer-2',
        rating: 4,
        comment: 'Good performance but a bit expensive'
    }));
    await commandBus.execute(new Command('AddProductReview', product2Id, {
        customerId: 'customer-3',
        rating: 5,
        comment: 'Perfect mouse, very comfortable'
    }));
    console.log('Added 3 product reviews\n');

    // Scenario 6: Query specific product with reviews
    console.log('--- Scenario 6: Query Product with Reviews ---\n');
    const product1 = await queryBus.execute(new Query('GetProduct', { productId: product1Id }));
    console.log('Product details:', JSON.stringify({
        name: product1.name,
        price: product1.price,
        rating: product1.rating.toFixed(2),
        reviewCount: product1.reviews.length,
        stock: product1.stock
    }, null, 2));
    console.log();

    // Scenario 7: Query low stock products
    console.log('--- Scenario 7: Query Low Stock Products ---\n');
    const lowStock = await queryBus.execute(new Query('GetLowStockProducts', { threshold: 10 }));
    console.log(`Low stock products (${lowStock.length} items):`, JSON.stringify(lowStock.map(p => ({
        name: p.name,
        stock: p.stock
    })), null, 2));
    console.log();

    // Scenario 8: Query top rated products
    console.log('--- Scenario 8: Query Top Rated Products ---\n');
    const topRated = await queryBus.execute(new Query('GetTopRatedProducts', { limit: 5 }));
    console.log(`Top rated products (${topRated.length} items):`, JSON.stringify(topRated.map(p => ({
        name: p.name,
        rating: p.rating.toFixed(2),
        reviews: p.reviews.length
    })), null, 2));
    console.log();

    // Scenario 9: Deactivate product
    console.log('--- Scenario 9: Deactivate Product ---\n');
    await commandBus.execute(new Command('DeactivateProduct', product3Id, {}));
    const deactivatedProduct = await queryBus.execute(new Query('GetProduct', { productId: product3Id }));
    console.log(`Deactivated product: ${deactivatedProduct.name}, Active: ${deactivatedProduct.isActive}\n`);

    // Scenario 10: Event sourcing and projection rebuild
    console.log('--- Scenario 10: Projection Rebuild ---\n');
    console.log('Event Store Statistics:');
    console.log(`Total events: ${eventStore.getAllEvents().length}`);

    console.log('\nProduct 1 Event History:');
    const product1Events = eventStore.getEvents(product1Id);
    product1Events.forEach(e => {
        console.log(`  ${e.type} (v${e.version}) at ${e.timestamp}`);
    });

    console.log('\nRebuilding projection...');
    await projectionEngine.rebuildProjection('product-list');
    console.log(`Projection rebuilt: ${productListReadModel.size()} products\n`);

    // Additional Scenarios
    console.log('--- Additional Scenarios ---\n');

    // Test query caching
    console.log('Testing query cache:');
    const start1 = Date.now();
    await queryBus.execute(new Query('GetProduct', { productId: product1Id }));
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    await queryBus.execute(new Query('GetProduct', { productId: product1Id }));
    const time2 = Date.now() - start2;
    console.log(`First query: ${time1}ms, Cached query: ${time2}ms\n`);

    // Test event subscription
    console.log('Testing event subscription:');
    const unsubscribe = eventStore.subscribe((event) => {
        console.log(`[Subscription] Received event: ${event.type}`);
    });

    const product5Id = crypto.randomUUID();
    await commandBus.execute(new Command('CreateProduct', product5Id, {
        name: 'Monitor 27"',
        price: 399.99,
        category: 'Electronics',
        stock: 8
    }));

    unsubscribe();
    console.log('Unsubscribed from events\n');

    // Final statistics
    console.log('--- Final Statistics ---');
    console.log(`Total products: ${productListReadModel.size()}`);
    console.log(`Total events: ${eventStore.getAllEvents().length}`);
    console.log(`Active products: ${productListReadModel.query({ isActive: true }).length}`);
    console.log(`Inactive products: ${productListReadModel.query({ isActive: false }).length}`);
}

// Run demonstration
if (require.main === module) {
    demonstrateCQRS().catch(console.error);
}

module.exports = {
    Command,
    Query,
    DomainEvent,
    CommandBus,
    QueryBus,
    EventStore,
    AggregateRoot,
    ReadModel,
    ProjectionEngine,
    Product
};
