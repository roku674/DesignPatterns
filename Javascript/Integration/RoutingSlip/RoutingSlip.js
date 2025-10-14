/**
 * Routing Slip Pattern
 *
 * Attaches a routing slip to a message that specifies a sequence of processing
 * steps. Each processor in the chain reads the slip, processes the message,
 * and forwards it to the next step.
 *
 * Key Components:
 * - RoutingSlip: Defines the sequence of processing steps
 * - Processor: Individual processing step
 * - Message: Data with attached routing slip
 * - MessageBroker: Pub/sub infrastructure
 */

const EventEmitter = require('events');

class Message {
  constructor(id, payload, headers = {}) {
    this.id = id;
    this.payload = payload;
    this.headers = headers;
    this.timestamp = Date.now();
    this.routingSlip = headers.routingSlip || null;
  }

  clone() {
    const cloned = new Message(this.id, { ...this.payload }, { ...this.headers });
    cloned.timestamp = this.timestamp;
    cloned.routingSlip = this.routingSlip ? { ...this.routingSlip } : null;
    return cloned;
  }
}

class RoutingSlip {
  constructor(steps) {
    this.steps = steps || [];
    this.currentStepIndex = 0;
    this.history = [];
    this.createdAt = Date.now();
  }

  hasNext() {
    return this.currentStepIndex < this.steps.length;
  }

  getCurrentStep() {
    if (!this.hasNext()) {
      return null;
    }
    return this.steps[this.currentStepIndex];
  }

  getNextStep() {
    if (!this.hasNext()) {
      return null;
    }
    const step = this.steps[this.currentStepIndex];
    this.currentStepIndex++;
    return step;
  }

  addHistoryEntry(step, success, duration, error = null) {
    this.history.push({
      step,
      success,
      duration,
      error: error ? error.message : null,
      timestamp: Date.now()
    });
  }

  isComplete() {
    return this.currentStepIndex >= this.steps.length;
  }

  getProgress() {
    return {
      current: this.currentStepIndex,
      total: this.steps.length,
      percentage: this.steps.length > 0 ? (this.currentStepIndex / this.steps.length * 100).toFixed(2) : 100
    };
  }

  toJSON() {
    return {
      steps: this.steps,
      currentStepIndex: this.currentStepIndex,
      history: this.history,
      progress: this.getProgress(),
      createdAt: this.createdAt
    };
  }
}

class Processor extends EventEmitter {
  constructor(id, handler, options = {}) {
    super();
    this.id = id;
    this.handler = handler;
    this.processCount = 0;
    this.errorCount = 0;
    this.totalProcessingTime = 0;
  }

  async process(message) {
    const startTime = Date.now();

    try {
      const result = await this.handler(message);
      const duration = Date.now() - startTime;

      this.processCount++;
      this.totalProcessingTime += duration;

      const outputMessage = result instanceof Message ? result : message;

      if (outputMessage.routingSlip) {
        outputMessage.routingSlip.addHistoryEntry(this.id, true, duration);
      }

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

      if (message.routingSlip) {
        message.routingSlip.addHistoryEntry(this.id, false, duration, error);
      }

      this.emit('error', { message, error, duration });

      throw error;
    }
  }

  getStats() {
    return {
      id: this.id,
      processCount: this.processCount,
      errorCount: this.errorCount,
      avgProcessingTime: this.processCount > 0 ? (this.totalProcessingTime / this.processCount).toFixed(2) : 0
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

class RoutingSlipRouter extends EventEmitter {
  constructor(options = {}) {
    super();
    this.broker = options.broker || new MessageBroker();
    this.processors = new Map();
    this.inputChannel = options.inputChannel || 'input';
    this.outputChannel = options.outputChannel || 'output';
    this.enableLogging = options.enableLogging !== undefined ? options.enableLogging : true;
    this.processedCount = 0;
    this.failedCount = 0;

    if (!this.broker.channels.has(this.inputChannel)) {
      this.broker.createChannel(this.inputChannel);
    }
    if (!this.broker.channels.has(this.outputChannel)) {
      this.broker.createChannel(this.outputChannel);
    }

    this.broker.subscribe(this.inputChannel, async (msg) => {
      await this.route(msg);
    });
  }

  registerProcessor(processor) {
    this.processors.set(processor.id, processor);
    this.emit('processorRegistered', processor);
    return this;
  }

  unregisterProcessor(id) {
    const processor = this.processors.get(id);
    if (processor) {
      this.processors.delete(id);
      this.emit('processorUnregistered', processor);
      return true;
    }
    return false;
  }

  async route(message) {
    if (!message.routingSlip) {
      throw new Error('Message must have a routing slip');
    }

    const slip = message.routingSlip;

    try {
      while (slip.hasNext()) {
        const nextStep = slip.getNextStep();

        if (this.enableLogging) {
          console.log(`Processing step ${slip.currentStepIndex}/${slip.steps.length}: ${nextStep}`);
        }

        const processor = this.processors.get(nextStep);

        if (!processor) {
          throw new Error(`Processor ${nextStep} not found`);
        }

        const result = await processor.process(message);

        if (!result.success) {
          throw new Error(`Processor ${nextStep} failed`);
        }

        message = result.message;
      }

      if (this.enableLogging) {
        console.log(`Routing slip completed for message ${message.id}`);
      }

      this.broker.publish(this.outputChannel, message);
      this.processedCount++;

      this.emit('slipComplete', {
        messageId: message.id,
        steps: slip.steps.length,
        history: slip.history
      });

      return {
        success: true,
        message
      };

    } catch (error) {
      this.failedCount++;

      if (this.enableLogging) {
        console.error(`Routing slip failed for message ${message.id}:`, error);
      }

      this.emit('slipError', {
        messageId: message.id,
        error,
        progress: slip.getProgress()
      });

      return {
        success: false,
        message,
        error: error.message
      };
    }
  }

  createMessage(id, payload, steps) {
    const slip = new RoutingSlip(steps);
    const message = new Message(id, payload, { routingSlip: slip });
    message.routingSlip = slip;
    return message;
  }

  getStats() {
    return {
      registeredProcessors: this.processors.size,
      processedCount: this.processedCount,
      failedCount: this.failedCount,
      processors: Array.from(this.processors.values()).map(p => p.getStats()),
      broker: this.broker.getStats()
    };
  }

  reset() {
    this.processedCount = 0;
    this.failedCount = 0;
    this.emit('reset');
  }
}

async function demonstrateRoutingSlip() {
  console.log('=== Routing Slip Pattern Demo ===\n');

  const router = new RoutingSlipRouter({
    inputChannel: 'orders',
    outputChannel: 'completed',
    enableLogging: true
  });

  router.registerProcessor(new Processor('validate', async (msg) => {
    console.log('[VALIDATE] Validating order...');
    if (!msg.payload.customerId) {
      throw new Error('Missing customerId');
    }
    msg.payload.validated = true;
    return msg;
  }));

  router.registerProcessor(new Processor('pricing', async (msg) => {
    console.log('[PRICING] Calculating prices...');
    await new Promise(resolve => setTimeout(resolve, 50));
    msg.payload.subtotal = msg.payload.items.reduce((sum, item) => sum + item.price, 0);
    msg.payload.tax = msg.payload.subtotal * 0.1;
    msg.payload.total = msg.payload.subtotal + msg.payload.tax;
    return msg;
  }));

  router.registerProcessor(new Processor('inventory', async (msg) => {
    console.log('[INVENTORY] Checking inventory...');
    await new Promise(resolve => setTimeout(resolve, 75));
    msg.payload.inventoryChecked = true;
    msg.payload.available = true;
    return msg;
  }));

  router.registerProcessor(new Processor('payment', async (msg) => {
    console.log('[PAYMENT] Processing payment...');
    await new Promise(resolve => setTimeout(resolve, 100));
    msg.payload.paymentId = `PAY-${Date.now()}`;
    msg.payload.paid = true;
    return msg;
  }));

  router.registerProcessor(new Processor('fulfillment', async (msg) => {
    console.log('[FULFILLMENT] Creating fulfillment order...');
    await new Promise(resolve => setTimeout(resolve, 50));
    msg.payload.fulfillmentId = `FUL-${Date.now()}`;
    msg.payload.status = 'processing';
    return msg;
  }));

  router.broker.subscribe('completed', (msg) => {
    console.log(`\n[COMPLETED] Order processed successfully!`);
    console.log(`Final payload: ${JSON.stringify(msg.payload, null, 2)}`);
    console.log(`\nRouting slip history:`);
    msg.routingSlip.history.forEach((entry, i) => {
      console.log(`  ${i + 1}. ${entry.step} - ${entry.success ? 'Success' : 'Failed'} (${entry.duration}ms)`);
    });
  });

  const message = router.createMessage('ORDER-001', {
    customerId: 'CUST-123',
    items: [
      { name: 'Widget', price: 29.99 },
      { name: 'Gadget', price: 49.99 }
    ]
  }, ['validate', 'pricing', 'inventory', 'payment', 'fulfillment']);

  await router.route(message);

  console.log('\n=== Router Statistics ===');
  console.log(JSON.stringify(router.getStats(), null, 2));

  return router;
}

module.exports = RoutingSlipRouter;
module.exports.Message = Message;
module.exports.RoutingSlip = RoutingSlip;
module.exports.Processor = Processor;
module.exports.MessageBroker = MessageBroker;
module.exports.demonstrate = demonstrateRoutingSlip;

if (require.main === module) {
  demonstrateRoutingSlip().catch(console.error);
}
