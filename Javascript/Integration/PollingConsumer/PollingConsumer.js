/**
 * Polling Consumer Pattern
 *
 * Purpose:
 * Implements a polling-based message consumer that actively retrieves messages
 * from a message source at regular intervals. This pattern provides pull-based
 * message consumption with configurable polling strategies.
 *
 * Use Cases:
 * - Batch message processing
 * - Controlled message consumption rate
 * - Systems without push notification support
 * - Queue polling and monitoring
 * - Scheduled message retrieval
 *
 * Components:
 * - PollingStrategy: Defines polling interval and behavior
 * - MessageQueue: Source of messages
 * - MessageProcessor: Processes retrieved messages
 * - PollingScheduler: Manages polling lifecycle
 * - BackoffStrategy: Handles polling backoff on errors
 */

/**
 * Message class
 */
class Message {
  constructor(id, type, payload, timestamp = new Date()) {
    this.id = id;
    this.type = type;
    this.payload = payload;
    this.timestamp = timestamp;
    this.metadata = {};
    this.attempts = 0;
  }

  addMetadata(key, value) {
    this.metadata[key] = value;
  }

  incrementAttempts() {
    this.attempts++;
  }
}

/**
 * Message queue interface
 */
class MessageQueue {
  constructor() {
    this.messages = [];
  }

  enqueue(message) {
    this.messages.push(message);
  }

  dequeue(count = 1) {
    const messages = this.messages.splice(0, count);
    return messages;
  }

  peek(count = 1) {
    return this.messages.slice(0, count);
  }

  size() {
    return this.messages.length;
  }

  isEmpty() {
    return this.messages.length === 0;
  }

  clear() {
    this.messages = [];
  }
}

/**
 * Backoff strategy for polling delays
 */
class BackoffStrategy {
  constructor(config = {}) {
    this.initialDelay = config.initialDelay || 1000;
    this.maxDelay = config.maxDelay || 60000;
    this.multiplier = config.multiplier || 2;
    this.jitterFactor = config.jitterFactor || 0.1;
    this.currentDelay = this.initialDelay;
  }

  getNextDelay() {
    const delay = this.currentDelay;
    this.currentDelay = Math.min(this.currentDelay * this.multiplier, this.maxDelay);

    // Add jitter
    const jitter = delay * this.jitterFactor * (Math.random() * 2 - 1);
    return Math.floor(delay + jitter);
  }

  reset() {
    this.currentDelay = this.initialDelay;
  }
}

/**
 * Polling statistics tracker
 */
class PollingStatistics {
  constructor() {
    this.pollsExecuted = 0;
    this.messagesRetrieved = 0;
    this.messagesProcessed = 0;
    this.messagesFailed = 0;
    this.emptyPolls = 0;
    this.averagePollDuration = 0;
    this.pollDurations = [];
    this.averageBatchSize = 0;
    this.batchSizes = [];
    this.startTime = new Date();
    this.lastPollTime = null;
  }

  recordPoll(duration, messageCount) {
    this.pollsExecuted++;
    this.lastPollTime = new Date();

    this.pollDurations.push(duration);
    if (this.pollDurations.length > 100) {
      this.pollDurations.shift();
    }
    this.averagePollDuration = this.pollDurations.reduce((a, b) => a + b, 0) / this.pollDurations.length;

    if (messageCount === 0) {
      this.emptyPolls++;
    } else {
      this.messagesRetrieved += messageCount;
      this.batchSizes.push(messageCount);
      if (this.batchSizes.length > 100) {
        this.batchSizes.shift();
      }
      this.averageBatchSize = this.batchSizes.reduce((a, b) => a + b, 0) / this.batchSizes.length;
    }
  }

  recordMessageProcessed() {
    this.messagesProcessed++;
  }

  recordMessageFailed() {
    this.messagesFailed++;
  }

  getStatistics() {
    const uptime = new Date() - this.startTime;
    return {
      pollsExecuted: this.pollsExecuted,
      messagesRetrieved: this.messagesRetrieved,
      messagesProcessed: this.messagesProcessed,
      messagesFailed: this.messagesFailed,
      emptyPolls: this.emptyPolls,
      emptyPollRate: this.pollsExecuted > 0 ?
        ((this.emptyPolls / this.pollsExecuted) * 100).toFixed(2) : 0,
      averagePollDuration: this.averagePollDuration.toFixed(2),
      averageBatchSize: this.averageBatchSize.toFixed(2),
      successRate: this.messagesRetrieved > 0 ?
        ((this.messagesProcessed / this.messagesRetrieved) * 100).toFixed(2) : 0,
      uptime: Math.floor(uptime / 1000),
      lastPollTime: this.lastPollTime
    };
  }

  reset() {
    this.pollsExecuted = 0;
    this.messagesRetrieved = 0;
    this.messagesProcessed = 0;
    this.messagesFailed = 0;
    this.emptyPolls = 0;
    this.pollDurations = [];
    this.batchSizes = [];
    this.averagePollDuration = 0;
    this.averageBatchSize = 0;
    this.startTime = new Date();
  }
}

/**
 * Polling Consumer
 * Polls message source at regular intervals and processes retrieved messages
 */
class PollingConsumer {
  constructor(messageSource, config = {}) {
    this.messageSource = messageSource;
    this.config = {
      name: config.name || 'PollingConsumer',
      pollingInterval: config.pollingInterval || 1000,
      batchSize: config.batchSize || 10,
      maxConcurrency: config.maxConcurrency || 5,
      enableBackoff: config.enableBackoff !== false,
      errorRetryAttempts: config.errorRetryAttempts || 3,
      emptyQueueBackoff: config.emptyQueueBackoff !== false,
      adaptivePolling: config.adaptivePolling || false,
      minPollingInterval: config.minPollingInterval || 100,
      maxPollingInterval: config.maxPollingInterval || 10000,
      ...config
    };

    this.isRunning = false;
    this.isPaused = false;
    this.pollingTimer = null;
    this.messageHandlers = [];
    this.activeProcessing = new Map();
    this.processingCount = 0;
    this.statistics = new PollingStatistics();
    this.backoffStrategy = new BackoffStrategy({
      initialDelay: this.config.pollingInterval,
      maxDelay: this.config.maxPollingInterval
    });
    this.currentPollingInterval = this.config.pollingInterval;
  }

  /**
   * Register a message handler
   */
  registerHandler(handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    this.messageHandlers.push(handler);
    console.log(`[${this.config.name}] Registered message handler`);
  }

  /**
   * Unregister a message handler
   */
  unregisterHandler(handler) {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
      console.log(`[${this.config.name}] Unregistered message handler`);
    }
  }

  /**
   * Start polling for messages
   */
  start() {
    if (this.isRunning) {
      console.log(`[${this.config.name}] Consumer already running`);
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.statistics.reset();
    this.backoffStrategy.reset();

    console.log(`[${this.config.name}] Starting polling consumer with interval ${this.config.pollingInterval}ms`);

    // Start polling loop
    this.schedulePoll();
  }

  /**
   * Stop polling for messages
   */
  async stop(graceful = true) {
    if (!this.isRunning) {
      console.log(`[${this.config.name}] Consumer not running`);
      return;
    }

    console.log(`[${this.config.name}] Stopping polling consumer...`);
    this.isRunning = false;

    // Clear polling timer
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }

    if (graceful) {
      // Wait for active processing to complete
      console.log(`[${this.config.name}] Waiting for ${this.processingCount} active messages to complete...`);
      await this.waitForActiveProcessing();
    } else {
      this.activeProcessing.clear();
      this.processingCount = 0;
    }

    console.log(`[${this.config.name}] Consumer stopped`);
  }

  /**
   * Pause polling (can be resumed)
   */
  pause() {
    if (!this.isRunning || this.isPaused) {
      console.log(`[${this.config.name}] Consumer not running or already paused`);
      return;
    }

    this.isPaused = true;
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }

    console.log(`[${this.config.name}] Consumer paused`);
  }

  /**
   * Resume polling
   */
  resume() {
    if (!this.isRunning || !this.isPaused) {
      console.log(`[${this.config.name}] Consumer not paused`);
      return;
    }

    this.isPaused = false;
    console.log(`[${this.config.name}] Consumer resumed`);
    this.schedulePoll();
  }

  /**
   * Schedule next poll
   */
  schedulePoll() {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    this.pollingTimer = setTimeout(() => {
      this.poll().then(() => {
        this.schedulePoll();
      });
    }, this.currentPollingInterval);
  }

  /**
   * Execute a single poll operation
   */
  async poll() {
    const pollStartTime = Date.now();

    try {
      // Retrieve messages from source
      const messages = await this.retrieveMessages();
      const pollDuration = Date.now() - pollStartTime;

      this.statistics.recordPoll(pollDuration, messages.length);

      if (messages.length === 0) {
        // Handle empty queue with backoff
        if (this.config.emptyQueueBackoff) {
          this.currentPollingInterval = this.backoffStrategy.getNextDelay();
          console.log(`[${this.config.name}] Empty queue, backing off to ${this.currentPollingInterval}ms`);
        }
        return;
      }

      // Reset backoff on successful message retrieval
      if (this.config.enableBackoff) {
        this.backoffStrategy.reset();
        this.currentPollingInterval = this.config.pollingInterval;
      }

      // Adjust polling interval based on queue depth (adaptive polling)
      if (this.config.adaptivePolling) {
        this.adjustPollingInterval(messages.length);
      }

      console.log(`[${this.config.name}] Retrieved ${messages.length} messages`);

      // Process messages
      await this.processMessages(messages);

    } catch (error) {
      console.error(`[${this.config.name}] Error during poll:`, error.message);

      // Apply backoff on error
      if (this.config.enableBackoff) {
        this.currentPollingInterval = this.backoffStrategy.getNextDelay();
        console.log(`[${this.config.name}] Error occurred, backing off to ${this.currentPollingInterval}ms`);
      }
    }
  }

  /**
   * Retrieve messages from source
   */
  async retrieveMessages() {
    if (typeof this.messageSource.dequeue === 'function') {
      // Synchronous message source
      return this.messageSource.dequeue(this.config.batchSize);
    } else if (typeof this.messageSource.poll === 'function') {
      // Asynchronous message source
      return await this.messageSource.poll(this.config.batchSize);
    } else {
      throw new Error('Invalid message source: must implement dequeue() or poll()');
    }
  }

  /**
   * Process retrieved messages
   */
  async processMessages(messages) {
    const processingPromises = [];

    for (const message of messages) {
      // Check concurrency limit
      while (this.processingCount >= this.config.maxConcurrency) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      processingPromises.push(this.processMessage(message));
    }

    await Promise.all(processingPromises);
  }

  /**
   * Process a single message
   */
  async processMessage(message, retryAttempt = 0) {
    this.processingCount++;
    this.activeProcessing.set(message.id, {
      message,
      startTime: Date.now(),
      retryAttempt
    });

    try {
      // Execute all registered handlers
      for (const handler of this.messageHandlers) {
        await handler(message);
      }

      this.statistics.recordMessageProcessed();
      console.log(`[${this.config.name}] Message ${message.id} processed successfully`);

    } catch (error) {
      console.error(`[${this.config.name}] Error processing message ${message.id}:`, error.message);

      if (retryAttempt < this.config.errorRetryAttempts) {
        console.log(`[${this.config.name}] Retrying message ${message.id}, attempt ${retryAttempt + 1}`);
        message.incrementAttempts();
        await this.processMessage(message, retryAttempt + 1);
      } else {
        this.statistics.recordMessageFailed();
      }
    } finally {
      this.activeProcessing.delete(message.id);
      this.processingCount--;
    }
  }

  /**
   * Adjust polling interval based on queue depth (adaptive polling)
   */
  adjustPollingInterval(messageCount) {
    const queueUtilization = messageCount / this.config.batchSize;

    if (queueUtilization > 0.8) {
      // High utilization - poll more frequently
      this.currentPollingInterval = Math.max(
        this.config.minPollingInterval,
        this.currentPollingInterval * 0.8
      );
    } else if (queueUtilization < 0.2) {
      // Low utilization - poll less frequently
      this.currentPollingInterval = Math.min(
        this.config.maxPollingInterval,
        this.currentPollingInterval * 1.2
      );
    }

    console.log(`[${this.config.name}] Adjusted polling interval to ${this.currentPollingInterval.toFixed(0)}ms`);
  }

  /**
   * Wait for active processing to complete
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
      isPaused: this.isPaused,
      currentPollingInterval: this.currentPollingInterval,
      activeProcessing: this.processingCount,
      registeredHandlers: this.messageHandlers.length
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
   * Execute pattern (for compatibility)
   */
  execute() {
    console.log(`[${this.config.name}] PollingConsumer executing with config:`, this.config);
    return {
      success: true,
      pattern: 'PollingConsumer',
      statistics: this.getStatistics()
    };
  }
}

/**
 * Example usage and testing
 */
function demonstratePollingConsumer() {
  console.log('=== Polling Consumer Pattern Demo ===\n');

  // Create message queue
  const messageQueue = new MessageQueue();

  // Add some messages to the queue
  for (let i = 1; i <= 20; i++) {
    messageQueue.enqueue(new Message(
      `msg-${i}`,
      'order.created',
      { orderId: `ORD-${String(i).padStart(3, '0')}`, amount: i * 10 }
    ));
  }

  console.log(`Initial queue size: ${messageQueue.size()}\n`);

  // Create polling consumer
  const consumer = new PollingConsumer(messageQueue, {
    name: 'OrderPollingConsumer',
    pollingInterval: 500,
    batchSize: 5,
    maxConcurrency: 3,
    adaptivePolling: true,
    emptyQueueBackoff: true
  });

  // Register message handler
  consumer.registerHandler(async (message) => {
    console.log(`Processing order: ${message.payload.orderId}`);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  // Start consumer
  consumer.start();

  // Add more messages after a delay
  setTimeout(() => {
    console.log('\nAdding 5 more messages to queue...\n');
    for (let i = 21; i <= 25; i++) {
      messageQueue.enqueue(new Message(
        `msg-${i}`,
        'order.created',
        { orderId: `ORD-${String(i).padStart(3, '0')}`, amount: i * 10 }
      ));
    }
  }, 2000);

  // Show statistics and stop
  setTimeout(async () => {
    console.log('\n=== Consumer Statistics ===');
    console.log(JSON.stringify(consumer.getStatistics(), null, 2));

    console.log('\n=== Active Processing ===');
    console.log(JSON.stringify(consumer.getActiveProcessing(), null, 2));

    console.log(`\nRemaining queue size: ${messageQueue.size()}`);

    await consumer.stop();
  }, 5000);
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstratePollingConsumer();
}

module.exports = { PollingConsumer, MessageQueue, Message, PollingStatistics, BackoffStrategy };
