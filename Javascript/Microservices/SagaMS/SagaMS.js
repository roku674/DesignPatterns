/**
 * SagaMS Pattern - Microservices-Specific Saga Implementation
 *
 * Enhanced saga pattern specifically designed for microservices with:
 * - Distributed tracing
 * - Service mesh integration
 * - Circuit breaker support
 * - Message queue integration
 * - Monitoring and observability
 *
 * @example
 * const saga = new MicroserviceSaga('order-saga', {
 *   services: ['inventory', 'payment', 'shipping'],
 *   messageQueue: kafkaQueue,
 *   tracing: true
 * });
 */

const EventEmitter = require('events');

/**
 * Service Registry for microservices
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthChecks = new Map();
  }

  register(serviceName, serviceConfig) {
    if (!serviceName) {
      throw new Error('Service name is required');
    }

    this.services.set(serviceName, {
      name: serviceName,
      url: serviceConfig.url || `http://${serviceName}:8080`,
      healthCheckUrl: serviceConfig.healthCheckUrl || `http://${serviceName}:8080/health`,
      timeout: serviceConfig.timeout || 5000,
      retries: serviceConfig.retries || 3,
      circuitBreaker: {
        threshold: serviceConfig.circuitThreshold || 5,
        timeout: serviceConfig.circuitTimeout || 60000,
        failures: 0,
        state: 'CLOSED',
        lastFailure: null
      },
      metadata: serviceConfig.metadata || {}
    });

    console.log(`Registered service: ${serviceName}`);
    return this;
  }

  get(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }
    return service;
  }

  async checkHealth(serviceName) {
    const service = this.get(serviceName);

    try {
      const isHealthy = Math.random() > 0.1;
      this.healthChecks.set(serviceName, {
        healthy: isHealthy,
        lastCheck: new Date(),
        status: isHealthy ? 'UP' : 'DOWN'
      });

      return isHealthy;
    } catch (error) {
      this.healthChecks.set(serviceName, {
        healthy: false,
        lastCheck: new Date(),
        status: 'ERROR',
        error: error.message
      });
      return false;
    }
  }

  getHealthStatus(serviceName) {
    return this.healthChecks.get(serviceName) || { healthy: true, status: 'UNKNOWN' };
  }

  recordFailure(serviceName) {
    const service = this.get(serviceName);
    service.circuitBreaker.failures++;
    service.circuitBreaker.lastFailure = new Date();

    if (service.circuitBreaker.failures >= service.circuitBreaker.threshold) {
      service.circuitBreaker.state = 'OPEN';
      console.log(`Circuit breaker OPEN for ${serviceName}`);

      setTimeout(() => {
        service.circuitBreaker.state = 'HALF_OPEN';
        console.log(`Circuit breaker HALF_OPEN for ${serviceName}`);
      }, service.circuitBreaker.timeout);
    }
  }

  recordSuccess(serviceName) {
    const service = this.get(serviceName);
    service.circuitBreaker.failures = 0;
    if (service.circuitBreaker.state === 'HALF_OPEN') {
      service.circuitBreaker.state = 'CLOSED';
      console.log(`Circuit breaker CLOSED for ${serviceName}`);
    }
  }

  isCircuitOpen(serviceName) {
    const service = this.get(serviceName);
    return service.circuitBreaker.state === 'OPEN';
  }
}

/**
 * Distributed Trace for saga execution
 */
class DistributedTrace {
  constructor(sagaId, sagaName) {
    this.traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.sagaId = sagaId;
    this.sagaName = sagaName;
    this.spans = [];
    this.startTime = Date.now();
  }

  startSpan(name, service) {
    const span = {
      spanId: `span-${this.spans.length + 1}`,
      name,
      service,
      startTime: Date.now(),
      tags: {},
      logs: []
    };

    this.spans.push(span);
    return span;
  }

  endSpan(span, status = 'success', error = null) {
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;
    if (error) {
      span.error = error;
    }
  }

  addTag(span, key, value) {
    span.tags[key] = value;
  }

  addLog(span, message, data = {}) {
    span.logs.push({
      timestamp: Date.now(),
      message,
      data
    });
  }

  getTrace() {
    return {
      traceId: this.traceId,
      sagaId: this.sagaId,
      sagaName: this.sagaName,
      totalDuration: Date.now() - this.startTime,
      spans: this.spans
    };
  }

  visualize() {
    console.log(`\n=== Distributed Trace: ${this.traceId} ===`);
    console.log(`Saga: ${this.sagaName} (${this.sagaId})`);
    console.log(`Total Duration: ${Date.now() - this.startTime}ms\n`);

    this.spans.forEach((span, index) => {
      console.log(`${index + 1}. ${span.name} [${span.service}]`);
      console.log(`   Duration: ${span.duration}ms | Status: ${span.status}`);
      if (span.error) {
        console.log(`   Error: ${span.error}`);
      }
      if (Object.keys(span.tags).length > 0) {
        console.log(`   Tags:`, span.tags);
      }
    });
  }
}

/**
 * Message Queue for inter-service communication
 */
class MessageQueue extends EventEmitter {
  constructor(name = 'saga-queue') {
    super();
    this.name = name;
    this.messages = [];
    this.subscriptions = new Map();
    this.deadLetterQueue = [];
  }

  async publish(topic, message, options = {}) {
    const queueMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      topic,
      payload: message,
      timestamp: new Date(),
      retries: 0,
      maxRetries: options.maxRetries || 3,
      metadata: options.metadata || {}
    };

    this.messages.push(queueMessage);
    console.log(`Published message to ${topic}: ${queueMessage.id}`);

    await this.deliverMessage(queueMessage);
    return queueMessage.id;
  }

  subscribe(topic, handler) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }

    this.subscriptions.get(topic).push(handler);
    console.log(`Subscribed to topic: ${topic}`);

    return () => {
      const handlers = this.subscriptions.get(topic);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  async deliverMessage(message) {
    const handlers = this.subscriptions.get(message.topic) || [];

    for (const handler of handlers) {
      try {
        await handler(message.payload, message.metadata);
      } catch (error) {
        console.error(`Message handler failed: ${error.message}`);
        message.retries++;

        if (message.retries >= message.maxRetries) {
          this.deadLetterQueue.push({
            ...message,
            failedAt: new Date(),
            error: error.message
          });
          console.log(`Message moved to DLQ: ${message.id}`);
        } else {
          setTimeout(() => this.deliverMessage(message), 1000 * message.retries);
        }
      }
    }
  }

  getDeadLetterQueue() {
    return [...this.deadLetterQueue];
  }

  getMessageCount() {
    return this.messages.length;
  }
}

/**
 * Microservice Saga Step
 */
class MicroserviceStep {
  constructor(name, serviceName, action, compensation, options = {}) {
    if (!name) {
      throw new Error('Step name is required');
    }
    if (!serviceName) {
      throw new Error('Service name is required');
    }

    this.name = name;
    this.serviceName = serviceName;
    this.action = action;
    this.compensation = compensation;
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
  }

  async execute(context, serviceRegistry, trace, messageQueue) {
    if (serviceRegistry.isCircuitOpen(this.serviceName)) {
      throw new Error(`Circuit breaker open for service: ${this.serviceName}`);
    }

    const span = trace.startSpan(this.name, this.serviceName);
    trace.addTag(span, 'step', this.name);
    trace.addTag(span, 'service', this.serviceName);

    let attempts = 0;
    let lastError = null;

    while (attempts < this.retries) {
      try {
        trace.addLog(span, `Attempt ${attempts + 1}/${this.retries}`);

        const result = await Promise.race([
          this.action(context, messageQueue),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Operation timeout')), this.timeout)
          )
        ]);

        serviceRegistry.recordSuccess(this.serviceName);
        trace.endSpan(span, 'success');

        return { success: true, data: result };
      } catch (error) {
        lastError = error;
        attempts++;
        trace.addLog(span, `Failed: ${error.message}`);

        if (attempts >= this.retries) {
          serviceRegistry.recordFailure(this.serviceName);
          trace.endSpan(span, 'error', error.message);
          break;
        }

        await this.delay(1000 * attempts);
      }
    }

    return {
      success: false,
      error: lastError.message,
      step: this.name,
      service: this.serviceName
    };
  }

  async compensate(context, messageQueue) {
    if (!this.compensation) {
      return { success: true };
    }

    try {
      await this.compensation(context, messageQueue);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Microservice Saga Orchestrator
 */
class MicroserviceSaga extends EventEmitter {
  constructor(name, options = {}) {
    super();

    if (!name) {
      throw new Error('Saga name is required');
    }

    this.name = name;
    this.steps = [];
    this.serviceRegistry = options.serviceRegistry || new ServiceRegistry();
    this.messageQueue = options.messageQueue || new MessageQueue();
    this.enableTracing = options.tracing !== false;
    this.executionHistory = [];
  }

  registerService(serviceName, config) {
    this.serviceRegistry.register(serviceName, config);
    return this;
  }

  addStep(name, serviceName, action, compensation, options = {}) {
    const step = new MicroserviceStep(name, serviceName, action, compensation, options);
    this.steps.push(step);
    return this;
  }

  async execute(initialData) {
    const sagaId = `saga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trace = this.enableTracing ? new DistributedTrace(sagaId, this.name) : null;

    const execution = {
      id: sagaId,
      name: this.name,
      status: 'RUNNING',
      startedAt: new Date(),
      completedSteps: [],
      failedStep: null,
      data: { ...initialData },
      trace: trace ? trace.traceId : null
    };

    console.log(`\n=== Microservice Saga Started: ${this.name} (${sagaId}) ===`);
    this.emit('saga:started', execution);

    try {
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];

        console.log(`\nStep ${i + 1}/${this.steps.length}: ${step.name} [${step.serviceName}]`);

        const healthCheck = await this.serviceRegistry.checkHealth(step.serviceName);
        if (!healthCheck) {
          throw new Error(`Service unhealthy: ${step.serviceName}`);
        }

        const result = await step.execute(
          execution.data,
          this.serviceRegistry,
          trace,
          this.messageQueue
        );

        if (result.success) {
          execution.completedSteps.push({
            step: step.name,
            service: step.serviceName,
            index: i,
            completedAt: new Date(),
            data: result.data
          });

          execution.data = { ...execution.data, ...result.data };
          console.log(`Step '${step.name}' completed successfully`);

          await this.messageQueue.publish(`saga.${this.name}.step.completed`, {
            sagaId,
            step: step.name,
            data: result.data
          });

        } else {
          execution.status = 'FAILED';
          execution.failedStep = {
            step: step.name,
            service: step.serviceName,
            index: i,
            error: result.error,
            failedAt: new Date()
          };

          console.log(`Step '${step.name}' failed: ${result.error}`);

          await this.messageQueue.publish(`saga.${this.name}.step.failed`, {
            sagaId,
            step: step.name,
            error: result.error
          });

          await this.compensate(execution);

          if (trace) {
            trace.visualize();
          }

          execution.completedAt = new Date();
          this.executionHistory.push(execution);

          return execution;
        }
      }

      execution.status = 'COMPLETED';
      execution.completedAt = new Date();

      console.log(`\n=== Saga Completed Successfully ===`);

      await this.messageQueue.publish(`saga.${this.name}.completed`, {
        sagaId,
        status: 'COMPLETED'
      });

      if (trace) {
        trace.visualize();
      }

      this.executionHistory.push(execution);
      return execution;

    } catch (error) {
      execution.status = 'ERROR';
      execution.error = error.message;
      execution.completedAt = new Date();

      console.error(`Saga error: ${error.message}`);

      await this.compensate(execution);

      if (trace) {
        trace.visualize();
      }

      this.executionHistory.push(execution);
      return execution;
    }
  }

  async compensate(execution) {
    console.log(`\n=== Starting Compensation ===`);

    const completedSteps = [...execution.completedSteps].reverse();

    for (const stepInfo of completedSteps) {
      const step = this.steps[stepInfo.index];
      console.log(`Compensating: ${step.name} [${step.serviceName}]`);

      const result = await step.compensate(execution.data, this.messageQueue);

      if (result.success) {
        console.log(`Compensation completed for '${step.name}'`);

        await this.messageQueue.publish(`saga.${this.name}.compensation.completed`, {
          sagaId: execution.id,
          step: step.name
        });
      } else {
        console.error(`Compensation failed for '${step.name}': ${result.error}`);
      }
    }

    console.log(`=== Compensation Completed ===\n`);
  }

  getStatistics() {
    const total = this.executionHistory.length;
    const completed = this.executionHistory.filter(e => e.status === 'COMPLETED').length;
    const failed = this.executionHistory.filter(e => e.status === 'FAILED').length;

    return {
      totalExecutions: total,
      completed,
      failed,
      successRate: total > 0 ? ((completed / total) * 100).toFixed(2) + '%' : '0%',
      averageDuration: this.calculateAverageDuration()
    };
  }

  calculateAverageDuration() {
    if (this.executionHistory.length === 0) return 0;

    const totalDuration = this.executionHistory.reduce((sum, exec) => {
      const duration = new Date(exec.completedAt) - new Date(exec.startedAt);
      return sum + duration;
    }, 0);

    return (totalDuration / this.executionHistory.length).toFixed(2) + 'ms';
  }
}

/**
 * Demo function
 */
async function demonstrateMicroserviceSaga() {
  console.log('=== Microservice Saga Pattern Demo ===\n');

  const saga = new MicroserviceSaga('e-commerce-order-saga', {
    tracing: true
  });

  saga
    .registerService('inventory-service', {
      url: 'http://inventory:8080',
      timeout: 5000,
      circuitThreshold: 3
    })
    .registerService('payment-service', {
      url: 'http://payment:8080',
      timeout: 10000
    })
    .registerService('shipping-service', {
      url: 'http://shipping:8080',
      timeout: 7000
    });

  saga.addStep(
    'validate-inventory',
    'inventory-service',
    async (data, queue) => {
      console.log(`Validating inventory for ${data.items.length} items`);
      await new Promise(resolve => setTimeout(resolve, 200));
      return { inventoryValidated: true };
    },
    async (data, queue) => {
      console.log('No compensation needed for validation');
    }
  );

  saga.addStep(
    'reserve-inventory',
    'inventory-service',
    async (data, queue) => {
      console.log(`Reserving inventory items`);
      await new Promise(resolve => setTimeout(resolve, 300));
      await queue.publish('inventory.reserved', {
        orderId: data.orderId,
        items: data.items
      });
      return { reservationId: 'RSV-12345' };
    },
    async (data, queue) => {
      console.log(`Releasing reservation: ${data.reservationId}`);
      await queue.publish('inventory.released', {
        reservationId: data.reservationId
      });
    }
  );

  saga.addStep(
    'process-payment',
    'payment-service',
    async (data, queue) => {
      console.log(`Processing payment of $${data.totalAmount}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      await queue.publish('payment.processed', {
        orderId: data.orderId,
        amount: data.totalAmount
      });
      return { paymentId: 'PAY-67890', transactionId: 'TXN-ABCDE' };
    },
    async (data, queue) => {
      console.log(`Refunding payment: ${data.paymentId}`);
      await queue.publish('payment.refunded', {
        paymentId: data.paymentId
      });
    }
  );

  saga.addStep(
    'create-shipment',
    'shipping-service',
    async (data, queue) => {
      console.log(`Creating shipment for order ${data.orderId}`);
      await new Promise(resolve => setTimeout(resolve, 400));
      await queue.publish('shipment.created', {
        orderId: data.orderId,
        address: data.shippingAddress
      });
      return { shipmentId: 'SHIP-11111', trackingNumber: 'TRK987654' };
    },
    async (data, queue) => {
      console.log(`Cancelling shipment: ${data.shipmentId}`);
      await queue.publish('shipment.cancelled', {
        shipmentId: data.shipmentId
      });
    }
  );

  const result = await saga.execute({
    orderId: 'ORD-001',
    customerId: 'CUST-12345',
    items: [
      { productId: 'P001', quantity: 2, price: 49.99 },
      { productId: 'P002', quantity: 1, price: 99.99 }
    ],
    totalAmount: 199.97,
    shippingAddress: {
      street: '123 Main St',
      city: 'Springfield',
      zip: '12345'
    }
  });

  console.log('\n=== Execution Result ===');
  console.log('Status:', result.status);
  console.log('Completed Steps:', result.completedSteps.length);
  console.log('Duration:', new Date(result.completedAt) - new Date(result.startedAt), 'ms');

  console.log('\n=== Saga Statistics ===');
  console.log(saga.getStatistics());

  console.log('\n=== Message Queue Statistics ===');
  console.log('Messages Published:', saga.messageQueue.getMessageCount());
  console.log('Dead Letter Queue:', saga.messageQueue.getDeadLetterQueue().length);

  return saga;
}

module.exports = {
  ServiceRegistry,
  DistributedTrace,
  MessageQueue,
  MicroserviceStep,
  MicroserviceSaga,
  demonstrateMicroserviceSaga
};

if (require.main === module) {
  demonstrateMicroserviceSaga()
    .then(() => console.log('\nDemo completed'))
    .catch(error => console.error('Error:', error));
}
