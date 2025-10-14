/**
 * Database per Service Pattern (Alternative Implementation)
 *
 * Purpose: This is an alternative implementation of the Database Per Service
 * pattern focusing on data replication, eventual consistency, and advanced
 * cross-service query patterns.
 *
 * Key Differences from DatabasePerService.js:
 * - Implements data replication across service boundaries
 * - Demonstrates eventual consistency patterns
 * - Includes materialized views for cross-service queries
 * - Shows data synchronization strategies
 * - Implements change data capture (CDC)
 *
 * Key Components:
 * - Replicated Data Store: Local copies of foreign data
 * - Change Stream: Monitors database changes
 * - Synchronization Engine: Keeps replicated data current
 * - Materialized View: Pre-computed cross-service queries
 * - Consistency Monitor: Tracks data consistency
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Change Data Capture - Tracks changes in database
 */
class ChangeDataCapture extends EventEmitter {
    constructor(database) {
        super();
        this.database = database;
        this.changeLog = [];
        this.lastSequence = 0;
        this.isWatching = false;
    }

    start() {
        if (this.isWatching) {
            return;
        }

        this.isWatching = true;
        console.log(`[CDC] Started watching ${this.database.name}`);
    }

    stop() {
        this.isWatching = false;
        console.log(`[CDC] Stopped watching ${this.database.name}`);
    }

    captureChange(operation, collection, document, before = null) {
        if (!this.isWatching) {
            return;
        }

        const change = {
            sequence: ++this.lastSequence,
            timestamp: new Date().toISOString(),
            database: this.database.name,
            collection,
            operation,
            document,
            before,
            id: crypto.randomUUID()
        };

        this.changeLog.push(change);
        this.emit('change', change);

        return change;
    }

    getChanges(fromSequence = 0) {
        return this.changeLog.filter(c => c.sequence > fromSequence);
    }

    getChangeLog() {
        return [...this.changeLog];
    }
}

/**
 * Replicated Data Store - Maintains local copy of foreign data
 */
class ReplicatedDataStore {
    constructor(serviceName, sourceService) {
        this.serviceName = serviceName;
        this.sourceService = sourceService;
        this.data = new Map();
        this.metadata = new Map();
        this.lastSyncSequence = 0;
        this.syncHistory = [];
    }

    async replicate(sourceData) {
        const replicaId = sourceData.id;
        const existing = this.data.get(replicaId);

        this.data.set(replicaId, {
            ...sourceData,
            _replica: {
                source: this.sourceService,
                replicatedAt: new Date().toISOString(),
                version: existing ? existing._replica.version + 1 : 1
            }
        });

        this.metadata.set(replicaId, {
            sourceId: sourceData.id,
            lastSync: new Date().toISOString(),
            syncCount: existing ? this.metadata.get(replicaId).syncCount + 1 : 1
        });

        return this.data.get(replicaId);
    }

    get(id) {
        return this.data.get(id) || null;
    }

    getAll() {
        return Array.from(this.data.values());
    }

    query(filter) {
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

    async remove(id) {
        this.data.delete(id);
        this.metadata.delete(id);
    }

    getStats() {
        return {
            source: this.sourceService,
            itemCount: this.data.size,
            lastSyncSequence: this.lastSyncSequence,
            syncHistory: this.syncHistory.length
        };
    }
}

/**
 * Data Synchronization Engine
 */
class DataSynchronizer extends EventEmitter {
    constructor() {
        super();
        this.subscriptions = [];
        this.syncJobs = new Map();
        this.syncInterval = 5000;
        this.isRunning = false;
    }

    subscribe(sourceService, targetStore, changeCapture) {
        const subscription = {
            id: crypto.randomUUID(),
            sourceService,
            targetStore,
            changeCapture,
            lastSequence: 0
        };

        // Listen for changes
        changeCapture.on('change', async (change) => {
            await this.processChange(subscription, change);
        });

        this.subscriptions.push(subscription);
        return subscription.id;
    }

    async processChange(subscription, change) {
        const { targetStore, sourceService } = subscription;

        try {
            switch (change.operation) {
                case 'insert':
                case 'update':
                    await targetStore.replicate(change.document);
                    console.log(`[Sync] Replicated ${change.operation} from ${sourceService.serviceName} to ${targetStore.serviceName}`);
                    break;

                case 'delete':
                    await targetStore.remove(change.document.id);
                    console.log(`[Sync] Replicated delete from ${sourceService.serviceName} to ${targetStore.serviceName}`);
                    break;
            }

            subscription.lastSequence = change.sequence;
            this.emit('synced', { subscription, change });
        } catch (error) {
            console.error(`[Sync] Error replicating change:`, error);
            this.emit('sync-error', { subscription, change, error });
        }
    }

    start() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        console.log('[Sync] Data synchronization started');
    }

    stop() {
        this.isRunning = false;
        console.log('[Sync] Data synchronization stopped');
    }

    getStats() {
        return {
            subscriptions: this.subscriptions.length,
            isRunning: this.isRunning
        };
    }
}

/**
 * Materialized View - Pre-computed cross-service queries
 */
class MaterializedView extends EventEmitter {
    constructor(name, query) {
        super();
        this.name = name;
        this.query = query;
        this.data = null;
        this.lastRefresh = null;
        this.refreshCount = 0;
        this.isStale = true;
    }

    async refresh(dataSources) {
        console.log(`[MaterializedView] Refreshing ${this.name}...`);

        try {
            this.data = await this.query(dataSources);
            this.lastRefresh = new Date().toISOString();
            this.refreshCount++;
            this.isStale = false;

            this.emit('refreshed', this.name);
            return this.data;
        } catch (error) {
            console.error(`[MaterializedView] Error refreshing ${this.name}:`, error);
            this.emit('error', error);
            throw error;
        }
    }

    markStale() {
        this.isStale = true;
        this.emit('stale', this.name);
    }

    getData() {
        if (this.isStale) {
            console.warn(`[MaterializedView] Warning: ${this.name} is stale`);
        }
        return this.data;
    }

    getMetadata() {
        return {
            name: this.name,
            lastRefresh: this.lastRefresh,
            refreshCount: this.refreshCount,
            isStale: this.isStale
        };
    }
}

/**
 * Enhanced Service with Replication Support
 */
class EnhancedService extends EventEmitter {
    constructor(serviceName) {
        super();
        this.serviceName = serviceName;
        this.database = {
            name: `${serviceName}-db`,
            collections: new Map()
        };
        this.cdc = new ChangeDataCapture(this.database);
        this.replicatedStores = new Map();
        this.materializedViews = new Map();
    }

    async initialize() {
        this.cdc.start();
        console.log(`[${this.serviceName}] Service initialized`);
    }

    async shutdown() {
        this.cdc.stop();
        console.log(`[${this.serviceName}] Service shutdown`);
    }

    getCollection(name) {
        if (!this.database.collections.has(name)) {
            this.database.collections.set(name, new Map());
        }
        return this.database.collections.get(name);
    }

    async insert(collection, document) {
        const coll = this.getCollection(collection);
        const id = document.id || crypto.randomUUID();
        const doc = { ...document, id, createdAt: new Date().toISOString() };

        coll.set(id, doc);
        this.cdc.captureChange('insert', collection, doc);

        return doc;
    }

    async update(collection, id, updates) {
        const coll = this.getCollection(collection);
        const existing = coll.get(id);

        if (!existing) {
            throw new Error('Document not found');
        }

        const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
        coll.set(id, updated);
        this.cdc.captureChange('update', collection, updated, existing);

        return updated;
    }

    async delete(collection, id) {
        const coll = this.getCollection(collection);
        const existing = coll.get(id);

        if (!existing) {
            return false;
        }

        coll.delete(id);
        this.cdc.captureChange('delete', collection, existing);

        return true;
    }

    async findById(collection, id) {
        const coll = this.getCollection(collection);
        return coll.get(id) || null;
    }

    async findAll(collection, filter = {}) {
        const coll = this.getCollection(collection);
        const results = [];

        for (const doc of coll.values()) {
            let matches = true;
            for (const [key, value] of Object.entries(filter)) {
                if (doc[key] !== value) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                results.push(doc);
            }
        }

        return results;
    }

    createReplicatedStore(sourceService) {
        const store = new ReplicatedDataStore(this.serviceName, sourceService.serviceName);
        this.replicatedStores.set(sourceService.serviceName, store);
        return store;
    }

    getReplicatedStore(sourceService) {
        return this.replicatedStores.get(sourceService);
    }

    createMaterializedView(name, queryFn) {
        const view = new MaterializedView(name, queryFn);
        this.materializedViews.set(name, view);

        // Mark view as stale when data changes
        this.cdc.on('change', () => {
            view.markStale();
        });

        return view;
    }

    getMaterializedView(name) {
        return this.materializedViews.get(name);
    }
}

/**
 * Customer Service
 */
class CustomerService extends EnhancedService {
    constructor() {
        super('customer-service');
    }

    async createCustomer(customerData) {
        return await this.insert('customers', {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            status: 'active'
        });
    }

    async getCustomer(customerId) {
        return await this.findById('customers', customerId);
    }

    async updateCustomer(customerId, updates) {
        return await this.update('customers', customerId, updates);
    }
}

/**
 * Product Service
 */
class ProductService extends EnhancedService {
    constructor() {
        super('product-service');
    }

    async createProduct(productData) {
        return await this.insert('products', {
            name: productData.name,
            price: productData.price,
            category: productData.category,
            stock: productData.stock || 0
        });
    }

    async getProduct(productId) {
        return await this.findById('products', productId);
    }

    async updateStock(productId, quantity) {
        const product = await this.findById('products', productId);
        if (!product) {
            throw new Error('Product not found');
        }

        return await this.update('products', productId, {
            stock: product.stock + quantity
        });
    }
}

/**
 * Order Service with Cross-Service Queries
 */
class OrderServiceWithReplicas extends EnhancedService {
    constructor() {
        super('order-service');
    }

    async initialize() {
        await super.initialize();

        // Create materialized view for order details
        this.createMaterializedView('order-details', async (sources) => {
            const orders = await this.findAll('orders');
            const customerStore = this.getReplicatedStore('customer-service');
            const productStore = this.getReplicatedStore('product-service');

            return orders.map(order => ({
                ...order,
                customer: customerStore.get(order.customerId),
                products: order.items.map(item => ({
                    ...item,
                    product: productStore.get(item.productId)
                }))
            }));
        });
    }

    async createOrder(orderData) {
        return await this.insert('orders', {
            customerId: orderData.customerId,
            items: orderData.items,
            status: 'pending',
            total: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });
    }

    async getOrder(orderId) {
        return await this.findById('orders', orderId);
    }

    async getOrderWithDetails(orderId) {
        const order = await this.getOrder(orderId);
        if (!order) {
            return null;
        }

        const customerStore = this.getReplicatedStore('customer-service');
        const productStore = this.getReplicatedStore('product-service');

        return {
            ...order,
            customer: customerStore.get(order.customerId),
            items: order.items.map(item => ({
                ...item,
                product: productStore.get(item.productId)
            }))
        };
    }

    async getAllOrdersWithDetails() {
        const view = this.getMaterializedView('order-details');
        if (view.isStale) {
            await view.refresh();
        }
        return view.getData();
    }
}

// Demonstration
async function demonstrateDatabasePerServiceAdvanced() {
    console.log('=== Database per Service (Advanced) Pattern Demo ===\n');

    const synchronizer = new DataSynchronizer();
    synchronizer.start();

    // Create services
    const customerService = new CustomerService();
    const productService = new ProductService();
    const orderService = new OrderServiceWithReplicas();

    // Initialize services
    await customerService.initialize();
    await productService.initialize();
    await orderService.initialize();

    // Set up replication
    console.log('Setting up data replication...\n');

    const customerReplica = orderService.createReplicatedStore(customerService);
    const productReplica = orderService.createReplicatedStore(productService);

    synchronizer.subscribe(customerService, customerReplica, customerService.cdc);
    synchronizer.subscribe(productService, productReplica, productService.cdc);

    // Create data
    console.log('--- Creating Customers ---\n');

    const customer1 = await customerService.createCustomer({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '555-0101'
    });

    const customer2 = await customerService.createCustomer({
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '555-0102'
    });

    console.log('\n--- Creating Products ---\n');

    const product1 = await productService.createProduct({
        name: 'Laptop Pro',
        price: 1299.99,
        category: 'Electronics',
        stock: 15
    });

    const product2 = await productService.createProduct({
        name: 'Wireless Mouse',
        price: 39.99,
        category: 'Accessories',
        stock: 100
    });

    // Wait for replication
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('\n--- Checking Replicated Data ---\n');
    console.log(`Customer replica has ${customerReplica.getAll().length} customers`);
    console.log(`Product replica has ${productReplica.getAll().length} products`);

    console.log('\n--- Creating Orders ---\n');

    const order1 = await orderService.createOrder({
        customerId: customer1.id,
        items: [
            { productId: product1.id, quantity: 1, price: 1299.99 }
        ]
    });

    const order2 = await orderService.createOrder({
        customerId: customer2.id,
        items: [
            { productId: product1.id, quantity: 1, price: 1299.99 },
            { productId: product2.id, quantity: 2, price: 39.99 }
        ]
    });

    console.log('\n--- Querying Cross-Service Data ---\n');

    const orderDetails1 = await orderService.getOrderWithDetails(order1.id);
    console.log('Order 1 with details:');
    console.log(JSON.stringify(orderDetails1, null, 2));

    console.log('\n--- Using Materialized View ---\n');

    const allOrderDetails = await orderService.getAllOrdersWithDetails();
    console.log(`Materialized view contains ${allOrderDetails.length} orders with full details`);

    console.log('\n--- Updating Customer ---\n');

    await customerService.updateCustomer(customer1.id, {
        phone: '555-9999'
    });

    // Wait for replication
    await new Promise(resolve => setTimeout(resolve, 200));

    const replicatedCustomer = customerReplica.get(customer1.id);
    console.log(`Replicated customer phone: ${replicatedCustomer.phone}`);

    console.log('\n--- Change Data Capture Log ---\n');

    const customerChanges = customerService.cdc.getChangeLog();
    console.log(`Customer service captured ${customerChanges.length} changes`);
    customerChanges.forEach(change => {
        console.log(`  [${change.sequence}] ${change.operation} on ${change.collection}`);
    });

    console.log('\n--- Replication Statistics ---\n');

    console.log('Customer Replica:', customerReplica.getStats());
    console.log('Product Replica:', productReplica.getStats());

    const viewMetadata = orderService.getMaterializedView('order-details').getMetadata();
    console.log('Order Details View:', viewMetadata);

    // Shutdown
    synchronizer.stop();
    await customerService.shutdown();
    await productService.shutdown();
    await orderService.shutdown();
}

// Run demonstration
if (require.main === module) {
    demonstrateDatabasePerServiceAdvanced().catch(console.error);
}

module.exports = {
    ChangeDataCapture,
    ReplicatedDataStore,
    DataSynchronizer,
    MaterializedView,
    EnhancedService,
    CustomerService,
    ProductService,
    OrderServiceWithReplicas
};
