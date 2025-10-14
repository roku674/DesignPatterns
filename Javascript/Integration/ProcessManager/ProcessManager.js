/**
 * Process Manager Pattern (also known as Saga Pattern)
 *
 * Manages long-running business processes that span multiple steps and services.
 * Coordinates the flow, maintains state, handles errors, and can implement
 * compensating actions for rollback.
 *
 * Key Components:
 * - ProcessManager: Orchestrates the entire process
 * - ProcessInstance: Represents a single process execution
 * - ProcessStep: Individual step in the process
 * - MessageBroker: Pub/sub infrastructure
 */

const EventEmitter = require('events');

class Message {
  constructor(id, payload, headers = {}) {
    this.id = id;
    this.payload = payload;
    this.headers = headers;
    this.timestamp = Date.now();
    this.processId = headers.processId || null;
  }

  clone() {
    const cloned = new Message(this.id, { ...this.payload }, { ...this.headers });
    cloned.timestamp = this.timestamp;
    cloned.processId = this.processId;
    return cloned;
  }
}

class ProcessStep {
  constructor(id, handler, options = {}) {
    this.id = id;
    this.handler = handler;
    this.compensate = options.compensate || null;
    this.retryCount = options.retryCount || 0;
    this.timeout = options.timeout || 30000;
  }

  async execute(context) {
    const startTime = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Step timeout')), this.timeout);
      });

      const result = await Promise.race([
        this.handler(context),
        timeoutPromise
      ]);

      const duration = Date.now() - startTime;

      return {
        success: true,
        result,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error.message,
        duration
      };
    }
  }

  async executeCompensation(context) {
    if (!this.compensate) {
      return { success: true, message: 'No compensation defined' };
    }

    try {
      await this.compensate(context);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

class ProcessInstance extends EventEmitter {
  constructor(id, definition, initialData) {
    super();
    this.id = id;
    this.definition = definition;
    this.data = initialData;
    this.currentStepIndex = 0;
    this.completedSteps = [];
    this.status = 'pending';
    this.createdAt = Date.now();
    this.startedAt = null;
    this.completedAt = null;
    this.error = null;
  }

  start() {
    this.status = 'running';
    this.startedAt = Date.now();
    this.emit('started');
  }

  complete() {
    this.status = 'completed';
    this.completedAt = Date.now();
    this.emit('completed');
  }

  fail(error) {
    this.status = 'failed';
    this.error = error;
    this.completedAt = Date.now();
    this.emit('failed', error);
  }

  compensate() {
    this.status = 'compensating';
    this.emit('compensating');
  }

  compensated() {
    this.status = 'compensated';
    this.completedAt = Date.now();
    this.emit('compensated');
  }

  addCompletedStep(stepId, result) {
    this.completedSteps.push({
      stepId,
      result,
      timestamp: Date.now()
    });
  }

  getProgress() {
    const total = this.definition.steps.length;
    return {
      current: this.currentStepIndex,
      total,
      percentage: total > 0 ? (this.currentStepIndex / total * 100).toFixed(2) : 0,
      completedSteps: this.completedSteps.length
    };
  }

  getStats() {
    return {
      id: this.id,
      status: this.status,
      progress: this.getProgress(),
      duration: this.completedAt ? this.completedAt - this.startedAt : Date.now() - (this.startedAt || this.createdAt),
      error: this.error
    };
  }
}

class ProcessDefinition {
  constructor(name, steps, options = {}) {
    this.name = name;
    this.steps = steps;
    this.timeout = options.timeout || 300000;
    this.retryPolicy = options.retryPolicy || { maxRetries: 0 };
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

class ProcessManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.broker = options.broker || new MessageBroker();
    this.definitions = new Map();
    this.instances = new Map();
    this.outputChannel = options.outputChannel || 'process-output';
    this.enableLogging = options.enableLogging !== undefined ? options.enableLogging : true;
    this.startedCount = 0;
    this.completedCount = 0;
    this.failedCount = 0;

    if (!this.broker.channels.has(this.outputChannel)) {
      this.broker.createChannel(this.outputChannel);
    }
  }

  defineProcess(definition) {
    this.definitions.set(definition.name, definition);
    this.emit('processDefin ed', definition);
    return this;
  }

  async startProcess(definitionName, initialData) {
    const definition = this.definitions.get(definitionName);
    if (!definition) {
      throw new Error(`Process definition ${definitionName} not found`);
    }

    const processId = this.generateProcessId();
    const instance = new ProcessInstance(processId, definition, initialData);

    this.instances.set(processId, instance);
    this.startedCount++;

    if (this.enableLogging) {
      console.log(`Starting process ${processId} (${definitionName})`);
    }

    instance.start();

    try {
      await this.executeProcess(instance);

      instance.complete();
      this.completedCount++;

      if (this.enableLogging) {
        console.log(`Process ${processId} completed successfully`);
      }

      this.emit('processCompleted', { processId, instance });

      const result = new Message(`RESULT-${processId}`, {
        processId,
        status: 'completed',
        data: instance.data,
        completedSteps: instance.completedSteps
      }, { processId });

      this.broker.publish(this.outputChannel, result);

      return {
        success: true,
        processId,
        instance
      };

    } catch (error) {
      instance.fail(error.message);
      this.failedCount++;

      if (this.enableLogging) {
        console.error(`Process ${processId} failed:`, error);
      }

      await this.compensateProcess(instance);

      this.emit('processFailed', { processId, error, instance });

      return {
        success: false,
        processId,
        error: error.message,
        instance
      };
    }
  }

  async executeProcess(instance) {
    const context = { data: instance.data, instance };

    for (let i = 0; i < instance.definition.steps.length; i++) {
      const step = instance.definition.steps[i];
      instance.currentStepIndex = i;

      if (this.enableLogging) {
        console.log(`Executing step ${i + 1}/${instance.definition.steps.length}: ${step.id}`);
      }

      const result = await step.execute(context);

      if (!result.success) {
        throw new Error(`Step ${step.id} failed: ${result.error}`);
      }

      instance.addCompletedStep(step.id, result.result);

      this.emit('stepCompleted', {
        processId: instance.id,
        stepId: step.id,
        result: result.result
      });
    }
  }

  async compensateProcess(instance) {
    if (this.enableLogging) {
      console.log(`Compensating process ${instance.id}`);
    }

    instance.compensate();

    const stepsToCompensate = instance.completedSteps.slice().reverse();

    for (const completedStep of stepsToCompensate) {
      const step = instance.definition.steps.find(s => s.id === completedStep.stepId);

      if (step) {
        if (this.enableLogging) {
          console.log(`Compensating step: ${step.id}`);
        }

        const result = await step.executeCompensation({ data: instance.data, instance });

        if (!result.success) {
          console.error(`Compensation failed for step ${step.id}:`, result.error);
        }
      }
    }

    instance.compensated();

    if (this.enableLogging) {
      console.log(`Process ${instance.id} compensated`);
    }

    this.emit('processCompensated', { processId: instance.id, instance });
  }

  generateProcessId() {
    return `PROC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getProcess(processId) {
    return this.instances.get(processId);
  }

  getStats() {
    return {
      definitionCount: this.definitions.size,
      activeInstances: Array.from(this.instances.values()).filter(i => i.status === 'running').length,
      totalInstances: this.instances.size,
      startedCount: this.startedCount,
      completedCount: this.completedCount,
      failedCount: this.failedCount,
      broker: this.broker.getStats()
    };
  }

  reset() {
    this.instances.clear();
    this.startedCount = 0;
    this.completedCount = 0;
    this.failedCount = 0;
    this.emit('reset');
  }
}

async function demonstrateProcessManager() {
  console.log('=== Process Manager Pattern Demo ===\n');

  const pm = new ProcessManager({
    outputChannel: 'order-results',
    enableLogging: true
  });

  const orderProcess = new ProcessDefinition('order-fulfillment', [
    new ProcessStep('reserve-inventory', async (ctx) => {
      console.log('[RESERVE] Reserving inventory...');
      await new Promise(resolve => setTimeout(resolve, 50));
      ctx.data.reservationId = 'RES-001';
      return { reserved: true };
    }, {
      compensate: async (ctx) => {
        console.log('[COMPENSATE] Releasing inventory reservation');
        await new Promise(resolve => setTimeout(resolve, 25));
      }
    }),

    new ProcessStep('charge-payment', async (ctx) => {
      console.log('[PAYMENT] Charging payment...');
      await new Promise(resolve => setTimeout(resolve, 100));
      ctx.data.paymentId = 'PAY-001';
      return { charged: true, amount: ctx.data.amount };
    }, {
      compensate: async (ctx) => {
        console.log('[COMPENSATE] Refunding payment');
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }),

    new ProcessStep('ship-order', async (ctx) => {
      console.log('[SHIP] Shipping order...');
      await new Promise(resolve => setTimeout(resolve, 75));
      ctx.data.trackingNumber = 'TRACK-001';
      return { shipped: true };
    }, {
      compensate: async (ctx) => {
        console.log('[COMPENSATE] Canceling shipment');
        await new Promise(resolve => setTimeout(resolve, 25));
      }
    })
  ]);

  pm.defineProcess(orderProcess);

  pm.broker.subscribe('order-results', (msg) => {
    console.log(`\n[RESULT] Process completed: ${JSON.stringify(msg.payload, null, 2)}`);
  });

  const result = await pm.startProcess('order-fulfillment', {
    orderId: 'ORD-123',
    customerId: 'CUST-456',
    amount: 99.99
  });

  console.log('\n=== Process Manager Statistics ===');
  console.log(JSON.stringify(pm.getStats(), null, 2));

  return pm;
}

module.exports = ProcessManager;
module.exports.Message = Message;
module.exports.ProcessStep = ProcessStep;
module.exports.ProcessInstance = ProcessInstance;
module.exports.ProcessDefinition = ProcessDefinition;
module.exports.MessageBroker = MessageBroker;
module.exports.demonstrate = demonstrateProcessManager;

if (require.main === module) {
  demonstrateProcessManager().catch(console.error);
}
