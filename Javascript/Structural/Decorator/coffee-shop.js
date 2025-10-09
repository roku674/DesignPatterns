/**
 * Decorator Pattern - REAL Production Implementation
 *
 * Real function decorators with logging, caching, retry logic, validation,
 * performance monitoring, and error handling.
 */

// ============= Function Decorators =============

/**
 * Logging Decorator - Logs function calls with arguments and results
 */
function withLogging(fn, options = {}) {
  const { prefix = '[LOG]', logArgs = true, logResult = true } = options;

  return async function(...args) {
    const functionName = fn.name || 'anonymous';
    const timestamp = new Date().toISOString();

    if (logArgs) {
      console.log(`${prefix} [${timestamp}] Calling ${functionName} with args:`, args);
    } else {
      console.log(`${prefix} [${timestamp}] Calling ${functionName}`);
    }

    try {
      const result = await fn.apply(this, args);

      if (logResult) {
        console.log(`${prefix} [${timestamp}] ${functionName} returned:`, result);
      } else {
        console.log(`${prefix} [${timestamp}] ${functionName} completed successfully`);
      }

      return result;
    } catch (error) {
      console.error(`${prefix} [${timestamp}] ${functionName} threw error:`, error.message);
      throw error;
    }
  };
}

/**
 * Caching Decorator - Caches function results
 */
function withCaching(fn, options = {}) {
  const { ttl = null, maxSize = 100 } = options;
  const cache = new Map();
  const timestamps = new Map();
  let hits = 0;
  let misses = 0;

  const decorator = async function(...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    // Check if cached and not expired
    if (cache.has(key)) {
      const timestamp = timestamps.get(key);
      if (!ttl || (now - timestamp) < ttl) {
        hits++;
        return cache.get(key);
      } else {
        // Cache expired
        cache.delete(key);
        timestamps.delete(key);
      }
    }

    // Cache miss
    misses++;
    const result = await fn.apply(this, args);

    // Store in cache
    if (cache.size >= maxSize) {
      // Remove oldest entry
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
      timestamps.delete(firstKey);
    }

    cache.set(key, result);
    timestamps.set(key, now);

    return result;
  };

  decorator.getCacheStats = () => ({
    hits,
    misses,
    size: cache.size,
    hitRate: hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(2) + '%' : '0%'
  });

  decorator.clearCache = () => {
    cache.clear();
    timestamps.clear();
    hits = 0;
    misses = 0;
  };

  return decorator;
}

/**
 * Retry Decorator - Retries failed operations
 */
function withRetry(fn, options = {}) {
  const { maxRetries = 3, delay = 1000, backoff = 2 } = options;

  return async function(...args) {
    let lastError;
    let currentDelay = delay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          console.log(`Attempt ${attempt + 1} failed. Retrying in ${currentDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay *= backoff;
        }
      }
    }

    throw new Error(`Failed after ${maxRetries + 1} attempts: ${lastError.message}`);
  };
}

/**
 * Validation Decorator - Validates function arguments
 */
function withValidation(fn, validators) {
  return async function(...args) {
    // Validate each argument
    for (let i = 0; i < validators.length; i++) {
      const validator = validators[i];
      const arg = args[i];

      if (!validator(arg)) {
        throw new Error(`Validation failed for argument ${i}: ${arg}`);
      }
    }

    return await fn.apply(this, args);
  };
}

/**
 * Performance Monitoring Decorator
 */
function withPerformanceMonitoring(fn, options = {}) {
  const { threshold = 1000, warn = true } = options;
  const metrics = {
    calls: 0,
    totalTime: 0,
    avgTime: 0,
    minTime: Infinity,
    maxTime: 0
  };

  const decorator = async function(...args) {
    const start = Date.now();

    try {
      const result = await fn.apply(this, args);
      const duration = Date.now() - start;

      // Update metrics
      metrics.calls++;
      metrics.totalTime += duration;
      metrics.avgTime = metrics.totalTime / metrics.calls;
      metrics.minTime = Math.min(metrics.minTime, duration);
      metrics.maxTime = Math.max(metrics.maxTime, duration);

      if (warn && duration > threshold) {
        console.warn(`Performance warning: ${fn.name} took ${duration}ms (threshold: ${threshold}ms)`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      metrics.calls++;
      metrics.totalTime += duration;
      throw error;
    }
  };

  decorator.getMetrics = () => ({ ...metrics });

  decorator.resetMetrics = () => {
    metrics.calls = 0;
    metrics.totalTime = 0;
    metrics.avgTime = 0;
    metrics.minTime = Infinity;
    metrics.maxTime = 0;
  };

  return decorator;
}

/**
 * Error Handling Decorator - Wraps function with error handling
 */
function withErrorHandling(fn, errorHandler) {
  return async function(...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      return errorHandler(error, args);
    }
  };
}

/**
 * Rate Limiting Decorator
 */
function withRateLimit(fn, options = {}) {
  const { maxCalls = 10, timeWindow = 1000 } = options;
  const calls = [];

  return async function(...args) {
    const now = Date.now();

    // Remove old calls outside time window
    while (calls.length > 0 && calls[0] < now - timeWindow) {
      calls.shift();
    }

    // Check if rate limit exceeded
    if (calls.length >= maxCalls) {
      throw new Error(`Rate limit exceeded: max ${maxCalls} calls per ${timeWindow}ms`);
    }

    calls.push(now);
    return await fn.apply(this, args);
  };
}

/**
 * Debounce Decorator - Delays execution until calls stop
 */
function withDebounce(fn, delay = 300) {
  let timeoutId;

  return function(...args) {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}

/**
 * Throttle Decorator - Limits execution frequency
 */
function withThrottle(fn, delay = 1000) {
  let lastCall = 0;
  let timeoutId;

  return async function(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      return await fn.apply(this, args);
    } else {
      return new Promise((resolve, reject) => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(async () => {
          lastCall = Date.now();
          try {
            const result = await fn.apply(this, args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay - timeSinceLastCall);
      });
    }
  };
}

/**
 * Compose multiple decorators
 */
function compose(...decorators) {
  return function(fn) {
    return decorators.reduceRight((decorated, decorator) => {
      return decorator(decorated);
    }, fn);
  };
}

// ============= Real World Example - API Client =============

class APIClient {
  async fetchUser(userId) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    if (Math.random() < 0.2) {
      throw new Error('Network error');
    }

    return {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      timestamp: Date.now()
    };
  }

  async createUser(userData) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 150));

    return {
      id: Math.floor(Math.random() * 1000),
      ...userData,
      createdAt: new Date().toISOString()
    };
  }

  async deleteUser(userId) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 80));

    return { success: true, deletedId: userId };
  }
}

// Decorate the API client methods
function createDecoratedAPIClient() {
  const client = new APIClient();

  // Decorate fetchUser with caching, logging, retry, and performance monitoring
  client.fetchUser = compose(
    fn => withLogging(fn, { prefix: '[API]' }),
    fn => withCaching(fn, { ttl: 5000, maxSize: 50 }),
    fn => withRetry(fn, { maxRetries: 2, delay: 500 }),
    fn => withPerformanceMonitoring(fn, { threshold: 200 })
  )(client.fetchUser.bind(client));

  // Decorate createUser with validation, logging, and rate limiting
  client.createUser = compose(
    fn => withLogging(fn, { prefix: '[API]' }),
    fn => withValidation(fn, [
      data => data && typeof data === 'object',
      data => data.name && data.name.length > 0,
      data => data.email && data.email.includes('@')
    ]),
    fn => withRateLimit(fn, { maxCalls: 5, timeWindow: 1000 })
  )(client.createUser.bind(client));

  // Decorate deleteUser with error handling and logging
  client.deleteUser = compose(
    fn => withLogging(fn, { prefix: '[API]' }),
    fn => withErrorHandling(fn, (error) => {
      console.error('Delete failed:', error.message);
      return { success: false, error: error.message };
    })
  )(client.deleteUser.bind(client));

  return client;
}

module.exports = {
  withLogging,
  withCaching,
  withRetry,
  withValidation,
  withPerformanceMonitoring,
  withErrorHandling,
  withRateLimit,
  withDebounce,
  withThrottle,
  compose,
  APIClient,
  createDecoratedAPIClient
};
