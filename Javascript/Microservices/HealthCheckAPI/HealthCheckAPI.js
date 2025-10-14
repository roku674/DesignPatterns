/**
 * Health Check API Pattern
 *
 * Purpose:
 * Provides health check endpoints for monitoring service availability,
 * dependencies, and system health. Essential for load balancers, service
 * discovery, and orchestration platforms.
 *
 * Use Cases:
 * - Kubernetes liveness/readiness probes
 * - Load balancer health checks
 * - Service registry health monitoring
 * - Application monitoring
 * - Dependency health tracking
 *
 * Components:
 * - HealthCheckService: Main health check HTTP service
 * - HealthChecker: Performs health checks
 * - DependencyMonitor: Monitors external dependencies
 * - MetricsCollector: Collects health metrics
 */

const http = require('http');

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const HealthStatus = {
    UP: 'UP',
    DOWN: 'DOWN',
    DEGRADED: 'DEGRADED',
    UNKNOWN: 'UNKNOWN'
};

class DependencyMonitor {
    constructor() {
        this.dependencies = new Map();
        this.checkInterval = 30000; // 30 seconds
    }

    registerDependency(name, checkFn, options = {}) {
        this.dependencies.set(name, {
            name: name,
            checkFn: checkFn,
            required: options.required !== false,
            timeout: options.timeout || 5000,
            lastStatus: HealthStatus.UNKNOWN,
            lastCheck: null,
            consecutiveFailures: 0
        });

        console.log(`[DependencyMonitor] Registered dependency: ${name}`);
    }

    async checkDependency(name, correlationId) {
        const dep = this.dependencies.get(name);
        if (!dep) {
            return {
                name: name,
                status: HealthStatus.UNKNOWN,
                error: 'Dependency not found'
            };
        }

        const startTime = Date.now();

        try {
            await Promise.race([
                dep.checkFn(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), dep.timeout)
                )
            ]);

            dep.lastStatus = HealthStatus.UP;
            dep.consecutiveFailures = 0;
            dep.lastCheck = Date.now();

            return {
                name: dep.name,
                status: HealthStatus.UP,
                required: dep.required,
                responseTime: Date.now() - startTime,
                correlationId: correlationId
            };

        } catch (error) {
            dep.consecutiveFailures++;
            dep.lastStatus = dep.consecutiveFailures >= 3 ? HealthStatus.DOWN : HealthStatus.DEGRADED;
            dep.lastCheck = Date.now();

            return {
                name: dep.name,
                status: dep.lastStatus,
                required: dep.required,
                error: error.message,
                consecutiveFailures: dep.consecutiveFailures,
                responseTime: Date.now() - startTime,
                correlationId: correlationId
            };
        }
    }

    async checkAll(correlationId) {
        const checks = [];

        for (const [name, _] of this.dependencies) {
            checks.push(this.checkDependency(name, correlationId));
        }

        return Promise.all(checks);
    }

    getDependencyStatus(name) {
        const dep = this.dependencies.get(name);
        return dep ? dep.lastStatus : HealthStatus.UNKNOWN;
    }
}

class MetricsCollector {
    constructor() {
        this.startTime = Date.now();
        this.totalChecks = 0;
        this.passedChecks = 0;
        this.failedChecks = 0;
    }

    recordCheck(status) {
        this.totalChecks++;
        
        if (status === HealthStatus.UP) {
            this.passedChecks++;
        } else if (status === HealthStatus.DOWN) {
            this.failedChecks++;
        }
    }

    getMetrics() {
        return {
            uptime: Date.now() - this.startTime,
            totalChecks: this.totalChecks,
            passedChecks: this.passedChecks,
            failedChecks: this.failedChecks,
            successRate: this.totalChecks > 0 ? this.passedChecks / this.totalChecks : 0
        };
    }
}

class HealthChecker {
    constructor() {
        this.applicationStatus = HealthStatus.UP;
        this.dependencyMonitor = new DependencyMonitor();
        this.metricsCollector = new MetricsCollector();
        this.customChecks = new Map();
    }

    registerDependency(name, checkFn, options = {}) {
        this.dependencyMonitor.registerDependency(name, checkFn, options);
    }

    registerCustomCheck(name, checkFn) {
        this.customChecks.set(name, checkFn);
        console.log(`[HealthChecker] Registered custom check: ${name}`);
    }

    async performLivenessCheck(correlationId) {
        // Liveness check: Is the application alive?
        this.metricsCollector.recordCheck(this.applicationStatus);
        
        return {
            status: this.applicationStatus,
            correlationId: correlationId,
            timestamp: Date.now()
        };
    }

    async performReadinessCheck(correlationId) {
        // Readiness check: Is the application ready to serve traffic?
        const dependencies = await this.dependencyMonitor.checkAll(correlationId);

        const requiredDepsHealthy = dependencies
            .filter(d => d.required)
            .every(d => d.status === HealthStatus.UP);

        const overallStatus = requiredDepsHealthy ? HealthStatus.UP : HealthStatus.DOWN;

        return {
            status: overallStatus,
            dependencies: dependencies,
            correlationId: correlationId,
            timestamp: Date.now()
        };
    }

    async performDetailedCheck(correlationId) {
        // Detailed health check with all information
        const dependencies = await this.dependencyMonitor.checkAll(correlationId);
        
        const customCheckResults = {};
        for (const [name, checkFn] of this.customChecks) {
            try {
                customCheckResults[name] = await checkFn();
            } catch (error) {
                customCheckResults[name] = { status: 'FAILED', error: error.message };
            }
        }

        const requiredDepsHealthy = dependencies
            .filter(d => d.required)
            .every(d => d.status === HealthStatus.UP);

        const overallStatus = requiredDepsHealthy && this.applicationStatus === HealthStatus.UP
            ? HealthStatus.UP
            : HealthStatus.DOWN;

        return {
            status: overallStatus,
            application: {
                status: this.applicationStatus,
                ...this.metricsCollector.getMetrics()
            },
            dependencies: dependencies,
            customChecks: customCheckResults,
            correlationId: correlationId,
            timestamp: Date.now()
        };
    }

    setApplicationStatus(status) {
        this.applicationStatus = status;
        console.log(`[HealthChecker] Application status set to: ${status}`);
    }
}

class HealthCheckAPI {
    constructor(port = 8080) {
        this.port = port;
        this.healthChecker = new HealthChecker();
    }

    registerDependency(name, checkFn, options = {}) {
        this.healthChecker.registerDependency(name, checkFn, options);
    }

    registerCustomCheck(name, checkFn) {
        this.healthChecker.registerCustomCheck(name, checkFn);
    }

    async handleRequest(req, res) {
        const correlationId = req.headers['x-correlation-id'] || generateUUID();
        const path = req.url.split('?')[0];

        let result;
        let statusCode = 200;

        try {
            switch (path) {
                case '/health/live':
                case '/health/liveness':
                    result = await this.healthChecker.performLivenessCheck(correlationId);
                    break;

                case '/health/ready':
                case '/health/readiness':
                    result = await this.healthChecker.performReadinessCheck(correlationId);
                    statusCode = result.status === HealthStatus.UP ? 200 : 503;
                    break;

                case '/health':
                case '/health/detailed':
                    result = await this.healthChecker.performDetailedCheck(correlationId);
                    statusCode = result.status === HealthStatus.UP ? 200 : 503;
                    break;

                default:
                    result = { error: 'Endpoint not found' };
                    statusCode = 404;
            }

            res.writeHead(statusCode, {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
            });
            res.end(JSON.stringify(result, null, 2));

        } catch (error) {
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
            });
            res.end(JSON.stringify({
                error: error.message,
                correlationId: correlationId
            }));
        }
    }

    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, () => {
            console.log(`[HealthCheckAPI] Service started on port ${this.port}`);
        });
    }

    stop() {
        if (this.server) {
            this.server.close(() => {
                console.log('[HealthCheckAPI] Service stopped');
            });
        }
    }
}

// Example usage
if (require.main === module) {
    const healthAPI = new HealthCheckAPI(8080);

    // Register dependencies
    healthAPI.registerDependency('database', async () => {
        // Simulated database check
        if (Math.random() > 0.1) {
            return true;
        }
        throw new Error('Database connection failed');
    }, { required: true, timeout: 5000 });

    healthAPI.registerDependency('cache', async () => {
        // Simulated cache check
        if (Math.random() > 0.05) {
            return true;
        }
        throw new Error('Cache connection failed');
    }, { required: false, timeout: 3000 });

    // Register custom checks
    healthAPI.registerCustomCheck('disk-space', async () => {
        return { available: '10GB', used: '40%' };
    });

    healthAPI.registerCustomCheck('memory', async () => {
        return { used: '2GB', total: '8GB' };
    });

    healthAPI.start();

    console.log('\n=== Health Check API Pattern Demo ===\n');
    console.log('Health Check Service running on http://localhost:8080');
    console.log('\nAvailable endpoints:');
    console.log('  - http://localhost:8080/health/live');
    console.log('  - http://localhost:8080/health/ready');
    console.log('  - http://localhost:8080/health/detailed');
}

module.exports = {
    HealthCheckAPI,
    HealthChecker,
    DependencyMonitor,
    MetricsCollector,
    HealthStatus
};
