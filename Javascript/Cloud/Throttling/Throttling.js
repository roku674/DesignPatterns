/**
 * Throttling Pattern
 *
 * Controls the consumption of resources by limiting the rate at which operations
 * can be performed. This pattern helps prevent resource exhaustion and ensures
 * fair resource allocation across multiple consumers.
 *
 * Key Concepts:
 * - Token Bucket Algorithm: Tokens accumulate at a fixed rate, operations consume tokens
 * - Leaky Bucket Algorithm: Requests processed at a constant rate, excess requests are queued
 * - Fixed Window: Allows N requests per time window
 * - Sliding Window: More accurate than fixed window, tracks requests over rolling time period
 * - Concurrency Limiting: Limits number of simultaneous operations
 */

class TokenBucket {
  /**
   * Token Bucket throttling algorithm
   * Tokens are added at a fixed rate. Each request consumes tokens.
   * If no tokens available, request is throttled.
   */
  constructor(capacity, refillRate, refillInterval = 1000) {
    if (!capacity || capacity <= 0) {
      throw new Error('Capacity must be a positive number');
    }
    if (!refillRate || refillRate <= 0) {
      throw new Error('Refill rate must be a positive number');
    }

    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.refillInterval = refillInterval;
    this.lastRefillTime = Date.now();
    this.pendingRequests = [];
  }

  /**
   * Attempt to consume tokens for a request
   */
  tryConsume(tokensRequired = 1) {
    this.refill();

    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return {
        allowed: true,
        tokensRemaining: this.tokens,
        retryAfter: null
      };
    }

    const tokensNeeded = tokensRequired - this.tokens;
    const retryAfter = Math.ceil((tokensNeeded / this.refillRate) * this.refillInterval);

    return {
      allowed: false,
      tokensRemaining: this.tokens,
      retryAfter
    };
  }

  /**
   * Refill tokens based on elapsed time
   */
  refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefillTime;
    const intervalsElapsed = Math.floor(timePassed / this.refillInterval);

    if (intervalsElapsed > 0) {
      const tokensToAdd = intervalsElapsed * this.refillRate;
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefillTime = now;
    }
  }

  /**
   * Get current bucket status
   */
  getStatus() {
    this.refill();
    return {
      tokens: this.tokens,
      capacity: this.capacity,
      refillRate: this.refillRate,
      utilizationPercent: ((this.capacity - this.tokens) / this.capacity) * 100
    };
  }
}

class LeakyBucket {
  /**
   * Leaky Bucket throttling algorithm
   * Requests are processed at a constant rate. Excess requests are queued.
   * If queue is full, requests are rejected.
   */
  constructor(capacity, leakRate, leakInterval = 1000) {
    if (!capacity || capacity <= 0) {
      throw new Error('Capacity must be a positive number');
    }
    if (!leakRate || leakRate <= 0) {
      throw new Error('Leak rate must be a positive number');
    }

    this.capacity = capacity;
    this.queue = [];
    this.leakRate = leakRate;
    this.leakInterval = leakInterval;
    this.lastLeakTime = Date.now();
    this.processing = false;
  }

  /**
   * Add request to bucket
   */
  addRequest(request) {
    this.leak();

    if (this.queue.length >= this.capacity) {
      return {
        accepted: false,
        queueSize: this.queue.length,
        reason: 'Queue capacity exceeded'
      };
    }

    this.queue.push({
      request,
      timestamp: Date.now()
    });

    this.startLeaking();

    return {
      accepted: true,
      queueSize: this.queue.length,
      estimatedWaitTime: (this.queue.length / this.leakRate) * this.leakInterval
    };
  }

  /**
   * Process queued requests at fixed rate
   */
  leak() {
    const now = Date.now();
    const timePassed = now - this.lastLeakTime;
    const intervalsElapsed = Math.floor(timePassed / this.leakInterval);

    if (intervalsElapsed > 0) {
      const itemsToLeak = Math.min(
        intervalsElapsed * this.leakRate,
        this.queue.length
      );

      for (let i = 0; i < itemsToLeak; i++) {
        this.queue.shift();
      }

      this.lastLeakTime = now;
    }
  }

  /**
   * Start continuous leaking process
   */
  startLeaking() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    this.leakInterval = setInterval(() => {
      this.leak();

      if (this.queue.length === 0) {
        this.stopLeaking();
      }
    }, this.leakInterval);
  }

  /**
   * Stop leaking process
   */
  stopLeaking() {
    if (this.leakInterval) {
      clearInterval(this.leakInterval);
      this.processing = false;
    }
  }

  /**
   * Get current bucket status
   */
  getStatus() {
    this.leak();
    return {
      queueSize: this.queue.length,
      capacity: this.capacity,
      leakRate: this.leakRate,
      utilizationPercent: (this.queue.length / this.capacity) * 100
    };
  }
}

class FixedWindowCounter {
  /**
   * Fixed Window throttling algorithm
   * Allows N requests per fixed time window
   */
  constructor(maxRequests, windowSize) {
    if (!maxRequests || maxRequests <= 0) {
      throw new Error('Max requests must be a positive number');
    }
    if (!windowSize || windowSize <= 0) {
      throw new Error('Window size must be a positive number');
    }

    this.maxRequests = maxRequests;
    this.windowSize = windowSize;
    this.currentWindow = this.getCurrentWindow();
    this.requestCount = 0;
  }

  /**
   * Get current time window
   */
  getCurrentWindow() {
    return Math.floor(Date.now() / this.windowSize);
  }

  /**
   * Attempt to make a request
   */
  tryRequest() {
    const currentWindow = this.getCurrentWindow();

    if (currentWindow !== this.currentWindow) {
      this.currentWindow = currentWindow;
      this.requestCount = 0;
    }

    if (this.requestCount < this.maxRequests) {
      this.requestCount++;
      return {
        allowed: true,
        remaining: this.maxRequests - this.requestCount,
        resetAt: (this.currentWindow + 1) * this.windowSize
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetAt: (this.currentWindow + 1) * this.windowSize,
      retryAfter: (this.currentWindow + 1) * this.windowSize - Date.now()
    };
  }

  /**
   * Get current window status
   */
  getStatus() {
    const currentWindow = this.getCurrentWindow();

    if (currentWindow !== this.currentWindow) {
      this.currentWindow = currentWindow;
      this.requestCount = 0;
    }

    return {
      requestCount: this.requestCount,
      maxRequests: this.maxRequests,
      windowSize: this.windowSize,
      utilizationPercent: (this.requestCount / this.maxRequests) * 100,
      resetAt: (this.currentWindow + 1) * this.windowSize
    };
  }
}

class SlidingWindowLog {
  /**
   * Sliding Window Log throttling algorithm
   * More accurate than fixed window, tracks each request timestamp
   */
  constructor(maxRequests, windowSize) {
    if (!maxRequests || maxRequests <= 0) {
      throw new Error('Max requests must be a positive number');
    }
    if (!windowSize || windowSize <= 0) {
      throw new Error('Window size must be a positive number');
    }

    this.maxRequests = maxRequests;
    this.windowSize = windowSize;
    this.requestLog = [];
  }

  /**
   * Remove expired entries from log
   */
  cleanupLog() {
    const cutoffTime = Date.now() - this.windowSize;
    this.requestLog = this.requestLog.filter(timestamp => timestamp > cutoffTime);
  }

  /**
   * Attempt to make a request
   */
  tryRequest() {
    this.cleanupLog();

    if (this.requestLog.length < this.maxRequests) {
      this.requestLog.push(Date.now());
      return {
        allowed: true,
        remaining: this.maxRequests - this.requestLog.length,
        oldestRequest: this.requestLog[0]
      };
    }

    const oldestRequest = this.requestLog[0];
    const retryAfter = oldestRequest + this.windowSize - Date.now();

    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(0, retryAfter),
      oldestRequest
    };
  }

  /**
   * Get current status
   */
  getStatus() {
    this.cleanupLog();
    return {
      requestCount: this.requestLog.length,
      maxRequests: this.maxRequests,
      windowSize: this.windowSize,
      utilizationPercent: (this.requestLog.length / this.maxRequests) * 100,
      oldestRequest: this.requestLog[0] || null
    };
  }
}

class ConcurrencyLimiter {
  /**
   * Limits number of concurrent operations
   */
  constructor(maxConcurrent) {
    if (!maxConcurrent || maxConcurrent <= 0) {
      throw new Error('Max concurrent must be a positive number');
    }

    this.maxConcurrent = maxConcurrent;
    this.currentConcurrent = 0;
    this.queue = [];
    this.activeRequests = new Map();
  }

  /**
   * Execute operation with concurrency limit
   */
  async execute(operation, operationId = null) {
    if (!operation) {
      throw new Error('Operation is required');
    }

    const id = operationId || `op-${Date.now()}-${Math.random()}`;

    if (this.currentConcurrent < this.maxConcurrent) {
      return this.executeNow(operation, id);
    }

    return this.enqueue(operation, id);
  }

  /**
   * Execute operation immediately
   */
  async executeNow(operation, id) {
    this.currentConcurrent++;
    const startTime = Date.now();
    this.activeRequests.set(id, { startTime, status: 'running' });

    try {
      const result = await operation();
      this.activeRequests.delete(id);
      return {
        success: true,
        result,
        duration: Date.now() - startTime
      };
    } catch (error) {
      this.activeRequests.delete(id);
      throw error;
    } finally {
      this.currentConcurrent--;
      this.processQueue();
    }
  }

  /**
   * Add operation to queue
   */
  enqueue(operation, id) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        operation,
        id,
        resolve,
        reject,
        enqueuedAt: Date.now()
      });
    });
  }

  /**
   * Process queued operations
   */
  async processQueue() {
    while (this.queue.length > 0 && this.currentConcurrent < this.maxConcurrent) {
      const item = this.queue.shift();

      try {
        const result = await this.executeNow(item.operation, item.id);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      currentConcurrent: this.currentConcurrent,
      maxConcurrent: this.maxConcurrent,
      queueLength: this.queue.length,
      utilizationPercent: (this.currentConcurrent / this.maxConcurrent) * 100,
      activeRequests: Array.from(this.activeRequests.entries()).map(([id, info]) => ({
        id,
        duration: Date.now() - info.startTime,
        status: info.status
      }))
    };
  }
}

/**
 * Main Throttling class that provides multiple throttling strategies
 */
class Throttling {
  constructor(config = {}) {
    const {
      strategy = 'token-bucket',
      capacity = 10,
      rate = 1,
      interval = 1000,
      maxConcurrent = 5
    } = config;

    if (!strategy) {
      throw new Error('Throttling strategy is required');
    }

    this.strategy = strategy;
    this.throttler = this.createThrottler(strategy, {
      capacity,
      rate,
      interval,
      maxConcurrent
    });
  }

  /**
   * Create appropriate throttler based on strategy
   */
  createThrottler(strategy, config) {
    switch (strategy) {
      case 'token-bucket':
        return new TokenBucket(config.capacity, config.rate, config.interval);
      case 'leaky-bucket':
        return new LeakyBucket(config.capacity, config.rate, config.interval);
      case 'fixed-window':
        return new FixedWindowCounter(config.capacity, config.interval);
      case 'sliding-window':
        return new SlidingWindowLog(config.capacity, config.interval);
      case 'concurrency':
        return new ConcurrencyLimiter(config.maxConcurrent);
      default:
        throw new Error(`Unknown throttling strategy: ${strategy}`);
    }
  }

  /**
   * Execute throttled operation
   */
  async execute(operation) {
    if (this.strategy === 'concurrency') {
      return this.throttler.execute(operation);
    }

    const result = this.throttler.tryRequest
      ? this.throttler.tryRequest()
      : this.throttler.tryConsume();

    if (result.allowed || result.accepted) {
      if (typeof operation === 'function') {
        return operation();
      }
      return result;
    }

    throw new Error(`Request throttled. Retry after ${result.retryAfter}ms`);
  }

  /**
   * Get throttler status
   */
  getStatus() {
    return {
      strategy: this.strategy,
      ...this.throttler.getStatus()
    };
  }
}

module.exports = {
  Throttling,
  TokenBucket,
  LeakyBucket,
  FixedWindowCounter,
  SlidingWindowLog,
  ConcurrencyLimiter
};
