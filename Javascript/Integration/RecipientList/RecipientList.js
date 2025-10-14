/**
 * RecipientList Pattern
 *
 * Routes a message to a list of dynamically specified recipients.
 * Each recipient receives a copy of the message. The recipient list
 * can be static or determined at runtime based on message content
 * or external configuration.
 *
 * Key Components:
 * - RecipientList: Main routing component
 * - Recipient: Individual message receiver
 * - MessageBroker: Pub/sub infrastructure
 * - RecipientSelector: Logic for selecting recipients
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
    this.deliveryAttempts = [];
  }

  addDeliveryAttempt(recipientId, success, error = null) {
    this.deliveryAttempts.push({
      recipientId,
      success,
      error,
      timestamp: Date.now()
    });
  }

  clone() {
    const cloned = new Message(this.id, { ...this.payload }, { ...this.headers });
    cloned.timestamp = this.timestamp;
    cloned.deliveryAttempts = [...this.deliveryAttempts];
    return cloned;
  }

  getDeliveryStats() {
    const successful = this.deliveryAttempts.filter(a => a.success).length;
    const failed = this.deliveryAttempts.filter(a => !a.success).length;
    return { successful, failed, total: this.deliveryAttempts.length };
  }
}

/**
 * Recipient class representing a message receiver
 */
class Recipient extends EventEmitter {
  constructor(id, handler, options = {}) {
    super();
    this.id = id;
    this.handler = handler;
    this.isActive = options.isActive !== undefined ? options.isActive : true;
    this.priority = options.priority || 0;
    this.filter = options.filter || null;
    this.metadata = options.metadata || {};
    this.receivedCount = 0;
    this.failedCount = 0;
    this.processingTime = [];
  }

  canReceive(message) {
    if (!this.isActive) {
      return false;
    }

    if (this.filter) {
      try {
        return this.filter(message);
      } catch (error) {
        console.error(`Filter error for recipient ${this.id}:`, error);
        return false;
      }
    }

    return true;
  }

  async receive(message) {
    const startTime = Date.now();

    try {
      await this.handler(message.clone());

      const duration = Date.now() - startTime;
      this.processingTime.push(duration);
      this.receivedCount++;

      this.emit('messageReceived', { message, duration });

      return { success: true, duration };
    } catch (error) {
      this.failedCount++;
      this.emit('messageError', { message, error });

      return { success: false, error: error.message };
    }
  }

  activate() {
    this.isActive = true;
    this.emit('activated');
  }

  deactivate() {
    this.isActive = false;
    this.emit('deactivated');
  }

  getStats() {
    const avgProcessingTime = this.processingTime.length > 0
      ? this.processingTime.reduce((a, b) => a + b, 0) / this.processingTime.length
      : 0;

    return {
      id: this.id,
      isActive: this.isActive,
      priority: this.priority,
      receivedCount: this.receivedCount,
      failedCount: this.failedCount,
      avgProcessingTime: avgProcessingTime.toFixed(2),
      metadata: this.metadata
    };
  }
}

/**
 * RecipientSelector - Determines which recipients receive a message
 */
class RecipientSelector {
  constructor() {
    this.strategies = new Map();
  }

  registerStrategy(name, strategy) {
    this.strategies.set(name, strategy);
  }

  select(recipients, message, strategyName = 'all') {
    const strategy = this.strategies.get(strategyName);

    if (!strategy) {
      return recipients.filter(r => r.canReceive(message));
    }

    return strategy(recipients, message);
  }

  // Built-in strategies
  static getAllStrategy() {
    return (recipients, message) => recipients.filter(r => r.canReceive(message));
  }

  static getPriorityStrategy(minPriority) {
    return (recipients, message) =>
      recipients.filter(r => r.canReceive(message) && r.priority >= minPriority);
  }

  static getRandomStrategy(count) {
    return (recipients, message) => {
      const eligible = recipients.filter(r => r.canReceive(message));
      const shuffled = eligible.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    };
  }

  static getRoundRobinStrategy() {
    let index = 0;
    return (recipients, message) => {
      const eligible = recipients.filter(r => r.canReceive(message));
      if (eligible.length === 0) return [];

      const selected = eligible[index % eligible.length];
      index++;
      return [selected];
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
 * RecipientList - Main routing component
 */
class RecipientList extends EventEmitter {
  constructor(options = {}) {
    super();
    this.recipients = [];
    this.broker = options.broker || new MessageBroker();
    this.selector = options.selector || new RecipientSelector();
    this.defaultStrategy = options.defaultStrategy || 'all';
    this.parallelExecution = options.parallelExecution !== undefined ? options.parallelExecution : true;
    this.continueOnError = options.continueOnError !== undefined ? options.continueOnError : true;
    this.enableLogging = options.enableLogging !== undefined ? options.enableLogging : true;
    this.processedMessageCount = 0;
    this.failedMessageCount = 0;

    // Register default strategies
    this.selector.registerStrategy('all', RecipientSelector.getAllStrategy());
    this.selector.registerStrategy('priority-high', RecipientSelector.getPriorityStrategy(10));
    this.selector.registerStrategy('random-3', RecipientSelector.getRandomStrategy(3));
    this.selector.registerStrategy('round-robin', RecipientSelector.getRoundRobinStrategy());
  }

  addRecipient(id, handler, options = {}) {
    const recipient = new Recipient(id, handler, options);
    this.recipients.push(recipient);
    this.emit('recipientAdded', recipient);
    return recipient;
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

  getRecipient(id) {
    return this.recipients.find(r => r.id === id);
  }

  async sendToRecipients(message, strategyName = null) {
    const strategy = strategyName || this.defaultStrategy;

    try {
      const selectedRecipients = this.selector.select(this.recipients, message, strategy);

      if (selectedRecipients.length === 0) {
        if (this.enableLogging) {
          console.log(`No recipients selected for message ${message.id}`);
        }
        return {
          success: true,
          delivered: 0,
          failed: 0,
          recipients: []
        };
      }

      if (this.enableLogging) {
        console.log(`Sending message ${message.id} to ${selectedRecipients.length} recipient(s)`);
      }

      let results;
      if (this.parallelExecution) {
        results = await this.sendParallel(message, selectedRecipients);
      } else {
        results = await this.sendSequential(message, selectedRecipients);
      }

      const delivered = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      this.processedMessageCount++;
      if (failed > 0) {
        this.failedMessageCount++;
      }

      this.emit('messageSent', {
        message,
        delivered,
        failed,
        recipients: selectedRecipients.map(r => r.id)
      });

      return {
        success: true,
        delivered,
        failed,
        recipients: selectedRecipients.map(r => r.id),
        results
      };

    } catch (error) {
      this.failedMessageCount++;
      this.emit('sendError', { message, error });

      if (this.enableLogging) {
        console.error(`Error sending message ${message.id}:`, error);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendParallel(message, recipients) {
    const promises = recipients.map(async recipient => {
      const result = await recipient.receive(message);
      message.addDeliveryAttempt(recipient.id, result.success, result.error);
      return { recipientId: recipient.id, ...result };
    });

    return Promise.all(promises);
  }

  async sendSequential(message, recipients) {
    const results = [];

    for (const recipient of recipients) {
      const result = await recipient.receive(message);
      message.addDeliveryAttempt(recipient.id, result.success, result.error);
      results.push({ recipientId: recipient.id, ...result });

      if (!result.success && !this.continueOnError) {
        break;
      }
    }

    return results;
  }

  registerStrategy(name, strategy) {
    this.selector.registerStrategy(name, strategy);
  }

  getRecipientStats() {
    return this.recipients.map(r => r.getStats());
  }

  getStats() {
    return {
      totalRecipients: this.recipients.length,
      activeRecipients: this.recipients.filter(r => r.isActive).length,
      processedMessages: this.processedMessageCount,
      failedMessages: this.failedMessageCount,
      parallelExecution: this.parallelExecution,
      continueOnError: this.continueOnError,
      recipients: this.getRecipientStats(),
      broker: this.broker.getStats()
    };
  }

  reset() {
    this.recipients = [];
    this.processedMessageCount = 0;
    this.failedMessageCount = 0;
    this.emit('reset');
  }
}

// Example usage and demonstration
async function demonstrateRecipientList() {
  console.log('=== Recipient List Pattern Demo ===\n');

  const recipientList = new RecipientList({
    parallelExecution: true,
    continueOnError: true,
    enableLogging: true
  });

  // Add recipients
  recipientList.addRecipient('email-service', async (msg) => {
    console.log(`[EMAIL] Sending email for: ${msg.payload.subject}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }, { priority: 10 });

  recipientList.addRecipient('sms-service', async (msg) => {
    console.log(`[SMS] Sending SMS for: ${msg.payload.subject}`);
    await new Promise(resolve => setTimeout(resolve, 50));
  }, { priority: 8, filter: (msg) => msg.headers.smsEnabled === true });

  recipientList.addRecipient('push-notification', async (msg) => {
    console.log(`[PUSH] Sending push notification for: ${msg.payload.subject}`);
    await new Promise(resolve => setTimeout(resolve, 75));
  }, { priority: 5 });

  recipientList.addRecipient('analytics', async (msg) => {
    console.log(`[ANALYTICS] Tracking event: ${msg.payload.type}`);
    await new Promise(resolve => setTimeout(resolve, 25));
  }, { priority: 3 });

  recipientList.addRecipient('audit-log', async (msg) => {
    console.log(`[AUDIT] Logging message: ${msg.id}`);
    await new Promise(resolve => setTimeout(resolve, 30));
  }, { priority: 15 });

  // Send messages
  console.log('Sending notification with all recipients...\n');
  const msg1 = new Message('MSG-001', {
    type: 'notification',
    subject: 'Welcome to our service',
    body: 'Thank you for signing up'
  }, { smsEnabled: true });

  await recipientList.sendToRecipients(msg1);

  console.log('\nSending alert without SMS...\n');
  const msg2 = new Message('MSG-002', {
    type: 'alert',
    subject: 'Security alert',
    body: 'Suspicious activity detected'
  }, { smsEnabled: false });

  await recipientList.sendToRecipients(msg2);

  console.log('\nSending with priority strategy...\n');
  const msg3 = new Message('MSG-003', {
    type: 'urgent',
    subject: 'Urgent notification',
    body: 'Immediate action required'
  });

  await recipientList.sendToRecipients(msg3, 'priority-high');

  // Display stats
  console.log('\n=== Recipient List Statistics ===');
  console.log(JSON.stringify(recipientList.getStats(), null, 2));

  return recipientList;
}

// Export classes
module.exports = RecipientList;
module.exports.Message = Message;
module.exports.Recipient = Recipient;
module.exports.RecipientSelector = RecipientSelector;
module.exports.MessageBroker = MessageBroker;
module.exports.demonstrate = demonstrateRecipientList;

// Run demo if executed directly
if (require.main === module) {
  demonstrateRecipientList().catch(console.error);
}
