/**
 * Retry Pattern
 *
 * Enables an application to handle transient failures by transparently retrying
 * a failed operation with configurable strategies like exponential backoff, jitter, etc.
 *
 * Strategies:
 * - Fixed Delay: Retry after a fixed time interval
 * - Exponential Backoff: Increase delay exponentially between retries
 * - Linear Backoff: Increase delay linearly between retries
 * - Jitter: Add randomness to prevent thundering herd
 *
 * Use Cases:
 * - Network request failures
 * - Database connection timeouts
 * - Transient service unavailability
 * - Rate-limited API calls
 */

/**
 * Retry strategies enum
 */
const RetryStrategy = {
  FIXED: 'FIXED',
  EXPONENTIAL: 'EXPONENTIAL',
  LINEAR: 'LINEAR',
  EXPONENTIAL_WITH_JITTER: 'EXPONENTIAL_WITH_JITTER'
};

/**
 * Base Retry Policy implementation
 */
class RetryPolicy {
  /**
   * @param {Object} options - Configuration options
   * @param {number} options.maxRetries - Maximum number of retry attempts
   * @param {number} options.initialDelay - Initial delay in milliseconds
   * @param {number} options.maxDelay - Maximum delay in milliseconds
   * @param {Function} options.shouldRetry - Function to determine if retry should occur
   * @param {Function} options.onRetry - Callback executed before each retry
   */
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.initialDelay = options.initialDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.shouldRetry = options.shouldRetry || this.defaultShouldRetry;
    this.onRetry = options.onRetry || (() => {});
    this.stats = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      retriesExecuted: 0
    };
  }

  /**
   * Execute function with retry logic
   * @param {Function} fn - Async function to execute
   * @param {...any} args - Arguments to pass to the function
   * @returns {Promise<any>} Result of the function
   */
  async execute(fn, ...args) {
    let lastError;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      this.stats.totalAttempts++;

      try {
        const result = await fn(...args);
        this.stats.successfulAttempts++;
        return result;
      } catch (error) {
        lastError = error;
        this.stats.failedAttempts++;

        if (attempt === this.maxRetries || !this.shouldRetry(error, attempt)) {
          console.error(`[Retry] Max retries (${this.maxRetries}) reached or non-retryable error`);
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        console.log(`[Retry] Attempt ${attempt + 1}/${this.maxRetries + 1} failed: ${error.message}`);
        console.log(`[Retry] Waiting ${delay}ms before retry...`);

        this.stats.retriesExecuted++;
        await this.onRetry(error, attempt, delay);
        await this.sleep(delay);
        attempt++;
      }
    }

    throw lastError;
  }

  /**
   * Calculate delay for next retry (override in subclasses)
   */
  calculateDelay(attempt) {
    return this.initialDelay;
  }

  /**
   * Default retry condition
   */
  defaultShouldRetry(error, attempt) {
    // Retry on network errors, timeouts, and 5xx server errors
    const retryableErrors = ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED'];
    return retryableErrors.some(code => error.code === code || error.message.includes(code));
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get retry statistics
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalAttempts > 0
        ? ((this.stats.successfulAttempts / this.stats.totalAttempts) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

/**
 * Fixed delay retry strategy
 */
class FixedRetryPolicy extends RetryPolicy {
  calculateDelay(attempt) {
    return this.initialDelay;
  }
}

/**
 * Exponential backoff retry strategy
 */
class ExponentialBackoffRetryPolicy extends RetryPolicy {
  calculateDelay(attempt) {
    const delay = this.initialDelay * Math.pow(2, attempt);
    return Math.min(delay, this.maxDelay);
  }
}

/**
 * Linear backoff retry strategy
 */
class LinearBackoffRetryPolicy extends RetryPolicy {
  calculateDelay(attempt) {
    const delay = this.initialDelay * (attempt + 1);
    return Math.min(delay, this.maxDelay);
  }
}

/**
 * Exponential backoff with jitter to prevent thundering herd
 */
class ExponentialBackoffWithJitterRetryPolicy extends RetryPolicy {
  calculateDelay(attempt) {
    const exponentialDelay = this.initialDelay * Math.pow(2, attempt);
    const cappedDelay = Math.min(exponentialDelay, this.maxDelay);
    // Add random jitter (0-100% of calculated delay)
    const jitter = Math.random() * cappedDelay;
    return Math.floor(cappedDelay * 0.5 + jitter * 0.5);
  }
}

/**
 * Retry manager with circuit breaker integration
 */
class RetryManager {
  constructor() {
    this.policies = new Map();
  }

  /**
   * Register a retry policy
   */
  registerPolicy(name, policy) {
    this.policies.set(name, policy);
  }

  /**
   * Execute with named policy
   */
  async executeWithPolicy(policyName, fn, ...args) {
    const policy = this.policies.get(policyName);
    if (!policy) {
      throw new Error(`Retry policy '${policyName}' not found`);
    }
    return policy.execute(fn, ...args);
  }

  /**
   * Get all policies statistics
   */
  getAllStats() {
    const stats = {};
    for (const [name, policy] of this.policies.entries()) {
      stats[name] = policy.getStats();
    }
    return stats;
  }
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: HTTP request with exponential backoff
 */
async function example1_HTTPRequestWithBackoff() {
  console.log('\n=== Example 1: HTTP Request with Exponential Backoff ===\n');

  let requestCount = 0;
  const unreliableHTTPRequest = async (url) => {
    requestCount++;
    console.log(`Making HTTP request ${requestCount} to ${url}`);

    // Simulate failures for first 3 attempts
    if (requestCount <= 3) {
      const error = new Error('ETIMEDOUT: Request timeout');
      error.code = 'ETIMEDOUT';
      throw error;
    }

    return { status: 200, data: 'Success!', attempt: requestCount };
  };

  const retryPolicy = new ExponentialBackoffRetryPolicy({
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 10000,
    onRetry: (error, attempt, delay) => {
      console.log(`[Callback] Retry attempt ${attempt + 1}, delay: ${delay}ms`);
    }
  });

  try {
    const result = await retryPolicy.execute(
      unreliableHTTPRequest,
      'https://api.example.com/data'
    );
    console.log('\nSuccess:', result);
  } catch (error) {
    console.error('\nFinal failure:', error.message);
  }

  console.log('\nStats:', retryPolicy.getStats());
}

/**
 * Example 2: Database connection with linear backoff
 */
async function example2_DatabaseConnectionRetry() {
  console.log('\n=== Example 2: Database Connection with Linear Backoff ===\n');

  let connectionAttempts = 0;
  const connectToDatabase = async (connectionString) => {
    connectionAttempts++;
    console.log(`Database connection attempt ${connectionAttempts}`);

    // Simulate connection failures
    if (connectionAttempts < 3) {
      const error = new Error('ECONNREFUSED: Connection refused');
      error.code = 'ECONNREFUSED';
      throw error;
    }

    return {
      connected: true,
      connectionString,
      timestamp: Date.now()
    };
  };

  const retryPolicy = new LinearBackoffRetryPolicy({
    maxRetries: 4,
    initialDelay: 1000,
    maxDelay: 15000
  });

  try {
    const connection = await retryPolicy.execute(
      connectToDatabase,
      'mongodb://localhost:27017/mydb'
    );
    console.log('\nConnected:', connection);
  } catch (error) {
    console.error('\nConnection failed:', error.message);
  }

  console.log('\nStats:', retryPolicy.getStats());
}

/**
 * Example 3: API rate limiting with custom retry logic
 */
async function example3_RateLimitedAPIRetry() {
  console.log('\n=== Example 3: Rate Limited API with Custom Retry ===\n');

  let apiCalls = 0;
  const rateLimitedAPI = async (endpoint) => {
    apiCalls++;
    console.log(`API call ${apiCalls} to ${endpoint}`);

    // Simulate rate limiting
    if (apiCalls % 3 === 0) {
      const error = new Error('Rate limit exceeded');
      error.statusCode = 429;
      error.retryAfter = 2000;
      throw error;
    }

    return { data: `Response for call ${apiCalls}`, endpoint };
  };

  const retryPolicy = new ExponentialBackoffWithJitterRetryPolicy({
    maxRetries: 6,
    initialDelay: 1000,
    maxDelay: 8000,
    shouldRetry: (error, attempt) => {
      // Retry on rate limits and network errors
      return error.statusCode === 429 || error.code === 'ETIMEDOUT';
    },
    onRetry: (error, attempt, delay) => {
      if (error.statusCode === 429) {
        console.log(`[Rate Limited] Backing off for ${delay}ms`);
      }
    }
  });

  const results = [];
  for (let i = 0; i < 10; i++) {
    try {
      const result = await retryPolicy.execute(rateLimitedAPI, '/api/v1/users');
      results.push(result);
      console.log(`Call ${i + 1} succeeded:`, result);
    } catch (error) {
      console.error(`Call ${i + 1} failed:`, error.message);
    }
  }

  console.log('\nTotal successful calls:', results.length);
  console.log('Stats:', retryPolicy.getStats());
}

/**
 * Example 4: Microservice communication with fixed retry
 */
async function example4_MicroserviceRetry() {
  console.log('\n=== Example 4: Microservice Communication with Fixed Retry ===\n');

  const services = {
    auth: { failures: 0, maxFailures: 2 },
    payment: { failures: 0, maxFailures: 3 },
    notification: { failures: 0, maxFailures: 1 }
  };

  const callMicroservice = async (serviceName, payload) => {
    const service = services[serviceName];
    service.failures++;

    console.log(`Calling ${serviceName} service (attempt ${service.failures})`);

    if (service.failures <= service.maxFailures) {
      const error = new Error(`${serviceName} service temporarily unavailable`);
      error.code = 'ECONNRESET';
      throw error;
    }

    return {
      service: serviceName,
      status: 'success',
      payload,
      processedAt: Date.now()
    };
  };

  const retryPolicy = new FixedRetryPolicy({
    maxRetries: 4,
    initialDelay: 1500
  });

  for (const serviceName of Object.keys(services)) {
    try {
      const result = await retryPolicy.execute(
        callMicroservice,
        serviceName,
        { data: `test-${serviceName}` }
      );
      console.log(`${serviceName} result:`, result);
    } catch (error) {
      console.error(`${serviceName} failed:`, error.message);
    }
    console.log('');
  }

  console.log('Final Stats:', retryPolicy.getStats());
}

/**
 * Example 5: Retry manager with multiple policies
 */
async function example5_RetryManagerWithMultiplePolicies() {
  console.log('\n=== Example 5: Retry Manager with Multiple Policies ===\n');

  const manager = new RetryManager();

  // Register different policies for different scenarios
  manager.registerPolicy('fast', new FixedRetryPolicy({
    maxRetries: 2,
    initialDelay: 500
  }));

  manager.registerPolicy('standard', new ExponentialBackoffRetryPolicy({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 8000
  }));

  manager.registerPolicy('aggressive', new ExponentialBackoffWithJitterRetryPolicy({
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 15000
  }));

  // Simulated operations
  let fastOpsCount = 0;
  const fastOperation = async () => {
    fastOpsCount++;
    if (fastOpsCount <= 1) throw new Error('ETIMEDOUT');
    return 'Fast operation completed';
  };

  let standardOpsCount = 0;
  const standardOperation = async () => {
    standardOpsCount++;
    if (standardOpsCount <= 2) throw new Error('ECONNRESET');
    return 'Standard operation completed';
  };

  let aggressiveOpsCount = 0;
  const aggressiveOperation = async () => {
    aggressiveOpsCount++;
    if (aggressiveOpsCount <= 4) throw new Error('ENOTFOUND');
    return 'Aggressive operation completed';
  };

  // Execute with different policies
  try {
    console.log('Executing with FAST policy:');
    const result1 = await manager.executeWithPolicy('fast', fastOperation);
    console.log(result1, '\n');
  } catch (error) {
    console.error('Fast policy failed:', error.message, '\n');
  }

  try {
    console.log('Executing with STANDARD policy:');
    const result2 = await manager.executeWithPolicy('standard', standardOperation);
    console.log(result2, '\n');
  } catch (error) {
    console.error('Standard policy failed:', error.message, '\n');
  }

  try {
    console.log('Executing with AGGRESSIVE policy:');
    const result3 = await manager.executeWithPolicy('aggressive', aggressiveOperation);
    console.log(result3, '\n');
  } catch (error) {
    console.error('Aggressive policy failed:', error.message, '\n');
  }

  console.log('All Policy Stats:', manager.getAllStats());
}

/**
 * Example 6: Retry with timeout
 */
async function example6_RetryWithTimeout() {
  console.log('\n=== Example 6: Retry with Timeout ===\n');

  const slowOperation = async () => {
    console.log('Starting slow operation...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    return 'Operation completed';
  };

  const withTimeout = (fn, timeoutMs) => {
    return async (...args) => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error('ETIMEDOUT: Operation timeout');
          error.code = 'ETIMEDOUT';
          reject(error);
        }, timeoutMs);
      });

      return Promise.race([fn(...args), timeoutPromise]);
    };
  };

  const retryPolicy = new ExponentialBackoffRetryPolicy({
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 5000
  });

  const timedOperation = withTimeout(slowOperation, 2000);

  try {
    const result = await retryPolicy.execute(timedOperation);
    console.log('Result:', result);
  } catch (error) {
    console.error('Operation failed after retries:', error.message);
  }

  console.log('\nStats:', retryPolicy.getStats());
}

// ============================================================================
// Run Examples
// ============================================================================

async function runAllExamples() {
  await example1_HTTPRequestWithBackoff();
  await example2_DatabaseConnectionRetry();
  await example3_RateLimitedAPIRetry();
  await example4_MicroserviceRetry();
  await example5_RetryManagerWithMultiplePolicies();
  await example6_RetryWithTimeout();
}

// Export classes and examples
module.exports = {
  RetryPolicy,
  FixedRetryPolicy,
  ExponentialBackoffRetryPolicy,
  LinearBackoffRetryPolicy,
  ExponentialBackoffWithJitterRetryPolicy,
  RetryManager,
  RetryStrategy,
  examples: {
    example1_HTTPRequestWithBackoff,
    example2_DatabaseConnectionRetry,
    example3_RateLimitedAPIRetry,
    example4_MicroserviceRetry,
    example5_RetryManagerWithMultiplePolicies,
    example6_RetryWithTimeout
  }
};

// Run examples if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
