/**
 * SmartProxy Pattern
 *
 * Acts as an intelligent intermediary between client and service, providing:
 * - Caching for performance optimization
 * - Lazy loading to defer expensive operations
 * - Access control and authorization
 * - Logging and monitoring
 * - Request validation and transformation
 * - Connection pooling and resource management
 *
 * Use cases:
 * - Remote service access with caching
 * - Database query optimization
 * - API rate limiting and throttling
 * - Resource-intensive object creation
 */

const crypto = require('crypto');

class SmartProxy {
  constructor(config = {}) {
    this.realSubject = config.realSubject || null;
    this.cacheEnabled = config.cacheEnabled !== false;
    this.cacheTTL = config.cacheTTL || 60000; // 1 minute default
    this.maxCacheSize = config.maxCacheSize || 100;
    this.lazyLoadEnabled = config.lazyLoadEnabled !== false;
    this.accessControlEnabled = config.accessControlEnabled || false;
    this.loggingEnabled = config.loggingEnabled !== false;
    this.metricsEnabled = config.metricsEnabled !== false;
    this.requestValidation = config.requestValidation || null;
    this.responseTransform = config.responseTransform || null;

    // Cache storage
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;

    // Access control
    this.authorizedUsers = new Set(config.authorizedUsers || []);
    this.accessLog = [];

    // Performance metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      responseTimes: [],
      cacheHitRate: 0
    };

    // Lazy loading state
    this.isLoaded = !this.lazyLoadEnabled;
    this.loadPromise = null;

    // Request queue for throttling
    this.requestQueue = [];
    this.maxConcurrentRequests = config.maxConcurrentRequests || 10;
    this.currentRequests = 0;

    // Logging
    this.logs = [];
    this.maxLogSize = config.maxLogSize || 1000;
  }

  /**
   * Main proxy method for accessing the real subject
   */
  async execute(method, ...args) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Validate request if validation function provided
      if (this.requestValidation && !this.requestValidation(method, ...args)) {
        throw new Error(`Request validation failed for method: ${method}`);
      }

      // Check cache first
      if (this.cacheEnabled) {
        const cacheKey = this.generateCacheKey(method, ...args);
        const cachedResult = this.getFromCache(cacheKey);

        if (cachedResult !== null) {
          this.log('info', `Cache hit for ${method}`, { cacheKey });
          this.metrics.successfulRequests++;
          this.updateMetrics(startTime);
          return cachedResult;
        }

        this.cacheMisses++;
        this.log('debug', `Cache miss for ${method}`, { cacheKey });
      }

      // Ensure subject is loaded (lazy loading)
      await this.ensureLoaded();

      // Check concurrent request limit
      await this.throttleRequest();

      this.currentRequests++;

      try {
        // Execute on real subject
        let result;
        if (typeof this.realSubject[method] === 'function') {
          result = await this.realSubject[method](...args);
        } else {
          throw new Error(`Method ${method} not found on real subject`);
        }

        // Transform response if transformer provided
        if (this.responseTransform) {
          result = this.responseTransform(result);
        }

        // Cache the result
        if (this.cacheEnabled) {
          const cacheKey = this.generateCacheKey(method, ...args);
          this.addToCache(cacheKey, result);
        }

        this.metrics.successfulRequests++;
        this.log('info', `Successfully executed ${method}`, {
          method,
          duration: Date.now() - startTime
        });

        return result;

      } finally {
        this.currentRequests--;
        this.processQueue();
      }

    } catch (error) {
      this.metrics.failedRequests++;
      this.log('error', `Failed to execute ${method}`, {
        method,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;

    } finally {
      this.updateMetrics(startTime);
    }
  }

  /**
   * Lazy load the real subject if not already loaded
   */
  async ensureLoaded() {
    if (this.isLoaded) {
      return;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadRealSubject();

    try {
      await this.loadPromise;
      this.isLoaded = true;
      this.log('info', 'Real subject loaded successfully');
    } catch (error) {
      this.loadPromise = null;
      this.log('error', 'Failed to load real subject', { error: error.message });
      throw error;
    }
  }

  /**
   * Load the real subject (override in subclass for custom loading)
   */
  async loadRealSubject() {
    if (!this.realSubject) {
      throw new Error('Real subject not configured');
    }

    // Simulate loading time for expensive resources
    if (typeof this.realSubject.initialize === 'function') {
      await this.realSubject.initialize();
    }
  }

  /**
   * Check access control
   */
  checkAccess(userId) {
    if (!this.accessControlEnabled) {
      return true;
    }

    const hasAccess = this.authorizedUsers.has(userId);

    this.accessLog.push({
      userId,
      timestamp: Date.now(),
      granted: hasAccess
    });

    // Trim access log if too large
    if (this.accessLog.length > this.maxLogSize) {
      this.accessLog = this.accessLog.slice(-this.maxLogSize / 2);
    }

    return hasAccess;
  }

  /**
   * Grant access to a user
   */
  grantAccess(userId) {
    this.authorizedUsers.add(userId);
    this.log('info', `Access granted to user: ${userId}`);
  }

  /**
   * Revoke access from a user
   */
  revokeAccess(userId) {
    this.authorizedUsers.delete(userId);
    this.log('info', `Access revoked for user: ${userId}`);
  }

  /**
   * Generate cache key from method and arguments
   */
  generateCacheKey(method, ...args) {
    const data = JSON.stringify({ method, args });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Get value from cache
   */
  getFromCache(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const timestamp = this.cacheTimestamps.get(key);
    const now = Date.now();

    // Check if cache entry has expired
    if (now - timestamp > this.cacheTTL) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }

    this.cacheHits++;
    return this.cache.get(key);
  }

  /**
   * Add value to cache
   */
  addToCache(key, value) {
    // Enforce cache size limit (LRU eviction)
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.cacheTimestamps.delete(firstKey);
    }

    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
  }

  /**
   * Clear all cache entries
   */
  clearCache() {
    const size = this.cache.size;
    this.cache.clear();
    this.cacheTimestamps.clear();
    this.log('info', `Cache cleared: ${size} entries removed`);
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const now = Date.now();
    let cleared = 0;

    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > this.cacheTTL) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      this.log('info', `Cleared ${cleared} expired cache entries`);
    }
  }

  /**
   * Throttle requests to prevent overwhelming the real subject
   */
  async throttleRequest() {
    if (this.currentRequests < this.maxConcurrentRequests) {
      return;
    }

    return new Promise((resolve) => {
      this.requestQueue.push(resolve);
    });
  }

  /**
   * Process queued requests
   */
  processQueue() {
    while (
      this.requestQueue.length > 0 &&
      this.currentRequests < this.maxConcurrentRequests
    ) {
      const resolve = this.requestQueue.shift();
      resolve();
    }
  }

  /**
   * Update performance metrics
   */
  updateMetrics(startTime) {
    const duration = Date.now() - startTime;
    this.metrics.responseTimes.push(duration);

    // Keep only last 100 response times for average calculation
    if (this.metrics.responseTimes.length > 100) {
      this.metrics.responseTimes = this.metrics.responseTimes.slice(-100);
    }

    // Calculate average response time
    const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
    this.metrics.averageResponseTime = sum / this.metrics.responseTimes.length;

    // Calculate cache hit rate
    const totalCacheAccesses = this.cacheHits + this.cacheMisses;
    this.metrics.cacheHitRate = totalCacheAccesses > 0
      ? (this.cacheHits / totalCacheAccesses) * 100
      : 0;
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      queuedRequests: this.requestQueue.length,
      currentRequests: this.currentRequests
    };
  }

  /**
   * Log a message
   */
  log(level, message, metadata = {}) {
    if (!this.loggingEnabled && level !== 'error') {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata
    };

    this.logs.push(logEntry);

    // Trim logs if too large
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize / 2);
    }

    // Console output for errors
    if (level === 'error') {
      console.error(`[SmartProxy] ${message}`, metadata);
    }
  }

  /**
   * Get logs
   */
  getLogs(level = null) {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Get access log
   */
  getAccessLog() {
    return [...this.accessLog];
  }

  /**
   * Reset all state
   */
  reset() {
    this.clearCache();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      responseTimes: [],
      cacheHitRate: 0
    };
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.logs = [];
    this.accessLog = [];
    this.requestQueue = [];
    this.currentRequests = 0;
    this.log('info', 'SmartProxy state reset');
  }
}

module.exports = SmartProxy;
