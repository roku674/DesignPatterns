/**
 * Service Discovery Pattern Implementation
 *
 * Purpose:
 * Service Discovery enables services to find and communicate with each other
 * without hard-coding hostnames and ports. It maintains a registry of available
 * service instances and provides lookup capabilities.
 *
 * Use Cases:
 * - Dynamic service location in microservices
 * - Auto-scaling scenarios
 * - Container orchestration environments
 * - Load balancing across service instances
 * - Health-based routing
 *
 * Components:
 * - ServiceRegistry: Central registry of services
 * - ServiceInstance: Represents a service endpoint
 * - HealthChecker: Monitors service health
 * - LoadBalancer: Distributes requests across instances
 */

const http = require('http');

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Service Instance represents a single instance of a service
 */
class ServiceInstance {
    constructor(serviceId, serviceName, host, port, metadata = {}) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.host = host;
        this.port = port;
        this.metadata = metadata;
        this.healthy = true;
        this.lastHeartbeat = Date.now();
        this.registeredAt = Date.now();
        this.failureCount = 0;
    }

    /**
     * Get full service URL
     */
    getUrl() {
        return `http://${this.host}:${this.port}`;
    }

    /**
     * Update heartbeat
     */
    heartbeat() {
        this.lastHeartbeat = Date.now();
        this.healthy = true;
        this.failureCount = 0;
    }

    /**
     * Mark as unhealthy
     */
    markUnhealthy() {
        this.healthy = false;
        this.failureCount++;
    }

    /**
     * Check if instance is stale
     */
    isStale(timeout = 30000) {
        return Date.now() - this.lastHeartbeat > timeout;
    }

    toJSON() {
        return {
            serviceId: this.serviceId,
            serviceName: this.serviceName,
            host: this.host,
            port: this.port,
            metadata: this.metadata,
            healthy: this.healthy,
            lastHeartbeat: this.lastHeartbeat,
            registeredAt: this.registeredAt
        };
    }
}

/**
 * Load Balancer strategies
 */
class LoadBalancer {
    constructor(strategy = 'round-robin') {
        this.strategy = strategy;
        this.counters = new Map();
    }

    /**
     * Select an instance based on load balancing strategy
     */
    selectInstance(instances) {
        if (instances.length === 0) {
            return null;
        }

        switch (this.strategy) {
            case 'round-robin':
                return this.roundRobin(instances);
            case 'random':
                return this.random(instances);
            case 'least-connections':
                return this.leastConnections(instances);
            default:
                return this.roundRobin(instances);
        }
    }

    roundRobin(instances) {
        const key = instances.map(i => i.serviceId).join(',');
        const counter = this.counters.get(key) || 0;
        const instance = instances[counter % instances.length];
        this.counters.set(key, counter + 1);
        return instance;
    }

    random(instances) {
        return instances[Math.floor(Math.random() * instances.length)];
    }

    leastConnections(instances) {
        return instances.reduce((prev, curr) => {
            const prevConn = this.counters.get(prev.serviceId) || 0;
            const currConn = this.counters.get(curr.serviceId) || 0;
            return currConn < prevConn ? curr : prev;
        });
    }

    incrementConnections(serviceId) {
        const count = this.counters.get(serviceId) || 0;
        this.counters.set(serviceId, count + 1);
    }

    decrementConnections(serviceId) {
        const count = this.counters.get(serviceId) || 0;
        this.counters.set(serviceId, Math.max(0, count - 1));
    }
}

/**
 * Health Checker monitors service health
 */
class HealthChecker {
    constructor(healthCheckInterval = 10000, timeout = 5000) {
        this.healthCheckInterval = healthCheckInterval;
        this.timeout = timeout;
        this.checks = new Map();
    }

    /**
     * Start health checking for an instance
     */
    startChecking(instance, callback) {
        if (this.checks.has(instance.serviceId)) {
            return;
        }

        const intervalId = setInterval(() => {
            this.performHealthCheck(instance, callback);
        }, this.healthCheckInterval);

        this.checks.set(instance.serviceId, intervalId);
    }

    /**
     * Stop health checking for an instance
     */
    stopChecking(instance) {
        const intervalId = this.checks.get(instance.serviceId);
        if (intervalId) {
            clearInterval(intervalId);
            this.checks.delete(instance.serviceId);
        }
    }

    /**
     * Perform health check on instance
     */
    async performHealthCheck(instance, callback) {
        try {
            // Simulated health check - in production, make actual HTTP request
            const healthy = Math.random() > 0.05; // 95% success rate

            if (healthy) {
                instance.heartbeat();
                callback(instance.serviceId, true);
            } else {
                instance.markUnhealthy();
                callback(instance.serviceId, false);
            }
        } catch (error) {
            instance.markUnhealthy();
            callback(instance.serviceId, false);
        }
    }

    /**
     * Stop all health checks
     */
    stopAll() {
        this.checks.forEach(intervalId => clearInterval(intervalId));
        this.checks.clear();
    }
}

/**
 * Service Registry manages service instances
 */
class ServiceRegistry {
    constructor(options = {}) {
        this.services = new Map();
        this.loadBalancer = new LoadBalancer(options.loadBalancingStrategy || 'round-robin');
        this.healthChecker = new HealthChecker(
            options.healthCheckInterval || 10000,
            options.healthCheckTimeout || 5000
        );
        this.heartbeatTimeout = options.heartbeatTimeout || 30000;
        this.startCleanupTask();
    }

    /**
     * Register a service instance
     */
    register(serviceName, host, port, metadata = {}) {
        const serviceId = generateUUID();
        const instance = new ServiceInstance(serviceId, serviceName, host, port, metadata);

        if (!this.services.has(serviceName)) {
            this.services.set(serviceName, new Map());
        }

        this.services.get(serviceName).set(serviceId, instance);

        // Start health checking
        this.healthChecker.startChecking(instance, (id, healthy) => {
            this.updateHealth(serviceName, id, healthy);
        });

        console.log(`[ServiceRegistry] Registered ${serviceName} (${serviceId}) at ${host}:${port}`);
        return serviceId;
    }

    /**
     * Deregister a service instance
     */
    deregister(serviceName, serviceId) {
        const instances = this.services.get(serviceName);

        if (instances && instances.has(serviceId)) {
            const instance = instances.get(serviceId);
            this.healthChecker.stopChecking(instance);
            instances.delete(serviceId);

            if (instances.size === 0) {
                this.services.delete(serviceName);
            }

            console.log(`[ServiceRegistry] Deregistered ${serviceName} (${serviceId})`);
            return true;
        }

        return false;
    }

    /**
     * Get a service instance using load balancing
     */
    discover(serviceName, correlationId = null) {
        const instances = this.services.get(serviceName);

        if (!instances || instances.size === 0) {
            throw new Error(`No instances found for service: ${serviceName}`);
        }

        // Filter healthy instances
        const healthyInstances = Array.from(instances.values())
            .filter(instance => instance.healthy && !instance.isStale(this.heartbeatTimeout));

        if (healthyInstances.length === 0) {
            throw new Error(`No healthy instances available for service: ${serviceName}`);
        }

        const instance = this.loadBalancer.selectInstance(healthyInstances);

        if (correlationId) {
            console.log(`[ServiceRegistry] Discovery for ${serviceName} (${correlationId}) -> ${instance.serviceId}`);
        }

        return instance;
    }

    /**
     * Get all instances of a service
     */
    getInstances(serviceName) {
        const instances = this.services.get(serviceName);
        return instances ? Array.from(instances.values()) : [];
    }

    /**
     * Get all registered services
     */
    getAllServices() {
        const result = {};

        this.services.forEach((instances, serviceName) => {
            result[serviceName] = Array.from(instances.values()).map(i => i.toJSON());
        });

        return result;
    }

    /**
     * Update service health
     */
    updateHealth(serviceName, serviceId, healthy) {
        const instances = this.services.get(serviceName);

        if (instances && instances.has(serviceId)) {
            const instance = instances.get(serviceId);

            if (healthy) {
                instance.heartbeat();
            } else {
                instance.markUnhealthy();
            }

            if (!healthy && instance.failureCount >= 3) {
                console.log(`[ServiceRegistry] Instance ${serviceId} failed 3 times, deregistering`);
                this.deregister(serviceName, serviceId);
            }
        }
    }

    /**
     * Send heartbeat for a service instance
     */
    heartbeat(serviceName, serviceId) {
        const instances = this.services.get(serviceName);

        if (instances && instances.has(serviceId)) {
            instances.get(serviceId).heartbeat();
            return true;
        }

        return false;
    }

    /**
     * Start cleanup task for stale instances
     */
    startCleanupTask() {
        setInterval(() => {
            this.services.forEach((instances, serviceName) => {
                instances.forEach((instance, serviceId) => {
                    if (instance.isStale(this.heartbeatTimeout)) {
                        console.log(`[ServiceRegistry] Removing stale instance: ${serviceId}`);
                        this.deregister(serviceName, serviceId);
                    }
                });
            });
        }, 60000); // Run every minute
    }

    /**
     * Get registry statistics
     */
    getStats() {
        const stats = {
            totalServices: this.services.size,
            services: {}
        };

        this.services.forEach((instances, serviceName) => {
            const healthy = Array.from(instances.values()).filter(i => i.healthy).length;
            stats.services[serviceName] = {
                total: instances.size,
                healthy: healthy,
                unhealthy: instances.size - healthy
            };
        });

        return stats;
    }

    /**
     * Shutdown registry
     */
    shutdown() {
        this.healthChecker.stopAll();
        console.log('[ServiceRegistry] Shutdown complete');
    }
}

// Example usage
if (require.main === module) {
    const registry = new ServiceRegistry({
        loadBalancingStrategy: 'round-robin',
        healthCheckInterval: 10000,
        heartbeatTimeout: 30000
    });

    // Register services
    const user1 = registry.register('user-service', 'localhost', 3001, { version: '1.0' });
    const user2 = registry.register('user-service', 'localhost', 3002, { version: '1.0' });
    const order1 = registry.register('order-service', 'localhost', 4001, { version: '1.0' });
    const product1 = registry.register('product-service', 'localhost', 5001, { version: '1.0' });

    console.log('\n=== Service Discovery Pattern Demo ===\n');
    console.log('Registry Statistics:');
    console.log(JSON.stringify(registry.getStats(), null, 2));

    // Discover services
    try {
        console.log('\nDiscovering user-service:');
        for (let i = 0; i < 3; i++) {
            const instance = registry.discover('user-service', generateUUID());
            console.log(`  -> ${instance.getUrl()}`);
        }
    } catch (error) {
        console.error('Discovery failed:', error.message);
    }

    // Simulate heartbeats
    setInterval(() => {
        registry.heartbeat('user-service', user1);
        registry.heartbeat('user-service', user2);
    }, 5000);
}

module.exports = {
    ServiceRegistry,
    ServiceInstance,
    LoadBalancer,
    HealthChecker
};
