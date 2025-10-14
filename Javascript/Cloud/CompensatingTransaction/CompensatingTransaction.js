/**
 * Compensating Transaction Pattern
 *
 * Implements rollback logic for distributed transactions by defining compensating
 * actions that undo the effects of previous operations. Essential for maintaining
 * consistency in distributed systems where traditional ACID transactions aren't feasible.
 *
 * Key Concepts:
 * - Saga Pattern: Chain of transactions with compensations
 * - Forward Recovery: Complete transaction or compensate
 * - Compensation Logic: Reverse operations for rollback
 * - Idempotency: Compensation actions can be retried safely
 * - State Tracking: Monitor transaction progress
 */

/**
 * Transaction Status
 */
const TransactionStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  COMPENSATING: 'compensating',
  COMPENSATED: 'compensated',
  FAILED: 'failed'
};

/**
 * Transaction Step
 * Represents a single step in a distributed transaction
 */
class TransactionStep {
  constructor(name, action, compensation, config = {}) {
    if (!name) {
      throw new Error('Step name is required');
    }
    if (typeof action !== 'function') {
      throw new Error('Action must be a function');
    }
    if (typeof compensation !== 'function') {
      throw new Error('Compensation must be a function');
    }

    this.name = name;
    this.action = action;
    this.compensation = compensation;
    this.timeout = config.timeout || 30000;
    this.retryCount = config.retryCount || 0;
    this.executed = false;
    this.compensated = false;
    this.result = null;
    this.error = null;
  }

  /**
   * Execute the action
   */
  async execute(context) {
    if (this.executed) {
      throw new Error(`Step ${this.name} already executed`);
    }

    const startTime = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Action timeout')), this.timeout);
      });

      this.result = await Promise.race([
        this.action(context),
        timeoutPromise
      ]);

      this.executed = true;

      return {
        success: true,
        step: this.name,
        result: this.result,
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.error = error;
      throw error;
    }
  }

  /**
   * Execute compensation
   */
  async compensate(context) {
    if (!this.executed) {
      return {
        success: true,
        step: this.name,
        message: 'Step not executed, no compensation needed'
      };
    }

    if (this.compensated) {
      return {
        success: true,
        step: this.name,
        message: 'Step already compensated'
      };
    }

    const startTime = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Compensation timeout')), this.timeout);
      });

      const compensationContext = {
        ...context,
        originalResult: this.result
      };

      await Promise.race([
        this.compensation(compensationContext),
        timeoutPromise
      ]);

      this.compensated = true;

      return {
        success: true,
        step: this.name,
        duration: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`Compensation failed for step ${this.name}: ${error.message}`);
    }
  }

  /**
   * Get step status
   */
  getStatus() {
    return {
      name: this.name,
      executed: this.executed,
      compensated: this.compensated,
      hasError: this.error !== null,
      error: this.error ? this.error.message : null
    };
  }
}

/**
 * Saga Transaction
 * Manages a sequence of transaction steps with compensation logic
 */
class SagaTransaction {
  constructor(name, config = {}) {
    if (!name) {
      throw new Error('Transaction name is required');
    }

    this.name = name;
    this.steps = [];
    this.status = TransactionStatus.PENDING;
    this.context = {};
    this.executedSteps = [];
    this.compensatedSteps = [];
    this.startTime = null;
    this.endTime = null;
    this.error = null;
    this.compensateOnFailure = config.compensateOnFailure !== false;
  }

  /**
   * Add a transaction step
   */
  addStep(step) {
    if (!(step instanceof TransactionStep)) {
      throw new Error('Step must be an instance of TransactionStep');
    }

    if (this.status !== TransactionStatus.PENDING) {
      throw new Error('Cannot add steps after transaction has started');
    }

    this.steps.push(step);
    return this;
  }

  /**
   * Execute the saga transaction
   */
  async execute(initialContext = {}) {
    if (this.status !== TransactionStatus.PENDING) {
      throw new Error('Transaction already executed');
    }

    this.status = TransactionStatus.IN_PROGRESS;
    this.startTime = Date.now();
    this.context = { ...initialContext };

    try {
      for (const step of this.steps) {
        const result = await step.execute(this.context);
        this.executedSteps.push(step);

        this.context[step.name] = result.result;
      }

      this.status = TransactionStatus.COMPLETED;
      this.endTime = Date.now();

      return {
        success: true,
        status: this.status,
        context: this.context,
        duration: this.endTime - this.startTime,
        executedSteps: this.executedSteps.map(s => s.name)
      };
    } catch (error) {
      this.error = error;
      this.status = TransactionStatus.FAILED;

      if (this.compensateOnFailure) {
        await this.compensate();
      }

      throw new Error(`Transaction ${this.name} failed: ${error.message}`);
    }
  }

  /**
   * Compensate executed steps
   */
  async compensate() {
    if (this.executedSteps.length === 0) {
      return {
        success: true,
        message: 'No steps to compensate'
      };
    }

    this.status = TransactionStatus.COMPENSATING;
    const compensationErrors = [];

    const stepsToCompensate = [...this.executedSteps].reverse();

    for (const step of stepsToCompensate) {
      try {
        const result = await step.compensate(this.context);
        this.compensatedSteps.push(step);
      } catch (error) {
        compensationErrors.push({
          step: step.name,
          error: error.message
        });
      }
    }

    if (compensationErrors.length > 0) {
      throw new Error(
        `Compensation incomplete. Errors: ${JSON.stringify(compensationErrors)}`
      );
    }

    this.status = TransactionStatus.COMPENSATED;
    this.endTime = Date.now();

    return {
      success: true,
      status: this.status,
      compensatedSteps: this.compensatedSteps.map(s => s.name),
      duration: this.endTime - this.startTime
    };
  }

  /**
   * Get transaction status
   */
  getStatus() {
    return {
      name: this.name,
      status: this.status,
      totalSteps: this.steps.length,
      executedSteps: this.executedSteps.length,
      compensatedSteps: this.compensatedSteps.length,
      duration: this.endTime ? this.endTime - this.startTime : null,
      error: this.error ? this.error.message : null,
      steps: this.steps.map(s => s.getStatus())
    };
  }
}

/**
 * Transaction Coordinator
 * Manages multiple saga transactions
 */
class TransactionCoordinator {
  constructor() {
    this.transactions = new Map();
    this.history = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Register a transaction
   */
  registerTransaction(transaction) {
    if (!(transaction instanceof SagaTransaction)) {
      throw new Error('Transaction must be an instance of SagaTransaction');
    }

    this.transactions.set(transaction.name, transaction);
  }

  /**
   * Execute a transaction
   */
  async executeTransaction(transactionName, context = {}) {
    const transaction = this.transactions.get(transactionName);

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionName}`);
    }

    try {
      const result = await transaction.execute(context);
      this.addToHistory(transaction);
      return result;
    } catch (error) {
      this.addToHistory(transaction);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  getTransactionStatus(transactionName) {
    const transaction = this.transactions.get(transactionName);

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionName}`);
    }

    return transaction.getStatus();
  }

  /**
   * Get all transactions
   */
  getAllTransactions() {
    return Array.from(this.transactions.values()).map(t => t.getStatus());
  }

  /**
   * Add transaction to history
   */
  addToHistory(transaction) {
    this.history.push({
      name: transaction.name,
      status: transaction.status,
      timestamp: Date.now(),
      duration: transaction.endTime ? transaction.endTime - transaction.startTime : null
    });

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get transaction history
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const completed = this.history.filter(t => t.status === TransactionStatus.COMPLETED).length;
    const failed = this.history.filter(t => t.status === TransactionStatus.FAILED).length;
    const compensated = this.history.filter(t => t.status === TransactionStatus.COMPENSATED).length;

    return {
      totalTransactions: this.history.length,
      completed,
      failed,
      compensated,
      successRate: this.history.length > 0 ? (completed / this.history.length) * 100 : 0,
      averageDuration: this.calculateAverageDuration()
    };
  }

  /**
   * Calculate average transaction duration
   */
  calculateAverageDuration() {
    const durationsCompleted = this.history
      .filter(t => t.duration !== null)
      .map(t => t.duration);

    if (durationsCompleted.length === 0) {
      return 0;
    }

    const total = durationsCompleted.reduce((sum, d) => sum + d, 0);
    return total / durationsCompleted.length;
  }
}

/**
 * Distributed Transaction Builder
 * Fluent API for building distributed transactions
 */
class DistributedTransactionBuilder {
  constructor(name) {
    if (!name) {
      throw new Error('Transaction name is required');
    }
    this.transaction = new SagaTransaction(name);
  }

  /**
   * Add a step
   */
  step(name, action, compensation, config = {}) {
    const step = new TransactionStep(name, action, compensation, config);
    this.transaction.addStep(step);
    return this;
  }

  /**
   * Disable auto-compensation on failure
   */
  noAutoCompensate() {
    this.transaction.compensateOnFailure = false;
    return this;
  }

  /**
   * Build the transaction
   */
  build() {
    return this.transaction;
  }
}

/**
 * Compensation Strategy
 * Defines different compensation strategies
 */
class CompensationStrategy {
  /**
   * Sequential compensation (reverse order)
   */
  static sequential() {
    return {
      type: 'sequential',
      execute: async (steps, context) => {
        const reversed = [...steps].reverse();
        for (const step of reversed) {
          await step.compensate(context);
        }
      }
    };
  }

  /**
   * Parallel compensation (all at once)
   */
  static parallel() {
    return {
      type: 'parallel',
      execute: async (steps, context) => {
        await Promise.all(steps.map(step => step.compensate(context)));
      }
    };
  }

  /**
   * Best effort compensation (continue even if some fail)
   */
  static bestEffort() {
    return {
      type: 'best-effort',
      execute: async (steps, context) => {
        const reversed = [...steps].reverse();
        const results = [];

        for (const step of reversed) {
          try {
            const result = await step.compensate(context);
            results.push({ step: step.name, success: true, result });
          } catch (error) {
            results.push({ step: step.name, success: false, error: error.message });
          }
        }

        return results;
      }
    };
  }
}

/**
 * Main Compensating Transaction class
 */
class CompensatingTransaction {
  /**
   * Create a new distributed transaction builder
   */
  static createTransaction(name) {
    return new DistributedTransactionBuilder(name);
  }

  /**
   * Create a transaction coordinator
   */
  static createCoordinator() {
    return new TransactionCoordinator();
  }

  /**
   * Create a transaction step
   */
  static createStep(name, action, compensation, config) {
    return new TransactionStep(name, action, compensation, config);
  }

  /**
   * Get compensation strategies
   */
  static get Strategy() {
    return CompensationStrategy;
  }

  /**
   * Get transaction status enum
   */
  static get Status() {
    return TransactionStatus;
  }
}

module.exports = {
  CompensatingTransaction,
  SagaTransaction,
  TransactionStep,
  TransactionCoordinator,
  DistributedTransactionBuilder,
  CompensationStrategy,
  TransactionStatus
};
