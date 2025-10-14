/**
 * Asynchronous Messaging Pattern
 *
 * Purpose: Enable reliable, decoupled communication between microservices
 * using message queues. Services communicate by sending messages to queues
 * rather than making direct synchronous calls.
 *
 * Key Components:
 * - Message: Data structure sent between services
 * - Message Queue: Buffer that stores messages
 * - Producer: Service that sends messages
 * - Consumer: Service that receives and processes messages
 * - Message Broker: Infrastructure managing queues and routing
 *
 * Benefits:
 * - Temporal decoupling (services don't need to be available simultaneously)
 * - Load leveling (queues absorb traffic spikes)
 * - Reliability (messages persist until processed)
 * - Scalability (add more consumers to handle load)
 * - Fault tolerance (retry and dead letter queues)
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Message - Unit of communication between services
 */
class Message {
    constructor(type, payload, options = {}) {
        this.id = crypto.randomUUID();
        this.type = type;
        this.payload = payload;
        this.timestamp = new Date().toISOString();
        this.correlationId = options.correlationId || null;
        this.replyTo = options.replyTo || null;
        this.headers = options.headers || {};
        this.priority = options.priority || 0;
        this.ttl = options.ttl || null; // Time to live in milliseconds
        this.attempts = 0;
        this.maxAttempts = options.maxAttempts || 3;
        this.expiresAt = options.ttl ? new Date(Date.now() + options.ttl).toISOString() : null;
    }

    isExpired() {
        if (!this.expiresAt) {
            return false;
        }
        return new Date() > new Date(this.expiresAt);
    }

    canRetry() {
        return this.attempts < this.maxAttempts;
    }

    incrementAttempts() {
        this.attempts++;
    }
}

/**
 * Message Queue - Stores and orders messages
 */
class MessageQueue extends EventEmitter {
    constructor(name, options = {}) {
        super();
        this.name = name;
        this.messages = [];
        this.inFlight = new Map();
        this.maxSize = options.maxSize || 10000;
        this.persistent = options.persistent || false;
        this.stats = {
            enqueued: 0,
            dequeued: 0,
            failed: 0,
            expired: 0
        };
    }

    enqueue(message) {
        if (this.messages.length >= this.maxSize) {
            throw new Error(`Queue ${this.name} is full (max: ${this.maxSize})`);
        }

        if (message.isExpired()) {
            this.stats.expired++;
            this.emit('expired', message);
            return false;
        }

        this.messages.push(message);
        this.messages.sort((a, b) => b.priority - a.priority);
        this.stats.enqueued++;
        this.emit('enqueued', message);
        return true;
    }

    dequeue() {
        // Clean expired messages
        this.cleanExpired();

        if (this.messages.length === 0) {
            return null;
        }

        const message = this.messages.shift();
        this.inFlight.set(message.id, {
            message,
            dequeuedAt: new Date().toISOString()
        });

        this.stats.dequeued++;
        this.emit('dequeued', message);
        return message;
    }

    ack(messageId) {
        if (this.inFlight.has(messageId)) {
            this.inFlight.delete(messageId);
            this.emit('ack', messageId);
            return true;
        }
        return false;
    }

    nack(messageId, requeue = true) {
        const inFlightData = this.inFlight.get(messageId);
        if (!inFlightData) {
            return false;
        }

        const message = inFlightData.message;
        this.inFlight.delete(messageId);

        message.incrementAttempts();

        if (requeue && message.canRetry()) {
            this.messages.unshift(message); // Put back at front
            this.emit('nack', message, true);
            return true;
        } else {
            this.stats.failed++;
            this.emit('failed', message);
            return false;
        }
    }

    cleanExpired() {
        const before = this.messages.length;
        this.messages = this.messages.filter(msg => {
            if (msg.isExpired()) {
                this.stats.expired++;
                this.emit('expired', msg);
                return false;
            }
            return true;
        });
        return before - this.messages.length;
    }

    peek() {
        this.cleanExpired();
        return this.messages[0] || null;
    }

    size() {
        return this.messages.length;
    }

    getStats() {
        return {
            ...this.stats,
            currentSize: this.messages.length,
            inFlight: this.inFlight.size
        };
    }

    clear() {
        this.messages = [];
        this.inFlight.clear();
    }
}

/**
 * Message Broker - Manages multiple queues and routing
 */
class MessageBroker extends EventEmitter {
    constructor() {
        super();
        this.queues = new Map();
        this.exchanges = new Map();
        this.bindings = new Map();
        this.deadLetterQueue = new MessageQueue('dead-letter-queue');
    }

    createQueue(name, options = {}) {
        if (this.queues.has(name)) {
            throw new Error(`Queue ${name} already exists`);
        }

        const queue = new MessageQueue(name, options);

        // Forward queue events
        queue.on('failed', (message) => {
            this.deadLetterQueue.enqueue(message);
        });

        this.queues.set(name, queue);
        this.emit('queue-created', name);
        return queue;
    }

    getQueue(name) {
        return this.queues.get(name) || null;
    }

    deleteQueue(name) {
        const queue = this.queues.get(name);
        if (queue) {
            queue.clear();
            this.queues.delete(name);
            this.emit('queue-deleted', name);
            return true;
        }
        return false;
    }

    createExchange(name, type = 'direct') {
        if (this.exchanges.has(name)) {
            throw new Error(`Exchange ${name} already exists`);
        }

        this.exchanges.set(name, { name, type });
        this.bindings.set(name, []);
        this.emit('exchange-created', name);
    }

    bindQueue(exchangeName, queueName, routingKey = '') {
        if (!this.exchanges.has(exchangeName)) {
            throw new Error(`Exchange ${exchangeName} not found`);
        }

        if (!this.queues.has(queueName)) {
            throw new Error(`Queue ${queueName} not found`);
        }

        const bindings = this.bindings.get(exchangeName);
        bindings.push({ queueName, routingKey });
        this.emit('queue-bound', { exchangeName, queueName, routingKey });
    }

    publish(exchangeName, routingKey, message) {
        const exchange = this.exchanges.get(exchangeName);
        if (!exchange) {
            throw new Error(`Exchange ${exchangeName} not found`);
        }

        const bindings = this.bindings.get(exchangeName) || [];
        let routed = false;

        for (const binding of bindings) {
            if (this.matchesRoutingKey(exchange.type, routingKey, binding.routingKey)) {
                const queue = this.queues.get(binding.queueName);
                if (queue) {
                    queue.enqueue(message);
                    routed = true;
                }
            }
        }

        if (!routed) {
            this.emit('unrouted', message);
        }

        return routed;
    }

    matchesRoutingKey(exchangeType, messageKey, bindingKey) {
        if (exchangeType === 'fanout') {
            return true;
        }

        if (exchangeType === 'direct') {
            return messageKey === bindingKey;
        }

        if (exchangeType === 'topic') {
            const messageSegments = messageKey.split('.');
            const bindingSegments = bindingKey.split('.');

            if (bindingSegments.length !== messageSegments.length) {
                return false;
            }

            for (let i = 0; i < bindingSegments.length; i++) {
                if (bindingSegments[i] !== '*' && bindingSegments[i] !== messageSegments[i]) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    getStats() {
        const stats = {
            queues: {},
            totalMessages: 0,
            totalInFlight: 0,
            deadLetterQueue: this.deadLetterQueue.getStats()
        };

        for (const [name, queue] of this.queues.entries()) {
            const queueStats = queue.getStats();
            stats.queues[name] = queueStats;
            stats.totalMessages += queueStats.currentSize;
            stats.totalInFlight += queueStats.inFlight;
        }

        return stats;
    }
}

/**
 * Message Producer - Sends messages to queues
 */
class MessageProducer {
    constructor(broker, serviceId) {
        this.broker = broker;
        this.serviceId = serviceId;
    }

    send(queueName, type, payload, options = {}) {
        const queue = this.broker.getQueue(queueName);
        if (!queue) {
            throw new Error(`Queue ${queueName} not found`);
        }

        const message = new Message(type, payload, {
            ...options,
            headers: {
                ...options.headers,
                producerId: this.serviceId
            }
        });

        return queue.enqueue(message);
    }

    publish(exchangeName, routingKey, type, payload, options = {}) {
        const message = new Message(type, payload, {
            ...options,
            headers: {
                ...options.headers,
                producerId: this.serviceId
            }
        });

        return this.broker.publish(exchangeName, routingKey, message);
    }

    sendWithReply(queueName, type, payload, replyQueueName, options = {}) {
        return this.send(queueName, type, payload, {
            ...options,
            replyTo: replyQueueName
        });
    }
}

/**
 * Message Consumer - Receives and processes messages
 */
class MessageConsumer extends EventEmitter {
    constructor(broker, queueName, serviceId) {
        super();
        this.broker = broker;
        this.queueName = queueName;
        this.serviceId = serviceId;
        this.handlers = new Map();
        this.processing = false;
        this.pollInterval = 100;
        this.pollTimer = null;
    }

    onMessage(messageType, handler) {
        this.handlers.set(messageType, handler);
    }

    start() {
        if (this.processing) {
            return;
        }

        this.processing = true;
        this.pollTimer = setInterval(() => this.poll(), this.pollInterval);
        this.emit('started');
    }

    stop() {
        if (!this.processing) {
            return;
        }

        this.processing = false;
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        this.emit('stopped');
    }

    async poll() {
        const queue = this.broker.getQueue(this.queueName);
        if (!queue) {
            return;
        }

        const message = queue.dequeue();
        if (!message) {
            return;
        }

        try {
            await this.processMessage(message);
            queue.ack(message.id);
            this.emit('processed', message);
        } catch (error) {
            console.error(`Error processing message ${message.id}:`, error);
            queue.nack(message.id, true);
            this.emit('error', { message, error });
        }
    }

    async processMessage(message) {
        const handler = this.handlers.get(message.type);
        if (!handler) {
            throw new Error(`No handler for message type: ${message.type}`);
        }

        await handler(message);

        // Handle reply-to
        if (message.replyTo) {
            this.emit('reply-requested', message);
        }
    }
}

/**
 * Request-Reply Pattern Implementation
 */
class RequestReplyClient {
    constructor(producer, consumer, replyQueueName) {
        this.producer = producer;
        this.consumer = consumer;
        this.replyQueueName = replyQueueName;
        this.pendingRequests = new Map();

        this.consumer.onMessage('reply', async (message) => {
            const correlationId = message.correlationId;
            const pending = this.pendingRequests.get(correlationId);

            if (pending) {
                clearTimeout(pending.timeout);
                pending.resolve(message.payload);
                this.pendingRequests.delete(correlationId);
            }
        });

        this.consumer.start();
    }

    async request(queueName, type, payload, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const correlationId = crypto.randomUUID();

            const timeoutHandle = setTimeout(() => {
                this.pendingRequests.delete(correlationId);
                reject(new Error('Request timeout'));
            }, timeout);

            this.pendingRequests.set(correlationId, {
                resolve,
                reject,
                timeout: timeoutHandle
            });

            this.producer.sendWithReply(queueName, type, payload, this.replyQueueName, {
                correlationId
            });
        });
    }
}

// Demonstration: E-commerce Order Processing
async function demonstrateAsyncMessaging() {
    console.log('=== Asynchronous Messaging Pattern Demo ===\n');

    const broker = new MessageBroker();

    // Create queues
    const orderQueue = broker.createQueue('orders');
    const paymentQueue = broker.createQueue('payments');
    const shippingQueue = broker.createQueue('shipping');
    const notificationQueue = broker.createQueue('notifications');

    console.log('Queues created: orders, payments, shipping, notifications\n');

    // Create exchange for order events
    broker.createExchange('order-events', 'topic');
    broker.bindQueue('order-events', 'paymentQueue', 'order.created');
    broker.bindQueue('order-events', 'shippingQueue', 'order.confirmed');
    broker.bindQueue('order-events', 'notificationQueue', 'order.*');

    // Create producers
    const orderProducer = new MessageProducer(broker, 'order-service');

    // Create consumers
    const paymentConsumer = new MessageConsumer(broker, 'payments', 'payment-service');
    const shippingConsumer = new MessageConsumer(broker, 'shipping', 'shipping-service');
    const notificationConsumer = new MessageConsumer(broker, 'notifications', 'notification-service');

    // Payment handler
    paymentConsumer.onMessage('process-payment', async (message) => {
        console.log(`[PaymentService] Processing payment for order ${message.payload.orderId}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`[PaymentService] Payment completed: $${message.payload.amount}`);

        // Publish order confirmed event
        orderProducer.publish('order-events', 'order.confirmed', 'order-confirmed', {
            orderId: message.payload.orderId
        });
    });

    // Shipping handler
    shippingConsumer.onMessage('create-shipment', async (message) => {
        console.log(`[ShippingService] Creating shipment for order ${message.payload.orderId}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`[ShippingService] Shipment created with ID: ship-${message.payload.orderId}`);
    });

    // Notification handler
    notificationConsumer.onMessage('send-notification', async (message) => {
        console.log(`[NotificationService] Sending ${message.payload.type} notification to ${message.payload.userId}`);
    });

    // Start consumers
    paymentConsumer.start();
    shippingConsumer.start();
    notificationConsumer.start();

    console.log('Consumers started\n');

    // Simulate order flow
    console.log('Creating new order...\n');

    const orderId = crypto.randomUUID();

    // Send order created notification
    orderProducer.send('notifications', 'send-notification', {
        type: 'order-created',
        userId: 'user-123',
        orderId
    });

    // Send payment processing message
    orderProducer.send('payments', 'process-payment', {
        orderId,
        amount: 99.99,
        userId: 'user-123'
    }, { priority: 10 });

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send shipping message
    orderProducer.send('shipping', 'create-shipment', {
        orderId,
        address: '123 Main St'
    });

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Stop consumers
    paymentConsumer.stop();
    shippingConsumer.stop();
    notificationConsumer.stop();

    console.log('\nBroker Statistics:');
    console.log(JSON.stringify(broker.getStats(), null, 2));
}

// Run demonstration
if (require.main === module) {
    demonstrateAsyncMessaging().catch(console.error);
}

module.exports = {
    Message,
    MessageQueue,
    MessageBroker,
    MessageProducer,
    MessageConsumer,
    RequestReplyClient
};
