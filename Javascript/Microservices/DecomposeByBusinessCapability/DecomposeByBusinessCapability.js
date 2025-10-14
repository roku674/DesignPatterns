/**
 * Decompose By Business Capability Pattern
 *
 * The Decompose by Business Capability pattern is a microservices decomposition strategy
 * that organizes services around business capabilities rather than technical concerns.
 * A business capability represents what a business does to generate value.
 *
 * Key Concepts:
 * 1. Business Capability: A stable business function (e.g., Order Management, Inventory, Shipping)
 * 2. Service Boundary: Each capability becomes an independent service
 * 3. Autonomy: Services own their data and business logic
 * 4. Communication: Services interact through well-defined APIs
 * 5. Organization Alignment: Teams organized around business capabilities
 *
 * Benefits:
 * - Services are stable (business capabilities don't change often)
 * - Clear ownership and responsibility
 * - Better alignment with business organization
 * - Reduced coupling between services
 * - Easier to understand and maintain
 *
 * Use Cases:
 * - Breaking down monolithic applications
 * - E-commerce platforms (Order, Payment, Inventory, Shipping)
 * - Banking systems (Account, Transaction, Loan, Customer)
 * - Enterprise applications with clear business domains
 */

/**
 * Business Capability Registry
 * Maintains mapping of business capabilities to services
 */
class BusinessCapabilityRegistry {
    constructor() {
        this.capabilities = new Map();
        this.serviceInstances = new Map();
    }

    registerCapability(capabilityName, serviceClass, dependencies = []) {
        if (!capabilityName) {
            throw new Error('Capability name is required');
        }
        if (!serviceClass) {
            throw new Error('Service class is required');
        }

        this.capabilities.set(capabilityName, {
            serviceClass: serviceClass,
            dependencies: dependencies,
            metadata: {
                registeredAt: new Date(),
                version: '1.0.0'
            }
        });

        console.log(`Registered business capability: ${capabilityName}`);
        return this;
    }

    getCapability(capabilityName) {
        const capability = this.capabilities.get(capabilityName);
        if (!capability) {
            throw new Error(`Capability not found: ${capabilityName}`);
        }
        return capability;
    }

    createServiceInstance(capabilityName) {
        if (this.serviceInstances.has(capabilityName)) {
            return this.serviceInstances.get(capabilityName);
        }

        const capability = this.getCapability(capabilityName);
        const ServiceClass = capability.serviceClass;

        // Resolve dependencies
        const dependencies = {};
        for (const depName of capability.dependencies) {
            dependencies[depName] = this.createServiceInstance(depName);
        }

        const instance = new ServiceClass(dependencies);
        this.serviceInstances.set(capabilityName, instance);

        console.log(`Created service instance for: ${capabilityName}`);
        return instance;
    }

    listCapabilities() {
        return Array.from(this.capabilities.keys());
    }

    getCapabilityMetadata(capabilityName) {
        const capability = this.getCapability(capabilityName);
        return capability.metadata;
    }
}

/**
 * Base Service for Business Capabilities
 */
class BusinessCapabilityService {
    constructor(capabilityName, dependencies = {}) {
        if (!capabilityName) {
            throw new Error('Capability name is required');
        }
        this.capabilityName = capabilityName;
        this.dependencies = dependencies;
        this.dataStore = new Map();
        this.eventHandlers = new Map();
        this.isInitialized = false;
    }

    async initialize() {
        console.log(`Initializing ${this.capabilityName} service...`);
        this.isInitialized = true;
        return this;
    }

    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error(`Service ${this.capabilityName} not initialized`);
        }
    }

    on(eventName, handler) {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers.set(eventName, []);
        }
        this.eventHandlers.get(eventName).push(handler);
    }

    emit(eventName, data) {
        const handlers = this.eventHandlers.get(eventName) || [];
        handlers.forEach(handler => handler(data));
    }

    getDependency(name) {
        const dependency = this.dependencies[name];
        if (!dependency) {
            throw new Error(`Dependency not found: ${name}`);
        }
        return dependency;
    }
}

/**
 * Order Management Capability
 * Handles all order-related operations
 */
class OrderManagementService extends BusinessCapabilityService {
    constructor(dependencies = {}) {
        super('OrderManagement', dependencies);
        this.orders = new Map();
        this.orderIdCounter = 1;
    }

    async initialize() {
        await super.initialize();
        console.log('Order Management Service ready');
        return this;
    }

    createOrder(customerId, items) {
        this.ensureInitialized();

        if (!customerId) {
            throw new Error('Customer ID is required');
        }
        if (!items || items.length === 0) {
            throw new Error('Order must have at least one item');
        }

        const orderId = `ORD-${this.orderIdCounter++}`;
        const order = {
            id: orderId,
            customerId: customerId,
            items: items,
            status: 'PENDING',
            totalAmount: this.calculateTotal(items),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.orders.set(orderId, order);
        this.emit('orderCreated', order);

        console.log(`Order created: ${orderId} for customer ${customerId}`);
        return order;
    }

    getOrder(orderId) {
        this.ensureInitialized();

        const order = this.orders.get(orderId);
        if (!order) {
            throw new Error(`Order not found: ${orderId}`);
        }
        return order;
    }

    updateOrderStatus(orderId, newStatus) {
        this.ensureInitialized();

        const order = this.getOrder(orderId);
        const oldStatus = order.status;
        order.status = newStatus;
        order.updatedAt = new Date();

        this.emit('orderStatusChanged', { orderId, oldStatus, newStatus });
        console.log(`Order ${orderId} status changed: ${oldStatus} -> ${newStatus}`);

        return order;
    }

    calculateTotal(items) {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    listOrders(customerId = null) {
        this.ensureInitialized();

        const orders = Array.from(this.orders.values());
        if (customerId) {
            return orders.filter(order => order.customerId === customerId);
        }
        return orders;
    }
}

/**
 * Inventory Management Capability
 * Handles stock and inventory operations
 */
class InventoryManagementService extends BusinessCapabilityService {
    constructor(dependencies = {}) {
        super('InventoryManagement', dependencies);
        this.inventory = new Map();
    }

    async initialize() {
        await super.initialize();
        this.initializeStock();
        console.log('Inventory Management Service ready');
        return this;
    }

    initializeStock() {
        const initialStock = [
            { productId: 'PROD-001', name: 'Laptop', quantity: 50, price: 1200 },
            { productId: 'PROD-002', name: 'Mouse', quantity: 200, price: 25 },
            { productId: 'PROD-003', name: 'Keyboard', quantity: 150, price: 75 }
        ];

        initialStock.forEach(item => {
            this.inventory.set(item.productId, item);
        });
    }

    checkAvailability(productId, quantity) {
        this.ensureInitialized();

        const item = this.inventory.get(productId);
        if (!item) {
            throw new Error(`Product not found: ${productId}`);
        }

        return item.quantity >= quantity;
    }

    reserveStock(productId, quantity) {
        this.ensureInitialized();

        if (!this.checkAvailability(productId, quantity)) {
            throw new Error(`Insufficient stock for product: ${productId}`);
        }

        const item = this.inventory.get(productId);
        item.quantity -= quantity;

        this.emit('stockReserved', { productId, quantity, remainingStock: item.quantity });
        console.log(`Reserved ${quantity} units of ${productId}. Remaining: ${item.quantity}`);

        return true;
    }

    releaseStock(productId, quantity) {
        this.ensureInitialized();

        const item = this.inventory.get(productId);
        if (!item) {
            throw new Error(`Product not found: ${productId}`);
        }

        item.quantity += quantity;
        this.emit('stockReleased', { productId, quantity, totalStock: item.quantity });
        console.log(`Released ${quantity} units of ${productId}. Total: ${item.quantity}`);

        return true;
    }

    getProductInfo(productId) {
        this.ensureInitialized();

        const item = this.inventory.get(productId);
        if (!item) {
            throw new Error(`Product not found: ${productId}`);
        }
        return { ...item };
    }

    listAllProducts() {
        this.ensureInitialized();
        return Array.from(this.inventory.values());
    }
}

/**
 * Payment Processing Capability
 * Handles payment transactions
 */
class PaymentProcessingService extends BusinessCapabilityService {
    constructor(dependencies = {}) {
        super('PaymentProcessing', dependencies);
        this.transactions = new Map();
        this.transactionIdCounter = 1;
    }

    async initialize() {
        await super.initialize();
        console.log('Payment Processing Service ready');
        return this;
    }

    processPayment(orderId, amount, paymentMethod) {
        this.ensureInitialized();

        if (!orderId) {
            throw new Error('Order ID is required');
        }
        if (amount <= 0) {
            throw new Error('Payment amount must be positive');
        }

        const transactionId = `TXN-${this.transactionIdCounter++}`;
        const transaction = {
            id: transactionId,
            orderId: orderId,
            amount: amount,
            paymentMethod: paymentMethod,
            status: 'PROCESSING',
            createdAt: new Date()
        };

        this.transactions.set(transactionId, transaction);

        // Simulate payment processing
        const success = Math.random() > 0.1; // 90% success rate
        transaction.status = success ? 'COMPLETED' : 'FAILED';
        transaction.completedAt = new Date();

        this.emit('paymentProcessed', transaction);
        console.log(`Payment ${transactionId} for order ${orderId}: ${transaction.status}`);

        return transaction;
    }

    refundPayment(transactionId) {
        this.ensureInitialized();

        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            throw new Error(`Transaction not found: ${transactionId}`);
        }

        if (transaction.status !== 'COMPLETED') {
            throw new Error('Can only refund completed transactions');
        }

        const refundId = `RFD-${this.transactionIdCounter++}`;
        const refund = {
            id: refundId,
            originalTransactionId: transactionId,
            amount: transaction.amount,
            status: 'REFUNDED',
            refundedAt: new Date()
        };

        this.transactions.set(refundId, refund);
        this.emit('paymentRefunded', refund);
        console.log(`Refund ${refundId} processed for transaction ${transactionId}`);

        return refund;
    }

    getTransaction(transactionId) {
        this.ensureInitialized();

        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            throw new Error(`Transaction not found: ${transactionId}`);
        }
        return transaction;
    }
}

/**
 * Shipping Capability
 * Handles order fulfillment and shipping
 */
class ShippingService extends BusinessCapabilityService {
    constructor(dependencies = {}) {
        super('Shipping', dependencies);
        this.shipments = new Map();
        this.shipmentIdCounter = 1;
    }

    async initialize() {
        await super.initialize();
        console.log('Shipping Service ready');
        return this;
    }

    createShipment(orderId, address) {
        this.ensureInitialized();

        if (!orderId) {
            throw new Error('Order ID is required');
        }
        if (!address) {
            throw new Error('Shipping address is required');
        }

        const shipmentId = `SHIP-${this.shipmentIdCounter++}`;
        const shipment = {
            id: shipmentId,
            orderId: orderId,
            address: address,
            status: 'PENDING',
            trackingNumber: this.generateTrackingNumber(),
            createdAt: new Date(),
            estimatedDelivery: this.calculateDeliveryDate()
        };

        this.shipments.set(shipmentId, shipment);
        this.emit('shipmentCreated', shipment);
        console.log(`Shipment created: ${shipmentId} for order ${orderId}`);

        return shipment;
    }

    updateShipmentStatus(shipmentId, status) {
        this.ensureInitialized();

        const shipment = this.shipments.get(shipmentId);
        if (!shipment) {
            throw new Error(`Shipment not found: ${shipmentId}`);
        }

        shipment.status = status;
        shipment.updatedAt = new Date();

        if (status === 'DELIVERED') {
            shipment.deliveredAt = new Date();
        }

        this.emit('shipmentStatusChanged', shipment);
        console.log(`Shipment ${shipmentId} status: ${status}`);

        return shipment;
    }

    trackShipment(shipmentId) {
        this.ensureInitialized();

        const shipment = this.shipments.get(shipmentId);
        if (!shipment) {
            throw new Error(`Shipment not found: ${shipmentId}`);
        }
        return shipment;
    }

    generateTrackingNumber() {
        return `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }

    calculateDeliveryDate() {
        const date = new Date();
        date.setDate(date.getDate() + 3); // 3 days for delivery
        return date;
    }
}

// Example usage demonstrating the Decompose By Business Capability pattern
console.log('=== Decompose By Business Capability Pattern Demo ===\n');

// Create registry and register business capabilities
const registry = new BusinessCapabilityRegistry();

registry
    .registerCapability('InventoryManagement', InventoryManagementService)
    .registerCapability('PaymentProcessing', PaymentProcessingService)
    .registerCapability('Shipping', ShippingService)
    .registerCapability('OrderManagement', OrderManagementService, [
        'InventoryManagement',
        'PaymentProcessing',
        'Shipping'
    ]);

console.log('Registered Capabilities:', registry.listCapabilities());
console.log('');

// Create service instances
const inventoryService = registry.createServiceInstance('InventoryManagement');
const paymentService = registry.createServiceInstance('PaymentProcessing');
const shippingService = registry.createServiceInstance('Shipping');
const orderService = registry.createServiceInstance('OrderManagement');

// Initialize services
async function demonstrateBusinessCapabilities() {
    await inventoryService.initialize();
    await paymentService.initialize();
    await shippingService.initialize();
    await orderService.initialize();

    console.log('\n--- Business Capability Demonstration ---\n');

    // List available products
    console.log('Available Products:');
    const products = inventoryService.listAllProducts();
    products.forEach(p => console.log(`  ${p.productId}: ${p.name} - $${p.price} (Stock: ${p.quantity})`));
    console.log('');

    // Create an order
    const order = orderService.createOrder('CUST-123', [
        { productId: 'PROD-001', quantity: 2, price: 1200 },
        { productId: 'PROD-002', quantity: 3, price: 25 }
    ]);
    console.log(`Order Total: $${order.totalAmount}\n`);

    // Reserve inventory
    order.items.forEach(item => {
        inventoryService.reserveStock(item.productId, item.quantity);
    });
    console.log('');

    // Process payment
    const payment = paymentService.processPayment(order.id, order.totalAmount, 'CREDIT_CARD');
    console.log('');

    if (payment.status === 'COMPLETED') {
        // Update order status
        orderService.updateOrderStatus(order.id, 'PAID');
        console.log('');

        // Create shipment
        const shipment = shippingService.createShipment(order.id, {
            street: '123 Main St',
            city: 'Springfield',
            zipCode: '12345'
        });
        console.log(`Tracking Number: ${shipment.trackingNumber}`);
        console.log(`Estimated Delivery: ${shipment.estimatedDelivery.toDateString()}\n`);

        // Update order status
        orderService.updateOrderStatus(order.id, 'SHIPPED');
        console.log('');

        // Simulate shipment updates
        shippingService.updateShipmentStatus(shipment.id, 'IN_TRANSIT');
        shippingService.updateShipmentStatus(shipment.id, 'DELIVERED');
        console.log('');

        // Update final order status
        orderService.updateOrderStatus(order.id, 'COMPLETED');
    }

    console.log('\n--- Capability Summary ---');
    console.log(`Orders Created: ${orderService.orders.size}`);
    console.log(`Transactions Processed: ${paymentService.transactions.size}`);
    console.log(`Shipments Created: ${shippingService.shipments.size}`);
}

demonstrateBusinessCapabilities().catch(console.error);

module.exports = {
    BusinessCapabilityRegistry,
    BusinessCapabilityService,
    OrderManagementService,
    InventoryManagementService,
    PaymentProcessingService,
    ShippingService
};
