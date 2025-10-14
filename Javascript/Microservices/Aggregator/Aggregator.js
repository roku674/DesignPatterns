/**
 * Aggregator Pattern
 *
 * Collects data from multiple services/sources and combines them into a single response.
 * Acts as a composition layer that reduces client complexity and network calls.
 *
 * Key benefits:
 * - Reduces number of client-server round trips
 * - Simplifies client logic by providing composed responses
 * - Enables parallel data fetching from multiple sources
 * - Provides a single point for data transformation and enrichment
 *
 * @module Aggregator
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Service client for making external service calls
 */
class ServiceClient {
  constructor(serviceName, baseUrl, options = {}) {
    this.serviceName = serviceName;
    this.baseUrl = baseUrl;
    this.timeout = options.timeout || 5000;
    this.retries = options.retries || 3;
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 60000;
  }

  /**
   * Make HTTP GET request to service
   * @param {string} endpoint - Service endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, params = {}) {
    const url = this.buildUrl(endpoint, params);
    const cacheKey = this.getCacheKey('GET', url);

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.executeWithRetry(async () => {
      return await this.simulateHttpCall('GET', url);
    });

    this.setCache(cacheKey, data);
    return data;
  }

  /**
   * Make HTTP POST request to service
   * @param {string} endpoint - Service endpoint
   * @param {Object} body - Request body
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, body = {}) {
    const url = this.buildUrl(endpoint);

    return await this.executeWithRetry(async () => {
      return await this.simulateHttpCall('POST', url, body);
    });
  }

  /**
   * Build full URL with parameters
   * @param {string} endpoint - Endpoint path
   * @param {Object} params - Query parameters
   * @returns {string} Full URL
   */
  buildUrl(endpoint, params = {}) {
    let url = `${this.baseUrl}${endpoint}`;

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }

  /**
   * Execute request with retry logic
   * @param {Function} fn - Function to execute
   * @returns {Promise<any>} Result
   */
  async executeWithRetry(fn) {
    let lastError;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        return await Promise.race([
          fn(),
          this.createTimeout()
        ]);
      } catch (error) {
        lastError = error;
        if (attempt < this.retries) {
          await this.delay(Math.pow(2, attempt) * 100);
        }
      }
    }

    throw new Error(`Service ${this.serviceName} failed after ${this.retries} attempts: ${lastError.message}`);
  }

  /**
   * Simulate HTTP call (replace with actual HTTP library in production)
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} body - Request body
   * @returns {Promise<Object>} Response data
   */
  async simulateHttpCall(method, url, body = null) {
    await this.delay(Math.random() * 100);

    if (Math.random() < 0.1) {
      throw new Error('Service temporarily unavailable');
    }

    return {
      success: true,
      service: this.serviceName,
      method,
      url,
      data: body || { mock: 'data' },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create timeout promise
   * @returns {Promise<never>} Timeout promise
   */
  createTimeout() {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), this.timeout);
    });
  }

  /**
   * Delay execution
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get cache key
   * @param {string} method - HTTP method
   * @param {string} url - URL
   * @returns {string} Cache key
   */
  getCacheKey(method, url) {
    return `${method}:${url}`;
  }

  /**
   * Get from cache
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache entry
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

/**
 * Aggregation strategy interface
 */
class AggregationStrategy {
  /**
   * Aggregate data from multiple sources
   * @param {Array<Object>} results - Results from services
   * @returns {Object} Aggregated result
   */
  aggregate(results) {
    throw new Error('aggregate method must be implemented');
  }
}

/**
 * Merge aggregation strategy - merges all results into single object
 */
class MergeStrategy extends AggregationStrategy {
  aggregate(results) {
    const merged = {};

    results.forEach(result => {
      if (result.success && result.data) {
        Object.assign(merged, result.data);
      }
    });

    return merged;
  }
}

/**
 * Collect aggregation strategy - collects results into array
 */
class CollectStrategy extends AggregationStrategy {
  aggregate(results) {
    return results
      .filter(result => result.success)
      .map(result => result.data);
  }
}

/**
 * Nested aggregation strategy - creates nested structure by service name
 */
class NestedStrategy extends AggregationStrategy {
  aggregate(results) {
    const nested = {};

    results.forEach(result => {
      if (result.service) {
        nested[result.service] = result.success ? result.data : { error: result.error };
      }
    });

    return nested;
  }
}

/**
 * Transform aggregation strategy - applies custom transformation
 */
class TransformStrategy extends AggregationStrategy {
  constructor(transformFn) {
    super();
    this.transformFn = transformFn;
  }

  aggregate(results) {
    return this.transformFn(results);
  }
}

/**
 * Aggregator pipeline for processing multiple aggregations
 */
class AggregatorPipeline {
  constructor() {
    this.stages = [];
  }

  /**
   * Add stage to pipeline
   * @param {Function} stage - Stage function
   * @returns {AggregatorPipeline} This pipeline for chaining
   */
  addStage(stage) {
    this.stages.push(stage);
    return this;
  }

  /**
   * Execute pipeline
   * @param {Object} input - Input data
   * @returns {Promise<Object>} Processed data
   */
  async execute(input) {
    let result = input;

    for (const stage of this.stages) {
      result = await stage(result);
    }

    return result;
  }
}

/**
 * Request batch manager for grouping requests
 */
class RequestBatcher {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10;
    this.batchTimeout = options.batchTimeout || 100;
    this.pendingRequests = [];
    this.timer = null;
  }

  /**
   * Add request to batch
   * @param {Object} request - Request to batch
   * @returns {Promise<Object>} Request result
   */
  add(request) {
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({ request, resolve, reject });

      if (this.pendingRequests.length >= this.batchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.batchTimeout);
      }
    });
  }

  /**
   * Flush pending requests
   */
  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const batch = this.pendingRequests.splice(0);
    if (batch.length === 0) return;

    const results = await Promise.allSettled(
      batch.map(({ request }) => this.executeRequest(request))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        batch[index].resolve(result.value);
      } else {
        batch[index].reject(result.reason);
      }
    });
  }

  /**
   * Execute single request
   * @param {Object} request - Request to execute
   * @returns {Promise<Object>} Result
   */
  async executeRequest(request) {
    return request;
  }
}

/**
 * Main Aggregator class
 */
class Aggregator extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.services = new Map();
    this.strategies = new Map();
    this.pipeline = new AggregatorPipeline();
    this.batcher = new RequestBatcher(config.batching);
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0
    };

    this.registerDefaultStrategies();
  }

  /**
   * Register default aggregation strategies
   */
  registerDefaultStrategies() {
    this.strategies.set('merge', new MergeStrategy());
    this.strategies.set('collect', new CollectStrategy());
    this.strategies.set('nested', new NestedStrategy());
  }

  /**
   * Register service client
   * @param {string} serviceName - Service name
   * @param {string} baseUrl - Base URL
   * @param {Object} options - Service options
   */
  registerService(serviceName, baseUrl, options = {}) {
    this.services.set(serviceName, new ServiceClient(serviceName, baseUrl, options));
  }

  /**
   * Register custom aggregation strategy
   * @param {string} name - Strategy name
   * @param {AggregationStrategy} strategy - Strategy instance
   */
  registerStrategy(name, strategy) {
    this.strategies.set(name, strategy);
  }

  /**
   * Aggregate data from multiple services
   * @param {Object} aggregationConfig - Aggregation configuration
   * @returns {Promise<Object>} Aggregated result
   */
  async aggregate(aggregationConfig) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    this.emit('aggregation:start', { requestId, config: aggregationConfig });

    try {
      const { services, strategy = 'merge', parallel = true, transforms = [] } = aggregationConfig;

      const results = parallel
        ? await this.executeParallel(services)
        : await this.executeSequential(services);

      const strategyInstance = this.strategies.get(strategy);
      if (!strategyInstance) {
        throw new Error(`Unknown strategy: ${strategy}`);
      }

      let aggregated = strategyInstance.aggregate(results);

      for (const transform of transforms) {
        aggregated = await transform(aggregated);
      }

      const latency = Date.now() - startTime;
      this.updateMetrics(true, latency);

      this.emit('aggregation:complete', { requestId, latency, result: aggregated });

      return {
        success: true,
        data: aggregated,
        metadata: {
          requestId,
          latency,
          servicesCount: services.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.updateMetrics(false, latency);

      this.emit('aggregation:error', { requestId, error: error.message });

      return {
        success: false,
        error: error.message,
        metadata: {
          requestId,
          latency,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Execute service calls in parallel
   * @param {Array<Object>} services - Service call configurations
   * @returns {Promise<Array<Object>>} Results
   */
  async executeParallel(services) {
    const promises = services.map(serviceConfig =>
      this.executeServiceCall(serviceConfig)
    );

    const results = await Promise.allSettled(promises);

    return results.map((result, index) => ({
      service: services[index].name,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));
  }

  /**
   * Execute service calls sequentially
   * @param {Array<Object>} services - Service call configurations
   * @returns {Promise<Array<Object>>} Results
   */
  async executeSequential(services) {
    const results = [];

    for (const serviceConfig of services) {
      try {
        const data = await this.executeServiceCall(serviceConfig);
        results.push({
          service: serviceConfig.name,
          success: true,
          data
        });
      } catch (error) {
        results.push({
          service: serviceConfig.name,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Execute single service call
   * @param {Object} serviceConfig - Service configuration
   * @returns {Promise<Object>} Result
   */
  async executeServiceCall(serviceConfig) {
    const { name, endpoint, method = 'GET', params = {}, body = {} } = serviceConfig;

    const client = this.services.get(name);
    if (!client) {
      throw new Error(`Service not registered: ${name}`);
    }

    if (method === 'GET') {
      return await client.get(endpoint, params);
    } else if (method === 'POST') {
      return await client.post(endpoint, body);
    }

    throw new Error(`Unsupported method: ${method}`);
  }

  /**
   * Aggregate with fallback services
   * @param {Object} config - Aggregation configuration with fallbacks
   * @returns {Promise<Object>} Result
   */
  async aggregateWithFallback(config) {
    const { primary, fallbacks = [] } = config;

    try {
      return await this.aggregate(primary);
    } catch (primaryError) {
      for (const fallback of fallbacks) {
        try {
          return await this.aggregate(fallback);
        } catch (fallbackError) {
          continue;
        }
      }

      throw new Error('All aggregation attempts failed');
    }
  }

  /**
   * Aggregate with timeout
   * @param {Object} config - Aggregation configuration
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Result
   */
  async aggregateWithTimeout(config, timeout) {
    return Promise.race([
      this.aggregate(config),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Aggregation timeout')), timeout)
      )
    ]);
  }

  /**
   * Update metrics
   * @param {boolean} success - Whether request was successful
   * @param {number} latency - Request latency
   */
  updateMetrics(success, latency) {
    this.metrics.totalRequests++;

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    this.metrics.averageLatency =
      (this.metrics.averageLatency * (this.metrics.totalRequests - 1) + latency) /
      this.metrics.totalRequests;
  }

  /**
   * Get aggregator metrics
   * @returns {Object} Metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0
        ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
        : 0
    };
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    for (const [, client] of this.services) {
      client.cache.clear();
    }
  }

  /**
   * Get registered services
   * @returns {Array<string>} Service names
   */
  getRegisteredServices() {
    return Array.from(this.services.keys());
  }
}

module.exports = Aggregator;
