/**
 * Ambassador Pattern
 *
 * Acts as an intermediary proxy between a client and a remote service,
 * handling cross-cutting concerns like retries, circuit breaking,
 * monitoring, and connection management.
 *
 * Key Concepts:
 * - Client Proxy: Sits client-side to handle outbound requests
 * - Retry Logic: Automatic retry with exponential backoff
 * - Circuit Breaker: Fail fast when service is down
 * - Connection Pooling: Manage connection lifecycle
 * - Request/Response Logging: Monitor all traffic
 * - Protocol Translation: Transform between protocols
 */

/**
 * Circuit Breaker States
 */
const CircuitState = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half_open'
};

/**
 * Circuit Breaker
 * Prevents cascading failures
 */
class CircuitBreaker {
  constructor(config = {}) {
    this.failureThreshold = config.failureThreshold || 5;
    this.successThreshold = config.successThreshold || 2;
    this.timeout = config.timeout || 60000;
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
  }

  async execute(operation) {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = CircuitState.HALF_OPEN;
      this.successes = 0;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;

      if (this.successes >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
      }
    }
  }

  onFailure() {
    this.failures++;
    this.successes = 0;

    if (this.failures >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      nextAttempt: this.state === CircuitState.OPEN ? this.nextAttempt : null
    };
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
  }
}

/**
 * Retry Policy
 * Implements retry logic with exponential backoff
 */
class RetryPolicy {
  constructor(config = {}) {
    this.maxRetries = config.maxRetries || 3;
    this.baseDelay = config.baseDelay || 1000;
    this.maxDelay = config.maxDelay || 30000;
    this.exponentialBackoff = config.exponentialBackoff !== false;
  }

  async execute(operation) {
    let lastError = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt < this.maxRetries) {
          const delay = this.calculateDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Failed after ${this.maxRetries} retries: ${lastError.message}`);
  }

  calculateDelay(attempt) {
    if (this.exponentialBackoff) {
      const delay = Math.min(
        this.baseDelay * Math.pow(2, attempt),
        this.maxDelay
      );
      return delay + Math.random() * 1000;
    }
    return this.baseDelay;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Connection Pool
 * Manages connection lifecycle
 */
class ConnectionPool {
  constructor(config = {}) {
    this.maxConnections = config.maxConnections || 10;
    this.maxIdleTime = config.maxIdleTime || 60000;
    this.connections = [];
    this.activeConnections = new Set();
  }

  async acquire() {
    const availableConnection = this.connections.find(conn =>
      !this.activeConnections.has(conn) &&
      Date.now() - conn.lastUsed < this.maxIdleTime
    );

    if (availableConnection) {
      this.activeConnections.add(availableConnection);
      return availableConnection;
    }

    if (this.connections.length < this.maxConnections) {
      const newConnection = this.createConnection();
      this.connections.push(newConnection);
      this.activeConnections.add(newConnection);
      return newConnection;
    }

    throw new Error('Connection pool exhausted');
  }

  release(connection) {
    connection.lastUsed = Date.now();
    this.activeConnections.delete(connection);
  }

  createConnection() {
    return {
      id: `conn-${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
  }

  getStatus() {
    return {
      total: this.connections.length,
      active: this.activeConnections.size,
      idle: this.connections.length - this.activeConnections.size,
      maxConnections: this.maxConnections
    };
  }

  cleanup() {
    const now = Date.now();
    this.connections = this.connections.filter(conn =>
      this.activeConnections.has(conn) ||
      now - conn.lastUsed < this.maxIdleTime
    );
  }
}

/**
 * Request Logger
 * Logs all requests and responses
 */
class RequestLogger {
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.logs = [];
    this.maxLogs = config.maxLogs || 1000;
  }

  logRequest(request) {
    if (!this.enabled) return;

    this.addLog({
      type: 'request',
      method: request.method,
      url: request.url,
      headers: request.headers,
      timestamp: Date.now()
    });
  }

  logResponse(response, duration) {
    if (!this.enabled) return;

    this.addLog({
      type: 'response',
      statusCode: response.statusCode,
      duration,
      timestamp: Date.now()
    });
  }

  logError(error) {
    if (!this.enabled) return;

    this.addLog({
      type: 'error',
      message: error.message,
      timestamp: Date.now()
    });
  }

  addLog(entry) {
    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(limit = 10) {
    return this.logs.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
  }
}

/**
 * Protocol Translator
 * Translates between different protocols
 */
class ProtocolTranslator {
  constructor(config = {}) {
    this.sourceProtocol = config.sourceProtocol || 'http';
    this.targetProtocol = config.targetProtocol || 'http';
    this.translators = config.translators || {};
  }

  translate(request) {
    const translatorKey = `${this.sourceProtocol}-to-${this.targetProtocol}`;
    const translator = this.translators[translatorKey];

    if (translator) {
      return translator(request);
    }

    return request;
  }

  addTranslator(sourceProtocol, targetProtocol, translator) {
    const key = `${sourceProtocol}-to-${targetProtocol}`;
    this.translators[key] = translator;
  }
}

/**
 * Ambassador Proxy
 * Main proxy that handles all cross-cutting concerns
 */
class AmbassadorProxy {
  constructor(serviceUrl, config = {}) {
    if (!serviceUrl) {
      throw new Error('Service URL is required');
    }

    this.serviceUrl = serviceUrl;
    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker || {});
    this.retryPolicy = new RetryPolicy(config.retryPolicy || {});
    this.connectionPool = new ConnectionPool(config.connectionPool || {});
    this.requestLogger = new RequestLogger(config.requestLogger || {});
    this.protocolTranslator = new ProtocolTranslator(config.protocolTranslator || {});

    this.timeout = config.timeout || 30000;
    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      retries: 0,
      circuitBreaks: 0
    };
  }

  /**
   * Make a request through the ambassador
   */
  async request(options) {
    this.metrics.requests++;

    const request = {
      method: options.method || 'GET',
      url: `${this.serviceUrl}${options.path || ''}`,
      headers: options.headers || {},
      body: options.body,
      ...options
    };

    this.requestLogger.logRequest(request);
    const startTime = Date.now();

    try {
      const translatedRequest = this.protocolTranslator.translate(request);

      const result = await this.circuitBreaker.execute(async () => {
        return await this.retryPolicy.execute(async () => {
          return await this.executeRequest(translatedRequest);
        });
      });

      const duration = Date.now() - startTime;
      this.requestLogger.logResponse(result, duration);
      this.metrics.successes++;

      return result;
    } catch (error) {
      this.metrics.failures++;
      this.requestLogger.logError(error);

      if (error.message.includes('Circuit breaker is OPEN')) {
        this.metrics.circuitBreaks++;
      }

      throw error;
    }
  }

  /**
   * Execute the actual request
   */
  async executeRequest(request) {
    const connection = await this.connectionPool.acquire();

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), this.timeout);
      });

      const requestPromise = this.performRequest(request, connection);
      const result = await Promise.race([requestPromise, timeoutPromise]);

      return result;
    } finally {
      this.connectionPool.release(connection);
    }
  }

  /**
   * Perform the actual HTTP request (simulated)
   */
  async performRequest(request, connection) {
    return {
      statusCode: 200,
      body: {
        message: 'Success',
        data: request,
        connectionId: connection.id
      }
    };
  }

  /**
   * Get ambassador status
   */
  getStatus() {
    return {
      serviceUrl: this.serviceUrl,
      circuitBreaker: this.circuitBreaker.getState(),
      connectionPool: this.connectionPool.getStatus(),
      metrics: this.metrics,
      recentLogs: this.requestLogger.getLogs(5)
    };
  }

  /**
   * Get detailed metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.requests > 0
        ? (this.metrics.successes / this.metrics.requests) * 100
        : 0,
      failureRate: this.metrics.requests > 0
        ? (this.metrics.failures / this.metrics.requests) * 100
        : 0
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      retries: 0,
      circuitBreaks: 0
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.connectionPool.cleanup();
    this.circuitBreaker.reset();
  }
}

/**
 * Main Ambassador Pattern class
 */
class Ambassador {
  /**
   * Create an ambassador proxy
   */
  static createProxy(serviceUrl, config) {
    return new AmbassadorProxy(serviceUrl, config);
  }

  /**
   * Create a circuit breaker
   */
  static createCircuitBreaker(config) {
    return new CircuitBreaker(config);
  }

  /**
   * Create a retry policy
   */
  static createRetryPolicy(config) {
    return new RetryPolicy(config);
  }

  /**
   * Create a connection pool
   */
  static createConnectionPool(config) {
    return new ConnectionPool(config);
  }

  /**
   * Get circuit states enum
   */
  static get CircuitState() {
    return CircuitState;
  }
}

module.exports = {
  Ambassador,
  AmbassadorProxy,
  CircuitBreaker,
  RetryPolicy,
  ConnectionPool,
  RequestLogger,
  ProtocolTranslator,
  CircuitState
};
