/**
 * Message Bus Pattern
 *
 * Central communication channel that allows multiple components to send and
 * receive messages without knowing about each other. Provides routing,
 * transformation, and orchestration capabilities.
 *
 * Key Components:
 * - MessageBus: Central messaging infrastructure
 * - Channel: Topic/queue for messages
 * - Subscriber: Message consumer
 * - Publisher: Message producer
 * - MessageRouter: Routes messages to appropriate channels
 */

const EventEmitter = require('events');

class Message {
  constructor(id, topic, payload, headers = {}) {
    this.id = id;
    this.topic = topic;
    this.payload = payload;
    this.headers = headers;
    this.timestamp = Date.now();
    this.routingKey = headers.routingKey || topic;
  }

  clone() {
    const cloned = new Message(this.id, this.topic, { ...this.payload }, { ...this.headers });
    cloned.timestamp = this.timestamp;
    cloned.routingKey = this.routingKey;
    return cloned;
  }
}

class Channel extends EventEmitter {
  constructor(name, options = {}) {
    super();
    this.name = name;
    this.type = options.type || 'topic';
    this.subscribers = new Set();
    this.messageCount = 0;
    this.messageHistory = [];
    this.maxHistorySize = options.maxHistorySize || 100;
    this.persistent = options.persistent || false;
    this.durable = options.durable || false;
  }

  subscribe(subscriber) {
    this.subscribers.add(subscriber);
    this.emit('subscribed', subscriber);
  }

  unsubscribe(subscriber) {
    this.subscribers.delete(subscriber);
    this.emit('unsubscribed', subscriber);
  }

  publish(message) {
    this.messageCount++;

    if (this.persistent) {
      this.messageHistory.push({
        id: message.id,
        timestamp: message.timestamp,
        payload: message.payload
      });

      if (this.messageHistory.length > this.maxHistorySize) {
        this.messageHistory.shift();
      }
    }

    let deliveredCount = 0;
    this.subscribers.forEach(subscriber => {
      try {
        subscriber.receive(message);
        deliveredCount++;
      } catch (error) {
        console.error(`Error delivering to subscriber:`, error);
      }
    });

    this.emit('messagePublished', { message, deliveredCount });

    return { delivered: deliveredCount, total: this.subscribers.size };
  }

  getStats() {
    return {
      name: this.name,
      type: this.type,
      subscriberCount: this.subscribers.size,
      messageCount: this.messageCount,
      historySize: this.messageHistory.length,
      persistent: this.persistent,
      durable: this.durable
    };
  }
}

class Subscriber extends EventEmitter {
  constructor(id, handler, options = {}) {
    super();
    this.id = id;
    this.handler = handler;
    this.filter = options.filter || null;
    this.receiveCount = 0;
    this.errorCount = 0;
  }

  receive(message) {
    if (this.filter && !this.filter(message)) {
      return;
    }

    try {
      this.handler(message);
      this.receiveCount++;
      this.emit('messageReceived', message);
    } catch (error) {
      this.errorCount++;
      this.emit('error', { message, error });
      throw error;
    }
  }

  getStats() {
    return {
      id: this.id,
      receiveCount: this.receiveCount,
      errorCount: this.errorCount
    };
  }
}

class Publisher {
  constructor(id, bus) {
    this.id = id;
    this.bus = bus;
    this.publishCount = 0;
  }

  publish(topic, payload, headers = {}) {
    const message = new Message(
      `${this.id}-${Date.now()}-${this.publishCount}`,
      topic,
      payload,
      { ...headers, publisherId: this.id }
    );

    this.publishCount++;
    return this.bus.publish(topic, message);
  }

  getStats() {
    return {
      id: this.id,
      publishCount: this.publishCount
    };
  }
}

class MessageRouter {
  constructor() {
    this.routes = [];
  }

  addRoute(pattern, targetTopic, transformer = null) {
    this.routes.push({
      pattern: this.compilePattern(pattern),
      targetTopic,
      transformer
    });
  }

  compilePattern(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    return regex;
  }

  route(message) {
    const routes = [];

    for (const route of this.routes) {
      if (route.pattern.test(message.topic)) {
        let routedMessage = message;

        if (route.transformer) {
          routedMessage = route.transformer(message);
        }

        routes.push({
          topic: route.targetTopic,
          message: routedMessage
        });
      }
    }

    return routes;
  }
}

class MessageBus extends EventEmitter {
  constructor(options = {}) {
    super();
    this.channels = new Map();
    this.subscribers = new Map();
    this.publishers = new Map();
    this.router = new MessageRouter();
    this.messageLog = [];
    this.maxLogSize = options.maxLogSize || 10000;
    this.enableRouting = options.enableRouting !== undefined ? options.enableRouting : true;
    this.totalMessages = 0;
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

  getOrCreateChannel(name, options = {}) {
    return this.getChannel(name) || this.createChannel(name, options);
  }

  createPublisher(id) {
    if (this.publishers.has(id)) {
      throw new Error(`Publisher ${id} already exists`);
    }

    const publisher = new Publisher(id, this);
    this.publishers.set(id, publisher);
    this.emit('publisherCreated', publisher);
    return publisher;
  }

  createSubscriber(id, handler, options = {}) {
    if (this.subscribers.has(id)) {
      throw new Error(`Subscriber ${id} already exists`);
    }

    const subscriber = new Subscriber(id, handler, options);
    this.subscribers.set(id, subscriber);
    this.emit('subscriberCreated', subscriber);
    return subscriber;
  }

  subscribe(subscriberId, topic) {
    const subscriber = this.subscribers.get(subscriberId);
    if (!subscriber) {
      throw new Error(`Subscriber ${subscriberId} not found`);
    }

    const channel = this.getOrCreateChannel(topic);
    channel.subscribe(subscriber);

    this.emit('subscribed', { subscriberId, topic });
  }

  unsubscribe(subscriberId, topic) {
    const subscriber = this.subscribers.get(subscriberId);
    const channel = this.channels.get(topic);

    if (subscriber && channel) {
      channel.unsubscribe(subscriber);
      this.emit('unsubscribed', { subscriberId, topic });
    }
  }

  publish(topic, message) {
    this.totalMessages++;
    this.logMessage(topic, message);

    const channel = this.getOrCreateChannel(topic);
    const result = channel.publish(message);

    if (this.enableRouting) {
      const routes = this.router.route(message);

      routes.forEach(route => {
        const routedChannel = this.getOrCreateChannel(route.topic);
        routedChannel.publish(route.message);
      });
    }

    this.emit('messagePublished', { topic, message, result });
    return result;
  }

  addRoute(pattern, targetTopic, transformer = null) {
    this.router.addRoute(pattern, targetTopic, transformer);
    this.emit('routeAdded', { pattern, targetTopic });
  }

  logMessage(topic, message) {
    this.messageLog.push({
      topic,
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
      totalPublishers: this.publishers.size,
      totalSubscribers: this.subscribers.size,
      totalMessages: this.totalMessages,
      messageLogSize: this.messageLog.length,
      channels: {},
      publishers: {},
      subscribers: {}
    };

    this.channels.forEach((channel, name) => {
      stats.channels[name] = channel.getStats();
    });

    this.publishers.forEach((publisher, id) => {
      stats.publishers[id] = publisher.getStats();
    });

    this.subscribers.forEach((subscriber, id) => {
      stats.subscribers[id] = subscriber.getStats();
    });

    return stats;
  }

  reset() {
    this.channels.clear();
    this.publishers.clear();
    this.subscribers.clear();
    this.messageLog = [];
    this.totalMessages = 0;
    this.emit('reset');
  }
}

function demonstrateMessageBus() {
  console.log('=== Message Bus Pattern Demo ===\n');

  const bus = new MessageBus({ enableRouting: true });

  bus.createChannel('orders', { persistent: true });
  bus.createChannel('orders.created', { persistent: true });
  bus.createChannel('orders.updated');
  bus.createChannel('analytics', { persistent: false });
  bus.createChannel('notifications');

  bus.addRoute('orders.*', 'analytics', (msg) => {
    const analyticsMsg = msg.clone();
    analyticsMsg.payload._analyticsTimestamp = Date.now();
    return analyticsMsg;
  });

  bus.addRoute('orders.created', 'notifications', (msg) => {
    const notifMsg = msg.clone();
    notifMsg.payload._notificationType = 'order-confirmation';
    return notifMsg;
  });

  const orderService = bus.createPublisher('order-service');
  const userService = bus.createPublisher('user-service');

  const orderProcessor = bus.createSubscriber('order-processor', (msg) => {
    console.log(`[ORDER-PROCESSOR] Processing: ${JSON.stringify(msg.payload)}`);
  });

  const analyticsService = bus.createSubscriber('analytics-service', (msg) => {
    console.log(`[ANALYTICS] Tracking: ${msg.topic} - ${JSON.stringify(msg.payload)}`);
  });

  const emailService = bus.createSubscriber('email-service', (msg) => {
    console.log(`[EMAIL] Sending notification: ${JSON.stringify(msg.payload)}`);
  });

  const auditService = bus.createSubscriber('audit-service', (msg) => {
    console.log(`[AUDIT] Logging: ${msg.topic} from ${msg.headers.publisherId}`);
  });

  bus.subscribe('order-processor', 'orders.created');
  bus.subscribe('order-processor', 'orders.updated');
  bus.subscribe('analytics-service', 'analytics');
  bus.subscribe('email-service', 'notifications');
  bus.subscribe('audit-service', 'orders.created');
  bus.subscribe('audit-service', 'orders.updated');

  console.log('Publishing messages...\n');

  orderService.publish('orders.created', {
    orderId: 'ORD-001',
    customerId: 'CUST-123',
    amount: 99.99
  });

  orderService.publish('orders.updated', {
    orderId: 'ORD-001',
    status: 'shipped',
    trackingNumber: 'TRACK-001'
  });

  userService.publish('users.registered', {
    userId: 'USER-456',
    email: 'user@example.com'
  });

  console.log('\n=== Message Bus Statistics ===');
  console.log(JSON.stringify(bus.getStats(), null, 2));

  return bus;
}

module.exports = MessageBus;
module.exports.Message = Message;
module.exports.Channel = Channel;
module.exports.Subscriber = Subscriber;
module.exports.Publisher = Publisher;
module.exports.MessageRouter = MessageRouter;
module.exports.demonstrate = demonstrateMessageBus;

if (require.main === module) {
  demonstrateMessageBus();
}
