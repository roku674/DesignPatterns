/**
 * Resequencer Pattern
 *
 * Ensures messages are delivered in the correct sequence order, even if they
 * arrive out of order. Uses sequence numbers and correlation IDs to maintain
 * proper message ordering.
 *
 * Key Components:
 * - Resequencer: Main resequencing engine
 * - SequenceBuffer: Holds out-of-order messages
 * - MessageBroker: Pub/sub infrastructure
 * - TimeoutStrategy: Handles missing messages
 */

const EventEmitter = require('events');

class Message {
  constructor(id, payload, headers = {}) {
    this.id = id;
    this.payload = payload;
    this.headers = headers;
    this.timestamp = Date.now();
    this.correlationId = headers.correlationId || null;
    this.sequenceNumber = headers.sequenceNumber || null;
    this.sequenceSize = headers.sequenceSize || null;
  }

  clone() {
    const cloned = new Message(this.id, { ...this.payload }, { ...this.headers });
    cloned.timestamp = this.timestamp;
    cloned.correlationId = this.correlationId;
    cloned.sequenceNumber = this.sequenceNumber;
    cloned.sequenceSize = this.sequenceSize;
    return cloned;
  }
}

class SequenceBuffer {
  constructor(correlationId, expectedSize) {
    this.correlationId = correlationId;
    this.expectedSize = expectedSize;
    this.buffer = new Map();
    this.nextExpected = 0;
    this.releasedCount = 0;
    this.createdAt = Date.now();
    this.lastActivityAt = Date.now();
  }

  addMessage(message) {
    if (message.sequenceNumber < this.nextExpected) {
      return { type: 'duplicate', message };
    }

    this.buffer.set(message.sequenceNumber, message);
    this.lastActivityAt = Date.now();

    return { type: 'buffered', message };
  }

  getReleasableMessages() {
    const messages = [];

    while (this.buffer.has(this.nextExpected)) {
      const message = this.buffer.get(this.nextExpected);
      this.buffer.delete(this.nextExpected);
      messages.push(message);
      this.nextExpected++;
      this.releasedCount++;
    }

    if (messages.length > 0) {
      this.lastActivityAt = Date.now();
    }

    return messages;
  }

  isComplete() {
    if (!this.expectedSize) return false;
    return this.releasedCount === this.expectedSize && this.buffer.size === 0;
  }

  hasMissingMessages() {
    if (!this.expectedSize) return false;
    return this.releasedCount + this.buffer.size < this.expectedSize;
  }

  getMissingSequenceNumbers() {
    if (!this.expectedSize) return [];

    const missing = [];
    const received = new Set([...Array.from(this.buffer.keys()), ...Array.from({ length: this.releasedCount }, (_, i) => i)]);

    for (let i = 0; i < this.expectedSize; i++) {
      if (!received.has(i)) {
        missing.push(i);
      }
    }

    return missing;
  }

  getStats() {
    return {
      correlationId: this.correlationId,
      expectedSize: this.expectedSize,
      buffered: this.buffer.size,
      released: this.releasedCount,
      nextExpected: this.nextExpected,
      complete: this.isComplete(),
      age: Date.now() - this.createdAt,
      idleDuration: Date.now() - this.lastActivityAt
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

class Resequencer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.broker = options.broker || new MessageBroker();
    this.outputChannel = options.outputChannel || 'sequenced-output';
    this.buffers = new Map();
    this.maxBuffers = options.maxBuffers || 10000;
    this.bufferTimeout = options.bufferTimeout || 60000;
    this.enableLogging = options.enableLogging !== undefined ? options.enableLogging : true;
    this.processedCount = 0;
    this.reorderedCount = 0;
    this.duplicateCount = 0;
    this.timeoutCheckInterval = null;

    if (!this.broker.channels.has(this.outputChannel)) {
      this.broker.createChannel(this.outputChannel);
    }

    if (options.timeoutCheckIntervalMs) {
      this.startTimeoutCheck(options.timeoutCheckIntervalMs);
    }
  }

  processMessage(message) {
    if (!message.correlationId || message.sequenceNumber === null) {
      throw new Error('Message must have correlationId and sequenceNumber');
    }

    let buffer = this.buffers.get(message.correlationId);

    if (!buffer) {
      buffer = new SequenceBuffer(message.correlationId, message.sequenceSize);
      this.buffers.set(message.correlationId, buffer);

      if (this.buffers.size > this.maxBuffers) {
        this.cleanOldBuffers();
      }
    }

    const result = buffer.addMessage(message);

    if (result.type === 'duplicate') {
      this.duplicateCount++;
      if (this.enableLogging) {
        console.log(`Duplicate message ${message.id} (seq ${message.sequenceNumber})`);
      }
      this.emit('duplicateMessage', { message });
      return { type: 'duplicate', releasedCount: 0 };
    }

    if (message.sequenceNumber !== buffer.nextExpected - 1) {
      this.reorderedCount++;
    }

    const releasable = buffer.getReleasableMessages();

    releasable.forEach((msg) => {
      this.broker.publish(this.outputChannel, msg);
      this.processedCount++;

      if (this.enableLogging) {
        console.log(`Released message ${msg.id} (seq ${msg.sequenceNumber})`);
      }
    });

    this.emit('messagesReleased', {
      correlationId: message.correlationId,
      count: releasable.length,
      messages: releasable
    });

    if (buffer.isComplete()) {
      this.buffers.delete(message.correlationId);
      if (this.enableLogging) {
        console.log(`Sequence complete for ${message.correlationId}`);
      }
      this.emit('sequenceComplete', { correlationId: message.correlationId });
    }

    return {
      type: 'processed',
      releasedCount: releasable.length,
      buffered: buffer.buffer.size
    };
  }

  cleanOldBuffers() {
    const now = Date.now();
    const toRemove = [];

    this.buffers.forEach((buffer, correlationId) => {
      if (now - buffer.lastActivityAt > this.bufferTimeout) {
        toRemove.push(correlationId);
      }
    });

    toRemove.forEach(correlationId => {
      const buffer = this.buffers.get(correlationId);
      this.emit('bufferTimeout', { correlationId, buffer: buffer.getStats() });
      this.buffers.delete(correlationId);
    });

    if (toRemove.length > 0 && this.enableLogging) {
      console.log(`Cleaned ${toRemove.length} timed-out buffers`);
    }
  }

  startTimeoutCheck(intervalMs) {
    this.timeoutCheckInterval = setInterval(() => {
      this.cleanOldBuffers();
    }, intervalMs);
  }

  stopTimeoutCheck() {
    if (this.timeoutCheckInterval) {
      clearInterval(this.timeoutCheckInterval);
      this.timeoutCheckInterval = null;
    }
  }

  getStats() {
    return {
      activeBuffers: this.buffers.size,
      processedCount: this.processedCount,
      reorderedCount: this.reorderedCount,
      duplicateCount: this.duplicateCount,
      buffers: Array.from(this.buffers.values()).map(b => b.getStats()),
      broker: this.broker.getStats()
    };
  }

  reset() {
    this.buffers.clear();
    this.processedCount = 0;
    this.reorderedCount = 0;
    this.duplicateCount = 0;
    this.emit('reset');
  }

  destroy() {
    this.stopTimeoutCheck();
    this.reset();
  }
}

function demonstrateResequencer() {
  console.log('=== Resequencer Pattern Demo ===\n');

  const resequencer = new Resequencer({
    outputChannel: 'ordered',
    enableLogging: true,
    bufferTimeout: 30000
  });

  resequencer.broker.subscribe('ordered', (msg) => {
    console.log(`[ORDERED] ${msg.id} (seq ${msg.sequenceNumber}): ${msg.payload.data}`);
  });

  const correlationId = 'BATCH-001';

  console.log('Processing messages out of order...\n');

  const msg0 = new Message('MSG-0', { data: 'First' }, { correlationId, sequenceNumber: 0, sequenceSize: 5 });
  const msg2 = new Message('MSG-2', { data: 'Third' }, { correlationId, sequenceNumber: 2, sequenceSize: 5 });
  const msg4 = new Message('MSG-4', { data: 'Fifth' }, { correlationId, sequenceNumber: 4, sequenceSize: 5 });
  const msg1 = new Message('MSG-1', { data: 'Second' }, { correlationId, sequenceNumber: 1, sequenceSize: 5 });
  const msg3 = new Message('MSG-3', { data: 'Fourth' }, { correlationId, sequenceNumber: 3, sequenceSize: 5 });

  resequencer.processMessage(msg2);
  resequencer.processMessage(msg0);
  resequencer.processMessage(msg4);
  resequencer.processMessage(msg3);
  resequencer.processMessage(msg1);

  console.log('\n=== Resequencer Statistics ===');
  console.log(JSON.stringify(resequencer.getStats(), null, 2));

  return resequencer;
}

module.exports = Resequencer;
module.exports.Message = Message;
module.exports.SequenceBuffer = SequenceBuffer;
module.exports.MessageBroker = MessageBroker;
module.exports.demonstrate = demonstrateResequencer;

if (require.main === module) {
  demonstrateResequencer();
}
