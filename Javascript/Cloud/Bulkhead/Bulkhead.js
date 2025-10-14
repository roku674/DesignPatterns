/**
 * Bulkhead Pattern
 *
 * Isolates critical resources to prevent cascading failures. Named after the watertight
 * compartments in ships that prevent the entire vessel from sinking if one compartment floods.
 *
 * In cloud architectures, bulkheads partition resources (threads, connections, memory) so that
 * failure in one area doesn't bring down the entire system.
 *
 * Key Concepts:
 * - Resource Isolation: Separate resource pools for different operations
 * - Failure Containment: Failures don't cascade across boundaries
 * - Resource Limits: Enforced limits prevent resource exhaustion
 * - Queue Management: Separate queues for different operation types
 *
 * @author Design Patterns Implementation
 * @version 2.0.0
 */

const EventEmitter = require('events');

/**
 * Bulkhead Configuration
 * Defines resource limits and behavior for a bulkhead compartment
 */
class BulkheadConfig {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 10;
    this.maxQueueSize = options.maxQueueSize || 100;
    this.queueTimeout = options.queueTimeout || 30000;
    this.executionTimeout = options.executionTimeout || 60000;
    this.rejectionStrategy = options.rejectionStrategy || 'throw';
    this.onRejection = options.onRejection || null;
  }
}

/**
 * Bulkhead Statistics
 * Tracks metrics for monitoring and analysis
 */
class BulkheadStats {
  constructor() {
    this.totalRequests = 0;
    this.acceptedRequests = 0;
    this.rejectedRequests = 0;
    this.completedRequests = 0;
    this.failedRequests = 0;
    this.timeoutRequests = 0;
    this.queueTimeouts = 0;
    this.totalExecutionTime = 0;
    this.totalQueueTime = 0;
    this.peakConcurrency = 0;
    this.peakQueueSize = 0;
  }

  recordRequest() {
    this.totalRequests++;
  }

  recordAccepted() {
    this.acceptedRequests++;
  }

  recordRejected() {
    this.rejectedRequests++;
  }

  recordCompleted(executionTime, queueTime) {
    this.completedRequests++;
    this.totalExecutionTime += executionTime;
    this.totalQueueTime += queueTime;
  }

  recordFailed() {
    this.failedRequests++;
  }

  recordTimeout() {
    this.timeoutRequests++;
  }

  recordQueueTimeout() {
    this.queueTimeouts++;
  }

  updatePeakConcurrency(current) {
    if (current > this.peakConcurrency) {
      this.peakConcurrency = current;
    }
  }

  updatePeakQueueSize(current) {
    if (current > this.peakQueueSize) {
      this.peakQueueSize = current;
    }
  }

  getSnapshot() {
    return {
      totalRequests: this.totalRequests,
      acceptedRequests: this.acceptedRequests,
      rejectedRequests: this.rejectedRequests,
      completedRequests: this.completedRequests,
      failedRequests: this.failedRequests,
      timeoutRequests: this.timeoutRequests,
      queueTimeouts: this.queueTimeouts,
      peakConcurrency: this.peakConcurrency,
      peakQueueSize: this.peakQueueSize,
      averageExecutionTime: this.completedRequests > 0
        ? this.totalExecutionTime / this.completedRequests
        : 0,
      averageQueueTime: this.completedRequests > 0
        ? this.totalQueueTime / this.completedRequests
        : 0,
      successRate: this.totalRequests > 0
        ? (this.completedRequests / this.totalRequests) * 100
        : 0
    };
  }
}

/**
 * Request Context
 * Holds information about a queued request
 */
class RequestContext {
  constructor(fn, resolve, reject, context = {}) {
    this.id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.fn = fn;
    this.resolve = resolve;
    this.reject = reject;
    this.context = context;
    this.enqueuedAt = Date.now();
    this.startedAt = null;
    this.completedAt = null;
  }

  getQueueTime() {
    return this.startedAt ? this.startedAt - this.enqueuedAt : Date.now() - this.enqueuedAt;
  }

  getExecutionTime() {
    return this.completedAt && this.startedAt ? this.completedAt - this.startedAt : 0;
  }
}

/**
 * Bulkhead Compartment
 * Represents a single isolated resource pool
 */
class Bulkhead extends EventEmitter {
  constructor(name, config = {}) {
    super();
    this.name = name;
    this.config = new BulkheadConfig(config);
    this.stats = new BulkheadStats();
    this.queue = [];
    this.executing = new Set();
    this.isShutdown = false;
  }

  /**
   * Execute a function within the bulkhead
   * @param {Function} fn - Function to execute
   * @param {Object} context - Optional context data
   * @returns {Promise} Result of the function execution
   */
  async execute(fn, context = {}) {
    if (this.isShutdown) {
      throw new Error(`Bulkhead ${this.name} is shutdown`);
    }

    this.stats.recordRequest();
    this.emit('request', { name: this.name, queueSize: this.queue.length });

    if (this.executing.size < this.config.maxConcurrent) {
      return await this.executeImmediately(fn, context);
    }

    if (this.queue.length >= this.config.maxQueueSize) {
      this.stats.recordRejected();
      this.emit('rejected', {
        name: this.name,
        reason: 'Queue full',
        queueSize: this.queue.length
      });

      if (this.config.rejectionStrategy === 'throw') {
        throw new Error(`Bulkhead ${this.name} queue is full`);
      } else if (this.config.onRejection) {
        return await this.config.onRejection(context);
      }
      return null;
    }

    return await this.enqueue(fn, context);
  }

  /**
   * Execute function immediately without queueing
   */
  async executeImmediately(fn, context) {
    const requestContext = new RequestContext(fn, null, null, context);
    requestContext.startedAt = Date.now();

    this.executing.add(requestContext);
    this.stats.recordAccepted();
    this.stats.updatePeakConcurrency(this.executing.size);

    this.emit('executing', {
      name: this.name,
      requestId: requestContext.id,
      concurrent: this.executing.size
    });

    try {
      const result = await this.executeWithTimeout(fn, context, this.config.executionTimeout);
      requestContext.completedAt = Date.now();

      this.stats.recordCompleted(requestContext.getExecutionTime(), 0);
      this.emit('completed', {
        name: this.name,
        requestId: requestContext.id,
        duration: requestContext.getExecutionTime()
      });

      return result;
    } catch (error) {
      if (error.message === 'Execution timeout') {
        this.stats.recordTimeout();
        this.emit('timeout', { name: this.name, requestId: requestContext.id });
      } else {
        this.stats.recordFailed();
        this.emit('failed', {
          name: this.name,
          requestId: requestContext.id,
          error: error.message
        });
      }
      throw error;
    } finally {
      this.executing.delete(requestContext);
      this.processQueue();
    }
  }

  /**
   * Add request to queue
   */
  async enqueue(fn, context) {
    return new Promise((resolve, reject) => {
      const requestContext = new RequestContext(fn, resolve, reject, context);

      const timeoutId = setTimeout(() => {
        const index = this.queue.indexOf(requestContext);
        if (index !== -1) {
          this.queue.splice(index, 1);
          this.stats.recordQueueTimeout();
          this.emit('queueTimeout', {
            name: this.name,
            requestId: requestContext.id,
            queueTime: requestContext.getQueueTime()
          });
          reject(new Error('Queue timeout'));
        }
      }, this.config.queueTimeout);

      requestContext.timeoutId = timeoutId;
      this.queue.push(requestContext);
      this.stats.updatePeakQueueSize(this.queue.length);

      this.emit('queued', {
        name: this.name,
        requestId: requestContext.id,
        queueSize: this.queue.length
      });
    });
  }

  /**
   * Process queued requests
   */
  async processQueue() {
    while (this.queue.length > 0 && this.executing.size < this.config.maxConcurrent) {
      const requestContext = this.queue.shift();

      if (requestContext.timeoutId) {
        clearTimeout(requestContext.timeoutId);
      }

      requestContext.startedAt = Date.now();
      const queueTime = requestContext.getQueueTime();

      this.executing.add(requestContext);
      this.stats.recordAccepted();
      this.stats.updatePeakConcurrency(this.executing.size);

      this.emit('dequeued', {
        name: this.name,
        requestId: requestContext.id,
        queueTime
      });

      this.executeRequest(requestContext).catch(() => {});
    }
  }

  /**
   * Execute a queued request
   */
  async executeRequest(requestContext) {
    try {
      const result = await this.executeWithTimeout(
        requestContext.fn,
        requestContext.context,
        this.config.executionTimeout
      );

      requestContext.completedAt = Date.now();
      this.stats.recordCompleted(
        requestContext.getExecutionTime(),
        requestContext.getQueueTime()
      );

      this.emit('completed', {
        name: this.name,
        requestId: requestContext.id,
        duration: requestContext.getExecutionTime()
      });

      requestContext.resolve(result);
    } catch (error) {
      if (error.message === 'Execution timeout') {
        this.stats.recordTimeout();
        this.emit('timeout', { name: this.name, requestId: requestContext.id });
      } else {
        this.stats.recordFailed();
        this.emit('failed', {
          name: this.name,
          requestId: requestContext.id,
          error: error.message
        });
      }
      requestContext.reject(error);
    } finally {
      this.executing.delete(requestContext);
      this.processQueue();
    }
  }

  /**
   * Execute with timeout
   */
  async executeWithTimeout(fn, context, timeout) {
    return Promise.race([
      fn(context),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      )
    ]);
  }

  /**
   * Get current state
   */
  getState() {
    return {
      name: this.name,
      executing: this.executing.size,
      queued: this.queue.length,
      maxConcurrent: this.config.maxConcurrent,
      maxQueueSize: this.config.maxQueueSize,
      utilizationPercent: (this.executing.size / this.config.maxConcurrent) * 100,
      queueUtilizationPercent: (this.queue.length / this.config.maxQueueSize) * 100,
      isShutdown: this.isShutdown
    };
  }

  /**
   * Get statistics
   */
  getStats() {
    return this.stats.getSnapshot();
  }

  /**
   * Shutdown bulkhead
   */
  async shutdown(graceful = true) {
    this.isShutdown = true;

    if (graceful) {
      while (this.executing.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      for (const req of this.executing) {
        req.reject(new Error('Bulkhead shutdown'));
      }
      this.executing.clear();
    }

    for (const req of this.queue) {
      if (req.timeoutId) {
        clearTimeout(req.timeoutId);
      }
      req.reject(new Error('Bulkhead shutdown'));
    }
    this.queue = [];

    this.emit('shutdown', { name: this.name });
  }
}

/**
 * Bulkhead Manager
 * Manages multiple bulkhead compartments
 */
class BulkheadManager {
  constructor() {
    this.bulkheads = new Map();
  }

  /**
   * Create a new bulkhead
   */
  create(name, config = {}) {
    if (this.bulkheads.has(name)) {
      throw new Error(`Bulkhead ${name} already exists`);
    }

    const bulkhead = new Bulkhead(name, config);
    this.bulkheads.set(name, bulkhead);
    return bulkhead;
  }

  /**
   * Get a bulkhead by name
   */
  get(name) {
    return this.bulkheads.get(name);
  }

  /**
   * Execute function in named bulkhead
   */
  async execute(name, fn, context = {}) {
    const bulkhead = this.bulkheads.get(name);
    if (!bulkhead) {
      throw new Error(`Bulkhead ${name} not found`);
    }
    return await bulkhead.execute(fn, context);
  }

  /**
   * Get all bulkhead states
   */
  getAllStates() {
    const states = {};
    for (const [name, bulkhead] of this.bulkheads) {
      states[name] = bulkhead.getState();
    }
    return states;
  }

  /**
   * Get all bulkhead statistics
   */
  getAllStats() {
    const stats = {};
    for (const [name, bulkhead] of this.bulkheads) {
      stats[name] = bulkhead.getStats();
    }
    return stats;
  }

  /**
   * Shutdown all bulkheads
   */
  async shutdownAll(graceful = true) {
    const promises = [];
    for (const bulkhead of this.bulkheads.values()) {
      promises.push(bulkhead.shutdown(graceful));
    }
    await Promise.all(promises);
  }
}

/**
 * Demonstration scenarios
 */

// Scenario 1: Database Connection Pool Isolation
async function scenario1_DatabaseConnectionPool() {
  console.log('\n=== Scenario 1: Database Connection Pool Isolation ===\n');

  const manager = new BulkheadManager();

  const readPool = manager.create('read-pool', {
    maxConcurrent: 20,
    maxQueueSize: 50,
    executionTimeout: 5000
  });

  const writePool = manager.create('write-pool', {
    maxConcurrent: 10,
    maxQueueSize: 30,
    executionTimeout: 10000
  });

  const simulateDbRead = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { data: 'Read result' };
  };

  const simulateDbWrite = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  };

  const readPromises = Array(25).fill().map(() =>
    readPool.execute(simulateDbRead)
  );

  const writePromises = Array(12).fill().map(() =>
    writePool.execute(simulateDbWrite)
  );

  await Promise.allSettled([...readPromises, ...writePromises]);

  console.log('Read Pool State:', readPool.getState());
  console.log('Read Pool Stats:', readPool.getStats());
  console.log('\nWrite Pool State:', writePool.getState());
  console.log('Write Pool Stats:', writePool.getStats());
}

// Scenario 2: Microservice API Isolation
async function scenario2_MicroserviceIsolation() {
  console.log('\n=== Scenario 2: Microservice API Isolation ===\n');

  const manager = new BulkheadManager();

  manager.create('user-service', { maxConcurrent: 15, maxQueueSize: 40 });
  manager.create('order-service', { maxConcurrent: 10, maxQueueSize: 30 });
  manager.create('payment-service', { maxConcurrent: 5, maxQueueSize: 20 });

  const simulateApiCall = (service, delay) => async () => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return { service, status: 'success' };
  };

  const promises = [
    ...Array(20).fill().map(() => manager.execute('user-service', simulateApiCall('user', 50))),
    ...Array(15).fill().map(() => manager.execute('order-service', simulateApiCall('order', 100))),
    ...Array(10).fill().map(() => manager.execute('payment-service', simulateApiCall('payment', 150)))
  ];

  await Promise.allSettled(promises);

  console.log('All Service States:', manager.getAllStates());
  console.log('\nAll Service Stats:', manager.getAllStats());
}

// Scenario 3: Queue Rejection Strategy
async function scenario3_QueueRejection() {
  console.log('\n=== Scenario 3: Queue Rejection Strategy ===\n');

  const bulkhead = new Bulkhead('limited-capacity', {
    maxConcurrent: 2,
    maxQueueSize: 3,
    rejectionStrategy: 'throw'
  });

  const slowTask = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'completed';
  };

  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      bulkhead.execute(slowTask)
        .then(result => ({ index: i, result }))
        .catch(error => ({ index: i, error: error.message }))
    );
  }

  const results = await Promise.all(promises);
  console.log('Results:', results);
  console.log('\nBulkhead Stats:', bulkhead.getStats());
}

// Scenario 4: Event Monitoring
async function scenario4_EventMonitoring() {
  console.log('\n=== Scenario 4: Event Monitoring ===\n');

  const bulkhead = new Bulkhead('monitored', {
    maxConcurrent: 3,
    maxQueueSize: 5
  });

  bulkhead.on('request', (data) => console.log(`[REQUEST] ${data.name}`));
  bulkhead.on('queued', (data) => console.log(`[QUEUED] ${data.requestId}`));
  bulkhead.on('executing', (data) => console.log(`[EXECUTING] ${data.requestId} (${data.concurrent} concurrent)`));
  bulkhead.on('completed', (data) => console.log(`[COMPLETED] ${data.requestId} in ${data.duration}ms`));

  const task = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return 'done';
  };

  const promises = Array(8).fill().map(() => bulkhead.execute(task));
  await Promise.allSettled(promises);
}

// Scenario 5: Timeout Handling
async function scenario5_TimeoutHandling() {
  console.log('\n=== Scenario 5: Timeout Handling ===\n');

  const bulkhead = new Bulkhead('timeout-test', {
    maxConcurrent: 5,
    executionTimeout: 1000,
    queueTimeout: 2000
  });

  const fastTask = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'fast';
  };

  const slowTask = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return 'slow';
  };

  const promises = [
    ...Array(3).fill().map(() => bulkhead.execute(fastTask)),
    ...Array(3).fill().map(() => bulkhead.execute(slowTask))
  ];

  const results = await Promise.allSettled(promises);
  console.log('Results:', results.map(r => r.status));
  console.log('\nStats:', bulkhead.getStats());
}

// Scenario 6: Custom Rejection Handler
async function scenario6_CustomRejection() {
  console.log('\n=== Scenario 6: Custom Rejection Handler ===\n');

  const bulkhead = new Bulkhead('custom-rejection', {
    maxConcurrent: 2,
    maxQueueSize: 2,
    rejectionStrategy: 'callback',
    onRejection: async (context) => {
      console.log('Request rejected, using fallback');
      return { fallback: true, data: 'default value' };
    }
  });

  const task = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: 'actual value' };
  };

  const promises = Array(8).fill().map(() => bulkhead.execute(task));
  const results = await Promise.all(promises);
  console.log('Results:', results);
}

// Scenario 7: Graceful Shutdown
async function scenario7_GracefulShutdown() {
  console.log('\n=== Scenario 7: Graceful Shutdown ===\n');

  const bulkhead = new Bulkhead('shutdown-test', {
    maxConcurrent: 3,
    maxQueueSize: 10
  });

  const task = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'completed';
  };

  bulkhead.on('shutdown', () => console.log('Bulkhead shutdown complete'));

  const promises = Array(10).fill().map(() =>
    bulkhead.execute(task).catch(e => e.message)
  );

  setTimeout(() => bulkhead.shutdown(true), 1000);

  const results = await Promise.all(promises);
  console.log('Results:', results);
}

// Scenario 8: Load Testing
async function scenario8_LoadTesting() {
  console.log('\n=== Scenario 8: Load Testing ===\n');

  const bulkhead = new Bulkhead('load-test', {
    maxConcurrent: 10,
    maxQueueSize: 100
  });

  const task = async () => {
    const delay = Math.floor(Math.random() * 200) + 50;
    await new Promise(resolve => setTimeout(resolve, delay));
    if (Math.random() < 0.1) throw new Error('Random failure');
    return 'success';
  };

  console.log('Starting load test with 150 requests...');

  const startTime = Date.now();
  const promises = Array(150).fill().map(() =>
    bulkhead.execute(task).catch(e => 'failed')
  );

  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;

  console.log(`\nCompleted in ${duration}ms`);
  console.log('Successful:', results.filter(r => r === 'success').length);
  console.log('Failed:', results.filter(r => r === 'failed').length);
  console.log('\nFinal Stats:', bulkhead.getStats());
}

/**
 * Run all demonstration scenarios
 */
async function demonstrateBulkhead() {
  console.log('='.repeat(70));
  console.log('BULKHEAD PATTERN DEMONSTRATION');
  console.log('='.repeat(70));

  await scenario1_DatabaseConnectionPool();
  await scenario2_MicroserviceIsolation();
  await scenario3_QueueRejection();
  await scenario4_EventMonitoring();
  await scenario5_TimeoutHandling();
  await scenario6_CustomRejection();
  await scenario7_GracefulShutdown();
  await scenario8_LoadTesting();

  console.log('\n' + '='.repeat(70));
  console.log('All scenarios completed');
  console.log('='.repeat(70));
}

// Export classes and functions
module.exports = {
  Bulkhead,
  BulkheadManager,
  BulkheadConfig,
  BulkheadStats,
  demonstrateBulkhead
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateBulkhead().catch(console.error);
}
