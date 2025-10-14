/**
 * Claim Check Pattern
 *
 * Splits a large message into a claim check and payload. The claim check is
 * sent through the messaging system while the payload is stored externally.
 * The receiver uses the claim check to retrieve the payload.
 *
 * Use Cases:
 * - Processing messages larger than message bus limits
 * - Reducing network bandwidth for large payloads
 * - Temporary storage of message data
 * - Decoupling message metadata from payload
 * - Efficient message routing without payload overhead
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Data Store for payload storage
 */
class PayloadStore {
  constructor(config = {}) {
    this.storage = new Map();
    this.ttl = config.ttl || 3600000;
    this.maxPayloadSize = config.maxPayloadSize || 10 * 1024 * 1024;
    this.stats = {
      stored: 0,
      retrieved: 0,
      deleted: 0,
      expired: 0
    };
  }

  async store(payload) {
    const size = Buffer.byteLength(JSON.stringify(payload));

    if (size > this.maxPayloadSize) {
      throw new Error(`Payload size ${size} exceeds maximum ${this.maxPayloadSize}`);
    }

    const claimId = crypto.randomUUID();
    const expiresAt = Date.now() + this.ttl;

    this.storage.set(claimId, {
      payload,
      size,
      storedAt: Date.now(),
      expiresAt,
      retrieved: false
    });

    this.stats.stored++;

    return {
      claimId,
      size,
      expiresAt
    };
  }

  async retrieve(claimId) {
    const entry = this.storage.get(claimId);

    if (!entry) {
      throw new Error(`Payload not found for claim ${claimId}`);
    }

    if (Date.now() > entry.expiresAt) {
      this.storage.delete(claimId);
      this.stats.expired++;
      throw new Error(`Claim ${claimId} has expired`);
    }

    entry.retrieved = true;
    entry.retrievedAt = Date.now();
    this.stats.retrieved++;

    return entry.payload;
  }

  async delete(claimId) {
    const deleted = this.storage.delete(claimId);

    if (deleted) {
      this.stats.deleted++;
    }

    return deleted;
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [claimId, entry] of this.storage.entries()) {
      if (now > entry.expiresAt) {
        this.storage.delete(claimId);
        this.stats.expired++;
        cleaned++;
      }
    }

    return cleaned;
  }

  getStats() {
    return {
      ...this.stats,
      activePayloads: this.storage.size,
      totalSize: Array.from(this.storage.values())
        .reduce((sum, entry) => sum + entry.size, 0)
    };
  }
}

/**
 * Claim Check Generator
 */
class ClaimCheckGenerator {
  constructor() {
    this.checks = new Map();
  }

  generate(claimId, metadata = {}) {
    const claimCheck = {
      claimId,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        version: '1.0'
      }
    };

    this.checks.set(claimId, claimCheck);

    return claimCheck;
  }

  validate(claimCheck) {
    if (!claimCheck || !claimCheck.claimId) {
      return { valid: false, reason: 'Invalid claim check format' };
    }

    const stored = this.checks.get(claimCheck.claimId);

    if (!stored) {
      return { valid: false, reason: 'Claim check not recognized' };
    }

    return { valid: true };
  }

  revoke(claimId) {
    return this.checks.delete(claimId);
  }
}

/**
 * Message Bus Simulator
 */
class MessageBus {
  constructor(config = {}) {
    this.maxMessageSize = config.maxMessageSize || 256 * 1024;
    this.queue = [];
    this.subscribers = new Map();
    this.stats = {
      sent: 0,
      received: 0,
      rejected: 0
    };
  }

  async send(topic, message) {
    const size = Buffer.byteLength(JSON.stringify(message));

    if (size > this.maxMessageSize) {
      this.stats.rejected++;
      throw new Error(`Message size ${size} exceeds maximum ${this.maxMessageSize}`);
    }

    this.queue.push({
      topic,
      message,
      sentAt: Date.now()
    });

    this.stats.sent++;

    await this.deliver(topic, message);
  }

  subscribe(topic, handler) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }

    this.subscribers.get(topic).push(handler);
  }

  async deliver(topic, message) {
    const handlers = this.subscribers.get(topic) || [];

    for (const handler of handlers) {
      try {
        await handler(message);
        this.stats.received++;
      } catch (error) {
        console.error(`Error delivering message: ${error.message}`);
      }
    }
  }

  getStats() {
    return {
      ...this.stats,
      queueSize: this.queue.length,
      topics: this.subscribers.size
    };
  }
}

/**
 * Main Claim Check implementation
 */
class ClaimCheck extends EventEmitter {
  constructor(config = {}) {
    super();
    this.payloadStore = new PayloadStore(config.store || {});
    this.claimGenerator = new ClaimCheckGenerator();
    this.messageBus = new MessageBus(config.messageBus || {});
    this.metrics = {
      messagesSent: 0,
      messagesReceived: 0,
      claimsGenerated: 0,
      payloadsRetrieved: 0,
      errors: 0
    };

    this.startCleanupTimer(config.cleanupInterval || 300000);
  }

  async send(topic, payload, metadata = {}) {
    try {
      this.emit('send:start', { topic, payloadSize: JSON.stringify(payload).length });

      const { claimId, size, expiresAt } = await this.payloadStore.store(payload);

      this.emit('payload:stored', { claimId, size });

      const claimCheck = this.claimGenerator.generate(claimId, {
        ...metadata,
        topic,
        payloadSize: size,
        expiresAt
      });

      this.metrics.claimsGenerated++;

      await this.messageBus.send(topic, claimCheck);

      this.metrics.messagesSent++;

      this.emit('send:complete', {
        topic,
        claimId,
        messageSize: JSON.stringify(claimCheck).length,
        payloadSize: size
      });

      return {
        success: true,
        claimId,
        claimCheck
      };
    } catch (error) {
      this.metrics.errors++;
      this.emit('send:error', { topic, error: error.message });
      throw error;
    }
  }

  subscribe(topic, handler) {
    const wrappedHandler = async (claimCheck) => {
      try {
        this.emit('receive:start', { topic, claimId: claimCheck.claimId });

        const validation = this.claimGenerator.validate(claimCheck);

        if (!validation.valid) {
          throw new Error(validation.reason);
        }

        const payload = await this.payloadStore.retrieve(claimCheck.claimId);

        this.metrics.payloadsRetrieved++;

        this.emit('payload:retrieved', {
          claimId: claimCheck.claimId,
          size: JSON.stringify(payload).length
        });

        await handler(payload, claimCheck.metadata);

        this.metrics.messagesReceived++;

        this.emit('receive:complete', {
          topic,
          claimId: claimCheck.claimId
        });

        await this.payloadStore.delete(claimCheck.claimId);
        this.claimGenerator.revoke(claimCheck.claimId);
      } catch (error) {
        this.metrics.errors++;
        this.emit('receive:error', {
          topic,
          claimId: claimCheck.claimId,
          error: error.message
        });
      }
    };

    this.messageBus.subscribe(topic, wrappedHandler);
  }

  startCleanupTimer(interval) {
    setInterval(() => {
      const cleaned = this.payloadStore.cleanup();

      if (cleaned > 0) {
        this.emit('cleanup:completed', { cleaned });
      }
    }, interval);
  }

  getMetrics() {
    return {
      ...this.metrics,
      messageBus: this.messageBus.getStats(),
      payloadStore: this.payloadStore.getStats()
    };
  }

  async shutdown() {
    this.payloadStore.cleanup();
    this.emit('shutdown');
  }
}

/**
 * Example usage and demonstration
 */
function demonstrateClaimCheck() {
  console.log('=== Claim Check Pattern Demo ===\n');

  const claimCheck = new ClaimCheck({
    store: {
      ttl: 3600000,
      maxPayloadSize: 10 * 1024 * 1024
    },
    messageBus: {
      maxMessageSize: 256 * 1024
    },
    cleanupInterval: 60000
  });

  claimCheck.on('send:start', ({ topic, payloadSize }) => {
    console.log(`Sending message to ${topic} (payload: ${payloadSize} bytes)`);
  });

  claimCheck.on('payload:stored', ({ claimId, size }) => {
    console.log(`Payload stored with claim ${claimId.substring(0, 8)}... (${size} bytes)`);
  });

  claimCheck.on('send:complete', ({ topic, claimId, messageSize, payloadSize }) => {
    console.log(`Message sent: ${messageSize} bytes (payload: ${payloadSize} bytes)`);
    console.log(`Size reduction: ${((1 - messageSize / payloadSize) * 100).toFixed(2)}%`);
  });

  claimCheck.on('receive:start', ({ topic, claimId }) => {
    console.log(`\nReceiving message from ${topic}`);
    console.log(`Retrieving payload for claim ${claimId.substring(0, 8)}...`);
  });

  claimCheck.on('payload:retrieved', ({ claimId, size }) => {
    console.log(`Payload retrieved: ${size} bytes`);
  });

  claimCheck.on('receive:complete', ({ topic, claimId }) => {
    console.log(`Message processing complete`);
  });

  claimCheck.subscribe('orders', async (payload, metadata) => {
    console.log('\nOrder Handler:');
    console.log(`  Order ID: ${payload.orderId}`);
    console.log(`  Customer: ${payload.customer.name}`);
    console.log(`  Items: ${payload.items.length}`);
    console.log(`  Total: $${payload.total}`);
  });

  const largeOrder = {
    orderId: 'ORD-12345',
    customer: {
      id: 'CUST-001',
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main St, City, State 12345'
    },
    items: [
      { sku: 'ITEM-001', name: 'Product 1', quantity: 2, price: 29.99 },
      { sku: 'ITEM-002', name: 'Product 2', quantity: 1, price: 49.99 },
      { sku: 'ITEM-003', name: 'Product 3', quantity: 3, price: 19.99 }
    ],
    total: 169.96,
    shipping: {
      method: 'express',
      address: '123 Main St, City, State 12345',
      cost: 15.00
    },
    payment: {
      method: 'credit_card',
      last4: '1234',
      status: 'authorized'
    },
    metadata: {
      source: 'web',
      campaign: 'summer-sale',
      notes: 'Gift wrap requested'
    }
  };

  claimCheck.send('orders', largeOrder, {
    priority: 'high',
    source: 'order-service'
  }).then(() => {
    console.log('\nClaim Check Metrics:');
    console.log(JSON.stringify(claimCheck.getMetrics(), null, 2));
  }).catch(error => {
    console.error('Error:', error.message);
  });
}

if (require.main === module) {
  demonstrateClaimCheck();
}

module.exports = ClaimCheck;
