/**
 * Database Per Service Pattern
 *
 * Purpose: Each microservice has its own private database, ensuring complete
 * data isolation and independence. Services cannot access each other's
 * databases directly and must communicate through APIs.
 *
 * Key Components:
 * - Service Database: Private database for each service
 * - Data Access Layer: Service-specific data operations
 * - API Gateway: Inter-service communication
 * - Data Synchronization: Event-driven data consistency
 * - Service Schema: Independent schema evolution
 *
 * Benefits:
 * - Complete service autonomy
 * - Independent scaling of databases
 * - Technology diversity (polyglot persistence)
 * - Fault isolation
 * - Independent schema evolution
 *
 * Challenges:
 * - Data consistency across services
 * - Complex queries spanning services
 * - Data duplication
 * - Distributed transactions
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Database Interface - Abstract database operations
 */
class Database {
    constructor(name, type = 'generic') {
        this.name = name;
        this.type = type;
        this.connected = false;
        this.collections = new Map();
        this.transactions = new Map();
    }

    async connect() {
        console.log(`[${this.name}] Connecting to ${this.type} database...`);
        this.connected = true;
        return true;
    }

    async disconnect() {
        console.log(`[${this.name}] Disconnecting...`);
        this.connected = false;
        return true;
    }

    isConnected() {
        return this.connected;
    }

    getCollection(name) {
        if (!this.collections.has(name)) {
            this.collections.set(name, new Collection(name));
        }
        return this.collections.get(name);
    }

    async beginTransaction() {
        const txId = crypto.randomUUID();
        this.transactions.set(txId, {
            id: txId,
            operations: [],
            status: 'active'
        });
        return txId;
    }

    async commitTransaction(txId) {
        const tx = this.transactions.get(txId);
        if (!tx) {
            throw new Error('Transaction not found');
        }
        tx.status = 'committed';
        return true;
    }

    async rollbackTransaction(txId) {
        const tx = this.transactions.get(txId);
        if (!tx) {
            throw new Error('Transaction not found');
        }
        tx.status = 'rolled back';
        return true;
    }

    getStats() {
        const stats = {
            name: this.name,
            type: this.type,
            connected: this.connected,
            collections: {},
            totalDocuments: 0
        };

        for (const [name, collection] of this.collections.entries()) {
            const size = collection.size();
            stats.collections[name] = size;
            stats.totalDocuments += size;
        }

        return stats;
    }
}

/**
 * Collection - Represents a table/collection in a database
 */
class Collection {
    constructor(name) {
        this.name = name;
        this.documents = new Map();
        this.indexes = new Map();
    }

    async insert(document) {
        const id = document.id || crypto.randomUUID();
        const doc = { ...document, id, createdAt: new Date().toISOString() };
        this.documents.set(id, doc);
        this.updateIndexes(doc);
        return doc;
    }

    async findById(id) {
        return this.documents.get(id) || null;
    }

    async findOne(query) {
        for (const doc of this.documents.values()) {
            if (this.matchesQuery(doc, query)) {
                return doc;
            }
        }
        return null;
    }

    async findMany(query = {}) {
        const results = [];
        for (const doc of this.documents.values()) {
            if (this.matchesQuery(doc, query)) {
                results.push(doc);
            }
        }
        return results;
    }

    async update(id, updates) {
        const doc = this.documents.get(id);
        if (!doc) {
            throw new Error('Document not found');
        }

        const updated = {
            ...doc,
            ...updates,
            id,
            updatedAt: new Date().toISOString()
        };

        this.documents.set(id, updated);
        this.updateIndexes(updated);
        return updated;
    }

    async delete(id) {
        const doc = this.documents.get(id);
        if (doc) {
            this.documents.delete(id);
            return true;
        }
        return false;
    }

    matchesQuery(doc, query) {
        for (const [key, value] of Object.entries(query)) {
            if (doc[key] !== value) {
                return false;
            }
        }
        return true;
    }

    updateIndexes(doc) {
        for (const [field, value] of Object.entries(doc)) {
            if (!this.indexes.has(field)) {
                this.indexes.set(field, new Map());
            }
            const index = this.indexes.get(field);
            if (!index.has(value)) {
                index.set(value, []);
            }
            index.get(value).push(doc.id);
        }
    }

    size() {
        return this.documents.size;
    }

    clear() {
        this.documents.clear();
        this.indexes.clear();
    }
}

/**
 * Service with Private Database
 */
class ServiceWithDatabase extends EventEmitter {
    constructor(serviceName, databaseType = 'generic') {
        super();
        this.serviceName = serviceName;
        this.database = new Database(`${serviceName}-db`, databaseType);
        this.eventHandlers = new Map();
    }

    async initialize() {
        await this.database.connect();
        this.emit('initialized', this.serviceName);
    }

    async shutdown() {
        await this.database.disconnect();
        this.emit('shutdown', this.serviceName);
    }

    getDatabase() {
        return this.database;
    }

    async publishEvent(type, data) {
        const event = {
            id: crypto.randomUUID(),
            type,
            source: this.serviceName,
            data,
            timestamp: new Date().toISOString()
        };
        this.emit('event', event);
        return event;
    }

    subscribeToEvent(eventType, handler) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType).push(handler);
    }

    async handleEvent(event) {
        const handlers = this.eventHandlers.get(event.type) || [];
        for (const handler of handlers) {
            try {
                await handler(event);
            } catch (error) {
                console.error(`[${this.serviceName}] Error handling event ${event.type}:`, error);
            }
        }
    }
}

/**
 * User Service - Manages user data
 */
class UserService extends ServiceWithDatabase {
    constructor() {
        super('user-service', 'postgresql');
    }

    async initialize() {
        await super.initialize();
        this.users = this.database.getCollection('users');
        this.profiles = this.database.getCollection('profiles');
    }

    async createUser(userData) {
        const user = await this.users.insert({
            email: userData.email,
            username: userData.username,
            passwordHash: this.hashPassword(userData.password),
            status: 'active'
        });

        await this.profiles.insert({
            userId: user.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            bio: ''
        });

        await this.publishEvent('UserCreated', {
            userId: user.id,
            email: user.email,
            username: user.username
        });

        console.log(`[UserService] Created user: ${user.username}`);
        return user;
    }

    async getUser(userId) {
        return await this.users.findById(userId);
    }

    async getUserByEmail(email) {
        return await this.users.findOne({ email });
    }

    async updateUser(userId, updates) {
        const user = await this.users.update(userId, updates);
        await this.publishEvent('UserUpdated', {
            userId: user.id,
            updates
        });
        return user;
    }

    hashPassword(password) {
        return `hashed_${password}`;
    }
}

/**
 * Order Service - Manages order data
 */
class OrderService extends ServiceWithDatabase {
    constructor() {
        super('order-service', 'mongodb');
        this.userCache = new Map();
    }

    async initialize() {
        await super.initialize();
        this.orders = this.database.getCollection('orders');
        this.orderItems = this.database.getCollection('order_items');

        // Subscribe to user events to maintain cache
        this.subscribeToEvent('UserCreated', async (event) => {
            this.userCache.set(event.data.userId, {
                email: event.data.email,
                username: event.data.username
            });
        });

        this.subscribeToEvent('UserUpdated', async (event) => {
            const cached = this.userCache.get(event.data.userId);
            if (cached) {
                Object.assign(cached, event.data.updates);
            }
        });
    }

    async createOrder(orderData) {
        const order = await this.orders.insert({
            userId: orderData.userId,
            status: 'pending',
            total: 0,
            currency: 'USD'
        });

        let total = 0;
        for (const item of orderData.items) {
            await this.orderItems.insert({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            });
            total += item.price * item.quantity;
        }

        const updatedOrder = await this.orders.update(order.id, { total });

        await this.publishEvent('OrderCreated', {
            orderId: order.id,
            userId: order.userId,
            total,
            itemCount: orderData.items.length
        });

        console.log(`[OrderService] Created order: ${order.id} for $${total}`);
        return updatedOrder;
    }

    async getOrder(orderId) {
        const order = await this.orders.findById(orderId);
        if (!order) {
            return null;
        }

        const items = await this.orderItems.findMany({ orderId });
        return { ...order, items };
    }

    async getUserOrders(userId) {
        return await this.orders.findMany({ userId });
    }

    async updateOrderStatus(orderId, status) {
        const order = await this.orders.update(orderId, { status });

        await this.publishEvent('OrderStatusChanged', {
            orderId: order.id,
            status,
            previousStatus: order.status
        });

        return order;
    }

    getUserFromCache(userId) {
        return this.userCache.get(userId);
    }
}

/**
 * Payment Service - Manages payment data
 */
class PaymentService extends ServiceWithDatabase {
    constructor() {
        super('payment-service', 'postgresql');
    }

    async initialize() {
        await super.initialize();
        this.payments = this.database.getCollection('payments');
        this.transactions = this.database.getCollection('transactions');

        // Subscribe to order events
        this.subscribeToEvent('OrderCreated', async (event) => {
            console.log(`[PaymentService] Order created: ${event.data.orderId}, ready for payment`);
        });
    }

    async createPayment(paymentData) {
        const payment = await this.payments.insert({
            orderId: paymentData.orderId,
            userId: paymentData.userId,
            amount: paymentData.amount,
            currency: paymentData.currency || 'USD',
            method: paymentData.method,
            status: 'pending'
        });

        console.log(`[PaymentService] Created payment: ${payment.id}`);
        return payment;
    }

    async processPayment(paymentId) {
        const payment = await this.payments.findById(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }

        // Simulate payment processing
        const success = Math.random() > 0.1; // 90% success rate

        const transaction = await this.transactions.insert({
            paymentId: payment.id,
            amount: payment.amount,
            status: success ? 'completed' : 'failed',
            transactionId: crypto.randomUUID(),
            processedAt: new Date().toISOString()
        });

        const updatedPayment = await this.payments.update(paymentId, {
            status: success ? 'completed' : 'failed',
            transactionId: transaction.id
        });

        await this.publishEvent('PaymentProcessed', {
            paymentId: payment.id,
            orderId: payment.orderId,
            status: updatedPayment.status,
            amount: payment.amount
        });

        console.log(`[PaymentService] Payment ${paymentId} ${updatedPayment.status}`);
        return updatedPayment;
    }

    async getPayment(paymentId) {
        return await this.payments.findById(paymentId);
    }

    async getPaymentsByOrder(orderId) {
        return await this.payments.findMany({ orderId });
    }
}

/**
 * Inventory Service - Manages product inventory
 */
class InventoryService extends ServiceWithDatabase {
    constructor() {
        super('inventory-service', 'redis');
    }

    async initialize() {
        await super.initialize();
        this.products = this.database.getCollection('products');
        this.stock = this.database.getCollection('stock');

        // Subscribe to order events
        this.subscribeToEvent('OrderCreated', async (event) => {
            console.log(`[InventoryService] Reserving stock for order: ${event.data.orderId}`);
        });
    }

    async addProduct(productData) {
        const product = await this.products.insert({
            name: productData.name,
            sku: productData.sku,
            price: productData.price
        });

        await this.stock.insert({
            productId: product.id,
            quantity: productData.quantity || 0,
            reserved: 0
        });

        await this.publishEvent('ProductAdded', {
            productId: product.id,
            name: product.name,
            sku: product.sku
        });

        console.log(`[InventoryService] Added product: ${product.name}`);
        return product;
    }

    async getProduct(productId) {
        const product = await this.products.findById(productId);
        if (!product) {
            return null;
        }

        const stockInfo = await this.stock.findOne({ productId });
        return { ...product, stock: stockInfo };
    }

    async updateStock(productId, quantity) {
        const stockInfo = await this.stock.findOne({ productId });
        if (!stockInfo) {
            throw new Error('Product stock not found');
        }

        const updated = await this.stock.update(stockInfo.id, {
            quantity: stockInfo.quantity + quantity
        });

        await this.publishEvent('StockUpdated', {
            productId,
            quantity: updated.quantity,
            change: quantity
        });

        return updated;
    }

    async reserveStock(productId, quantity) {
        const stockInfo = await this.stock.findOne({ productId });
        if (!stockInfo) {
            throw new Error('Product stock not found');
        }

        if (stockInfo.quantity - stockInfo.reserved < quantity) {
            throw new Error('Insufficient stock');
        }

        return await this.stock.update(stockInfo.id, {
            reserved: stockInfo.reserved + quantity
        });
    }
}

/**
 * Event Router - Coordinates events between services
 */
class EventRouter extends EventEmitter {
    constructor() {
        super();
        this.services = new Map();
    }

    registerService(service) {
        this.services.set(service.serviceName, service);

        service.on('event', (event) => {
            this.routeEvent(event);
        });
    }

    async routeEvent(event) {
        console.log(`[EventRouter] Routing event: ${event.type} from ${event.source}`);

        for (const [name, service] of this.services.entries()) {
            if (name !== event.source) {
                await service.handleEvent(event);
            }
        }

        this.emit('event-routed', event);
    }

    getServiceStats() {
        const stats = {};
        for (const [name, service] of this.services.entries()) {
            stats[name] = service.database.getStats();
        }
        return stats;
    }
}

// Demonstration
async function demonstrateDatabasePerService() {
    console.log('=== Database Per Service Pattern Demo ===\n');

    const eventRouter = new EventRouter();

    // Create services
    const userService = new UserService();
    const orderService = new OrderService();
    const paymentService = new PaymentService();
    const inventoryService = new InventoryService();

    // Initialize services
    await userService.initialize();
    await orderService.initialize();
    await paymentService.initialize();
    await inventoryService.initialize();

    // Register with event router
    eventRouter.registerService(userService);
    eventRouter.registerService(orderService);
    eventRouter.registerService(paymentService);
    eventRouter.registerService(inventoryService);

    console.log('All services initialized\n');

    // Create user
    const user = await userService.createUser({
        email: 'john@example.com',
        username: 'john_doe',
        password: 'secret123',
        firstName: 'John',
        lastName: 'Doe'
    });

    // Add products
    const product1 = await inventoryService.addProduct({
        name: 'Laptop',
        sku: 'LAP-001',
        price: 999.99,
        quantity: 10
    });

    const product2 = await inventoryService.addProduct({
        name: 'Mouse',
        sku: 'MOU-001',
        price: 29.99,
        quantity: 50
    });

    // Wait for events to propagate
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('\n--- Creating Order ---\n');

    // Create order
    const order = await orderService.createOrder({
        userId: user.id,
        items: [
            { productId: product1.id, quantity: 1, price: 999.99 },
            { productId: product2.id, quantity: 2, price: 29.99 }
        ]
    });

    // Wait for events
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('\n--- Processing Payment ---\n');

    // Create and process payment
    const payment = await paymentService.createPayment({
        orderId: order.id,
        userId: user.id,
        amount: order.total,
        method: 'credit_card'
    });

    await paymentService.processPayment(payment.id);

    // Wait for events
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('\n--- Database Statistics ---\n');

    const stats = eventRouter.getServiceStats();
    console.log(JSON.stringify(stats, null, 2));

    // Demonstrate data isolation
    console.log('\n--- Data Isolation ---\n');
    console.log(`User can only access their data through UserService`);
    console.log(`Order details: ${JSON.stringify(await orderService.getOrder(order.id), null, 2)}`);
    console.log(`\nServices maintain their own schemas and can evolve independently`);

    // Shutdown
    await userService.shutdown();
    await orderService.shutdown();
    await paymentService.shutdown();
    await inventoryService.shutdown();
}

// Run demonstration
if (require.main === module) {
    demonstrateDatabasePerService().catch(console.error);
}

module.exports = {
    Database,
    Collection,
    ServiceWithDatabase,
    UserService,
    OrderService,
    PaymentService,
    InventoryService,
    EventRouter
};
