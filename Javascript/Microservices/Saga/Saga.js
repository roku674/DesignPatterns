/**
 * Saga Pattern - Distributed Transaction Management
 *
 * The Saga pattern manages distributed transactions across multiple microservices
 * by breaking them into a sequence of local transactions. Each transaction updates
 * the database and publishes an event or message triggering the next transaction.
 * If a step fails, the saga executes compensating transactions to undo the impact.
 *
 * Key Concepts:
 * - Choreography: Services publish events that other services listen to
 * - Orchestration: Central coordinator directs the saga flow
 * - Compensation: Undo actions for failed transactions
 * - Idempotency: Handlers can be safely retried
 *
 * @example
 * // Orchestration-based saga
 * const saga = new SagaOrchestrator('order-fulfillment');
 * saga.addStep('reserve-inventory', async (data) => {
 *   return await inventoryService.reserve(data.items);
 * }, async (data) => {
 *   await inventoryService.release(data.items);
 * });
 * await saga.execute({ orderId: '123', items: [...] });
 */

const EventEmitter = require('events');

/**
 * Saga Step - Represents a single step in a saga with compensation
 */
class SagaStep {
  /**
   * Create a saga step
   * @param {string} name - Step name
   * @param {Function} action - Action to execute (returns data for next step)
   * @param {Function} compensation - Compensation action if saga fails
   * @param {Object} options - Step options (timeout, retries, etc.)
   */
  constructor(name, action, compensation, options = {}) {
    if (!name) {
      throw new Error('Step name is required');
    }
    if (!action) {
      throw new Error('Step action is required');
    }

    this.name = name;
    this.action = action;
    this.compensation = compensation;
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  /**
   * Execute the step with retry logic
   */
  async execute(context) {
    let attempts = 0;
    let lastError = null;

    while (attempts <= this.maxRetries) {
      try {
        const result = await this.executeWithTimeout(context);
        return { success: true, data: result };
      } catch (error) {
        lastError = error;
        attempts++;

        if (attempts <= this.maxRetries) {
          console.log(`Step '${this.name}' failed, retrying (${attempts}/${this.maxRetries})...`);
          await this.delay(this.retryDelay * attempts);
        }
      }
    }

    return {
      success: false,
      error: lastError.message,
      step: this.name
    };
  }

  /**
   * Execute with timeout
   */
  async executeWithTimeout(context) {
    return Promise.race([
      this.action(context),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Step '${this.name}' timed out`)), this.timeout)
      )
    ]);
  }

  /**
   * Execute compensation
   */
  async compensate(context) {
    if (!this.compensation) {
      console.log(`No compensation defined for step '${this.name}'`);
      return { success: true };
    }

    try {
      await this.compensation(context);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        step: this.name
      };
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Saga Orchestrator - Centralized saga coordinator
 */
class SagaOrchestrator extends EventEmitter {
  /**
   * Create a saga orchestrator
   * @param {string} name - Saga name
   * @param {Object} options - Saga options
   */
  constructor(name, options = {}) {
    super();

    if (!name) {
      throw new Error('Saga name is required');
    }

    this.name = name;
    this.steps = [];
    this.executionHistory = [];
    this.options = {
      persistState: options.persistState || false,
      stateStore: options.stateStore || new Map(),
      ...options
    };
  }

  /**
   * Add a step to the saga
   * @param {string} name - Step name
   * @param {Function} action - Action to execute
   * @param {Function} compensation - Compensation action
   * @param {Object} options - Step options
   */
  addStep(name, action, compensation, options = {}) {
    const step = new SagaStep(name, action, compensation, options);
    this.steps.push(step);
    return this;
  }

  /**
   * Execute the saga
   * @param {Object} initialData - Initial saga data
   * @returns {Object} Saga execution result
   */
  async execute(initialData) {
    const sagaId = this.generateSagaId();
    const execution = {
      id: sagaId,
      name: this.name,
      status: 'RUNNING',
      startedAt: new Date(),
      completedSteps: [],
      failedStep: null,
      data: { ...initialData }
    };

    this.emit('saga:started', execution);
    console.log(`\n=== Starting Saga: ${this.name} (${sagaId}) ===`);

    try {
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];

        console.log(`\nExecuting step ${i + 1}/${this.steps.length}: ${step.name}`);
        this.emit('step:started', { sagaId, step: step.name, index: i });

        const result = await step.execute(execution.data);

        if (result.success) {
          execution.completedSteps.push({
            step: step.name,
            index: i,
            completedAt: new Date(),
            data: result.data
          });

          execution.data = { ...execution.data, ...result.data };

          this.emit('step:completed', {
            sagaId,
            step: step.name,
            index: i,
            data: result.data
          });

          console.log(`Step '${step.name}' completed successfully`);

          if (this.options.persistState) {
            await this.persistState(sagaId, execution);
          }
        } else {
          execution.status = 'FAILED';
          execution.failedStep = {
            step: step.name,
            index: i,
            error: result.error,
            failedAt: new Date()
          };

          this.emit('step:failed', {
            sagaId,
            step: step.name,
            error: result.error
          });

          console.log(`Step '${step.name}' failed: ${result.error}`);

          await this.compensate(execution);

          execution.completedAt = new Date();
          this.executionHistory.push(execution);

          return execution;
        }
      }

      execution.status = 'COMPLETED';
      execution.completedAt = new Date();

      this.emit('saga:completed', execution);
      console.log(`\n=== Saga Completed: ${this.name} ===\n`);

      this.executionHistory.push(execution);
      return execution;

    } catch (error) {
      execution.status = 'ERROR';
      execution.error = error.message;
      execution.completedAt = new Date();

      this.emit('saga:error', { sagaId, error: error.message });
      console.error(`Saga error: ${error.message}`);

      await this.compensate(execution);

      this.executionHistory.push(execution);
      return execution;
    }
  }

  /**
   * Compensate completed steps in reverse order
   */
  async compensate(execution) {
    console.log(`\n=== Starting Compensation ===`);
    this.emit('compensation:started', { sagaId: execution.id });

    const completedSteps = execution.completedSteps.reverse();

    for (const stepInfo of completedSteps) {
      const step = this.steps[stepInfo.index];
      console.log(`Compensating step: ${step.name}`);

      const result = await step.compensate(execution.data);

      if (result.success) {
        console.log(`Compensation for '${step.name}' completed`);
        this.emit('compensation:step:completed', {
          sagaId: execution.id,
          step: step.name
        });
      } else {
        console.error(`Compensation failed for '${step.name}': ${result.error}`);
        this.emit('compensation:step:failed', {
          sagaId: execution.id,
          step: step.name,
          error: result.error
        });
      }
    }

    console.log(`=== Compensation Completed ===\n`);
    this.emit('compensation:completed', { sagaId: execution.id });
  }

  /**
   * Persist saga state
   */
  async persistState(sagaId, execution) {
    this.options.stateStore.set(sagaId, {
      ...execution,
      persistedAt: new Date()
    });
  }

  /**
   * Recover saga from persisted state
   */
  async recover(sagaId) {
    const state = this.options.stateStore.get(sagaId);
    if (!state) {
      throw new Error(`No persisted state found for saga: ${sagaId}`);
    }

    console.log(`Recovering saga: ${sagaId} from step ${state.completedSteps.length}`);

    const remainingData = { ...state.data };
    const remainingSteps = this.steps.slice(state.completedSteps.length);

    const execution = {
      ...state,
      status: 'RECOVERING'
    };

    for (let i = 0; i < remainingSteps.length; i++) {
      const step = remainingSteps[i];
      const result = await step.execute(remainingData);

      if (result.success) {
        execution.completedSteps.push({
          step: step.name,
          index: state.completedSteps.length + i,
          completedAt: new Date(),
          data: result.data
        });
        Object.assign(remainingData, result.data);
      } else {
        execution.status = 'FAILED';
        await this.compensate(execution);
        return execution;
      }
    }

    execution.status = 'COMPLETED';
    execution.completedAt = new Date();

    return execution;
  }

  /**
   * Get execution history
   */
  getHistory() {
    return [...this.executionHistory];
  }

  /**
   * Get saga statistics
   */
  getStatistics() {
    const total = this.executionHistory.length;
    const completed = this.executionHistory.filter(e => e.status === 'COMPLETED').length;
    const failed = this.executionHistory.filter(e => e.status === 'FAILED').length;

    return {
      totalExecutions: total,
      completed,
      failed,
      successRate: total > 0 ? ((completed / total) * 100).toFixed(2) + '%' : '0%'
    };
  }

  generateSagaId() {
    return `saga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Saga Choreography - Event-driven saga coordination
 */
class SagaChoreography extends EventEmitter {
  constructor(name) {
    super();

    if (!name) {
      throw new Error('Saga name is required');
    }

    this.name = name;
    this.handlers = new Map();
    this.compensationHandlers = new Map();
    this.eventLog = [];
  }

  /**
   * Register event handler
   */
  on(eventName, handler, compensation) {
    super.on(eventName, handler);

    if (compensation) {
      this.compensationHandlers.set(eventName, compensation);
    }

    return this;
  }

  /**
   * Publish saga event
   */
  async publish(eventName, data) {
    const event = {
      name: eventName,
      data,
      timestamp: new Date(),
      sagaName: this.name
    };

    this.eventLog.push(event);
    console.log(`Event published: ${eventName}`);

    this.emit(eventName, event);
    return event;
  }

  /**
   * Compensate published events
   */
  async compensateEvents(fromEvent) {
    const eventsToCompensate = this.eventLog.reverse();

    for (const event of eventsToCompensate) {
      const compensationHandler = this.compensationHandlers.get(event.name);

      if (compensationHandler) {
        console.log(`Compensating event: ${event.name}`);
        try {
          await compensationHandler(event.data);
        } catch (error) {
          console.error(`Compensation failed for ${event.name}:`, error.message);
        }
      }

      if (event.name === fromEvent) {
        break;
      }
    }
  }

  getEventLog() {
    return [...this.eventLog];
  }
}

/**
 * Demo function showing saga patterns
 */
async function demonstrateSaga() {
  console.log('=== Saga Pattern Demonstration ===\n');

  // Orchestration-based saga
  const orderSaga = new SagaOrchestrator('order-fulfillment-saga');

  orderSaga.addStep(
    'validate-order',
    async (data) => {
      console.log(`Validating order ${data.orderId}...`);
      await new Promise(resolve => setTimeout(resolve, 100));
      return { validated: true };
    },
    async (data) => {
      console.log(`Reverting order validation for ${data.orderId}`);
    }
  );

  orderSaga.addStep(
    'reserve-inventory',
    async (data) => {
      console.log(`Reserving inventory for ${data.items.length} items...`);
      await new Promise(resolve => setTimeout(resolve, 100));
      return { inventoryReserved: true, reservationId: 'RSV-123' };
    },
    async (data) => {
      console.log(`Releasing inventory reservation ${data.reservationId}`);
    }
  );

  orderSaga.addStep(
    'process-payment',
    async (data) => {
      console.log(`Processing payment of $${data.amount}...`);
      await new Promise(resolve => setTimeout(resolve, 100));
      return { paymentId: 'PAY-456', charged: data.amount };
    },
    async (data) => {
      console.log(`Refunding payment ${data.paymentId}`);
    }
  );

  orderSaga.addStep(
    'create-shipment',
    async (data) => {
      console.log(`Creating shipment for order ${data.orderId}...`);
      await new Promise(resolve => setTimeout(resolve, 100));
      return { shipmentId: 'SHIP-789', trackingNumber: 'TRK123456' };
    },
    async (data) => {
      console.log(`Cancelling shipment ${data.shipmentId}`);
    }
  );

  // Execute successful saga
  console.log('--- Scenario 1: Successful Order ---');
  const result1 = await orderSaga.execute({
    orderId: 'ORD-001',
    customerId: 'CUST-001',
    items: [{ id: 'ITEM-1', quantity: 2 }, { id: 'ITEM-2', quantity: 1 }],
    amount: 299.99
  });

  console.log('\nSaga Result:', {
    status: result1.status,
    steps: result1.completedSteps.length,
    data: result1.data
  });

  console.log('\n' + '='.repeat(60) + '\n');

  // Execute failing saga
  const failingSaga = new SagaOrchestrator('failing-saga');

  failingSaga.addStep(
    'step-1',
    async (data) => {
      console.log('Step 1: Success');
      return { step1: 'completed' };
    },
    async (data) => {
      console.log('Compensating step 1');
    }
  );

  failingSaga.addStep(
    'step-2',
    async (data) => {
      console.log('Step 2: Success');
      return { step2: 'completed' };
    },
    async (data) => {
      console.log('Compensating step 2');
    }
  );

  failingSaga.addStep(
    'step-3-fails',
    async (data) => {
      throw new Error('Simulated failure');
    },
    async (data) => {
      console.log('Compensating step 3 (never executed)');
    }
  );

  console.log('--- Scenario 2: Failed Saga with Compensation ---');
  const result2 = await failingSaga.execute({ testId: 'TEST-001' });

  console.log('\nSaga Result:', {
    status: result2.status,
    failedStep: result2.failedStep,
    compensatedSteps: result2.completedSteps.length
  });

  console.log('\n--- Saga Statistics ---');
  console.log('Order Saga:', orderSaga.getStatistics());
  console.log('Failing Saga:', failingSaga.getStatistics());

  return { orderSaga, failingSaga };
}

// Export
module.exports = {
  SagaStep,
  SagaOrchestrator,
  SagaChoreography,
  demonstrateSaga
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateSaga()
    .then(() => console.log('\nSaga demonstration completed'))
    .catch(error => console.error('Error:', error));
}
