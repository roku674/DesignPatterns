/**
 * Aggregator Pattern
 *
 * Combines multiple related messages into a single message. This is the
 * inverse of the Splitter pattern. Messages are correlated and aggregated
 * based on correlation ID and sequence information.
 *
 * Key Components:
 * - Aggregator: Main aggregation engine
 * - AggregationStrategy: Defines how messages are combined
 * - MessageBroker: Pub/sub infrastructure
 * - CompletionStrategy: Determines when aggregation is complete
 */

const EventEmitter = require('events');

/**
 * Message class
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
}

/**
 * AggregationStrategy - Defines how messages are combined
 */
class AggregationStrategy {
  constructor(name, aggregator) {
    this.name = name;
    this.aggregator = aggregator;
  }

  aggregate(messages) {
    return this.aggregator(messages);
  }

  static arrayAggregator(fieldName) {
    return (messages) => {
      const sorted = messages.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
      return {
        [fieldName]: sorted.map(msg => msg.payload[fieldName]),
        _aggregatedCount: messages.length,
        _correlationId: messages[0].correlationId
      };
    };
  }

  static objectMergeAggregator() {
    return (messages) => {
      const merged = {};
      messages.forEach(msg => {
        Object.assign(merged, msg.payload);
      });
      merged._aggregatedCount = messages.length;
      merged._correlationId = messages[0].correlationId;
      return merged;
    };
  }

  static sumAggregator(fieldName) {
    return (messages) => {
      const sum = messages.reduce((acc, msg) => acc + (msg.payload[fieldName] || 0), 0);
      return {
        [fieldName]: sum,
        count: messages.length,
        _correlationId: messages[0].correlationId
      };
    };
  }

  static customAggregator(fn) {
    return (messages) => {
      const result = fn(messages);
      result._aggregatedCount = messages.length;
      result._correlationId = messages[0].correlationId;
      return result;
    };
  }
}

/**
 * CompletionStrategy - Determines when aggregation is complete
 */
class CompletionStrategy {
  constructor(name, checker) {
    this.name = name;
    this.checker = checker;
  }

  isComplete(correlation) {
    return this.checker(correlation);
  }

  static sequenceSizeStrategy() {
    return (correlation) => {
      if (!correlation.expectedSize) return false;
      return correlation.messages.length === correlation.expectedSize;
    };
  }

  static timeoutStrategy(timeoutMs) {
    return (correlation) => {
      return Date.now() - correlation.createdAt > timeoutMs;
    };
  }

  static countStrategy(count) {
    return (correlation) => {
      return correlation.messages.length >= count;
    };
  }

  static conditionalStrategy(condition) {
    return (correlation) => {
      return condition(correlation);
    };
  }
}

/**
 * MessageBroker
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
    const channel = { name, subscribers: [], messageCount: 0 };
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
        console.error(`Error in subscriber:`, error);
      }
    });
  }

  logMessage(channelName, message) {
    this.messageLog.push({ channel: channelName, messageId: message.id, timestamp: Date.now() });
    if (this.messageLog.length > this.maxLogSize) {
      this.messageLog.shift();
    }
  }

  getStats() {
    const stats = { totalChannels: this.channels.size, totalMessages: this.messageLog.length, channels: {} };
    this.channels.forEach((channel, name) => {
      stats.channels[name] = { name: channel.name, subscribers: channel.subscribers.length, messageCount: channel.messageCount };
    });
    return stats;
  }
}

/**
 * Aggregator - Main aggregation component
 */
class Aggregator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.broker = options.broker || new MessageBroker();
    this.strategy = options.strategy || null;
    this.completionStrategy = options.completionStrategy || new CompletionStrategy('sequence', CompletionStrategy.sequenceSizeStrategy());
    this.outputChannel = options.outputChannel || 'aggregated-output';
    this.correlations = new Map();
    this.maxCorrelations = options.maxCorrelations || 10000;
    this.enableLogging = options.enableLogging !== undefined ? options.enableLogging : true;
    this.aggregatedCount = 0;
    this.timeoutCheckInterval = null;

    if (!this.broker.channels.has(this.outputChannel)) {
      this.broker.createChannel(this.outputChannel);
    }

    if (options.timeoutCheckIntervalMs) {
      this.startTimeoutCheck(options.timeoutCheckIntervalMs);
    }
  }

  setStrategy(strategy) {
    this.strategy = strategy;
    this.emit('strategyChanged', strategy);
  }

  setCompletionStrategy(strategy) {
    this.completionStrategy = strategy;
    this.emit('completionStrategyChanged', strategy);
  }

  addMessage(message) {
    if (!message.correlationId) {
      throw new Error('Message must have a correlationId');
    }

    let correlation = this.correlations.get(message.correlationId);

    if (!correlation) {
      correlation = {
        correlationId: message.correlationId,
        messages: [],
        expectedSize: message.sequenceSize || null,
        createdAt: Date.now(),
        lastUpdatedAt: Date.now()
      };
      this.correlations.set(message.correlationId, correlation);

      if (this.correlations.size > this.maxCorrelations) {
        this.cleanOldCorrelations();
      }
    }

    correlation.messages.push(message);
    correlation.lastUpdatedAt = Date.now();

    if (this.enableLogging) {
      console.log(`Added message ${message.id} to correlation ${message.correlationId} (${correlation.messages.length}/${correlation.expectedSize || '?'})`);
    }

    this.emit('messageAdded', { message, correlation });

    if (this.completionStrategy.isComplete(correlation)) {
      this.complete(message.correlationId);
    }

    return correlation;
  }

  complete(correlationId) {
    const correlation = this.correlations.get(correlationId);

    if (!correlation) {
      throw new Error(`Correlation ${correlationId} not found`);
    }

    if (!this.strategy) {
      throw new Error('No aggregation strategy defined');
    }

    try {
      const aggregatedPayload = this.strategy.aggregate(correlation.messages);
      const aggregatedMessage = new Message(
        `AGG-${correlationId}`,
        aggregatedPayload,
        {
          correlationId,
          aggregatedCount: correlation.messages.length,
          originalMessageIds: correlation.messages.map(m => m.id)
        }
      );

      this.broker.publish(this.outputChannel, aggregatedMessage);
      this.correlations.delete(correlationId);
      this.aggregatedCount++;

      if (this.enableLogging) {
        console.log(`Completed aggregation for ${correlationId} with ${correlation.messages.length} messages`);
      }

      this.emit('aggregationComplete', {
        correlationId,
        messageCount: correlation.messages.length,
        aggregatedMessage
      });

      return aggregatedMessage;

    } catch (error) {
      this.emit('aggregationError', { correlationId, error });
      if (this.enableLogging) {
        console.error(`Failed to aggregate ${correlationId}:`, error);
      }
      throw error;
    }
  }

  cleanOldCorrelations() {
    const sorted = Array.from(this.correlations.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt);

    const toRemove = Math.floor(this.correlations.size * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.correlations.delete(sorted[i][0]);
    }
  }

  startTimeoutCheck(intervalMs) {
    this.timeoutCheckInterval = setInterval(() => {
      const now = Date.now();
      const correlationsToCheck = Array.from(this.correlations.entries());

      correlationsToCheck.forEach(([correlationId, correlation]) => {
        if (this.completionStrategy.isComplete(correlation)) {
          try {
            this.complete(correlationId);
          } catch (error) {
            console.error(`Error completing timed-out correlation ${correlationId}:`, error);
          }
        }
      });
    }, intervalMs);
  }

  stopTimeoutCheck() {
    if (this.timeoutCheckInterval) {
      clearInterval(this.timeoutCheckInterval);
      this.timeoutCheckInterval = null;
    }
  }

  getStats() {
    return {
      activeCorrelations: this.correlations.size,
      aggregatedCount: this.aggregatedCount,
      correlations: Array.from(this.correlations.values()).map(c => ({
        correlationId: c.correlationId,
        messageCount: c.messages.length,
        expectedSize: c.expectedSize,
        age: Date.now() - c.createdAt
      })),
      broker: this.broker.getStats()
    };
  }

  reset() {
    this.correlations.clear();
    this.aggregatedCount = 0;
    this.emit('reset');
  }

  destroy() {
    this.stopTimeoutCheck();
    this.reset();
  }
}

// Demonstration
function demonstrateAggregator() {
  console.log('=== Aggregator Pattern Demo ===\n');

  const aggregator = new Aggregator({
    outputChannel: 'aggregated',
    enableLogging: true,
    strategy: new AggregationStrategy('array', AggregationStrategy.arrayAggregator('item'))
  });

  aggregator.broker.subscribe('aggregated', (msg) => {
    console.log(`[AGGREGATED] Received: ${JSON.stringify(msg.payload)}`);
  });

  const correlationId = 'ORDER-123';

  console.log('Adding split messages...\n');

  const msg1 = new Message('MSG-001-0', { item: 'Apple', price: 1.00 }, { correlationId, sequenceNumber: 0, sequenceSize: 3 });
  const msg2 = new Message('MSG-001-1', { item: 'Banana', price: 0.50 }, { correlationId, sequenceNumber: 1, sequenceSize: 3 });
  const msg3 = new Message('MSG-001-2', { item: 'Orange', price: 0.75 }, { correlationId, sequenceNumber: 2, sequenceSize: 3 });

  aggregator.addMessage(msg1);
  aggregator.addMessage(msg2);
  aggregator.addMessage(msg3);

  console.log('\n=== Aggregator Statistics ===');
  console.log(JSON.stringify(aggregator.getStats(), null, 2));

  return aggregator;
}

module.exports = Aggregator;
module.exports.Message = Message;
module.exports.AggregationStrategy = AggregationStrategy;
module.exports.CompletionStrategy = CompletionStrategy;
module.exports.MessageBroker = MessageBroker;
module.exports.demonstrate = demonstrateAggregator;

if (require.main === module) {
  demonstrateAggregator();
}
