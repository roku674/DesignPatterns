/**
 * Message Bridge Pattern
 *
 * Connects two different messaging systems, allowing messages to flow between
 * them. Translates message formats and handles protocol differences.
 *
 * Key Components:
 * - MessageBridge: Connects two messaging systems
 * - MessageTranslator: Converts between message formats
 * - SourceSystem: Origin messaging system
 * - TargetSystem: Destination messaging system
 */

const EventEmitter = require('events');

class Message {
  constructor(id, payload, headers = {}) {
    this.id = id;
    this.payload = payload;
    this.headers = headers;
    this.timestamp = Date.now();
    this.system = headers.system || null;
  }

  clone() {
    const cloned = new Message(this.id, { ...this.payload }, { ...this.headers });
    cloned.timestamp = this.timestamp;
    cloned.system = this.system;
    return cloned;
  }
}

class MessageTranslator {
  constructor(name, translator) {
    this.name = name;
    this.translator = translator;
    this.translateCount = 0;
    this.errorCount = 0;
  }

  translate(message, direction) {
    try {
      const result = this.translator(message, direction);
      this.translateCount++;
      return {
        success: true,
        message: result
      };
    } catch (error) {
      this.errorCount++;
      return {
        success: false,
        error: error.message
      };
    }
  }

  getStats() {
    return {
      name: this.name,
      translateCount: this.translateCount,
      errorCount: this.errorCount
    };
  }
}

class MessagingSystem extends EventEmitter {
  constructor(name, options = {}) {
    super();
    this.name = name;
    this.channels = new Map();
    this.messageFormat = options.messageFormat || 'standard';
    this.protocol = options.protocol || 'internal';
    this.messageLog = [];
    this.maxLogSize = options.maxLogSize || 1000;
  }

  createChannel(name) {
    if (this.channels.has(name)) {
      throw new Error(`Channel ${name} already exists in system ${this.name}`);
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
      throw new Error(`Channel ${channelName} does not exist in system ${this.name}`);
    }

    message.system = this.name;
    channel.messageCount++;
    this.logMessage(channelName, message);

    channel.subscribers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in subscriber for ${this.name}:`, error);
      }
    });

    this.emit('messagePublished', { channelName, message });
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
      name: this.name,
      messageFormat: this.messageFormat,
      protocol: this.protocol,
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

class MessageBridge extends EventEmitter {
  constructor(sourceSystem, targetSystem, options = {}) {
    super();
    this.sourceSystem = sourceSystem;
    this.targetSystem = targetSystem;
    this.translator = options.translator || null;
    this.sourceChannels = options.sourceChannels || [];
    this.targetChannels = options.targetChannels || [];
    this.bidirectional = options.bidirectional !== undefined ? options.bidirectional : false;
    this.enableLogging = options.enableLogging !== undefined ? options.enableLogging : true;
    this.bridgedCount = 0;
    this.failedCount = 0;
    this.isActive = false;
  }

  start() {
    if (this.isActive) {
      return;
    }

    this.isActive = true;

    this.sourceChannels.forEach(channelName => {
      this.sourceSystem.subscribe(channelName, (msg) => {
        this.bridgeMessage(msg, 'source-to-target', channelName);
      });
    });

    if (this.bidirectional) {
      this.targetChannels.forEach(channelName => {
        this.targetSystem.subscribe(channelName, (msg) => {
          this.bridgeMessage(msg, 'target-to-source', channelName);
        });
      });
    }

    if (this.enableLogging) {
      console.log(`Message bridge started between ${this.sourceSystem.name} and ${this.targetSystem.name}`);
    }

    this.emit('started');
  }

  stop() {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;

    if (this.enableLogging) {
      console.log(`Message bridge stopped between ${this.sourceSystem.name} and ${this.targetSystem.name}`);
    }

    this.emit('stopped');
  }

  bridgeMessage(message, direction, sourceChannel) {
    if (!this.isActive) {
      return;
    }

    try {
      let bridgedMessage = message.clone();

      if (this.translator) {
        const result = this.translator.translate(message, direction);

        if (!result.success) {
          throw new Error(`Translation failed: ${result.error}`);
        }

        bridgedMessage = result.message;
      }

      const targetSystem = direction === 'source-to-target' ? this.targetSystem : this.sourceSystem;
      const targetChannel = this.getTargetChannel(sourceChannel, direction);

      if (!targetSystem.channels.has(targetChannel)) {
        targetSystem.createChannel(targetChannel);
      }

      targetSystem.publish(targetChannel, bridgedMessage);

      this.bridgedCount++;

      if (this.enableLogging) {
        console.log(`Bridged message ${message.id} from ${message.system}/${sourceChannel} to ${targetSystem.name}/${targetChannel}`);
      }

      this.emit('messageBridged', {
        message,
        direction,
        sourceChannel,
        targetChannel,
        targetSystem: targetSystem.name
      });

      return {
        success: true,
        message: bridgedMessage,
        targetChannel
      };

    } catch (error) {
      this.failedCount++;

      if (this.enableLogging) {
        console.error(`Failed to bridge message ${message.id}:`, error);
      }

      this.emit('bridgeError', {
        message,
        direction,
        error
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  getTargetChannel(sourceChannel, direction) {
    return sourceChannel;
  }

  addSourceChannel(channelName) {
    if (!this.sourceChannels.includes(channelName)) {
      this.sourceChannels.push(channelName);

      if (this.isActive) {
        this.sourceSystem.subscribe(channelName, (msg) => {
          this.bridgeMessage(msg, 'source-to-target', channelName);
        });
      }

      this.emit('sourceChannelAdded', channelName);
    }
  }

  addTargetChannel(channelName) {
    if (!this.targetChannels.includes(channelName)) {
      this.targetChannels.push(channelName);

      if (this.isActive && this.bidirectional) {
        this.targetSystem.subscribe(channelName, (msg) => {
          this.bridgeMessage(msg, 'target-to-source', channelName);
        });
      }

      this.emit('targetChannelAdded', channelName);
    }
  }

  getStats() {
    return {
      sourceSystem: this.sourceSystem.name,
      targetSystem: this.targetSystem.name,
      isActive: this.isActive,
      bidirectional: this.bidirectional,
      sourceChannels: this.sourceChannels,
      targetChannels: this.targetChannels,
      bridgedCount: this.bridgedCount,
      failedCount: this.failedCount,
      translator: this.translator ? this.translator.getStats() : null,
      sourceSys temStats: this.sourceSystem.getStats(),
      targetSystemStats: this.targetSystem.getStats()
    };
  }

  reset() {
    this.bridgedCount = 0;
    this.failedCount = 0;
    this.emit('reset');
  }
}

function demonstrateMessageBridge() {
  console.log('=== Message Bridge Pattern Demo ===\n');

  const legacySystem = new MessagingSystem('LegacySystem', {
    messageFormat: 'xml',
    protocol: 'soap'
  });

  const modernSystem = new MessagingSystem('ModernSystem', {
    messageFormat: 'json',
    protocol: 'rest'
  });

  const translator = new MessageTranslator('xml-to-json', (message, direction) => {
    if (direction === 'source-to-target') {
      const translated = new Message(
        message.id,
        {
          ...message.payload,
          _translatedFrom: 'xml',
          _translatedTo: 'json'
        },
        { ...message.headers, format: 'json' }
      );
      return translated;
    } else {
      const translated = new Message(
        message.id,
        {
          ...message.payload,
          _translatedFrom: 'json',
          _translatedTo: 'xml'
        },
        { ...message.headers, format: 'xml' }
      );
      return translated;
    }
  });

  const bridge = new MessageBridge(legacySystem, modernSystem, {
    translator,
    sourceChannels: ['orders', 'customers'],
    targetChannels: ['events'],
    bidirectional: true,
    enableLogging: true
  });

  modernSystem.subscribe('orders', (msg) => {
    console.log(`[MODERN] Received order: ${JSON.stringify(msg.payload)}`);
  });

  modernSystem.subscribe('customers', (msg) => {
    console.log(`[MODERN] Received customer: ${JSON.stringify(msg.payload)}`);
  });

  legacySystem.subscribe('events', (msg) => {
    console.log(`[LEGACY] Received event: ${JSON.stringify(msg.payload)}`);
  });

  bridge.start();

  console.log('\nPublishing messages...\n');

  legacySystem.publish('orders', new Message('ORDER-001', {
    orderId: 'ORD-123',
    amount: 99.99
  }));

  legacySystem.publish('customers', new Message('CUST-001', {
    customerId: 'CUST-456',
    name: 'John Doe'
  }));

  modernSystem.publish('events', new Message('EVENT-001', {
    eventType: 'user.login',
    userId: 'USER-789'
  }));

  console.log('\n=== Bridge Statistics ===');
  console.log(JSON.stringify(bridge.getStats(), null, 2));

  return bridge;
}

module.exports = MessageBridge;
module.exports.Message = Message;
module.exports.MessageTranslator = MessageTranslator;
module.exports.MessagingSystem = MessagingSystem;
module.exports.demonstrate = demonstrateMessageBridge;

if (require.main === module) {
  demonstrateMessageBridge();
}
