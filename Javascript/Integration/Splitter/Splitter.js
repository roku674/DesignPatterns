/**
 * Splitter Pattern
 *
 * Splits a single message containing multiple elements into multiple messages,
 * each containing one element. This is useful for processing collections of
 * items individually through a messaging system.
 *
 * Key Components:
 * - Splitter: Splits messages into parts
 * - SplitStrategy: Defines how messages are split
 * - MessageBroker: Pub/sub infrastructure
 * - CorrelationTracker: Tracks related split messages
 */

const EventEmitter = require('events');

/**
 * Message class representing messages in the system
 */
class Message {
  constructor(id, payload, headers = {}) {
    this.id = id;
    this.payload = payload;
    this.headers = headers;
    this.timestamp = Date.now();
    this.correlationId = headers.correlationId || null;
    this.sequenceNumber = headers.sequenceNumber || null;
    this.sequenceSize = headers.sequenceSize || null;
  }

  clone() {
    const cloned = new Message(this.id, { ...this.payload }, { ...this.headers });
    cloned.timestamp = this.timestamp;
    cloned.correlationId = this.correlationId;
    cloned.sequenceNumber = this.sequenceNumber;
    cloned.sequenceSize = this.sequenceSize;
    return cloned;
  }

  isPartOfSequence() {
    return this.correlationId !== null && this.sequenceNumber !== null;
  }
}

/**
 * SplitStrategy - Defines how to split messages
 */
class SplitStrategy {
  constructor(name, splitter) {
    this.name = name;
    this.splitter = splitter;
  }

  split(message) {
    return this.splitter(message);
  }

  // Built-in strategies
  static arraySplitter(fieldName) {
    return (message) => {
      const array = message.payload[fieldName];
      if (!Array.isArray(array)) {
        throw new Error(`Field ${fieldName} is not an array`);
      }
      return array.map((item, index) => ({
        ...message.payload,
        [fieldName]: item,
        _splitIndex: index,
        _splitTotal: array.length
      }));
    };
  }

  static objectSplitter(fieldName) {
    return (message) => {
      const obj = message.payload[fieldName];
      if (typeof obj !== 'object' || obj === null) {
        throw new Error(`Field ${fieldName} is not an object`);
      }
      return Object.entries(obj).map(([key, value], index) => ({
        ...message.payload,
        [fieldName]: { key, value },
        _splitIndex: index,
        _splitTotal: Object.keys(obj).length
      }));
    };
  }

  static lineSplitter(fieldName) {
    return (message) => {
      const text = message.payload[fieldName];
      if (typeof text !== 'string') {
        throw new Error(`Field ${fieldName} is not a string`);
      }
      const lines = text.split('\n').filter(line => line.trim() !== '');
      return lines.map((line, index) => ({
        ...message.payload,
        [fieldName]: line,
        _splitIndex: index,
        _splitTotal: lines.length
      }));
    };
  }

  static chunkSplitter(fieldName, chunkSize) {
    return (message) => {
      const array = message.payload[fieldName];
      if (!Array.isArray(array)) {
        throw new Error(`Field ${fieldName} is not an array`);
      }
      const chunks = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks.map((chunk, index) => ({
        ...message.payload,
        [fieldName]: chunk,
        _splitIndex: index,
        _splitTotal: chunks.length
      }));
    };
  }
}

/**
 * CorrelationTracker - Tracks related split messages
 */
class CorrelationTracker {
  constructor() {
    this.correlations = new Map();
    this.maxTrackedCorrelations = 10000;
  }

  track(correlationId, totalParts) {
    if (!this.correlations.has(correlationId)) {
      this.correlations.set(correlationId, {
        correlationId,
        totalParts,
        receivedParts: 0,
        parts: [],
        createdAt: Date.now(),
        completedAt: null
      });

      // Clean up old correlations
      if (this.correlations.size > this.maxTrackedCorrelations) {
        const oldest = Array.from(this.correlations.entries())
          .sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
        this.correlations.delete(oldest[0]);
      }
    }
  }

  addPart(correlationId, sequenceNumber, message) {
    const correlation = this.correlations.get(correlationId);
    if (correlation) {
      correlation.receivedParts++;
      correlation.parts.push({ sequenceNumber, message });

      if (correlation.receivedParts === correlation.totalParts) {
        correlation.completedAt = Date.now();
      }
    }
  }

  isComplete(correlationId) {
    const correlation = this.correlations.get(correlationId);
    return correlation && correlation.receivedParts === correlation.totalParts;
  }

  getCorrelation(correlationId) {
    return this.correlations.get(correlationId);
  }

  getStats() {
    const complete = Array.from(this.correlations.values())
      .filter(c => c.completedAt !== null).length;
    const incomplete = this.correlations.size - complete;

    return {
      total: this.correlations.size,
      complete,
      incomplete
    };
  }
}

/**
 * MessageBroker provides pub/sub infrastructure
 */
class MessageBroker extends EventEmitter {
  constructor() {
    super();
    this.channels = new Map();
    this.messageLog = [];
    this.maxLogSize = 10000;
  }

  createChannel(name) {
    if (this.channels.has(name)) {
      throw new Error(`Channel ${name} already exists`);
    }

    const channel = {
      name,
      subscribers: [],
      messageCount: 0
    };

    this.channels.set(name, channel);
    this.emit('channelCreated', channel);
    return channel;
  }

  subscribe(channelName, handler) {
    let channel = this.channels.get(channelName);
    if (!channel) {
      channel = this.createChannel(channelName);
    }

    channel.subscribers.push(handler);
    return () => this.unsubscribe(channelName, handler);
  }

  unsubscribe(channelName, handler) {
    const channel = this.channels.get(channelName);
    if (channel) {
      const index = channel.subscribers.indexOf(handler);
      if (index > -1) {
        channel.subscribers.splice(index, 1);
      }
    }
  }

  publish(channelName, message) {
    const channel = this.channels.get(channelName);
    if (!channel) {
      throw new Error(`Channel ${channelName} does not exist`);
    }

    channel.messageCount++;
    this.logMessage(channelName, message);

    channel.subscribers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in subscriber for channel ${channelName}:`, error);
      }
    });
  }

  logMessage(channelName, message) {
    this.messageLog.push({
      channel: channelName,
      messageId: message.id,
      timestamp: Date.now()
    });

    if (this.messageLog.length > this.maxLogSize) {
      this.messageLog.shift();
    }
  }

  getStats() {
    const stats = {
      totalChannels: this.channels.size,
      totalMessages: this.messageLog.length,
      channels: {}
    };

    this.channels.forEach((channel, name) => {
      stats.channels[name] = {
        name: channel.name,
        subscribers: channel.subscribers.length,
        messageCount: channel.messageCount
      };
    });

    return stats;
  }
}

/**
 * Splitter - Main splitting component
 */
class Splitter extends EventEmitter {
  constructor(options = {}) {
    super();
    this.broker = options.broker || new MessageBroker();
    this.strategy = options.strategy || null;
    this.outputChannel = options.outputChannel || 'split-output';
    this.tracker = options.tracker || new CorrelationTracker();
    this.enableLogging = options.enableLogging !== undefined ? options.enableLogging : true;
    this.enableTracking = options.enableTracking !== undefined ? options.enableTracking : true;
    this.splitMessageCount = 0;
    this.totalPartsCreated = 0;
    this.failedSplitCount = 0;

    // Ensure output channel exists
    if (!this.broker.channels.has(this.outputChannel)) {
      this.broker.createChannel(this.outputChannel);
    }
  }

  setStrategy(strategy) {
    this.strategy = strategy;
    this.emit('strategyChanged', strategy);
  }

  split(message, strategyOverride = null) {
    const strategy = strategyOverride || this.strategy;

    if (!strategy) {
      throw new Error('No split strategy defined');
    }

    try {
      const parts = strategy.split(message);

      if (!Array.isArray(parts) || parts.length === 0) {
        throw new Error('Split strategy must return a non-empty array');
      }

      const correlationId = this.generateCorrelationId();
      const splitMessages = [];

      if (this.enableTracking) {
        this.tracker.track(correlationId, parts.length);
      }

      parts.forEach((part, index) => {
        const splitMessage = new Message(
          `${message.id}-${index}`,
          part,
          {
            ...message.headers,
            correlationId,
            sequenceNumber: index,
            sequenceSize: parts.length,
            originalMessageId: message.id
          }
        );

        splitMessage.correlationId = correlationId;
        splitMessage.sequenceNumber = index;
        splitMessage.sequenceSize = parts.length;

        if (this.enableTracking) {
          this.tracker.addPart(correlationId, index, splitMessage);
        }

        this.broker.publish(this.outputChannel, splitMessage);
        splitMessages.push(splitMessage);

        if (this.enableLogging) {
          console.log(`Split message ${message.id} into part ${index + 1}/${parts.length}`);
        }
      });

      this.splitMessageCount++;
      this.totalPartsCreated += splitMessages.length;

      this.emit('messageSplit', {
        originalMessage: message,
        splitMessages,
        correlationId,
        partCount: splitMessages.length
      });

      return {
        success: true,
        correlationId,
        partCount: splitMessages.length,
        messages: splitMessages
      };

    } catch (error) {
      this.failedSplitCount++;
      this.emit('splitError', { message, error });

      if (this.enableLogging) {
        console.error(`Failed to split message ${message.id}:`, error);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  generateCorrelationId() {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats() {
    return {
      splitMessages: this.splitMessageCount,
      totalPartsCreated: this.totalPartsCreated,
      failedSplits: this.failedSplitCount,
      avgPartsPerMessage: this.splitMessageCount > 0
        ? (this.totalPartsCreated / this.splitMessageCount).toFixed(2)
        : 0,
      tracking: this.enableTracking ? this.tracker.getStats() : null,
      broker: this.broker.getStats()
    };
  }

  reset() {
    this.splitMessageCount = 0;
    this.totalPartsCreated = 0;
    this.failedSplitCount = 0;
    this.emit('reset');
  }
}

// Example usage and demonstration
function demonstrateSplitter() {
  console.log('=== Splitter Pattern Demo ===\n');

  const splitter = new Splitter({
    outputChannel: 'items',
    enableLogging: true,
    enableTracking: true
  });

  // Subscribe to split messages
  splitter.broker.subscribe('items', (msg) => {
    console.log(`[ITEM] Received part ${msg.sequenceNumber + 1}/${msg.sequenceSize}: ${JSON.stringify(msg.payload)}`);
  });

  // Example 1: Split an array
  console.log('Example 1: Splitting an array...\n');
  const arrayStrategy = new SplitStrategy('array', SplitStrategy.arraySplitter('items'));
  splitter.setStrategy(arrayStrategy);

  const msg1 = new Message('MSG-001', {
    orderId: 'ORD-123',
    items: ['Apple', 'Banana', 'Orange', 'Grape']
  });

  splitter.split(msg1);

  // Example 2: Split an object
  console.log('\nExample 2: Splitting an object...\n');
  const objectStrategy = new SplitStrategy('object', SplitStrategy.objectSplitter('metadata'));

  const msg2 = new Message('MSG-002', {
    userId: 'USER-456',
    metadata: {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      city: 'New York'
    }
  });

  splitter.split(msg2, objectStrategy);

  // Example 3: Split text lines
  console.log('\nExample 3: Splitting text lines...\n');
  const lineStrategy = new SplitStrategy('lines', SplitStrategy.lineSplitter('text'));

  const msg3 = new Message('MSG-003', {
    documentId: 'DOC-789',
    text: 'First line\nSecond line\nThird line\nFourth line'
  });

  splitter.split(msg3, lineStrategy);

  // Example 4: Split into chunks
  console.log('\nExample 4: Splitting into chunks...\n');
  const chunkStrategy = new SplitStrategy('chunks', SplitStrategy.chunkSplitter('numbers', 3));

  const msg4 = new Message('MSG-004', {
    batchId: 'BATCH-999',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  });

  splitter.split(msg4, chunkStrategy);

  // Display stats
  console.log('\n=== Splitter Statistics ===');
  console.log(JSON.stringify(splitter.getStats(), null, 2));

  return splitter;
}

// Export classes
module.exports = Splitter;
module.exports.Message = Message;
module.exports.SplitStrategy = SplitStrategy;
module.exports.CorrelationTracker = CorrelationTracker;
module.exports.MessageBroker = MessageBroker;
module.exports.demonstrate = demonstrateSplitter;

// Run demo if executed directly
if (require.main === module) {
  demonstrateSplitter();
}
