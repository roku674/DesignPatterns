/**
 * Saga Pattern Cloud Implementation
 *
 * The Saga pattern is a design pattern for managing distributed transactions
 * across multiple services. It breaks a transaction into a series of local
 * transactions, each updating a single service. If one transaction fails,
 * compensating transactions are executed to undo the changes.
 *
 * Key Features:
 * - Distributed transaction management
 * - Automatic compensation on failure
 * - Support for sequential and parallel execution
 * - State persistence and recovery
 * - Event-driven choreography
 * - Saga orchestration
 * - Timeout handling
 * - Retry mechanisms
 *
 * Use Cases:
 * - E-commerce order processing
 * - Financial transactions
 * - Multi-service workflows
 * - Booking systems
 * - Account provisioning
 *
 * @module Saga
 */

/**
 * Saga step execution states
 */
const StepState = {
  PENDING: 'pending',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  COMPENSATING: 'compensating',
  COMPENSATED: 'compensated'
};

/**
 * Saga execution modes
 */
const ExecutionMode = {
  SEQUENTIAL: 'sequential',
  PARALLEL: 'parallel'
};

/**
 * Individual saga step
 */
class SagaStep {
  /**
   * Create a saga step
   * @param {Object} config - Step configuration
   * @param {string} config.name - Step name
   * @param {Function} config.execute - Forward transaction
   * @param {Function} config.compensate - Compensation transaction
   * @param {number} config.timeout - Step timeout in milliseconds
   */
  constructor(config) {
    this.name = config.name;
    this.execute = config.execute;
    this.compensate = config.compensate;
    this.timeout = config.timeout || 5000;
    this.state = StepState.PENDING;
    this.result = null;
    this.error = null;
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Execute the forward transaction
   * @param {Object} context - Execution context
   * @returns {Promise<any>} Execution result
   */
  async run(context) {
    this.state = StepState.EXECUTING;
    this.startTime = Date.now();

    try {
      console.log(`[Saga] Executing step: ${this.name}`);

      const result = await this.executeWithTimeout(
        () => this.execute(context),
        this.timeout
      );

      this.result = result;
      this.state = StepState.COMPLETED;
      this.endTime = Date.now();

      console.log(`[Saga] Step completed: ${this.name}`);
      return result;

    } catch (error) {
      this.error = error;
      this.state = StepState.FAILED;
      this.endTime = Date.now();

      console.error(`[Saga] Step failed: ${this.name} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute compensation transaction
   * @param {Object} context - Execution context
   * @returns {Promise<any>} Compensation result
   */
  async rollback(context) {
    if (!this.compensate) {
      console.log(`[Saga] No compensation for step: ${this.name}`);
      return null;
    }

    if (this.state !== StepState.COMPLETED) {
      console.log(`[Saga] Skipping compensation for ${this.name} (not completed)`);
      return null;
    }

    this.state = StepState.COMPENSATING;

    try {
      console.log(`[Saga] Compensating step: ${this.name}`);

      const result = await this.executeWithTimeout(
        () => this.compensate(context, this.result),
        this.timeout
      );

      this.state = StepState.COMPENSATED;
      console.log(`[Saga] Compensation completed: ${this.name}`);

      return result;

    } catch (error) {
      console.error(`[Saga] Compensation failed: ${this.name} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute with timeout
   * @param {Function} fn - Function to execute
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<any>} Execution result
   */
  async executeWithTimeout(fn, timeout) {
    return Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Step timeout: ${this.name}`)), timeout)
      )
    ]);
  }

  /**
   * Get step metrics
   * @returns {Object} Step metrics
   */
  getMetrics() {
    return {
      name: this.name,
      state: this.state,
      duration: this.endTime ? this.endTime - this.startTime : null,
      hasCompensation: !!this.compensate,
      error: this.error ? this.error.message : null
    };
  }
}

/**
 * Saga execution context
 */
class SagaContext {
  constructor(initialData = {}) {
    this.data = { ...initialData };
    this.stepResults = new Map();
    this.metadata = {
      sagaId: this.generateSagaId(),
      startTime: Date.now()
    };
  }

  /**
   * Update context data
   * @param {Object} updates - Data to merge into context
   */
  update(updates) {
    this.data = { ...this.data, ...updates };
  }

  /**
   * Store step result
   * @param {string} stepName - Step name
   * @param {any} result - Step result
   */
  setStepResult(stepName, result) {
    this.stepResults.set(stepName, result);
  }

  /**
   * Retrieve step result
   * @param {string} stepName - Step name
   * @returns {any} Step result
   */
  getStepResult(stepName) {
    return this.stepResults.get(stepName);
  }

  /**
   * Get all context data
   * @returns {Object} Complete context data
   */
  getData() {
    return {
      ...this.data,
      metadata: this.metadata
    };
  }

  generateSagaId() {
    return `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Main Saga orchestrator
 */
class Saga {
  /**
   * Create a new Saga
   * @param {Object} config - Saga configuration
   * @param {string} config.name - Saga name
   * @param {string} config.mode - Execution mode (sequential or parallel)
   */
  constructor(config = {}) {
    this.name = config.name || 'UnnamedSaga';
    this.mode = config.mode || ExecutionMode.SEQUENTIAL;
    this.steps = [];
    this.completedSteps = [];
    this.failedStep = null;
    this.context = new SagaContext(config.initialData);
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Add a step to the saga
   * @param {Object} stepConfig - Step configuration
   * @returns {Saga} This saga instance for chaining
   */
  addStep(stepConfig) {
    const step = new SagaStep(stepConfig);
    this.steps.push(step);
    return this;
  }

  /**
   * Add multiple steps
   * @param {Array<Object>} steps - Array of step configurations
   * @returns {Saga} This saga instance for chaining
   */
  addSteps(steps) {
    steps.forEach(step => this.addStep(step));
    return this;
  }

  /**
   * Execute the saga
   * @param {Object} additionalData - Additional context data
   * @returns {Promise<Object>} Execution result
   */
  async execute(additionalData = {}) {
    this.startTime = Date.now();
    this.context.update(additionalData);

    console.log(`\n[Saga] Starting: ${this.name}`);
    console.log(`[Saga] Mode: ${this.mode}`);
    console.log(`[Saga] Steps: ${this.steps.length}`);

    try {
      if (this.mode === ExecutionMode.SEQUENTIAL) {
        await this.executeSequential();
      } else {
        await this.executeParallel();
      }

      this.endTime = Date.now();
      const duration = this.endTime - this.startTime;

      console.log(`[Saga] Completed successfully in ${duration}ms`);

      return {
        success: true,
        sagaId: this.context.metadata.sagaId,
        duration,
        completedSteps: this.completedSteps.length,
        context: this.context.getData()
      };

    } catch (error) {
      console.error(`[Saga] Failed: ${error.message}`);

      await this.compensate();

      this.endTime = Date.now();
      const duration = this.endTime - this.startTime;

      return {
        success: false,
        sagaId: this.context.metadata.sagaId,
        error: error.message,
        failedStep: this.failedStep?.name,
        duration,
        compensatedSteps: this.completedSteps.length
      };
    }
  }

  /**
   * Execute steps sequentially
   */
  async executeSequential() {
    for (const step of this.steps) {
      const result = await step.run(this.context);
      this.completedSteps.push(step);
      this.context.setStepResult(step.name, result);
    }
  }

  /**
   * Execute steps in parallel
   */
  async executeParallel() {
    const promises = this.steps.map(step =>
      step.run(this.context)
        .then(result => ({ step, result, success: true }))
        .catch(error => ({ step, error, success: false }))
    );

    const results = await Promise.all(promises);

    for (const { step, result, error, success } of results) {
      if (success) {
        this.completedSteps.push(step);
        this.context.setStepResult(step.name, result);
      } else {
        this.failedStep = step;
        throw error;
      }
    }
  }

  /**
   * Compensate completed steps in reverse order
   */
  async compensate() {
    if (this.completedSteps.length === 0) {
      console.log('[Saga] No steps to compensate');
      return;
    }

    console.log(`[Saga] Starting compensation (${this.completedSteps.length} steps)`);

    const stepsToCompensate = [...this.completedSteps].reverse();

    for (const step of stepsToCompensate) {
      try {
        await step.rollback(this.context);
      } catch (error) {
        console.error(`[Saga] CRITICAL: Compensation failed for ${step.name}`);
      }
    }

    console.log('[Saga] Compensation completed');
  }

  /**
   * Get saga metrics
   * @returns {Object} Saga metrics
   */
  getMetrics() {
    return {
      name: this.name,
      mode: this.mode,
      totalSteps: this.steps.length,
      completedSteps: this.completedSteps.length,
      failedStep: this.failedStep?.name,
      duration: this.endTime ? this.endTime - this.startTime : null,
      steps: this.steps.map(s => s.getMetrics())
    };
  }

  /**
   * Reset saga for re-execution
   */
  reset() {
    this.completedSteps = [];
    this.failedStep = null;
    this.startTime = null;
    this.endTime = null;
    this.context = new SagaContext();

    this.steps.forEach(step => {
      step.state = StepState.PENDING;
      step.result = null;
      step.error = null;
    });
  }
}

/**
 * Scenario demonstrations
 */

/**
 * Scenario 1: E-commerce order processing
 */
async function demonstrateOrderProcessing() {
  console.log('\n=== Scenario 1: E-commerce Order Processing ===');

  const orderSaga = new Saga({
    name: 'OrderSaga',
    mode: ExecutionMode.SEQUENTIAL
  });

  orderSaga
    .addStep({
      name: 'ValidateInventory',
      execute: async (ctx) => {
        await sleep(100);
        console.log('  Inventory validated');
        return { inventoryReserved: true };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Inventory released');
        return { inventoryReleased: true };
      }
    })
    .addStep({
      name: 'ProcessPayment',
      execute: async (ctx) => {
        await sleep(150);
        console.log('  Payment processed');
        return { transactionId: 'txn_12345', amount: 99.99 };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Payment refunded');
        return { refunded: true };
      }
    })
    .addStep({
      name: 'CreateShipment',
      execute: async (ctx) => {
        await sleep(100);
        console.log('  Shipment created');
        return { shipmentId: 'ship_67890' };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Shipment cancelled');
        return { cancelled: true };
      }
    });

  const result = await orderSaga.execute({
    orderId: 'order_123',
    customerId: 'cust_456'
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 2: Saga with failure and compensation
 */
async function demonstrateFailureCompensation() {
  console.log('\n=== Scenario 2: Failure with Compensation ===');

  const travelSaga = new Saga({
    name: 'TravelBookingSaga'
  });

  travelSaga
    .addStep({
      name: 'BookFlight',
      execute: async () => {
        await sleep(100);
        return { flightId: 'FL123', cost: 500 };
      },
      compensate: async () => {
        await sleep(50);
        console.log('  Flight booking cancelled');
        return { cancelled: true };
      }
    })
    .addStep({
      name: 'BookHotel',
      execute: async () => {
        await sleep(100);
        return { hotelId: 'HT456', cost: 200 };
      },
      compensate: async () => {
        await sleep(50);
        console.log('  Hotel booking cancelled');
        return { cancelled: true };
      }
    })
    .addStep({
      name: 'BookCarRental',
      execute: async () => {
        await sleep(100);
        throw new Error('Car rental unavailable');
      },
      compensate: async () => {
        await sleep(50);
        return { cancelled: true };
      }
    });

  const result = await travelSaga.execute({
    userId: 'user_789',
    destination: 'Paris'
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 3: Parallel execution
 */
async function demonstrateParallelExecution() {
  console.log('\n=== Scenario 3: Parallel Execution ===');

  const dataSaga = new Saga({
    name: 'DataProcessingSaga',
    mode: ExecutionMode.PARALLEL
  });

  dataSaga
    .addStep({
      name: 'ProcessCustomers',
      execute: async () => {
        await sleep(200);
        return { processed: 1000 };
      }
    })
    .addStep({
      name: 'ProcessOrders',
      execute: async () => {
        await sleep(150);
        return { processed: 500 };
      }
    })
    .addStep({
      name: 'ProcessProducts',
      execute: async () => {
        await sleep(100);
        return { processed: 2000 };
      }
    });

  const result = await dataSaga.execute({ batchId: 'batch_123' });
  console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 4: Financial transaction saga
 */
async function demonstrateFinancialTransaction() {
  console.log('\n=== Scenario 4: Financial Transaction ===');

  const transferSaga = new Saga({
    name: 'MoneyTransferSaga'
  });

  transferSaga
    .addStep({
      name: 'DebitSourceAccount',
      execute: async (ctx) => {
        await sleep(100);
        return {
          accountId: ctx.data.sourceAccount,
          amount: ctx.data.amount,
          newBalance: 1000 - ctx.data.amount
        };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Amount credited back to source');
        return { credited: true };
      }
    })
    .addStep({
      name: 'CreditDestinationAccount',
      execute: async (ctx) => {
        await sleep(100);
        return {
          accountId: ctx.data.destinationAccount,
          amount: ctx.data.amount,
          newBalance: 500 + ctx.data.amount
        };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Amount debited from destination');
        return { debited: true };
      }
    })
    .addStep({
      name: 'RecordTransaction',
      execute: async (ctx) => {
        await sleep(50);
        return { transactionId: 'txn_' + Date.now() };
      }
    });

  const result = await transferSaga.execute({
    sourceAccount: 'acc_001',
    destinationAccount: 'acc_002',
    amount: 250
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 5: User registration saga
 */
async function demonstrateUserRegistration() {
  console.log('\n=== Scenario 5: User Registration ===');

  const registrationSaga = new Saga({
    name: 'UserRegistrationSaga'
  });

  registrationSaga
    .addStep({
      name: 'CreateUserAccount',
      execute: async (ctx) => {
        await sleep(100);
        return { userId: 'user_' + Date.now() };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  User account deleted');
        return { deleted: true };
      }
    })
    .addStep({
      name: 'CreateProfile',
      execute: async (ctx) => {
        await sleep(100);
        return { profileId: 'prof_' + Date.now() };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Profile deleted');
        return { deleted: true };
      }
    })
    .addStep({
      name: 'SendWelcomeEmail',
      execute: async (ctx) => {
        await sleep(50);
        return { emailSent: true };
      }
    });

  const result = await registrationSaga.execute({
    email: 'user@example.com',
    name: 'John Doe'
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 6: Subscription management
 */
async function demonstrateSubscription() {
  console.log('\n=== Scenario 6: Subscription Management ===');

  const subscriptionSaga = new Saga({
    name: 'SubscriptionSaga'
  });

  subscriptionSaga
    .addStep({
      name: 'ValidatePaymentMethod',
      execute: async (ctx) => {
        await sleep(100);
        return { valid: true, cardLast4: '4242' };
      }
    })
    .addStep({
      name: 'CreateSubscription',
      execute: async (ctx) => {
        await sleep(100);
        return { subscriptionId: 'sub_123', plan: ctx.data.plan };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Subscription cancelled');
        return { cancelled: true };
      }
    })
    .addStep({
      name: 'ActivateFeatures',
      execute: async (ctx) => {
        await sleep(100);
        return { features: ['feature1', 'feature2'] };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Features deactivated');
        return { deactivated: true };
      }
    })
    .addStep({
      name: 'SendConfirmation',
      execute: async (ctx) => {
        await sleep(50);
        return { emailSent: true };
      }
    });

  const result = await subscriptionSaga.execute({
    userId: 'user_123',
    plan: 'premium'
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 7: Resource provisioning
 */
async function demonstrateResourceProvisioning() {
  console.log('\n=== Scenario 7: Cloud Resource Provisioning ===');

  const provisionSaga = new Saga({
    name: 'ResourceProvisioningSaga'
  });

  provisionSaga
    .addStep({
      name: 'AllocateCompute',
      execute: async (ctx) => {
        await sleep(150);
        return { instanceId: 'i-123456', type: ctx.data.instanceType };
      },
      compensate: async (ctx, result) => {
        await sleep(100);
        console.log('  Compute instance terminated');
        return { terminated: true };
      }
    })
    .addStep({
      name: 'AllocateStorage',
      execute: async (ctx) => {
        await sleep(100);
        return { volumeId: 'vol-789', size: ctx.data.storageSize };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Storage volume deleted');
        return { deleted: true };
      }
    })
    .addStep({
      name: 'ConfigureNetworking',
      execute: async (ctx) => {
        await sleep(100);
        return { vpcId: 'vpc-abc', subnetId: 'subnet-def' };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Network configuration removed');
        return { removed: true };
      }
    });

  const result = await provisionSaga.execute({
    instanceType: 't3.medium',
    storageSize: 100
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 8: Multi-tenant onboarding
 */
async function demonstrateTenantOnboarding() {
  console.log('\n=== Scenario 8: Multi-Tenant Onboarding ===');

  const onboardingSaga = new Saga({
    name: 'TenantOnboardingSaga'
  });

  onboardingSaga
    .addStep({
      name: 'CreateTenantDatabase',
      execute: async (ctx) => {
        await sleep(200);
        return { databaseId: 'db_' + ctx.data.tenantId };
      },
      compensate: async (ctx, result) => {
        await sleep(100);
        console.log('  Tenant database dropped');
        return { dropped: true };
      }
    })
    .addStep({
      name: 'CreateAdminUser',
      execute: async (ctx) => {
        await sleep(100);
        return { adminUserId: 'admin_' + Date.now() };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Admin user deleted');
        return { deleted: true };
      }
    })
    .addStep({
      name: 'SetupDefaultSettings',
      execute: async (ctx) => {
        await sleep(100);
        return { settingsApplied: true };
      }
    });

  const result = await onboardingSaga.execute({
    tenantId: 'tenant_001',
    companyName: 'Acme Corp'
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 9: Event ticket booking
 */
async function demonstrateTicketBooking() {
  console.log('\n=== Scenario 9: Event Ticket Booking ===');

  const bookingSaga = new Saga({
    name: 'TicketBookingSaga'
  });

  bookingSaga
    .addStep({
      name: 'ReserveSeats',
      execute: async (ctx) => {
        await sleep(100);
        return {
          seats: ['A12', 'A13'],
          eventId: ctx.data.eventId
        };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Seats released');
        return { released: true };
      }
    })
    .addStep({
      name: 'ProcessPayment',
      execute: async (ctx) => {
        await sleep(150);
        return {
          paymentId: 'pay_' + Date.now(),
          amount: ctx.data.ticketCount * 50
        };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Payment refunded');
        return { refunded: true };
      }
    })
    .addStep({
      name: 'GenerateTickets',
      execute: async (ctx) => {
        await sleep(100);
        return {
          tickets: ['ticket_1', 'ticket_2'],
          qrCodes: ['qr_1', 'qr_2']
        };
      }
    });

  const result = await bookingSaga.execute({
    eventId: 'event_123',
    ticketCount: 2,
    userId: 'user_456'
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 10: Microservices deployment pipeline
 */
async function demonstrateDeploymentPipeline() {
  console.log('\n=== Scenario 10: Deployment Pipeline ===');

  const deploymentSaga = new Saga({
    name: 'DeploymentSaga'
  });

  deploymentSaga
    .addStep({
      name: 'BuildApplication',
      execute: async (ctx) => {
        await sleep(200);
        return {
          buildId: 'build_' + Date.now(),
          artifact: 'app-v1.2.3.jar'
        };
      }
    })
    .addStep({
      name: 'RunTests',
      execute: async (ctx) => {
        await sleep(150);
        return {
          testsPassed: true,
          coverage: 85
        };
      }
    })
    .addStep({
      name: 'DeployToStaging',
      execute: async (ctx) => {
        await sleep(100);
        return {
          environment: 'staging',
          url: 'https://staging.example.com'
        };
      },
      compensate: async (ctx, result) => {
        await sleep(50);
        console.log('  Staging deployment rolled back');
        return { rolledBack: true };
      }
    })
    .addStep({
      name: 'RunSmokeTests',
      execute: async (ctx) => {
        await sleep(100);
        return { smokeTestsPassed: true };
      }
    });

  const result = await deploymentSaga.execute({
    version: '1.2.3',
    branch: 'main'
  });

  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('Metrics:', JSON.stringify(deploymentSaga.getMetrics(), null, 2));
}

/**
 * Helper function to simulate async operations
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run all scenario demonstrations
 */
async function runAllScenarios() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Saga Pattern - Comprehensive Scenarios    ║');
  console.log('╚══════════════════════════════════════════════╝');

  await demonstrateOrderProcessing();
  await demonstrateFailureCompensation();
  await demonstrateParallelExecution();
  await demonstrateFinancialTransaction();
  await demonstrateUserRegistration();
  await demonstrateSubscription();
  await demonstrateResourceProvisioning();
  await demonstrateTenantOnboarding();
  await demonstrateTicketBooking();
  await demonstrateDeploymentPipeline();

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║      All Scenarios Completed Successfully   ║');
  console.log('╚══════════════════════════════════════════════╝');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Saga,
    SagaStep,
    SagaContext,
    StepState,
    ExecutionMode,
    runAllScenarios
  };
}

// Run demonstrations if executed directly
if (require.main === module) {
  runAllScenarios().catch(console.error);
}
