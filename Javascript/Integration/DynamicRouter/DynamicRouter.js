/**
 * DynamicRouter Pattern
 *
 * Routes messages to different channels based on dynamic routing rules
 * that can be evaluated at runtime. Unlike static routers, the routing
 * logic can change based on message content, system state, or external
 * configuration.
 *
 * Key Components:
 * - Router: Core routing engine
 * - RoutingRule: Defines routing conditions
 * - Channel: Destination for routed messages
 * - MessageBroker: Pub/sub infrastructure
 */

const EventEmitter = require('events');

/**
 * Message class representing messages in the routing system
 */
class Message {
  constructor(id, payload, headers = {}) {
    this.id = id;
    this.payload = payload;
    this.headers = headers;
    this.timestamp = Date.now();
    this.routingHistory = [];
  }

  addRoutingEntry(channelName, routeName) {
    this.routingHistory.push({
      channel: channelName,
      route: routeName,
      timestamp: Date.now()
    });
  }

  clone() {
    const cloned = new Message(this.id, { ...this.payload }, { ...this.headers });
    cloned.timestamp = this.timestamp;
    cloned.routingHistory = [...this.routingHistory];
    return cloned;
  }
}

/**
 * Channel class representing a destination for messages
 */
class Channel extends EventEmitter {
  constructor(name, options = {}) {
    super();
    this.name = name;
    this.options = options;
    this.messageCount = 0;
    this.isActive = true;
    this.messages = [];
    this.maxMessages = options.maxMessages || 1000;
  }

  send(message) {
    if (!this.isActive) {
      throw new Error(`Channel ${this.name} is not active`);
    }

    this.messageCount++;
    this.messages.push(message);

    // Maintain max message buffer
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    this.emit('message', message);
    return true;
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
    return {
      name: this.name,
      messageCount: this.messageCount,
      isActive: this.isActive,
      bufferSize: this.messages.length
    };
  }
}

/**
 * RoutingRule class representing a single routing rule
 */
class RoutingRule {
  constructor(name, condition, targetChannel, options = {}) {
    this.name = name;
    this.condition = condition;
    this.targetChannel = targetChannel;
    this.priority = options.priority || 0;
    this.isActive = options.isActive !== undefined ? options.isActive : true;
    this.matchCount = 0;
    this.metadata = options.metadata || {};
  }

  evaluate(message, context = {}) {
    if (!this.isActive) {
      return false;
    }

    try {
      const result = this.condition(message, context);
      if (result) {
        this.matchCount++;
      }
      return result;
    } catch (error) {
      console.error(`Error evaluating rule ${this.name}:`, error);
      return false;
    }
  }

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }

  getStats() {
    return {
      name: this.name,
      priority: this.priority,
      isActive: this.isActive,
      matchCount: this.matchCount,
      metadata: this.metadata
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
    this.subscriptions = new Map();
    this.messageLog = [];
    this.maxLogSize = 10000;
  }

  createChannel(name, options = {}) {
    if (this.channels.has(name)) {
      throw new Error(`Channel ${name} already exists`);
    }

    const channel = new Channel(name, options);
    this.channels.set(name, channel);
    this.emit('channelCreated', channel);
    return channel;
  }

  getChannel(name) {
    return this.channels.get(name);
  }

  subscribe(channelName, handler) {
    const channel = this.channels.get(channelName);
    if (!channel) {
      throw new Error(`Channel ${channelName} does not exist`);
    }

    channel.on('message', handler);

    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, []);
    }
    this.subscriptions.get(channelName).push(handler);

    return () => this.unsubscribe(channelName, handler);
  }

  unsubscribe(channelName, handler) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.off('message', handler);
    }

    const subs = this.subscriptions.get(channelName);
    if (subs) {
      const index = subs.indexOf(handler);
      if (index > -1) {
        subs.splice(index, 1);
      }
    }
  }

  publish(channelName, message) {
    const channel = this.channels.get(channelName);
    if (!channel) {
      throw new Error(`Channel ${channelName} does not exist`);
    }

    this.logMessage(channelName, message);
    return channel.send(message);
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
      stats.channels[name] = channel.getStats();
    });

    return stats;
  }
}

/**
 * DynamicRouter - Main router class
 */
class DynamicRouter extends EventEmitter {
  constructor(options = {}) {
    super();
    this.broker = options.broker || new MessageBroker();
    this.rules = [];
    this.defaultChannel = options.defaultChannel || 'default';
    this.context = options.context || {};
    this.routedMessageCount = 0;
    this.failedMessageCount = 0;
    this.enableLogging = options.enableLogging !== undefined ? options.enableLogging : true;

    // Create default channel if it doesn't exist
    if (!this.broker.getChannel(this.defaultChannel)) {
      this.broker.createChannel(this.defaultChannel);
    }
  }

  addRule(name, condition, targetChannel, options = {}) {
    const rule = new RoutingRule(name, condition, targetChannel, options);
    this.rules.push(rule);
    this.sortRules();
    this.emit('ruleAdded', rule);
    return rule;
  }

  removeRule(name) {
    const index = this.rules.findIndex(rule => rule.name === name);
    if (index > -1) {
      const rule = this.rules.splice(index, 1)[0];
      this.emit('ruleRemoved', rule);
      return true;
    }
    return false;
  }

  sortRules() {
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  updateContext(updates) {
    Object.assign(this.context, updates);
    this.emit('contextUpdated', this.context);
  }

  route(message) {
    try {
      const matchedRules = this.findMatchingRules(message);

      if (matchedRules.length === 0) {
        return this.routeToDefault(message);
      }

      // Route to all matching channels
      const routedChannels = [];
      for (const rule of matchedRules) {
        const channel = rule.targetChannel;

        // Ensure channel exists
        if (!this.broker.getChannel(channel)) {
          this.broker.createChannel(channel);
        }

        // Clone message for each route
        const routedMessage = message.clone();
        routedMessage.addRoutingEntry(channel, rule.name);

        this.broker.publish(channel, routedMessage);
        routedChannels.push(channel);

        if (this.enableLogging) {
          console.log(`Routed message ${message.id} to ${channel} via rule ${rule.name}`);
        }
      }

      this.routedMessageCount++;
      this.emit('messageRouted', {
        message,
        channels: routedChannels,
        rules: matchedRules.map(r => r.name)
      });

      return {
        success: true,
        channels: routedChannels,
        rules: matchedRules.map(r => r.name)
      };

    } catch (error) {
      this.failedMessageCount++;
      this.emit('routingError', { message, error });

      if (this.enableLogging) {
        console.error(`Failed to route message ${message.id}:`, error);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  findMatchingRules(message) {
    return this.rules.filter(rule => rule.evaluate(message, this.context));
  }

  routeToDefault(message) {
    const routedMessage = message.clone();
    routedMessage.addRoutingEntry(this.defaultChannel, 'default');

    this.broker.publish(this.defaultChannel, routedMessage);
    this.routedMessageCount++;

    if (this.enableLogging) {
      console.log(`Routed message ${message.id} to default channel`);
    }

    this.emit('messageRouted', {
      message,
      channels: [this.defaultChannel],
      rules: ['default']
    });

    return {
      success: true,
      channels: [this.defaultChannel],
      rules: ['default']
    };
  }

  getRuleStats() {
    return this.rules.map(rule => rule.getStats());
  }

  getStats() {
    return {
      totalRules: this.rules.length,
      activeRules: this.rules.filter(r => r.isActive).length,
      routedMessages: this.routedMessageCount,
      failedMessages: this.failedMessageCount,
      broker: this.broker.getStats(),
      rules: this.getRuleStats()
    };
  }

  reset() {
    this.rules = [];
    this.routedMessageCount = 0;
    this.failedMessageCount = 0;
    this.context = {};
    this.emit('reset');
  }
}

// Example usage and demonstration
function demonstrateDynamicRouter() {
  console.log('=== Dynamic Router Pattern Demo ===\n');

  // Create router with custom broker
  const router = new DynamicRouter({
    defaultChannel: 'unmatched',
    enableLogging: true
  });

  // Create channels
  router.broker.createChannel('orders');
  router.broker.createChannel('notifications');
  router.broker.createChannel('analytics');
  router.broker.createChannel('high-priority');
  router.broker.createChannel('errors');

  // Add routing rules
  router.addRule(
    'orderRoute',
    (msg) => msg.payload.type === 'order',
    'orders',
    { priority: 10 }
  );

  router.addRule(
    'notificationRoute',
    (msg) => msg.payload.type === 'notification',
    'notifications',
    { priority: 10 }
  );

  router.addRule(
    'highPriorityRoute',
    (msg) => msg.headers.priority === 'high',
    'high-priority',
    { priority: 20 }
  );

  router.addRule(
    'errorRoute',
    (msg) => msg.payload.status === 'error',
    'errors',
    { priority: 15 }
  );

  router.addRule(
    'analyticsRoute',
    (msg, context) => context.analyticsEnabled === true,
    'analytics',
    { priority: 5 }
  );

  // Subscribe to channels
  router.broker.subscribe('orders', (msg) => {
    console.log(`[ORDERS] Received: ${msg.id} - ${JSON.stringify(msg.payload)}`);
  });

  router.broker.subscribe('high-priority', (msg) => {
    console.log(`[HIGH-PRIORITY] Received: ${msg.id} - ${JSON.stringify(msg.payload)}`);
  });

  router.broker.subscribe('analytics', (msg) => {
    console.log(`[ANALYTICS] Received: ${msg.id} - ${JSON.stringify(msg.payload)}`);
  });

  // Enable analytics
  router.updateContext({ analyticsEnabled: true });

  // Route messages
  console.log('\nRouting messages...\n');

  const msg1 = new Message('MSG-001', { type: 'order', amount: 100 });
  router.route(msg1);

  const msg2 = new Message('MSG-002', { type: 'order', status: 'error' }, { priority: 'high' });
  router.route(msg2);

  const msg3 = new Message('MSG-003', { type: 'notification', text: 'Hello' });
  router.route(msg3);

  const msg4 = new Message('MSG-004', { type: 'unknown' });
  router.route(msg4);

  // Display stats
  console.log('\n=== Router Statistics ===');
  console.log(JSON.stringify(router.getStats(), null, 2));

  return router;
}

// Export classes
module.exports = DynamicRouter;
module.exports.Message = Message;
module.exports.Channel = Channel;
module.exports.RoutingRule = RoutingRule;
module.exports.MessageBroker = MessageBroker;
module.exports.demonstrate = demonstrateDynamicRouter;

// Run demo if executed directly
if (require.main === module) {
  demonstrateDynamicRouter();
}
