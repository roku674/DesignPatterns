/**
 * Decompose by Business Capability Pattern (Alternate Naming)
 *
 * This is an alternate implementation that focuses on capability-driven decomposition
 * with emphasis on business domains and bounded contexts.
 *
 * Key Concepts:
 * 1. Domain-Driven Decomposition
 * 2. Capability Mapping
 * 3. Service Boundaries
 * 4. Cross-Capability Communication
 * 5. Bounded Contexts
 */

const { BusinessCapabilityRegistry, BusinessCapabilityService } = require('../DecomposeByBusinessCapability/DecomposeByBusinessCapability.js');

/**
 * Capability Mapper
 * Maps business domains to specific capabilities
 */
class CapabilityMapper {
    constructor() {
        this.domainMap = new Map();
        this.capabilityGraph = new Map();
    }

    defineBusinessDomain(domainName, capabilities) {
        if (!domainName) {
            throw new Error('Domain name is required');
        }

        this.domainMap.set(domainName, {
            name: domainName,
            capabilities: capabilities,
            boundedContexts: this.identifyBoundedContexts(capabilities)
        });

        console.log(`Defined business domain: ${domainName} with ${capabilities.length} capabilities`);
        return this;
    }

    identifyBoundedContexts(capabilities) {
        // Group related capabilities into bounded contexts
        const contexts = [];
        const groupedCapabilities = new Map();

        capabilities.forEach(cap => {
            const context = cap.context || 'default';
            if (!groupedCapabilities.has(context)) {
                groupedCapabilities.set(context, []);
            }
            groupedCapabilities.get(context).push(cap.name);
        });

        groupedCapabilities.forEach((caps, context) => {
            contexts.push({ context, capabilities: caps });
        });

        return contexts;
    }

    addCapabilityDependency(fromCapability, toCapability, dependencyType = 'sync') {
        if (!this.capabilityGraph.has(fromCapability)) {
            this.capabilityGraph.set(fromCapability, []);
        }

        this.capabilityGraph.get(fromCapability).push({
            target: toCapability,
            type: dependencyType
        });

        console.log(`Added ${dependencyType} dependency: ${fromCapability} -> ${toCapability}`);
        return this;
    }

    getCapabilityDependencies(capabilityName) {
        return this.capabilityGraph.get(capabilityName) || [];
    }

    getDomainCapabilities(domainName) {
        const domain = this.domainMap.get(domainName);
        if (!domain) {
            throw new Error(`Domain not found: ${domainName}`);
        }
        return domain.capabilities;
    }

    visualizeDomainArchitecture(domainName) {
        const domain = this.domainMap.get(domainName);
        if (!domain) {
            throw new Error(`Domain not found: ${domainName}`);
        }

        console.log(`\n=== Domain Architecture: ${domainName} ===`);
        console.log(`\nBounded Contexts:`);
        domain.boundedContexts.forEach(ctx => {
            console.log(`  [${ctx.context}]`);
            ctx.capabilities.forEach(cap => {
                console.log(`    - ${cap}`);
                const deps = this.getCapabilityDependencies(cap);
                if (deps.length > 0) {
                    deps.forEach(dep => {
                        console.log(`      -> ${dep.target} (${dep.type})`);
                    });
                }
            });
        });
    }
}

/**
 * Customer Management Capability (Example)
 */
class CustomerManagementService extends BusinessCapabilityService {
    constructor(dependencies = {}) {
        super('CustomerManagement', dependencies);
        this.customers = new Map();
        this.customerIdCounter = 1;
    }

    async initialize() {
        await super.initialize();
        console.log('Customer Management Service ready');
        return this;
    }

    createCustomer(customerData) {
        this.ensureInitialized();

        if (!customerData.name) {
            throw new Error('Customer name is required');
        }
        if (!customerData.email) {
            throw new Error('Customer email is required');
        }

        const customerId = `CUST-${this.customerIdCounter++}`;
        const customer = {
            id: customerId,
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone || null,
            address: customerData.address || null,
            status: 'ACTIVE',
            createdAt: new Date()
        };

        this.customers.set(customerId, customer);
        this.emit('customerCreated', customer);

        console.log(`Customer created: ${customerId} - ${customer.name}`);
        return customer;
    }

    getCustomer(customerId) {
        this.ensureInitialized();

        const customer = this.customers.get(customerId);
        if (!customer) {
            throw new Error(`Customer not found: ${customerId}`);
        }
        return { ...customer };
    }

    updateCustomer(customerId, updates) {
        this.ensureInitialized();

        const customer = this.customers.get(customerId);
        if (!customer) {
            throw new Error(`Customer not found: ${customerId}`);
        }

        Object.assign(customer, updates);
        customer.updatedAt = new Date();

        this.emit('customerUpdated', customer);
        console.log(`Customer updated: ${customerId}`);

        return { ...customer };
    }

    listCustomers(filter = {}) {
        this.ensureInitialized();

        let customers = Array.from(this.customers.values());

        if (filter.status) {
            customers = customers.filter(c => c.status === filter.status);
        }

        return customers;
    }
}

/**
 * Catalog Management Capability (Example)
 */
class CatalogManagementService extends BusinessCapabilityService {
    constructor(dependencies = {}) {
        super('CatalogManagement', dependencies);
        this.products = new Map();
        this.categories = new Map();
        this.productIdCounter = 1;
    }

    async initialize() {
        await super.initialize();
        this.initializeCategories();
        console.log('Catalog Management Service ready');
        return this;
    }

    initializeCategories() {
        const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden'];
        categories.forEach(cat => {
            this.categories.set(cat, { name: cat, products: [] });
        });
    }

    addProduct(productData) {
        this.ensureInitialized();

        if (!productData.name) {
            throw new Error('Product name is required');
        }
        if (!productData.category) {
            throw new Error('Product category is required');
        }

        const productId = `PROD-${this.productIdCounter++}`;
        const product = {
            id: productId,
            name: productData.name,
            description: productData.description || '',
            category: productData.category,
            price: productData.price,
            attributes: productData.attributes || {},
            status: 'ACTIVE',
            createdAt: new Date()
        };

        this.products.set(productId, product);

        const category = this.categories.get(productData.category);
        if (category) {
            category.products.push(productId);
        }

        this.emit('productAdded', product);
        console.log(`Product added: ${productId} - ${product.name}`);

        return product;
    }

    getProduct(productId) {
        this.ensureInitialized();

        const product = this.products.get(productId);
        if (!product) {
            throw new Error(`Product not found: ${productId}`);
        }
        return { ...product };
    }

    searchProducts(criteria) {
        this.ensureInitialized();

        let products = Array.from(this.products.values());

        if (criteria.category) {
            products = products.filter(p => p.category === criteria.category);
        }

        if (criteria.name) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(criteria.name.toLowerCase())
            );
        }

        if (criteria.minPrice !== undefined) {
            products = products.filter(p => p.price >= criteria.minPrice);
        }

        if (criteria.maxPrice !== undefined) {
            products = products.filter(p => p.price <= criteria.maxPrice);
        }

        return products;
    }

    listCategories() {
        this.ensureInitialized();
        return Array.from(this.categories.keys());
    }
}

// Example usage
console.log('=== Decompose by Business Capability Pattern (Alternate) ===\n');

const mapper = new CapabilityMapper();

// Define e-commerce business domain
mapper.defineBusinessDomain('E-Commerce', [
    { name: 'CustomerManagement', context: 'Customer' },
    { name: 'CatalogManagement', context: 'Catalog' },
    { name: 'OrderManagement', context: 'Order' },
    { name: 'InventoryManagement', context: 'Catalog' },
    { name: 'PaymentProcessing', context: 'Order' },
    { name: 'Shipping', context: 'Fulfillment' }
]);

// Define capability dependencies
mapper
    .addCapabilityDependency('OrderManagement', 'CustomerManagement', 'sync')
    .addCapabilityDependency('OrderManagement', 'CatalogManagement', 'sync')
    .addCapabilityDependency('OrderManagement', 'InventoryManagement', 'sync')
    .addCapabilityDependency('OrderManagement', 'PaymentProcessing', 'sync')
    .addCapabilityDependency('Shipping', 'OrderManagement', 'async');

mapper.visualizeDomainArchitecture('E-Commerce');

// Create service registry
const registry = new BusinessCapabilityRegistry();
registry
    .registerCapability('CustomerManagement', CustomerManagementService)
    .registerCapability('CatalogManagement', CatalogManagementService);

// Create service instances
const customerService = registry.createServiceInstance('CustomerManagement');
const catalogService = registry.createServiceInstance('CatalogManagement');

// Demonstrate capabilities
async function demonstrateCapabilities() {
    await customerService.initialize();
    await catalogService.initialize();

    console.log('\n--- Capability Demonstration ---\n');

    // Customer management
    const customer = customerService.createCustomer({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        address: '123 Main St, City, State'
    });

    // Catalog management
    const product1 = catalogService.addProduct({
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        category: 'Electronics',
        price: 29.99,
        attributes: { color: 'Black', wireless: true }
    });

    const product2 = catalogService.addProduct({
        name: 'Programming Book',
        description: 'Learn advanced JavaScript',
        category: 'Books',
        price: 39.99
    });

    console.log('\nSearching Electronics:');
    const electronics = catalogService.searchProducts({ category: 'Electronics' });
    electronics.forEach(p => console.log(`  - ${p.name}: $${p.price}`));

    console.log('\nActive Customers:', customerService.listCustomers({ status: 'ACTIVE' }).length);
    console.log('Total Products:', catalogService.searchProducts({}).length);
}

demonstrateCapabilities().catch(console.error);

module.exports = {
    CapabilityMapper,
    CustomerManagementService,
    CatalogManagementService
};
