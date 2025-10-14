/**
 * Gateway Aggregation Pattern
 *
 * Aggregates multiple backend service calls into a single request,
 * reducing chattiness between client and services.
 *
 * Use Cases:
 * - Mobile applications with bandwidth constraints
 * - Reducing multiple round trips to microservices
 * - Composing data from multiple sources
 * - Improving user experience with faster response times
 */

const EventEmitter = require('events');

/**
 * Service Registry for managing backend services
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map();
  }

  register(name, config) {
    this.services.set(name, {
      url: config.url,
      timeout: config.timeout || 5000,
      retries: config.retries || 3,
      healthCheck: config.healthCheck || null,
      metadata: config.metadata || {}
    });
  }

  get(name) {
    return this.services.get(name);
  }

  list() {
    return Array.from(this.services.keys());
  }

  remove(name) {
    return this.services.delete(name);
  }
}

/**
 * Request Aggregator with parallel execution
 */
class RequestAggregator extends EventEmitter {
  constructor(config = {}) {
    super();
    this.timeout = config.timeout || 10000;
    this.parallel = config.parallel !== false;
    this.failFast = config.failFast || false;
    this.cache = new Map();
    this.cacheEnabled = config.cacheEnabled || false;
    this.cacheTTL = config.cacheTTL || 60000;
  }

  async aggregate(requests) {
    this.emit('aggregation:start', { count: requests.length });

    if (this.parallel) {
      return await this.executeParallel(requests);
    } else {
      return await this.executeSequential(requests);
    }
  }

  async executeParallel(requests) {
    const startTime = Date.now();
    const promises = requests.map(req => this.executeRequest(req));

    try {
      const results = await Promise.allSettled(promises);
      const duration = Date.now() - startTime;

      const response = {
        success: true,
        duration,
        results: results.map((result, index) => ({
          service: requests[index].service,
          status: result.status,
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason.message : null
        })),
        timestamp: new Date().toISOString()
      };

      this.emit('aggregation:complete', response);
      return response;
    } catch (error) {
      this.emit('aggregation:error', error);
      throw error;
    }
  }

  async executeSequential(requests) {
    const startTime = Date.now();
    const results = [];

    for (const request of requests) {
      try {
        const result = await this.executeRequest(request);
        results.push({
          service: request.service,
          status: 'fulfilled',
          data: result,
          error: null
        });
      } catch (error) {
        results.push({
          service: request.service,
          status: 'rejected',
          data: null,
          error: error.message
        });

        if (this.failFast) {
          break;
        }
      }
    }

    const duration = Date.now() - startTime;
    const response = {
      success: true,
      duration,
      results,
      timestamp: new Date().toISOString()
    };

    this.emit('aggregation:complete', response);
    return response;
  }

  async executeRequest(request) {
    const cacheKey = this.getCacheKey(request);

    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        this.emit('cache:hit', { service: request.service });
        return cached.data;
      }
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timeout for ${request.service}`));
      }, request.timeout || this.timeout);

      this.simulateServiceCall(request)
        .then(data => {
          clearTimeout(timer);

          if (this.cacheEnabled) {
            this.cache.set(cacheKey, {
              data,
              timestamp: Date.now()
            });
          }

          resolve(data);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  getCacheKey(request) {
    return `${request.service}:${JSON.stringify(request.params || {})}`;
  }

  async simulateServiceCall(request) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

    if (request.shouldFail) {
      throw new Error(`Service ${request.service} failed`);
    }

    return {
      service: request.service,
      data: request.mockData || { message: `Data from ${request.service}` },
      timestamp: new Date().toISOString()
    };
  }

  clearCache() {
    this.cache.clear();
    this.emit('cache:cleared');
  }
}

/**
 * Response Transformer for aggregated data
 */
class ResponseTransformer {
  constructor() {
    this.transformers = new Map();
  }

  register(name, transformer) {
    this.transformers.set(name, transformer);
  }

  transform(response, transformerName) {
    const transformer = this.transformers.get(transformerName);
    if (!transformer) {
      return response;
    }

    return transformer(response);
  }

  merge(results) {
    const merged = {};

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.data) {
        merged[result.service] = result.data;
      }
    });

    return merged;
  }

  flatten(results) {
    const flattened = [];

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.data) {
        if (Array.isArray(result.data.data)) {
          flattened.push(...result.data.data);
        } else {
          flattened.push(result.data);
        }
      }
    });

    return flattened;
  }
}

/**
 * Main Gateway Aggregation implementation
 */
class GatewayAggregation extends EventEmitter {
  constructor(config = {}) {
    super();
    this.registry = new ServiceRegistry();
    this.aggregator = new RequestAggregator(config.aggregator || {});
    this.transformer = new ResponseTransformer();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHits: 0
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.aggregator.on('aggregation:start', data => {
      this.metrics.totalRequests++;
      this.emit('request:start', data);
    });

    this.aggregator.on('aggregation:complete', data => {
      this.updateMetrics(data);
      this.emit('request:complete', data);
    });

    this.aggregator.on('cache:hit', () => {
      this.metrics.cacheHits++;
    });
  }

  registerService(name, config) {
    this.registry.register(name, config);
    this.emit('service:registered', { name, config });
  }

  registerTransformer(name, transformer) {
    this.transformer.register(name, transformer);
  }

  async execute(requests, options = {}) {
    const startTime = Date.now();

    try {
      const response = await this.aggregator.aggregate(requests);

      let transformedResponse = response;

      if (options.merge) {
        transformedResponse.merged = this.transformer.merge(response.results);
      }

      if (options.flatten) {
        transformedResponse.flattened = this.transformer.flatten(response.results);
      }

      if (options.transformer) {
        transformedResponse = this.transformer.transform(transformedResponse, options.transformer);
      }

      this.metrics.successfulRequests++;
      return transformedResponse;
    } catch (error) {
      this.metrics.failedRequests++;
      this.emit('request:error', error);
      throw error;
    }
  }

  updateMetrics(data) {
    const currentAvg = this.metrics.averageResponseTime;
    const totalRequests = this.metrics.totalRequests;

    this.metrics.averageResponseTime =
      (currentAvg * (totalRequests - 1) + data.duration) / totalRequests;
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0
        ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      cacheHitRate: this.metrics.totalRequests > 0
        ? (this.metrics.cacheHits / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHits: 0
    };
  }
}

/**
 * Example usage and demonstration
 */
function demonstrateGatewayAggregation() {
  console.log('=== Gateway Aggregation Pattern Demo ===\n');

  const gateway = new GatewayAggregation({
    aggregator: {
      timeout: 5000,
      parallel: true,
      cacheEnabled: true,
      cacheTTL: 60000
    }
  });

  gateway.registerService('users', {
    url: 'http://api.example.com/users',
    timeout: 3000
  });

  gateway.registerService('orders', {
    url: 'http://api.example.com/orders',
    timeout: 3000
  });

  gateway.registerService('inventory', {
    url: 'http://api.example.com/inventory',
    timeout: 3000
  });

  gateway.on('request:start', data => {
    console.log(`Starting aggregation of ${data.count} requests`);
  });

  gateway.on('request:complete', data => {
    console.log(`Aggregation completed in ${data.duration}ms`);
  });

  const requests = [
    {
      service: 'users',
      params: { id: 123 },
      mockData: { id: 123, name: 'John Doe', email: 'john@example.com' }
    },
    {
      service: 'orders',
      params: { userId: 123 },
      mockData: { orders: [{ id: 1, total: 99.99 }, { id: 2, total: 149.99 }] }
    },
    {
      service: 'inventory',
      params: { userId: 123 },
      mockData: { items: [{ sku: 'ABC123', quantity: 5 }] }
    }
  ];

  gateway.execute(requests, { merge: true })
    .then(response => {
      console.log('\nAggregated Response:');
      console.log(JSON.stringify(response, null, 2));
      console.log('\nMetrics:');
      console.log(JSON.stringify(gateway.getMetrics(), null, 2));
    })
    .catch(error => {
      console.error('Aggregation failed:', error.message);
    });
}

if (require.main === module) {
  demonstrateGatewayAggregation();
}

module.exports = GatewayAggregation;
