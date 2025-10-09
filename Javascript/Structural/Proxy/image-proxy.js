/**
 * Proxy Pattern - REAL Production Implementation
 *
 * Real proxy implementations with caching, lazy loading, access control,
 * logging, and performance monitoring.
 */

const crypto = require('crypto');

// ============= Subject Interface =============

class Resource {
  async load() {
    throw new Error('Method load() must be implemented');
  }

  async getData() {
    throw new Error('Method getData() must be implemented');
  }
}

// ============= Real Subject =============

class ExpensiveResource extends Resource {
  constructor(id, data) {
    super();
    this.id = id;
    this.rawData = data;
    this.loaded = false;
    this.loadTime = 0;
  }

  async load() {
    const start = Date.now();
    // Simulate expensive loading operation
    await new Promise(resolve => setTimeout(resolve, 200));

    this.loaded = true;
    this.loadTime = Date.now() - start;

    return { success: true, loadTime: this.loadTime };
  }

  async getData() {
    if (!this.loaded) {
      throw new Error('Resource not loaded');
    }

    return {
      id: this.id,
      data: this.rawData,
      timestamp: Date.now()
    };
  }

  isLoaded() {
    return this.loaded;
  }
}

// ============= Virtual Proxy (Lazy Loading) =============

class LazyResourceProxy extends Resource {
  constructor(id, data) {
    super();
    this.id = id;
    this.data = data;
    this.resource = null;
    this.loadAttempts = 0;
  }

  async load() {
    if (this.resource === null) {
      this.loadAttempts++;
      this.resource = new ExpensiveResource(this.id, this.data);
      return await this.resource.load();
    }

    return { success: true, cached: true };
  }

  async getData() {
    if (this.resource === null) {
      await this.load();
    }

    return await this.resource.getData();
  }

  isLoaded() {
    return this.resource !== null && this.resource.isLoaded();
  }

  getLoadAttempts() {
    return this.loadAttempts;
  }
}

// ============= Caching Proxy =============

class CachingProxy {
  constructor(target, options = {}) {
    this.target = target;
    this.cache = new Map();
    this.timestamps = new Map();
    this.ttl = options.ttl || 5000;
    this.maxSize = options.maxSize || 100;
    this.hits = 0;
    this.misses = 0;
  }

  async execute(methodName, ...args) {
    const cacheKey = this.generateCacheKey(methodName, args);

    // Check cache
    if (this.cache.has(cacheKey)) {
      const timestamp = this.timestamps.get(cacheKey);
      if (Date.now() - timestamp < this.ttl) {
        this.hits++;
        return { ...this.cache.get(cacheKey), cached: true };
      } else {
        // Expired
        this.cache.delete(cacheKey);
        this.timestamps.delete(cacheKey);
      }
    }

    // Cache miss - execute method
    this.misses++;

    if (typeof this.target[methodName] !== 'function') {
      throw new Error(`Method ${methodName} does not exist on target`);
    }

    const result = await this.target[methodName](...args);

    // Store in cache
    this.storeInCache(cacheKey, result);

    return { ...result, cached: false };
  }

  generateCacheKey(methodName, args) {
    const argsHash = crypto
      .createHash('md5')
      .update(JSON.stringify(args))
      .digest('hex');

    return `${methodName}:${argsHash}`;
  }

  storeInCache(key, value) {
    // Evict oldest if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.timestamps.delete(oldestKey);
    }

    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
  }

  invalidate(methodName = null) {
    if (methodName) {
      // Invalidate specific method cache
      for (const key of this.cache.keys()) {
        if (key.startsWith(methodName + ':')) {
          this.cache.delete(key);
          this.timestamps.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
      this.timestamps.clear();
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0
        ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

// ============= Protection Proxy (Access Control) =============

class ProtectionProxy {
  constructor(target, permissions) {
    this.target = target;
    this.permissions = permissions;
    this.accessLog = [];
  }

  checkPermission(userId, action) {
    const userPerms = this.permissions[userId] || [];
    return userPerms.includes(action) || userPerms.includes('*');
  }

  async execute(userId, methodName, ...args) {
    const timestamp = Date.now();

    // Log access attempt
    this.accessLog.push({
      userId,
      methodName,
      timestamp,
      granted: false
    });

    // Check permission
    if (!this.checkPermission(userId, methodName)) {
      this.accessLog[this.accessLog.length - 1].granted = false;
      throw new Error(`Access denied: User ${userId} cannot execute ${methodName}`);
    }

    // Permission granted
    this.accessLog[this.accessLog.length - 1].granted = true;

    if (typeof this.target[methodName] !== 'function') {
      throw new Error(`Method ${methodName} does not exist on target`);
    }

    return await this.target[methodName](...args);
  }

  getAccessLog() {
    return [...this.accessLog];
  }

  getAccessStats(userId = null) {
    const logs = userId
      ? this.accessLog.filter(log => log.userId === userId)
      : this.accessLog;

    return {
      total: logs.length,
      granted: logs.filter(log => log.granted).length,
      denied: logs.filter(log => !log.granted).length
    };
  }
}

// ============= Logging Proxy =============

class LoggingProxy {
  constructor(target, options = {}) {
    this.target = target;
    this.logLevel = options.logLevel || 'info';
    this.logs = [];
  }

  async execute(methodName, ...args) {
    const startTime = Date.now();

    this.log('info', `Executing ${methodName}`, { args });

    try {
      const result = await this.target[methodName](...args);
      const duration = Date.now() - startTime;

      this.log('info', `${methodName} completed`, { duration, result });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.log('error', `${methodName} failed`, { duration, error: error.message });

      throw error;
    }
  }

  log(level, message, data) {
    const entry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    this.logs.push(entry);

    if (this.shouldLog(level)) {
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
  }

  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  getLogs(level = null) {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }
}

// ============= Performance Monitoring Proxy =============

class PerformanceProxy {
  constructor(target) {
    this.target = target;
    this.metrics = new Map();
  }

  async execute(methodName, ...args) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const result = await this.target[methodName](...args);

      this.recordMetric(methodName, {
        duration: Date.now() - startTime,
        memoryDelta: process.memoryUsage().heapUsed - startMemory,
        success: true
      });

      return result;
    } catch (error) {
      this.recordMetric(methodName, {
        duration: Date.now() - startTime,
        memoryDelta: process.memoryUsage().heapUsed - startMemory,
        success: false
      });

      throw error;
    }
  }

  recordMetric(methodName, data) {
    if (!this.metrics.has(methodName)) {
      this.metrics.set(methodName, {
        calls: 0,
        totalDuration: 0,
        totalMemory: 0,
        successes: 0,
        failures: 0,
        minDuration: Infinity,
        maxDuration: 0
      });
    }

    const metric = this.metrics.get(methodName);
    metric.calls++;
    metric.totalDuration += data.duration;
    metric.totalMemory += data.memoryDelta;
    metric.minDuration = Math.min(metric.minDuration, data.duration);
    metric.maxDuration = Math.max(metric.maxDuration, data.duration);

    if (data.success) {
      metric.successes++;
    } else {
      metric.failures++;
    }
  }

  getMetrics(methodName = null) {
    if (methodName) {
      const metric = this.metrics.get(methodName);
      if (!metric) return null;

      return {
        ...metric,
        avgDuration: metric.totalDuration / metric.calls,
        avgMemory: metric.totalMemory / metric.calls,
        successRate: (metric.successes / metric.calls * 100).toFixed(2) + '%'
      };
    }

    const result = {};
    for (const [name, metric] of this.metrics) {
      result[name] = {
        ...metric,
        avgDuration: metric.totalDuration / metric.calls,
        avgMemory: metric.totalMemory / metric.calls,
        successRate: (metric.successes / metric.calls * 100).toFixed(2) + '%'
      };
    }

    return result;
  }
}

// ============= Real World Example - API Client with Proxies =============

class APIClient {
  async fetchData(endpoint) {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      endpoint,
      data: { message: 'Data from ' + endpoint },
      timestamp: Date.now()
    };
  }

  async postData(endpoint, payload) {
    await new Promise(resolve => setTimeout(resolve, 150));

    return {
      endpoint,
      payload,
      success: true,
      timestamp: Date.now()
    };
  }

  async deleteData(endpoint) {
    await new Promise(resolve => setTimeout(resolve, 80));

    return {
      endpoint,
      deleted: true,
      timestamp: Date.now()
    };
  }
}

function createProxiedAPIClient(permissions) {
  const client = new APIClient();

  // Wrap with multiple proxies
  const cachingProxy = new CachingProxy(client, { ttl: 5000 });
  const protectionProxy = new ProtectionProxy(cachingProxy, permissions);
  const loggingProxy = new LoggingProxy(protectionProxy);
  const performanceProxy = new PerformanceProxy(loggingProxy);

  return {
    client: performanceProxy,
    getCacheStats: () => cachingProxy.getStats(),
    getAccessLog: () => protectionProxy.getAccessLog(),
    getLogs: () => loggingProxy.getLogs(),
    getMetrics: () => performanceProxy.getMetrics()
  };
}

module.exports = {
  Resource,
  ExpensiveResource,
  LazyResourceProxy,
  CachingProxy,
  ProtectionProxy,
  LoggingProxy,
  PerformanceProxy,
  APIClient,
  createProxiedAPIClient
};
