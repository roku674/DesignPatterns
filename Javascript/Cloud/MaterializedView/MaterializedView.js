/**
 * Materialized View Pattern Implementation
 *
 * Materialized Views are pre-computed query results stored for fast retrieval.
 * Instead of running complex queries repeatedly, results are materialized and kept up-to-date.
 *
 * Key Components:
 * - View Builder: Creates and maintains materialized views
 * - View Store: Storage for materialized views
 * - Refresh Strategy: Incremental, full, or on-demand refresh
 * - Change Data Capture: Track changes to source data
 * - View Query Engine: Fast queries against materialized views
 */

/**
 * Data Source - Simulates source database
 */
class DataSource {
    constructor() {
        this.tables = new Map();
        this.changeListeners = [];
    }

    createTable(tableName) {
        this.tables.set(tableName, []);
    }

    insert(tableName, record) {
        const table = this.tables.get(tableName);
        if (!table) {
            throw new Error(`Table not found: ${tableName}`);
        }

        const recordWithId = {
            ...record,
            _id: this.generateId(),
            _createdAt: new Date()
        };

        table.push(recordWithId);
        this.notifyChange('INSERT', tableName, recordWithId);
        return recordWithId;
    }

    update(tableName, predicate, updates) {
        const table = this.tables.get(tableName);
        if (!table) {
            throw new Error(`Table not found: ${tableName}`);
        }

        const updatedRecords = [];
        for (const record of table) {
            if (predicate(record)) {
                Object.assign(record, updates, { _updatedAt: new Date() });
                updatedRecords.push(record);
            }
        }

        updatedRecords.forEach(record => {
            this.notifyChange('UPDATE', tableName, record);
        });

        return updatedRecords;
    }

    delete(tableName, predicate) {
        const table = this.tables.get(tableName);
        if (!table) {
            throw new Error(`Table not found: ${tableName}`);
        }

        const toDelete = table.filter(predicate);
        const remaining = table.filter(r => !predicate(r));

        this.tables.set(tableName, remaining);

        toDelete.forEach(record => {
            this.notifyChange('DELETE', tableName, record);
        });

        return toDelete.length;
    }

    query(tableName, predicate = () => true) {
        const table = this.tables.get(tableName);
        if (!table) {
            return [];
        }
        return table.filter(predicate);
    }

    onDataChange(listener) {
        this.changeListeners.push(listener);
    }

    notifyChange(operation, tableName, record) {
        const change = { operation, tableName, record, timestamp: new Date() };
        for (const listener of this.changeListeners) {
            listener(change);
        }
    }

    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Materialized View Definition
 */
class ViewDefinition {
    constructor(name, sourceTables, queryFn, refreshStrategy = 'on-demand') {
        this.name = name;
        this.sourceTables = sourceTables;
        this.queryFn = queryFn;
        this.refreshStrategy = refreshStrategy; // 'on-demand', 'incremental', 'full'
        this.lastRefresh = null;
        this.version = 0;
    }
}

/**
 * View Store - Storage for materialized views
 */
class ViewStore {
    constructor() {
        this.views = new Map();
        this.metadata = new Map();
    }

    saveView(viewName, data) {
        this.views.set(viewName, data);
        this.metadata.set(viewName, {
            rowCount: data.length,
            lastUpdated: new Date(),
            size: JSON.stringify(data).length
        });
    }

    getView(viewName) {
        return this.views.get(viewName);
    }

    getMetadata(viewName) {
        return this.metadata.get(viewName);
    }

    deleteView(viewName) {
        this.views.delete(viewName);
        this.metadata.delete(viewName);
    }

    getAllViews() {
        return Array.from(this.views.keys());
    }
}

/**
 * View Builder - Creates and maintains materialized views
 */
class MaterializedViewBuilder {
    constructor(dataSource, viewStore) {
        this.dataSource = dataSource;
        this.viewStore = viewStore;
        this.viewDefinitions = new Map();
        this.refreshSchedules = new Map();

        // Listen for data changes
        this.dataSource.onDataChange((change) => {
            this.handleDataChange(change);
        });
    }

    defineView(definition) {
        this.viewDefinitions.set(definition.name, definition);

        if (definition.refreshStrategy === 'incremental') {
            // Auto-refresh on data changes
            this.setupIncrementalRefresh(definition);
        }
    }

    async buildView(viewName) {
        const definition = this.viewDefinitions.get(viewName);
        if (!definition) {
            throw new Error(`View definition not found: ${viewName}`);
        }

        console.log(`Building materialized view: ${viewName}`);

        // Execute query function
        const result = await definition.queryFn(this.dataSource);

        // Store result
        this.viewStore.saveView(viewName, result);
        definition.lastRefresh = new Date();
        definition.version++;

        console.log(`View ${viewName} built with ${result.length} rows`);

        return result;
    }

    async refreshView(viewName) {
        return await this.buildView(viewName);
    }

    setupIncrementalRefresh(definition) {
        // Mark view for incremental refresh
        this.refreshSchedules.set(definition.name, {
            type: 'incremental',
            lastRefresh: new Date()
        });
    }

    handleDataChange(change) {
        // Find views that depend on changed table
        for (const [viewName, definition] of this.viewDefinitions) {
            if (definition.sourceTables.includes(change.tableName)) {
                if (definition.refreshStrategy === 'incremental') {
                    // Trigger incremental refresh
                    this.refreshView(viewName).catch(console.error);
                }
            }
        }
    }

    queryView(viewName, filter = () => true) {
        const viewData = this.viewStore.getView(viewName);
        if (!viewData) {
            throw new Error(`View not found: ${viewName}. Did you build it?`);
        }

        return viewData.filter(filter);
    }

    getViewStatistics(viewName) {
        const definition = this.viewDefinitions.get(viewName);
        const metadata = this.viewStore.getMetadata(viewName);

        return {
            name: viewName,
            definition: {
                sourceTables: definition?.sourceTables,
                refreshStrategy: definition?.refreshStrategy,
                lastRefresh: definition?.lastRefresh,
                version: definition?.version
            },
            storage: metadata
        };
    }

    getAllViewStatistics() {
        const stats = [];
        for (const viewName of this.viewStore.getAllViews()) {
            stats.push(this.getViewStatistics(viewName));
        }
        return stats;
    }
}

/**
 * View Query Optimizer
 */
class ViewQueryOptimizer {
    constructor(viewBuilder) {
        this.viewBuilder = viewBuilder;
    }

    optimizeQuery(query) {
        // Analyze query to determine if a materialized view can be used
        const availableViews = this.viewBuilder.viewStore.getAllViews();

        for (const viewName of availableViews) {
            const viewData = this.viewBuilder.viewStore.getView(viewName);
            // In a real system, would analyze query plan and view schema
            // For demonstration, we'll return the view if it exists
            if (viewData && viewData.length > 0) {
                return {
                    useView: true,
                    viewName,
                    estimatedRows: viewData.length
                };
            }
        }

        return {
            useView: false,
            estimatedRows: -1
        };
    }
}

/**
 * View Refresh Scheduler
 */
class ViewRefreshScheduler {
    constructor(viewBuilder) {
        this.viewBuilder = viewBuilder;
        this.schedules = new Map();
    }

    schedulePeriodicRefresh(viewName, intervalMs) {
        if (this.schedules.has(viewName)) {
            clearInterval(this.schedules.get(viewName));
        }

        const intervalId = setInterval(async () => {
            console.log(`Periodic refresh triggered for view: ${viewName}`);
            await this.viewBuilder.refreshView(viewName);
        }, intervalMs);

        this.schedules.set(viewName, intervalId);
    }

    cancelSchedule(viewName) {
        if (this.schedules.has(viewName)) {
            clearInterval(this.schedules.get(viewName));
            this.schedules.delete(viewName);
        }
    }

    cancelAllSchedules() {
        for (const intervalId of this.schedules.values()) {
            clearInterval(intervalId);
        }
        this.schedules.clear();
    }
}

/**
 * Demonstration
 */
async function demonstrateMaterializedView() {
    console.log('=== Materialized View Pattern Demonstration ===\n');

    // Setup
    const dataSource = new DataSource();
    const viewStore = new ViewStore();
    const viewBuilder = new MaterializedViewBuilder(dataSource, viewStore);

    // Create tables
    dataSource.createTable('orders');
    dataSource.createTable('customers');
    dataSource.createTable('products');

    // Insert sample data
    console.log('1. Populating source tables...');

    dataSource.insert('customers', { id: 'c1', name: 'Alice', country: 'USA' });
    dataSource.insert('customers', { id: 'c2', name: 'Bob', country: 'UK' });
    dataSource.insert('customers', { id: 'c3', name: 'Charlie', country: 'USA' });

    dataSource.insert('products', { id: 'p1', name: 'Laptop', price: 1000 });
    dataSource.insert('products', { id: 'p2', name: 'Mouse', price: 25 });
    dataSource.insert('products', { id: 'p3', name: 'Keyboard', price: 75 });

    dataSource.insert('orders', { customerId: 'c1', productId: 'p1', quantity: 1, total: 1000 });
    dataSource.insert('orders', { customerId: 'c1', productId: 'p2', quantity: 2, total: 50 });
    dataSource.insert('orders', { customerId: 'c2', productId: 'p3', quantity: 1, total: 75 });
    dataSource.insert('orders', { customerId: 'c3', productId: 'p1', quantity: 1, total: 1000 });

    // Define materialized view: Customer Order Summary
    console.log('\n2. Defining materialized view...');

    const customerOrderSummaryView = new ViewDefinition(
        'CustomerOrderSummary',
        ['orders', 'customers'],
        async (source) => {
            const orders = source.query('orders');
            const customers = source.query('customers');

            // Aggregate orders by customer
            const summary = new Map();

            for (const order of orders) {
                if (!summary.has(order.customerId)) {
                    summary.set(order.customerId, {
                        customerId: order.customerId,
                        totalOrders: 0,
                        totalAmount: 0,
                        orders: []
                    });
                }

                const customerSummary = summary.get(order.customerId);
                customerSummary.totalOrders++;
                customerSummary.totalAmount += order.total;
                customerSummary.orders.push(order);
            }

            // Join with customer data
            const result = [];
            for (const [customerId, orderSummary] of summary) {
                const customer = customers.find(c => c.id === customerId);
                if (customer) {
                    result.push({
                        ...orderSummary,
                        customerName: customer.name,
                        country: customer.country
                    });
                }
            }

            return result;
        },
        'incremental'
    );

    viewBuilder.defineView(customerOrderSummaryView);

    // Build the view
    console.log('\n3. Building materialized view...');
    console.time('View build time');
    await viewBuilder.buildView('CustomerOrderSummary');
    console.timeEnd('View build time');

    // Query the materialized view
    console.log('\n4. Querying materialized view...');
    console.time('View query time');
    const usSummary = viewBuilder.queryView('CustomerOrderSummary', (row) => row.country === 'USA');
    console.timeEnd('View query time');
    console.log('US Customer Summary:', JSON.stringify(usSummary, null, 2));

    // Insert new data and observe incremental refresh
    console.log('\n5. Testing incremental refresh...');
    console.log('Inserting new order...');
    dataSource.insert('orders', { customerId: 'c2', productId: 'p2', quantity: 3, total: 75 });

    // Wait a bit for incremental refresh
    await new Promise(resolve => setTimeout(resolve, 100));

    const updatedSummary = viewBuilder.queryView('CustomerOrderSummary');
    console.log('Updated summary after incremental refresh:');
    updatedSummary.forEach(row => {
        console.log(`  ${row.customerName}: ${row.totalOrders} orders, $${row.totalAmount} total`);
    });

    // View statistics
    console.log('\n6. View statistics:');
    const stats = viewBuilder.getViewStatistics('CustomerOrderSummary');
    console.log(JSON.stringify(stats, null, 2));

    // Demonstrate query optimizer
    console.log('\n7. Query optimization:');
    const optimizer = new ViewQueryOptimizer(viewBuilder);
    const queryPlan = optimizer.optimizeQuery({ table: 'CustomerOrderSummary' });
    console.log('Query plan:', JSON.stringify(queryPlan, null, 2));

    // Define another view: Product Sales Summary
    console.log('\n8. Creating product sales summary view...');

    const productSalesView = new ViewDefinition(
        'ProductSales',
        ['orders', 'products'],
        async (source) => {
            const orders = source.query('orders');
            const products = source.query('products');

            const sales = new Map();

            for (const order of orders) {
                if (!sales.has(order.productId)) {
                    sales.set(order.productId, {
                        productId: order.productId,
                        totalQuantity: 0,
                        totalRevenue: 0
                    });
                }

                const productSale = sales.get(order.productId);
                productSale.totalQuantity += order.quantity;
                productSale.totalRevenue += order.total;
            }

            const result = [];
            for (const [productId, sale] of sales) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    result.push({
                        ...sale,
                        productName: product.name,
                        price: product.price
                    });
                }
            }

            return result;
        },
        'on-demand'
    );

    viewBuilder.defineView(productSalesView);
    await viewBuilder.buildView('ProductSales');

    const productSales = viewBuilder.queryView('ProductSales');
    console.log('Product Sales Summary:', JSON.stringify(productSales, null, 2));

    console.log('\n9. All view statistics:');
    console.log(JSON.stringify(viewBuilder.getAllViewStatistics(), null, 2));
}

// Run demonstration
if (require.main === module) {
    demonstrateMaterializedView().catch(console.error);
}

module.exports = {
    DataSource,
    ViewDefinition,
    ViewStore,
    MaterializedViewBuilder,
    ViewQueryOptimizer,
    ViewRefreshScheduler
};
