/**
 * Microservice Chassis Pattern
 *
 * Provides a framework/library that handles cross-cutting concerns for microservices,
 * allowing developers to focus on business logic. The chassis handles common functionality
 * like configuration, logging, health checks, metrics, and service registration.
 *
 * Key Components:
 * - Service Bootstrap: Initialize and start services
 * - Health Checks: Monitor service health
 * - Metrics Collection: Track performance metrics
 * - Logging Framework: Structured logging
 * - Configuration Management: Load and manage config
 * - Service Registry: Register with discovery service
 * - Middleware Pipeline: Request/response processing
 */

const EventEmitter = require('events');

/**
 * Health Check
 */
class HealthCheck {
  constructor(name, checkFn, options = {}) {
    this.name = name;
    this.checkFn = checkFn;
    this.critical = options.critical !== false;
    this.timeout = options.timeout || 5000;
    this.lastStatus = 'unknown';
    this.lastCheckAt = null;
    this.lastError = null;
  }

  async execute() {
    this.lastCheckAt = new Date().toISOString();

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), this.timeout)
      );

      const result = await Promise.race([this.checkFn(), timeoutPromise]);

      this.lastStatus = result.healthy ? 'healthy' : 'unhealthy';
      this.lastError = result.error || null;

      return {
        name: this.name,
        status: this.lastStatus,
        critical: this.critical,
        timestamp: this.lastCheckAt,
        details: result.details || {}
      };
    } catch (error) {
      this.lastStatus = 'unhealthy';
      this.lastError = error.message;

      return {
        name: this.name,
        status: 'unhealthy',
        critical: this.critical,
        timestamp: this.lastCheckAt,
        error: error.message
      };
    }
  }
}

/**
 * Metrics Collector
 */
class MetricsCollector {
  constructor() {
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
    this.startTime = Date.now();
  }

  /**
   * Increment counter
   */
  incrementCounter(name, value = 1, labels = {}) {
    const key = this.getKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  /**
   * Set gauge value
   */
  setGauge(name, value, labels = {}) {
    const key = this.getKey(name, labels);
    this.gauges.set(key, value);
  }

  /**
   * Record histogram value
   */
  recordHistogram(name, value, labels = {}) {
    const key = this.getKey(name, labels);

    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }

    this.histograms.get(key).push({
      value,
      timestamp: Date.now()
    });
  }

  getKey(name, labels) {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    const metrics = {
      uptime: Date.now() - this.startTime,
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: {}
    };

    for (const [key, values] of this.histograms) {
      const sorted = values.map(v => v.value).sort((a, b) => a - b);
      metrics.histograms[key] = {
        count: values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      };
    }

    return metrics;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

/**
 * Structured Logger
 */
class Logger {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.level = options.level || 'INFO';
    this.levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    this.outputs = options.outputs || [console];
  }

  log(level, message, context = {}) {
    if (this.levels[level] < this.levels[this.level]) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...context
    };

    const formatted = JSON.stringify(logEntry);

    for (const output of this.outputs) {
      if (output.log) {
        output.log(formatted);
      } else if (level === 'ERROR') {
        output.error(formatted);
      } else if (level === 'WARN') {
        output.warn(formatted);
      } else {
        output.log(formatted);
      }
    }
  }

  debug(message, context) {
    this.log('DEBUG', message, context);
  }

  info(message, context) {
    this.log('INFO', message, context);
  }

  warn(message, context) {
    this.log('WARN', message, context);
  }

  error(message, context) {
    this.log('ERROR', message, context);
  }
}

/**
 * Middleware Pipeline
 */
class MiddlewarePipeline {
  constructor() {
    this.middleware = [];
  }

  use(fn) {
    this.middleware.push(fn);
  }

  async execute(context) {
    let index = 0;

    const next = async () => {
      if (index >= this.middleware.length) {
        return;
      }

      const fn = this.middleware[index++];
      await fn(context, next);
    };

    await next();
  }
}

/**
 * Microservice Chassis Framework
 */
class MicroserviceChassis extends EventEmitter {
  constructor(serviceName, options = {}) {
    super();
    this.serviceName = serviceName;
    this.version = options.version || '1.0.0';
    this.port = options.port || 3000;

    // Core components
    this.logger = new Logger(serviceName, options.logger || {});
    this.metrics = new MetricsCollector();
    this.healthChecks = new Map();
    this.middleware = new MiddlewarePipeline();
    this.config = options.config || {};

    // Service state
    this.state = 'created'; // created, starting, running, stopping, stopped
    this.startedAt = null;

    // Setup default health checks
    this.setupDefaultHealthChecks();

    // Setup default middleware
    this.setupDefaultMiddleware();
  }

  /**
   * Setup default health checks
   */
  setupDefaultHealthChecks() {
    // Memory check
    this.addHealthCheck('memory', async () => {
      const used = process.memoryUsage();
      const maxHeap = 1024 * 1024 * 1024; // 1GB

      return {
        healthy: used.heapUsed < maxHeap * 0.9,
        details: {
          heapUsed: used.heapUsed,
          heapTotal: used.heapTotal,
          external: used.external
        }
      };
    }, { critical: false });

    // Uptime check
    this.addHealthCheck('uptime', async () => {
      const uptime = this.startedAt ? Date.now() - new Date(this.startedAt).getTime() : 0;

      return {
        healthy: true,
        details: { uptime, startedAt: this.startedAt }
      };
    }, { critical: false });
  }

  /**
   * Setup default middleware
   */
  setupDefaultMiddleware() {
    // Request logging
    this.middleware.use(async (context, next) => {
      const startTime = Date.now();
      context.requestId = this.generateRequestId();

      this.logger.info('Request started', {
        requestId: context.requestId,
        method: context.method,
        path: context.path
      });

      await next();

      const duration = Date.now() - startTime;
      this.metrics.recordHistogram('request_duration_ms', duration, {
        method: context.method,
        path: context.path
      });

      this.logger.info('Request completed', {
        requestId: context.requestId,
        duration,
        status: context.status
      });
    });

    // Metrics collection
    this.middleware.use(async (context, next) => {
      this.metrics.incrementCounter('requests_total', 1, {
        method: context.method,
        path: context.path
      });

      await next();

      this.metrics.incrementCounter('responses_total', 1, {
        method: context.method,
        path: context.path,
        status: context.status
      });
    });

    // Error handling
    this.middleware.use(async (context, next) => {
      try {
        await next();
      } catch (error) {
        this.logger.error('Request error', {
          requestId: context.requestId,
          error: error.message,
          stack: error.stack
        });

        this.metrics.incrementCounter('errors_total', 1, {
          type: error.name
        });

        context.status = 500;
        context.error = error.message;
      }
    });
  }

  /**
   * Add health check
   */
  addHealthCheck(name, checkFn, options = {}) {
    this.healthChecks.set(name, new HealthCheck(name, checkFn, options));
    this.logger.debug(`Health check added: ${name}`);
  }

  /**
   * Execute all health checks
   */
  async checkHealth() {
    const results = [];

    for (const [name, check] of this.healthChecks) {
      const result = await check.execute();
      results.push(result);
    }

    const overall = results.every(r => r.status === 'healthy' || !r.critical);

    return {
      status: overall ? 'healthy' : 'unhealthy',
      service: this.serviceName,
      version: this.version,
      timestamp: new Date().toISOString(),
      checks: results
    };
  }

  /**
   * Handle request
   */
  async handleRequest(method, path, handler) {
    const context = {
      method,
      path,
      status: 200,
      response: null,
      error: null,
      handler
    };

    await this.middleware.execute(context);

    if (!context.error && context.handler) {
      context.response = await context.handler(context);
    }

    return context;
  }

  /**
   * Start service
   */
  async start() {
    if (this.state !== 'created') {
      throw new Error(`Cannot start service in state: ${this.state}`);
    }

    this.state = 'starting';
    this.logger.info(`Starting service ${this.serviceName}...`);

    try {
      // Service initialization logic
      this.startedAt = new Date().toISOString();
      this.state = 'running';

      this.logger.info(`Service ${this.serviceName} started`, {
        version: this.version,
        port: this.port,
        startedAt: this.startedAt
      });

      this.emit('started');
    } catch (error) {
      this.state = 'stopped';
      this.logger.error('Service startup failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop service
   */
  async stop() {
    if (this.state !== 'running') {
      return;
    }

    this.state = 'stopping';
    this.logger.info(`Stopping service ${this.serviceName}...`);

    try {
      // Graceful shutdown logic
      await this.delay(100);

      this.state = 'stopped';
      this.logger.info('Service stopped');

      this.emit('stopped');
    } catch (error) {
      this.logger.error('Service shutdown error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get service info
   */
  getInfo() {
    return {
      name: this.serviceName,
      version: this.version,
      state: this.state,
      startedAt: this.startedAt,
      healthChecks: Array.from(this.healthChecks.keys()),
      metrics: this.metrics.getMetrics()
    };
  }

  generateRequestId() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Demo function
 */
async function demonstrateMicroserviceChassis() {
  console.log('=== Microservice Chassis Pattern Demo ===\n');

  // Create microservice
  const service = new MicroserviceChassis('user-service', {
    version: '1.0.0',
    port: 3000,
    logger: { level: 'DEBUG' }
  });

  // Add custom health check
  service.addHealthCheck('database', async () => {
    // Simulate database health check
    return {
      healthy: true,
      details: { connections: 10, maxConnections: 100 }
    };
  });

  // Add custom middleware
  service.middleware.use(async (context, next) => {
    console.log(`Custom middleware: ${context.method} ${context.path}`);
    await next();
  });

  // Start service
  await service.start();

  // Simulate some requests
  console.log('\nSimulating requests...\n');

  await service.handleRequest('GET', '/users', async () => {
    return { users: ['Alice', 'Bob', 'Charlie'] };
  });

  await service.handleRequest('POST', '/users', async () => {
    return { id: 'user-123', name: 'David' };
  });

  await service.handleRequest('GET', '/users/123', async () => {
    throw new Error('User not found');
  });

  // Check health
  console.log('\n=== Health Check ===\n');
  const health = await service.checkHealth();
  console.log(JSON.stringify(health, null, 2));

  // Get metrics
  console.log('\n=== Metrics ===\n');
  const info = service.getInfo();
  console.log(JSON.stringify(info.metrics, null, 2));

  // Stop service
  await service.stop();

  return service;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export components
module.exports = {
  HealthCheck,
  MetricsCollector,
  Logger,
  MiddlewarePipeline,
  MicroserviceChassis,
  demonstrateMicroserviceChassis
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateMicroserviceChassis()
    .then(() => console.log('\n✅ Microservice Chassis demo completed'))
    .catch(error => console.error('❌ Error:', error));
}
