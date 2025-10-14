/**
 * Rate Limiting Pattern
 *
 * Controls the rate at which requests are processed to prevent system overload,
 * ensure fair usage, and protect against abuse. Rate limiting is essential for
 * API management, DDoS protection, and resource management.
 *
 * Key Concepts:
 * - Per-User Rate Limiting: Separate limits for each user/client
 * - Global Rate Limiting: Overall system-wide rate limits
 * - Distributed Rate Limiting: Rate limiting across multiple servers
 * - Adaptive Rate Limiting: Dynamic limits based on system load
 * - Tiered Rate Limiting: Different limits for different user tiers
 */

/**
 * Per-User Rate Limiter
 * Tracks rate limits separately for each user/client
 */
class PerUserRateLimiter {
  constructor(maxRequests, windowSize, cleanupInterval = 60000) {
    if (!maxRequests || maxRequests <= 0) {
      throw new Error('Max requests must be a positive number');
    }
    if (!windowSize || windowSize <= 0) {
      throw new Error('Window size must be a positive number');
    }

    this.maxRequests = maxRequests;
    this.windowSize = windowSize;
    this.users = new Map();
    this.cleanupInterval = cleanupInterval;

    this.startCleanup();
  }

  /**
   * Check if request is allowed for user
   */
  allowRequest(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const now = Date.now();

    if (!this.users.has(userId)) {
      this.users.set(userId, {
        requests: [now],
        firstRequest: now
      });

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetAt: now + this.windowSize,
        userId
      };
    }

    const userData = this.users.get(userId);
    const windowStart = now - this.windowSize;

    userData.requests = userData.requests.filter(timestamp => timestamp > windowStart);

    if (userData.requests.length < this.maxRequests) {
      userData.requests.push(now);

      return {
        allowed: true,
        remaining: this.maxRequests - userData.requests.length,
        resetAt: userData.requests[0] + this.windowSize,
        userId
      };
    }

    const oldestRequest = userData.requests[0];
    const retryAfter = oldestRequest + this.windowSize - now;

    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      resetAt: oldestRequest + this.windowSize,
      userId
    };
  }

  /**
   * Get user rate limit status
   */
  getUserStatus(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!this.users.has(userId)) {
      return {
        userId,
        requestCount: 0,
        maxRequests: this.maxRequests,
        remaining: this.maxRequests,
        utilizationPercent: 0
      };
    }

    const now = Date.now();
    const userData = this.users.get(userId);
    const windowStart = now - this.windowSize;

    userData.requests = userData.requests.filter(timestamp => timestamp > windowStart);

    return {
      userId,
      requestCount: userData.requests.length,
      maxRequests: this.maxRequests,
      remaining: this.maxRequests - userData.requests.length,
      utilizationPercent: (userData.requests.length / this.maxRequests) * 100,
      oldestRequest: userData.requests[0] || null
    };
  }

  /**
   * Reset rate limit for user
   */
  resetUser(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    this.users.delete(userId);
  }

  /**
   * Start periodic cleanup of expired data
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const cutoffTime = now - this.windowSize - 60000;

      for (const [userId, userData] of this.users.entries()) {
        if (userData.requests.length === 0 || userData.requests[userData.requests.length - 1] < cutoffTime) {
          this.users.delete(userId);
        }
      }
    }, this.cleanupInterval);
  }

  /**
   * Stop cleanup timer
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  /**
   * Get overall statistics
   */
  getStats() {
    return {
      totalUsers: this.users.size,
      maxRequests: this.maxRequests,
      windowSize: this.windowSize,
      users: Array.from(this.users.keys()).map(userId => this.getUserStatus(userId))
    };
  }
}

/**
 * Global Rate Limiter
 * System-wide rate limiting across all users
 */
class GlobalRateLimiter {
  constructor(maxRequests, windowSize) {
    if (!maxRequests || maxRequests <= 0) {
      throw new Error('Max requests must be a positive number');
    }
    if (!windowSize || windowSize <= 0) {
      throw new Error('Window size must be a positive number');
    }

    this.maxRequests = maxRequests;
    this.windowSize = windowSize;
    this.requests = [];
  }

  /**
   * Check if request is allowed
   */
  allowRequest() {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    this.requests = this.requests.filter(timestamp => timestamp > windowStart);

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);

      return {
        allowed: true,
        remaining: this.maxRequests - this.requests.length,
        resetAt: this.requests[0] + this.windowSize
      };
    }

    const oldestRequest = this.requests[0];
    const retryAfter = oldestRequest + this.windowSize - now;

    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      resetAt: oldestRequest + this.windowSize
    };
  }

  /**
   * Get current status
   */
  getStatus() {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    this.requests = this.requests.filter(timestamp => timestamp > windowStart);

    return {
      requestCount: this.requests.length,
      maxRequests: this.maxRequests,
      remaining: this.maxRequests - this.requests.length,
      utilizationPercent: (this.requests.length / this.maxRequests) * 100,
      windowSize: this.windowSize,
      oldestRequest: this.requests[0] || null
    };
  }

  /**
   * Reset all rate limits
   */
  reset() {
    this.requests = [];
  }
}

/**
 * Adaptive Rate Limiter
 * Adjusts rate limits dynamically based on system load
 */
class AdaptiveRateLimiter {
  constructor(baseMaxRequests, windowSize, loadThresholds = {}) {
    if (!baseMaxRequests || baseMaxRequests <= 0) {
      throw new Error('Base max requests must be a positive number');
    }
    if (!windowSize || windowSize <= 0) {
      throw new Error('Window size must be a positive number');
    }

    this.baseMaxRequests = baseMaxRequests;
    this.currentMaxRequests = baseMaxRequests;
    this.windowSize = windowSize;
    this.requests = [];

    this.loadThresholds = {
      low: { load: 0.3, multiplier: 1.5 },
      medium: { load: 0.6, multiplier: 1.0 },
      high: { load: 0.85, multiplier: 0.7 },
      critical: { load: 0.95, multiplier: 0.5 },
      ...loadThresholds
    };

    this.currentLoad = 0;
  }

  /**
   * Update system load and adjust rate limit
   */
  updateLoad(load) {
    if (typeof load !== 'number' || load < 0 || load > 1) {
      throw new Error('Load must be a number between 0 and 1');
    }

    this.currentLoad = load;

    let multiplier = 1.0;

    if (load >= this.loadThresholds.critical.load) {
      multiplier = this.loadThresholds.critical.multiplier;
    } else if (load >= this.loadThresholds.high.load) {
      multiplier = this.loadThresholds.high.multiplier;
    } else if (load >= this.loadThresholds.medium.load) {
      multiplier = this.loadThresholds.medium.multiplier;
    } else if (load <= this.loadThresholds.low.load) {
      multiplier = this.loadThresholds.low.multiplier;
    }

    this.currentMaxRequests = Math.floor(this.baseMaxRequests * multiplier);
  }

  /**
   * Check if request is allowed
   */
  allowRequest() {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    this.requests = this.requests.filter(timestamp => timestamp > windowStart);

    if (this.requests.length < this.currentMaxRequests) {
      this.requests.push(now);

      return {
        allowed: true,
        remaining: this.currentMaxRequests - this.requests.length,
        currentMaxRequests: this.currentMaxRequests,
        currentLoad: this.currentLoad,
        resetAt: this.requests[0] + this.windowSize
      };
    }

    const oldestRequest = this.requests[0];
    const retryAfter = oldestRequest + this.windowSize - now;

    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      currentMaxRequests: this.currentMaxRequests,
      currentLoad: this.currentLoad,
      resetAt: oldestRequest + this.windowSize
    };
  }

  /**
   * Get current status
   */
  getStatus() {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    this.requests = this.requests.filter(timestamp => timestamp > windowStart);

    return {
      requestCount: this.requests.length,
      baseMaxRequests: this.baseMaxRequests,
      currentMaxRequests: this.currentMaxRequests,
      remaining: this.currentMaxRequests - this.requests.length,
      currentLoad: this.currentLoad,
      utilizationPercent: (this.requests.length / this.currentMaxRequests) * 100,
      windowSize: this.windowSize
    };
  }
}

/**
 * Tiered Rate Limiter
 * Different rate limits for different user tiers (free, premium, enterprise)
 */
class TieredRateLimiter {
  constructor(tiers, windowSize) {
    if (!tiers || Object.keys(tiers).length === 0) {
      throw new Error('Tiers configuration is required');
    }
    if (!windowSize || windowSize <= 0) {
      throw new Error('Window size must be a positive number');
    }

    this.tiers = tiers;
    this.windowSize = windowSize;
    this.users = new Map();
  }

  /**
   * Check if request is allowed for user with tier
   */
  allowRequest(userId, tier = 'free') {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!this.tiers[tier]) {
      throw new Error(`Unknown tier: ${tier}`);
    }

    const maxRequests = this.tiers[tier];
    const now = Date.now();
    const userKey = `${userId}:${tier}`;

    if (!this.users.has(userKey)) {
      this.users.set(userKey, {
        requests: [now],
        tier
      });

      return {
        allowed: true,
        remaining: maxRequests - 1,
        tier,
        maxRequests,
        resetAt: now + this.windowSize,
        userId
      };
    }

    const userData = this.users.get(userKey);
    const windowStart = now - this.windowSize;

    userData.requests = userData.requests.filter(timestamp => timestamp > windowStart);

    if (userData.requests.length < maxRequests) {
      userData.requests.push(now);

      return {
        allowed: true,
        remaining: maxRequests - userData.requests.length,
        tier,
        maxRequests,
        resetAt: userData.requests[0] + this.windowSize,
        userId
      };
    }

    const oldestRequest = userData.requests[0];
    const retryAfter = oldestRequest + this.windowSize - now;

    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      tier,
      maxRequests,
      resetAt: oldestRequest + this.windowSize,
      userId
    };
  }

  /**
   * Get user status
   */
  getUserStatus(userId, tier = 'free') {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!this.tiers[tier]) {
      throw new Error(`Unknown tier: ${tier}`);
    }

    const maxRequests = this.tiers[tier];
    const userKey = `${userId}:${tier}`;

    if (!this.users.has(userKey)) {
      return {
        userId,
        tier,
        requestCount: 0,
        maxRequests,
        remaining: maxRequests,
        utilizationPercent: 0
      };
    }

    const now = Date.now();
    const userData = this.users.get(userKey);
    const windowStart = now - this.windowSize;

    userData.requests = userData.requests.filter(timestamp => timestamp > windowStart);

    return {
      userId,
      tier,
      requestCount: userData.requests.length,
      maxRequests,
      remaining: maxRequests - userData.requests.length,
      utilizationPercent: (userData.requests.length / maxRequests) * 100
    };
  }

  /**
   * Get all tiers configuration
   */
  getTiers() {
    return { ...this.tiers };
  }

  /**
   * Update tier configuration
   */
  updateTier(tier, maxRequests) {
    if (!tier) {
      throw new Error('Tier name is required');
    }
    if (!maxRequests || maxRequests <= 0) {
      throw new Error('Max requests must be a positive number');
    }

    this.tiers[tier] = maxRequests;
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      totalUsers: this.users.size,
      tiers: {},
      windowSize: this.windowSize
    };

    for (const tier of Object.keys(this.tiers)) {
      stats.tiers[tier] = {
        maxRequests: this.tiers[tier],
        userCount: 0
      };
    }

    for (const [userKey, userData] of this.users.entries()) {
      const tier = userData.tier;
      if (stats.tiers[tier]) {
        stats.tiers[tier].userCount++;
      }
    }

    return stats;
  }
}

/**
 * Distributed Rate Limiter (Simulation)
 * Rate limiting across multiple servers using shared state
 */
class DistributedRateLimiter {
  constructor(maxRequests, windowSize, nodeId) {
    if (!maxRequests || maxRequests <= 0) {
      throw new Error('Max requests must be a positive number');
    }
    if (!windowSize || windowSize <= 0) {
      throw new Error('Window size must be a positive number');
    }
    if (!nodeId) {
      throw new Error('Node ID is required');
    }

    this.maxRequests = maxRequests;
    this.windowSize = windowSize;
    this.nodeId = nodeId;
    this.sharedState = new Map();
    this.localCache = new Map();
    this.syncInterval = 1000;

    this.startSync();
  }

  /**
   * Check if request is allowed (with distributed coordination)
   */
  allowRequest(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const now = Date.now();
    const globalState = this.getGlobalState(userId);
    const windowStart = now - this.windowSize;

    const allRequests = globalState.nodes
      .flatMap(node => node.requests)
      .filter(timestamp => timestamp > windowStart)
      .sort((a, b) => a - b);

    if (allRequests.length < this.maxRequests) {
      this.recordRequest(userId, now);

      return {
        allowed: true,
        remaining: this.maxRequests - allRequests.length - 1,
        totalRequests: allRequests.length + 1,
        nodeId: this.nodeId,
        resetAt: allRequests[0] ? allRequests[0] + this.windowSize : now + this.windowSize
      };
    }

    const oldestRequest = allRequests[0];
    const retryAfter = oldestRequest + this.windowSize - now;

    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      totalRequests: allRequests.length,
      nodeId: this.nodeId,
      resetAt: oldestRequest + this.windowSize
    };
  }

  /**
   * Record request in local cache
   */
  recordRequest(userId, timestamp) {
    if (!this.localCache.has(userId)) {
      this.localCache.set(userId, []);
    }
    this.localCache.get(userId).push(timestamp);
  }

  /**
   * Get global state for user across all nodes
   */
  getGlobalState(userId) {
    if (!this.sharedState.has(userId)) {
      this.sharedState.set(userId, {
        nodes: []
      });
    }
    return this.sharedState.get(userId);
  }

  /**
   * Sync local state to shared state
   */
  sync() {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    for (const [userId, requests] of this.localCache.entries()) {
      const globalState = this.getGlobalState(userId);

      const nodeIndex = globalState.nodes.findIndex(n => n.nodeId === this.nodeId);

      const cleanedRequests = requests.filter(timestamp => timestamp > windowStart);

      if (nodeIndex >= 0) {
        globalState.nodes[nodeIndex].requests = cleanedRequests;
        globalState.nodes[nodeIndex].lastSync = now;
      } else {
        globalState.nodes.push({
          nodeId: this.nodeId,
          requests: cleanedRequests,
          lastSync: now
        });
      }

      this.localCache.set(userId, cleanedRequests);
    }
  }

  /**
   * Start periodic sync
   */
  startSync() {
    this.syncTimer = setInterval(() => {
      this.sync();
    }, this.syncInterval);
  }

  /**
   * Stop sync timer
   */
  stopSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
  }

  /**
   * Get distributed statistics
   */
  getStats() {
    this.sync();

    const stats = {
      nodeId: this.nodeId,
      users: this.sharedState.size,
      nodes: new Set()
    };

    for (const globalState of this.sharedState.values()) {
      for (const node of globalState.nodes) {
        stats.nodes.add(node.nodeId);
      }
    }

    stats.nodes = Array.from(stats.nodes);
    stats.nodeCount = stats.nodes.length;

    return stats;
  }
}

/**
 * Main Rate Limiting class
 */
class RateLimiting {
  constructor(config = {}) {
    const {
      type = 'per-user',
      maxRequests = 100,
      windowSize = 60000,
      tiers = { free: 100, premium: 1000, enterprise: 10000 },
      nodeId = 'node-1'
    } = config;

    if (!type) {
      throw new Error('Rate limiting type is required');
    }

    this.type = type;
    this.limiter = this.createLimiter(type, {
      maxRequests,
      windowSize,
      tiers,
      nodeId
    });
  }

  /**
   * Create appropriate rate limiter based on type
   */
  createLimiter(type, config) {
    switch (type) {
      case 'per-user':
        return new PerUserRateLimiter(config.maxRequests, config.windowSize);
      case 'global':
        return new GlobalRateLimiter(config.maxRequests, config.windowSize);
      case 'adaptive':
        return new AdaptiveRateLimiter(config.maxRequests, config.windowSize);
      case 'tiered':
        return new TieredRateLimiter(config.tiers, config.windowSize);
      case 'distributed':
        return new DistributedRateLimiter(config.maxRequests, config.windowSize, config.nodeId);
      default:
        throw new Error(`Unknown rate limiting type: ${type}`);
    }
  }

  /**
   * Check if request is allowed
   */
  allowRequest(userId, tier) {
    if (this.type === 'global') {
      return this.limiter.allowRequest();
    }
    if (this.type === 'tiered') {
      return this.limiter.allowRequest(userId, tier);
    }
    return this.limiter.allowRequest(userId);
  }

  /**
   * Get status
   */
  getStatus(userId, tier) {
    if (this.type === 'global' || this.type === 'adaptive') {
      return this.limiter.getStatus();
    }
    if (this.type === 'tiered') {
      return this.limiter.getUserStatus(userId, tier);
    }
    if (this.type === 'per-user' || this.type === 'distributed') {
      return userId ? this.limiter.getUserStatus(userId) : this.limiter.getStats();
    }
    return this.limiter.getStats();
  }

  /**
   * Update system load (for adaptive rate limiting)
   */
  updateLoad(load) {
    if (this.type === 'adaptive') {
      this.limiter.updateLoad(load);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.limiter.stopCleanup) {
      this.limiter.stopCleanup();
    }
    if (this.limiter.stopSync) {
      this.limiter.stopSync();
    }
  }
}

module.exports = {
  RateLimiting,
  PerUserRateLimiter,
  GlobalRateLimiter,
  AdaptiveRateLimiter,
  TieredRateLimiter,
  DistributedRateLimiter
};
