/**
 * CircuitBreaker Pattern
 *
 * Prevents cascading failures in distributed systems:
 * - Monitors failure rates
 * - Opens circuit when failures exceed threshold
 * - Provides fallback responses during outages
 * - Automatically attempts recovery
 * - Tracks health metrics
 *
 * States: CLOSED (normal), OPEN (failing), HALF_OPEN (testing recovery)
 *
 * Use cases:
 * - Microservice communication
 * - External API calls
 * - Database connections
 * - Any unreliable remote resource
 */

const { EventEmitter } = require('events');

const CircuitState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

class CircuitBreaker extends EventEmitter {
  constructor(options = {}) {
    super();

    this.name = options.name || 'CircuitBreaker';
    this.state = CircuitState.CLOSED;

    // Threshold settings
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000; // 60 seconds
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.volumeThreshold = options.volumeThreshold || 10;

    // Rolling window for failure rate calculation
    this.rollingWindowSize = options.rollingWindowSize || 10;
    this.rollingWindow = [];

    // Counters
    this.failureCount = 0;
    this.successCount = 0;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;

    // Metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      timeouts: 0,
      circuitOpened: 0,
      circuitClosed: 0,
      halfOpenAttempts: 0,
      averageResponseTime: 0,
      responseTimes: [],
      lastFailure: null,
      lastSuccess: null,
      stateChanges: []
    };

    // Timers
    this.resetTimer = null;
    this.nextAttemptTime = null;

    // Fallback function
    this.fallback = options.fallback || null;

    // Health check function
    this.healthCheck = options.healthCheck || null;
    this.healthCheckInterval = options.healthCheckInterval || 5000;
    this.healthCheckTimer = null;

    if (this.healthCheck && options.enableHealthCheck !== false) {
      this.startHealthCheck();
    }
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute(fn, ...args) {
    this.metrics.totalRequests++;

    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transition(CircuitState.HALF_OPEN);
      } else {
        this.metrics.rejectedRequests++;
        this.emit('requestRejected', {
          state: this.state,
          nextAttempt: this.nextAttemptTime
        });

        if (this.fallback) {
          return this.fallback(...args);
        }

        throw new Error(
          `Circuit breaker is OPEN. Next attempt at ${new Date(
            this.nextAttemptTime
          ).toISOString()}`
        );
      }
    }

    const startTime = Date.now();

    try {
      const result = await this.executeWithTimeout(fn, ...args);
      this.onSuccess(startTime);
      return result;
    } catch (error) {
      this.onFailure(error, startTime);

      if (this.fallback) {
        try {
          return await this.fallback(...args);
        } catch (fallbackError) {
          this.emit('fallbackFailed', { error: fallbackError });
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  async executeWithTimeout(fn, ...args) {
    return Promise.race([
      fn(...args),
      new Promise((_, reject) =>
        setTimeout(() => {
          this.metrics.timeouts++;
          reject(new Error('Request timeout'));
        }, this.timeout)
      )
    ]);
  }

  /**
   * Handle successful execution
   */
  onSuccess(startTime) {
    const duration = Date.now() - startTime;

    this.successCount++;
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;
    this.metrics.successfulRequests++;
    this.metrics.lastSuccess = Date.now();

    this.updateResponseTime(duration);
    this.updateRollingWindow(true);

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.consecutiveSuccesses >= this.successThreshold) {
        this.transition(CircuitState.CLOSED);
      }
    }

    this.emit('success', {
      state: this.state,
      consecutiveSuccesses: this.consecutiveSuccesses,
      duration
    });
  }

  /**
   * Handle failed execution
   */
  onFailure(error, startTime) {
    const duration = Date.now() - startTime;

    this.failureCount++;
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    this.metrics.failedRequests++;
    this.metrics.lastFailure = Date.now();

    this.updateResponseTime(duration);
    this.updateRollingWindow(false);

    this.emit('failure', {
      state: this.state,
      consecutiveFailures: this.consecutiveFailures,
      error: error.message,
      duration
    });

    if (this.state === CircuitState.HALF_OPEN) {
      this.transition(CircuitState.OPEN);
    } else if (this.state === CircuitState.CLOSED) {
      if (this.shouldOpenCircuit()) {
        this.transition(CircuitState.OPEN);
      }
    }
  }

  /**
   * Check if circuit should open
   */
  shouldOpenCircuit() {
    // Check if we have enough volume
    if (this.metrics.totalRequests < this.volumeThreshold) {
      return false;
    }

    // Check consecutive failures
    if (this.consecutiveFailures >= this.failureThreshold) {
      return true;
    }

    // Check failure rate in rolling window
    if (this.rollingWindow.length >= this.rollingWindowSize) {
      const failures = this.rollingWindow.filter(success => !success).length;
      const failureRate = failures / this.rollingWindow.length;

      if (failureRate >= 0.5) {
        // 50% failure rate
        return true;
      }
    }

    return false;
  }

  /**
   * Check if circuit should attempt reset
   */
  shouldAttemptReset() {
    if (!this.nextAttemptTime) {
      return false;
    }

    return Date.now() >= this.nextAttemptTime;
  }

  /**
   * Transition circuit state
   */
  transition(newState) {
    const oldState = this.state;

    if (oldState === newState) {
      return;
    }

    this.state = newState;

    const stateChange = {
      from: oldState,
      to: newState,
      timestamp: Date.now(),
      failureCount: this.failureCount,
      successCount: this.successCount
    };

    this.metrics.stateChanges.push(stateChange);

    // Keep only last 100 state changes
    if (this.metrics.stateChanges.length > 100) {
      this.metrics.stateChanges = this.metrics.stateChanges.slice(-100);
    }

    switch (newState) {
      case CircuitState.OPEN:
        this.metrics.circuitOpened++;
        this.nextAttemptTime = Date.now() + this.resetTimeout;
        this.consecutiveSuccesses = 0;

        if (this.resetTimer) {
          clearTimeout(this.resetTimer);
        }

        this.resetTimer = setTimeout(() => {
          if (this.state === CircuitState.OPEN) {
            this.transition(CircuitState.HALF_OPEN);
          }
        }, this.resetTimeout);

        break;

      case CircuitState.HALF_OPEN:
        this.metrics.halfOpenAttempts++;
        this.consecutiveFailures = 0;
        this.consecutiveSuccesses = 0;
        break;

      case CircuitState.CLOSED:
        this.metrics.circuitClosed++;
        this.consecutiveFailures = 0;
        this.nextAttemptTime = null;

        if (this.resetTimer) {
          clearTimeout(this.resetTimer);
          this.resetTimer = null;
        }
        break;
    }

    this.emit('stateChange', stateChange);
  }

  /**
   * Update rolling window
   */
  updateRollingWindow(success) {
    this.rollingWindow.push(success);

    if (this.rollingWindow.length > this.rollingWindowSize) {
      this.rollingWindow.shift();
    }
  }

  /**
   * Update response time metrics
   */
  updateResponseTime(duration) {
    this.metrics.responseTimes.push(duration);

    if (this.metrics.responseTimes.length > 100) {
      this.metrics.responseTimes = this.metrics.responseTimes.slice(-100);
    }

    const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
    this.metrics.averageResponseTime = sum / this.metrics.responseTimes.length;
  }

  /**
   * Force circuit to open
   */
  open() {
    this.transition(CircuitState.OPEN);
  }

  /**
   * Force circuit to close
   */
  close() {
    this.transition(CircuitState.CLOSED);
  }

  /**
   * Force circuit to half-open
   */
  halfOpen() {
    this.transition(CircuitState.HALF_OPEN);
  }

  /**
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * Check if circuit is open
   */
  isOpen() {
    return this.state === CircuitState.OPEN;
  }

  /**
   * Check if circuit is closed
   */
  isClosed() {
    return this.state === CircuitState.CLOSED;
  }

  /**
   * Check if circuit is half-open
   */
  isHalfOpen() {
    return this.state === CircuitState.HALF_OPEN;
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics() {
    const failureRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.failedRequests / this.metrics.totalRequests) * 100
        : 0;

    const successRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
        : 0;

    return {
      ...this.metrics,
      state: this.state,
      failureRate: failureRate.toFixed(2),
      successRate: successRate.toFixed(2),
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      nextAttemptTime: this.nextAttemptTime,
      rollingWindowFailures: this.rollingWindow.filter(s => !s).length,
      rollingWindowSuccesses: this.rollingWindow.filter(s => s).length
    };
  }

  /**
   * Get health status
   */
  getHealth() {
    const metrics = this.getMetrics();

    let status = 'healthy';
    if (this.state === CircuitState.OPEN) {
      status = 'unhealthy';
    } else if (this.state === CircuitState.HALF_OPEN) {
      status = 'degraded';
    } else if (parseFloat(metrics.failureRate) > 25) {
      status = 'degraded';
    }

    return {
      status,
      state: this.state,
      failureRate: metrics.failureRate,
      uptime: this.metrics.successfulRequests > 0
    };
  }

  /**
   * Start health check monitoring
   */
  startHealthCheck() {
    if (this.healthCheckTimer) {
      return;
    }

    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.healthCheck();
        this.emit('healthCheckPassed');

        if (this.state === CircuitState.OPEN) {
          this.transition(CircuitState.HALF_OPEN);
        }
      } catch (error) {
        this.emit('healthCheckFailed', { error });
      }
    }, this.healthCheckInterval);
  }

  /**
   * Stop health check monitoring
   */
  stopHealthCheck() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Reset all counters and state
   */
  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.rollingWindow = [];
    this.nextAttemptTime = null;

    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      timeouts: 0,
      circuitOpened: 0,
      circuitClosed: 0,
      halfOpenAttempts: 0,
      averageResponseTime: 0,
      responseTimes: [],
      lastFailure: null,
      lastSuccess: null,
      stateChanges: []
    };

    this.emit('reset');
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    this.stopHealthCheck();
    this.removeAllListeners();
  }
}

module.exports = CircuitBreaker;
module.exports.CircuitState = CircuitState;
