/**
 * Promise Pattern (Advanced Patterns)
 *
 * Purpose:
 * Advanced promise patterns including pipeline, circuit breaker, bulkhead,
 * and other sophisticated async control flow patterns.
 *
 * Use Cases:
 * - Complex async workflows
 * - Fault tolerance
 * - Resource management
 * - Async coordination
 *
 * @author Design Patterns Implementation
 * @date 2025
 */

/**
 * Promise Pipeline - chain async operations
 */
class PromisePipeline {
  constructor() {
    this.stages = [];
  }

  /**
   * Add stage to pipeline
   */
  use(stage, name = null) {
    this.stages.push({ stage, name: name || `Stage ${this.stages.length + 1}` });
    return this;
  }

  /**
   * Execute pipeline
   */
  async execute(initialValue) {
    let value = initialValue;
    const results = [];

    for (const { stage, name } of this.stages) {
      const startTime = Date.now();

      try {
        value = await stage(value);
        results.push({
          stage: name,
          success: true,
          value,
          duration: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          stage: name,
          success: false,
          error: error.message,
          duration: Date.now() - startTime
        });
        throw error;
      }
    }

    return { value, results };
  }

  /**
   * Get pipeline stages
   */
  getStages() {
    return this.stages.map(s => s.name);
  }

  /**
   * Clear pipeline
   */
  clear() {
    this.stages = [];
  }
}

/**
 * Circuit Breaker - prevent cascading failures
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000;
    this.resetTimeout = options.resetTimeout || 30000;

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  /**
   * Execute function with circuit breaker
   */
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), this.timeout)
        )
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle success
   */
  onSuccess() {
    this.failures = 0;
    this.successes++;

    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }

  /**
   * Handle failure
   */
  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.resetTimeout;
    }
  }

  /**
   * Get circuit breaker state
   */
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }
}

/**
 * Bulkhead - isolate resources
 */
class Bulkhead {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 10;
    this.maxQueue = options.maxQueue || 100;

    this.running = 0;
    this.queue = [];
  }

  /**
   * Execute with bulkhead protection
   */
  async execute(fn) {
    if (this.running >= this.maxConcurrent) {
      if (this.queue.length >= this.maxQueue) {
        throw new Error('Bulkhead queue is full');
      }

      await new Promise(resolve => this.queue.push(resolve));
    }

    this.running++;

    try {
      return await fn();
    } finally {
      this.running--;

      if (this.queue.length > 0) {
        const resolve = this.queue.shift();
        resolve();
      }
    }
  }

  /**
   * Get bulkhead status
   */
  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      available: this.maxConcurrent - this.running
    };
  }
}

/**
 * Async Semaphore - limit concurrent access
 */
class AsyncSemaphore {
  constructor(permits) {
    this.permits = permits;
    this.available = permits;
    this.waiters = [];
  }

  /**
   * Acquire permit
   */
  async acquire() {
    if (this.available > 0) {
      this.available--;
      return () => this.release();
    }

    return new Promise(resolve => {
      this.waiters.push(() => {
        this.available--;
        resolve(() => this.release());
      });
    });
  }

  /**
   * Release permit
   */
  release() {
    if (this.waiters.length > 0) {
      const waiter = this.waiters.shift();
      waiter();
    } else {
      this.available++;
    }
  }

  /**
   * Execute with semaphore
   */
  async execute(fn) {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  /**
   * Get available permits
   */
  getAvailable() {
    return this.available;
  }

  /**
   * Get waiting count
   */
  getWaitingCount() {
    return this.waiters.length;
  }
}

/**
 * Async Barrier - synchronization point
 */
class AsyncBarrier {
  constructor(parties) {
    this.parties = parties;
    this.count = 0;
    this.waiters = [];
  }

  /**
   * Wait at barrier
   */
  async wait() {
    this.count++;

    if (this.count >= this.parties) {
      // Release all waiters
      this.waiters.forEach(resolve => resolve());
      this.waiters = [];
      this.count = 0;
      return true;
    }

    return new Promise(resolve => {
      this.waiters.push(resolve);
    });
  }

  /**
   * Get waiting count
   */
  getWaitingCount() {
    return this.count;
  }

  /**
   * Reset barrier
   */
  reset() {
    this.count = 0;
    this.waiters.forEach(resolve => resolve());
    this.waiters = [];
  }
}

/**
 * Async Latch - countdown latch
 */
class AsyncLatch {
  constructor(count) {
    this.count = count;
    this.waiters = [];
  }

  /**
   * Count down
   */
  countDown() {
    if (this.count > 0) {
      this.count--;

      if (this.count === 0) {
        this.waiters.forEach(resolve => resolve());
        this.waiters = [];
      }
    }
  }

  /**
   * Wait for latch
   */
  async wait() {
    if (this.count === 0) {
      return true;
    }

    return new Promise(resolve => {
      this.waiters.push(resolve);
    });
  }

  /**
   * Get count
   */
  getCount() {
    return this.count;
  }
}

/**
 * Promise Debouncer - debounce async operations
 */
class PromiseDebouncer {
  constructor(delay) {
    this.delay = delay;
    this.timerId = null;
    this.pending = null;
  }

  /**
   * Debounce function
   */
  debounce(fn) {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    if (this.pending) {
      this.pending.reject(new Error('Debounced'));
    }

    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };

      this.timerId = setTimeout(async () => {
        try {
          const result = await fn();
          this.pending.resolve(result);
        } catch (error) {
          this.pending.reject(error);
        } finally {
          this.pending = null;
          this.timerId = null;
        }
      }, this.delay);
    });
  }

  /**
   * Cancel pending operation
   */
  cancel() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.pending) {
      this.pending.reject(new Error('Cancelled'));
      this.pending = null;
    }
  }
}

/**
 * Promise Throttler - throttle async operations
 */
class PromiseThrottler {
  constructor(interval) {
    this.interval = interval;
    this.lastExecutionTime = 0;
    this.scheduled = null;
  }

  /**
   * Throttle function
   */
  async throttle(fn) {
    const now = Date.now();
    const timeSinceLastExecution = now - this.lastExecutionTime;

    if (timeSinceLastExecution >= this.interval) {
      this.lastExecutionTime = now;
      return await fn();
    }

    if (this.scheduled) {
      return this.scheduled;
    }

    this.scheduled = new Promise((resolve, reject) => {
      setTimeout(async () => {
        this.lastExecutionTime = Date.now();
        this.scheduled = null;

        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, this.interval - timeSinceLastExecution);
    });

    return this.scheduled;
  }
}

/**
 * Async Cache - cache async results
 */
class AsyncCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 60000;
    this.maxSize = options.maxSize || 1000;
  }

  /**
   * Get or compute value
   */
  async getOrCompute(key, computeFn) {
    const cached = this.cache.get(key);

    if (cached) {
      if (Date.now() - cached.timestamp < this.ttl) {
        return cached.value;
      }
      this.cache.delete(key);
    }

    const value = await computeFn();

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });

    return value;
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key) {
    this.cache.delete(key);
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }
}

// ============================================================================
// COMPREHENSIVE EXAMPLES
// ============================================================================

/**
 * Example 1: Promise Pipeline
 */
async function example1_PromisePipeline() {
  console.log('\n=== Example 1: Promise Pipeline ===\n');

  const pipeline = new PromisePipeline();

  pipeline
    .use(async (value) => {
      console.log('Stage 1: Validate input');
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!value) throw new Error('Invalid input');
      return value;
    }, 'Validation')
    .use(async (value) => {
      console.log('Stage 2: Transform data');
      await new Promise(resolve => setTimeout(resolve, 150));
      return value.toUpperCase();
    }, 'Transform')
    .use(async (value) => {
      console.log('Stage 3: Enrich data');
      await new Promise(resolve => setTimeout(resolve, 100));
      return { data: value, timestamp: Date.now() };
    }, 'Enrich')
    .use(async (value) => {
      console.log('Stage 4: Format output');
      await new Promise(resolve => setTimeout(resolve, 50));
      return JSON.stringify(value, null, 2);
    }, 'Format');

  const result = await pipeline.execute('hello world');
  console.log('\nPipeline result:');
  console.log(result.value);
  console.log('\nStage durations:');
  result.results.forEach(r => {
    console.log(`  ${r.stage}: ${r.duration}ms`);
  });
}

/**
 * Example 2: Circuit Breaker
 */
async function example2_CircuitBreaker() {
  console.log('\n=== Example 2: Circuit Breaker ===\n');

  const breaker = new CircuitBreaker({
    failureThreshold: 3,
    timeout: 1000,
    resetTimeout: 2000
  });

  let callCount = 0;

  async function unreliableService() {
    callCount++;
    console.log(`Service call ${callCount}`);

    // Fail first 5 calls
    if (callCount <= 5) {
      throw new Error('Service failure');
    }

    return 'Success';
  }

  // Make calls
  for (let i = 1; i <= 8; i++) {
    try {
      console.log(`\nAttempt ${i}:`);
      const result = await breaker.execute(unreliableService);
      console.log('Result:', result);
    } catch (error) {
      console.log('Error:', error.message);
    }

    console.log('Circuit state:', breaker.getState().state);

    if (i === 4) {
      console.log('\nWaiting for circuit to reset...');
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * Example 3: Bulkhead
 */
async function example3_Bulkhead() {
  console.log('\n=== Example 3: Bulkhead ===\n');

  const bulkhead = new Bulkhead({
    maxConcurrent: 3,
    maxQueue: 5
  });

  async function task(id, duration) {
    console.log(`Task ${id} started`);
    await new Promise(resolve => setTimeout(resolve, duration));
    console.log(`Task ${id} completed`);
    return `Result ${id}`;
  }

  // Submit tasks
  const tasks = [];
  for (let i = 1; i <= 10; i++) {
    tasks.push(
      bulkhead.execute(() => task(i, Math.random() * 1000)).catch(error => {
        console.log(`Task ${i} failed:`, error.message);
        return null;
      })
    );

    console.log('Bulkhead status:', bulkhead.getStatus());
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  await Promise.all(tasks);
  console.log('\nAll tasks completed');
}

/**
 * Example 4: Async Semaphore
 */
async function example4_AsyncSemaphore() {
  console.log('\n=== Example 4: Async Semaphore ===\n');

  const semaphore = new AsyncSemaphore(3);

  async function accessResource(id) {
    console.log(`Worker ${id} requesting access...`);
    console.log(`Available permits: ${semaphore.getAvailable()}`);

    const result = await semaphore.execute(async () => {
      console.log(`Worker ${id} has access`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Worker ${id} releasing access`);
      return `Result ${id}`;
    });

    return result;
  }

  const workers = [];
  for (let i = 1; i <= 8; i++) {
    workers.push(accessResource(i));
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  await Promise.all(workers);
  console.log('\nAll workers completed');
}

/**
 * Example 5: Async Barrier
 */
async function example5_AsyncBarrier() {
  console.log('\n=== Example 5: Async Barrier ===\n');

  const barrier = new AsyncBarrier(5);

  async function worker(id) {
    console.log(`Worker ${id} starting...`);

    // Do some work
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

    console.log(`Worker ${id} waiting at barrier (${barrier.getWaitingCount() + 1}/5)`);

    // Wait at barrier
    await barrier.wait();

    console.log(`Worker ${id} released from barrier`);
  }

  const workers = [];
  for (let i = 1; i <= 5; i++) {
    workers.push(worker(i));
  }

  await Promise.all(workers);
  console.log('\nAll workers synchronized');
}

/**
 * Example 6: Async Latch
 */
async function example6_AsyncLatch() {
  console.log('\n=== Example 6: Async Latch ===\n');

  const latch = new AsyncLatch(3);

  // Tasks that count down
  async function task(id, duration) {
    console.log(`Task ${id} starting...`);
    await new Promise(resolve => setTimeout(resolve, duration));
    console.log(`Task ${id} completed (count: ${latch.getCount() - 1})`);
    latch.countDown();
  }

  // Start tasks
  task(1, 1000);
  task(2, 1500);
  task(3, 800);

  console.log('Waiting for all tasks...');
  await latch.wait();
  console.log('All tasks completed!');
}

/**
 * Example 7: Debouncer and Throttler
 */
async function example7_DebouncerThrottler() {
  console.log('\n=== Example 7: Debouncer and Throttler ===\n');

  // Debouncer
  console.log('Testing debouncer...');
  const debouncer = new PromiseDebouncer(500);

  let callCount = 0;

  for (let i = 0; i < 5; i++) {
    debouncer.debounce(async () => {
      callCount++;
      console.log(`Debounced call executed (${callCount})`);
      return callCount;
    }).catch(() => {});

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  await new Promise(resolve => setTimeout(resolve, 600));

  // Throttler
  console.log('\nTesting throttler...');
  const throttler = new PromiseThrottler(1000);

  for (let i = 1; i <= 5; i++) {
    console.log(`Call ${i}`);
    await throttler.throttle(async () => {
      console.log(`  Throttled execution`);
      return i;
    });

    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

/**
 * Example 8: Async Cache
 */
async function example8_AsyncCache() {
  console.log('\n=== Example 8: Async Cache ===\n');

  const cache = new AsyncCache({ ttl: 2000 });

  let computations = 0;

  async function expensiveComputation(id) {
    computations++;
    console.log(`Computing result for ${id} (computation #${computations})`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Result for ${id}`;
  }

  // First calls - cache miss
  console.log('First calls:');
  await cache.getOrCompute('item-1', () => expensiveComputation('item-1'));
  await cache.getOrCompute('item-2', () => expensiveComputation('item-2'));

  // Second calls - cache hit
  console.log('\nSecond calls (cache hit):');
  await cache.getOrCompute('item-1', () => expensiveComputation('item-1'));
  await cache.getOrCompute('item-2', () => expensiveComputation('item-2'));

  console.log(`\nCache size: ${cache.size()}`);
  console.log(`Total computations: ${computations}`);

  // Wait for TTL
  console.log('\nWaiting for TTL expiration...');
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Third calls - cache expired
  console.log('Third calls (cache expired):');
  await cache.getOrCompute('item-1', () => expensiveComputation('item-1'));

  console.log(`\nTotal computations: ${computations}`);
}

/**
 * Example 9: Complex Workflow
 */
async function example9_ComplexWorkflow() {
  console.log('\n=== Example 9: Complex Workflow ===\n');

  const pipeline = new PromisePipeline();
  const breaker = new CircuitBreaker({ failureThreshold: 3 });
  const semaphore = new AsyncSemaphore(2);
  const cache = new AsyncCache();

  // Build complex pipeline
  pipeline
    .use(async (data) => {
      console.log('Step 1: Validate');
      return data;
    })
    .use(async (data) => {
      console.log('Step 2: Fetch from cache or compute');
      return await cache.getOrCompute(data.id, async () => {
        console.log('  Cache miss - computing...');
        await new Promise(resolve => setTimeout(resolve, 300));
        return { ...data, enriched: true };
      });
    })
    .use(async (data) => {
      console.log('Step 3: Call external service with circuit breaker');
      return await breaker.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return { ...data, external: 'data' };
      });
    })
    .use(async (data) => {
      console.log('Step 4: Limited concurrent processing');
      return await semaphore.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return { ...data, processed: true };
      });
    });

  // Execute workflow
  const result = await pipeline.execute({ id: 'item-1', value: 'test' });

  console.log('\nWorkflow result:');
  console.log(JSON.stringify(result.value, null, 2));
}

/**
 * Main execution
 */
async function demonstratePromisePattern() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    Promise Pattern (Advanced) - Comprehensive Examples    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await example1_PromisePipeline();
  await example2_CircuitBreaker();
  await example3_Bulkhead();
  await example4_AsyncSemaphore();
  await example5_AsyncBarrier();
  await example6_AsyncLatch();
  await example7_DebouncerThrottler();
  await example8_AsyncCache();
  await example9_ComplexWorkflow();

  console.log('\n✓ All Promise Pattern examples completed successfully!');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PromisePipeline,
    CircuitBreaker,
    Bulkhead,
    AsyncSemaphore,
    AsyncBarrier,
    AsyncLatch,
    PromiseDebouncer,
    PromiseThrottler,
    AsyncCache,
    demonstratePromisePattern
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  demonstratePromisePattern().catch(console.error);
}
