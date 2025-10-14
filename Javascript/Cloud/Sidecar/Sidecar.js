/**
 * Sidecar Pattern
 *
 * Deploys auxiliary components alongside the main application to extend
 * functionality without modifying the main service. The sidecar shares
 * the same lifecycle and resources as the main application.
 *
 * Key Concepts:
 * - Logging Sidecar: Centralized logging
 * - Monitoring Sidecar: Metrics collection
 * - Configuration Sidecar: Dynamic config management
 * - Security Sidecar: Authentication/Authorization
 * - Proxy Sidecar: Request/Response interception
 */

/**
 * Base Sidecar Interface
 */
class BaseSidecar {
  constructor(name, config = {}) {
    if (!name) {
      throw new Error('Sidecar name is required');
    }

    this.name = name;
    this.enabled = config.enabled !== false;
    this.mainService = null;
  }

  /**
   * Attach to main service
   */
  attach(mainService) {
    if (!mainService) {
      throw new Error('Main service is required');
    }
    this.mainService = mainService;
  }

  /**
   * Lifecycle: before request
   */
  async beforeRequest(request) {
    return request;
  }

  /**
   * Lifecycle: after response
   */
  async afterResponse(response) {
    return response;
  }

  /**
   * Lifecycle: on error
   */
  async onError(error) {
    return error;
  }

  /**
   * Get sidecar status
   */
  getStatus() {
    return {
      name: this.name,
      enabled: this.enabled,
      attached: this.mainService !== null
    };
  }
}

/**
 * Logging Sidecar
 * Handles logging for the main service
 */
class LoggingSidecar extends BaseSidecar {
  constructor(config = {}) {
    super('logging', config);
    this.logs = [];
    this.maxLogs = config.maxLogs || 1000;
    this.logLevel = config.logLevel || 'info';
  }

  async beforeRequest(request) {
    this.log('info', 'Request received', {
      method: request.method,
      path: request.path,
      timestamp: Date.now()
    });
    return request;
  }

  async afterResponse(response) {
    this.log('info', 'Response sent', {
      statusCode: response.statusCode,
      duration: response.duration,
      timestamp: Date.now()
    });
    return response;
  }

  async onError(error) {
    this.log('error', 'Error occurred', {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
    return error;
  }

  log(level, message, metadata = {}) {
    const logEntry = {
      level,
      message,
      metadata,
      timestamp: Date.now()
    };

    this.logs.push(logEntry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.log(`[${level.toUpperCase()}] ${message}`, metadata);
  }

  getLogs(limit = 10) {
    return this.logs.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
  }
}

/**
 * Monitoring Sidecar
 * Collects metrics and health data
 */
class MonitoringSidecar extends BaseSidecar {
  constructor(config = {}) {
    super('monitoring', config);
    this.metrics = {
      requests: 0,
      errors: 0,
      totalDuration: 0,
      statusCodes: {}
    };
  }

  async beforeRequest(request) {
    request._startTime = Date.now();
    return request;
  }

  async afterResponse(response) {
    this.metrics.requests++;

    if (response._startTime) {
      const duration = Date.now() - response._startTime;
      this.metrics.totalDuration += duration;
      response.duration = duration;
    }

    const statusCode = response.statusCode || 200;
    this.metrics.statusCodes[statusCode] = (this.metrics.statusCodes[statusCode] || 0) + 1;

    return response;
  }

  async onError(error) {
    this.metrics.errors++;
    return error;
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageDuration: this.metrics.requests > 0
        ? this.metrics.totalDuration / this.metrics.requests
        : 0,
      errorRate: this.metrics.requests > 0
        ? (this.metrics.errors / this.metrics.requests) * 100
        : 0
    };
  }

  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalDuration: 0,
      statusCodes: {}
    };
  }
}

/**
 * Security Sidecar
 * Handles authentication and authorization
 */
class SecuritySidecar extends BaseSidecar {
  constructor(config = {}) {
    super('security', config);
    this.authProvider = config.authProvider || null;
    this.rateLimiter = config.rateLimiter || null;
  }

  async beforeRequest(request) {
    if (this.rateLimiter) {
      const allowed = await this.checkRateLimit(request);
      if (!allowed) {
        throw new Error('Rate limit exceeded');
      }
    }

    if (this.authProvider) {
      const authenticated = await this.authenticate(request);
      if (!authenticated) {
        throw new Error('Authentication failed');
      }
    }

    return request;
  }

  async authenticate(request) {
    if (!this.authProvider) {
      return true;
    }

    const token = request.headers?.authorization;
    if (!token) {
      return false;
    }

    return this.authProvider.validate(token);
  }

  async checkRateLimit(request) {
    if (!this.rateLimiter) {
      return true;
    }

    const userId = request.userId || request.ip || 'anonymous';
    return this.rateLimiter.allowRequest(userId);
  }
}

/**
 * Configuration Sidecar
 * Manages dynamic configuration
 */
class ConfigurationSidecar extends BaseSidecar {
  constructor(config = {}) {
    super('configuration', config);
    this.configStore = config.configStore || new Map();
    this.cacheEnabled = config.cacheEnabled !== false;
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 60000;
  }

  async beforeRequest(request) {
    request.config = await this.getConfig();
    return request;
  }

  async getConfig(key = null) {
    if (!key) {
      return this.getAllConfig();
    }

    if (this.cacheEnabled) {
      const cached = this.cache.get(key);
      if (cached && Date.now() < cached.expiry) {
        return cached.value;
      }
    }

    const value = this.configStore.get(key);

    if (this.cacheEnabled && value !== undefined) {
      this.cache.set(key, {
        value,
        expiry: Date.now() + this.cacheTTL
      });
    }

    return value;
  }

  async setConfig(key, value) {
    this.configStore.set(key, value);
    this.cache.delete(key);
  }

  getAllConfig() {
    return Object.fromEntries(this.configStore);
  }

  clearCache() {
    this.cache.clear();
  }
}

/**
 * Proxy Sidecar
 * Intercepts and modifies requests/responses
 */
class ProxySidecar extends BaseSidecar {
  constructor(config = {}) {
    super('proxy', config);
    this.requestTransformers = config.requestTransformers || [];
    this.responseTransformers = config.responseTransformers || [];
  }

  async beforeRequest(request) {
    let transformedRequest = request;

    for (const transformer of this.requestTransformers) {
      transformedRequest = await transformer(transformedRequest);
    }

    return transformedRequest;
  }

  async afterResponse(response) {
    let transformedResponse = response;

    for (const transformer of this.responseTransformers) {
      transformedResponse = await transformer(transformedResponse);
    }

    return transformedResponse;
  }

  addRequestTransformer(transformer) {
    if (typeof transformer !== 'function') {
      throw new Error('Transformer must be a function');
    }
    this.requestTransformers.push(transformer);
  }

  addResponseTransformer(transformer) {
    if (typeof transformer !== 'function') {
      throw new Error('Transformer must be a function');
    }
    this.responseTransformers.push(transformer);
  }
}

/**
 * Main Service
 * The primary application that sidecars attach to
 */
class MainService {
  constructor(name) {
    if (!name) {
      throw new Error('Service name is required');
    }
    this.name = name;
    this.sidecars = [];
  }

  /**
   * Attach a sidecar
   */
  attachSidecar(sidecar) {
    if (!(sidecar instanceof BaseSidecar)) {
      throw new Error('Sidecar must extend BaseSidecar');
    }

    sidecar.attach(this);
    this.sidecars.push(sidecar);
  }

  /**
   * Process request through sidecars
   */
  async processRequest(request) {
    let processedRequest = request;
    const startTime = Date.now();

    try {
      for (const sidecar of this.sidecars) {
        if (sidecar.enabled) {
          processedRequest = await sidecar.beforeRequest(processedRequest);
        }
      }

      const response = await this.handleRequest(processedRequest);
      response._startTime = startTime;

      let processedResponse = response;

      for (const sidecar of this.sidecars) {
        if (sidecar.enabled) {
          processedResponse = await sidecar.afterResponse(processedResponse);
        }
      }

      return processedResponse;
    } catch (error) {
      for (const sidecar of this.sidecars) {
        if (sidecar.enabled) {
          await sidecar.onError(error);
        }
      }
      throw error;
    }
  }

  /**
   * Main request handler
   */
  async handleRequest(request) {
    return {
      statusCode: 200,
      body: { message: 'Success', data: request }
    };
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      name: this.name,
      sidecars: this.sidecars.map(s => s.getStatus())
    };
  }
}

/**
 * Main Sidecar Pattern class
 */
class Sidecar {
  /**
   * Create a main service
   */
  static createService(name) {
    return new MainService(name);
  }

  /**
   * Create logging sidecar
   */
  static createLoggingSidecar(config) {
    return new LoggingSidecar(config);
  }

  /**
   * Create monitoring sidecar
   */
  static createMonitoringSidecar(config) {
    return new MonitoringSidecar(config);
  }

  /**
   * Create security sidecar
   */
  static createSecuritySidecar(config) {
    return new SecuritySidecar(config);
  }

  /**
   * Create configuration sidecar
   */
  static createConfigurationSidecar(config) {
    return new ConfigurationSidecar(config);
  }

  /**
   * Create proxy sidecar
   */
  static createProxySidecar(config) {
    return new ProxySidecar(config);
  }
}

module.exports = {
  Sidecar,
  BaseSidecar,
  LoggingSidecar,
  MonitoringSidecar,
  SecuritySidecar,
  ConfigurationSidecar,
  ProxySidecar,
  MainService
};
