/**
 * Server-Side Discovery Pattern Implementation
 *
 * Purpose:
 * In Server-Side Discovery, clients make requests to a load balancer which
 * queries the service registry and forwards requests to available instances.
 * The client doesn't need to know about the registry.
 *
 * Use Cases:
 * - AWS ELB with service registry
 * - Kubernetes services
 * - NGINX Plus with service discovery
 * - Cloud load balancers
 * - Simplified client implementations
 *
 * Components:
 * - LoadBalancerRouter: Routes requests to services
 * - ServiceRegistry: Tracks service instances
 * - HealthMonitor: Monitors service health
 * - RequestRouter: Handles routing logic
 */

const http = require('http');
const url = require('url');

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Service Instance
 */
class ServiceInstance {
    constructor(id, name, host, port) {
        this.id = id;
        this.name = name;
        this.host = host;
        this.port = port;
        this.healthy = true;
        this.connections = 0;
        this.totalRequests = 0;
        this.failedRequests = 0;
        this.avgResponseTime = 0;
    }

    getUrl() {
        return `http://${this.host}:${this.port}`;
    }

    recordRequest(success, responseTime) {
        this.totalRequests++;
        if (!success) {
            this.failedRequests++;
        }
        // Update average response time
        this.avgResponseTime = (this.avgResponseTime * (this.totalRequests - 1) + responseTime) / this.totalRequests;
    }
}

/**
 * Health Monitor
 */
class HealthMonitor {
    constructor(checkInterval = 10000) {
        this.checkInterval = checkInterval;
        this.checks = new Map();
    }

    startMonitoring(instance, callback) {
        if (this.checks.has(instance.id)) {
            return;
        }

        const intervalId = setInterval(() => {
            this.performHealthCheck(instance, callback);
        }, this.checkInterval);

        this.checks.set(instance.id, intervalId);
    }

    async performHealthCheck(instance, callback) {
        try {
            // Simulated health check
            const healthy = Math.random() > 0.05;
            instance.healthy = healthy;
            callback(instance.id, healthy);
        } catch (error) {
            instance.healthy = false;
            callback(instance.id, false);
        }
    }

    stopMonitoring(instanceId) {
        const intervalId = this.checks.get(instanceId);
        if (intervalId) {
            clearInterval(intervalId);
            this.checks.delete(instanceId);
        }
    }

    stopAll() {
        this.checks.forEach(id => clearInterval(id));
        this.checks.clear();
    }
}

/**
 * Request Router handles routing strategies
 */
class RequestRouter {
    constructor(strategy = 'round-robin') {
        this.strategy = strategy;
        this.counter = 0;
    }

    selectInstance(instances) {
        if (instances.length === 0) {
            return null;
        }

        switch (this.strategy) {
            case 'round-robin':
                return this.roundRobin(instances);
            case 'least-connections':
                return this.leastConnections(instances);
            case 'least-response-time':
                return this.leastResponseTime(instances);
            case 'random':
                return this.random(instances);
            default:
                return this.roundRobin(instances);
        }
    }

    roundRobin(instances) {
        const instance = instances[this.counter % instances.length];
        this.counter++;
        return instance;
    }

    leastConnections(instances) {
        return instances.reduce((prev, curr) => 
            curr.connections < prev.connections ? curr : prev
        );
    }

    leastResponseTime(instances) {
        return instances.reduce((prev, curr) =>
            curr.avgResponseTime < prev.avgResponseTime ? curr : prev
        );
    }

    random(instances) {
        return instances[Math.floor(Math.random() * instances.length)];
    }
}

/**
 * Load Balancer Router
 */
class LoadBalancerRouter {
    constructor(options = {}) {
        this.port = options.port || 8080;
        this.registry = new Map();
        this.healthMonitor = new HealthMonitor(options.healthCheckInterval || 10000);
        this.router = new RequestRouter(options.routingStrategy || 'round-robin');
        this.server = null;
    }

    /**
     * Register a service instance
     */
    registerService(serviceName, host, port) {
        const id = generateUUID();
        const instance = new ServiceInstance(id, serviceName, host, port);

        if (!this.registry.has(serviceName)) {
            this.registry.set(serviceName, []);
        }

        this.registry.get(serviceName).push(instance);

        // Start health monitoring
        this.healthMonitor.startMonitoring(instance, (instId, healthy) => {
            console.log(`[HealthMonitor] ${serviceName} (${instId}): ${healthy ? 'healthy' : 'unhealthy'}`);
        });

        console.log(`[LoadBalancer] Registered ${serviceName} at ${host}:${port}`);
        return id;
    }

    /**
     * Deregister a service instance
     */
    deregisterService(serviceName, instanceId) {
        const instances = this.registry.get(serviceName);
        if (instances) {
            const index = instances.findIndex(i => i.id === instanceId);
            if (index !== -1) {
                this.healthMonitor.stopMonitoring(instanceId);
                instances.splice(index, 1);
                console.log(`[LoadBalancer] Deregistered ${serviceName} (${instanceId})`);
            }
        }
    }

    /**
     * Route request to service
     */
    async routeRequest(serviceName, correlationId) {
        const instances = this.registry.get(serviceName);

        if (!instances || instances.length === 0) {
            throw new Error(`No instances found for ${serviceName}`);
        }

        // Filter healthy instances
        const healthyInstances = instances.filter(i => i.healthy);

        if (healthyInstances.length === 0) {
            throw new Error(`No healthy instances for ${serviceName}`);
        }

        // Select instance
        const instance = this.router.selectInstance(healthyInstances);
        instance.connections++;

        console.log(`[LoadBalancer] Routing ${serviceName} (${correlationId}) -> ${instance.getUrl()}`);

        const startTime = Date.now();
        try {
            // Simulated service call
            const result = await this.callService(instance);
            const responseTime = Date.now() - startTime;
            
            instance.recordRequest(true, responseTime);
            instance.connections--;
            
            return result;
        } catch (error) {
            const responseTime = Date.now() - startTime;
            instance.recordRequest(false, responseTime);
            instance.connections--;
            throw error;
        }
    }

    /**
     * Call service instance
     */
    async callService(instance) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({
                        message: 'Success',
                        instance: instance.id,
                        service: instance.name
                    });
                } else {
                    reject(new Error('Service error'));
                }
            }, Math.random() * 100 + 50);
        });
    }

    /**
     * Handle HTTP request
     */
    async handleRequest(req, res) {
        const correlationId = req.headers['x-correlation-id'] || generateUUID();
        const parsedUrl = url.parse(req.url);
        const pathParts = parsedUrl.pathname.split('/').filter(p => p);

        if (pathParts.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Service name required' }));
            return;
        }

        const serviceName = pathParts[0];

        try {
            const result = await this.routeRequest(serviceName, correlationId);
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
            });
            res.end(JSON.stringify(result));
        } catch (error) {
            res.writeHead(503, {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
            });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    /**
     * Start load balancer
     */
    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, () => {
            console.log(`[LoadBalancer] Server started on port ${this.port}`);
        });
    }

    /**
     * Stop load balancer
     */
    stop() {
        if (this.server) {
            this.healthMonitor.stopAll();
            this.server.close(() => {
                console.log('[LoadBalancer] Server stopped');
            });
        }
    }

    /**
     * Get statistics
     */
    getStats() {
        const stats = {};
        this.registry.forEach((instances, serviceName) => {
            stats[serviceName] = instances.map(i => ({
                id: i.id,
                url: i.getUrl(),
                healthy: i.healthy,
                connections: i.connections,
                totalRequests: i.totalRequests,
                failedRequests: i.failedRequests,
                avgResponseTime: Math.round(i.avgResponseTime)
            }));
        });
        return stats;
    }
}

// Example usage
if (require.main === module) {
    const loadBalancer = new LoadBalancerRouter({
        port: 8080,
        routingStrategy: 'least-connections',
        healthCheckInterval: 10000
    });

    // Register services
    loadBalancer.registerService('user-service', 'localhost', 3001);
    loadBalancer.registerService('user-service', 'localhost', 3002);
    loadBalancer.registerService('order-service', 'localhost', 4001);

    // Start load balancer
    loadBalancer.start();

    console.log('\n=== Server-Side Discovery Pattern Demo ===\n');
    console.log('Load Balancer running on http://localhost:8080');
    console.log('\nRegistered Services:');
    console.log(JSON.stringify(loadBalancer.getStats(), null, 2));
}

module.exports = {
    LoadBalancerRouter,
    ServiceInstance,
    HealthMonitor,
    RequestRouter
};
