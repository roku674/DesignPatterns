/**
 * ClaimCheckCloud Pattern
 *
 * Splits large messages into a reference (claim check) and payload.
 * The payload is stored in external storage while the reference travels through the message queue.
 * This reduces message queue load and allows processing of large payloads efficiently.
 *
 * Use Cases:
 * - Large file processing through message queues
 * - Video/image processing pipelines
 * - Big data batch processing
 * - Document processing workflows
 */

class BlobStorage {
  constructor() {
    this.storage = new Map();
    this.statistics = {
      stored: 0,
      retrieved: 0,
      deleted: 0,
      totalSize: 0
    };
  }

  async store(claimCheckId, data) {
    const timestamp = new Date().toISOString();
    const metadata = {
      id: claimCheckId,
      size: JSON.stringify(data).length,
      storedAt: timestamp,
      contentType: typeof data === 'object' ? 'application/json' : 'text/plain',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    this.storage.set(claimCheckId, {
      data: data,
      metadata: metadata
    });

    this.statistics.stored++;
    this.statistics.totalSize += metadata.size;

    console.log(`[BlobStorage] Stored claim check: ${claimCheckId}, size: ${metadata.size} bytes`);
    return metadata;
  }

  async retrieve(claimCheckId) {
    const item = this.storage.get(claimCheckId);

    if (!item) {
      throw new Error(`Claim check not found: ${claimCheckId}`);
    }

    const expiresAt = new Date(item.metadata.expiresAt);
    if (expiresAt < new Date()) {
      this.storage.delete(claimCheckId);
      throw new Error(`Claim check expired: ${claimCheckId}`);
    }

    this.statistics.retrieved++;
    console.log(`[BlobStorage] Retrieved claim check: ${claimCheckId}`);
    return item.data;
  }

  async delete(claimCheckId) {
    const item = this.storage.get(claimCheckId);
    if (item) {
      this.statistics.deleted++;
      this.statistics.totalSize -= item.metadata.size;
      this.storage.delete(claimCheckId);
      console.log(`[BlobStorage] Deleted claim check: ${claimCheckId}`);
      return true;
    }
    return false;
  }

  getStatistics() {
    return {
      ...this.statistics,
      activeItems: this.storage.size
    };
  }
}

class MessageQueue {
  constructor(name) {
    this.name = name;
    this.queue = [];
    this.statistics = {
      sent: 0,
      received: 0,
      averageSize: 0
    };
  }

  async send(message) {
    const messageSize = JSON.stringify(message).length;
    this.queue.push({
      ...message,
      enqueuedAt: new Date().toISOString(),
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    this.statistics.sent++;
    this.statistics.averageSize =
      ((this.statistics.averageSize * (this.statistics.sent - 1)) + messageSize) / this.statistics.sent;

    console.log(`[MessageQueue:${this.name}] Message sent, size: ${messageSize} bytes`);
  }

  async receive() {
    if (this.queue.length === 0) {
      return null;
    }

    const message = this.queue.shift();
    this.statistics.received++;
    console.log(`[MessageQueue:${this.name}] Message received: ${message.messageId}`);
    return message;
  }

  getStatistics() {
    return {
      ...this.statistics,
      queueDepth: this.queue.length
    };
  }
}

class ClaimCheckProcessor {
  constructor(blobStorage, messageQueue) {
    this.blobStorage = blobStorage;
    this.messageQueue = messageQueue;
    this.threshold = 1024; // 1KB threshold
    this.processedMessages = [];
  }

  async splitMessage(message) {
    const messageSize = JSON.stringify(message).length;

    if (messageSize < this.threshold) {
      console.log(`[Processor] Message below threshold (${messageSize}/${this.threshold}), sending directly`);
      return {
        type: 'direct',
        payload: message
      };
    }

    const claimCheckId = `claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const metadata = await this.blobStorage.store(claimCheckId, message.payload);

    console.log(`[Processor] Message split - claim check created: ${claimCheckId}`);

    return {
      type: 'claim-check',
      claimCheckId: claimCheckId,
      metadata: {
        originalSize: messageSize,
        storedAt: metadata.storedAt,
        contentType: metadata.contentType
      },
      headers: message.headers || {}
    };
  }

  async retrieveMessage(claimCheckMessage) {
    if (claimCheckMessage.type === 'direct') {
      console.log(`[Processor] Direct message, no claim check retrieval needed`);
      return claimCheckMessage.payload;
    }

    if (claimCheckMessage.type !== 'claim-check') {
      throw new Error('Invalid message type');
    }

    console.log(`[Processor] Retrieving claim check: ${claimCheckMessage.claimCheckId}`);
    const payload = await this.blobStorage.retrieve(claimCheckMessage.claimCheckId);

    return {
      payload: payload,
      headers: claimCheckMessage.headers,
      metadata: claimCheckMessage.metadata
    };
  }

  async processWithCleanup(claimCheckMessage, processingFunction) {
    const fullMessage = await this.retrieveMessage(claimCheckMessage);

    const result = await processingFunction(fullMessage);

    if (claimCheckMessage.type === 'claim-check') {
      await this.blobStorage.delete(claimCheckMessage.claimCheckId);
      console.log(`[Processor] Cleaned up claim check: ${claimCheckMessage.claimCheckId}`);
    }

    this.processedMessages.push({
      messageId: claimCheckMessage.messageId,
      processedAt: new Date().toISOString(),
      success: true
    });

    return result;
  }

  getStatistics() {
    return {
      processedCount: this.processedMessages.length,
      threshold: this.threshold
    };
  }
}

class ClaimCheckCloud {
  constructor(config = {}) {
    this.config = {
      threshold: config.threshold || 1024,
      queueName: config.queueName || 'default-queue',
      enableAutoCleanup: config.enableAutoCleanup !== false,
      ...config
    };

    this.blobStorage = new BlobStorage();
    this.messageQueue = new MessageQueue(this.config.queueName);
    this.processor = new ClaimCheckProcessor(this.blobStorage, this.messageQueue);
    this.processor.threshold = this.config.threshold;

    this.statistics = {
      messagesSent: 0,
      messagesProcessed: 0,
      claimChecksCreated: 0,
      directMessages: 0
    };
  }

  async sendMessage(message) {
    const splitResult = await this.processor.splitMessage(message);

    await this.messageQueue.send(splitResult);

    this.statistics.messagesSent++;
    if (splitResult.type === 'claim-check') {
      this.statistics.claimChecksCreated++;
    } else {
      this.statistics.directMessages++;
    }

    return splitResult;
  }

  async receiveAndProcess(processingFunction) {
    const message = await this.messageQueue.receive();

    if (!message) {
      return null;
    }

    const result = await this.processor.processWithCleanup(message, processingFunction);
    this.statistics.messagesProcessed++;

    return result;
  }

  async processAll(processingFunction) {
    const results = [];
    let message;

    while ((message = await this.messageQueue.receive()) !== null) {
      const result = await this.processor.processWithCleanup(message, processingFunction);
      results.push(result);
      this.statistics.messagesProcessed++;
    }

    return results;
  }

  getStatistics() {
    return {
      system: this.statistics,
      blobStorage: this.blobStorage.getStatistics(),
      messageQueue: this.messageQueue.getStatistics(),
      processor: this.processor.getStatistics()
    };
  }

  printStatistics() {
    const stats = this.getStatistics();
    console.log('\n========== Claim Check Cloud Statistics ==========');
    console.log('System:');
    console.log(`  Messages Sent: ${stats.system.messagesSent}`);
    console.log(`  Messages Processed: ${stats.system.messagesProcessed}`);
    console.log(`  Claim Checks Created: ${stats.system.claimChecksCreated}`);
    console.log(`  Direct Messages: ${stats.system.directMessages}`);
    console.log('\nBlob Storage:');
    console.log(`  Items Stored: ${stats.blobStorage.stored}`);
    console.log(`  Items Retrieved: ${stats.blobStorage.retrieved}`);
    console.log(`  Items Deleted: ${stats.blobStorage.deleted}`);
    console.log(`  Active Items: ${stats.blobStorage.activeItems}`);
    console.log(`  Total Size: ${stats.blobStorage.totalSize} bytes`);
    console.log('\nMessage Queue:');
    console.log(`  Messages Sent: ${stats.messageQueue.sent}`);
    console.log(`  Messages Received: ${stats.messageQueue.received}`);
    console.log(`  Queue Depth: ${stats.messageQueue.queueDepth}`);
    console.log(`  Average Message Size: ${Math.round(stats.messageQueue.averageSize)} bytes`);
    console.log('==================================================\n');
  }

  execute() {
    console.log('ClaimCheckCloud Pattern Demonstration');
    console.log('=====================================\n');
    console.log('Configuration:');
    console.log(`  Threshold: ${this.config.threshold} bytes`);
    console.log(`  Queue Name: ${this.config.queueName}`);
    console.log(`  Auto Cleanup: ${this.config.enableAutoCleanup}`);
    console.log('');

    return {
      success: true,
      pattern: 'ClaimCheckCloud',
      config: this.config,
      components: {
        blobStorage: 'BlobStorage',
        messageQueue: 'MessageQueue',
        processor: 'ClaimCheckProcessor'
      }
    };
  }
}

async function demonstrateClaimCheckCloud() {
  console.log('Starting Claim Check Cloud Pattern Demonstration\n');

  const claimCheck = new ClaimCheckCloud({
    threshold: 500,
    queueName: 'processing-queue',
    enableAutoCleanup: true
  });

  claimCheck.execute();

  console.log('\n--- Sending Small Message (Direct) ---');
  await claimCheck.sendMessage({
    headers: { priority: 'high', type: 'notification' },
    payload: { message: 'Small notification', userId: 123 }
  });

  console.log('\n--- Sending Large Message (Claim Check) ---');
  const largePayload = {
    videoData: 'x'.repeat(1000),
    metadata: { duration: 120, resolution: '1080p' },
    thumbnail: 'y'.repeat(500)
  };
  await claimCheck.sendMessage({
    headers: { priority: 'normal', type: 'video-processing' },
    payload: largePayload
  });

  console.log('\n--- Sending Another Large Message ---');
  await claimCheck.sendMessage({
    headers: { priority: 'low', type: 'document-processing' },
    payload: { document: 'z'.repeat(2000), pages: 50 }
  });

  console.log('\n--- Processing All Messages ---');
  const processingFunction = async (message) => {
    console.log(`  [Processing] Message type: ${message.headers?.type || 'unknown'}`);
    console.log(`  [Processing] Payload size: ${JSON.stringify(message.payload).length} bytes`);
    return { processed: true, timestamp: new Date().toISOString() };
  };

  await claimCheck.processAll(processingFunction);

  claimCheck.printStatistics();
}

if (require.main === module) {
  demonstrateClaimCheckCloud().catch(console.error);
}

module.exports = ClaimCheckCloud;
