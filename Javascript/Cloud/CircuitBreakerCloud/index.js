/**
 * Circuit Breaker Pattern
 *
 * Prevents an application from repeatedly trying to execute an operation that's likely to fail,
 * allowing it to continue without waiting for the fault to be fixed or wasting CPU cycles.
 *
 * States:
 * - Closed: Requests flow through normally. Failures increment counter.
 * - Open: Requests fail immediately without attempting the operation.
 * - Half-Open: Limited requests are allowed to test if the issue is resolved.
 *
 * Use Cases:
 * - Protecting remote service calls
 * - Database operations
 * - External API integrations
 * - Microservice communication
 */

/**
 * Circuit Breaker State Enum
 */
const CircuitState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

/**
 * Circuit Breaker implementation for protecting service calls
 */
class CircuitBreaker {
  /**
   * @param {Object} options - Configuration options
   * @param {number} options.failureThreshold - Number of failures before opening circuit
   * @param {number} options.successThreshold - Number of successes in half-open to close circuit
   * @param {number} options.timeout - Time in ms before attempting to close circuit
   * @param {Function} options.fallback - Fallback function when circuit is open
   */
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000; // 60 seconds
    this.fallback = options.fallback || this.defaultFallback;

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0
    };
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Async function to execute
   * @param {...any} args - Arguments to pass to the function
   * @returns {Promise<any>} Result of the function or fallback
   */
  async execute(fn, ...args) {
    this.stats.totalCalls++;

    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        this.stats.rejectedCalls++;
        console.log('[Circuit Breaker] Circuit is OPEN, using fallback');
        return this.fallback(...args);
      }
      // Transition to half-open to test if service recovered
      this.state = CircuitState.HALF_OPEN;
      console.log('[Circuit Breaker] Transitioning to HALF_OPEN state');
    }

    try {
      const result = await fn(...args);
      return this.onSuccess(result);
    } catch (error) {
      return this.onFailure(error, ...args);
    }
  }

  /**
   * Handle successful execution
   */
  onSuccess(result) {
    this.failureCount = 0;
    this.stats.successfulCalls++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        console.log('[Circuit Breaker] Circuit CLOSED after successful recovery');
      }
    }

    return result;
  }

  /**
   * Handle failed execution
   */
  onFailure(error, ...args) {
    this.failureCount++;
    this.stats.failedCalls++;
    console.error(`[Circuit Breaker] Failure ${this.failureCount}/${this.failureThreshold}:`, error.message);

    if (this.state === CircuitState.HALF_OPEN ||
        this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
      this.successCount = 0;
      console.log(`[Circuit Breaker] Circuit OPENED, will retry after ${this.timeout}ms`);
    }

    return this.fallback(...args);
  }

  /**
   * Default fallback function
   */
  defaultFallback() {
    return {
      error: 'Service temporarily unavailable',
      fallback: true
    };
  }

  /**
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      state: this.state,
      failureCount: this.failureCount,
      successRate: this.stats.totalCalls > 0
        ? ((this.stats.successfulCalls / this.stats.totalCalls) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    console.log('[Circuit Breaker] Circuit manually reset');
  }
}

/**
 * Circuit Breaker with monitoring capabilities
 */
class MonitoredCircuitBreaker extends CircuitBreaker {
  constructor(options = {}) {
    super(options);
    this.name = options.name || 'unnamed';
    this.monitor = options.monitor || console;
  }

  /**
   * Log state transitions with monitoring
   */
  onSuccess(result) {
    const prevState = this.state;
    const returnValue = super.onSuccess(result);

    if (prevState !== this.state) {
      this.monitor.log(`[Monitor] ${this.name}: State changed from ${prevState} to ${this.state}`);
    }

    return returnValue;
  }

  onFailure(error, ...args) {
    const prevState = this.state;
    const returnValue = super.onFailure(error, ...args);

    if (prevState !== this.state) {
      this.monitor.log(`[Monitor] ${this.name}: State changed from ${prevState} to ${this.state}`);
    }

    return returnValue;
  }
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: Protecting HTTP API calls
 */
async function example1_HTTPServiceProtection() {
  console.log('\n=== Example 1: HTTP Service Protection ===\n');

  // Simulated unreliable HTTP service
  let callCount = 0;
  const unreliableService = async (url) => {
    callCount++;
    console.log(`Making HTTP request ${callCount} to ${url}`);

    // Simulate service that fails frequently
    if (callCount <= 5 || (callCount > 8 && callCount <= 10)) {
      throw new Error('HTTP 503: Service Unavailable');
    }

    return { status: 200, data: 'Success response' };
  };

  const breaker = new CircuitBreaker({
    failureThreshold: 3,
    timeout: 2000,
    fallback: () => ({ status: 503, data: 'Fallback: Using cached data' })
  });

  // Make multiple requests
  for (let i = 0; i < 15; i++) {
    try {
      const result = await breaker.execute(unreliableService, 'https://api.example.com/data');
      console.log(`Request ${i + 1} result:`, result);
    } catch (error) {
      console.error(`Request ${i + 1} error:`, error.message);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\nFinal Stats:', breaker.getStats());
}

/**
 * Example 2: Database connection protection
 */
async function example2_DatabaseProtection() {
  console.log('\n=== Example 2: Database Connection Protection ===\n');

  // Simulated database operations
  let dbHealthy = false;
  let queryCount = 0;

  const databaseQuery = async (query) => {
    queryCount++;
    console.log(`Executing query ${queryCount}: ${query}`);

    // Simulate database becoming healthy after 5 failures
    if (queryCount > 5) {
      dbHealthy = true;
    }

    if (!dbHealthy) {
      throw new Error('Database connection timeout');
    }

    return { rows: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }] };
  };

  const dbBreaker = new MonitoredCircuitBreaker({
    name: 'DatabaseBreaker',
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 3000,
    fallback: () => ({ rows: [], cached: true, message: 'Using cached results' })
  });

  // Execute database queries
  for (let i = 0; i < 10; i++) {
    const result = await dbBreaker.execute(databaseQuery, 'SELECT * FROM users');
    console.log(`Query ${i + 1} result:`, result);
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  console.log('\nDatabase Stats:', dbBreaker.getStats());
}

/**
 * Example 3: Microservice communication with circuit breakers
 */
async function example3_MicroserviceProtection() {
  console.log('\n=== Example 3: Microservice Communication ===\n');

  // Simulated microservices
  const services = {
    user: { failures: 0, maxFailures: 3 },
    payment: { failures: 0, maxFailures: 2 },
    inventory: { failures: 0, maxFailures: 4 }
  };

  const callService = async (serviceName) => {
    const service = services[serviceName];
    service.failures++;

    if (service.failures <= service.maxFailures) {
      throw new Error(`${serviceName} service error`);
    }

    return { service: serviceName, status: 'healthy', data: 'Service response' };
  };

  // Create circuit breakers for each service
  const breakers = {
    user: new MonitoredCircuitBreaker({
      name: 'UserService',
      failureThreshold: 2,
      timeout: 2000,
      fallback: () => ({ service: 'user', fallback: true, data: 'Default user data' })
    }),
    payment: new MonitoredCircuitBreaker({
      name: 'PaymentService',
      failureThreshold: 2,
      timeout: 2000,
      fallback: () => ({ service: 'payment', fallback: true, data: 'Payment queued' })
    }),
    inventory: new MonitoredCircuitBreaker({
      name: 'InventoryService',
      failureThreshold: 3,
      timeout: 2000,
      fallback: () => ({ service: 'inventory', fallback: true, data: 'Cached inventory' })
    })
  };

  // Simulate service calls
  for (let i = 0; i < 8; i++) {
    console.log(`\n--- Round ${i + 1} ---`);

    for (const [serviceName, breaker] of Object.entries(breakers)) {
      const result = await breaker.execute(callService, serviceName);
      console.log(`${serviceName}:`, result);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n=== Service Statistics ===');
  for (const [name, breaker] of Object.entries(breakers)) {
    console.log(`\n${name}:`, breaker.getStats());
  }
}

/**
 * Example 4: External API integration with retry and circuit breaker
 */
async function example4_ExternalAPIIntegration() {
  console.log('\n=== Example 4: External API Integration ===\n');

  let apiCallCount = 0;
  const externalAPI = async (endpoint) => {
    apiCallCount++;

    // Simulate intermittent failures
    if (apiCallCount % 3 === 0) {
      throw new Error('API Rate Limit Exceeded');
    }

    return {
      endpoint,
      data: { message: 'API response', timestamp: Date.now() },
      callNumber: apiCallCount
    };
  };

  const apiBreaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 5000,
    fallback: (endpoint) => ({
      endpoint,
      fallback: true,
      data: { message: 'Cached response', timestamp: Date.now() }
    })
  });

  // Make API calls
  for (let i = 0; i < 12; i++) {
    const result = await apiBreaker.execute(externalAPI, '/api/v1/data');
    console.log(`Call ${i + 1}:`, result);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\nAPI Stats:', apiBreaker.getStats());
}

/**
 * Example 5: Multi-level circuit breaker strategy
 */
async function example5_MultiLevelStrategy() {
  console.log('\n=== Example 5: Multi-Level Circuit Breaker Strategy ===\n');

  // Primary and secondary service implementations
  let primaryFailures = 0;
  const primaryService = async (data) => {
    primaryFailures++;
    if (primaryFailures <= 4) {
      throw new Error('Primary service down');
    }
    return { source: 'primary', data: `Processed: ${data}` };
  };

  const secondaryService = async (data) => {
    return { source: 'secondary', data: `Processed: ${data}` };
  };

  // Primary breaker with fallback to secondary service
  const primaryBreaker = new CircuitBreaker({
    failureThreshold: 2,
    timeout: 3000,
    fallback: async (data) => {
      console.log('Primary failed, trying secondary service...');
      return secondaryBreaker.execute(secondaryService, data);
    }
  });

  // Secondary breaker with final fallback
  const secondaryBreaker = new CircuitBreaker({
    failureThreshold: 2,
    timeout: 3000,
    fallback: (data) => ({
      source: 'cache',
      data: `Cached result for: ${data}`,
      warning: 'All services unavailable'
    })
  });

  // Execute requests
  for (let i = 0; i < 10; i++) {
    const result = await primaryBreaker.execute(primaryService, `Request ${i + 1}`);
    console.log(`Result ${i + 1}:`, result);
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  console.log('\nPrimary Stats:', primaryBreaker.getStats());
  console.log('Secondary Stats:', secondaryBreaker.getStats());
}

// ============================================================================
// Run Examples
// ============================================================================

async function runAllExamples() {
  await example1_HTTPServiceProtection();
  await example2_DatabaseProtection();
  await example3_MicroserviceProtection();
  await example4_ExternalAPIIntegration();
  await example5_MultiLevelStrategy();
}

// Export classes and examples
module.exports = {
  CircuitBreaker,
  MonitoredCircuitBreaker,
  CircuitState,
  examples: {
    example1_HTTPServiceProtection,
    example2_DatabaseProtection,
    example3_MicroserviceProtection,
    example4_ExternalAPIIntegration,
    example5_MultiLevelStrategy
  }
};

// Run examples if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
