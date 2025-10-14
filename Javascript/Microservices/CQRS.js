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
 */
class Command {
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
 */
class Query {
    constructor(type, parameters = {}) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.parameters = parameters;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Domain Event - Represents something that happened
 */
class DomainEvent {
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
 */
class CommandBus extends EventEmitter {
    constructor() {
        super();
        this.handlers = new Map();
        this.middleware = [];
    }

    registerHandler(commandType, handler) {
        if (this.handlers.has(commandType)) {
            throw new Error(`Handler for ${commandType} already registered`);
        }
        this.handlers.set(commandType, handler);
        console.log(`[CommandBus] Registered handler for ${commandType}`);
    }

    use(middleware) {
        this.middleware.push(middleware);
    }

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
 */
class QueryBus extends EventEmitter {
    constructor() {
        super();
        this.handlers = new Map();
    }

    registerHandler(queryType, handler) {
        if (this.handlers.has(queryType)) {
            throw new Error(`Handler for ${queryType} already registered`);
        }
        this.handlers.set(queryType, handler);
        console.log(`[QueryBus] Registered handler for ${queryType}`);
    }

    async execute(query) {
        if (!(query instanceof Query)) {
            throw new Error('Invalid query');
        }

        console.log(`[QueryBus] Executing query: ${query.type}`);

        const handler = this.handlers.get(query.type);
        if (!handler) {
            throw new Error(`No handler for query: ${query.type}`);
        }

        try {
            const result = await handler.handle(query);
            this.emit('query-executed', { query, result });
            return result;
        } catch (error) {
            this.emit('query-failed', { query, error });
            throw error;
        }
    }
}

/**
 * Event Store - Stores all domain events
 */
class EventStore extends EventEmitter {
    constructor() {
        super();
        this.events = [];
        this.snapshots = new Map();
    }

    async appendEvents(aggregateId, events, expectedVersion) {
        const existingEvents = this.getEvents(aggregateId);
        const currentVersion = existingEvents.length;

        if (expectedVersion !== null && currentVersion !== expectedVersion) {
            throw new Error('Concurrency conflict');
        }

        for (const event of events) {
            this.events.push(event);
            this.emit('event-appended', event);
        }

        console.log(`[EventStore] Appended ${events.length} events for ${aggregateId}`);
    }

    getEvents(aggregateId, fromVersion = 0) {
        return this.events
            .filter(e => e.aggregateId === aggregateId && e.version > fromVersion)
            .sort((a, b) => a.version - b.version);
    }

    getAllEvents() {
        return [...this.events];
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
}

/**
 * Write Model - Aggregate Root
 */
class AggregateRoot {
    constructor(id) {
        this.id = id;
        this.version = 0;
        this.uncommittedEvents = [];
    }

    applyEvent(event) {
        this.version = event.version;
        this.uncommittedEvents.push(event);
    }

    getUncommittedEvents() {
        return [...this.uncommittedEvents];
    }

    clearUncommittedEvents() {
        this.uncommittedEvents = [];
    }

    loadFromHistory(events) {
        for (const event of events) {
            this.apply(event);
            this.version = event.version;
        }
    }

    apply(event) {
        const handler = this[`on${event.type}`];
        if (handler) {
            handler.call(this, event);
        }
    }
}

/**
 * Read Model - Projection
 */
class ReadModel {
    constructor(name) {
        this.name = name;
        this.data = new Map();
    }

    set(key, value) {
        this.data.set(key, value);
    }

    get(key) {
        return this.data.get(key) || null;
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

    clear() {
        this.data.clear();
    }

    size() {
        return this.data.size;
    }
}

/**
 * Projection Engine - Builds read models from events
 */
class ProjectionEngine extends EventEmitter {
    constructor(eventStore) {
        super();
        this.eventStore = eventStore;
        this.projections = new Map();
        this.eventHandlers = new Map();

        this.eventStore.on('event-appended', async (event) => {
            await this.processEvent(event);
        });
    }

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

    addReadModel(readModel) {
        this.projections.set(readModel.name, readModel);
    }

    getReadModel(name) {
        return this.projections.get(name);
    }

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

// Example Domain: Product Catalog

/**
 * Product Aggregate (Write Model)
 */
class Product extends AggregateRoot {
    constructor(id) {
        super(id);
        this.name = null;
        this.price = 0;
        this.stock = 0;
        this.category = null;
        this.isActive = false;
    }

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

    updatePrice(newPrice) {
        if (!this.isActive) {
            throw new Error('Product is not active');
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
}

/**
 * Command Handlers
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
 * Query Handlers
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

class GetProductsByCategoryQueryHandler {
    constructor(readModel) {
        this.readModel = readModel;
    }

    async handle(query) {
        return this.readModel.query({ category: query.parameters.category });
    }
}

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

// Setup projections
function setupProductProjections(projectionEngine, productListReadModel) {
    // Product created
    projectionEngine.registerProjection('ProductCreated', 'product-list', (readModel, event) => {
        readModel.set(event.aggregateId, {
            id: event.aggregateId,
            name: event.payload.name,
            price: event.payload.price,
            category: event.payload.category,
            stock: event.payload.stock,
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
}

// Demonstration
async function demonstrateCQRS() {
    console.log('=== CQRS Pattern Demo ===\n');

    // Setup infrastructure
    const eventStore = new EventStore();
    const commandBus = new CommandBus();
    const queryBus = new QueryBus();

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

    // Register query handlers
    queryBus.registerHandler('GetProduct', new GetProductQueryHandler(productListReadModel));
    queryBus.registerHandler('GetProductsByCategory', new GetProductsByCategoryQueryHandler(productListReadModel));
    queryBus.registerHandler('GetLowStockProducts', new GetLowStockProductsQueryHandler(productListReadModel));

    console.log('--- Creating Products (Commands) ---\n');

    // Create products
    const product1Id = crypto.randomUUID();
    await commandBus.execute(new Command('CreateProduct', product1Id, {
        name: 'Laptop Pro',
        price: 1299.99,
        category: 'Electronics',
        stock: 15
    }));

    const product2Id = crypto.randomUUID();
    await commandBus.execute(new Command('CreateProduct', product2Id, {
        name: 'Wireless Mouse',
        price: 39.99,
        category: 'Accessories',
        stock: 5
    }));

    const product3Id = crypto.randomUUID();
    await commandBus.execute(new Command('CreateProduct', product3Id, {
        name: 'USB-C Cable',
        price: 19.99,
        category: 'Accessories',
        stock: 3
    }));

    console.log('\n--- Updating Product (Commands) ---\n');

    // Update price
    await commandBus.execute(new Command('UpdateProductPrice', product1Id, {
        newPrice: 1199.99
    }));

    // Adjust stock
    await commandBus.execute(new Command('AdjustProductStock', product2Id, {
        quantity: -2
    }));

    console.log('\n--- Querying Products (Queries) ---\n');

    // Query specific product
    const product = await queryBus.execute(new Query('GetProduct', { productId: product1Id }));
    console.log('Product details:', JSON.stringify(product, null, 2));

    // Query by category
    const accessories = await queryBus.execute(new Query('GetProductsByCategory', { category: 'Accessories' }));
    console.log(`\nAccessories (${accessories.length} items):`, JSON.stringify(accessories, null, 2));

    // Query low stock
    const lowStock = await queryBus.execute(new Query('GetLowStockProducts', { threshold: 10 }));
    console.log(`\nLow stock products (${lowStock.length} items):`, JSON.stringify(lowStock, null, 2));

    console.log('\n--- Event Store ---\n');
    console.log(`Total events: ${eventStore.getAllEvents().length}`);

    const product1Events = eventStore.getEvents(product1Id);
    console.log(`\nProduct 1 events: ${product1Events.length}`);
    product1Events.forEach(e => {
        console.log(`  ${e.type} (v${e.version})`);
    });

    console.log('\n--- Read Model Stats ---\n');
    console.log(`Products in read model: ${productListReadModel.size()}`);
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
    ProjectionEngine
};
