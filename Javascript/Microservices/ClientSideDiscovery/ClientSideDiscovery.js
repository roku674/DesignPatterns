/**
 * Client-Side Discovery Pattern Implementation
 *
 * Purpose:
 * In Client-Side Discovery, the client is responsible for determining the
 * network locations of available service instances and load balancing
 * requests across them. The client queries a service registry.
 *
 * Use Cases:
 * - Netflix Eureka
 * - Consul with client library
 * - Custom service discovery solutions
 * - Fine-grained load balancing control
 * - Client-optimized routing
 *
 * Components:
 * - ServiceDiscoveryClient: Client for querying registry
 * - RegistryCache: Caches service locations
 * - ClientLoadBalancer: Client-side load balancing
 * - HeartbeatManager: Sends heartbeats to registry
 */

const http = require('http');
const https = require('https');

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Registry Cache stores service instances locally
 */
class RegistryCache {
    constructor(ttl = 30000) {
        this.cache = new Map();
        this.ttl = ttl;
        this.lastUpdate = new Map();
    }

    /**
     * Get cached instances
     */
    get(serviceName) {
        const lastUpdate = this.lastUpdate.get(serviceName);

        if (!lastUpdate || Date.now() - lastUpdate > this.ttl) {
            return null;
        }

        return this.cache.get(serviceName);
    }

    /**
     * Set cached instances
     */
    set(serviceName, instances) {
        this.cache.set(serviceName, instances);
        this.lastUpdate.set(serviceName, Date.now());
    }

    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
        this.lastUpdate.clear();
    }

    /**
     * Remove service from cache
     */
    remove(serviceName) {
        this.cache.delete(serviceName);
        this.lastUpdate.delete(serviceName);
    }
}

/**
 * Client Load Balancer
 */
class ClientLoadBalancer {
    constructor(strategy = 'round-robin') {
        this.strategy = strategy;
        this.counters = new Map();
        this.weights = new Map();
    }

    /**
     * Select instance using load balancing strategy
     */
    selectInstance(serviceName, instances) {
        if (!instances || instances.length === 0) {
            return null;
        }

        switch (this.strategy) {
            case 'round-robin':
                return this.roundRobin(serviceName, instances);
            case 'random':
                return this.random(instances);
            case 'weighted':
                return this.weighted(instances);
            case 'least-response-time':
                return this.leastResponseTime(instances);
            default:
                return this.roundRobin(serviceName, instances);
        }
    }

    roundRobin(serviceName, instances) {
        const counter = this.counters.get(serviceName) || 0;
        const instance = instances[counter % instances.length];
        this.counters.set(serviceName, counter + 1);
        return instance;
    }

    random(instances) {
        return instances[Math.floor(Math.random() * instances.length)];
    }

    weighted(instances) {
        const totalWeight = instances.reduce((sum, inst) => sum + (inst.weight || 1), 0);
        let random = Math.random() * totalWeight;

        for (const instance of instances) {
            random -= instance.weight || 1;
            if (random <= 0) {
                return instance;
            }
        }

        return instances[0];
    }

    leastResponseTime(instances) {
        return instances.reduce((prev, curr) => {
            const prevTime = prev.avgResponseTime || Infinity;
            const currTime = curr.avgResponseTime || Infinity;
            return currTime < prevTime ? curr : prev;
        });
    }

    /**
     * Update response time for instance
     */
    updateResponseTime(instance, responseTime) {
        if (!instance.avgResponseTime) {
            instance.avgResponseTime = responseTime;
        } else {
            // Exponential moving average
            instance.avgResponseTime = 0.7 * instance.avgResponseTime + 0.3 * responseTime;
        }
    }
}

/**
 * Heartbeat Manager sends periodic heartbeats
 */
class HeartbeatManager {
    constructor(registryUrl, serviceId, interval = 10000) {
        this.registryUrl = registryUrl;
        this.serviceId = serviceId;
        this.interval = interval;
        this.intervalId = null;
    }

    /**
     * Start sending heartbeats
     */
    start() {
        this.intervalId = setInterval(() => {
            this.sendHeartbeat();
        }, this.interval);

        console.log(`[HeartbeatManager] Started for service ${this.serviceId}`);
    }

    /**
     * Stop sending heartbeats
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log(`[HeartbeatManager] Stopped for service ${this.serviceId}`);
        }
    }

    /**
     * Send heartbeat to registry
     */
    async sendHeartbeat() {
        try {
            // Simulated heartbeat - in production, make actual HTTP request
            console.log(`[HeartbeatManager] Sending heartbeat for ${this.serviceId}`);
        } catch (error) {
            console.error(`[HeartbeatManager] Heartbeat failed:`, error.message);
        }
    }
}

/**
 * Service Discovery Client
 */
class ServiceDiscoveryClient {
    constructor(registryUrl, options = {}) {
        this.registryUrl = registryUrl;
        this.cache = new RegistryCache(options.cacheTTL || 30000);
        this.loadBalancer = new ClientLoadBalancer(options.loadBalancingStrategy || 'round-robin');
        this.heartbeatManager = null;
        this.serviceId = null;
        this.useCache = options.useCache !== false;
        this.correlationIds = new Map();
    }

    /**
     * Register this service instance
     */
    async registerService(serviceName, host, port, metadata = {}) {
        try {
            // Simulated registration - in production, make actual HTTP request to registry
            this.serviceId = generateUUID();

            console.log(`[ClientSideDiscovery] Registered ${serviceName} as ${this.serviceId}`);

            // Start heartbeat
            this.heartbeatManager = new HeartbeatManager(
                this.registryUrl,
                this.serviceId,
                10000
            );
            this.heartbeatManager.start();

            return this.serviceId;
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    /**
     * Deregister this service instance
     */
    async deregisterService() {
        if (!this.serviceId) {
            return;
        }

        try {
            // Stop heartbeat
            if (this.heartbeatManager) {
                this.heartbeatManager.stop();
            }

            // Simulated deregistration
            console.log(`[ClientSideDiscovery] Deregistered ${this.serviceId}`);
            this.serviceId = null;
        } catch (error) {
            console.error(`[ClientSideDiscovery] Deregistration failed:`, error.message);
        }
    }

    /**
     * Discover service instances
     */
    async discover(serviceName, correlationId = null) {
        const cid = correlationId || generateUUID();

        // Check cache first
        if (this.useCache) {
            const cached = this.cache.get(serviceName);
            if (cached) {
                console.log(`[ClientSideDiscovery] Cache hit for ${serviceName} (${cid})`);
                return this.selectAndTrack(serviceName, cached, cid);
            }
        }

        try {
            // Query registry for instances
            const instances = await this.queryRegistry(serviceName);

            // Update cache
            if (this.useCache) {
                this.cache.set(serviceName, instances);
            }

            return this.selectAndTrack(serviceName, instances, cid);
        } catch (error) {
            throw new Error(`Discovery failed for ${serviceName}: ${error.message}`);
        }
    }

    /**
     * Query registry for service instances
     */
    async queryRegistry(serviceName) {
        // Simulated registry query - in production, make actual HTTP request
        return [
            {
                serviceId: generateUUID(),
                serviceName: serviceName,
                host: 'localhost',
                port: 3001 + Math.floor(Math.random() * 10),
                healthy: true,
                metadata: { version: '1.0' }
            },
            {
                serviceId: generateUUID(),
                serviceName: serviceName,
                host: 'localhost',
                port: 3001 + Math.floor(Math.random() * 10),
                healthy: true,
                metadata: { version: '1.0' }
            }
        ];
    }

    /**
     * Select instance and track correlation
     */
    selectAndTrack(serviceName, instances, correlationId) {
        const healthyInstances = instances.filter(i => i.healthy);

        if (healthyInstances.length === 0) {
            throw new Error(`No healthy instances for ${serviceName}`);
        }

        const instance = this.loadBalancer.selectInstance(serviceName, healthyInstances);

        // Track correlation
        this.correlationIds.set(correlationId, {
            serviceName: serviceName,
            instance: instance,
            timestamp: Date.now()
        });

        console.log(`[ClientSideDiscovery] Selected ${serviceName} -> ${instance.host}:${instance.port} (${correlationId})`);

        return instance;
    }

    /**
     * Call a service
     */
    async callService(serviceName, path, options = {}) {
        const correlationId = options.correlationId || generateUUID();
        const startTime = Date.now();

        try {
            // Discover service instance
            const instance = await this.discover(serviceName, correlationId);

            // Simulated service call
            const response = await this.makeRequest(instance, path, {
                ...options,
                headers: {
                    'X-Correlation-ID': correlationId,
                    ...options.headers
                }
            });

            const responseTime = Date.now() - startTime;

            // Update response time for load balancing
            this.loadBalancer.updateResponseTime(instance, responseTime);

            return response;
        } catch (error) {
            const responseTime = Date.now() - startTime;
            console.error(`[ClientSideDiscovery] Service call failed after ${responseTime}ms:`, error.message);
            throw error;
        }
    }

    /**
     * Make HTTP request to service instance
     */
    async makeRequest(instance, path, options = {}) {
        // Simulated HTTP request
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({
                        status: 200,
                        data: { message: 'Success', instance: instance.serviceId }
                    });
                } else {
                    reject(new Error('Service unavailable'));
                }
            }, Math.random() * 100 + 50);
        });
    }

    /**
     * Refresh cache for a service
     */
    async refreshCache(serviceName) {
        try {
            const instances = await this.queryRegistry(serviceName);
            this.cache.set(serviceName, instances);
            console.log(`[ClientSideDiscovery] Refreshed cache for ${serviceName}`);
        } catch (error) {
            console.error(`[ClientSideDiscovery] Cache refresh failed:`, error.message);
        }
    }

    /**
     * Get discovery statistics
     */
    getStats() {
        return {
            serviceId: this.serviceId,
            registryUrl: this.registryUrl,
            useCache: this.useCache,
            cachedServices: this.cache.cache.size,
            activeCorrelations: this.correlationIds.size
        };
    }

    /**
     * Shutdown client
     */
    async shutdown() {
        await this.deregisterService();
        this.cache.clear();
        this.correlationIds.clear();
        console.log('[ClientSideDiscovery] Shutdown complete');
    }
}

// Example usage
if (require.main === module) {
    const client = new ServiceDiscoveryClient('http://localhost:8500', {
        loadBalancingStrategy: 'round-robin',
        useCache: true,
        cacheTTL: 30000
    });

    console.log('\n=== Client-Side Discovery Pattern Demo ===\n');

    // Register this service
    client.registerService('api-gateway', 'localhost', 8080, { version: '1.0' })
        .then(serviceId => {
            console.log(`Registered as: ${serviceId}`);

            // Make service calls
            return client.callService('user-service', '/users', {
                method: 'GET'
            });
        })
        .then(response => {
            console.log('\nService call response:', response);
            console.log('\nClient Statistics:');
            console.log(JSON.stringify(client.getStats(), null, 2));
        })
        .catch(error => {
            console.error('Error:', error.message);
        });
}

module.exports = {
    ServiceDiscoveryClient,
    RegistryCache,
    ClientLoadBalancer,
    HeartbeatManager
};
