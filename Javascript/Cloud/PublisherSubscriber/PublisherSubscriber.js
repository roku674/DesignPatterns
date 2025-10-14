/**
 * Publisher-Subscriber (Pub/Sub) Pattern
 *
 * Decouples message producers (publishers) from message consumers (subscribers)
 * through a message broker. Publishers send messages to topics, and subscribers
 * receive messages from topics they're interested in.
 *
 * Benefits:
 * - Loose coupling: Publishers and subscribers don't need to know about each other
 * - Scalability: Add subscribers without affecting publishers
 * - Flexibility: Dynamic subscription management
 * - Broadcast: One message can reach multiple subscribers
 *
 * Use Cases:
 * - Event-driven architectures
 * - Microservices communication
 * - Real-time notifications
 * - Data distribution systems
 */

class Topic {
  constructor(name) {
    this.name = name;
    this.subscriptions = new Map();
    this.messageHistory = [];
    this.statistics = {
      messagesPublished: 0,
      totalDeliveries: 0,
      failedDeliveries: 0
    };
  }

  subscribe(subscription) {
    this.subscriptions.set(subscription.id, subscription);
    console.log(`[Topic:${this.name}] Subscription added: ${subscription.id}`);
  }

  unsubscribe(subscriptionId) {
    const removed = this.subscriptions.delete(subscriptionId);
    if (removed) {
      console.log(`[Topic:${this.name}] Subscription removed: ${subscriptionId}`);
    }
    return removed;
  }

  async publish(message) {
    const publishedMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      topic: this.name,
      payload: message,
      publishedAt: Date.now(),
      attributes: message.attributes || {}
    };

    this.messageHistory.push(publishedMessage);
    this.statistics.messagesPublished++;

    console.log(`[Topic:${this.name}] Published message: ${publishedMessage.id}`);

    const deliveryPromises = [];
    for (const subscription of this.subscriptions.values()) {
      deliveryPromises.push(
        subscription.deliver(publishedMessage)
          .then(() => {
            this.statistics.totalDeliveries++;
          })
          .catch(error => {
            this.statistics.failedDeliveries++;
            console.error(`[Topic:${this.name}] Delivery failed to ${subscription.id}:`, error.message);
          })
      );
    }

    await Promise.allSettled(deliveryPromises);
    return publishedMessage.id;
  }

  getStatistics() {
    return {
      ...this.statistics,
      activeSubscriptions: this.subscriptions.size,
      messageHistorySize: this.messageHistory.length
    };
  }
}

class Subscription {
  constructor(id, topicName, deliveryHandler, config = {}) {
    this.id = id;
    this.topicName = topicName;
    this.deliveryHandler = deliveryHandler;
    this.config = {
      filterFunction: config.filterFunction || null,
      deadLetterTopic: config.deadLetterTopic || null,
      maxRetries: config.maxRetries || 3,
      ackDeadline: config.ackDeadline || 30000,
      ...config
    };

    this.pendingMessages = new Map();
    this.statistics = {
      received: 0,
      acknowledged: 0,
      filtered: 0,
      failed: 0,
      retried: 0
    };
  }

  async deliver(message) {
    if (this.config.filterFunction) {
      const shouldDeliver = await this.config.filterFunction(message);
      if (!shouldDeliver) {
        this.statistics.filtered++;
        console.log(`[Subscription:${this.id}] Message ${message.id} filtered out`);
        return;
      }
    }

    this.statistics.received++;

    const deliveryAttempt = {
      message: message,
      retryCount: 0,
      deliveredAt: Date.now(),
      ackDeadline: Date.now() + this.config.ackDeadline
    };

    this.pendingMessages.set(message.id, deliveryAttempt);

    await this.attemptDelivery(message);
  }

  async attemptDelivery(message) {
    console.log(`[Subscription:${this.id}] Delivering message: ${message.id}`);

    const result = await this.deliveryHandler(message);

    if (result && result.success) {
      await this.acknowledge(message.id);
    } else {
      await this.nack(message.id);
    }
  }

  async acknowledge(messageId) {
    const pending = this.pendingMessages.get(messageId);
    if (pending) {
      this.pendingMessages.delete(messageId);
      this.statistics.acknowledged++;
      console.log(`[Subscription:${this.id}] Message acknowledged: ${messageId}`);
      return true;
    }
    return false;
  }

  async nack(messageId) {
    const pending = this.pendingMessages.get(messageId);
    if (!pending) {
      return false;
    }

    pending.retryCount++;

    if (pending.retryCount >= this.config.maxRetries) {
      this.pendingMessages.delete(messageId);
      this.statistics.failed++;
      console.log(`[Subscription:${this.id}] Message failed after ${pending.retryCount} retries: ${messageId}`);

      if (this.config.deadLetterTopic) {
        console.log(`[Subscription:${this.id}] Moving to dead letter topic: ${messageId}`);
      }
      return false;
    }

    this.statistics.retried++;
    console.log(`[Subscription:${this.id}] Message nacked, retry ${pending.retryCount}: ${messageId}`);

    await new Promise(resolve => setTimeout(resolve, 1000 * pending.retryCount));
    await this.attemptDelivery(pending.message);

    return true;
  }

  getStatistics() {
    return {
      ...this.statistics,
      pendingMessages: this.pendingMessages.size
    };
  }
}

class Publisher {
  constructor(id) {
    this.id = id;
    this.messageBroker = null;
    this.statistics = {
      published: 0,
      failed: 0
    };
  }

  connect(messageBroker) {
    this.messageBroker = messageBroker;
    console.log(`[Publisher:${this.id}] Connected to message broker`);
  }

  async publish(topicName, message, attributes = {}) {
    if (!this.messageBroker) {
      throw new Error('Publisher not connected to message broker');
    }

    const messageId = await this.messageBroker.publish(topicName, {
      ...message,
      attributes: {
        ...attributes,
        publisherId: this.id,
        publishedAt: Date.now()
      }
    });

    this.statistics.published++;
    console.log(`[Publisher:${this.id}] Published to ${topicName}: ${messageId}`);

    return messageId;
  }

  getStatistics() {
    return { ...this.statistics };
  }
}

class MessageBroker {
  constructor(config = {}) {
    this.config = {
      retainMessages: config.retainMessages !== false,
      maxMessageHistory: config.maxMessageHistory || 1000,
      ...config
    };

    this.topics = new Map();
    this.statistics = {
      topicsCreated: 0,
      totalMessages: 0,
      totalDeliveries: 0
    };
  }

  createTopic(topicName) {
    if (this.topics.has(topicName)) {
      return this.topics.get(topicName);
    }

    const topic = new Topic(topicName);
    this.topics.set(topicName, topic);
    this.statistics.topicsCreated++;
    console.log(`[MessageBroker] Topic created: ${topicName}`);
    return topic;
  }

  getTopic(topicName) {
    return this.topics.get(topicName);
  }

  subscribe(topicName, subscriptionId, deliveryHandler, config = {}) {
    const topic = this.getTopic(topicName);
    if (!topic) {
      throw new Error(`Topic ${topicName} does not exist`);
    }

    const subscription = new Subscription(subscriptionId, topicName, deliveryHandler, config);
    topic.subscribe(subscription);
    return subscription;
  }

  async publish(topicName, message) {
    const topic = this.getTopic(topicName);
    if (!topic) {
      throw new Error(`Topic ${topicName} does not exist`);
    }

    this.statistics.totalMessages++;
    return await topic.publish(message);
  }

  getStatistics() {
    const topicStats = {};
    for (const [name, topic] of this.topics) {
      topicStats[name] = topic.getStatistics();
    }

    return {
      broker: this.statistics,
      topics: topicStats
    };
  }
}

class PublisherSubscriber {
  constructor(config = {}) {
    this.config = {
      retainMessages: config.retainMessages !== false,
      enableMonitoring: config.enableMonitoring !== false,
      ...config
    };

    this.messageBroker = new MessageBroker({
      retainMessages: this.config.retainMessages
    });

    this.publishers = new Map();
    this.subscriptions = new Map();
  }

  createTopic(topicName) {
    return this.messageBroker.createTopic(topicName);
  }

  createPublisher(publisherId) {
    const publisher = new Publisher(publisherId);
    publisher.connect(this.messageBroker);
    this.publishers.set(publisherId, publisher);
    return publisher;
  }

  createSubscription(topicName, subscriptionId, deliveryHandler, config = {}) {
    const subscription = this.messageBroker.subscribe(
      topicName,
      subscriptionId,
      deliveryHandler,
      config
    );
    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  getStatistics() {
    const brokerStats = this.messageBroker.getStatistics();

    const publisherStats = {};
    for (const [id, publisher] of this.publishers) {
      publisherStats[id] = publisher.getStatistics();
    }

    const subscriptionStats = {};
    for (const [id, subscription] of this.subscriptions) {
      subscriptionStats[id] = subscription.getStatistics();
    }

    return {
      broker: brokerStats,
      publishers: publisherStats,
      subscriptions: subscriptionStats
    };
  }

  printStatistics() {
    const stats = this.getStatistics();

    console.log('\n========== Publisher-Subscriber Statistics ==========');

    console.log('\nBroker:');
    console.log(`  Topics Created: ${stats.broker.broker.topicsCreated}`);
    console.log(`  Total Messages: ${stats.broker.broker.totalMessages}`);

    console.log('\nTopics:');
    for (const [name, topicStats] of Object.entries(stats.broker.topics)) {
      console.log(`  ${name}:`);
      console.log(`    Messages Published: ${topicStats.messagesPublished}`);
      console.log(`    Total Deliveries: ${topicStats.totalDeliveries}`);
      console.log(`    Failed Deliveries: ${topicStats.failedDeliveries}`);
      console.log(`    Active Subscriptions: ${topicStats.activeSubscriptions}`);
    }

    console.log('\nPublishers:');
    for (const [id, publisherStats] of Object.entries(stats.publishers)) {
      console.log(`  ${id}:`);
      console.log(`    Published: ${publisherStats.published}`);
      console.log(`    Failed: ${publisherStats.failed}`);
    }

    console.log('\nSubscriptions:');
    for (const [id, subscriptionStats] of Object.entries(stats.subscriptions)) {
      console.log(`  ${id}:`);
      console.log(`    Received: ${subscriptionStats.received}`);
      console.log(`    Acknowledged: ${subscriptionStats.acknowledged}`);
      console.log(`    Filtered: ${subscriptionStats.filtered}`);
      console.log(`    Failed: ${subscriptionStats.failed}`);
      console.log(`    Retried: ${subscriptionStats.retried}`);
    }

    console.log('=====================================================\n');
  }

  execute() {
    console.log('Publisher-Subscriber Pattern Demonstration');
    console.log('==========================================\n');
    console.log('Configuration:');
    console.log(`  Retain Messages: ${this.config.retainMessages}`);
    console.log(`  Monitoring: ${this.config.enableMonitoring}`);
    console.log('');

    return {
      success: true,
      pattern: 'PublisherSubscriber',
      config: this.config,
      components: {
        publishers: this.publishers.size,
        subscriptions: this.subscriptions.size,
        topics: this.messageBroker.topics.size
      }
    };
  }
}

async function demonstratePublisherSubscriber() {
  console.log('Starting Publisher-Subscriber Pattern Demonstration\n');

  const pubsub = new PublisherSubscriber({
    retainMessages: true,
    enableMonitoring: true
  });

  pubsub.execute();

  console.log('--- Creating Topics ---\n');
  pubsub.createTopic('user-events');
  pubsub.createTopic('order-events');
  pubsub.createTopic('notification-events');

  console.log('\n--- Creating Subscribers ---\n');

  pubsub.createSubscription('user-events', 'analytics-service', async (message) => {
    console.log(`  [Analytics] Processing user event: ${message.payload.event}`);
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true };
  });

  pubsub.createSubscription('user-events', 'email-service', async (message) => {
    console.log(`  [Email] Sending email for user event: ${message.payload.event}`);
    await new Promise(resolve => setTimeout(resolve, 30));
    return { success: true };
  }, {
    filterFunction: async (message) => {
      return message.payload.event === 'signup' || message.payload.event === 'purchase';
    }
  });

  pubsub.createSubscription('order-events', 'inventory-service', async (message) => {
    console.log(`  [Inventory] Updating inventory for order: ${message.payload.orderId}`);
    await new Promise(resolve => setTimeout(resolve, 40));
    return { success: true };
  });

  pubsub.createSubscription('order-events', 'shipping-service', async (message) => {
    console.log(`  [Shipping] Processing shipment for order: ${message.payload.orderId}`);
    await new Promise(resolve => setTimeout(resolve, 60));
    return { success: true };
  });

  console.log('\n--- Creating Publishers ---\n');
  const userServicePublisher = pubsub.createPublisher('user-service');
  const orderServicePublisher = pubsub.createPublisher('order-service');

  console.log('\n--- Publishing Events ---\n');

  await userServicePublisher.publish('user-events', {
    event: 'signup',
    userId: 'user-123',
    email: 'user@example.com'
  }, { priority: 'high' });

  await new Promise(resolve => setTimeout(resolve, 100));

  await orderServicePublisher.publish('order-events', {
    event: 'order-created',
    orderId: 'ORD-001',
    userId: 'user-123',
    amount: 99.99
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  await userServicePublisher.publish('user-events', {
    event: 'login',
    userId: 'user-456'
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  await orderServicePublisher.publish('order-events', {
    event: 'order-shipped',
    orderId: 'ORD-001',
    trackingNumber: 'TRACK-123'
  });

  await new Promise(resolve => setTimeout(resolve, 200));

  pubsub.printStatistics();
}

if (require.main === module) {
  demonstratePublisherSubscriber().catch(console.error);
}

module.exports = PublisherSubscriber;
