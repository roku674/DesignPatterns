/**
 * AggregatorMS (Aggregator Microservices) Pattern
 *
 * Extends the Aggregator pattern for microservices architecture with service mesh integration,
 * distributed tracing, and advanced resilience patterns.
 *
 * Key benefits:
 * - Service mesh aware aggregation
 * - Distributed tracing and observability
 * - Advanced circuit breaking and retry logic
 * - Load balancing across service instances
 *
 * @module AggregatorMS
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Service registry with health checking
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.instances = new Map();
  }

  /**
   * Register service with multiple instances
   * @param {string} serviceName - Service name
   * @param {Array<Object>} instances - Service instances
   * @returns {Promise<void>}
   */
  async register(serviceName, instances) {
    this.services.set(serviceName, {
      name: serviceName,
      registeredAt: new Date().toISOString()
    });

    this.instances.set(serviceName, instances.map(instance => ({
      ...instance,
      health: 'healthy',
      lastChecked: Date.now()
    })));
  }

  /**
   * Get healthy instance using load balancing
   * @param {string} serviceName - Service name
   * @param {string} strategy - Load balancing strategy
   * @returns {Promise<Object>} Service instance
   */
  async getInstance(serviceName, strategy = 'round-robin') {
    const instances = this.instances.get(serviceName) || [];
    const healthyInstances = instances.filter(i => i.health === 'healthy');

    if (healthyInstances.length === 0) {
      throw new Error(`No healthy instances found for service: ${serviceName}`);
    }

    if (strategy === 'round-robin') {
      return healthyInstances[Math.floor(Math.random() * healthyInstances.length)];
    } else if (strategy === 'least-connections') {
      return healthyInstances.reduce((min, inst) =>
        (inst.connections || 0) < (min.connections || 0) ? inst : min
      );
    }

    return healthyInstances[0];
  }

  /**
   * Update instance health
   * @param {string} serviceName - Service name
   * @param {string} instanceId - Instance ID
   * @param {string} health - Health status
   * @returns {Promise<void>}
   */
  async updateHealth(serviceName, instanceId, health) {
    const instances = this.instances.get(serviceName);
    if (instances) {
      const instance = instances.find(i => i.id === instanceId);
      if (instance) {
        instance.health = health;
        instance.lastChecked = Date.now();
      }
    }
  }
}

/**
 * Distributed tracer for observability
 */
class DistributedTracer {
  constructor() {
    this.traces = new Map();
  }

  /**
   * Start new trace
   * @param {string} operationName - Operation name
   * @returns {Object} Trace context
   */
  startTrace(operationName) {
    const traceId = crypto.randomUUID();
    const spanId = crypto.randomUUID();

    const trace = {
      traceId,
      spanId,
      operationName,
      startTime: Date.now(),
      spans: []
    };

    this.traces.set(traceId, trace);

    return { traceId, spanId };
  }

  /**
   * Start child span
   * @param {string} traceId - Parent trace ID
   * @param {string} operationName - Operation name
   * @returns {Object} Span context
   */
  startSpan(traceId, operationName) {
    const trace = this.traces.get(traceId);
    if (!trace) {
      throw new Error(`Trace not found: ${traceId}`);
    }

    const spanId = crypto.randomUUID();
    const span = {
      spanId,
      operationName,
      startTime: Date.now(),
      tags: {},
      logs: []
    };

    trace.spans.push(span);
    return { traceId, spanId };
  }

  /**
   * Finish span with status
   * @param {string} traceId - Trace ID
   * @param {string} spanId - Span ID
   * @param {Object} status - Span status
   */
  finishSpan(traceId, spanId, status = {}) {
    const trace = this.traces.get(traceId);
    if (!trace) return;

    const span = trace.spans.find(s => s.spanId === spanId);
    if (span) {
      span.endTime = Date.now();
      span.duration = span.endTime - span.startTime;
      span.status = status;
    }
  }

  /**
   * Add tags to span
   * @param {string} traceId - Trace ID
   * @param {string} spanId - Span ID
   * @param {Object} tags - Tags to add
   */
  addTags(traceId, spanId, tags) {
    const trace = this.traces.get(traceId);
    if (!trace) return;

    const span = trace.spans.find(s => s.spanId === spanId);
    if (span) {
      Object.assign(span.tags, tags);
    }
  }

  /**
   * Get trace by ID
   * @param {string} traceId - Trace ID
   * @returns {Object} Trace data
   */
  getTrace(traceId) {
    return this.traces.get(traceId);
  }
}

/**
 * Circuit breaker with metrics
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.threshold = options.threshold || 5;
    this.timeout = options.timeout || 60000;
    this.halfOpenTimeout = options.halfOpenTimeout || 30000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.metrics = {
      totalCalls: 0,
      successCalls: 0,
      failureCalls: 0,
      rejectedCalls: 0
    };
  }

  /**
   * Execute function with circuit breaker
   * @param {Function} fn - Function to execute
   * @returns {Promise<any>} Result
   */
  async execute(fn) {
    this.metrics.totalCalls++;

    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.successes = 0;
      } else {
        this.metrics.rejectedCalls++;
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  onSuccess() {
    this.metrics.successCalls++;
    this.successes++;

    if (this.state === 'HALF_OPEN' && this.successes >= 3) {
      this.state = 'CLOSED';
      this.failures = 0;
    }
  }

  /**
   * Handle failed execution
   */
  onFailure() {
    this.metrics.failureCalls++;
    this.failures++;
    this.successes = 0;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  /**
   * Get circuit breaker metrics
   * @returns {Object} Metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      state: this.state,
      failures: this.failures,
      successRate: this.metrics.totalCalls > 0
        ? (this.metrics.successCalls / this.metrics.totalCalls) * 100
        : 0
    };
  }
}

/**
 * Rate limiter for service calls
 */
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if request is allowed
   * @returns {boolean} Whether request is allowed
   */
  isAllowed() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  /**
   * Get current usage
   * @returns {Object} Usage info
   */
  getUsage() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    return {
      current: this.requests.length,
      max: this.maxRequests,
      percentage: (this.requests.length / this.maxRequests) * 100
    };
  }
}

/**
 * Response cache with TTL
 */
class ResponseCache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Get cached response
   * @param {string} key - Cache key
   * @returns {any} Cached value
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.value;
  }

  /**
   * Set cache entry
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   */
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0
    });
  }

  /**
   * Invalidate cache entries matching pattern
   * @param {string|RegExp} pattern - Pattern to match
   */
  invalidate(pattern) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);

    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    let totalHits = 0;
    let entries = 0;

    for (const [, entry] of this.cache) {
      totalHits += entry.hits;
      entries++;
    }

    return {
      entries,
      totalHits,
      averageHits: entries > 0 ? totalHits / entries : 0
    };
  }
}

/**
 * Retry policy with exponential backoff
 */
class RetryPolicy {
  constructor(options = {}) {
    this.maxAttempts = options.maxAttempts || 3;
    this.initialDelay = options.initialDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
  }

  /**
   * Execute function with retry logic
   * @param {Function} fn - Function to execute
   * @returns {Promise<any>} Result
   */
  async execute(fn) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await fn(attempt);
      } catch (error) {
        lastError = error;

        if (attempt < this.maxAttempts) {
          const delay = Math.min(
            this.initialDelay * Math.pow(this.backoffMultiplier, attempt - 1),
            this.maxDelay
          );

          await this.delay(delay);
        }
      }
    }

    throw new Error(`Failed after ${this.maxAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Delay execution
   * @param {number} ms - Milliseconds
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Main AggregatorMS class
 */
class AggregatorMS extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.serviceName = config.serviceName || 'aggregator-ms';

    this.registry = new ServiceRegistry();
    this.tracer = new DistributedTracer();
    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    this.rateLimiter = new RateLimiter(
      config.rateLimit?.maxRequests || 100,
      config.rateLimit?.windowMs || 60000
    );
    this.cache = new ResponseCache(config.cacheTTL);
    this.retryPolicy = new RetryPolicy(config.retry);

    this.metrics = {
      totalAggregations: 0,
      successfulAggregations: 0,
      failedAggregations: 0,
      cachedResponses: 0,
      averageLatency: 0
    };
  }

  /**
   * Register service with instances
   * @param {string} serviceName - Service name
   * @param {Array<Object>} instances - Service instances
   * @returns {Promise<void>}
   */
  async registerService(serviceName, instances) {
    await this.registry.register(serviceName, instances);
  }

  /**
   * Aggregate data from multiple microservices
   * @param {Object} config - Aggregation configuration
   * @returns {Promise<Object>} Aggregated result
   */
  async aggregate(config) {
    if (!this.rateLimiter.isAllowed()) {
      throw new Error('Rate limit exceeded');
    }

    const cacheKey = this.generateCacheKey(config);
    const cached = this.cache.get(cacheKey);

    if (cached) {
      this.metrics.cachedResponses++;
      return cached;
    }

    const { traceId, spanId } = this.tracer.startTrace('aggregate');
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.executeAggregation(config, traceId);
      });

      const latency = Date.now() - startTime;
      this.updateMetrics(true, latency);

      this.tracer.finishSpan(traceId, spanId, { success: true });

      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      const latency = Date.now() - startTime;
      this.updateMetrics(false, latency);

      this.tracer.finishSpan(traceId, spanId, {
        success: false,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Execute aggregation logic
   * @param {Object} config - Configuration
   * @param {string} traceId - Trace ID
   * @returns {Promise<Object>} Result
   */
  async executeAggregation(config, traceId) {
    const { services, strategy = 'parallel', combiner } = config;

    const results = await this.retryPolicy.execute(async (attempt) => {
      if (strategy === 'parallel') {
        return await this.aggregateParallel(services, traceId);
      } else if (strategy === 'sequential') {
        return await this.aggregateSequential(services, traceId);
      } else if (strategy === 'waterfall') {
        return await this.aggregateWaterfall(services, traceId);
      }

      throw new Error(`Unknown strategy: ${strategy}`);
    });

    if (combiner) {
      return combiner(results);
    }

    return results;
  }

  /**
   * Aggregate services in parallel
   * @param {Array<Object>} services - Service configurations
   * @param {string} traceId - Trace ID
   * @returns {Promise<Object>} Results
   */
  async aggregateParallel(services, traceId) {
    const promises = services.map(async (serviceConfig) => {
      const { spanId } = this.tracer.startSpan(traceId, `call-${serviceConfig.name}`);

      try {
        const result = await this.callService(serviceConfig, traceId);
        this.tracer.finishSpan(traceId, spanId, { success: true });
        return { service: serviceConfig.name, success: true, data: result };
      } catch (error) {
        this.tracer.finishSpan(traceId, spanId, {
          success: false,
          error: error.message
        });
        return {
          service: serviceConfig.name,
          success: false,
          error: error.message
        };
      }
    });

    const results = await Promise.all(promises);

    return {
      strategy: 'parallel',
      results,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }

  /**
   * Aggregate services sequentially
   * @param {Array<Object>} services - Service configurations
   * @param {string} traceId - Trace ID
   * @returns {Promise<Object>} Results
   */
  async aggregateSequential(services, traceId) {
    const results = [];

    for (const serviceConfig of services) {
      const { spanId } = this.tracer.startSpan(traceId, `call-${serviceConfig.name}`);

      try {
        const result = await this.callService(serviceConfig, traceId);
        this.tracer.finishSpan(traceId, spanId, { success: true });
        results.push({ service: serviceConfig.name, success: true, data: result });
      } catch (error) {
        this.tracer.finishSpan(traceId, spanId, {
          success: false,
          error: error.message
        });
        results.push({
          service: serviceConfig.name,
          success: false,
          error: error.message
        });
      }
    }

    return {
      strategy: 'sequential',
      results,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }

  /**
   * Aggregate services in waterfall (each depends on previous)
   * @param {Array<Object>} services - Service configurations
   * @param {string} traceId - Trace ID
   * @returns {Promise<Object>} Results
   */
  async aggregateWaterfall(services, traceId) {
    const results = [];
    let context = {};

    for (const serviceConfig of services) {
      const { spanId } = this.tracer.startSpan(traceId, `call-${serviceConfig.name}`);

      try {
        const enrichedConfig = {
          ...serviceConfig,
          context
        };

        const result = await this.callService(enrichedConfig, traceId);
        this.tracer.finishSpan(traceId, spanId, { success: true });

        results.push({ service: serviceConfig.name, success: true, data: result });
        context = { ...context, ...result };
      } catch (error) {
        this.tracer.finishSpan(traceId, spanId, {
          success: false,
          error: error.message
        });

        results.push({
          service: serviceConfig.name,
          success: false,
          error: error.message
        });
        break;
      }
    }

    return {
      strategy: 'waterfall',
      results,
      context,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }

  /**
   * Call individual service
   * @param {Object} serviceConfig - Service configuration
   * @param {string} traceId - Trace ID
   * @returns {Promise<Object>} Result
   */
  async callService(serviceConfig, traceId) {
    const instance = await this.registry.getInstance(
      serviceConfig.name,
      serviceConfig.loadBalancing || 'round-robin'
    );

    await this.delay(Math.random() * 50);

    if (Math.random() < 0.05) {
      throw new Error(`Service ${serviceConfig.name} temporarily unavailable`);
    }

    return {
      service: serviceConfig.name,
      instance: instance.id,
      data: serviceConfig.mockData || { result: 'success' },
      traceId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate cache key from configuration
   * @param {Object} config - Configuration
   * @returns {string} Cache key
   */
  generateCacheKey(config) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(config))
      .digest('hex');
  }

  /**
   * Update metrics
   * @param {boolean} success - Success flag
   * @param {number} latency - Latency
   */
  updateMetrics(success, latency) {
    this.metrics.totalAggregations++;

    if (success) {
      this.metrics.successfulAggregations++;
    } else {
      this.metrics.failedAggregations++;
    }

    this.metrics.averageLatency =
      (this.metrics.averageLatency * (this.metrics.totalAggregations - 1) + latency) /
      this.metrics.totalAggregations;
  }

  /**
   * Get comprehensive metrics
   * @returns {Object} Metrics
   */
  getMetrics() {
    return {
      aggregator: this.metrics,
      circuitBreaker: this.circuitBreaker.getMetrics(),
      rateLimit: this.rateLimiter.getUsage(),
      cache: this.cache.getStats()
    };
  }

  /**
   * Get trace by ID
   * @param {string} traceId - Trace ID
   * @returns {Object} Trace data
   */
  getTrace(traceId) {
    return this.tracer.getTrace(traceId);
  }

  /**
   * Delay helper
   * @param {number} ms - Milliseconds
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AggregatorMS;
