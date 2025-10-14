/**
 * Competing Consumers Pattern
 *
 * Multiple consumers compete to process messages from a shared queue.
 * This enables parallel processing, load distribution, and high throughput.
 *
 * Benefits:
 * - Scalability: Add more consumers to increase throughput
 * - Load balancing: Work is automatically distributed
 * - Fault tolerance: If one consumer fails, others continue
 * - Efficiency: Messages processed as fast as consumers can handle
 *
 * Use Cases:
 * - Order processing systems
 * - Email/notification sending
 * - Background job processing
 * - Data ingestion pipelines
 */

class MessageQueue {
  constructor(name, config = {}) {
    this.name = name;
    this.config = {
      visibilityTimeout: config.visibilityTimeout || 30000,
      maxRetries: config.maxRetries || 3,
      ...config
    };

    this.queue = [];
    this.processing = new Map();
    this.deadLetterQueue = [];
    this.statistics = {
      enqueued: 0,
      dequeued: 0,
      completed: 0,
      failed: 0,
      retried: 0,
      movedToDLQ: 0
    };
  }

  async enqueue(message) {
    const queueMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      payload: message,
      metadata: {
        enqueuedAt: Date.now(),
        retryCount: 0,
        lastDequeuedAt: null
      }
    };

    this.queue.push(queueMessage);
    this.statistics.enqueued++;
    console.log(`[Queue:${this.name}] Enqueued message: ${queueMessage.id}`);
    return queueMessage.id;
  }

  async dequeue(consumerId) {
    if (this.queue.length === 0) {
      return null;
    }

    const message = this.queue.shift();
    message.metadata.lastDequeuedAt = Date.now();

    this.processing.set(message.id, {
      message: message,
      consumerId: consumerId,
      startedAt: Date.now(),
      visibilityTimeout: Date.now() + this.config.visibilityTimeout
    });

    this.statistics.dequeued++;
    console.log(`[Queue:${this.name}] Message ${message.id} dequeued by ${consumerId}`);
    return message;
  }

  async complete(messageId, consumerId) {
    const processing = this.processing.get(messageId);

    if (!processing || processing.consumerId !== consumerId) {
      return false;
    }

    this.processing.delete(messageId);
    this.statistics.completed++;
    console.log(`[Queue:${this.name}] Message ${messageId} completed by ${consumerId}`);
    return true;
  }

  async fail(messageId, consumerId, error) {
    const processing = this.processing.get(messageId);

    if (!processing || processing.consumerId !== consumerId) {
      return false;
    }

    const message = processing.message;
    message.metadata.retryCount++;
    this.processing.delete(messageId);

    if (message.metadata.retryCount >= this.config.maxRetries) {
      this.deadLetterQueue.push({
        ...message,
        failureReason: error.message,
        failedAt: Date.now()
      });
      this.statistics.movedToDLQ++;
      console.log(`[Queue:${this.name}] Message ${messageId} moved to DLQ after ${message.metadata.retryCount} retries`);
      return false;
    }

    this.queue.push(message);
    this.statistics.retried++;
    this.statistics.failed++;
    console.log(`[Queue:${this.name}] Message ${messageId} failed, retry ${message.metadata.retryCount}/${this.config.maxRetries}`);
    return true;
  }

  checkVisibilityTimeouts() {
    const now = Date.now();
    const timedOut = [];

    for (const [messageId, processing] of this.processing) {
      if (processing.visibilityTimeout <= now) {
        timedOut.push(processing.message);
        this.processing.delete(messageId);
      }
    }

    for (const message of timedOut) {
      message.metadata.retryCount++;
      if (message.metadata.retryCount < this.config.maxRetries) {
        this.queue.push(message);
        console.log(`[Queue:${this.name}] Message ${message.id} visibility timeout, requeued`);
      } else {
        this.deadLetterQueue.push(message);
        this.statistics.movedToDLQ++;
        console.log(`[Queue:${this.name}] Message ${message.id} timeout, moved to DLQ`);
      }
    }

    return timedOut.length;
  }

  getStatistics() {
    return {
      ...this.statistics,
      queueDepth: this.queue.length,
      processingCount: this.processing.size,
      dlqDepth: this.deadLetterQueue.length
    };
  }
}

class Consumer {
  constructor(id, processingFunction, config = {}) {
    this.id = id;
    this.processingFunction = processingFunction;
    this.config = {
      pollInterval: config.pollInterval || 1000,
      processingDelay: config.processingDelay || 100,
      failureRate: config.failureRate || 0,
      ...config
    };

    this.isRunning = false;
    this.queue = null;
    this.statistics = {
      processed: 0,
      failed: 0,
      totalProcessingTime: 0,
      idleTime: 0
    };
  }

  async start(queue) {
    this.queue = queue;
    this.isRunning = true;
    console.log(`[Consumer:${this.id}] Started`);

    while (this.isRunning) {
      const idleStart = Date.now();
      const message = await this.queue.dequeue(this.id);

      if (!message) {
        this.statistics.idleTime += Date.now() - idleStart;
        await new Promise(resolve => setTimeout(resolve, this.config.pollInterval));
        continue;
      }

      await this.processMessage(message);
    }

    console.log(`[Consumer:${this.id}] Stopped`);
  }

  async processMessage(message) {
    const startTime = Date.now();

    console.log(`[Consumer:${this.id}] Processing message ${message.id}...`);

    await new Promise(resolve => setTimeout(resolve, this.config.processingDelay));

    const shouldFail = Math.random() < this.config.failureRate;

    if (shouldFail) {
      const error = new Error('Processing failed (simulated)');
      await this.queue.fail(message.id, this.id, error);
      this.statistics.failed++;
      console.log(`[Consumer:${this.id}] Failed to process message ${message.id}`);
    } else {
      const result = await this.processingFunction(message.payload);
      await this.queue.complete(message.id, this.id);
      this.statistics.processed++;
      console.log(`[Consumer:${this.id}] Completed message ${message.id}`);
    }

    const duration = Date.now() - startTime;
    this.statistics.totalProcessingTime += duration;
  }

  stop() {
    this.isRunning = false;
  }

  getStatistics() {
    const avgProcessingTime = this.statistics.processed > 0
      ? this.statistics.totalProcessingTime / (this.statistics.processed + this.statistics.failed)
      : 0;

    return {
      ...this.statistics,
      averageProcessingTime: Math.round(avgProcessingTime),
      isRunning: this.isRunning
    };
  }
}

class CompetingConsumers {
  constructor(config = {}) {
    this.config = {
      queueName: config.queueName || 'work-queue',
      consumerCount: config.consumerCount || 3,
      visibilityTimeout: config.visibilityTimeout || 30000,
      maxRetries: config.maxRetries || 3,
      ...config
    };

    this.queue = new MessageQueue(this.config.queueName, {
      visibilityTimeout: this.config.visibilityTimeout,
      maxRetries: this.config.maxRetries
    });

    this.consumers = [];
    this.monitorInterval = null;
  }

  createConsumers(processingFunction, consumerConfig = {}) {
    for (let i = 0; i < this.config.consumerCount; i++) {
      const consumer = new Consumer(
        `consumer-${i + 1}`,
        processingFunction,
        consumerConfig
      );
      this.consumers.push(consumer);
    }
    console.log(`[CompetingConsumers] Created ${this.config.consumerCount} consumers`);
  }

  async start() {
    console.log('[CompetingConsumers] Starting all consumers...\n');

    const consumerPromises = this.consumers.map(consumer =>
      consumer.start(this.queue)
    );

    this.monitorInterval = setInterval(() => {
      this.queue.checkVisibilityTimeouts();
    }, 5000);

    return consumerPromises;
  }

  async stop() {
    console.log('\n[CompetingConsumers] Stopping all consumers...');

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    for (const consumer of this.consumers) {
      consumer.stop();
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('[CompetingConsumers] All consumers stopped');
  }

  async enqueueMessages(messages) {
    console.log(`[CompetingConsumers] Enqueuing ${messages.length} messages...\n`);

    for (const message of messages) {
      await this.queue.enqueue(message);
    }
  }

  getStatistics() {
    const consumerStats = {};
    for (const consumer of this.consumers) {
      consumerStats[consumer.id] = consumer.getStatistics();
    }

    return {
      queue: this.queue.getStatistics(),
      consumers: consumerStats,
      totalConsumers: this.consumers.length
    };
  }

  printStatistics() {
    const stats = this.getStatistics();

    console.log('\n========== Competing Consumers Statistics ==========');
    console.log(`Total Consumers: ${stats.totalConsumers}\n`);

    console.log('Queue:');
    console.log(`  Enqueued: ${stats.queue.enqueued}`);
    console.log(`  Dequeued: ${stats.queue.dequeued}`);
    console.log(`  Completed: ${stats.queue.completed}`);
    console.log(`  Failed: ${stats.queue.failed}`);
    console.log(`  Retried: ${stats.queue.retried}`);
    console.log(`  Moved to DLQ: ${stats.queue.movedToDLQ}`);
    console.log(`  Current Queue Depth: ${stats.queue.queueDepth}`);
    console.log(`  Processing: ${stats.queue.processingCount}`);
    console.log(`  DLQ Depth: ${stats.queue.dlqDepth}`);

    console.log('\nConsumers:');
    let totalProcessed = 0;
    let totalFailed = 0;
    for (const [id, consumerStats] of Object.entries(stats.consumers)) {
      console.log(`  ${id}:`);
      console.log(`    Processed: ${consumerStats.processed}`);
      console.log(`    Failed: ${consumerStats.failed}`);
      console.log(`    Avg Processing Time: ${consumerStats.averageProcessingTime}ms`);
      console.log(`    Idle Time: ${consumerStats.idleTime}ms`);
      totalProcessed += consumerStats.processed;
      totalFailed += consumerStats.failed;
    }

    console.log(`\nTotal Processed: ${totalProcessed}`);
    console.log(`Total Failed: ${totalFailed}`);
    console.log('===================================================\n');
  }

  execute() {
    console.log('CompetingConsumers Pattern Demonstration');
    console.log('========================================\n');
    console.log('Configuration:');
    console.log(`  Queue Name: ${this.config.queueName}`);
    console.log(`  Consumer Count: ${this.config.consumerCount}`);
    console.log(`  Visibility Timeout: ${this.config.visibilityTimeout}ms`);
    console.log(`  Max Retries: ${this.config.maxRetries}`);
    console.log('');

    return {
      success: true,
      pattern: 'CompetingConsumers',
      config: this.config,
      components: {
        queue: this.queue.name,
        consumers: this.consumers.length
      }
    };
  }
}

async function demonstrateCompetingConsumers() {
  console.log('Starting Competing Consumers Pattern Demonstration\n');

  const system = new CompetingConsumers({
    queueName: 'order-processing-queue',
    consumerCount: 5,
    visibilityTimeout: 10000,
    maxRetries: 2
  });

  system.execute();

  const processingFunction = async (order) => {
    return {
      orderId: order.orderId,
      processed: true,
      processedAt: Date.now()
    };
  };

  system.createConsumers(processingFunction, {
    pollInterval: 100,
    processingDelay: 50 + Math.random() * 100,
    failureRate: 0.1
  });

  const orders = [];
  for (let i = 1; i <= 20; i++) {
    orders.push({
      orderId: `ORD-${String(i).padStart(4, '0')}`,
      customerId: `CUST-${Math.floor(Math.random() * 1000)}`,
      amount: Math.floor(Math.random() * 500) + 50,
      items: Math.floor(Math.random() * 5) + 1
    });
  }

  await system.enqueueMessages(orders);

  const consumerPromises = system.start();

  await new Promise(resolve => setTimeout(resolve, 3000));

  await system.stop();

  system.printStatistics();
}

if (require.main === module) {
  demonstrateCompetingConsumers().catch(console.error);
}

module.exports = CompetingConsumers;
