/**
 * Publish-Subscribe Pattern
 *
 * Decouples publishers from subscribers using topics/channels. Publishers
 * send messages to topics without knowledge of subscribers. Subscribers
 * register interest in topics and receive relevant messages.
 *
 * Key Components:
 * - Publisher: Sends messages to topics
 * - Subscriber: Receives messages from topics
 * - Topic: Named channel for messages
 * - MessageBroker: Central coordinator
 */

const EventEmitter = require('events');

class Message {
  constructor(id, topic, payload, headers = {}) {
    this.id = id;
    this.topic = topic;
    this.payload = payload;
    this.headers = headers;
    this.timestamp = Date.now();
    this.publisherId = headers.publisherId || null;
  }

  clone() {
    const cloned = new Message(this.id, this.topic, { ...this.payload }, { ...this.headers });
    cloned.timestamp = this.timestamp;
    cloned.publisherId = this.publisherId;
    return cloned;
  }
}

class Topic extends EventEmitter {
  constructor(name, options = {}) {
    super();
    this.name = name;
    this.subscribers = new Set();
    this.messageCount = 0;
    this.messageHistory = [];
    this.retainMessages = options.retainMessages || false;
    this.maxRetainedMessages = options.maxRetainedMessages || 100;
    this.filter = options.filter || null;
  }

  subscribe(subscriber) {
    this.subscribers.add(subscriber);
    this.emit('subscribed', subscriber);

    if (this.retainMessages && this.messageHistory.length > 0) {
      this.messageHistory.forEach(msg => subscriber.receive(msg));
    }
  }

  unsubscribe(subscriber) {
    this.subscribers.delete(subscriber);
    this.emit('unsubscribed', subscriber);
  }

  publish(message) {
    if (this.filter && !this.filter(message)) {
      return { delivered: 0, filtered: true };
    }

    this.messageCount++;

    if (this.retainMessages) {
      this.messageHistory.push(message);
      if (this.messageHistory.length > this.maxRetainedMessages) {
        this.messageHistory.shift();
      }
    }

    let delivered = 0;
    this.subscribers.forEach(subscriber => {
      try {
        subscriber.receive(message);
        delivered++;
      } catch (error) {
        console.error(`Error delivering to subscriber:`, error);
      }
    });

    this.emit('messagePublished', { message, delivered });
    return { delivered, filtered: false };
  }

  getStats() {
    return {
      name: this.name,
      subscriberCount: this.subscribers.size,
      messageCount: this.messageCount,
      retainedMessages: this.messageHistory.length
    };
  }
}

class Publisher {
  constructor(id, broker) {
    this.id = id;
    this.broker = broker;
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
    return this.broker.publish(topic, message);
  }

  getStats() {
    return {
      id: this.id,
      publishCount: this.publishCount
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

class MessageBroker extends EventEmitter {
  constructor(options = {}) {
    super();
    this.topics = new Map();
    this.publishers = new Map();
    this.subscribers = new Map();
    this.messageLog = [];
    this.maxLogSize = options.maxLogSize || 10000;
    this.allowWildcards = options.allowWildcards !== undefined ? options.allowWildcards : true;
  }

  createTopic(name, options = {}) {
    if (this.topics.has(name)) {
      throw new Error(`Topic ${name} already exists`);
    }

    const topic = new Topic(name, options);
    this.topics.set(name, topic);
    this.emit('topicCreated', topic);
    return topic;
  }

  getTopic(name) {
    return this.topics.get(name);
  }

  getOrCreateTopic(name, options = {}) {
    return this.getTopic(name) || this.createTopic(name, options);
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

  subscribe(subscriberId, topicName) {
    const subscriber = this.subscribers.get(subscriberId);
    if (!subscriber) {
      throw new Error(`Subscriber ${subscriberId} not found`);
    }

    const topic = this.getOrCreateTopic(topicName);
    topic.subscribe(subscriber);

    this.emit('subscribed', { subscriberId, topicName });
  }

  unsubscribe(subscriberId, topicName) {
    const subscriber = this.subscribers.get(subscriberId);
    const topic = this.topics.get(topicName);

    if (subscriber && topic) {
      topic.unsubscribe(subscriber);
      this.emit('unsubscribed', { subscriberId, topicName });
    }
  }

  publish(topicName, message) {
    const topic = this.getTopic(topicName);
    if (!topic) {
      throw new Error(`Topic ${topicName} does not exist`);
    }

    this.logMessage(topicName, message);
    const result = topic.publish(message);

    this.emit('messagePublished', { topicName, message, result });
    return result;
  }

  publishToPattern(pattern, message) {
    const matchingTopics = this.findTopicsByPattern(pattern);
    const results = {};

    matchingTopics.forEach(topicName => {
      results[topicName] = this.publish(topicName, message);
    });

    return results;
  }

  findTopicsByPattern(pattern) {
    if (!this.allowWildcards) {
      return this.topics.has(pattern) ? [pattern] : [];
    }

    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    return Array.from(this.topics.keys()).filter(name => regex.test(name));
  }

  logMessage(topicName, message) {
    this.messageLog.push({
      topic: topicName,
      messageId: message.id,
      timestamp: Date.now()
    });

    if (this.messageLog.length > this.maxLogSize) {
      this.messageLog.shift();
    }
  }

  getStats() {
    const stats = {
      totalTopics: this.topics.size,
      totalPublishers: this.publishers.size,
      totalSubscribers: this.subscribers.size,
      totalMessages: this.messageLog.length,
      topics: {},
      publishers: {},
      subscribers: {}
    };

    this.topics.forEach((topic, name) => {
      stats.topics[name] = topic.getStats();
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
    this.topics.clear();
    this.publishers.clear();
    this.subscribers.clear();
    this.messageLog = [];
    this.emit('reset');
  }
}

function demonstratePublishSubscribe() {
  console.log('=== Publish-Subscribe Pattern Demo ===\n');

  const broker = new MessageBroker({ allowWildcards: true });

  // Create topics
  broker.createTopic('orders.created');
  broker.createTopic('orders.updated');
  broker.createTopic('orders.deleted');
  broker.createTopic('users.registered');
  broker.createTopic('users.login');

  // Create publishers
  const orderService = broker.createPublisher('order-service');
  const userService = broker.createPublisher('user-service');

  // Create subscribers
  const emailSubscriber = broker.createSubscriber('email-service', (msg) => {
    console.log(`[EMAIL] Processing ${msg.topic}: ${JSON.stringify(msg.payload)}`);
  });

  const analyticsSubscriber = broker.createSubscriber('analytics-service', (msg) => {
    console.log(`[ANALYTICS] Tracking ${msg.topic}: ${JSON.stringify(msg.payload)}`);
  });

  const auditSubscriber = broker.createSubscriber('audit-service', (msg) => {
    console.log(`[AUDIT] Logging ${msg.topic} from ${msg.publisherId}`);
  });

  // Subscribe to topics
  broker.subscribe('email-service', 'orders.created');
  broker.subscribe('email-service', 'users.registered');

  broker.subscribe('analytics-service', 'orders.created');
  broker.subscribe('analytics-service', 'orders.updated');
  broker.subscribe('analytics-service', 'users.login');

  broker.subscribe('audit-service', 'orders.created');
  broker.subscribe('audit-service', 'orders.updated');
  broker.subscribe('audit-service', 'orders.deleted');

  // Publish messages
  console.log('Publishing messages...\n');

  orderService.publish('orders.created', {
    orderId: 'ORD-001',
    amount: 100.00,
    customerId: 'CUST-123'
  });

  orderService.publish('orders.updated', {
    orderId: 'ORD-001',
    status: 'shipped'
  });

  userService.publish('users.registered', {
    userId: 'USER-456',
    email: 'user@example.com'
  });

  userService.publish('users.login', {
    userId: 'USER-456',
    timestamp: Date.now()
  });

  // Display stats
  console.log('\n=== Broker Statistics ===');
  console.log(JSON.stringify(broker.getStats(), null, 2));

  return broker;
}

module.exports = MessageBroker;
module.exports.Message = Message;
module.exports.Topic = Topic;
module.exports.Publisher = Publisher;
module.exports.Subscriber = Subscriber;
module.exports.demonstrate = demonstratePublishSubscribe;

if (require.main === module) {
  demonstratePublishSubscribe();
}
