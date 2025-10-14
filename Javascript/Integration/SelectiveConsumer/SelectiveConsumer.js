/**
 * Selective Consumer Pattern
 *
 * Purpose:
 * Implements message filtering to selectively consume only messages that match
 * specific criteria. This pattern enables targeted message processing based on
 * message properties, content, or metadata.
 *
 * Use Cases:
 * - Content-based message filtering
 * - Priority-based message selection
 * - Type-specific message handling
 * - Conditional message consumption
 * - Multi-tenant message filtering
 *
 * Components:
 * - MessageFilter: Defines selection criteria
 * - FilterChain: Combines multiple filters
 * - Consumer: Processes filtered messages
 * - FilterExpression: Evaluates filter conditions
 * - SelectionPolicy: Defines selection strategy
 */

const EventEmitter = require('events');

/**
 * Message class
 */
class Message {
  constructor(id, type, payload, properties = {}) {
    this.id = id;
    this.type = type;
    this.payload = payload;
    this.properties = properties;
    this.timestamp = new Date();
  }

  getProperty(key) {
    return this.properties[key];
  }

  setProperty(key, value) {
    this.properties[key] = value;
  }

  hasProperty(key) {
    return key in this.properties;
  }
}

/**
 * Message filter interface
 */
class MessageFilter {
  constructor(name, filterFn) {
    this.name = name;
    this.filterFn = filterFn;
    this.messagesFiltered = 0;
    this.messagesAccepted = 0;
    this.messagesRejected = 0;
  }

  accept(message) {
    this.messagesFiltered++;
    const result = this.filterFn(message);
    if (result) {
      this.messagesAccepted++;
    } else {
      this.messagesRejected++;
    }
    return result;
  }

  getStatistics() {
    return {
      name: this.name,
      messagesFiltered: this.messagesFiltered,
      messagesAccepted: this.messagesAccepted,
      messagesRejected: this.messagesRejected,
      acceptanceRate: this.messagesFiltered > 0 ?
        ((this.messagesAccepted / this.messagesFiltered) * 100).toFixed(2) : 0
    };
  }
}

/**
 * Filter chain combining multiple filters
 */
class FilterChain {
  constructor(strategy = 'AND') {
    this.filters = [];
    this.strategy = strategy; // 'AND' or 'OR'
  }

  addFilter(filter) {
    this.filters.push(filter);
  }

  removeFilter(filterName) {
    const index = this.filters.findIndex(f => f.name === filterName);
    if (index > -1) {
      this.filters.splice(index, 1);
    }
  }

  accept(message) {
    if (this.filters.length === 0) {
      return true;
    }

    if (this.strategy === 'AND') {
      return this.filters.every(filter => filter.accept(message));
    } else if (this.strategy === 'OR') {
      return this.filters.some(filter => filter.accept(message));
    }

    return false;
  }

  getStatistics() {
    return this.filters.map(f => f.getStatistics());
  }
}

/**
 * Pre-built filter functions
 */
class FilterFunctions {
  static byType(types) {
    return (message) => {
      if (Array.isArray(types)) {
        return types.includes(message.type);
      }
      return message.type === types;
    };
  }

  static byProperty(key, value) {
    return (message) => {
      return message.getProperty(key) === value;
    };
  }

  static byPropertyExists(key) {
    return (message) => {
      return message.hasProperty(key);
    };
  }

  static byPriority(minPriority) {
    return (message) => {
      const priority = message.getProperty('priority');
      return priority !== undefined && priority >= minPriority;
    };
  }

  static byPayloadField(field, value) {
    return (message) => {
      return message.payload && message.payload[field] === value;
    };
  }

  static byRegex(field, regex) {
    return (message) => {
      const value = message.payload && message.payload[field];
      return value && regex.test(value);
    };
  }

  static byTimestamp(beforeDate, afterDate) {
    return (message) => {
      if (beforeDate && message.timestamp > beforeDate) {
        return false;
      }
      if (afterDate && message.timestamp < afterDate) {
        return false;
      }
      return true;
    };
  }

  static composite(...filters) {
    return (message) => {
      return filters.every(filter => filter(message));
    };
  }
}

/**
 * Consumer statistics tracker
 */
class ConsumerStatistics {
  constructor() {
    this.messagesReceived = 0;
    this.messagesFiltered = 0;
    this.messagesProcessed = 0;
    this.messagesFailed = 0;
    this.startTime = new Date();
  }

  recordReceived() {
    this.messagesReceived++;
  }

  recordFiltered() {
    this.messagesFiltered++;
  }

  recordProcessed() {
    this.messagesProcessed++;
  }

  recordFailed() {
    this.messagesFailed++;
  }

  getStatistics() {
    const uptime = new Date() - this.startTime;
    return {
      messagesReceived: this.messagesReceived,
      messagesFiltered: this.messagesFiltered,
      messagesProcessed: this.messagesProcessed,
      messagesFailed: this.messagesFailed,
      filterRate: this.messagesReceived > 0 ?
        ((this.messagesFiltered / this.messagesReceived) * 100).toFixed(2) : 0,
      successRate: this.messagesProcessed > 0 ?
        ((this.messagesProcessed / (this.messagesProcessed + this.messagesFailed)) * 100).toFixed(2) : 0,
      uptime: Math.floor(uptime / 1000)
    };
  }
}

/**
 * Selective Consumer
 * Consumes messages selectively based on filter criteria
 */
class SelectiveConsumer extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      name: config.name || 'SelectiveConsumer',
      filterStrategy: config.filterStrategy || 'AND',
      enableStatistics: config.enableStatistics !== false,
      maxConcurrency: config.maxConcurrency || 5,
      ...config
    };

    this.filterChain = new FilterChain(this.config.filterStrategy);
    this.messageHandlers = [];
    this.statistics = new ConsumerStatistics();
    this.isRunning = false;
    this.activeProcessing = new Map();
    this.processingCount = 0;
  }

  /**
   * Add a filter to the consumer
   */
  addFilter(name, filterFn) {
    const filter = new MessageFilter(name, filterFn);
    this.filterChain.addFilter(filter);
    console.log(`[${this.config.name}] Added filter: ${name}`);
    return this;
  }

  /**
   * Remove a filter from the consumer
   */
  removeFilter(filterName) {
    this.filterChain.removeFilter(filterName);
    console.log(`[${this.config.name}] Removed filter: ${filterName}`);
    return this;
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
    return this;
  }

  /**
   * Start the consumer
   */
  start() {
    if (this.isRunning) {
      console.log(`[${this.config.name}] Consumer already running`);
      return;
    }

    this.isRunning = true;
    console.log(`[${this.config.name}] Selective consumer started`);
    this.emit('consumer:start');
  }

  /**
   * Stop the consumer
   */
  async stop(graceful = true) {
    if (!this.isRunning) {
      console.log(`[${this.config.name}] Consumer not running`);
      return;
    }

    this.isRunning = false;

    if (graceful) {
      await this.waitForActiveProcessing();
    } else {
      this.activeProcessing.clear();
      this.processingCount = 0;
    }

    console.log(`[${this.config.name}] Selective consumer stopped`);
    this.emit('consumer:stop');
  }

  /**
   * Consume a message (apply filters and process if accepted)
   */
  async consume(message) {
    if (!this.isRunning) {
      console.log(`[${this.config.name}] Consumer not running, rejecting message ${message.id}`);
      return { accepted: false, reason: 'Consumer not running' };
    }

    this.statistics.recordReceived();

    // Apply filter chain
    const accepted = this.filterChain.accept(message);

    if (!accepted) {
      this.statistics.recordFiltered();
      console.log(`[${this.config.name}] Message ${message.id} filtered out`);
      this.emit('message:filtered', message);
      return { accepted: false, reason: 'Filtered by selection criteria' };
    }

    // Check concurrency limit
    while (this.processingCount >= this.config.maxConcurrency) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Process message
    await this.processMessage(message);

    return { accepted: true };
  }

  /**
   * Process an accepted message
   */
  async processMessage(message) {
    this.processingCount++;
    this.activeProcessing.set(message.id, {
      message,
      startTime: Date.now()
    });

    try {
      console.log(`[${this.config.name}] Processing message ${message.id} of type ${message.type}`);

      // Execute all registered handlers
      for (const handler of this.messageHandlers) {
        await handler(message);
      }

      this.statistics.recordProcessed();
      this.emit('message:processed', message);

    } catch (error) {
      console.error(`[${this.config.name}] Error processing message ${message.id}:`, error.message);
      this.statistics.recordFailed();
      this.emit('message:error', { message, error });

    } finally {
      this.activeProcessing.delete(message.id);
      this.processingCount--;
    }
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
   * Test if a message would be accepted (without processing)
   */
  wouldAccept(message) {
    return this.filterChain.accept(message);
  }

  /**
   * Get consumer statistics
   */
  getStatistics() {
    const stats = this.statistics.getStatistics();
    const filterStats = this.filterChain.getStatistics();

    return {
      ...stats,
      isRunning: this.isRunning,
      activeProcessing: this.processingCount,
      registeredHandlers: this.messageHandlers.length,
      filterCount: this.filterChain.filters.length,
      filters: filterStats
    };
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.filterChain.filters = [];
    console.log(`[${this.config.name}] All filters cleared`);
  }

  /**
   * Execute pattern (for compatibility)
   */
  execute() {
    console.log(`[${this.config.name}] SelectiveConsumer executing with config:`, this.config);
    return {
      success: true,
      pattern: 'SelectiveConsumer',
      statistics: this.getStatistics()
    };
  }
}

/**
 * Example usage and testing
 */
function demonstrateSelectiveConsumer() {
  console.log('=== Selective Consumer Pattern Demo ===\n');

  // Create selective consumer
  const consumer = new SelectiveConsumer({
    name: 'OrderSelectiveConsumer',
    filterStrategy: 'AND'
  });

  // Add filters
  consumer
    .addFilter('type', FilterFunctions.byType(['order.created', 'order.updated']))
    .addFilter('highPriority', FilterFunctions.byPriority(5))
    .addFilter('activeStatus', FilterFunctions.byPayloadField('status', 'active'));

  // Register handler
  consumer.registerHandler(async (message) => {
    console.log(`  -> Processing: ${message.type} - Order ${message.payload.orderId}`);
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  // Start consumer
  consumer.start();

  // Test messages
  const testMessages = [
    new Message('1', 'order.created', { orderId: 'ORD-001', status: 'active' }, { priority: 8 }),
    new Message('2', 'order.created', { orderId: 'ORD-002', status: 'inactive' }, { priority: 7 }),
    new Message('3', 'order.updated', { orderId: 'ORD-003', status: 'active' }, { priority: 6 }),
    new Message('4', 'order.cancelled', { orderId: 'ORD-004', status: 'active' }, { priority: 9 }),
    new Message('5', 'order.created', { orderId: 'ORD-005', status: 'active' }, { priority: 3 }),
    new Message('6', 'order.updated', { orderId: 'ORD-006', status: 'active' }, { priority: 10 })
  ];

  console.log('Testing message filtering:\n');

  // Consume messages
  (async () => {
    for (const message of testMessages) {
      const result = await consumer.consume(message);
      if (!result.accepted) {
        console.log(`  X  Rejected: ${message.type} - ${result.reason}`);
      }
    }

    setTimeout(() => {
      console.log('\n=== Consumer Statistics ===');
      console.log(JSON.stringify(consumer.getStatistics(), null, 2));

      consumer.stop();
    }, 1000);
  })();
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateSelectiveConsumer();
}

module.exports = {
  SelectiveConsumer,
  MessageFilter,
  FilterChain,
  FilterFunctions,
  Message
};
