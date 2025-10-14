/**
 * Event-Driven Consumer Pattern
 *
 * Purpose:
 * Implements an event-driven message consumer that reacts to messages as they arrive,
 * rather than polling. This pattern provides asynchronous, non-blocking message consumption
 * with event handlers and listeners.
 *
 * Use Cases:
 * - Real-time message processing
 * - Event-driven architectures
 * - Asynchronous notification systems
 * - Reactive message consumption
 * - Push-based message delivery
 *
 * Components:
 * - EventEmitter: Core event emission functionality
 * - MessageListener: Handles incoming messages
 * - EventHandler: Processes specific event types
 * - ConnectionManager: Manages message source connections
 * - ErrorHandler: Handles processing errors
 */

const EventEmitter = require('events');

/**
 * Message class representing consumed messages
 */
class Message {
  constructor(id, type, payload, timestamp = new Date()) {
    this.id = id;
    this.type = type;
    this.payload = payload;
    this.timestamp = timestamp;
    this.metadata = {};
  }

  addMetadata(key, value) {
    this.metadata[key] = value;
  }

  getMetadata(key) {
    return this.metadata[key];
  }
}

/**
 * Consumer statistics tracker
 */
class ConsumerStatistics {
  constructor() {
    this.messagesReceived = 0;
    this.messagesProcessed = 0;
    this.messagesFailed = 0;
    this.averageProcessingTime = 0;
    this.processingTimes = [];
    this.lastMessageTime = null;
    this.startTime = new Date();
  }

  recordMessageReceived() {
    this.messagesReceived++;
    this.lastMessageTime = new Date();
  }

  recordMessageProcessed(processingTime) {
    this.messagesProcessed++;
    this.processingTimes.push(processingTime);

    // Keep only last 100 processing times for average calculation
    if (this.processingTimes.length > 100) {
      this.processingTimes.shift();
    }

    this.averageProcessingTime = this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
  }

  recordMessageFailed() {
    this.messagesFailed++;
  }

  getStatistics() {
    const uptime = new Date() - this.startTime;
    return {
      messagesReceived: this.messagesReceived,
      messagesProcessed: this.messagesProcessed,
      messagesFailed: this.messagesFailed,
      averageProcessingTime: this.averageProcessingTime.toFixed(2),
      successRate: this.messagesReceived > 0 ?
        ((this.messagesProcessed / this.messagesReceived) * 100).toFixed(2) : 0,
      uptime: Math.floor(uptime / 1000),
      lastMessageTime: this.lastMessageTime
    };
  }

  reset() {
    this.messagesReceived = 0;
    this.messagesProcessed = 0;
    this.messagesFailed = 0;
    this.processingTimes = [];
    this.averageProcessingTime = 0;
    this.startTime = new Date();
  }
}

/**
 * Message handler registry
 */
class HandlerRegistry {
  constructor() {
    this.handlers = new Map();
    this.wildcardHandlers = [];
  }

  registerHandler(messageType, handler) {
    if (messageType === '*') {
      this.wildcardHandlers.push(handler);
    } else {
      if (!this.handlers.has(messageType)) {
        this.handlers.set(messageType, []);
      }
      this.handlers.get(messageType).push(handler);
    }
  }

  unregisterHandler(messageType, handler) {
    if (messageType === '*') {
      const index = this.wildcardHandlers.indexOf(handler);
      if (index > -1) {
        this.wildcardHandlers.splice(index, 1);
      }
    } else {
      const handlers = this.handlers.get(messageType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }

  getHandlers(messageType) {
    const specificHandlers = this.handlers.get(messageType) || [];
    return [...specificHandlers, ...this.wildcardHandlers];
  }

  hasHandlers(messageType) {
    return this.handlers.has(messageType) || this.wildcardHandlers.length > 0;
  }

  clear() {
    this.handlers.clear();
    this.wildcardHandlers = [];
  }
}

/**
 * Event-Driven Consumer
 * Consumes messages reactively using event-driven architecture
 */
class EventDrivenConsumer extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      name: config.name || 'EventDrivenConsumer',
      maxConcurrency: config.maxConcurrency || 10,
      errorRetryAttempts: config.errorRetryAttempts || 3,
      errorRetryDelay: config.errorRetryDelay || 1000,
      enableStatistics: config.enableStatistics !== false,
      autoAck: config.autoAck !== false,
      messageTimeout: config.messageTimeout || 30000,
      ...config
    };

    this.handlerRegistry = new HandlerRegistry();
    this.statistics = new ConsumerStatistics();
    this.isRunning = false;
    this.activeProcessing = new Map();
    this.messageQueue = [];
    this.processingCount = 0;

    this.setupInternalListeners();
  }

  /**
   * Setup internal event listeners
   */
  setupInternalListeners() {
    // Handle message arrival
    this.on('message:arrived', this.handleMessageArrival.bind(this));

    // Handle processing completion
    this.on('message:completed', this.handleMessageCompletion.bind(this));

    // Handle processing errors
    this.on('message:error', this.handleMessageError.bind(this));

    // Handle consumer events
    this.on('consumer:start', () => {
      console.log(`[${this.config.name}] Consumer started`);
    });

    this.on('consumer:stop', () => {
      console.log(`[${this.config.name}] Consumer stopped`);
    });
  }

  /**
   * Register a message handler for specific message type
   */
  registerHandler(messageType, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }

    this.handlerRegistry.registerHandler(messageType, handler);
    console.log(`[${this.config.name}] Registered handler for message type: ${messageType}`);
  }

  /**
   * Unregister a message handler
   */
  unregisterHandler(messageType, handler) {
    this.handlerRegistry.unregisterHandler(messageType, handler);
    console.log(`[${this.config.name}] Unregistered handler for message type: ${messageType}`);
  }

  /**
   * Start consuming messages
   */
  start() {
    if (this.isRunning) {
      console.log(`[${this.config.name}] Consumer already running`);
      return;
    }

    this.isRunning = true;
    this.statistics.reset();
    this.emit('consumer:start');

    // Process any queued messages
    this.processQueuedMessages();
  }

  /**
   * Stop consuming messages
   */
  async stop(graceful = true) {
    if (!this.isRunning) {
      console.log(`[${this.config.name}] Consumer not running`);
      return;
    }

    this.isRunning = false;

    if (graceful) {
      // Wait for active processing to complete
      console.log(`[${this.config.name}] Waiting for ${this.processingCount} active messages to complete...`);
      await this.waitForActiveProcessing();
    } else {
      // Cancel all active processing
      this.activeProcessing.clear();
      this.processingCount = 0;
    }

    this.emit('consumer:stop');
  }

  /**
   * Handle message arrival event
   */
  async handleMessageArrival(message) {
    if (!this.isRunning) {
      console.log(`[${this.config.name}] Consumer not running, queuing message ${message.id}`);
      this.messageQueue.push(message);
      return;
    }

    this.statistics.recordMessageReceived();

    // Check concurrency limit
    if (this.processingCount >= this.config.maxConcurrency) {
      console.log(`[${this.config.name}] Max concurrency reached, queuing message ${message.id}`);
      this.messageQueue.push(message);
      return;
    }

    await this.processMessage(message);
  }

  /**
   * Process a single message
   */
  async processMessage(message, retryAttempt = 0) {
    const startTime = Date.now();
    this.processingCount++;

    const processingInfo = {
      message,
      startTime,
      retryAttempt,
      timeout: null
    };

    this.activeProcessing.set(message.id, processingInfo);

    // Set message timeout
    processingInfo.timeout = setTimeout(() => {
      this.emit('message:timeout', message);
      this.handleMessageError(message, new Error('Message processing timeout'));
    }, this.config.messageTimeout);

    try {
      const handlers = this.handlerRegistry.getHandlers(message.type);

      if (handlers.length === 0) {
        throw new Error(`No handlers registered for message type: ${message.type}`);
      }

      // Execute all handlers for this message type
      const handlerPromises = handlers.map(handler =>
        Promise.resolve(handler(message))
      );

      await Promise.all(handlerPromises);

      const processingTime = Date.now() - startTime;
      this.statistics.recordMessageProcessed(processingTime);

      clearTimeout(processingInfo.timeout);
      this.activeProcessing.delete(message.id);
      this.processingCount--;

      if (this.config.autoAck) {
        this.emit('message:acknowledged', message);
      }

      this.emit('message:completed', message, processingTime);

      // Process next queued message if any
      this.processQueuedMessages();

    } catch (error) {
      clearTimeout(processingInfo.timeout);

      if (retryAttempt < this.config.errorRetryAttempts) {
        console.log(`[${this.config.name}] Retrying message ${message.id}, attempt ${retryAttempt + 1}`);

        await new Promise(resolve => setTimeout(resolve, this.config.errorRetryDelay));
        await this.processMessage(message, retryAttempt + 1);
      } else {
        this.activeProcessing.delete(message.id);
        this.processingCount--;
        this.statistics.recordMessageFailed();
        this.emit('message:error', message, error);

        // Process next queued message if any
        this.processQueuedMessages();
      }
    }
  }

  /**
   * Process queued messages
   */
  processQueuedMessages() {
    while (this.messageQueue.length > 0 &&
           this.processingCount < this.config.maxConcurrency &&
           this.isRunning) {
      const message = this.messageQueue.shift();
      this.processMessage(message);
    }
  }

  /**
   * Handle message completion
   */
  handleMessageCompletion(message, processingTime) {
    console.log(`[${this.config.name}] Message ${message.id} processed successfully in ${processingTime}ms`);
  }

  /**
   * Handle message error
   */
  handleMessageError(message, error) {
    console.error(`[${this.config.name}] Error processing message ${message.id}:`, error.message);
    this.emit('message:failed', message, error);
  }

  /**
   * Consume a message (trigger message arrival event)
   */
  consume(messageData) {
    const message = messageData instanceof Message ?
      messageData :
      new Message(
        messageData.id || Date.now().toString(),
        messageData.type,
        messageData.payload,
        messageData.timestamp
      );

    this.emit('message:arrived', message);
    return message;
  }

  /**
   * Wait for all active processing to complete
   */
  async waitForActiveProcessing() {
    const checkInterval = 100;
    const maxWait = 30000;
    let waited = 0;

    while (this.processingCount > 0 && waited < maxWait) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    if (this.processingCount > 0) {
      console.warn(`[${this.config.name}] Timeout waiting for active processing to complete`);
    }
  }

  /**
   * Get consumer statistics
   */
  getStatistics() {
    const stats = this.statistics.getStatistics();
    return {
      ...stats,
      isRunning: this.isRunning,
      activeProcessing: this.processingCount,
      queuedMessages: this.messageQueue.length,
      registeredHandlers: this.handlerRegistry.handlers.size +
        (this.handlerRegistry.wildcardHandlers.length > 0 ? 1 : 0)
    };
  }

  /**
   * Get active processing information
   */
  getActiveProcessing() {
    const active = [];
    for (const [messageId, info] of this.activeProcessing) {
      active.push({
        messageId,
        messageType: info.message.type,
        processingTime: Date.now() - info.startTime,
        retryAttempt: info.retryAttempt
      });
    }
    return active;
  }

  /**
   * Clear all handlers
   */
  clearHandlers() {
    this.handlerRegistry.clear();
    console.log(`[${this.config.name}] All handlers cleared`);
  }

  /**
   * Execute pattern (for compatibility)
   */
  execute() {
    console.log(`[${this.config.name}] EventDrivenConsumer executing with config:`, this.config);
    return {
      success: true,
      pattern: 'EventDrivenConsumer',
      statistics: this.getStatistics()
    };
  }
}

/**
 * Example usage and testing
 */
function demonstrateEventDrivenConsumer() {
  console.log('=== Event-Driven Consumer Pattern Demo ===\n');

  // Create consumer
  const consumer = new EventDrivenConsumer({
    name: 'OrderConsumer',
    maxConcurrency: 5,
    errorRetryAttempts: 2
  });

  // Register handlers for different message types
  consumer.registerHandler('order.created', async (message) => {
    console.log(`Processing order creation: ${message.payload.orderId}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  consumer.registerHandler('order.updated', async (message) => {
    console.log(`Processing order update: ${message.payload.orderId}`);
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  consumer.registerHandler('order.cancelled', async (message) => {
    console.log(`Processing order cancellation: ${message.payload.orderId}`);
    await new Promise(resolve => setTimeout(resolve, 75));
  });

  // Register wildcard handler
  consumer.registerHandler('*', async (message) => {
    console.log(`Wildcard handler: Logging message ${message.id} of type ${message.type}`);
  });

  // Start consumer
  consumer.start();

  // Simulate message arrival
  consumer.consume({
    type: 'order.created',
    payload: { orderId: 'ORD-001', amount: 100.00 }
  });

  consumer.consume({
    type: 'order.updated',
    payload: { orderId: 'ORD-001', status: 'processing' }
  });

  consumer.consume({
    type: 'order.cancelled',
    payload: { orderId: 'ORD-002', reason: 'Customer request' }
  });

  // Wait and show statistics
  setTimeout(() => {
    console.log('\n=== Consumer Statistics ===');
    console.log(JSON.stringify(consumer.getStatistics(), null, 2));

    console.log('\n=== Active Processing ===');
    console.log(JSON.stringify(consumer.getActiveProcessing(), null, 2));

    consumer.stop();
  }, 2000);
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateEventDrivenConsumer();
}

module.exports = { EventDrivenConsumer, Message, ConsumerStatistics };
