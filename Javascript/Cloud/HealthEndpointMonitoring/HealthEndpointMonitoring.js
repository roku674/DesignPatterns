/**
 * Health Endpoint Monitoring Pattern
 *
 * Implements comprehensive health checking for cloud applications by exposing
 * endpoints that provide detailed information about application health, dependencies,
 * and system metrics. This enables monitoring systems, load balancers, and orchestrators
 * to make informed decisions about traffic routing and service availability.
 *
 * Key Concepts:
 * - Liveness Probes: Is the application running?
 * - Readiness Probes: Is the application ready to serve traffic?
 * - Startup Probes: Has the application started successfully?
 * - Dependency Health: Are external dependencies healthy?
 * - Custom Health Checks: Application-specific health indicators
 */

/**
 * Health Check Status
 */
const HealthStatus = {
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
  DEGRADED: 'degraded',
  UNKNOWN: 'unknown'
};

/**
 * Base Health Check
 */
class HealthCheck {
  constructor(name, checkFunction, config = {}) {
    if (!name) {
      throw new Error('Health check name is required');
    }
    if (!checkFunction || typeof checkFunction !== 'function') {
      throw new Error('Health check function is required');
    }

    this.name = name;
    this.checkFunction = checkFunction;
    this.timeout = config.timeout || 5000;
    this.critical = config.critical !== undefined ? config.critical : true;
    this.tags = config.tags || [];
    this.lastCheckTime = null;
    this.lastStatus = HealthStatus.UNKNOWN;
    this.lastError = null;
    this.checkCount = 0;
    this.failureCount = 0;
  }

  /**
   * Execute health check
   */
  async execute() {
    const startTime = Date.now();
    this.checkCount++;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), this.timeout);
      });

      const checkPromise = this.checkFunction();
      const result = await Promise.race([checkPromise, timeoutPromise]);

      this.lastCheckTime = Date.now();
      this.lastStatus = result.status || HealthStatus.HEALTHY;
      this.lastError = null;

      return {
        name: this.name,
        status: this.lastStatus,
        duration: Date.now() - startTime,
        timestamp: this.lastCheckTime,
        critical: this.critical,
        tags: this.tags,
        details: result.details || {},
        checkCount: this.checkCount,
        failureCount: this.failureCount
      };
    } catch (error) {
      this.failureCount++;
      this.lastCheckTime = Date.now();
      this.lastStatus = HealthStatus.UNHEALTHY;
      this.lastError = error.message;

      return {
        name: this.name,
        status: HealthStatus.UNHEALTHY,
        duration: Date.now() - startTime,
        timestamp: this.lastCheckTime,
        critical: this.critical,
        tags: this.tags,
        error: error.message,
        checkCount: this.checkCount,
        failureCount: this.failureCount
      };
    }
  }

  /**
   * Get health check metadata
   */
  getMetadata() {
    return {
      name: this.name,
      critical: this.critical,
      tags: this.tags,
      timeout: this.timeout,
      lastStatus: this.lastStatus,
      lastCheckTime: this.lastCheckTime,
      lastError: this.lastError,
      checkCount: this.checkCount,
      failureCount: this.failureCount,
      successRate: this.checkCount > 0 ? ((this.checkCount - this.failureCount) / this.checkCount) * 100 : 0
    };
  }
}

/**
 * Database Health Check
 */
class DatabaseHealthCheck extends HealthCheck {
  constructor(name, databaseClient, config = {}) {
    const checkFunction = async () => {
      if (!databaseClient) {
        throw new Error('Database client is not initialized');
      }

      if (!databaseClient.ping && !databaseClient.query) {
        throw new Error('Database client does not support health checks');
      }

      const startTime = Date.now();

      if (databaseClient.ping) {
        await databaseClient.ping();
      } else if (databaseClient.query) {
        await databaseClient.query('SELECT 1');
      }

      const duration = Date.now() - startTime;

      return {
        status: duration < 1000 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        details: {
          responseTime: duration,
          type: 'database'
        }
      };
    };

    super(name, checkFunction, { ...config, critical: true });
    this.databaseClient = databaseClient;
  }
}

/**
 * HTTP Endpoint Health Check
 */
class HttpEndpointHealthCheck extends HealthCheck {
  constructor(name, url, config = {}) {
    if (!url) {
      throw new Error('URL is required for HTTP health check');
    }

    const checkFunction = async () => {
      const startTime = Date.now();

      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: config.headers || {},
        signal: AbortSignal.timeout(config.timeout || 5000)
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        return {
          status: HealthStatus.HEALTHY,
          details: {
            statusCode: response.status,
            responseTime: duration,
            url
          }
        };
      }

      return {
        status: HealthStatus.UNHEALTHY,
        details: {
          statusCode: response.status,
          responseTime: duration,
          url
        }
      };
    };

    super(name, checkFunction, config);
    this.url = url;
  }
}

/**
 * Memory Health Check
 */
class MemoryHealthCheck extends HealthCheck {
  constructor(name, config = {}) {
    const thresholds = {
      warning: config.warningThreshold || 0.8,
      critical: config.criticalThreshold || 0.9
    };

    const checkFunction = async () => {
      const memUsage = process.memoryUsage();
      const totalHeap = memUsage.heapTotal;
      const usedHeap = memUsage.heapUsed;
      const utilizationPercent = usedHeap / totalHeap;

      let status = HealthStatus.HEALTHY;

      if (utilizationPercent >= thresholds.critical) {
        status = HealthStatus.UNHEALTHY;
      } else if (utilizationPercent >= thresholds.warning) {
        status = HealthStatus.DEGRADED;
      }

      return {
        status,
        details: {
          heapUsed: usedHeap,
          heapTotal: totalHeap,
          utilization: utilizationPercent,
          rss: memUsage.rss,
          external: memUsage.external
        }
      };
    };

    super(name, checkFunction, { ...config, critical: false });
    this.thresholds = thresholds;
  }
}

/**
 * Disk Space Health Check
 */
class DiskSpaceHealthCheck extends HealthCheck {
  constructor(name, config = {}) {
    const thresholds = {
      warning: config.warningThreshold || 0.8,
      critical: config.criticalThreshold || 0.9
    };

    const checkFunction = async () => {
      try {
        const { execSync } = require('child_process');
        const output = execSync('df -k /').toString();
        const lines = output.trim().split('\n');
        const data = lines[1].split(/\s+/);
        const used = parseInt(data[2], 10);
        const available = parseInt(data[3], 10);
        const total = used + available;
        const utilizationPercent = used / total;

        let status = HealthStatus.HEALTHY;

        if (utilizationPercent >= thresholds.critical) {
          status = HealthStatus.UNHEALTHY;
        } else if (utilizationPercent >= thresholds.warning) {
          status = HealthStatus.DEGRADED;
        }

        return {
          status,
          details: {
            used,
            available,
            total,
            utilization: utilizationPercent
          }
        };
      } catch (error) {
        return {
          status: HealthStatus.UNKNOWN,
          details: {
            error: error.message
          }
        };
      }
    };

    super(name, checkFunction, { ...config, critical: false });
    this.thresholds = thresholds;
  }
}

/**
 * Custom Health Check
 */
class CustomHealthCheck extends HealthCheck {
  constructor(name, checkFunction, config = {}) {
    super(name, checkFunction, config);
  }
}

/**
 * Health Monitor
 * Aggregates and manages multiple health checks
 */
class HealthMonitor {
  constructor(config = {}) {
    this.checks = new Map();
    this.history = [];
    this.maxHistorySize = config.maxHistorySize || 100;
    this.checkInterval = config.checkInterval || 30000;
    this.monitoringEnabled = false;
    this.monitoringTimer = null;
  }

  /**
   * Register a health check
   */
  registerCheck(healthCheck) {
    if (!(healthCheck instanceof HealthCheck)) {
      throw new Error('Invalid health check instance');
    }

    this.checks.set(healthCheck.name, healthCheck);
  }

  /**
   * Unregister a health check
   */
  unregisterCheck(name) {
    if (!name) {
      throw new Error('Health check name is required');
    }
    this.checks.delete(name);
  }

  /**
   * Execute all health checks
   */
  async executeAll(tags = []) {
    const startTime = Date.now();
    const results = [];

    const checksToExecute = tags.length > 0
      ? Array.from(this.checks.values()).filter(check =>
          tags.some(tag => check.tags.includes(tag))
        )
      : Array.from(this.checks.values());

    for (const check of checksToExecute) {
      const result = await check.execute();
      results.push(result);
    }

    const overallStatus = this.determineOverallStatus(results);

    const healthReport = {
      status: overallStatus,
      timestamp: Date.now(),
      duration: Date.now() - startTime,
      checks: results,
      summary: {
        total: results.length,
        healthy: results.filter(r => r.status === HealthStatus.HEALTHY).length,
        unhealthy: results.filter(r => r.status === HealthStatus.UNHEALTHY).length,
        degraded: results.filter(r => r.status === HealthStatus.DEGRADED).length,
        unknown: results.filter(r => r.status === HealthStatus.UNKNOWN).length
      }
    };

    this.addToHistory(healthReport);

    return healthReport;
  }

  /**
   * Determine overall health status
   */
  determineOverallStatus(results) {
    const criticalChecks = results.filter(r => r.critical);

    const hasCriticalFailure = criticalChecks.some(r => r.status === HealthStatus.UNHEALTHY);
    if (hasCriticalFailure) {
      return HealthStatus.UNHEALTHY;
    }

    const hasAnyUnhealthy = results.some(r => r.status === HealthStatus.UNHEALTHY);
    const hasAnyDegraded = results.some(r => r.status === HealthStatus.DEGRADED);

    if (hasAnyUnhealthy || hasAnyDegraded) {
      return HealthStatus.DEGRADED;
    }

    const allHealthy = results.every(r => r.status === HealthStatus.HEALTHY);
    if (allHealthy) {
      return HealthStatus.HEALTHY;
    }

    return HealthStatus.UNKNOWN;
  }

  /**
   * Add health report to history
   */
  addToHistory(report) {
    this.history.push(report);

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get health check history
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  /**
   * Get specific health check status
   */
  async getCheckStatus(name) {
    if (!name) {
      throw new Error('Health check name is required');
    }

    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Health check not found: ${name}`);
    }

    return check.execute();
  }

  /**
   * Get all registered checks metadata
   */
  getRegisteredChecks() {
    return Array.from(this.checks.values()).map(check => check.getMetadata());
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    if (this.monitoringEnabled) {
      return;
    }

    this.monitoringEnabled = true;
    this.monitoringTimer = setInterval(async () => {
      await this.executeAll();
    }, this.checkInterval);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
      this.monitoringEnabled = false;
    }
  }

  /**
   * Get monitoring statistics
   */
  getStatistics() {
    if (this.history.length === 0) {
      return {
        totalChecks: 0,
        averageDuration: 0,
        uptimePercent: 0,
        checkFrequency: this.checkInterval
      };
    }

    const totalDuration = this.history.reduce((sum, report) => sum + report.duration, 0);
    const healthyReports = this.history.filter(r => r.status === HealthStatus.HEALTHY).length;

    return {
      totalChecks: this.history.length,
      averageDuration: totalDuration / this.history.length,
      uptimePercent: (healthyReports / this.history.length) * 100,
      checkFrequency: this.checkInterval,
      registeredChecks: this.checks.size,
      monitoringEnabled: this.monitoringEnabled
    };
  }
}

/**
 * Main Health Endpoint Monitoring class
 */
class HealthEndpointMonitoring {
  constructor(config = {}) {
    this.monitor = new HealthMonitor(config);
    this.livenessChecks = new Set();
    this.readinessChecks = new Set();
    this.startupChecks = new Set();
  }

  /**
   * Register a health check with probe type
   */
  registerCheck(healthCheck, probeType = 'liveness') {
    if (!healthCheck) {
      throw new Error('Health check is required');
    }

    this.monitor.registerCheck(healthCheck);

    switch (probeType) {
      case 'liveness':
        this.livenessChecks.add(healthCheck.name);
        break;
      case 'readiness':
        this.readinessChecks.add(healthCheck.name);
        break;
      case 'startup':
        this.startupChecks.add(healthCheck.name);
        break;
      default:
        throw new Error(`Unknown probe type: ${probeType}`);
    }
  }

  /**
   * Execute liveness checks
   */
  async checkLiveness() {
    const checks = Array.from(this.monitor.checks.values())
      .filter(check => this.livenessChecks.has(check.name));

    const results = await Promise.all(checks.map(check => check.execute()));

    return {
      alive: results.every(r => r.status !== HealthStatus.UNHEALTHY),
      checks: results,
      timestamp: Date.now()
    };
  }

  /**
   * Execute readiness checks
   */
  async checkReadiness() {
    const checks = Array.from(this.monitor.checks.values())
      .filter(check => this.readinessChecks.has(check.name));

    const results = await Promise.all(checks.map(check => check.execute()));

    return {
      ready: results.every(r => r.status === HealthStatus.HEALTHY),
      checks: results,
      timestamp: Date.now()
    };
  }

  /**
   * Execute startup checks
   */
  async checkStartup() {
    const checks = Array.from(this.monitor.checks.values())
      .filter(check => this.startupChecks.has(check.name));

    const results = await Promise.all(checks.map(check => check.execute()));

    return {
      started: results.every(r => r.status !== HealthStatus.UNHEALTHY),
      checks: results,
      timestamp: Date.now()
    };
  }

  /**
   * Execute all health checks
   */
  async checkHealth() {
    return this.monitor.executeAll();
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    this.monitor.startMonitoring();
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring() {
    this.monitor.stopMonitoring();
  }

  /**
   * Get monitoring statistics
   */
  getStatistics() {
    return this.monitor.getStatistics();
  }

  /**
   * Get health history
   */
  getHistory(limit) {
    return this.monitor.getHistory(limit);
  }
}

module.exports = {
  HealthEndpointMonitoring,
  HealthMonitor,
  HealthCheck,
  DatabaseHealthCheck,
  HttpEndpointHealthCheck,
  MemoryHealthCheck,
  DiskSpaceHealthCheck,
  CustomHealthCheck,
  HealthStatus
};
