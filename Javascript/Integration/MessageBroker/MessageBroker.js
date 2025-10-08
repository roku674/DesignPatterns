/**
 * Message Broker Pattern
 *
 * Central component that handles routing and transformation of messages between senders and receivers.
 */

const EventEmitter = require('events');

class MessageBroker extends EventEmitter {
  constructor() {
    super();
    this.channels = new Map();
    this.subscriptions = new Map();
    this.messageStore = [];
    this.routingRules = [];
  }

  /**
   * Create a message channel
   */
  createChannel(channelName) {
    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, {
        name: channelName,
        messages: [],
        subscribers: new Set()
      });
      console.log(`[Broker] Channel created: ${channelName}`);
    }
    return channelName;
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channelName, subscriberId, handler) {
    this.createChannel(channelName);
    const channel = this.channels.get(channelName);

    const subscription = {
      id: subscriberId,
      handler,
      channelName
    };

    channel.subscribers.add(subscription);

    if (!this.subscriptions.has(subscriberId)) {
      this.subscriptions.set(subscriberId, []);
    }
    this.subscriptions.get(subscriberId).push(subscription);

    console.log(`[Broker] ${subscriberId} subscribed to ${channelName}`);
  }

  /**
   * Publish message to channel
   */
  async publish(channelName, message) {
    this.createChannel(channelName);

    const enrichedMessage = {
      ...message,
      channelName,
      timestamp: new Date(),
      messageId: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.messageStore.push(enrichedMessage);

    const targetChannels = this.applyRoutingRules(enrichedMessage);

    for (const targetChannel of [channelName, ...targetChannels]) {
      await this.deliverToChannel(targetChannel, enrichedMessage);
    }

    this.emit('message-published', enrichedMessage);
    return enrichedMessage.messageId;
  }

  async deliverToChannel(channelName, message) {
    const channel = this.channels.get(channelName);
    if (!channel) return;

    for (const subscription of channel.subscribers) {
      try {
        await subscription.handler(message);
      } catch (error) {
        console.error(`[Broker] Error delivering to ${subscription.id}:`, error.message);
      }
    }
  }

  addRoutingRule(condition, targetChannel) {
    this.routingRules.push({ condition, targetChannel });
  }

  applyRoutingRules(message) {
    const targets = [];
    for (const rule of this.routingRules) {
      if (rule.condition(message)) {
        targets.push(rule.targetChannel);
      }
    }
    return targets;
  }

  getChannelStats(channelName) {
    const channel = this.channels.get(channelName);
    if (!channel) return null;
    return {
      name: channelName,
      subscriberCount: channel.subscribers.size,
      subscribers: [...channel.subscribers].map(s => s.id)
    };
  }
}

module.exports = MessageBroker;
