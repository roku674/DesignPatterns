/**
 * PipesAndFiltersCloud Pattern
 *
 * Cloud-native implementation of Pipes and Filters using serverless functions,
 * message queues, and auto-scaling. Each filter is a microservice that can scale independently.
 *
 * Benefits:
 * - Auto-scaling: Each filter scales based on load
 * - Fault isolation: Failure in one filter doesn't affect others
 * - Cost optimization: Pay only for actual processing time
 * - Flexibility: Easy to deploy and update individual filters
 *
 * Use Cases:
 * - Large-scale data processing pipelines
 * - Real-time stream processing
 * - Video transcoding services
 * - ETL workflows in the cloud
 */

class CloudMessageQueue {
  constructor(name, config = {}) {
    this.name = name;
    this.config = {
      maxRetries: config.maxRetries || 3,
      visibilityTimeout: config.visibilityTimeout || 30000,
      dlqEnabled: config.dlqEnabled !== false,
      ...config
    };

    this.queue = [];
    this.deadLetterQueue = [];
    this.inflightMessages = new Map();
    this.statistics = {
      enqueued: 0,
      dequeued: 0,
      dlqMessages: 0,
      retriedMessages: 0
    };
  }

  async enqueue(message) {
    const queueMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      body: message,
      attributes: {
        enqueuedAt: Date.now(),
        retryCount: 0,
        firstEnqueuedAt: Date.now()
      }
    };

    this.queue.push(queueMessage);
    this.statistics.enqueued++;
    console.log(`[CloudQueue:${this.name}] Message enqueued: ${queueMessage.id}`);
    return queueMessage.id;
  }

  async dequeue() {
    if (this.queue.length === 0) {
      return null;
    }

    const message = this.queue.shift();
    const visibilityHandle = {
      messageId: message.id,
      expiresAt: Date.now() + this.config.visibilityTimeout
    };

    this.inflightMessages.set(message.id, {
      message: message,
      handle: visibilityHandle
    });

    this.statistics.dequeued++;
    console.log(`[CloudQueue:${this.name}] Message dequeued: ${message.id} (visibility: ${this.config.visibilityTimeout}ms)`);

    return {
      message: message,
      receiptHandle: visibilityHandle
    };
  }

  async deleteMessage(receiptHandle) {
    const inflight = this.inflightMessages.get(receiptHandle.messageId);
    if (inflight) {
      this.inflightMessages.delete(receiptHandle.messageId);
      console.log(`[CloudQueue:${this.name}] Message deleted: ${receiptHandle.messageId}`);
      return true;
    }
    return false;
  }

  async changeMessageVisibility(receiptHandle, newTimeout) {
    const inflight = this.inflightMessages.get(receiptHandle.messageId);
    if (inflight) {
      inflight.handle.expiresAt = Date.now() + newTimeout;
      console.log(`[CloudQueue:${this.name}] Visibility extended: ${receiptHandle.messageId}`);
      return true;
    }
    return false;
  }

  async retryOrDLQ(message) {
    message.attributes.retryCount++;

    if (message.attributes.retryCount >= this.config.maxRetries) {
      if (this.config.dlqEnabled) {
        this.deadLetterQueue.push(message);
        this.statistics.dlqMessages++;
        console.log(`[CloudQueue:${this.name}] Message moved to DLQ: ${message.id} (retries: ${message.attributes.retryCount})`);
      }
      return false;
    }

    this.queue.push(message);
    this.statistics.retriedMessages++;
    console.log(`[CloudQueue:${this.name}] Message retried: ${message.id} (attempt ${message.attributes.retryCount})`);
    return true;
  }

  checkVisibilityTimeouts() {
    const now = Date.now();
    const expiredMessages = [];

    for (const [messageId, inflight] of this.inflightMessages) {
      if (inflight.handle.expiresAt <= now) {
        expiredMessages.push(inflight.message);
      }
    }

    for (const message of expiredMessages) {
      this.inflightMessages.delete(message.id);
      this.retryOrDLQ(message);
    }

    return expiredMessages.length;
  }

  getStatistics() {
    return {
      ...this.statistics,
      queueDepth: this.queue.length,
      inflightCount: this.inflightMessages.size,
      dlqDepth: this.deadLetterQueue.length
    };
  }
}

class ServerlessFilter {
  constructor(name, handlerFunction, config = {}) {
    this.name = name;
    this.handlerFunction = handlerFunction;
    this.config = {
      timeout: config.timeout || 60000,
      memory: config.memory || 128,
      concurrency: config.concurrency || 10,
      autoscaling: config.autoscaling !== false,
      minInstances: config.minInstances || 0,
      maxInstances: config.maxInstances || 100,
      ...config
    };

    this.instances = [];
    this.activeInstances = 0;
    this.statistics = {
      invocations: 0,
      errors: 0,
      coldStarts: 0,
      totalDuration: 0,
      throttledRequests: 0
    };
  }

  async invoke(event) {
    if (this.activeInstances >= this.config.maxInstances) {
      this.statistics.throttledRequests++;
      throw new Error(`Function ${this.name} throttled: max instances reached`);
    }

    const instanceId = `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const isColdStart = this.activeInstances === 0;

    if (isColdStart) {
      this.statistics.coldStarts++;
      console.log(`[ServerlessFilter:${this.name}] Cold start for instance: ${instanceId}`);
    }

    this.activeInstances++;
    this.statistics.invocations++;

    const startTime = Date.now();

    let result;
    let error = null;

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Function timeout')), this.config.timeout);
    });

    const executionPromise = (async () => {
      if (isColdStart) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return await this.handlerFunction(event, {
        instanceId: instanceId,
        memory: this.config.memory,
        timeout: this.config.timeout
      });
    })();

    const duration = Date.now() - startTime;
    this.statistics.totalDuration += duration;

    this.activeInstances--;

    if (error) {
      this.statistics.errors++;
      throw error;
    }

    console.log(`[ServerlessFilter:${this.name}] Invocation completed: ${instanceId} (${duration}ms)`);

    return {
      result: result,
      metadata: {
        instanceId: instanceId,
        duration: duration,
        coldStart: isColdStart,
        memory: this.config.memory
      }
    };
  }

  getStatistics() {
    const avgDuration = this.statistics.invocations > 0
      ? this.statistics.totalDuration / this.statistics.invocations
      : 0;

    return {
      ...this.statistics,
      activeInstances: this.activeInstances,
      averageDuration: Math.round(avgDuration),
      coldStartRate: this.statistics.invocations > 0
        ? (this.statistics.coldStarts / this.statistics.invocations * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

class PipesAndFiltersCloud {
  constructor(config = {}) {
    this.config = {
      region: config.region || 'us-east-1',
      enableMonitoring: config.enableMonitoring !== false,
      enableTracing: config.enableTracing !== false,
      deadLetterQueueEnabled: config.deadLetterQueueEnabled !== false,
      ...config
    };

    this.queues = new Map();
    this.filters = new Map();
    this.pipeline = [];
    this.monitoringData = [];
  }

  createQueue(name, config = {}) {
    if (this.queues.has(name)) {
      throw new Error(`Queue ${name} already exists`);
    }

    const queue = new CloudMessageQueue(name, config);
    this.queues.set(name, queue);
    console.log(`[PipesAndFiltersCloud] Created queue: ${name}`);
    return queue;
  }

  createFilter(name, handlerFunction, config = {}) {
    if (this.filters.has(name)) {
      throw new Error(`Filter ${name} already exists`);
    }

    const filter = new ServerlessFilter(name, handlerFunction, config);
    this.filters.set(name, filter);
    console.log(`[PipesAndFiltersCloud] Created serverless filter: ${name}`);
    return filter;
  }

  connectFilter(filterName, inputQueueName, outputQueueName) {
    const filter = this.filters.get(filterName);
    const inputQueue = this.queues.get(inputQueueName);
    const outputQueue = outputQueueName ? this.queues.get(outputQueueName) : null;

    if (!filter || !inputQueue) {
      throw new Error('Filter or queue not found');
    }

    this.pipeline.push({
      filter: filter,
      inputQueue: inputQueue,
      outputQueue: outputQueue
    });

    console.log(`[PipesAndFiltersCloud] Connected: ${inputQueueName} -> ${filterName} -> ${outputQueueName || 'none'}`);
  }

  async processMessages(batchSize = 10) {
    const processingPromises = [];

    for (const stage of this.pipeline) {
      for (let i = 0; i < batchSize; i++) {
        const messageWrapper = await stage.inputQueue.dequeue();

        if (!messageWrapper) {
          break;
        }

        const promise = this.processMessage(stage, messageWrapper);
        processingPromises.push(promise);
      }
    }

    const results = await Promise.allSettled(processingPromises);

    for (const queue of this.queues.values()) {
      queue.checkVisibilityTimeouts();
    }

    return results;
  }

  async processMessage(stage, messageWrapper) {
    const startTime = Date.now();

    const invokeResult = await stage.filter.invoke({
      Records: [{
        body: messageWrapper.message.body,
        messageId: messageWrapper.message.id,
        attributes: messageWrapper.message.attributes
      }]
    });

    if (invokeResult.result && stage.outputQueue) {
      await stage.outputQueue.enqueue(invokeResult.result);
    }

    await stage.inputQueue.deleteMessage(messageWrapper.receiptHandle);

    const duration = Date.now() - startTime;

    if (this.config.enableMonitoring) {
      this.monitoringData.push({
        timestamp: new Date().toISOString(),
        filterName: stage.filter.name,
        messageId: messageWrapper.message.id,
        duration: duration,
        success: true
      });
    }

    return invokeResult;
  }

  async processPipeline() {
    console.log('\n[PipesAndFiltersCloud] Starting pipeline processing...\n');

    let totalProcessed = 0;
    let iterations = 0;
    const maxIterations = 100;

    while (iterations < maxIterations) {
      const results = await this.processMessages(5);

      if (results.length === 0) {
        break;
      }

      totalProcessed += results.length;
      iterations++;

      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log(`\n[PipesAndFiltersCloud] Pipeline processing completed. Total messages: ${totalProcessed}\n`);
    return totalProcessed;
  }

  getStatistics() {
    const queueStats = {};
    for (const [name, queue] of this.queues) {
      queueStats[name] = queue.getStatistics();
    }

    const filterStats = {};
    for (const [name, filter] of this.filters) {
      filterStats[name] = filter.getStatistics();
    }

    return {
      region: this.config.region,
      queues: queueStats,
      filters: filterStats,
      pipelineStages: this.pipeline.length,
      monitoringEvents: this.monitoringData.length
    };
  }

  printStatistics() {
    const stats = this.getStatistics();

    console.log('\n========== Pipes and Filters Cloud Statistics ==========');
    console.log(`Region: ${stats.region}`);
    console.log(`Pipeline Stages: ${stats.pipelineStages}\n`);

    console.log('Queues:');
    for (const [name, queueStats] of Object.entries(stats.queues)) {
      console.log(`  ${name}:`);
      console.log(`    Enqueued: ${queueStats.enqueued}`);
      console.log(`    Dequeued: ${queueStats.dequeued}`);
      console.log(`    Queue Depth: ${queueStats.queueDepth}`);
      console.log(`    Inflight: ${queueStats.inflightCount}`);
      console.log(`    DLQ Messages: ${queueStats.dlqMessages}`);
      console.log(`    Retried: ${queueStats.retriedMessages}`);
    }

    console.log('\nServerless Filters:');
    for (const [name, filterStats] of Object.entries(stats.filters)) {
      console.log(`  ${name}:`);
      console.log(`    Invocations: ${filterStats.invocations}`);
      console.log(`    Errors: ${filterStats.errors}`);
      console.log(`    Active Instances: ${filterStats.activeInstances}`);
      console.log(`    Cold Starts: ${filterStats.coldStarts} (${filterStats.coldStartRate})`);
      console.log(`    Avg Duration: ${filterStats.averageDuration}ms`);
      console.log(`    Throttled: ${filterStats.throttledRequests}`);
    }

    console.log('=======================================================\n');
  }

  execute() {
    console.log('PipesAndFiltersCloud Pattern Demonstration');
    console.log('==========================================\n');
    console.log('Configuration:');
    console.log(`  Region: ${this.config.region}`);
    console.log(`  Monitoring: ${this.config.enableMonitoring}`);
    console.log(`  Tracing: ${this.config.enableTracing}`);
    console.log(`  DLQ Enabled: ${this.config.deadLetterQueueEnabled}`);
    console.log('');

    return {
      success: true,
      pattern: 'PipesAndFiltersCloud',
      config: this.config,
      components: {
        queues: this.queues.size,
        filters: this.filters.size,
        pipelineStages: this.pipeline.length
      }
    };
  }
}

async function demonstratePipesAndFiltersCloud() {
  console.log('Starting Pipes and Filters Cloud Pattern Demonstration\n');

  const cloudPipeline = new PipesAndFiltersCloud({
    region: 'us-west-2',
    enableMonitoring: true,
    enableTracing: true
  });

  console.log('--- Setting up Cloud Pipeline ---\n');

  cloudPipeline.createQueue('raw-data-queue', {
    maxRetries: 3,
    visibilityTimeout: 30000
  });
  cloudPipeline.createQueue('validated-queue');
  cloudPipeline.createQueue('enriched-queue');
  cloudPipeline.createQueue('processed-queue');

  cloudPipeline.createFilter('dataValidator', async (event, context) => {
    const record = event.Records[0];
    console.log(`    [Validator:${context.instanceId}] Validating data...`);

    await new Promise(resolve => setTimeout(resolve, 20));

    return {
      ...record.body,
      validated: true,
      validatedAt: Date.now()
    };
  }, {
    memory: 256,
    timeout: 30000,
    maxInstances: 50
  });

  cloudPipeline.createFilter('dataEnricher', async (event, context) => {
    const record = event.Records[0];
    console.log(`    [Enricher:${context.instanceId}] Enriching data...`);

    await new Promise(resolve => setTimeout(resolve, 30));

    return {
      ...record.body,
      enrichedData: { category: 'processed', priority: 'high' },
      enrichedAt: Date.now()
    };
  }, {
    memory: 512,
    timeout: 60000,
    maxInstances: 100
  });

  cloudPipeline.createFilter('dataProcessor', async (event, context) => {
    const record = event.Records[0];
    console.log(`    [Processor:${context.instanceId}] Processing data...`);

    await new Promise(resolve => setTimeout(resolve, 40));

    return {
      ...record.body,
      processed: true,
      processedAt: Date.now(),
      result: 'success'
    };
  }, {
    memory: 1024,
    timeout: 90000,
    maxInstances: 200
  });

  cloudPipeline.connectFilter('dataValidator', 'raw-data-queue', 'validated-queue');
  cloudPipeline.connectFilter('dataEnricher', 'validated-queue', 'enriched-queue');
  cloudPipeline.connectFilter('dataProcessor', 'enriched-queue', 'processed-queue');

  cloudPipeline.execute();

  console.log('\n--- Sending Data to Pipeline ---\n');

  const rawQueue = cloudPipeline.queues.get('raw-data-queue');
  const dataItems = [
    { id: 1, type: 'transaction', amount: 100.50 },
    { id: 2, type: 'user-event', action: 'login' },
    { id: 3, type: 'transaction', amount: 250.75 },
    { id: 4, type: 'user-event', action: 'purchase' },
    { id: 5, type: 'transaction', amount: 500.00 }
  ];

  for (const item of dataItems) {
    await rawQueue.enqueue(item);
  }

  console.log('\n--- Processing Pipeline ---\n');
  await cloudPipeline.processPipeline();

  console.log('\n--- Retrieving Processed Results ---\n');
  const processedQueue = cloudPipeline.queues.get('processed-queue');
  let result;
  while ((result = await processedQueue.dequeue()) !== null) {
    console.log('Processed result:', {
      id: result.message.body.id,
      type: result.message.body.type,
      validated: result.message.body.validated,
      enriched: result.message.body.enrichedData,
      result: result.message.body.result
    });
    await processedQueue.deleteMessage(result.receiptHandle);
  }

  cloudPipeline.printStatistics();
}

if (require.main === module) {
  demonstratePipesAndFiltersCloud().catch(console.error);
}

module.exports = PipesAndFiltersCloud;
