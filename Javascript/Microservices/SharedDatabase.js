/**
 * Shared Database Pattern
 *
 * Purpose: Multiple microservices share a single database. While this
 * pattern is generally discouraged in microservices, it's sometimes
 * necessary during migration from monoliths or when services are
 * tightly coupled by business requirements.
 *
 * Key Components:
 * - Shared Database: Single database accessed by multiple services
 * - Schema Ownership: Clear ownership of tables/schemas
 * - Database Mediator: Coordinates access and prevents conflicts
 * - Multi-tenant Support: Isolates data by tenant
 * - Access Control: Manages permissions per service
 *
 * Benefits:
 * - Simplified data consistency
 * - ACID transactions across services
 * - Easier queries spanning domains
 * - Simpler deployment
 *
 * Challenges:
 * - Tight coupling between services
 * - Schema change coordination
 * - Scaling limitations
 * - Service autonomy compromised
 * - Runtime coupling through database
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Shared Database - Central database accessed by multiple services
 */
class SharedDatabase extends EventEmitter {
    constructor(name) {
        super();
        this.name = name;
        this.schemas = new Map();
        this.tables = new Map();
        this.connections = new Map();
        this.transactionLog = [];
        this.isConnected = false;
        this.tenantData = new Map();
    }

    async connect() {
        this.isConnected = true;
        console.log(`[SharedDatabase] Connected to ${this.name}`);
        this.emit('connected');
    }

    async disconnect() {
        this.isConnected = false;
        console.log(`[SharedDatabase] Disconnected from ${this.name}`);
        this.emit('disconnected');
    }

    createSchema(schemaName, owner) {
        if (this.schemas.has(schemaName)) {
            throw new Error(`Schema ${schemaName} already exists`);
        }

        const schema = {
            name: schemaName,
            owner,
            tables: new Map(),
            createdAt: new Date().toISOString()
        };

        this.schemas.set(schemaName, schema);
        console.log(`[SharedDatabase] Schema ${schemaName} created by ${owner}`);
        return schema;
    }

    createTable(schemaName, tableName, schema, owner) {
        const schemaObj = this.schemas.get(schemaName);
        if (!schemaObj) {
            throw new Error(`Schema ${schemaName} not found`);
        }

        const fullTableName = `${schemaName}.${tableName}`;
        if (this.tables.has(fullTableName)) {
            throw new Error(`Table ${fullTableName} already exists`);
        }

        const table = {
            schema: schemaName,
            name: tableName,
            fullName: fullTableName,
            columns: schema,
            owner,
            rows: new Map(),
            indexes: new Map(),
            createdAt: new Date().toISOString()
        };

        this.tables.set(fullTableName, table);
        schemaObj.tables.set(tableName, table);
        console.log(`[SharedDatabase] Table ${fullTableName} created by ${owner}`);
        return table;
    }

    getTable(schemaName, tableName) {
        const fullTableName = `${schemaName}.${tableName}`;
        return this.tables.get(fullTableName);
    }

    async insert(schemaName, tableName, data, tenantId = null) {
        const table = this.getTable(schemaName, tableName);
        if (!table) {
            throw new Error(`Table ${schemaName}.${tableName} not found`);
        }

        const id = data.id || crypto.randomUUID();
        const row = {
            ...data,
            id,
            _tenantId: tenantId,
            _createdAt: new Date().toISOString()
        };

        table.rows.set(id, row);
        this.logTransaction('INSERT', table.fullName, row);
        this.emit('insert', { table: table.fullName, row });

        return row;
    }

    async update(schemaName, tableName, id, updates, tenantId = null) {
        const table = this.getTable(schemaName, tableName);
        if (!table) {
            throw new Error(`Table ${schemaName}.${tableName} not found`);
        }

        const row = table.rows.get(id);
        if (!row) {
            throw new Error('Row not found');
        }

        if (tenantId && row._tenantId !== tenantId) {
            throw new Error('Tenant ID mismatch');
        }

        const updated = {
            ...row,
            ...updates,
            _updatedAt: new Date().toISOString()
        };

        table.rows.set(id, updated);
        this.logTransaction('UPDATE', table.fullName, updated, row);
        this.emit('update', { table: table.fullName, row: updated, before: row });

        return updated;
    }

    async delete(schemaName, tableName, id, tenantId = null) {
        const table = this.getTable(schemaName, tableName);
        if (!table) {
            throw new Error(`Table ${schemaName}.${tableName} not found`);
        }

        const row = table.rows.get(id);
        if (!row) {
            return false;
        }

        if (tenantId && row._tenantId !== tenantId) {
            throw new Error('Tenant ID mismatch');
        }

        table.rows.delete(id);
        this.logTransaction('DELETE', table.fullName, row);
        this.emit('delete', { table: table.fullName, row });

        return true;
    }

    async findById(schemaName, tableName, id, tenantId = null) {
        const table = this.getTable(schemaName, tableName);
        if (!table) {
            throw new Error(`Table ${schemaName}.${tableName} not found`);
        }

        const row = table.rows.get(id);
        if (!row) {
            return null;
        }

        if (tenantId && row._tenantId !== tenantId) {
            return null;
        }

        return row;
    }

    async query(schemaName, tableName, filter = {}, tenantId = null) {
        const table = this.getTable(schemaName, tableName);
        if (!table) {
            throw new Error(`Table ${schemaName}.${tableName} not found`);
        }

        const results = [];
        for (const row of table.rows.values()) {
            if (tenantId && row._tenantId !== tenantId) {
                continue;
            }

            if (this.matchesFilter(row, filter)) {
                results.push(row);
            }
        }

        return results;
    }

    matchesFilter(row, filter) {
        for (const [key, value] of Object.entries(filter)) {
            if (row[key] !== value) {
                return false;
            }
        }
        return true;
    }

    async beginTransaction() {
        const txId = crypto.randomUUID();
        console.log(`[SharedDatabase] Transaction ${txId} started`);
        return txId;
    }

    async commitTransaction(txId) {
        console.log(`[SharedDatabase] Transaction ${txId} committed`);
        return true;
    }

    async rollbackTransaction(txId) {
        console.log(`[SharedDatabase] Transaction ${txId} rolled back`);
        return true;
    }

    logTransaction(operation, table, data, before = null) {
        this.transactionLog.push({
            timestamp: new Date().toISOString(),
            operation,
            table,
            data,
            before
        });
    }

    getStats() {
        const stats = {
            name: this.name,
            isConnected: this.isConnected,
            schemas: this.schemas.size,
            tables: this.tables.size,
            totalRows: 0,
            transactionLogSize: this.transactionLog.length
        };

        for (const table of this.tables.values()) {
            stats.totalRows += table.rows.size;
        }

        return stats;
    }
}

/**
 * Database Access Layer - Service-specific access to shared database
 */
class DatabaseAccessLayer {
    constructor(serviceName, database, schemaName) {
        this.serviceName = serviceName;
        this.database = database;
        this.schemaName = schemaName;
        this.tenantId = null;
    }

    setTenantContext(tenantId) {
        this.tenantId = tenantId;
    }

    clearTenantContext() {
        this.tenantId = null;
    }

    async insert(tableName, data) {
        return await this.database.insert(
            this.schemaName,
            tableName,
            data,
            this.tenantId
        );
    }

    async update(tableName, id, updates) {
        return await this.database.update(
            this.schemaName,
            tableName,
            id,
            updates,
            this.tenantId
        );
    }

    async delete(tableName, id) {
        return await this.database.delete(
            this.schemaName,
            tableName,
            id,
            this.tenantId
        );
    }

    async findById(tableName, id) {
        return await this.database.findById(
            this.schemaName,
            tableName,
            id,
            this.tenantId
        );
    }

    async query(tableName, filter = {}) {
        return await this.database.query(
            this.schemaName,
            tableName,
            filter,
            this.tenantId
        );
    }

    async transaction(callback) {
        const txId = await this.database.beginTransaction();
        try {
            const result = await callback(this);
            await this.database.commitTransaction(txId);
            return result;
        } catch (error) {
            await this.database.rollbackTransaction(txId);
            throw error;
        }
    }
}

/**
 * Service Using Shared Database
 */
class ServiceWithSharedDatabase extends EventEmitter {
    constructor(serviceName, database) {
        super();
        this.serviceName = serviceName;
        this.database = database;
        this.dal = null;
    }

    async initialize(schemaName) {
        // Create schema if it doesn't exist
        if (!this.database.schemas.has(schemaName)) {
            this.database.createSchema(schemaName, this.serviceName);
        }

        this.dal = new DatabaseAccessLayer(this.serviceName, this.database, schemaName);
        console.log(`[${this.serviceName}] Initialized with schema ${schemaName}`);
    }

    setTenant(tenantId) {
        if (this.dal) {
            this.dal.setTenantContext(tenantId);
        }
    }

    clearTenant() {
        if (this.dal) {
            this.dal.clearTenantContext();
        }
    }

    getDataAccessLayer() {
        return this.dal;
    }
}

/**
 * User Management Service
 */
class UserManagementService extends ServiceWithSharedDatabase {
    constructor(database) {
        super('user-management-service', database);
    }

    async initialize() {
        await super.initialize('user_management');

        // Create tables
        this.database.createTable('user_management', 'users', {
            id: 'uuid',
            email: 'string',
            username: 'string',
            passwordHash: 'string',
            status: 'string'
        }, this.serviceName);

        this.database.createTable('user_management', 'profiles', {
            id: 'uuid',
            userId: 'uuid',
            firstName: 'string',
            lastName: 'string',
            bio: 'text'
        }, this.serviceName);
    }

    async createUser(userData) {
        return await this.dal.transaction(async (dal) => {
            const user = await dal.insert('users', {
                email: userData.email,
                username: userData.username,
                passwordHash: this.hashPassword(userData.password),
                status: 'active'
            });

            const profile = await dal.insert('profiles', {
                userId: user.id,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                bio: ''
            });

            console.log(`[${this.serviceName}] Created user ${user.username}`);
            return { user, profile };
        });
    }

    async getUser(userId) {
        return await this.dal.findById('users', userId);
    }

    async getUserProfile(userId) {
        const profiles = await this.dal.query('profiles', { userId });
        return profiles[0] || null;
    }

    hashPassword(password) {
        return `hashed_${password}`;
    }
}

/**
 * Order Processing Service
 */
class OrderProcessingService extends ServiceWithSharedDatabase {
    constructor(database) {
        super('order-processing-service', database);
    }

    async initialize() {
        await super.initialize('order_processing');

        this.database.createTable('order_processing', 'orders', {
            id: 'uuid',
            userId: 'uuid',
            status: 'string',
            total: 'decimal',
            currency: 'string'
        }, this.serviceName);

        this.database.createTable('order_processing', 'order_items', {
            id: 'uuid',
            orderId: 'uuid',
            productId: 'uuid',
            quantity: 'integer',
            price: 'decimal'
        }, this.serviceName);
    }

    async createOrder(userId, items) {
        return await this.dal.transaction(async (dal) => {
            const order = await dal.insert('orders', {
                userId,
                status: 'pending',
                total: 0,
                currency: 'USD'
            });

            let total = 0;
            for (const item of items) {
                await dal.insert('order_items', {
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                });
                total += item.price * item.quantity;
            }

            const updatedOrder = await dal.update('orders', order.id, { total });

            console.log(`[${this.serviceName}] Created order ${order.id} for $${total}`);
            return updatedOrder;
        });
    }

    async getOrder(orderId) {
        const order = await this.dal.findById('orders', orderId);
        if (!order) {
            return null;
        }

        const items = await this.dal.query('order_items', { orderId });
        return { ...order, items };
    }

    async getUserOrders(userId) {
        return await this.dal.query('orders', { userId });
    }

    async updateOrderStatus(orderId, status) {
        return await this.dal.update('orders', orderId, { status });
    }
}

/**
 * Product Catalog Service
 */
class ProductCatalogService extends ServiceWithSharedDatabase {
    constructor(database) {
        super('product-catalog-service', database);
    }

    async initialize() {
        await super.initialize('product_catalog');

        this.database.createTable('product_catalog', 'products', {
            id: 'uuid',
            name: 'string',
            description: 'text',
            price: 'decimal',
            category: 'string',
            status: 'string'
        }, this.serviceName);

        this.database.createTable('product_catalog', 'inventory', {
            id: 'uuid',
            productId: 'uuid',
            quantity: 'integer',
            reserved: 'integer'
        }, this.serviceName);
    }

    async addProduct(productData) {
        return await this.dal.transaction(async (dal) => {
            const product = await dal.insert('products', {
                name: productData.name,
                description: productData.description || '',
                price: productData.price,
                category: productData.category,
                status: 'active'
            });

            await dal.insert('inventory', {
                productId: product.id,
                quantity: productData.stock || 0,
                reserved: 0
            });

            console.log(`[${this.serviceName}] Added product ${product.name}`);
            return product;
        });
    }

    async getProduct(productId) {
        const product = await this.dal.findById('products', productId);
        if (!product) {
            return null;
        }

        const inventory = await this.dal.query('inventory', { productId });
        return { ...product, inventory: inventory[0] };
    }

    async updateInventory(productId, quantityChange) {
        const inventory = await this.dal.query('inventory', { productId });
        if (inventory.length === 0) {
            throw new Error('Product inventory not found');
        }

        const current = inventory[0];
        return await this.dal.update('inventory', current.id, {
            quantity: current.quantity + quantityChange
        });
    }
}

/**
 * Multi-Tenant Context Manager
 */
class MultiTenantContextManager {
    constructor() {
        this.currentTenant = null;
    }

    setTenant(tenantId) {
        this.currentTenant = tenantId;
    }

    getTenant() {
        return this.currentTenant;
    }

    clearTenant() {
        this.currentTenant = null;
    }

    executeInTenantContext(tenantId, callback) {
        const previousTenant = this.currentTenant;
        try {
            this.currentTenant = tenantId;
            return callback();
        } finally {
            this.currentTenant = previousTenant;
        }
    }
}

// Demonstration
async function demonstrateSharedDatabase() {
    console.log('=== Shared Database Pattern Demo ===\n');

    const sharedDb = new SharedDatabase('enterprise-db');
    await sharedDb.connect();

    // Create services
    const userService = new UserManagementService(sharedDb);
    const orderService = new OrderProcessingService(sharedDb);
    const productService = new ProductCatalogService(sharedDb);

    // Initialize services
    await userService.initialize();
    await orderService.initialize();
    await productService.initialize();

    console.log('\n--- Multi-Tenant Demo ---\n');

    const tenantManager = new MultiTenantContextManager();

    // Tenant 1 operations
    console.log('Tenant 1 operations:');
    tenantManager.setTenant('tenant-1');
    userService.setTenant('tenant-1');
    orderService.setTenant('tenant-1');
    productService.setTenant('tenant-1');

    const tenant1User = await userService.createUser({
        email: 'alice@tenant1.com',
        username: 'alice',
        password: 'secret123',
        firstName: 'Alice',
        lastName: 'Johnson'
    });

    const tenant1Product = await productService.addProduct({
        name: 'Enterprise Widget',
        price: 499.99,
        category: 'Enterprise',
        stock: 100
    });

    const tenant1Order = await orderService.createOrder(tenant1User.user.id, [
        { productId: tenant1Product.id, quantity: 2, price: 499.99 }
    ]);

    console.log(`  Created user: ${tenant1User.user.username}`);
    console.log(`  Created product: ${tenant1Product.name}`);
    console.log(`  Created order: ${tenant1Order.id}`);

    // Tenant 2 operations
    console.log('\nTenant 2 operations:');
    tenantManager.setTenant('tenant-2');
    userService.setTenant('tenant-2');
    orderService.setTenant('tenant-2');
    productService.setTenant('tenant-2');

    const tenant2User = await userService.createUser({
        email: 'bob@tenant2.com',
        username: 'bob',
        password: 'secret456',
        firstName: 'Bob',
        lastName: 'Smith'
    });

    const tenant2Product = await productService.addProduct({
        name: 'Startup Gadget',
        price: 99.99,
        category: 'Startup',
        stock: 50
    });

    const tenant2Order = await orderService.createOrder(tenant2User.user.id, [
        { productId: tenant2Product.id, quantity: 5, price: 99.99 }
    ]);

    console.log(`  Created user: ${tenant2User.user.username}`);
    console.log(`  Created product: ${tenant2Product.name}`);
    console.log(`  Created order: ${tenant2Order.id}`);

    console.log('\n--- Data Isolation Test ---\n');

    // Try to access tenant 1 data with tenant 2 context (should fail)
    userService.setTenant('tenant-2');
    const crossTenantUser = await userService.getUser(tenant1User.user.id);
    console.log(`Cross-tenant access result: ${crossTenantUser === null ? 'Blocked (correct)' : 'Allowed (incorrect)'}`);

    console.log('\n--- Database Statistics ---\n');
    console.log(JSON.stringify(sharedDb.getStats(), null, 2));

    console.log('\n--- Transaction Log Sample ---\n');
    const recentTransactions = sharedDb.transactionLog.slice(-5);
    recentTransactions.forEach(tx => {
        console.log(`  [${tx.timestamp}] ${tx.operation} on ${tx.table}`);
    });

    await sharedDb.disconnect();
}

// Run demonstration
if (require.main === module) {
    demonstrateSharedDatabase().catch(console.error);
}

module.exports = {
    SharedDatabase,
    DatabaseAccessLayer,
    ServiceWithSharedDatabase,
    UserManagementService,
    OrderProcessingService,
    ProductCatalogService,
    MultiTenantContextManager
};
