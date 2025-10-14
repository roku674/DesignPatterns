/**
 * Promise Pattern
 *
 * Purpose:
 * Represents a value that may be available now, in the future, or never.
 * Provides a clean API for handling asynchronous operations.
 *
 * Use Cases:
 * - Asynchronous computations
 * - Event handling
 * - Deferred execution
 * - Chaining async operations
 *
 * @author Design Patterns Implementation
 * @date 2025
 */

/**
 * Promise states
 */
const PromiseState = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
};

/**
 * Custom Promise implementation (for educational purposes)
 * Modern JavaScript has native Promise support
 */
class CustomPromise {
  constructor(executor) {
    this.state = PromiseState.PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === PromiseState.PENDING) {
        this.state = PromiseState.FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(callback => callback(value));
      }
    };

    const reject = (reason) => {
      if (this.state === PromiseState.PENDING) {
        this.state = PromiseState.REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(callback => callback(reason));
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    return new CustomPromise((resolve, reject) => {
      const handleFulfilled = (value) => {
        try {
          if (typeof onFulfilled === 'function') {
            const result = onFulfilled(value);
            if (result instanceof CustomPromise) {
              result.then(resolve, reject);
            } else {
              resolve(result);
            }
          } else {
            resolve(value);
          }
        } catch (error) {
          reject(error);
        }
      };

      const handleRejected = (reason) => {
        try {
          if (typeof onRejected === 'function') {
            const result = onRejected(reason);
            if (result instanceof CustomPromise) {
              result.then(resolve, reject);
            } else {
              resolve(result);
            }
          } else {
            reject(reason);
          }
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === PromiseState.FULFILLED) {
        setTimeout(() => handleFulfilled(this.value), 0);
      } else if (this.state === PromiseState.REJECTED) {
        setTimeout(() => handleRejected(this.reason), 0);
      } else {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return this.then(
      value => {
        onFinally();
        return value;
      },
      reason => {
        onFinally();
        throw reason;
      }
    );
  }

  static resolve(value) {
    return new CustomPromise(resolve => resolve(value));
  }

  static reject(reason) {
    return new CustomPromise((resolve, reject) => reject(reason));
  }

  static all(promises) {
    return new CustomPromise((resolve, reject) => {
      const results = [];
      let completed = 0;

      if (promises.length === 0) {
        resolve(results);
        return;
      }

      promises.forEach((promise, index) => {
        CustomPromise.resolve(promise).then(
          value => {
            results[index] = value;
            completed++;
            if (completed === promises.length) {
              resolve(results);
            }
          },
          reject
        );
      });
    });
  }

  static race(promises) {
    return new CustomPromise((resolve, reject) => {
      promises.forEach(promise => {
        CustomPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

/**
 * Deferred Promise pattern
 */
class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.state = PromiseState.PENDING;

    this.promise.then(
      () => { this.state = PromiseState.FULFILLED; },
      () => { this.state = PromiseState.REJECTED; }
    );
  }

  getState() {
    return this.state;
  }

  isPending() {
    return this.state === PromiseState.PENDING;
  }

  isFulfilled() {
    return this.state === PromiseState.FULFILLED;
  }

  isRejected() {
    return this.state === PromiseState.REJECTED;
  }
}

/**
 * Promise utilities
 */
class PromiseUtils {
  /**
   * Delay execution
   */
  static delay(ms, value = undefined) {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
  }

  /**
   * Timeout for promise
   */
  static timeout(promise, ms, timeoutError = 'Operation timed out') {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(timeoutError)), ms)
      )
    ]);
  }

  /**
   * Retry promise with exponential backoff
   */
  static async retry(fn, options = {}) {
    const maxAttempts = options.maxAttempts || 3;
    const delay = options.delay || 1000;
    const backoff = options.backoff || 2;
    const onRetry = options.onRetry || (() => {});

    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt < maxAttempts) {
          const waitTime = delay * Math.pow(backoff, attempt - 1);
          onRetry(attempt, error, waitTime);
          await this.delay(waitTime);
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute promises with concurrency limit
   */
  static async parallel(tasks, concurrency = 5) {
    const results = [];
    const executing = [];

    for (const [index, task] of tasks.entries()) {
      const promise = Promise.resolve().then(() => task()).then(
        result => {
          results[index] = { success: true, result };
        },
        error => {
          results[index] = { success: false, error };
        }
      );

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Map array with promises
   */
  static async map(array, mapper, concurrency = Infinity) {
    const tasks = array.map(item => () => mapper(item));
    return this.parallel(tasks, concurrency);
  }

  /**
   * Filter array with async predicate
   */
  static async filter(array, predicate) {
    const results = await Promise.all(
      array.map(async item => ({
        item,
        include: await predicate(item)
      }))
    );

    return results.filter(r => r.include).map(r => r.item);
  }

  /**
   * Reduce array with async reducer
   */
  static async reduce(array, reducer, initialValue) {
    let accumulator = initialValue;

    for (const item of array) {
      accumulator = await reducer(accumulator, item);
    }

    return accumulator;
  }

  /**
   * Promise.allSettled polyfill
   */
  static allSettled(promises) {
    return Promise.all(
      promises.map(promise =>
        Promise.resolve(promise).then(
          value => ({ status: 'fulfilled', value }),
          reason => ({ status: 'rejected', reason })
        )
      )
    );
  }

  /**
   * Promise.any polyfill
   */
  static any(promises) {
    return new Promise((resolve, reject) => {
      let rejectedCount = 0;
      const errors = [];

      if (promises.length === 0) {
        reject(new AggregateError([], 'All promises were rejected'));
        return;
      }

      promises.forEach((promise, index) => {
        Promise.resolve(promise).then(
          resolve,
          error => {
            errors[index] = error;
            rejectedCount++;

            if (rejectedCount === promises.length) {
              reject(new AggregateError(errors, 'All promises were rejected'));
            }
          }
        );
      });
    });
  }
}

/**
 * Cancellable Promise
 */
class CancellablePromise {
  constructor(executor) {
    this.cancelled = false;
    this.cancelCallbacks = [];

    this.promise = new Promise((resolve, reject) => {
      const wrappedResolve = (value) => {
        if (!this.cancelled) {
          resolve(value);
        }
      };

      const wrappedReject = (reason) => {
        if (!this.cancelled) {
          reject(reason);
        }
      };

      executor(wrappedResolve, wrappedReject, (callback) => {
        this.cancelCallbacks.push(callback);
      });
    });
  }

  cancel() {
    if (!this.cancelled) {
      this.cancelled = true;
      this.cancelCallbacks.forEach(callback => callback());
    }
  }

  then(onFulfilled, onRejected) {
    return this.promise.then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.promise.catch(onRejected);
  }

  finally(onFinally) {
    return this.promise.finally(onFinally);
  }

  isCancelled() {
    return this.cancelled;
  }
}

/**
 * Promise Pool - manages a pool of concurrent promises
 */
class PromisePool {
  constructor(concurrency = 5) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
    this.results = [];
  }

  async add(task) {
    if (this.running >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve));
    }

    this.running++;

    try {
      const result = await task();
      this.results.push({ success: true, result });
      return result;
    } catch (error) {
      this.results.push({ success: false, error });
      throw error;
    } finally {
      this.running--;

      if (this.queue.length > 0) {
        const resolve = this.queue.shift();
        resolve();
      }
    }
  }

  async waitForAll() {
    while (this.running > 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return this.results;
  }

  getResults() {
    return [...this.results];
  }

  getSuccessful() {
    return this.results.filter(r => r.success).map(r => r.result);
  }

  getFailed() {
    return this.results.filter(r => !r.success).map(r => r.error);
  }
}

/**
 * Async Queue - sequential promise execution
 */
class AsyncQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  async enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running || this.queue.length === 0) {
      return;
    }

    this.running = true;

    while (this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();

      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.running = false;
  }

  size() {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
  }
}

// ============================================================================
// COMPREHENSIVE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic Promise Usage
 */
async function example1_BasicPromise() {
  console.log('\n=== Example 1: Basic Promise Usage ===\n');

  // Create a promise
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.3;
      if (success) {
        resolve('Operation succeeded!');
      } else {
        reject(new Error('Operation failed!'));
      }
    }, 1000);
  });

  // Handle promise
  try {
    console.log('Waiting for promise...');
    const result = await promise;
    console.log('Result:', result);
  } catch (error) {
    console.log('Error:', error.message);
  }

  // Promise chaining
  console.log('\nPromise chaining:');
  const chainResult = await Promise.resolve(10)
    .then(value => {
      console.log('Step 1:', value);
      return value * 2;
    })
    .then(value => {
      console.log('Step 2:', value);
      return value + 5;
    })
    .then(value => {
      console.log('Step 3:', value);
      return value;
    });

  console.log('Final result:', chainResult);
}

/**
 * Example 2: Promise Utilities
 */
async function example2_PromiseUtilities() {
  console.log('\n=== Example 2: Promise Utilities ===\n');

  // Delay
  console.log('Starting delay...');
  await PromiseUtils.delay(1000);
  console.log('Delay completed');

  // Timeout
  console.log('\nTesting timeout...');
  try {
    const slowOperation = PromiseUtils.delay(3000, 'slow result');
    await PromiseUtils.timeout(slowOperation, 1000);
  } catch (error) {
    console.log('Timeout error:', error.message);
  }

  // Retry
  console.log('\nTesting retry...');
  let attempts = 0;
  const result = await PromiseUtils.retry(
    async () => {
      attempts++;
      console.log(`Attempt ${attempts}`);
      if (attempts < 3) {
        throw new Error('Not ready yet');
      }
      return 'Success!';
    },
    {
      maxAttempts: 5,
      delay: 500,
      onRetry: (attempt, error, waitTime) => {
        console.log(`Retrying in ${waitTime}ms after error: ${error.message}`);
      }
    }
  );
  console.log('Retry result:', result);
}

/**
 * Example 3: Promise Combinators
 */
async function example3_PromiseCombinators() {
  console.log('\n=== Example 3: Promise Combinators ===\n');

  // Promise.all
  console.log('Testing Promise.all...');
  const allResults = await Promise.all([
    PromiseUtils.delay(100, 'First'),
    PromiseUtils.delay(200, 'Second'),
    PromiseUtils.delay(150, 'Third')
  ]);
  console.log('All results:', allResults);

  // Promise.race
  console.log('\nTesting Promise.race...');
  const raceResult = await Promise.race([
    PromiseUtils.delay(300, 'Slow'),
    PromiseUtils.delay(100, 'Fast'),
    PromiseUtils.delay(200, 'Medium')
  ]);
  console.log('Race winner:', raceResult);

  // Promise.allSettled
  console.log('\nTesting Promise.allSettled...');
  const settledResults = await PromiseUtils.allSettled([
    Promise.resolve('Success 1'),
    Promise.reject(new Error('Failure')),
    Promise.resolve('Success 2')
  ]);
  console.log('Settled results:', settledResults);
}

/**
 * Example 4: Deferred Promise
 */
async function example4_DeferredPromise() {
  console.log('\n=== Example 4: Deferred Promise ===\n');

  const deferred = new Deferred();

  console.log('Initial state:', deferred.getState());
  console.log('Is pending:', deferred.isPending());

  // Resolve after delay
  setTimeout(() => {
    console.log('Resolving deferred...');
    deferred.resolve('Deferred result');
  }, 1000);

  const result = await deferred.promise;
  console.log('Result:', result);
  console.log('Final state:', deferred.getState());
  console.log('Is fulfilled:', deferred.isFulfilled());
}

/**
 * Example 5: Cancellable Promise
 */
async function example5_CancellablePromise() {
  console.log('\n=== Example 5: Cancellable Promise ===\n');

  // Create cancellable operation
  const cancellableOp = new CancellablePromise((resolve, reject, onCancel) => {
    const timeoutId = setTimeout(() => {
      resolve('Operation completed');
    }, 3000);

    onCancel(() => {
      clearTimeout(timeoutId);
      console.log('Operation cancelled');
    });
  });

  // Cancel after 1 second
  setTimeout(() => {
    console.log('Cancelling operation...');
    cancellableOp.cancel();
  }, 1000);

  try {
    const result = await cancellableOp;
    console.log('Result:', result);
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('Is cancelled:', cancellableOp.isCancelled());
}

/**
 * Example 6: Promise Pool
 */
async function example6_PromisePool() {
  console.log('\n=== Example 6: Promise Pool ===\n');

  const pool = new PromisePool(3);

  // Add tasks
  console.log('Adding tasks to pool...');
  const tasks = [];

  for (let i = 1; i <= 10; i++) {
    tasks.push(
      pool.add(async () => {
        console.log(`Task ${i} starting...`);
        await PromiseUtils.delay(Math.random() * 1000);
        console.log(`Task ${i} completed`);
        return `Result ${i}`;
      })
    );
  }

  await Promise.all(tasks);

  console.log('\nPool results:');
  console.log('Total:', pool.getResults().length);
  console.log('Successful:', pool.getSuccessful().length);
  console.log('Failed:', pool.getFailed().length);
}

/**
 * Example 7: Async Queue
 */
async function example7_AsyncQueue() {
  console.log('\n=== Example 7: Async Queue ===\n');

  const queue = new AsyncQueue();

  // Enqueue tasks
  console.log('Enqueueing tasks...');

  const task1 = queue.enqueue(async () => {
    console.log('Task 1 executing...');
    await PromiseUtils.delay(500);
    console.log('Task 1 completed');
    return 'Result 1';
  });

  const task2 = queue.enqueue(async () => {
    console.log('Task 2 executing...');
    await PromiseUtils.delay(300);
    console.log('Task 2 completed');
    return 'Result 2';
  });

  const task3 = queue.enqueue(async () => {
    console.log('Task 3 executing...');
    await PromiseUtils.delay(200);
    console.log('Task 3 completed');
    return 'Result 3';
  });

  const results = await Promise.all([task1, task2, task3]);
  console.log('\nResults:', results);
}

/**
 * Example 8: Promise Array Operations
 */
async function example8_PromiseArrayOperations() {
  console.log('\n=== Example 8: Promise Array Operations ===\n');

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Map
  console.log('Testing async map...');
  const mapResults = await PromiseUtils.map(
    numbers,
    async (n) => {
      await PromiseUtils.delay(100);
      return n * 2;
    },
    3 // concurrency
  );
  console.log('Map results:', mapResults.map(r => r.result));

  // Filter
  console.log('\nTesting async filter...');
  const filterResults = await PromiseUtils.filter(
    numbers,
    async (n) => {
      await PromiseUtils.delay(50);
      return n % 2 === 0;
    }
  );
  console.log('Filter results:', filterResults);

  // Reduce
  console.log('\nTesting async reduce...');
  const reduceResult = await PromiseUtils.reduce(
    numbers,
    async (acc, n) => {
      await PromiseUtils.delay(50);
      return acc + n;
    },
    0
  );
  console.log('Reduce result:', reduceResult);
}

/**
 * Example 9: Error Handling Patterns
 */
async function example9_ErrorHandling() {
  console.log('\n=== Example 9: Error Handling Patterns ===\n');

  // Try-catch
  console.log('Testing try-catch...');
  try {
    await Promise.reject(new Error('Test error'));
  } catch (error) {
    console.log('Caught error:', error.message);
  }

  // .catch() method
  console.log('\nTesting .catch() method...');
  await Promise.reject(new Error('Another error'))
    .catch(error => {
      console.log('Caught with .catch():', error.message);
    });

  // Error recovery
  console.log('\nTesting error recovery...');
  const recovered = await Promise.reject(new Error('Failed'))
    .catch(error => {
      console.log('Error occurred:', error.message);
      return 'Recovered value';
    });
  console.log('Recovered:', recovered);

  // Finally
  console.log('\nTesting finally...');
  await Promise.resolve('Success')
    .then(result => console.log('Result:', result))
    .finally(() => console.log('Cleanup in finally'));
}

/**
 * Main execution
 */
async function demonstratePromise() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Promise Pattern - Comprehensive Examples            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await example1_BasicPromise();
  await example2_PromiseUtilities();
  await example3_PromiseCombinators();
  await example4_DeferredPromise();
  await example5_CancellablePromise();
  await example6_PromisePool();
  await example7_AsyncQueue();
  await example8_PromiseArrayOperations();
  await example9_ErrorHandling();

  console.log('\n✓ All Promise pattern examples completed successfully!');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CustomPromise,
    Deferred,
    PromiseUtils,
    CancellablePromise,
    PromisePool,
    AsyncQueue,
    PromiseState,
    demonstratePromise
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  demonstratePromise().catch(console.error);
}
