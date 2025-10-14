/**
 * Competing Consumers Pattern
 *
 * Purpose:
 * Implements multiple consumers competing for messages from a shared queue,
 * enabling load distribution and parallel message processing. This pattern
 * provides horizontal scalability for message consumption.
 *
 * Use Cases:
 * - Load balancing across multiple consumers
 * - Parallel message processing
 * - High-throughput message consumption
 * - Horizontal scaling of message processing
 * - Distributed workload processing
 *
 * Components:
 * - ConsumerGroup: Manages multiple competing consumers
 * - SharedQueue: Message source shared by all consumers
 * - ConsumerWorker: Individual consumer instance
 * - LoadBalancer: Distributes messages across consumers
 * - CoordinationManager: Coordinates consumer lifecycle
 */

const EventEmitter = require('events');

/**
 * Message class
 */
class Message {
  constructor(id, type, payload, timestamp = new Date()) {
    this.id = id;
    this.type = type;
    this.payload = payload;
    this.timestamp = timestamp;
    this.assignedTo = null;
    this.attempts = 0;
  }

  assignTo(consumerId) {
    this.assignedTo = consumerId;
    this.attempts++;
  }
}

/**
 * Shared message queue
 */
class SharedQueue extends EventEmitter {
  constructor() {
    super();
    this.messages = [];
    this.locks = new Map();
  }

  enqueue(message) {
    this.messages.push(message);
    this.emit('message:available', message);
  }

  dequeue(consumerId) {
    // Find first message not locked
    for (let i = 0; i < this.messages.length; i++) {
      const message = this.messages[i];
      if (!this.locks.has(message.id)) {
        // Lock message for this consumer
        this.locks.set(message.id, {
          consumerId,
          lockedAt: Date.now()
        });
        this.messages.splice(i, 1);
        message.assignTo(consumerId);
        return message;
      }
    }
    return null;
  }

  unlock(messageId) {
    this.locks.delete(messageId);
  }

  size() {
    return this.messages.length;
  }

  isEmpty() {
    return this.messages.length === 0;
  }

  clear() {
    this.messages = [];
    this.locks.clear();
  }
}

/**
 * Consumer worker
 */
class ConsumerWorker extends EventEmitter {
  constructor(id, handler, config = {}) {
    super();
    this.id = id;
    this.handler = handler;
    this.config = {
      processingTimeout: config.processingTimeout || 30000,
      errorRetryAttempts: config.errorRetryAttempts || 3,
      ...config
    };
    this.isActive = false;
    this.isBusy = false;
    this.messagesProcessed = 0;
    this.messagesFailed = 0;
    this.totalProcessingTime = 0;
  }

  async processMessage(message) {
    if (this.isBusy) {
      throw new Error(`Consumer ${this.id} is busy`);
    }

    this.isBusy = true;
    const startTime = Date.now();

    try {
      this.emit('processing:start', { consumerId: this.id, messageId: message.id });

      // Set processing timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Processing timeout')), this.config.processingTimeout)
      );

      const processingPromise = Promise.resolve(this.handler(message));

      await Promise.race([processingPromise, timeoutPromise]);

      const processingTime = Date.now() - startTime;
      this.messagesProcessed++;
      this.totalProcessingTime += processingTime;

      this.emit('processing:complete', {
        consumerId: this.id,
        messageId: message.id,
        processingTime
      });

      return { success: true, processingTime };

    } catch (error) {
      this.messagesFailed++;
      this.emit('processing:error', {
        consumerId: this.id,
        messageId: message.id,
        error: error.message
      });

      throw error;

    } finally {
      this.isBusy = false;
      const processingTime = Date.now() - startTime;
      this.totalProcessingTime += processingTime;
    }
  }

  getStatistics() {
    return {
      id: this.id,
      isActive: this.isActive,
      isBusy: this.isBusy,
      messagesProcessed: this.messagesProcessed,
      messagesFailed: this.messagesFailed,
      averageProcessingTime: this.messagesProcessed > 0 ?
        (this.totalProcessingTime / this.messagesProcessed).toFixed(2) : 0
    };
  }
}

/**
 * Consumer group statistics
 */
class GroupStatistics {
  constructor() {
    this.messagesProcessed = 0;
    this.messagesFailed = 0;
    this.messagesRetried = 0;
    this.startTime = new Date();
  }

  recordProcessed() {
    this.messagesProcessed++;
  }

  recordFailed() {
    this.messagesFailed++;
  }

  recordRetried() {
    this.messagesRetried++;
  }

  getStatistics() {
    const uptime = new Date() - this.startTime;
    return {
      messagesProcessed: this.messagesProcessed,
      messagesFailed: this.messagesFailed,
      messagesRetried: this.messagesRetried,
      successRate: (this.messagesProcessed + this.messagesFailed) > 0 ?
        ((this.messagesProcessed / (this.messagesProcessed + this.messagesFailed)) * 100).toFixed(2) : 0,
      uptime: Math.floor(uptime / 1000),
      throughput: uptime > 0 ?
        ((this.messagesProcessed / (uptime / 1000)) * 60).toFixed(2) : 0
    };
  }
}

/**
 * Competing Consumers
 * Manages multiple consumers competing for messages from a shared queue
 */
class CompetingConsumers extends EventEmitter {
  constructor(queue, config = {}) {
    super();
    this.queue = queue;
    this.config = {
      name: config.name || 'CompetingConsumers',
      consumerCount: config.consumerCount || 3,
      pollingInterval: config.pollingInterval || 100,
      errorRetryAttempts: config.errorRetryAttempts || 3,
      rebalanceInterval: config.rebalanceInterval || 5000,
      ...config
    };

    this.consumers = [];
    this.isRunning = false;
    this.pollingTimers = [];
    this.statistics = new GroupStatistics();
    this.messageHandler = null;
  }

  /**
   * Register message handler for all consumers
   */
  registerHandler(handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    this.messageHandler = handler;
    console.log(`[${this.config.name}] Registered message handler for consumer group`);
  }

  /**
   * Initialize consumer workers
   */
  initializeConsumers() {
    if (!this.messageHandler) {
      throw new Error('Message handler must be registered before starting');
    }

    for (let i = 0; i < this.config.consumerCount; i++) {
      const consumer = new ConsumerWorker(
        `${this.config.name}-worker-${i + 1}`,
        this.messageHandler,
        this.config
      );

      // Subscribe to consumer events
      consumer.on('processing:start', (data) => {
        this.emit('consumer:processing', data);
      });

      consumer.on('processing:complete', (data) => {
        this.statistics.recordProcessed();
        this.emit('consumer:complete', data);
      });

      consumer.on('processing:error', (data) => {
        this.statistics.recordFailed();
        this.emit('consumer:error', data);
      });

      consumer.isActive = true;
      this.consumers.push(consumer);
    }

    console.log(`[${this.config.name}] Initialized ${this.consumers.length} consumers`);
  }

  /**
   * Start all consumers
   */
  start() {
    if (this.isRunning) {
      console.log(`[${this.config.name}] Consumer group already running`);
      return;
    }

    this.initializeConsumers();
    this.isRunning = true;

    console.log(`[${this.config.name}] Starting consumer group with ${this.consumers.length} workers`);

    // Start polling for each consumer
    this.consumers.forEach(consumer => {
      this.startConsumerPolling(consumer);
    });

    // Setup queue event listener
    this.queue.on('message:available', () => {
      this.triggerPolling();
    });

    this.emit('group:started');
  }

  /**
   * Stop all consumers
   */
  async stop(graceful = true) {
    if (!this.isRunning) {
      console.log(`[${this.config.name}] Consumer group not running`);
      return;
    }

    console.log(`[${this.config.name}] Stopping consumer group...`);
    this.isRunning = false;

    // Clear all polling timers
    this.pollingTimers.forEach(timer => clearTimeout(timer));
    this.pollingTimers = [];

    if (graceful) {
      // Wait for all consumers to finish processing
      await this.waitForConsumers();
    }

    // Deactivate all consumers
    this.consumers.forEach(consumer => {
      consumer.isActive = false;
    });

    console.log(`[${this.config.name}] Consumer group stopped`);
    this.emit('group:stopped');
  }

  /**
   * Start polling for a specific consumer
   */
  startConsumerPolling(consumer) {
    const poll = async () => {
      if (!this.isRunning || !consumer.isActive) {
        return;
      }

      if (consumer.isBusy) {
        // Consumer is busy, schedule next poll
        const timer = setTimeout(poll, this.config.pollingInterval);
        this.pollingTimers.push(timer);
        return;
      }

      try {
        // Try to get a message from queue
        const message = this.queue.dequeue(consumer.id);

        if (message) {
          // Process message
          await this.processMessageWithRetry(consumer, message);
        }

      } catch (error) {
        console.error(`[${this.config.name}] Error in consumer ${consumer.id}:`, error.message);
      }

      // Schedule next poll
      const timer = setTimeout(poll, this.config.pollingInterval);
      this.pollingTimers.push(timer);
    };

    // Start polling
    poll();
  }

  /**
   * Process message with retry logic
   */
  async processMessageWithRetry(consumer, message, retryAttempt = 0) {
    try {
      await consumer.processMessage(message);
      this.queue.unlock(message.id);

    } catch (error) {
      console.error(`[${this.config.name}] Consumer ${consumer.id} failed to process message ${message.id}:`, error.message);

      if (retryAttempt < this.config.errorRetryAttempts) {
        console.log(`[${this.config.name}] Retrying message ${message.id}, attempt ${retryAttempt + 1}`);
        this.statistics.recordRetried();

        // Delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryAttempt + 1)));

        // Retry with same or different consumer
        const availableConsumer = this.findAvailableConsumer();
        if (availableConsumer) {
          await this.processMessageWithRetry(availableConsumer, message, retryAttempt + 1);
        } else {
          // Re-queue message
          this.queue.enqueue(message);
        }
      } else {
        console.error(`[${this.config.name}] Message ${message.id} failed after ${retryAttempt} retries`);
        this.emit('message:dead-letter', message);
      }

      this.queue.unlock(message.id);
    }
  }

  /**
   * Find an available (non-busy) consumer
   */
  findAvailableConsumer() {
    return this.consumers.find(c => !c.isBusy && c.isActive);
  }

  /**
   * Trigger polling for all idle consumers
   */
  triggerPolling() {
    this.consumers.forEach(consumer => {
      if (!consumer.isBusy && consumer.isActive) {
        // Consumer is idle, try to process message immediately
        this.tryProcessMessage(consumer);
      }
    });
  }

  /**
   * Try to process a message immediately
   */
  async tryProcessMessage(consumer) {
    if (consumer.isBusy || !consumer.isActive) {
      return;
    }

    const message = this.queue.dequeue(consumer.id);
    if (message) {
      await this.processMessageWithRetry(consumer, message);
    }
  }

  /**
   * Wait for all consumers to finish processing
   */
  async waitForConsumers() {
    const maxWait = 30000;
    const checkInterval = 100;
    let waited = 0;

    while (waited < maxWait) {
      const busyConsumers = this.consumers.filter(c => c.isBusy);
      if (busyConsumers.length === 0) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    const stillBusy = this.consumers.filter(c => c.isBusy).length;
    if (stillBusy > 0) {
      console.warn(`[${this.config.name}] ${stillBusy} consumers still busy after timeout`);
    }
  }

  /**
   * Add a consumer to the group
   */
  addConsumer() {
    if (!this.messageHandler) {
      throw new Error('Message handler must be registered');
    }

    const consumer = new ConsumerWorker(
      `${this.config.name}-worker-${this.consumers.length + 1}`,
      this.messageHandler,
      this.config
    );

    consumer.isActive = true;
    this.consumers.push(consumer);

    if (this.isRunning) {
      this.startConsumerPolling(consumer);
    }

    console.log(`[${this.config.name}] Added consumer ${consumer.id}`);
    this.emit('consumer:added', consumer.id);
  }

  /**
   * Remove a consumer from the group
   */
  async removeConsumer(consumerId) {
    const index = this.consumers.findIndex(c => c.id === consumerId);
    if (index === -1) {
      console.warn(`[${this.config.name}] Consumer ${consumerId} not found`);
      return;
    }

    const consumer = this.consumers[index];
    consumer.isActive = false;

    // Wait for consumer to finish current message
    const maxWait = 30000;
    const checkInterval = 100;
    let waited = 0;

    while (consumer.isBusy && waited < maxWait) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    this.consumers.splice(index, 1);
    console.log(`[${this.config.name}] Removed consumer ${consumerId}`);
    this.emit('consumer:removed', consumerId);
  }

  /**
   * Get group statistics
   */
  getStatistics() {
    const groupStats = this.statistics.getStatistics();
    const consumerStats = this.consumers.map(c => c.getStatistics());

    return {
      ...groupStats,
      isRunning: this.isRunning,
      consumerCount: this.consumers.length,
      activeConsumers: this.consumers.filter(c => c.isActive).length,
      busyConsumers: this.consumers.filter(c => c.isBusy).length,
      queueSize: this.queue.size(),
      consumers: consumerStats
    };
  }

  /**
   * Execute pattern (for compatibility)
   */
  execute() {
    console.log(`[${this.config.name}] CompetingConsumers executing with config:`, this.config);
    return {
      success: true,
      pattern: 'CompetingConsumers',
      statistics: this.getStatistics()
    };
  }
}

/**
 * Example usage and testing
 */
function demonstrateCompetingConsumers() {
  console.log('=== Competing Consumers Pattern Demo ===\n');

  // Create shared queue
  const queue = new SharedQueue();

  // Create competing consumers
  const consumerGroup = new CompetingConsumers(queue, {
    name: 'OrderProcessorGroup',
    consumerCount: 3,
    pollingInterval: 50
  });

  // Register handler
  consumerGroup.registerHandler(async (message) => {
    console.log(`[${message.assignedTo}] Processing order: ${message.payload.orderId}`);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
  });

  // Start consumer group
  consumerGroup.start();

  // Add messages to queue
  console.log('Adding 15 messages to queue...\n');
  for (let i = 1; i <= 15; i++) {
    queue.enqueue(new Message(
      `msg-${i}`,
      'order.created',
      { orderId: `ORD-${String(i).padStart(3, '0')}`, amount: i * 10 }
    ));
  }

  // Add more messages after delay
  setTimeout(() => {
    console.log('\nAdding 10 more messages...\n');
    for (let i = 16; i <= 25; i++) {
      queue.enqueue(new Message(
        `msg-${i}`,
        'order.created',
        { orderId: `ORD-${String(i).padStart(3, '0')}`, amount: i * 10 }
      ));
    }
  }, 1000);

  // Show statistics
  setTimeout(async () => {
    console.log('\n=== Consumer Group Statistics ===');
    console.log(JSON.stringify(consumerGroup.getStatistics(), null, 2));

    await consumerGroup.stop();
  }, 5000);
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateCompetingConsumers();
}

module.exports = { CompetingConsumers, ConsumerWorker, SharedQueue, Message };
