/**
 * Saga Microservices Pattern (Choreography-Based)
 *
 * Purpose: This is an alternative saga implementation using choreography
 * instead of orchestration. Services react to events and publish their own
 * events, creating a chain of reactions without a central coordinator.
 *
 * Key Differences from Saga.js:
 * - No central coordinator
 * - Event-driven choreography
 * - Services listen for events and react independently
 * - Distributed decision making
 * - More resilient but harder to track
 *
 * Key Components:
 * - Event Bus: Decentralized event communication
 * - Service Event Handlers: React to domain events
 * - Compensation Events: Trigger rollback operations
 * - Saga State Machine: Each service tracks its saga state
 * - Distributed Tracing: Track saga across services
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Saga Event - Represents an event in a saga flow
 */
class SagaEvent {
    constructor(type, sagaId, payload, source) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.sagaId = sagaId;
        this.payload = payload;
        this.source = source;
        this.timestamp = new Date().toISOString();
        this.correlationId = payload.correlationId || crypto.randomUUID();
    }
}

/**
 * Distributed Event Bus - Handles event publication and subscription
 */
class DistributedEventBus extends EventEmitter {
    constructor() {
        super();
        this.eventLog = [];
        this.subscriptions = new Map();
    }

    async publish(event) {
        console.log(`[EventBus] Publishing: ${event.type} from ${event.source}`);
        this.eventLog.push(event);
        this.emit('event', event);
        this.emit(event.type, event);
    }

    subscribe(eventType, handler, serviceName) {
        if (!this.subscriptions.has(eventType)) {
            this.subscriptions.set(eventType, []);
        }

        const subscription = {
            serviceName,
            handler
        };

        this.subscriptions.get(eventType).push(subscription);

        this.on(eventType, async (event) => {
            if (event.source !== serviceName) {
                try {
                    await handler(event);
                } catch (error) {
                    console.error(`[EventBus] Handler error in ${serviceName}:`, error.message);
                }
            }
        });
    }

    getEventsBySaga(sagaId) {
        return this.eventLog.filter(e => e.sagaId === sagaId);
    }

    getEventLog() {
        return [...this.eventLog];
    }
}

/**
 * Saga State Tracker - Tracks saga state within a service
 */
class SagaStateTracker {
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.states = new Map();
    }

    initializeSaga(sagaId, initialState = {}) {
        this.states.set(sagaId, {
            sagaId,
            state: 'started',
            data: initialState,
            steps: [],
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    updateSagaState(sagaId, state, data = {}) {
        const sagaState = this.states.get(sagaId);
        if (!sagaState) {
            throw new Error(`Saga ${sagaId} not found`);
        }

        sagaState.state = state;
        sagaState.data = { ...sagaState.data, ...data };
        sagaState.updatedAt = new Date().toISOString();
    }

    addSagaStep(sagaId, step) {
        const sagaState = this.states.get(sagaId);
        if (sagaState) {
            sagaState.steps.push({
                ...step,
                timestamp: new Date().toISOString()
            });
        }
    }

    getSagaState(sagaId) {
        return this.states.get(sagaId);
    }

    isSagaActive(sagaId) {
        const state = this.states.get(sagaId);
        return state && ['started', 'in-progress'].includes(state.state);
    }

    completeSaga(sagaId, success = true) {
        const sagaState = this.states.get(sagaId);
        if (sagaState) {
            sagaState.state = success ? 'completed' : 'failed';
            sagaState.completedAt = new Date().toISOString();
        }
    }
}

/**
 * Base Saga Participant Service
 */
class SagaParticipantService extends EventEmitter {
    constructor(serviceName, eventBus) {
        super();
        this.serviceName = serviceName;
        this.eventBus = eventBus;
        this.stateTracker = new SagaStateTracker(serviceName);
        this.eventHandlers = new Map();
    }

    async publishEvent(type, sagaId, payload) {
        const event = new SagaEvent(type, sagaId, payload, this.serviceName);
        await this.eventBus.publish(event);
        return event;
    }

    registerEventHandler(eventType, handler) {
        this.eventHandlers.set(eventType, handler);
        this.eventBus.subscribe(eventType, handler, this.serviceName);
    }

    async handleCompensation(sagaId, compensationData) {
        console.log(`[${this.serviceName}] Handling compensation for saga ${sagaId}`);
        this.stateTracker.updateSagaState(sagaId, 'compensating');
    }
}

/**
 * Order Service (Initiates Saga)
 */
class ChoreographyOrderService extends SagaParticipantService {
    constructor(eventBus) {
        super('order-service', eventBus);
        this.orders = new Map();
        this.initializeHandlers();
    }

    initializeHandlers() {
        // Handle inventory reserved
        this.registerEventHandler('InventoryReserved', async (event) => {
            const { sagaId, orderId } = event.payload;
            console.log(`[OrderService] Inventory reserved for order ${orderId}`);

            this.stateTracker.addSagaStep(sagaId, {
                name: 'inventory-reserved',
                status: 'completed'
            });

            // Continue saga - request payment
            await this.publishEvent('PaymentRequested', sagaId, {
                orderId,
                amount: this.orders.get(orderId).total
            });
        });

        // Handle inventory reservation failed
        this.registerEventHandler('InventoryReservationFailed', async (event) => {
            const { sagaId, orderId } = event.payload;
            console.log(`[OrderService] Inventory reservation failed for order ${orderId}`);

            await this.cancelOrder(orderId, sagaId);
        });

        // Handle payment completed
        this.registerEventHandler('PaymentCompleted', async (event) => {
            const { sagaId, orderId } = event.payload;
            console.log(`[OrderService] Payment completed for order ${orderId}`);

            this.stateTracker.addSagaStep(sagaId, {
                name: 'payment-completed',
                status: 'completed'
            });

            // Continue saga - request shipment
            const order = this.orders.get(orderId);
            await this.publishEvent('ShipmentRequested', sagaId, {
                orderId,
                shippingAddress: order.shippingAddress
            });
        });

        // Handle payment failed
        this.registerEventHandler('PaymentFailed', async (event) => {
            const { sagaId, orderId, reservationId } = event.payload;
            console.log(`[OrderService] Payment failed for order ${orderId}, initiating compensation`);

            // Trigger compensation
            await this.publishEvent('CompensateInventoryReservation', sagaId, {
                orderId,
                reservationId
            });

            await this.cancelOrder(orderId, sagaId);
        });

        // Handle shipment scheduled
        this.registerEventHandler('ShipmentScheduled', async (event) => {
            const { sagaId, orderId } = event.payload;
            console.log(`[OrderService] Shipment scheduled for order ${orderId}`);

            this.stateTracker.addSagaStep(sagaId, {
                name: 'shipment-scheduled',
                status: 'completed'
            });

            // Saga completed successfully
            const order = this.orders.get(orderId);
            order.status = 'confirmed';
            this.stateTracker.completeSaga(sagaId, true);

            await this.publishEvent('OrderCompleted', sagaId, { orderId });
        });
    }

    async createOrder(orderData) {
        const orderId = crypto.randomUUID();
        const sagaId = crypto.randomUUID();

        const order = {
            id: orderId,
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.orders.set(orderId, order);
        this.stateTracker.initializeSaga(sagaId, { orderId });

        console.log(`[OrderService] Created order ${orderId}, starting saga ${sagaId}`);

        // Start saga by requesting inventory reservation
        await this.publishEvent('InventoryReservationRequested', sagaId, {
            orderId,
            items: orderData.items
        });

        return { order, sagaId };
    }

    async cancelOrder(orderId, sagaId) {
        const order = this.orders.get(orderId);
        if (order) {
            order.status = 'cancelled';
            this.stateTracker.completeSaga(sagaId, false);
            console.log(`[OrderService] Cancelled order ${orderId}`);
        }
    }
}

/**
 * Inventory Service
 */
class ChoreographyInventoryService extends SagaParticipantService {
    constructor(eventBus) {
        super('inventory-service', eventBus);
        this.inventory = new Map();
        this.reservations = new Map();
        this.initializeHandlers();
    }

    initializeHandlers() {
        // Handle reservation request
        this.registerEventHandler('InventoryReservationRequested', async (event) => {
            const { sagaId, orderId, items } = event.payload;
            console.log(`[InventoryService] Processing reservation request for order ${orderId}`);

            try {
                const reservationId = await this.reserveInventory(orderId, items);

                await this.publishEvent('InventoryReserved', sagaId, {
                    orderId,
                    reservationId,
                    items
                });
            } catch (error) {
                console.error(`[InventoryService] Reservation failed:`, error.message);

                await this.publishEvent('InventoryReservationFailed', sagaId, {
                    orderId,
                    reason: error.message
                });
            }
        });

        // Handle compensation
        this.registerEventHandler('CompensateInventoryReservation', async (event) => {
            const { sagaId, reservationId } = event.payload;
            console.log(`[InventoryService] Compensating reservation ${reservationId}`);

            await this.releaseReservation(reservationId);

            await this.publishEvent('InventoryReservationCompensated', sagaId, {
                reservationId
            });
        });
    }

    setStock(productId, quantity) {
        this.inventory.set(productId, quantity);
    }

    async reserveInventory(orderId, items) {
        const reservationId = crypto.randomUUID();

        // Check availability
        for (const item of items) {
            const available = this.inventory.get(item.productId) || 0;
            if (available < item.quantity) {
                throw new Error(`Insufficient inventory for ${item.productId}`);
            }
        }

        // Reserve items
        for (const item of items) {
            const available = this.inventory.get(item.productId);
            this.inventory.set(item.productId, available - item.quantity);
        }

        this.reservations.set(reservationId, { orderId, items });
        console.log(`[InventoryService] Reserved inventory: ${reservationId}`);

        return reservationId;
    }

    async releaseReservation(reservationId) {
        const reservation = this.reservations.get(reservationId);
        if (reservation) {
            for (const item of reservation.items) {
                const current = this.inventory.get(item.productId);
                this.inventory.set(item.productId, current + item.quantity);
            }
            this.reservations.delete(reservationId);
            console.log(`[InventoryService] Released reservation: ${reservationId}`);
        }
    }
}

/**
 * Payment Service
 */
class ChoreographyPaymentService extends SagaParticipantService {
    constructor(eventBus) {
        super('payment-service', eventBus);
        this.payments = new Map();
        this.balance = 5000;
        this.initializeHandlers();
    }

    initializeHandlers() {
        // Handle payment request
        this.registerEventHandler('PaymentRequested', async (event) => {
            const { sagaId, orderId, amount } = event.payload;
            console.log(`[PaymentService] Processing payment for order ${orderId}: $${amount}`);

            try {
                const paymentId = await this.processPayment(orderId, amount);

                await this.publishEvent('PaymentCompleted', sagaId, {
                    orderId,
                    paymentId,
                    amount
                });
            } catch (error) {
                console.error(`[PaymentService] Payment failed:`, error.message);

                const orderService = event.payload;
                await this.publishEvent('PaymentFailed', sagaId, {
                    orderId,
                    reason: error.message,
                    reservationId: orderService.reservationId
                });
            }
        });

        // Handle refund compensation
        this.registerEventHandler('CompensatePayment', async (event) => {
            const { sagaId, paymentId } = event.payload;
            console.log(`[PaymentService] Compensating payment ${paymentId}`);

            await this.refundPayment(paymentId);

            await this.publishEvent('PaymentCompensated', sagaId, {
                paymentId
            });
        });
    }

    async processPayment(orderId, amount) {
        if (this.balance < amount) {
            throw new Error('Insufficient funds');
        }

        const paymentId = crypto.randomUUID();
        this.balance -= amount;

        this.payments.set(paymentId, {
            id: paymentId,
            orderId,
            amount,
            status: 'completed'
        });

        console.log(`[PaymentService] Payment completed: ${paymentId}`);
        return paymentId;
    }

    async refundPayment(paymentId) {
        const payment = this.payments.get(paymentId);
        if (payment) {
            this.balance += payment.amount;
            payment.status = 'refunded';
            console.log(`[PaymentService] Refunded payment: ${paymentId}`);
        }
    }
}

/**
 * Shipping Service
 */
class ChoreographyShippingService extends SagaParticipantService {
    constructor(eventBus) {
        super('shipping-service', eventBus);
        this.shipments = new Map();
        this.initializeHandlers();
    }

    initializeHandlers() {
        // Handle shipment request
        this.registerEventHandler('ShipmentRequested', async (event) => {
            const { sagaId, orderId, shippingAddress } = event.payload;
            console.log(`[ShippingService] Scheduling shipment for order ${orderId}`);

            try {
                const shipmentId = await this.scheduleShipment(orderId, shippingAddress);

                await this.publishEvent('ShipmentScheduled', sagaId, {
                    orderId,
                    shipmentId,
                    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                });
            } catch (error) {
                console.error(`[ShippingService] Shipment failed:`, error.message);

                await this.publishEvent('ShipmentFailed', sagaId, {
                    orderId,
                    reason: error.message
                });
            }
        });
    }

    async scheduleShipment(orderId, address) {
        const shipmentId = crypto.randomUUID();

        this.shipments.set(shipmentId, {
            id: shipmentId,
            orderId,
            address,
            status: 'scheduled'
        });

        console.log(`[ShippingService] Shipment scheduled: ${shipmentId}`);
        return shipmentId;
    }
}

/**
 * Saga Monitor - Tracks saga execution across services
 */
class SagaMonitor extends EventEmitter {
    constructor(eventBus) {
        super();
        this.eventBus = eventBus;
        this.sagas = new Map();
        this.setupMonitoring();
    }

    setupMonitoring() {
        this.eventBus.on('event', (event) => {
            if (!this.sagas.has(event.sagaId)) {
                this.sagas.set(event.sagaId, {
                    sagaId: event.sagaId,
                    events: [],
                    startedAt: event.timestamp,
                    status: 'in-progress'
                });
            }

            const saga = this.sagas.get(event.sagaId);
            saga.events.push({
                type: event.type,
                source: event.source,
                timestamp: event.timestamp
            });

            // Check for completion
            if (event.type === 'OrderCompleted') {
                saga.status = 'completed';
                saga.completedAt = event.timestamp;
            } else if (event.type.includes('Failed') || event.type.includes('Compensate')) {
                saga.status = 'compensating';
            }
        });
    }

    getSagaTrace(sagaId) {
        return this.sagas.get(sagaId);
    }

    getAllSagas() {
        return Array.from(this.sagas.values());
    }

    getActiveSagas() {
        return Array.from(this.sagas.values()).filter(s => s.status === 'in-progress');
    }
}

// Demonstration
async function demonstrateSagaMicroservices() {
    console.log('=== Saga Microservices Pattern (Choreography) Demo ===\n');

    const eventBus = new DistributedEventBus();
    const monitor = new SagaMonitor(eventBus);

    // Create services
    const orderService = new ChoreographyOrderService(eventBus);
    const inventoryService = new ChoreographyInventoryService(eventBus);
    const paymentService = new ChoreographyPaymentService(eventBus);
    const shippingService = new ChoreographyShippingService(eventBus);

    // Set up inventory
    inventoryService.setStock('product-1', 10);
    inventoryService.setStock('product-2', 5);

    console.log('--- Scenario 1: Successful Order ---\n');

    const { order: order1, sagaId: sagaId1 } = await orderService.createOrder({
        userId: 'user-123',
        items: [
            { productId: 'product-1', quantity: 2, price: 50 },
            { productId: 'product-2', quantity: 1, price: 30 }
        ],
        total: 130,
        shippingAddress: '123 Main St'
    });

    // Wait for saga to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\nSaga Trace:');
    const trace1 = monitor.getSagaTrace(sagaId1);
    console.log(JSON.stringify(trace1, null, 2));

    console.log('\n--- Scenario 2: Failed Order (Insufficient Inventory) ---\n');

    const { order: order2, sagaId: sagaId2 } = await orderService.createOrder({
        userId: 'user-456',
        items: [
            { productId: 'product-1', quantity: 20, price: 50 }
        ],
        total: 1000,
        shippingAddress: '456 Oak Ave'
    });

    // Wait for saga to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\nSaga Trace:');
    const trace2 = monitor.getSagaTrace(sagaId2);
    console.log(JSON.stringify(trace2, null, 2));

    console.log('\n--- Scenario 3: Failed Order (Insufficient Funds) ---\n');

    const { order: order3, sagaId: sagaId3 } = await orderService.createOrder({
        userId: 'user-789',
        items: [
            { productId: 'product-1', quantity: 2, price: 3000 }
        ],
        total: 6000,
        shippingAddress: '789 Pine Rd'
    });

    // Wait for saga to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\nSaga Trace:');
    const trace3 = monitor.getSagaTrace(sagaId3);
    console.log(JSON.stringify(trace3, null, 2));

    console.log('\n--- All Sagas Summary ---\n');
    const allSagas = monitor.getAllSagas();
    allSagas.forEach(saga => {
        console.log(`Saga ${saga.sagaId}: ${saga.status} (${saga.events.length} events)`);
    });

    console.log('\n--- Event Log ---\n');
    const eventLog = eventBus.getEventLog();
    console.log(`Total events: ${eventLog.length}`);
}

// Run demonstration
if (require.main === module) {
    demonstrateSagaMicroservices().catch(console.error);
}

module.exports = {
    SagaEvent,
    DistributedEventBus,
    SagaStateTracker,
    SagaParticipantService,
    ChoreographyOrderService,
    ChoreographyInventoryService,
    ChoreographyPaymentService,
    ChoreographyShippingService,
    SagaMonitor
};
