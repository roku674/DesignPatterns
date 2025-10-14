/**
 * Transaction Outbox Pattern
 *
 * Ensures reliable message delivery in distributed systems by storing outgoing messages
 * in a database table (outbox) as part of the same transaction that updates business data.
 * A separate process polls the outbox and publishes messages to the message broker.
 *
 * Key Components:
 * - Outbox Table: Stores messages to be published
 * - Transactional Write: Business data + outbox entry in same transaction
 * - Message Relay: Background process that publishes messages
 * - Message Broker: External messaging system (Kafka, RabbitMQ, etc.)
 * - Idempotency: Ensures messages are processed exactly once
 */

const EventEmitter = require('events');

/**
 * Outbox Message
 */
class OutboxMessage {
  constructor(aggregateId, eventType, payload, metadata = {}) {
    this.id = this.generateId();
    this.aggregateId = aggregateId;
    this.aggregateType = metadata.aggregateType || 'Unknown';
    this.eventType = eventType;
    this.payload = payload;
    this.createdAt = new Date().toISOString();
    this.processedAt = null;
    this.status = 'pending'; // pending, processing, published, failed
    this.retryCount = 0;
    this.maxRetries = metadata.maxRetries || 3;
    this.nextRetryAt = null;
    this.error = null;
    this.metadata = {
      correlationId: metadata.correlationId || this.id,
      causationId: metadata.causationId || this.id,
      userId: metadata.userId || 'system',
      ...metadata
    };
  }

  generateId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  markAsProcessing() {
    this.status = 'processing';
    this.processedAt = new Date().toISOString();
  }

  markAsPublished() {
    this.status = 'published';
    this.processedAt = new Date().toISOString();
  }

  markAsFailed(error) {
    this.status = 'failed';
    this.error = error;
    this.retryCount++;

    if (this.retryCount < this.maxRetries) {
      this.status = 'pending';
      // Exponential backoff
      const backoffMs = Math.pow(2, this.retryCount) * 1000;
      this.nextRetryAt = new Date(Date.now() + backoffMs).toISOString();
    }
  }

  canRetry() {
    if (this.status !== 'pending') {
      return false;
    }
    if (this.nextRetryAt && new Date(this.nextRetryAt) > new Date()) {
      return false;
    }
    return this.retryCount < this.maxRetries;
  }

  toJSON() {
    return {
      id: this.id,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      eventType: this.eventType,
      payload: this.payload,
      createdAt: this.createdAt,
      processedAt: this.processedAt,
      status: this.status,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      nextRetryAt: this.nextRetryAt,
      error: this.error,
      metadata: this.metadata
    };
  }
}

/**
 * Simulated Database with transaction support
 */
class TransactionalDatabase {
  constructor() {
    this.data = new Map(); // table -> records
    this.outbox = []; // Outbox table
    this.activeTransactions = new Map();
  }

  /**
   * Begin transaction
   */
  beginTransaction() {
    const txId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.activeTransactions.set(txId, {
      id: txId,
      dataChanges: new Map(),
      outboxMessages: [],
      startedAt: new Date().toISOString()
    });
    return txId;
  }

  /**
   * Write data within transaction
   */
  write(txId, table, key, value) {
    const tx = this.activeTransactions.get(txId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    if (!tx.dataChanges.has(table)) {
      tx.dataChanges.set(table, new Map());
    }

    tx.dataChanges.get(table).set(key, value);
  }

  /**
   * Add message to outbox within transaction
   */
  addToOutbox(txId, message) {
    const tx = this.activeTransactions.get(txId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    tx.outboxMessages.push(message);
  }

  /**
   * Commit transaction (atomic operation)
   */
  commit(txId) {
    const tx = this.activeTransactions.get(txId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    try {
      // Commit data changes
      for (const [table, records] of tx.dataChanges) {
        if (!this.data.has(table)) {
          this.data.set(table, new Map());
        }
        const tableData = this.data.get(table);

        for (const [key, value] of records) {
          tableData.set(key, value);
        }
      }

      // Commit outbox messages
      for (const message of tx.outboxMessages) {
        this.outbox.push(message);
      }

      this.activeTransactions.delete(txId);
      return true;
    } catch (error) {
      this.rollback(txId);
      throw error;
    }
  }

  /**
   * Rollback transaction
   */
  rollback(txId) {
    this.activeTransactions.delete(txId);
  }

  /**
   * Read data
   */
  read(table, key) {
    const tableData = this.data.get(table);
    return tableData ? tableData.get(key) : null;
  }

  /**
   * Get pending outbox messages
   */
  getPendingOutboxMessages(limit = 10) {
    const now = new Date();
    return this.outbox
      .filter(msg => {
        if (msg.status !== 'pending') return false;
        if (msg.nextRetryAt && new Date(msg.nextRetryAt) > now) return false;
        return true;
      })
      .slice(0, limit);
  }

  /**
   * Update outbox message
   */
  updateOutboxMessage(messageId, updates) {
    const message = this.outbox.find(msg => msg.id === messageId);
    if (message) {
      Object.assign(message, updates);
    }
  }

  /**
   * Get outbox statistics
   */
  getOutboxStats() {
    const stats = {
      total: this.outbox.length,
      pending: 0,
      processing: 0,
      published: 0,
      failed: 0
    };

    for (const msg of this.outbox) {
      stats[msg.status] = (stats[msg.status] || 0) + 1;
    }

    return stats;
  }

  /**
   * Clean published messages
   */
  cleanPublishedMessages(olderThanMs = 3600000) {
    const cutoff = Date.now() - olderThanMs;
    const before = this.outbox.length;

    this.outbox = this.outbox.filter(msg => {
      if (msg.status !== 'published') return true;
      return new Date(msg.processedAt).getTime() > cutoff;
    });

    return before - this.outbox.length;
  }
}

/**
 * Message Broker (simulated)
 */
class MessageBroker extends EventEmitter {
  constructor() {
    super();
    this.publishedMessages = [];
    this.topics = new Map();
    this.failureRate = 0; // Simulate failures (0-1)
  }

  /**
   * Publish message to broker
   */
  async publish(topic, message) {
    // Simulate random failures
    if (Math.random() < this.failureRate) {
      throw new Error('Message broker temporarily unavailable');
    }

    // Simulate network delay
    await this.delay(10);

    this.publishedMessages.push({ topic, message, timestamp: new Date().toISOString() });

    if (!this.topics.has(topic)) {
      this.topics.set(topic, []);
    }
    this.topics.get(topic).push(message);

    this.emit(topic, message);
    this.emit('message-published', { topic, message });
  }

  /**
   * Subscribe to topic
   */
  subscribe(topic, handler) {
    this.on(topic, handler);
    return () => this.off(topic, handler);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getPublishedCount() {
    return this.publishedMessages.length;
  }

  setFailureRate(rate) {
    this.failureRate = Math.max(0, Math.min(1, rate));
  }
}

/**
 * Message Relay - Polls outbox and publishes messages
 */
class MessageRelay {
  constructor(database, messageBroker, options = {}) {
    this.database = database;
    this.messageBroker = messageBroker;
    this.pollingInterval = options.pollingInterval || 1000;
    this.batchSize = options.batchSize || 10;
    this.isRunning = false;
    this.pollTimer = null;
    this.stats = {
      messagesProcessed: 0,
      messagesPublished: 0,
      messagesFailed: 0,
      lastPollAt: null
    };
  }

  /**
   * Start polling outbox
   */
  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.poll();
    console.log(`Message relay started (polling every ${this.pollingInterval}ms)`);
  }

  /**
   * Stop polling
   */
  stop() {
    this.isRunning = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    console.log('Message relay stopped');
  }

  /**
   * Poll outbox and publish messages
   */
  async poll() {
    if (!this.isRunning) {
      return;
    }

    try {
      await this.processOutboxMessages();
    } catch (error) {
      console.error('Error polling outbox:', error);
    }

    this.stats.lastPollAt = new Date().toISOString();

    // Schedule next poll
    this.pollTimer = setTimeout(() => this.poll(), this.pollingInterval);
  }

  /**
   * Process pending outbox messages
   */
  async processOutboxMessages() {
    const messages = this.database.getPendingOutboxMessages(this.batchSize);

    for (const message of messages) {
      await this.processMessage(message);
    }
  }

  /**
   * Process single message
   */
  async processMessage(message) {
    this.stats.messagesProcessed++;

    try {
      // Mark as processing
      message.markAsProcessing();
      this.database.updateOutboxMessage(message.id, message);

      // Publish to message broker
      await this.messageBroker.publish(message.eventType, message.payload);

      // Mark as published
      message.markAsPublished();
      this.database.updateOutboxMessage(message.id, message);

      this.stats.messagesPublished++;
      console.log(`Published message ${message.id} [${message.eventType}]`);
    } catch (error) {
      // Mark as failed
      message.markAsFailed(error.message);
      this.database.updateOutboxMessage(message.id, message);

      this.stats.messagesFailed++;
      console.error(`Failed to publish message ${message.id}:`, error.message);

      if (message.retryCount >= message.maxRetries) {
        console.error(`Message ${message.id} exceeded max retries and moved to DLQ`);
      }
    }
  }

  /**
   * Get relay statistics
   */
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      outboxStats: this.database.getOutboxStats()
    };
  }
}

/**
 * Service using Transaction Outbox Pattern
 */
class OrderService {
  constructor() {
    this.database = new TransactionalDatabase();
    this.messageBroker = new MessageBroker();
    this.messageRelay = new MessageRelay(this.database, this.messageBroker, {
      pollingInterval: 500,
      batchSize: 5
    });
  }

  /**
   * Create order with outbox pattern
   */
  async createOrder(orderId, customerId, items, total) {
    const txId = this.database.beginTransaction();

    try {
      // Write business data
      const order = {
        id: orderId,
        customerId,
        items,
        total,
        status: 'created',
        createdAt: new Date().toISOString()
      };

      this.database.write(txId, 'orders', orderId, order);

      // Add message to outbox
      const outboxMessage = new OutboxMessage(
        orderId,
        'OrderCreated',
        {
          orderId,
          customerId,
          items,
          total,
          timestamp: new Date().toISOString()
        },
        { aggregateType: 'Order', userId: customerId }
      );

      this.database.addToOutbox(txId, outboxMessage);

      // Commit transaction (atomic operation)
      this.database.commit(txId);

      console.log(`Order ${orderId} created successfully (with outbox entry)`);
      return order;
    } catch (error) {
      this.database.rollback(txId);
      throw error;
    }
  }

  /**
   * Complete order with outbox pattern
   */
  async completeOrder(orderId) {
    const order = this.database.read('orders', orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const txId = this.database.beginTransaction();

    try {
      // Update business data
      order.status = 'completed';
      order.completedAt = new Date().toISOString();
      this.database.write(txId, 'orders', orderId, order);

      // Add message to outbox
      const outboxMessage = new OutboxMessage(
        orderId,
        'OrderCompleted',
        {
          orderId,
          customerId: order.customerId,
          total: order.total,
          completedAt: order.completedAt
        },
        { aggregateType: 'Order', userId: order.customerId }
      );

      this.database.addToOutbox(txId, outboxMessage);

      // Commit transaction
      this.database.commit(txId);

      console.log(`Order ${orderId} completed successfully (with outbox entry)`);
      return order;
    } catch (error) {
      this.database.rollback(txId);
      throw error;
    }
  }

  /**
   * Get order
   */
  getOrder(orderId) {
    return this.database.read('orders', orderId);
  }

  /**
   * Start message relay
   */
  startRelay() {
    this.messageRelay.start();
  }

  /**
   * Stop message relay
   */
  stopRelay() {
    this.messageRelay.stop();
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      relay: this.messageRelay.getStats(),
      broker: {
        publishedCount: this.messageBroker.getPublishedCount()
      }
    };
  }
}

/**
 * Demo function
 */
async function demonstrateTransactionOutbox() {
  console.log('=== Transaction Outbox Pattern Demo ===\n');

  // Create order service
  const orderService = new OrderService();

  // Subscribe to published messages
  orderService.messageBroker.subscribe('OrderCreated', (message) => {
    console.log(`Received OrderCreated event:`, message.orderId);
  });

  orderService.messageBroker.subscribe('OrderCompleted', (message) => {
    console.log(`Received OrderCompleted event:`, message.orderId);
  });

  // Create orders (writes to database + outbox)
  console.log('Creating orders (writes to database + outbox)...\n');
  await orderService.createOrder('ORD-001', 'CUST-001', ['item1', 'item2'], 100);
  await orderService.createOrder('ORD-002', 'CUST-002', ['item3'], 50);
  await orderService.createOrder('ORD-003', 'CUST-001', ['item4'], 75);

  // Check outbox before relay
  console.log('\nOutbox stats before relay:');
  console.log(orderService.database.getOutboxStats());

  // Start message relay
  console.log('\nStarting message relay...\n');
  orderService.startRelay();

  // Wait for messages to be published
  await delay(1500);

  // Complete some orders
  console.log('\nCompleting orders...\n');
  await orderService.completeOrder('ORD-001');
  await orderService.completeOrder('ORD-002');

  // Wait for completion messages
  await delay(1500);

  // Stop relay
  orderService.stopRelay();

  // Display statistics
  console.log('\nFinal Statistics:');
  const stats = orderService.getStats();
  console.log(JSON.stringify(stats, null, 2));

  // Demonstrate failure and retry
  console.log('\n\n=== Testing Failure & Retry ===\n');

  // Set broker failure rate
  orderService.messageBroker.setFailureRate(0.5); // 50% failure rate

  // Create more orders
  await orderService.createOrder('ORD-004', 'CUST-003', ['item5'], 200);
  await orderService.createOrder('ORD-005', 'CUST-003', ['item6'], 300);

  // Start relay again
  orderService.startRelay();

  // Wait for retry attempts
  await delay(3000);

  // Stop relay
  orderService.stopRelay();

  console.log('\nFinal outbox stats after retries:');
  console.log(orderService.database.getOutboxStats());

  return orderService;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export components
module.exports = {
  OutboxMessage,
  TransactionalDatabase,
  MessageBroker,
  MessageRelay,
  OrderService,
  demonstrateTransactionOutbox
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateTransactionOutbox()
    .then(() => console.log('\n✅ Transaction Outbox demo completed'))
    .catch(error => console.error('❌ Error:', error));
}
