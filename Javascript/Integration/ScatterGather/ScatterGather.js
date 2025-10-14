/**
 * Scatter-Gather Pattern
 *
 * Broadcasts a message to multiple recipients and aggregates their responses.
 * Useful for querying multiple services and combining their results.
 *
 * Key Components:
 * - Scatter: Broadcasts messages to recipients
 * - Gather: Collects and aggregates responses
 * - Recipient: Processes scattered messages
 * - MessageBroker: Pub/sub infrastructure
 */

const EventEmitter = require('events');

class Message {
  constructor(id, payload, headers = {}) {
    this.id = id;
    this.payload = payload;
    this.headers = headers;
    this.timestamp = Date.now();
    this.correlationId = headers.correlationId || null;
    this.recipientId = headers.recipientId || null;
  }

  clone() {
    const cloned = new Message(this.id, { ...this.payload }, { ...this.headers });
    cloned.timestamp = this.timestamp;
    cloned.correlationId = this.correlationId;
    cloned.recipientId = this.recipientId;
    return cloned;
  }
}

class Recipient {
  constructor(id, handler, options = {}) {
    this.id = id;
    this.handler = handler;
    this.priority = options.priority || 0;
    this.timeout = options.timeout || 5000;
    this.processCount = 0;
  }

  async process(message) {
    const startTime = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), this.timeout);
      });

      const result = await Promise.race([
        this.handler(message),
        timeoutPromise
      ]);

      this.processCount++;
      const duration = Date.now() - startTime;

      return {
        recipientId: this.id,
        success: true,
        result,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        recipientId: this.id,
        success: false,
        error: error.message,
        duration
      };
    }
  }

  getStats() {
    return {
      id: this.id,
      priority: this.priority,
      timeout: this.timeout,
      processCount: this.processCount
    };
  }
}

class GatherStrategy {
  constructor(name, aggregator, completer) {
    this.name = name;
    this.aggregator = aggregator;
    this.completer = completer;
  }

  aggregate(responses) {
    return this.aggregator(responses);
  }

  isComplete(responses, totalRecipients) {
    return this.completer(responses, totalRecipients);
  }

  static allResponsesStrategy() {
    return {
      aggregator: (responses) => {
        return {
          successful: responses.filter(r => r.success),
          failed: responses.filter(r => !r.success),
          results: responses.filter(r => r.success).map(r => r.result)
        };
      },
      completer: (responses, total) => responses.length === total
    };
  }

  static firstSuccessStrategy() {
    return {
      aggregator: (responses) => {
        const first = responses.find(r => r.success);
        return first ? first.result : null;
      },
      completer: (responses, total) => responses.some(r => r.success)
    };
  }

  static majorityStrategy() {
    return {
      aggregator: (responses) => {
        const successful = responses.filter(r => r.success);
        return {
          count: successful.length,
          total: responses.length,
          results: successful.map(r => r.result)
        };
      },
      completer: (responses, total) => responses.length > total / 2
    };
  }

  static timeoutStrategy(timeoutMs) {
    return {
      aggregator: (responses) => ({
        received: responses.length,
        successful: responses.filter(r => r.success).length,
        results: responses.filter(r => r.success).map(r => r.result)
      }),
      completer: (responses, total, startTime) => {
        return responses.length === total || (Date.now() - startTime) >= timeoutMs;
      }
    };
  }
}

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

class ScatterGather extends EventEmitter {
  constructor(options = {}) {
    super();
    this.broker = options.broker || new MessageBroker();
    this.recipients = [];
    this.strategy = options.strategy || new GatherStrategy('all', ...Object.values(GatherStrategy.allResponsesStrategy()));
    this.outputChannel = options.outputChannel || 'gathered-output';
    this.enableLogging = options.enableLogging !== undefined ? options.enableLogging : true;
    this.scatterCount = 0;
    this.gatherCount = 0;
    this.activeGathers = new Map();

    if (!this.broker.channels.has(this.outputChannel)) {
      this.broker.createChannel(this.outputChannel);
    }
  }

  addRecipient(recipient) {
    this.recipients.push(recipient);
    this.emit('recipientAdded', recipient);
    return this;
  }

  removeRecipient(id) {
    const index = this.recipients.findIndex(r => r.id === id);
    if (index > -1) {
      const recipient = this.recipients.splice(index, 1)[0];
      this.emit('recipientRemoved', recipient);
      return true;
    }
    return false;
  }

  async scatterGather(message) {
    const correlationId = this.generateCorrelationId();
    const startTime = Date.now();

    if (this.enableLogging) {
      console.log(`Scattering message ${message.id} to ${this.recipients.length} recipients`);
    }

    this.scatterCount++;
    const responses = [];
    const gather = {
      correlationId,
      message,
      responses,
      startTime,
      completed: false
    };

    this.activeGathers.set(correlationId, gather);

    try {
      const scatteredMessages = this.recipients.map(recipient => {
        const scattered = message.clone();
        scattered.headers.correlationId = correlationId;
        scattered.headers.recipientId = recipient.id;
        scattered.correlationId = correlationId;
        scattered.recipientId = recipient.id;
        return { recipient, message: scattered };
      });

      const promises = scatteredMessages.map(async ({ recipient, message }) => {
        if (this.enableLogging) {
          console.log(`Sending to recipient ${recipient.id}`);
        }

        const response = await recipient.process(message);

        responses.push(response);

        if (this.strategy.completer(responses, this.recipients.length, startTime)) {
          gather.completed = true;
        }

        return response;
      });

      await Promise.all(promises);

      const aggregated = this.strategy.aggregator(responses);
      const duration = Date.now() - startTime;

      const gatheredMessage = new Message(
        `GATHER-${correlationId}`,
        aggregated,
        {
          correlationId,
          originalMessageId: message.id,
          responseCount: responses.length,
          duration
        }
      );

      this.broker.publish(this.outputChannel, gatheredMessage);
      this.activeGathers.delete(correlationId);
      this.gatherCount++;

      if (this.enableLogging) {
        console.log(`Gathered ${responses.length} responses in ${duration}ms`);
      }

      this.emit('gatherComplete', {
        correlationId,
        responseCount: responses.length,
        duration,
        aggregated
      });

      return {
        success: true,
        correlationId,
        responses,
        aggregated,
        duration
      };

    } catch (error) {
      this.activeGathers.delete(correlationId);

      if (this.enableLogging) {
        console.error(`Scatter-gather failed for ${correlationId}:`, error);
      }

      this.emit('gatherError', { correlationId, error });

      return {
        success: false,
        correlationId,
        error: error.message
      };
    }
  }

  generateCorrelationId() {
    return `sg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats() {
    return {
      recipientCount: this.recipients.length,
      scatterCount: this.scatterCount,
      gatherCount: this.gatherCount,
      activeGathers: this.activeGathers.size,
      recipients: this.recipients.map(r => r.getStats()),
      broker: this.broker.getStats()
    };
  }

  reset() {
    this.scatterCount = 0;
    this.gatherCount = 0;
    this.activeGathers.clear();
    this.emit('reset');
  }
}

async function demonstrateScatterGather() {
  console.log('=== Scatter-Gather Pattern Demo ===\n');

  const sg = new ScatterGather({
    outputChannel: 'results',
    enableLogging: true
  });

  sg.addRecipient(new Recipient('service-1', async (msg) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { service: 'service-1', price: 99.99, available: true };
  }, { timeout: 500 }));

  sg.addRecipient(new Recipient('service-2', async (msg) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return { service: 'service-2', price: 89.99, available: true };
  }, { timeout: 500 }));

  sg.addRecipient(new Recipient('service-3', async (msg) => {
    await new Promise(resolve => setTimeout(resolve, 75));
    return { service: 'service-3', price: 109.99, available: false };
  }, { timeout: 500 }));

  sg.broker.subscribe('results', (msg) => {
    console.log(`[RESULTS] Aggregated response: ${JSON.stringify(msg.payload, null, 2)}`);
  });

  const query = new Message('QUERY-001', {
    productId: 'PROD-123',
    requestedBy: 'USER-456'
  });

  await sg.scatterGather(query);

  console.log('\n=== Scatter-Gather Statistics ===');
  console.log(JSON.stringify(sg.getStats(), null, 2));

  return sg;
}

module.exports = ScatterGather;
module.exports.Message = Message;
module.exports.Recipient = Recipient;
module.exports.GatherStrategy = GatherStrategy;
module.exports.MessageBroker = MessageBroker;
module.exports.demonstrate = demonstrateScatterGather;

if (require.main === module) {
  demonstrateScatterGather().catch(console.error);
}
