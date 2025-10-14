/**
 * Composed Message Processor Pattern
 *
 * Chains multiple message processors together to form a processing pipeline.
 * Messages flow through each processor sequentially, with each processor
 * transforming or enriching the message.
 *
 * Key Components:
 * - Processor: Individual processing step
 * - Pipeline: Chain of processors
 * - Message: Data being processed
 * - MessageBroker: Pub/sub infrastructure
 */

const EventEmitter = require('events');

class Message {
  constructor(id, payload, headers = {}) {
    this.id = id;
    this.payload = payload;
    this.headers = headers;
    this.timestamp = Date.now();
    this.processingHistory = [];
  }

  addProcessingStep(processorId, input, output, duration, error = null) {
    this.processingHistory.push({
      processorId,
      input: JSON.stringify(input),
      output: error ? null : JSON.stringify(output),
      duration,
      error: error ? error.message : null,
      timestamp: Date.now()
    });
  }

  clone() {
    const cloned = new Message(this.id, { ...this.payload }, { ...this.headers });
    cloned.timestamp = this.timestamp;
    cloned.processingHistory = [...this.processingHistory];
    return cloned;
  }
}

class Processor extends EventEmitter {
  constructor(id, handler, options = {}) {
    super();
    this.id = id;
    this.handler = handler;
    this.isActive = options.isActive !== undefined ? options.isActive : true;
    this.continueOnError = options.continueOnError !== undefined ? options.continueOnError : false;
    this.processCount = 0;
    this.errorCount = 0;
    this.totalProcessingTime = 0;
  }

  async process(message) {
    if (!this.isActive) {
      return { success: true, message, skipped: true };
    }

    const startTime = Date.now();
    const inputPayload = { ...message.payload };

    try {
      const result = await this.handler(message);
      const duration = Date.now() - startTime;

      this.processCount++;
      this.totalProcessingTime += duration;

      const outputMessage = result instanceof Message ? result : message;
      outputMessage.addProcessingStep(this.id, inputPayload, outputMessage.payload, duration);

      this.emit('processed', { message: outputMessage, duration });

      return {
        success: true,
        message: outputMessage,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.errorCount++;
      this.totalProcessingTime += duration;

      message.addProcessingStep(this.id, inputPayload, null, duration, error);

      this.emit('error', { message, error, duration });

      if (this.continueOnError) {
        return {
          success: false,
          message,
          error: error.message,
          continued: true
        };
      }

      throw error;
    }
  }

  activate() {
    this.isActive = true;
    this.emit('activated');
  }

  deactivate() {
    this.isActive = false;
    this.emit('deactivated');
  }

  getStats() {
    return {
      id: this.id,
      isActive: this.isActive,
      processCount: this.processCount,
      errorCount: this.errorCount,
      avgProcessingTime: this.processCount > 0 ? (this.totalProcessingTime / this.processCount).toFixed(2) : 0
    };
  }
}

class Pipeline extends EventEmitter {
  constructor(name, options = {}) {
    super();
    this.name = name;
    this.processors = [];
    this.continueOnError = options.continueOnError !== undefined ? options.continueOnError : false;
    this.parallelExecution = options.parallelExecution || false;
    this.enableLogging = options.enableLogging !== undefined ? options.enableLogging : true;
    this.processedCount = 0;
    this.failedCount = 0;
  }

  addProcessor(processor) {
    this.processors.push(processor);
    this.emit('processorAdded', processor);
    return this;
  }

  removeProcessor(id) {
    const index = this.processors.findIndex(p => p.id === id);
    if (index > -1) {
      const processor = this.processors.splice(index, 1)[0];
      this.emit('processorRemoved', processor);
      return true;
    }
    return false;
  }

  async process(message) {
    const startTime = Date.now();
    let currentMessage = message.clone();

    try {
      if (this.parallelExecution) {
        const results = await Promise.all(
          this.processors.map(processor => processor.process(currentMessage.clone()))
        );

        const failed = results.filter(r => !r.success);
        if (failed.length > 0 && !this.continueOnError) {
          throw new Error(`${failed.length} processor(s) failed`);
        }

        this.processedCount++;
        const duration = Date.now() - startTime;

        return {
          success: true,
          message: currentMessage,
          results,
          duration
        };

      } else {
        for (const processor of this.processors) {
          if (this.enableLogging) {
            console.log(`[${this.name}] Processing with ${processor.id}`);
          }

          const result = await processor.process(currentMessage);

          if (!result.success && !this.continueOnError) {
            this.failedCount++;
            throw new Error(`Processor ${processor.id} failed: ${result.error}`);
          }

          if (result.message) {
            currentMessage = result.message;
          }
        }

        this.processedCount++;
        const duration = Date.now() - startTime;

        if (this.enableLogging) {
          console.log(`[${this.name}] Completed processing in ${duration}ms`);
        }

        this.emit('processingComplete', { message: currentMessage, duration });

        return {
          success: true,
          message: currentMessage,
          duration
        };
      }

    } catch (error) {
      this.failedCount++;
      const duration = Date.now() - startTime;

      if (this.enableLogging) {
        console.error(`[${this.name}] Processing failed:`, error);
      }

      this.emit('processingError', { message: currentMessage, error, duration });

      return {
        success: false,
        message: currentMessage,
        error: error.message,
        duration
      };
    }
  }

  getStats() {
    return {
      name: this.name,
      processorCount: this.processors.length,
      processedCount: this.processedCount,
      failedCount: this.failedCount,
      processors: this.processors.map(p => p.getStats())
    };
  }

  reset() {
    this.processedCount = 0;
    this.failedCount = 0;
    this.emit('reset');
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

class ComposedMessageProcessor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.broker = options.broker || new MessageBroker();
    this.pipelines = new Map();
    this.inputChannel = options.inputChannel || 'input';
    this.outputChannel = options.outputChannel || 'output';
    this.enableLogging = options.enableLogging !== undefined ? options.enableLogging : true;

    if (!this.broker.channels.has(this.inputChannel)) {
      this.broker.createChannel(this.inputChannel);
    }
    if (!this.broker.channels.has(this.outputChannel)) {
      this.broker.createChannel(this.outputChannel);
    }

    this.broker.subscribe(this.inputChannel, async (msg) => {
      await this.processMessage(msg);
    });
  }

  addPipeline(pipeline) {
    this.pipelines.set(pipeline.name, pipeline);
    this.emit('pipelineAdded', pipeline);
    return this;
  }

  async processMessage(message, pipelineName = null) {
    if (pipelineName) {
      const pipeline = this.pipelines.get(pipelineName);
      if (!pipeline) {
        throw new Error(`Pipeline ${pipelineName} not found`);
      }

      const result = await pipeline.process(message);
      if (result.success) {
        this.broker.publish(this.outputChannel, result.message);
      }
      return result;
    }

    const results = [];
    for (const [name, pipeline] of this.pipelines) {
      if (this.enableLogging) {
        console.log(`Processing with pipeline ${name}`);
      }
      const result = await pipeline.process(message);
      results.push({ pipeline: name, ...result });
    }

    return results;
  }

  getStats() {
    const stats = {
      pipelineCount: this.pipelines.size,
      pipelines: {},
      broker: this.broker.getStats()
    };

    this.pipelines.forEach((pipeline, name) => {
      stats.pipelines[name] = pipeline.getStats();
    });

    return stats;
  }
}

async function demonstrateComposedMessageProcessor() {
  console.log('=== Composed Message Processor Pattern Demo ===\n');

  const composer = new ComposedMessageProcessor({
    inputChannel: 'raw-messages',
    outputChannel: 'processed-messages',
    enableLogging: true
  });

  const pipeline = new Pipeline('order-processing', { continueOnError: false });

  pipeline.addProcessor(new Processor('validate', async (msg) => {
    if (!msg.payload.orderId) {
      throw new Error('Missing orderId');
    }
    msg.payload.validated = true;
    return msg;
  }));

  pipeline.addProcessor(new Processor('enrich', async (msg) => {
    msg.payload.enrichedAt = Date.now();
    msg.payload.currency = 'USD';
    return msg;
  }));

  pipeline.addProcessor(new Processor('calculate', async (msg) => {
    const tax = msg.payload.amount * 0.1;
    msg.payload.tax = tax;
    msg.payload.total = msg.payload.amount + tax;
    return msg;
  }));

  composer.addPipeline(pipeline);

  composer.broker.subscribe('processed-messages', (msg) => {
    console.log(`[OUTPUT] Processed order: ${JSON.stringify(msg.payload, null, 2)}`);
  });

  const message = new Message('MSG-001', {
    orderId: 'ORD-123',
    amount: 100.00,
    customerId: 'CUST-456'
  });

  await composer.processMessage(message, 'order-processing');

  console.log('\n=== Composer Statistics ===');
  console.log(JSON.stringify(composer.getStats(), null, 2));

  return composer;
}

module.exports = ComposedMessageProcessor;
module.exports.Message = Message;
module.exports.Processor = Processor;
module.exports.Pipeline = Pipeline;
module.exports.MessageBroker = MessageBroker;
module.exports.demonstrate = demonstrateComposedMessageProcessor;

if (require.main === module) {
  demonstrateComposedMessageProcessor().catch(console.error);
}
