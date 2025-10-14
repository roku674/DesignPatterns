/**
 * API Composition Pattern
 *
 * Implements an API composer that invokes multiple services and combines the results.
 * The composer can perform sequential or parallel calls and aggregate the data.
 *
 * Benefits:
 * - Reduces client complexity by providing aggregated data
 * - Optimizes performance through parallel service calls
 * - Centralizes data aggregation logic
 * - Handles partial failures gracefully
 */

const EventEmitter = require('events');

/**
 * Service Client for making service calls
 */
class ServiceClient {
  constructor(serviceName, baseUrl) {
    this.serviceName = serviceName;
    this.baseUrl = baseUrl;
    this.timeout = 5000;
  }

  /**
   * Call a service method
   * @param {string} method - Method name
   * @param {Object} params - Method parameters
   * @returns {Promise<any>} Service response
   */
  async call(method, params = {}) {
    const startTime = Date.now();

    try {
      await this.simulateLatency();
      const response = await this.mockServiceCall(method, params);
      const duration = Date.now() - startTime;
      console.log(`[${this.serviceName}] ${method} completed in ${duration}ms`);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${this.serviceName}] ${method} failed after ${duration}ms:`, error.message);
      throw error;
    }
  }

  async mockServiceCall(method, params) {
    return { serviceName: this.serviceName, method, params, timestamp: new Date().toISOString() };
  }

  simulateLatency() {
    const latency = Math.random() * 200 + 50;
    return new Promise(resolve => setTimeout(resolve, latency));
  }
}

/**
 * Result Aggregator for combining service responses
 */
class ResultAggregator {
  constructor() {
    this.strategies = new Map();
    this.registerDefaultStrategies();
  }

  registerDefaultStrategies() {
    this.registerStrategy('merge', (results) => {
      return results.reduce((acc, result) => ({ ...acc, ...result }), {});
    });

    this.registerStrategy('array', (results) => {
      return results.flat();
    });

    this.registerStrategy('first', (results) => {
      return results.find(r => r !== null && r !== undefined) || null;
    });

    this.registerStrategy('object', (results, keys) => {
      const aggregated = {};
      results.forEach((result, index) => {
        const key = keys?.[index] || `result_${index}`;
        aggregated[key] = result;
      });
      return aggregated;
    });
  }

  registerStrategy(name, fn) {
    this.strategies.set(name, fn);
  }

  aggregate(results, strategy = 'object', options = {}) {
    const strategyFn = this.strategies.get(strategy);
    if (!strategyFn) {
      throw new Error(`Unknown aggregation strategy: ${strategy}`);
    }
    return strategyFn(results, options.keys, options);
  }
}

/**
 * API Composer - Main implementation
 */
class APIComposer extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      failFast: config.failFast !== undefined ? config.failFast : false
    };

    this.services = new Map();
    this.aggregator = new ResultAggregator();
    this.cache = new Map();
  }

  registerService(name, client) {
    this.services.set(name, client);
    console.log(`[Composer] Service registered: ${name}`);
  }

  async composeParallel(operations, options = {}) {
    console.log(`[Composer] Starting parallel composition with ${operations.length} operations`);
    const startTime = Date.now();

    const promises = operations.map(async (op, index) => {
      try {
        const service = this.services.get(op.service);
        if (!service) {
          throw new Error(`Service not found: ${op.service}`);
        }

        const result = await this.executeWithRetry(
          () => service.call(op.method, op.params),
          op.service,
          op.method
        );

        return { index, success: true, data: result, service: op.service };
      } catch (error) {
        if (this.config.failFast) {
          throw error;
        }
        return { index, success: false, error: error.message, service: op.service };
      }
    });

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    const successfulResults = results.filter(r => r.success).map(r => r.data);
    const failedResults = results.filter(r => !r.success);

    const composedData = this.aggregator.aggregate(
      successfulResults,
      options.aggregationStrategy || 'object',
      { keys: operations.map(op => op.key || op.service) }
    );

    const response = {
      success: failedResults.length === 0,
      data: composedData,
      metadata: {
        totalOperations: operations.length,
        successfulOperations: successfulResults.length,
        failedOperations: failedResults.length,
        duration,
        failures: failedResults
      }
    };

    this.emit('composition-complete', response);
    return response;
  }

  async composeSequential(operations, options = {}) {
    console.log(`[Composer] Starting sequential composition with ${operations.length} operations`);
    const startTime = Date.now();

    const results = [];
    let context = options.initialContext || {};

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];

      try {
        const service = this.services.get(op.service);
        if (!service) {
          throw new Error(`Service not found: ${op.service}`);
        }

        const params = typeof op.params === 'function' ? op.params(context) : op.params;
        const result = await this.executeWithRetry(
          () => service.call(op.method, params),
          op.service,
          op.method
        );

        const transformedResult = op.transform ? op.transform(result, context) : result;
        results.push({ service: op.service, data: transformedResult });
        context = { ...context, [op.key || op.service]: transformedResult };

      } catch (error) {
        if (this.config.failFast) {
          throw error;
        }
        results.push({ service: op.service, error: error.message });
      }
    }

    const duration = Date.now() - startTime;
    const successfulResults = results.filter(r => !r.error);
    const failedResults = results.filter(r => r.error);

    return {
      success: failedResults.length === 0,
      data: context,
      results,
      metadata: {
        totalOperations: operations.length,
        successfulOperations: successfulResults.length,
        failedOperations: failedResults.length,
        duration
      }
    };
  }

  async executeWithRetry(operation, serviceName, method) {
    let lastError;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.log(`[Composer] Retry ${attempt}/${this.config.retryAttempts} for ${serviceName}.${method}`);

        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    throw lastError;
  }

  async composeWithCache(cacheKey, compositionFn, ttl = 60000) {
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`[Composer] Cache hit for key: ${cacheKey}`);
      return cached.data;
    }

    console.log(`[Composer] Cache miss for key: ${cacheKey}`);
    const result = await compositionFn();
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  registerAggregationStrategy(name, fn) {
    this.aggregator.registerStrategy(name, fn);
  }
}

// Example Service Implementations

class UserServiceClient extends ServiceClient {
  async mockServiceCall(method, params) {
    await this.simulateLatency();

    if (method === 'getUser') {
      return {
        id: params.userId,
        name: 'John Doe',
        email: 'john@example.com',
        joinDate: '2023-01-15'
      };
    }

    if (method === 'getUserPreferences') {
      return {
        theme: 'dark',
        language: 'en',
        notifications: true
      };
    }

    throw new Error(`Unknown method: ${method}`);
  }
}

class OrderServiceClient extends ServiceClient {
  async mockServiceCall(method, params) {
    await this.simulateLatency();

    if (method === 'getOrders') {
      return [
        { id: 1, total: 150.00, status: 'delivered', date: '2024-01-10' },
        { id: 2, total: 299.99, status: 'shipped', date: '2024-01-15' }
      ];
    }

    if (method === 'getOrderStats') {
      return {
        totalOrders: 2,
        totalSpent: 449.99,
        averageOrderValue: 224.995
      };
    }

    throw new Error(`Unknown method: ${method}`);
  }
}

class RecommendationServiceClient extends ServiceClient {
  async mockServiceCall(method, params) {
    await this.simulateLatency();

    if (method === 'getRecommendations') {
      return [
        { id: 101, name: 'Product A', score: 0.95 },
        { id: 102, name: 'Product B', score: 0.87 }
      ];
    }

    throw new Error(`Unknown method: ${method}`);
  }
}

// Demonstration

async function demonstrateAPIComposition() {
  console.log('=== API Composition Pattern Demo ===\n');

  const composer = new APIComposer({
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 500,
    failFast: false
  });

  const userService = new UserServiceClient('UserService', 'http://localhost:3001');
  const orderService = new OrderServiceClient('OrderService', 'http://localhost:3002');
  const recommendationService = new RecommendationServiceClient('RecommendationService', 'http://localhost:3003');

  composer.registerService('user', userService);
  composer.registerService('order', orderService);
  composer.registerService('recommendation', recommendationService);

  // Scenario 1: Parallel Composition
  console.log('Scenario 1: Parallel composition\n');

  const parallelResult = await composer.composeParallel([
    { service: 'user', method: 'getUser', params: { userId: 123 }, key: 'profile' },
    { service: 'user', method: 'getUserPreferences', params: { userId: 123 }, key: 'preferences' },
    { service: 'order', method: 'getOrders', params: { userId: 123 }, key: 'orders' },
    { service: 'order', method: 'getOrderStats', params: { userId: 123 }, key: 'orderStats' },
    { service: 'recommendation', method: 'getRecommendations', params: { userId: 123 }, key: 'recommendations' }
  ]);

  console.log('Result:', JSON.stringify(parallelResult.metadata, null, 2));

  // Scenario 2: Sequential Composition
  console.log('\nScenario 2: Sequential composition\n');

  const sequentialResult = await composer.composeSequential([
    { service: 'user', method: 'getUser', params: { userId: 123 }, key: 'user' },
    {
      service: 'order',
      method: 'getOrders',
      params: (context) => ({ userId: context.user.id }),
      key: 'orders'
    }
  ]);

  console.log('Result:', JSON.stringify(sequentialResult.metadata, null, 2));

  console.log('\n=== Demo Complete ===');
}

if (require.main === module) {
  demonstrateAPIComposition().catch(console.error);
}

module.exports = APIComposer;
