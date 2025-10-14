/**
 * MessageExpiration Pattern
 *
 * Ensures messages have a limited lifetime and are automatically removed
 * when they expire. Prevents stale messages from being processed and
 * manages message TTL (Time To Live) across the messaging system.
 */

const EventEmitter = require('events');

class MessageExpiration extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      defaultTTL: config.defaultTTL || 60000, // 1 minute default
      cleanupInterval: config.cleanupInterval || 5000, // Check every 5 seconds
      maxMessages: config.maxMessages || 10000,
      enableWarnings: config.enableWarnings !== false,
      ...config
    };

    this.messages = new Map();
    this.expirationTimers = new Map();
    this.statistics = {
      messagesExpired: 0,
      messagesProcessed: 0,
      messagesAdded: 0,
      totalExpiredSize: 0
    };

    this.cleanupTimer = null;
    this.isRunning = false;
  }

  /**
   * Start the expiration monitoring
   */
  start() {
    if (this.isRunning) {
      throw new Error('MessageExpiration is already running');
    }

    this.isRunning = true;
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredMessages();
    }, this.config.cleanupInterval);

    this.emit('started');
    return this;
  }

  /**
   * Stop the expiration monitoring
   */
  stop() {
    if (!this.isRunning) {
      return this;
    }

    this.isRunning = false;

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    // Clear all timers
    this.expirationTimers.forEach(timer => clearTimeout(timer));
    this.expirationTimers.clear();

    this.emit('stopped');
    return this;
  }

  /**
   * Add a message with expiration
   */
  addMessage(messageId, message, options = {}) {
    if (!messageId) {
      throw new Error('Message ID is required');
    }

    if (this.messages.size >= this.config.maxMessages) {
      const error = new Error('Maximum message capacity reached');
      this.emit('capacityReached', { size: this.messages.size });
      throw error;
    }

    const ttl = options.ttl || message.ttl || this.config.defaultTTL;
    const expiresAt = Date.now() + ttl;
    const priority = options.priority || message.priority || 0;

    const messageWrapper = {
      id: messageId,
      message,
      createdAt: Date.now(),
      expiresAt,
      ttl,
      priority,
      metadata: {
        size: this.estimateSize(message),
        attempts: 0,
        ...options.metadata
      }
    };

    // Remove existing message if present
    if (this.messages.has(messageId)) {
      this.removeMessage(messageId);
    }

    // Store message
    this.messages.set(messageId, messageWrapper);
    this.statistics.messagesAdded++;

    // Set expiration timer
    this.setExpirationTimer(messageId, ttl);

    // Emit warning if TTL is very short
    if (this.config.enableWarnings && ttl < 1000) {
      this.emit('warning', {
        type: 'shortTTL',
        messageId,
        ttl
      });
    }

    this.emit('messageAdded', { messageId, ttl, expiresAt });
    return messageWrapper;
  }

  /**
   * Get a message if it hasn't expired
   */
  getMessage(messageId) {
    const wrapper = this.messages.get(messageId);

    if (!wrapper) {
      return null;
    }

    // Check if expired
    if (this.isExpired(wrapper)) {
      this.expireMessage(messageId, 'accessAfterExpiration');
      return null;
    }

    wrapper.metadata.attempts++;
    this.statistics.messagesProcessed++;

    return wrapper.message;
  }

  /**
   * Remove a message and cancel its expiration
   */
  removeMessage(messageId) {
    const wrapper = this.messages.get(messageId);

    if (!wrapper) {
      return false;
    }

    // Clear expiration timer
    if (this.expirationTimers.has(messageId)) {
      clearTimeout(this.expirationTimers.get(messageId));
      this.expirationTimers.delete(messageId);
    }

    this.messages.delete(messageId);
    this.emit('messageRemoved', { messageId });

    return true;
  }

  /**
   * Extend the TTL of a message
   */
  extendTTL(messageId, additionalTime) {
    const wrapper = this.messages.get(messageId);

    if (!wrapper) {
      throw new Error(`Message ${messageId} not found`);
    }

    if (this.isExpired(wrapper)) {
      throw new Error(`Message ${messageId} has already expired`);
    }

    // Clear existing timer
    if (this.expirationTimers.has(messageId)) {
      clearTimeout(this.expirationTimers.get(messageId));
    }

    // Update expiration time
    const newExpiresAt = wrapper.expiresAt + additionalTime;
    wrapper.expiresAt = newExpiresAt;
    wrapper.ttl += additionalTime;

    // Set new timer
    const remainingTime = newExpiresAt - Date.now();
    this.setExpirationTimer(messageId, remainingTime);

    this.emit('ttlExtended', { messageId, additionalTime, newExpiresAt });
    return wrapper;
  }

  /**
   * Set expiration timer for a message
   */
  setExpirationTimer(messageId, ttl) {
    const timer = setTimeout(() => {
      this.expireMessage(messageId, 'timeout');
    }, ttl);

    this.expirationTimers.set(messageId, timer);
  }

  /**
   * Expire a message
   */
  expireMessage(messageId, reason = 'expired') {
    const wrapper = this.messages.get(messageId);

    if (!wrapper) {
      return false;
    }

    this.statistics.messagesExpired++;
    this.statistics.totalExpiredSize += wrapper.metadata.size;

    const expiredMessage = {
      messageId,
      message: wrapper.message,
      reason,
      createdAt: wrapper.createdAt,
      expiresAt: wrapper.expiresAt,
      age: Date.now() - wrapper.createdAt,
      attempts: wrapper.metadata.attempts
    };

    this.removeMessage(messageId);
    this.emit('messageExpired', expiredMessage);

    return true;
  }

  /**
   * Check if a message has expired
   */
  isExpired(wrapper) {
    return Date.now() >= wrapper.expiresAt;
  }

  /**
   * Cleanup all expired messages
   */
  cleanupExpiredMessages() {
    const now = Date.now();
    const expiredIds = [];

    for (const [messageId, wrapper] of this.messages) {
      if (now >= wrapper.expiresAt) {
        expiredIds.push(messageId);
      }
    }

    if (expiredIds.length > 0) {
      expiredIds.forEach(id => this.expireMessage(id, 'cleanup'));
      this.emit('cleanupCompleted', {
        expiredCount: expiredIds.length,
        remainingCount: this.messages.size
      });
    }

    return expiredIds.length;
  }

  /**
   * Get all active messages
   */
  getActiveMessages() {
    const activeMessages = [];
    const now = Date.now();

    for (const [messageId, wrapper] of this.messages) {
      if (now < wrapper.expiresAt) {
        activeMessages.push({
          id: messageId,
          message: wrapper.message,
          remainingTTL: wrapper.expiresAt - now,
          priority: wrapper.priority
        });
      }
    }

    return activeMessages.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get messages expiring soon
   */
  getExpiringSoon(threshold = 5000) {
    const now = Date.now();
    const expiringSoon = [];

    for (const [messageId, wrapper] of this.messages) {
      const remainingTime = wrapper.expiresAt - now;
      if (remainingTime > 0 && remainingTime <= threshold) {
        expiringSoon.push({
          id: messageId,
          message: wrapper.message,
          remainingTTL: remainingTime,
          expiresAt: wrapper.expiresAt
        });
      }
    }

    return expiringSoon.sort((a, b) => a.remainingTTL - b.remainingTTL);
  }

  /**
   * Batch add messages
   */
  addBatch(messages, options = {}) {
    const results = {
      added: [],
      failed: []
    };

    messages.forEach(({ id, message, ttl }) => {
      try {
        const wrapper = this.addMessage(id, message, { ...options, ttl });
        results.added.push({ id, wrapper });
      } catch (error) {
        results.failed.push({ id, error: error.message });
      }
    });

    this.emit('batchAdded', results);
    return results;
  }

  /**
   * Batch remove messages
   */
  removeBatch(messageIds) {
    const results = {
      removed: [],
      notFound: []
    };

    messageIds.forEach(id => {
      if (this.removeMessage(id)) {
        results.removed.push(id);
      } else {
        results.notFound.push(id);
      }
    });

    return results;
  }

  /**
   * Estimate message size in bytes
   */
  estimateSize(message) {
    try {
      return JSON.stringify(message).length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      activeMessages: this.messages.size,
      activeTimers: this.expirationTimers.size,
      averageExpiredSize: this.statistics.messagesExpired > 0
        ? Math.round(this.statistics.totalExpiredSize / this.statistics.messagesExpired)
        : 0
    };
  }

  /**
   * Get health status
   */
  getHealth() {
    const stats = this.getStatistics();
    const utilizationPercentage = (stats.activeMessages / this.config.maxMessages) * 100;

    return {
      status: this.isRunning ? 'running' : 'stopped',
      healthy: utilizationPercentage < 90,
      utilization: `${utilizationPercentage.toFixed(2)}%`,
      statistics: stats,
      config: {
        defaultTTL: this.config.defaultTTL,
        cleanupInterval: this.config.cleanupInterval,
        maxMessages: this.config.maxMessages
      }
    };
  }

  /**
   * Clear all messages
   */
  clear() {
    const count = this.messages.size;

    this.expirationTimers.forEach(timer => clearTimeout(timer));
    this.expirationTimers.clear();
    this.messages.clear();

    this.emit('cleared', { count });
    return count;
  }

  /**
   * Execute pattern demonstration
   */
  execute() {
    console.log('MessageExpiration Pattern - Managing message lifecycle');

    this.start();

    // Add test messages
    this.addMessage('msg1', { data: 'Important message' }, { ttl: 10000 });
    this.addMessage('msg2', { data: 'Temporary message' }, { ttl: 2000 });
    this.addMessage('msg3', { data: 'Quick message' }, { ttl: 1000 });

    console.log('Active messages:', this.messages.size);
    console.log('Statistics:', this.getStatistics());

    return {
      success: true,
      pattern: 'MessageExpiration',
      statistics: this.getStatistics()
    };
  }
}

module.exports = MessageExpiration;
