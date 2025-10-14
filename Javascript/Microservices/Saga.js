/**
 * Saga Pattern
 *
 * Purpose: Manage distributed transactions across multiple services using
 * a sequence of local transactions. Each local transaction updates the
 * database and publishes events/messages to trigger the next step. If any
 * step fails, the saga executes compensating transactions to undo changes.
 *
 * Key Components:
 * - Saga Coordinator: Orchestrates the saga execution
 * - Saga Steps: Individual transactions in the saga
 * - Compensating Transactions: Undo operations for failed steps
 * - Saga State: Tracks progress and state
 * - Event/Command Bus: Communication between steps
 *
 * Two Implementation Styles:
 * 1. Choreography: Services listen to events and trigger next steps
 * 2. Orchestration: Central coordinator manages the entire flow (this file)
 *
 * Benefits:
 * - Maintains data consistency without distributed transactions
 * - Supports long-running transactions
 * - Better fault tolerance
 * - Loose coupling between services
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Saga Step - Represents a single step in a saga
 */
class SagaStep {
    constructor(name, action, compensation) {
        this.name = name;
        this.action = action;
        this.compensation = compensation;
        this.status = 'pending';
        this.result = null;
        this.error = null;
        this.startedAt = null;
        this.completedAt = null;
    }

    async execute(context) {
        this.status = 'executing';
        this.startedAt = new Date().toISOString();

        try {
            this.result = await this.action(context);
            this.status = 'completed';
            this.completedAt = new Date().toISOString();
            return this.result;
        } catch (error) {
            this.status = 'failed';
            this.error = error.message;
            this.completedAt = new Date().toISOString();
            throw error;
        }
    }

    async compensate(context) {
        if (this.status !== 'completed') {
            return;
        }

        console.log(`[Saga] Compensating step: ${this.name}`);
        this.status = 'compensating';

        try {
            await this.compensation(context, this.result);
            this.status = 'compensated';
        } catch (error) {
            this.status = 'compensation-failed';
            this.error = error.message;
            throw error;
        }
    }

    getStatus() {
        return {
            name: this.name,
            status: this.status,
            startedAt: this.startedAt,
            completedAt: this.completedAt,
            error: this.error
        };
    }
}

/**
 * Saga Definition - Defines the saga workflow
 */
class SagaDefinition {
    constructor(name) {
        this.name = name;
        this.steps = [];
    }

    addStep(name, action, compensation) {
        const step = new SagaStep(name, action, compensation);
        this.steps.push(step);
        return this;
    }

    getSteps() {
        return [...this.steps];
    }
}

/**
 * Saga Instance - Represents a running saga
 */
class SagaInstance extends EventEmitter {
    constructor(definition, initialContext = {}) {
        super();
        this.id = crypto.randomUUID();
        this.definition = definition;
        this.context = {
            ...initialContext,
            sagaId: this.id,
            results: {},
            errors: []
        };
        this.currentStepIndex = 0;
        this.status = 'pending';
        this.startedAt = null;
        this.completedAt = null;
    }

    async execute() {
        this.status = 'running';
        this.startedAt = new Date().toISOString();
        this.emit('started', this);

        try {
            // Execute all steps
            for (let i = 0; i < this.definition.steps.length; i++) {
                this.currentStepIndex = i;
                const step = this.definition.steps[i];

                this.emit('step-started', { saga: this, step });
                console.log(`[Saga ${this.id}] Executing step: ${step.name}`);

                try {
                    const result = await step.execute(this.context);
                    this.context.results[step.name] = result;
                    this.emit('step-completed', { saga: this, step, result });
                } catch (error) {
                    console.error(`[Saga ${this.id}] Step ${step.name} failed:`, error.message);
                    this.context.errors.push({
                        step: step.name,
                        error: error.message
                    });
                    this.emit('step-failed', { saga: this, step, error });
                    throw error;
                }
            }

            // All steps completed successfully
            this.status = 'completed';
            this.completedAt = new Date().toISOString();
            this.emit('completed', this);
            console.log(`[Saga ${this.id}] Completed successfully`);

        } catch (error) {
            // Saga failed, execute compensations
            this.status = 'compensating';
            this.emit('compensating', this);
            console.log(`[Saga ${this.id}] Starting compensation`);

            await this.compensate();

            this.status = 'failed';
            this.completedAt = new Date().toISOString();
            this.emit('failed', this);
            console.log(`[Saga ${this.id}] Failed and compensated`);

            throw error;
        }

        return this.context;
    }

    async compensate() {
        // Execute compensations in reverse order
        for (let i = this.currentStepIndex; i >= 0; i--) {
            const step = this.definition.steps[i];

            if (step.status === 'completed') {
                try {
                    await step.compensate(this.context);
                    this.emit('step-compensated', { saga: this, step });
                } catch (error) {
                    console.error(`[Saga ${this.id}] Compensation failed for ${step.name}:`, error.message);
                    this.emit('compensation-failed', { saga: this, step, error });
                    // Continue with other compensations even if one fails
                }
            }
        }
    }

    getState() {
        return {
            id: this.id,
            definition: this.definition.name,
            status: this.status,
            currentStep: this.currentStepIndex,
            totalSteps: this.definition.steps.length,
            startedAt: this.startedAt,
            completedAt: this.completedAt,
            steps: this.definition.steps.map(s => s.getStatus()),
            context: this.context
        };
    }
}

/**
 * Saga Coordinator - Manages saga execution
 */
class SagaCoordinator extends EventEmitter {
    constructor() {
        super();
        this.definitions = new Map();
        this.instances = new Map();
        this.history = [];
    }

    registerSaga(definition) {
        if (!(definition instanceof SagaDefinition)) {
            throw new Error('Invalid saga definition');
        }

        this.definitions.set(definition.name, definition);
        console.log(`[SagaCoordinator] Registered saga: ${definition.name}`);
    }

    async startSaga(sagaName, initialContext = {}) {
        const definition = this.definitions.get(sagaName);
        if (!definition) {
            throw new Error(`Saga ${sagaName} not found`);
        }

        const instance = new SagaInstance(definition, initialContext);
        this.instances.set(instance.id, instance);

        // Forward events
        instance.on('started', (saga) => this.emit('saga-started', saga));
        instance.on('completed', (saga) => {
            this.emit('saga-completed', saga);
            this.history.push(saga.getState());
        });
        instance.on('failed', (saga) => {
            this.emit('saga-failed', saga);
            this.history.push(saga.getState());
        });

        console.log(`[SagaCoordinator] Starting saga ${sagaName} (${instance.id})`);

        try {
            await instance.execute();
            return instance;
        } finally {
            // Clean up completed instances after some time
            setTimeout(() => {
                this.instances.delete(instance.id);
            }, 60000);
        }
    }

    getSaga(sagaId) {
        return this.instances.get(sagaId);
    }

    getRunningInstances() {
        return Array.from(this.instances.values()).filter(i => i.status === 'running');
    }

    getHistory() {
        return [...this.history];
    }

    getStats() {
        return {
            definitions: this.definitions.size,
            runningInstances: this.instances.size,
            historySize: this.history.length
        };
    }
}

// Example: E-commerce Order Processing Saga
class OrderService {
    constructor() {
        this.orders = new Map();
    }

    async createOrder(orderData) {
        const orderId = crypto.randomUUID();
        const order = {
            id: orderId,
            ...orderData,
            status: 'created',
            createdAt: new Date().toISOString()
        };

        this.orders.set(orderId, order);
        console.log(`[OrderService] Created order ${orderId}`);
        return order;
    }

    async cancelOrder(orderId) {
        const order = this.orders.get(orderId);
        if (order) {
            order.status = 'cancelled';
            console.log(`[OrderService] Cancelled order ${orderId}`);
        }
    }

    getOrder(orderId) {
        return this.orders.get(orderId);
    }
}

class PaymentService {
    constructor() {
        this.payments = new Map();
        this.balance = 10000;
    }

    async processPayment(orderId, amount) {
        if (this.balance < amount) {
            throw new Error('Insufficient funds');
        }

        const paymentId = crypto.randomUUID();
        const payment = {
            id: paymentId,
            orderId,
            amount,
            status: 'completed',
            processedAt: new Date().toISOString()
        };

        this.balance -= amount;
        this.payments.set(paymentId, payment);
        console.log(`[PaymentService] Processed payment ${paymentId} for $${amount}`);
        return payment;
    }

    async refundPayment(paymentId) {
        const payment = this.payments.get(paymentId);
        if (payment) {
            this.balance += payment.amount;
            payment.status = 'refunded';
            console.log(`[PaymentService] Refunded payment ${paymentId}`);
        }
    }

    getPayment(paymentId) {
        return this.payments.get(paymentId);
    }
}

class InventoryService {
    constructor() {
        this.inventory = new Map();
        this.reservations = new Map();
    }

    setStock(productId, quantity) {
        this.inventory.set(productId, quantity);
    }

    async reserveInventory(orderId, items) {
        const reservationId = crypto.randomUUID();
        const reservation = {
            id: reservationId,
            orderId,
            items: []
        };

        for (const item of items) {
            const available = this.inventory.get(item.productId) || 0;
            if (available < item.quantity) {
                throw new Error(`Insufficient inventory for product ${item.productId}`);
            }

            this.inventory.set(item.productId, available - item.quantity);
            reservation.items.push(item);
        }

        this.reservations.set(reservationId, reservation);
        console.log(`[InventoryService] Reserved inventory ${reservationId}`);
        return reservation;
    }

    async releaseInventory(reservationId) {
        const reservation = this.reservations.get(reservationId);
        if (reservation) {
            for (const item of reservation.items) {
                const current = this.inventory.get(item.productId) || 0;
                this.inventory.set(item.productId, current + item.quantity);
            }
            this.reservations.delete(reservationId);
            console.log(`[InventoryService] Released inventory ${reservationId}`);
        }
    }
}

class ShippingService {
    constructor() {
        this.shipments = new Map();
    }

    async scheduleShipment(orderId, address) {
        const shipmentId = crypto.randomUUID();
        const shipment = {
            id: shipmentId,
            orderId,
            address,
            status: 'scheduled',
            scheduledAt: new Date().toISOString()
        };

        this.shipments.set(shipmentId, shipment);
        console.log(`[ShippingService] Scheduled shipment ${shipmentId}`);
        return shipment;
    }

    async cancelShipment(shipmentId) {
        const shipment = this.shipments.get(shipmentId);
        if (shipment) {
            shipment.status = 'cancelled';
            console.log(`[ShippingService] Cancelled shipment ${shipmentId}`);
        }
    }
}

// Define Order Processing Saga
function createOrderProcessingSaga(orderService, paymentService, inventoryService, shippingService) {
    const saga = new SagaDefinition('order-processing');

    saga.addStep(
        'create-order',
        async (context) => {
            return await orderService.createOrder({
                userId: context.userId,
                items: context.items,
                total: context.total
            });
        },
        async (context, result) => {
            await orderService.cancelOrder(result.id);
        }
    );

    saga.addStep(
        'reserve-inventory',
        async (context) => {
            return await inventoryService.reserveInventory(
                context.results['create-order'].id,
                context.items
            );
        },
        async (context, result) => {
            await inventoryService.releaseInventory(result.id);
        }
    );

    saga.addStep(
        'process-payment',
        async (context) => {
            return await paymentService.processPayment(
                context.results['create-order'].id,
                context.total
            );
        },
        async (context, result) => {
            await paymentService.refundPayment(result.id);
        }
    );

    saga.addStep(
        'schedule-shipment',
        async (context) => {
            return await shippingService.scheduleShipment(
                context.results['create-order'].id,
                context.shippingAddress
            );
        },
        async (context, result) => {
            await shippingService.cancelShipment(result.id);
        }
    );

    return saga;
}

// Demonstration
async function demonstrateSaga() {
    console.log('=== Saga Pattern Demo ===\n');

    const coordinator = new SagaCoordinator();

    // Create services
    const orderService = new OrderService();
    const paymentService = new PaymentService();
    const inventoryService = new InventoryService();
    const shippingService = new ShippingService();

    // Set up inventory
    inventoryService.setStock('product-1', 10);
    inventoryService.setStock('product-2', 5);

    // Register saga
    const orderSaga = createOrderProcessingSaga(
        orderService,
        paymentService,
        inventoryService,
        shippingService
    );
    coordinator.registerSaga(orderSaga);

    // Monitor saga events
    coordinator.on('saga-started', (saga) => {
        console.log(`\n>>> Saga ${saga.id} started\n`);
    });

    coordinator.on('saga-completed', (saga) => {
        console.log(`\n>>> Saga ${saga.id} completed successfully\n`);
    });

    coordinator.on('saga-failed', (saga) => {
        console.log(`\n>>> Saga ${saga.id} failed and compensated\n`);
    });

    // Scenario 1: Successful Order
    console.log('--- Scenario 1: Successful Order ---\n');

    try {
        const saga1 = await coordinator.startSaga('order-processing', {
            userId: 'user-123',
            items: [
                { productId: 'product-1', quantity: 2, price: 50 },
                { productId: 'product-2', quantity: 1, price: 30 }
            ],
            total: 130,
            shippingAddress: '123 Main St'
        });

        console.log('Final State:');
        console.log(JSON.stringify(saga1.getState(), null, 2));
    } catch (error) {
        console.error('Saga failed:', error.message);
    }

    // Scenario 2: Failed Order (Insufficient Inventory)
    console.log('\n--- Scenario 2: Failed Order (Insufficient Inventory) ---\n');

    try {
        const saga2 = await coordinator.startSaga('order-processing', {
            userId: 'user-456',
            items: [
                { productId: 'product-1', quantity: 20, price: 50 }
            ],
            total: 1000,
            shippingAddress: '456 Oak Ave'
        });
    } catch (error) {
        console.error('Expected failure:', error.message);
    }

    // Scenario 3: Failed Order (Insufficient Funds)
    console.log('\n--- Scenario 3: Failed Order (Insufficient Funds) ---\n');

    try {
        const saga3 = await coordinator.startSaga('order-processing', {
            userId: 'user-789',
            items: [
                { productId: 'product-1', quantity: 5, price: 3000 }
            ],
            total: 15000,
            shippingAddress: '789 Pine Rd'
        });
    } catch (error) {
        console.error('Expected failure:', error.message);
    }

    console.log('\n--- Coordinator Statistics ---\n');
    console.log(JSON.stringify(coordinator.getStats(), null, 2));

    console.log('\n--- Saga History ---\n');
    const history = coordinator.getHistory();
    history.forEach(saga => {
        console.log(`Saga ${saga.id}: ${saga.status} (${saga.steps.length} steps)`);
    });
}

// Run demonstration
if (require.main === module) {
    demonstrateSaga().catch(console.error);
}

module.exports = {
    SagaStep,
    SagaDefinition,
    SagaInstance,
    SagaCoordinator
};
