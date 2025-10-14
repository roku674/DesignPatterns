/**
 * Orchestration Pattern
 *
 * Centralized workflow where an orchestrator coordinates all steps and manages
 * the flow of execution. The orchestrator calls services in sequence.
 *
 * Benefits:
 * - Clear workflow visibility: Easy to understand the flow
 * - Centralized control: Single place to manage logic
 * - Error handling: Easier to handle failures
 * - Transaction management: Orchestrator can coordinate sagas
 *
 * Use Cases:
 * - Complex business processes
 * - Multi-step transactions
 * - Workflows requiring compensation logic
 * - Process automation
 */

class WorkflowStep {
  constructor(name, action, config = {}) {
    this.name = name;
    this.action = action;
    this.config = {
      compensate: config.compensate || null,
      retries: config.retries || 0,
      timeout: config.timeout || 30000,
      ...config
    };
  }
}

class WorkflowInstance {
  constructor(id, orchestrator) {
    this.id = id;
    this.orchestrator = orchestrator;
    this.status = 'pending';
    this.executedSteps = [];
    this.context = {};
    this.startedAt = null;
    this.completedAt = null;
    this.error = null;
  }

  async execute(initialData) {
    this.startedAt = Date.now();
    this.status = 'running';
    this.context = { ...initialData };

    console.log(`\n[Workflow:${this.id}] Starting execution\n`);

    for (const step of this.orchestrator.steps) {
      const stepResult = await this.executeStep(step);

      this.executedSteps.push({
        step: step.name,
        status: stepResult.status,
        timestamp: Date.now(),
        duration: stepResult.duration
      });

      if (stepResult.status === 'failed') {
        this.status = 'failed';
        this.error = stepResult.error;
        console.log(`\n[Workflow:${this.id}] Failed at step: ${step.name}`);
        await this.compensate();
        break;
      }

      this.context = { ...this.context, ...stepResult.output };
    }

    if (this.status !== 'failed') {
      this.status = 'completed';
      console.log(`\n[Workflow:${this.id}] Completed successfully`);
    }

    this.completedAt = Date.now();

    return {
      id: this.id,
      status: this.status,
      duration: this.completedAt - this.startedAt,
      executedSteps: this.executedSteps.length,
      context: this.context,
      error: this.error
    };
  }

  async executeStep(step) {
    console.log(`  [Workflow:${this.id}] Executing: ${step.name}`);
    const startTime = Date.now();

    let attempt = 0;
    let lastError = null;

    while (attempt <= step.config.retries) {
      const result = await step.action(this.context);

      if (result.success) {
        const duration = Date.now() - startTime;
        console.log(`  [Workflow:${this.id}] ✓ ${step.name} completed (${duration}ms)`);
        return {
          status: 'success',
          output: result.data || {},
          duration: duration
        };
      }

      lastError = result.error;
      attempt++;

      if (attempt <= step.config.retries) {
        console.log(`  [Workflow:${this.id}] Retrying ${step.name} (attempt ${attempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    const duration = Date.now() - startTime;
    console.log(`  [Workflow:${this.id}] ✗ ${step.name} failed after ${attempt} attempts`);

    return {
      status: 'failed',
      error: lastError,
      duration: duration
    };
  }

  async compensate() {
    console.log(`\n[Workflow:${this.id}] Starting compensation...\n`);

    const completedSteps = this.executedSteps.filter(s => s.status === 'success').reverse();

    for (const executedStep of completedSteps) {
      const step = this.orchestrator.steps.find(s => s.name === executedStep.step);

      if (step && step.config.compensate) {
        console.log(`  [Workflow:${this.id}] Compensating: ${step.name}`);
        await step.config.compensate(this.context);
      }
    }

    console.log(`\n[Workflow:${this.id}] Compensation completed`);
  }
}

class Orchestrator {
  constructor(name, config = {}) {
    this.name = name;
    this.config = {
      maxConcurrentWorkflows: config.maxConcurrentWorkflows || 10,
      ...config
    };

    this.steps = [];
    this.workflows = new Map();
    this.statistics = {
      workflowsStarted: 0,
      workflowsCompleted: 0,
      workflowsFailed: 0,
      stepsExecuted: 0,
      compensations: 0
    };
  }

  addStep(name, action, config = {}) {
    const step = new WorkflowStep(name, action, config);
    this.steps.push(step);
    console.log(`[Orchestrator:${this.name}] Added step: ${name}`);
    return this;
  }

  async startWorkflow(initialData) {
    const workflowId = `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const workflow = new WorkflowInstance(workflowId, this);

    this.workflows.set(workflowId, workflow);
    this.statistics.workflowsStarted++;

    const result = await workflow.execute(initialData);

    this.statistics.stepsExecuted += workflow.executedSteps.length;

    if (result.status === 'completed') {
      this.statistics.workflowsCompleted++;
    } else {
      this.statistics.workflowsFailed++;
      this.statistics.compensations++;
    }

    return result;
  }

  getStatistics() {
    return {
      ...this.statistics,
      activeWorkflows: Array.from(this.workflows.values()).filter(w => w.status === 'running').length,
      totalSteps: this.steps.length
    };
  }
}

class Orchestration {
  constructor(config = {}) {
    this.config = {
      enableLogging: config.enableLogging !== false,
      ...config
    };

    this.orchestrators = new Map();
  }

  createOrchestrator(name, config = {}) {
    const orchestrator = new Orchestrator(name, config);
    this.orchestrators.set(name, orchestrator);
    console.log(`[Orchestration] Created orchestrator: ${name}`);
    return orchestrator;
  }

  getStatistics() {
    const orchestratorStats = {};
    for (const [name, orchestrator] of this.orchestrators) {
      orchestratorStats[name] = orchestrator.getStatistics();
    }

    return {
      totalOrchestrators: this.orchestrators.size,
      orchestrators: orchestratorStats
    };
  }

  printStatistics() {
    const stats = this.getStatistics();

    console.log('\n========== Orchestration Pattern Statistics ==========');
    console.log(`Total Orchestrators: ${stats.totalOrchestrators}\n`);

    for (const [name, orchestratorStats] of Object.entries(stats.orchestrators)) {
      console.log(`Orchestrator: ${name}`);
      console.log(`  Total Steps: ${orchestratorStats.totalSteps}`);
      console.log(`  Workflows Started: ${orchestratorStats.workflowsStarted}`);
      console.log(`  Workflows Completed: ${orchestratorStats.workflowsCompleted}`);
      console.log(`  Workflows Failed: ${orchestratorStats.workflowsFailed}`);
      console.log(`  Steps Executed: ${orchestratorStats.stepsExecuted}`);
      console.log(`  Compensations: ${orchestratorStats.compensations}`);
      console.log(`  Active Workflows: ${orchestratorStats.activeWorkflows}`);
    }

    console.log('======================================================\n');
  }

  execute() {
    console.log('Orchestration Pattern Demonstration');
    console.log('===================================\n');
    console.log('Configuration:');
    console.log(`  Logging: ${this.config.enableLogging}`);
    console.log('');

    return {
      success: true,
      pattern: 'Orchestration',
      config: this.config,
      components: {
        orchestrators: this.orchestrators.size
      }
    };
  }
}

async function demonstrateOrchestration() {
  console.log('Starting Orchestration Pattern Demonstration\n');

  const orchestration = new Orchestration({ enableLogging: true });

  console.log('--- Creating Order Processing Orchestrator ---\n');

  const orderOrchestrator = orchestration.createOrchestrator('order-processing');

  orderOrchestrator
    .addStep('validate-order', async (context) => {
      console.log(`    Validating order ${context.orderId}...`);
      await new Promise(resolve => setTimeout(resolve, 50));
      return {
        success: true,
        data: { validated: true }
      };
    })
    .addStep('reserve-inventory', async (context) => {
      console.log(`    Reserving inventory for order ${context.orderId}...`);
      await new Promise(resolve => setTimeout(resolve, 40));
      return {
        success: true,
        data: { inventoryReserved: true }
      };
    }, {
      compensate: async (context) => {
        console.log(`    Releasing inventory for order ${context.orderId}`);
      }
    })
    .addStep('process-payment', async (context) => {
      console.log(`    Processing payment for order ${context.orderId}...`);
      await new Promise(resolve => setTimeout(resolve, 60));
      return {
        success: true,
        data: { paymentId: 'PAY-123', amount: context.total }
      };
    }, {
      compensate: async (context) => {
        console.log(`    Refunding payment ${context.paymentId}`);
      }
    })
    .addStep('create-shipment', async (context) => {
      console.log(`    Creating shipment for order ${context.orderId}...`);
      await new Promise(resolve => setTimeout(resolve, 30));
      return {
        success: true,
        data: { trackingNumber: 'TRACK-456' }
      };
    })
    .addStep('send-confirmation', async (context) => {
      console.log(`    Sending confirmation email for order ${context.orderId}...`);
      await new Promise(resolve => setTimeout(resolve, 20));
      return {
        success: true,
        data: { emailSent: true }
      };
    });

  orchestration.execute();

  console.log('--- Executing Successful Workflow ---');
  const result1 = await orderOrchestrator.startWorkflow({
    orderId: 'ORD-001',
    customerId: 'CUST-123',
    items: ['item1', 'item2'],
    total: 99.99
  });

  console.log(`\nWorkflow Result:`, {
    id: result1.id,
    status: result1.status,
    duration: result1.duration + 'ms',
    executedSteps: result1.executedSteps
  });

  orchestration.printStatistics();
}

if (require.main === module) {
  demonstrateOrchestration().catch(console.error);
}

module.exports = Orchestration;
