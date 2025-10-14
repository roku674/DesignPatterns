/**
 * BulkheadCloud Pattern - Cloud-Native Bulkhead Implementation
 *
 * Extends the Bulkhead pattern with cloud-specific features including circuit breaker
 * integration, distributed tracing, health monitoring, and metrics collection for
 * cloud environments.
 *
 * Cloud-Specific Features:
 * - Circuit Breaker Integration: Prevents cascading failures
 * - Distributed Tracing: Track requests across services
 * - Health Checks: Monitor bulkhead health status
 * - Auto-scaling Hints: Provide metrics for auto-scaling decisions
 * - Metrics Export: CloudWatch/Prometheus compatible metrics
 *
 * @author Design Patterns Implementation
 * @version 2.0.0
 */

const EventEmitter = require('events');

/**
 * Circuit Breaker States
 */
const CircuitState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

/**
 * Circuit Breaker for Cloud Bulkhead
 * Prevents requests when failure threshold is exceeded
 */
class CircuitBreaker extends EventEmitter {
  constructor(name, config = {}) {
    super();
    this.name = name;
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.failureThreshold = config.failureThreshold || 5;
    this.successThreshold = config.successThreshold || 2;
    this.timeout = config.timeout || 60000;
    this.halfOpenMaxCalls = config.halfOpenMaxCalls || 3;
    this.halfOpenCallCount = 0;
    this.openedAt = null;
    this.lastError = null;
  }

  /**
   * Check if request is allowed
   */
  async allowRequest() {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      const elapsed = Date.now() - this.openedAt;
      if (elapsed >= this.timeout) {
        this.transitionToHalfOpen();
        return true;
      }
      this.emit('blocked', { name: this.name, reason: 'Circuit breaker open' });
      return false;
    }

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenCallCount < this.halfOpenMaxCalls) {
        this.halfOpenCallCount++;
        return true;
      }
      this.emit('blocked', { name: this.name, reason: 'Half-open limit reached' });
      return false;
    }

    return false;
  }

  /**
   * Record successful execution
   */
  async recordSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.transitionToClosed();
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  /**
   * Record failed execution
   */
  async recordFailure(error) {
    this.lastError = error;

    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionToOpen();
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold) {
        this.transitionToOpen();
      }
    }
  }

  transitionToOpen() {
    this.state = CircuitState.OPEN;
    this.openedAt = Date.now();
    this.emit('stateChange', {
      name: this.name,
      from: this.state,
      to: CircuitState.OPEN,
      reason: `Failure threshold exceeded: ${this.failureCount}/${this.failureThreshold}`
    });
  }

  transitionToHalfOpen() {
    this.state = CircuitState.HALF_OPEN;
    this.halfOpenCallCount = 0;
    this.successCount = 0;
    this.emit('stateChange', {
      name: this.name,
      from: CircuitState.OPEN,
      to: CircuitState.HALF_OPEN,
      reason: 'Timeout elapsed, testing service'
    });
  }

  transitionToClosed() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCallCount = 0;
    this.emit('stateChange', {
      name: this.name,
      from: CircuitState.HALF_OPEN,
      to: CircuitState.CLOSED,
      reason: 'Service recovered'
    });
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      openedAt: this.openedAt,
      lastError: this.lastError ? this.lastError.message : null
    };
  }
}

/**
 * Distributed Trace Context
 * Track requests across distributed systems
 */
class TraceContext {
  constructor(parentSpanId = null) {
    this.traceId = this.generateId();
    this.spanId = this.generateId();
    this.parentSpanId = parentSpanId;
    this.startTime = Date.now();
    this.tags = {};
    this.logs = [];
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  addTag(key, value) {
    this.tags[key] = value;
  }

  addLog(message, data = {}) {
    this.logs.push({
      timestamp: Date.now(),
      message,
      data
    });
  }

  finish() {
    this.endTime = Date.now();
    this.duration = this.endTime - this.startTime;
  }

  toJSON() {
    return {
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      duration: this.duration,
      tags: this.tags,
      logs: this.logs
    };
  }
}

/**
 * Cloud Metrics Collector
 * Collects and exports metrics for cloud monitoring
 */
class CloudMetrics {
  constructor(bulkheadName) {
    this.bulkheadName = bulkheadName;
    this.metrics = {
      requestRate: 0,
      errorRate: 0,
      p50Latency: 0,
      p95Latency: 0,
      p99Latency: 0,
      activeRequests: 0,
      queueDepth: 0,
      rejectionRate: 0
    };
    this.latencies = [];
    this.windowStart = Date.now();
    this.windowSize = 60000; // 1 minute
    this.requestCount = 0;
    this.errorCount = 0;
    this.rejectionCount = 0;
  }

  recordRequest(latency, success, rejected = false) {
    this.requestCount++;
    if (!success) this.errorCount++;
    if (rejected) this.rejectionCount++;

    if (latency) {
      this.latencies.push(latency);
      if (this.latencies.length > 1000) {
        this.latencies.shift();
      }
    }

    this.updateMetrics();
  }

  updateMetrics() {
    const now = Date.now();
    const elapsed = now - this.windowStart;

    if (elapsed >= this.windowSize) {
      this.metrics.requestRate = (this.requestCount / elapsed) * 1000;
      this.metrics.errorRate = (this.errorCount / this.requestCount) || 0;
      this.metrics.rejectionRate = (this.rejectionCount / this.requestCount) || 0;

      this.requestCount = 0;
      this.errorCount = 0;
      this.rejectionCount = 0;
      this.windowStart = now;
    }

    if (this.latencies.length > 0) {
      const sorted = [...this.latencies].sort((a, b) => a - b);
      this.metrics.p50Latency = sorted[Math.floor(sorted.length * 0.5)];
      this.metrics.p95Latency = sorted[Math.floor(sorted.length * 0.95)];
      this.metrics.p99Latency = sorted[Math.floor(sorted.length * 0.99)];
    }
  }

  setActiveRequests(count) {
    this.metrics.activeRequests = count;
  }

  setQueueDepth(depth) {
    this.metrics.queueDepth = depth;
  }

  getMetrics() {
    return {
      bulkhead: this.bulkheadName,
      timestamp: Date.now(),
      ...this.metrics
    };
  }

  exportPrometheus() {
    return `
# HELP bulkhead_requests_total Total number of requests
# TYPE bulkhead_requests_total counter
bulkhead_requests_total{bulkhead="${this.bulkheadName}"} ${this.requestCount}

# HELP bulkhead_errors_total Total number of errors
# TYPE bulkhead_errors_total counter
bulkhead_errors_total{bulkhead="${this.bulkheadName}"} ${this.errorCount}

# HELP bulkhead_active_requests Current active requests
# TYPE bulkhead_active_requests gauge
bulkhead_active_requests{bulkhead="${this.bulkheadName}"} ${this.metrics.activeRequests}

# HELP bulkhead_queue_depth Current queue depth
# TYPE bulkhead_queue_depth gauge
bulkhead_queue_depth{bulkhead="${this.bulkheadName}"} ${this.metrics.queueDepth}

# HELP bulkhead_latency_milliseconds Request latency
# TYPE bulkhead_latency_milliseconds summary
bulkhead_latency_milliseconds{bulkhead="${this.bulkheadName}",quantile="0.5"} ${this.metrics.p50Latency}
bulkhead_latency_milliseconds{bulkhead="${this.bulkheadName}",quantile="0.95"} ${this.metrics.p95Latency}
bulkhead_latency_milliseconds{bulkhead="${this.bulkheadName}",quantile="0.99"} ${this.metrics.p99Latency}
    `.trim();
  }
}

/**
 * Health Check Monitor
 * Monitors bulkhead health status
 */
class HealthMonitor {
  constructor(bulkhead) {
    this.bulkhead = bulkhead;
    this.checks = [];
  }

  addCheck(name, checkFn) {
    this.checks.push({ name, checkFn });
  }

  async runHealthChecks() {
    const results = [];

    for (const check of this.checks) {
      try {
        const result = await check.checkFn(this.bulkhead);
        results.push({
          name: check.name,
          status: result ? 'healthy' : 'unhealthy',
          message: result === true ? 'OK' : result
        });
      } catch (error) {
        results.push({
          name: check.name,
          status: 'error',
          message: error.message
        });
      }
    }

    const overallHealth = results.every(r => r.status === 'healthy');

    return {
      status: overallHealth ? 'healthy' : 'unhealthy',
      checks: results,
      timestamp: Date.now()
    };
  }
}

/**
 * BulkheadCloud - Cloud-Native Bulkhead Implementation
 */
class BulkheadCloud extends EventEmitter {
  constructor(name, config = {}) {
    super();
    this.name = name;
    this.config = {
      maxConcurrent: config.maxConcurrent || 10,
      maxQueueSize: config.maxQueueSize || 100,
      queueTimeout: config.queueTimeout || 30000,
      executionTimeout: config.executionTimeout || 60000,
      enableCircuitBreaker: config.enableCircuitBreaker !== false,
      enableTracing: config.enableTracing !== false,
      enableMetrics: config.enableMetrics !== false,
      circuitBreakerConfig: config.circuitBreakerConfig || {},
      ...config
    };

    this.queue = [];
    this.executing = new Set();
    this.isShutdown = false;

    this.circuitBreaker = this.config.enableCircuitBreaker
      ? new CircuitBreaker(name, this.config.circuitBreakerConfig)
      : null;

    this.metrics = this.config.enableMetrics
      ? new CloudMetrics(name)
      : null;

    this.healthMonitor = new HealthMonitor(this);
    this.setupDefaultHealthChecks();

    if (this.circuitBreaker) {
      this.circuitBreaker.on('stateChange', (data) => {
        this.emit('circuitBreakerStateChange', data);
      });
    }
  }

  setupDefaultHealthChecks() {
    this.healthMonitor.addCheck('capacity', (bulkhead) => {
      const utilization = bulkhead.executing.size / bulkhead.config.maxConcurrent;
      return utilization < 0.9 || `High utilization: ${(utilization * 100).toFixed(1)}%`;
    });

    this.healthMonitor.addCheck('queue', (bulkhead) => {
      const queueUtil = bulkhead.queue.length / bulkhead.config.maxQueueSize;
      return queueUtil < 0.8 || `High queue depth: ${(queueUtil * 100).toFixed(1)}%`;
    });

    this.healthMonitor.addCheck('circuitBreaker', (bulkhead) => {
      if (!bulkhead.circuitBreaker) return true;
      return bulkhead.circuitBreaker.state === CircuitState.CLOSED || `Circuit breaker ${bulkhead.circuitBreaker.state}`;
    });
  }

  async execute(fn, context = {}) {
    if (this.isShutdown) {
      throw new Error(`BulkheadCloud ${this.name} is shutdown`);
    }

    if (this.circuitBreaker) {
      const allowed = await this.circuitBreaker.allowRequest();
      if (!allowed) {
        if (this.metrics) {
          this.metrics.recordRequest(0, false, true);
        }
        throw new Error(`Circuit breaker is ${this.circuitBreaker.state}`);
      }
    }

    const trace = this.config.enableTracing ? new TraceContext() : null;
    if (trace) {
      trace.addTag('bulkhead', this.name);
      trace.addTag('operation', context.operation || 'execute');
    }

    try {
      const result = await this.executeInternal(fn, context, trace);

      if (this.circuitBreaker) {
        await this.circuitBreaker.recordSuccess();
      }

      if (trace) {
        trace.addLog('execution_successful');
        trace.finish();
        this.emit('trace', trace.toJSON());
      }

      return result;
    } catch (error) {
      if (this.circuitBreaker) {
        await this.circuitBreaker.recordFailure(error);
      }

      if (trace) {
        trace.addTag('error', true);
        trace.addLog('execution_failed', { error: error.message });
        trace.finish();
        this.emit('trace', trace.toJSON());
      }

      throw error;
    }
  }

  async executeInternal(fn, context, trace) {
    const startTime = Date.now();

    if (this.executing.size < this.config.maxConcurrent) {
      const result = await this.executeImmediately(fn, context, trace);
      const latency = Date.now() - startTime;

      if (this.metrics) {
        this.metrics.recordRequest(latency, true);
      }

      return result;
    }

    if (this.queue.length >= this.config.maxQueueSize) {
      if (this.metrics) {
        this.metrics.recordRequest(0, false, true);
      }
      throw new Error(`BulkheadCloud ${this.name} queue is full`);
    }

    if (trace) {
      trace.addLog('queued', { queueSize: this.queue.length });
    }

    const result = await this.enqueue(fn, context, trace);
    const latency = Date.now() - startTime;

    if (this.metrics) {
      this.metrics.recordRequest(latency, true);
    }

    return result;
  }

  async executeImmediately(fn, context, trace) {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const requestContext = { id: requestId, fn, context, trace, startedAt: Date.now() };

    this.executing.add(requestContext);
    this.updateMetrics();

    try {
      const result = await this.executeWithTimeout(fn, context, this.config.executionTimeout);
      return result;
    } finally {
      this.executing.delete(requestContext);
      this.updateMetrics();
    }
  }

  async enqueue(fn, context, trace) {
    return new Promise((resolve, reject) => {
      const requestContext = {
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fn,
        context,
        trace,
        resolve,
        reject,
        enqueuedAt: Date.now()
      };

      const timeoutId = setTimeout(() => {
        const index = this.queue.indexOf(requestContext);
        if (index !== -1) {
          this.queue.splice(index, 1);
          this.updateMetrics();
          reject(new Error('Queue timeout'));
        }
      }, this.config.queueTimeout);

      requestContext.timeoutId = timeoutId;
      this.queue.push(requestContext);
      this.updateMetrics();

      this.processQueue();
    });
  }

  async processQueue() {
    while (this.queue.length > 0 && this.executing.size < this.config.maxConcurrent) {
      const requestContext = this.queue.shift();
      this.updateMetrics();

      if (requestContext.timeoutId) {
        clearTimeout(requestContext.timeoutId);
      }

      requestContext.startedAt = Date.now();
      this.executing.add(requestContext);
      this.updateMetrics();

      this.executeQueuedRequest(requestContext);
    }
  }

  async executeQueuedRequest(requestContext) {
    try {
      const result = await this.executeWithTimeout(
        requestContext.fn,
        requestContext.context,
        this.config.executionTimeout
      );
      requestContext.resolve(result);
    } catch (error) {
      requestContext.reject(error);
    } finally {
      this.executing.delete(requestContext);
      this.updateMetrics();
      this.processQueue();
    }
  }

  async executeWithTimeout(fn, context, timeout) {
    return Promise.race([
      fn(context),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      )
    ]);
  }

  updateMetrics() {
    if (this.metrics) {
      this.metrics.setActiveRequests(this.executing.size);
      this.metrics.setQueueDepth(this.queue.length);
    }
  }

  async getHealth() {
    return await this.healthMonitor.runHealthChecks();
  }

  getMetrics() {
    return this.metrics ? this.metrics.getMetrics() : null;
  }

  getCircuitBreakerState() {
    return this.circuitBreaker ? this.circuitBreaker.getState() : null;
  }

  getState() {
    return {
      name: this.name,
      executing: this.executing.size,
      queued: this.queue.length,
      maxConcurrent: this.config.maxConcurrent,
      maxQueueSize: this.config.maxQueueSize,
      utilizationPercent: (this.executing.size / this.config.maxConcurrent) * 100,
      circuitBreaker: this.getCircuitBreakerState(),
      isShutdown: this.isShutdown
    };
  }

  async shutdown(graceful = true) {
    this.isShutdown = true;

    if (graceful) {
      while (this.executing.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      for (const req of this.executing) {
        if (req.reject) req.reject(new Error('BulkheadCloud shutdown'));
      }
      this.executing.clear();
    }

    for (const req of this.queue) {
      if (req.timeoutId) clearTimeout(req.timeoutId);
      if (req.reject) req.reject(new Error('BulkheadCloud shutdown'));
    }
    this.queue = [];

    this.emit('shutdown', { name: this.name });
  }
}

/**
 * Demonstration Scenarios
 */

async function scenario1_CircuitBreakerIntegration() {
  console.log('\n=== Scenario 1: Circuit Breaker Integration ===\n');

  const bulkhead = new BulkheadCloud('api-service', {
    maxConcurrent: 5,
    enableCircuitBreaker: true,
    circuitBreakerConfig: {
      failureThreshold: 3,
      timeout: 2000,
      successThreshold: 2
    }
  });

  bulkhead.on('circuitBreakerStateChange', (data) => {
    console.log(`Circuit Breaker: ${data.from} -> ${data.to} (${data.reason})`);
  });

  let failCount = 0;
  const unreliableTask = async () => {
    failCount++;
    if (failCount <= 5) {
      throw new Error('Service unavailable');
    }
    return 'success';
  };

  for (let i = 0; i < 10; i++) {
    try {
      const result = await bulkhead.execute(unreliableTask);
      console.log(`Request ${i + 1}: ${result}`);
    } catch (error) {
      console.log(`Request ${i + 1}: Failed - ${error.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\nCircuit Breaker State:', bulkhead.getCircuitBreakerState());
}

async function scenario2_DistributedTracing() {
  console.log('\n=== Scenario 2: Distributed Tracing ===\n');

  const bulkhead = new BulkheadCloud('traced-service', {
    maxConcurrent: 3,
    enableTracing: true
  });

  bulkhead.on('trace', (trace) => {
    console.log('Trace:', JSON.stringify(trace, null, 2));
  });

  const task = async (context) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { userId: context.userId, data: 'processed' };
  };

  await bulkhead.execute(task, { operation: 'processUser', userId: 'user-123' });
  await bulkhead.execute(task, { operation: 'processUser', userId: 'user-456' });
}

async function scenario3_MetricsCollection() {
  console.log('\n=== Scenario 3: Metrics Collection ===\n');

  const bulkhead = new BulkheadCloud('metrics-service', {
    maxConcurrent: 10,
    enableMetrics: true
  });

  const task = async () => {
    const delay = Math.floor(Math.random() * 200) + 50;
    await new Promise(resolve => setTimeout(resolve, delay));
    if (Math.random() < 0.1) throw new Error('Random failure');
    return 'success';
  };

  const promises = Array(50).fill().map(() =>
    bulkhead.execute(task).catch(() => 'failed')
  );

  await Promise.all(promises);

  console.log('Metrics:', bulkhead.getMetrics());
  console.log('\nPrometheus Format:\n', bulkhead.metrics.exportPrometheus());
}

async function scenario4_HealthChecks() {
  console.log('\n=== Scenario 4: Health Checks ===\n');

  const bulkhead = new BulkheadCloud('health-monitored', {
    maxConcurrent: 5,
    maxQueueSize: 10
  });

  const task = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'done';
  };

  console.log('Initial Health:', await bulkhead.getHealth());

  const promises = Array(20).fill().map(() => bulkhead.execute(task));

  setTimeout(async () => {
    console.log('\nHealth During Load:', await bulkhead.getHealth());
  }, 100);

  await Promise.allSettled(promises);

  console.log('\nHealth After Load:', await bulkhead.getHealth());
}

async function scenario5_AutoScalingHints() {
  console.log('\n=== Scenario 5: Auto-Scaling Hints ===\n');

  const bulkhead = new BulkheadCloud('scalable-service', {
    maxConcurrent: 5,
    maxQueueSize: 20,
    enableMetrics: true
  });

  const task = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return 'processed';
  };

  for (let i = 0; i < 30; i++) {
    bulkhead.execute(task).catch(() => {});

    if (i % 5 === 0) {
      const state = bulkhead.getState();
      const metrics = bulkhead.getMetrics();

      console.log(`\nIteration ${i}:`);
      console.log(`  Utilization: ${state.utilizationPercent.toFixed(1)}%`);
      console.log(`  Queue Depth: ${state.queued}`);
      console.log(`  Active: ${state.executing}`);

      if (state.utilizationPercent > 80 || state.queued > 10) {
        console.log('  -> SCALE UP RECOMMENDATION');
      }
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

async function scenario6_MultiRegionBulkheads() {
  console.log('\n=== Scenario 6: Multi-Region Bulkheads ===\n');

  const regions = ['us-east-1', 'eu-west-1', 'ap-southeast-1'];
  const bulkheads = regions.map(region =>
    new BulkheadCloud(`service-${region}`, {
      maxConcurrent: 10,
      enableMetrics: true,
      enableCircuitBreaker: true
    })
  );

  const task = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (Math.random() < 0.05) throw new Error('Regional failure');
    return 'success';
  };

  const promises = bulkheads.flatMap(bulkhead =>
    Array(20).fill().map(() => bulkhead.execute(task).catch(() => 'failed'))
  );

  await Promise.all(promises);

  console.log('\nRegional Status:');
  bulkheads.forEach(bulkhead => {
    console.log(`\n${bulkhead.name}:`);
    console.log('  State:', bulkhead.getState());
    console.log('  Metrics:', bulkhead.getMetrics());
  });
}

async function scenario7_GracefulDegradation() {
  console.log('\n=== Scenario 7: Graceful Degradation ===\n');

  const primaryBulkhead = new BulkheadCloud('primary', {
    maxConcurrent: 5,
    maxQueueSize: 10,
    enableCircuitBreaker: true
  });

  const fallbackBulkhead = new BulkheadCloud('fallback', {
    maxConcurrent: 10,
    maxQueueSize: 20
  });

  const primaryTask = async () => {
    throw new Error('Primary service down');
  };

  const fallbackTask = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'fallback response';
  };

  for (let i = 0; i < 8; i++) {
    try {
      const result = await primaryBulkhead.execute(primaryTask);
      console.log(`Request ${i + 1}: ${result}`);
    } catch (error) {
      console.log(`Request ${i + 1}: Primary failed, using fallback`);
      const fallbackResult = await fallbackBulkhead.execute(fallbackTask);
      console.log(`Request ${i + 1}: ${fallbackResult}`);
    }
  }

  console.log('\nPrimary Circuit Breaker:', primaryBulkhead.getCircuitBreakerState());
}

async function scenario8_LoadShedding() {
  console.log('\n=== Scenario 8: Load Shedding ===\n');

  const bulkhead = new BulkheadCloud('load-shedding', {
    maxConcurrent: 5,
    maxQueueSize: 15,
    queueTimeout: 1000,
    enableMetrics: true
  });

  const task = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'processed';
  };

  console.log('Sending 50 requests...\n');

  const results = await Promise.allSettled(
    Array(50).fill().map((_, i) => bulkhead.execute(task))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`\nResults:`);
  console.log(`  Successful: ${successful}`);
  console.log(`  Failed/Shed: ${failed}`);
  console.log('\nFinal Metrics:', bulkhead.getMetrics());
}

async function demonstrateBulkheadCloud() {
  console.log('='.repeat(70));
  console.log('BULKHEAD CLOUD PATTERN DEMONSTRATION');
  console.log('='.repeat(70));

  await scenario1_CircuitBreakerIntegration();
  await scenario2_DistributedTracing();
  await scenario3_MetricsCollection();
  await scenario4_HealthChecks();
  await scenario5_AutoScalingHints();
  await scenario6_MultiRegionBulkheads();
  await scenario7_GracefulDegradation();
  await scenario8_LoadShedding();

  console.log('\n' + '='.repeat(70));
  console.log('All scenarios completed');
  console.log('='.repeat(70));
}

module.exports = {
  BulkheadCloud,
  CircuitBreaker,
  CircuitState,
  TraceContext,
  CloudMetrics,
  HealthMonitor,
  demonstrateBulkheadCloud
};

if (require.main === module) {
  demonstrateBulkheadCloud().catch(console.error);
}
