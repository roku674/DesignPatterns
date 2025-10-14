/**
 * Self Registration Pattern
 *
 * The Self Registration pattern allows microservices to automatically register themselves
 * with a service registry upon startup. This pattern eliminates the need for external
 * registration mechanisms and provides a decentralized approach to service discovery.
 *
 * Key Components:
 * - Service Registry: Central repository of service instances
 * - Service Instance: Individual microservice that registers itself
 * - Health Check: Mechanism to verify service availability
 * - Heartbeat: Periodic signal to maintain registration
 *
 * Benefits:
 * - Automatic service discovery
 * - Dynamic scaling support
 * - Self-healing capabilities
 * - Reduced operational overhead
 *
 * Use Cases:
 * - Cloud-native applications
 * - Container orchestration environments
 * - Dynamic microservice ecosystems
 * - Auto-scaling scenarios
 */

const http = require('http');
const EventEmitter = require('events');

/**
 * ServiceRegistry - Central registry for managing service instances
 */
class ServiceRegistry extends EventEmitter {
    constructor() {
        super();
        this.services = new Map();
        this.healthCheckInterval = 10000; // 10 seconds
        this.startHealthChecks();
    }

    /**
     * Register a new service instance
     */
    register(serviceInfo) {
        const serviceId = `${serviceInfo.name}-${serviceInfo.id}`;

        if (this.services.has(serviceId)) {
            console.log(`Service ${serviceId} already registered, updating...`);
        }

        const registrationData = {
            ...serviceInfo,
            registeredAt: new Date(),
            lastHeartbeat: new Date(),
            status: 'healthy',
            healthCheckFailures: 0
        };

        this.services.set(serviceId, registrationData);
        this.emit('serviceRegistered', registrationData);

        console.log(`Service registered: ${serviceId} at ${serviceInfo.host}:${serviceInfo.port}`);
        return { success: true, serviceId };
    }

    /**
     * Deregister a service instance
     */
    deregister(serviceId) {
        if (!this.services.has(serviceId)) {
            return { success: false, error: 'Service not found' };
        }

        const service = this.services.get(serviceId);
        this.services.delete(serviceId);
        this.emit('serviceDeregistered', service);

        console.log(`Service deregistered: ${serviceId}`);
        return { success: true };
    }

    /**
     * Update heartbeat for a service
     */
    heartbeat(serviceId) {
        if (!this.services.has(serviceId)) {
            return { success: false, error: 'Service not found' };
        }

        const service = this.services.get(serviceId);
        service.lastHeartbeat = new Date();
        service.healthCheckFailures = 0;
        service.status = 'healthy';

        return { success: true };
    }

    /**
     * Get all instances of a service by name
     */
    getService(serviceName) {
        const instances = [];

        for (const [serviceId, service] of this.services.entries()) {
            if (service.name === serviceName && service.status === 'healthy') {
                instances.push({ serviceId, ...service });
            }
        }

        return instances;
    }

    /**
     * Get all registered services
     */
    getAllServices() {
        const serviceMap = {};

        for (const [serviceId, service] of this.services.entries()) {
            if (!serviceMap[service.name]) {
                serviceMap[service.name] = [];
            }
            serviceMap[service.name].push({ serviceId, ...service });
        }

        return serviceMap;
    }

    /**
     * Perform health checks on all registered services
     */
    startHealthChecks() {
        setInterval(() => {
            const now = new Date();

            for (const [serviceId, service] of this.services.entries()) {
                const timeSinceHeartbeat = now - service.lastHeartbeat;

                // If no heartbeat for 30 seconds, mark as unhealthy
                if (timeSinceHeartbeat > 30000) {
                    service.healthCheckFailures++;

                    if (service.healthCheckFailures >= 3) {
                        console.log(`Service ${serviceId} marked as unhealthy, deregistering...`);
                        this.deregister(serviceId);
                    } else {
                        service.status = 'unhealthy';
                        console.log(`Service ${serviceId} health check failed (${service.healthCheckFailures}/3)`);
                    }
                }
            }
        }, this.healthCheckInterval);
    }

    /**
     * Load balance - get next available instance using round-robin
     */
    getNextInstance(serviceName) {
        const instances = this.getService(serviceName);

        if (instances.length === 0) {
            return null;
        }

        // Simple round-robin
        if (!this.roundRobinCounters) {
            this.roundRobinCounters = {};
        }

        if (!this.roundRobinCounters[serviceName]) {
            this.roundRobinCounters[serviceName] = 0;
        }

        const index = this.roundRobinCounters[serviceName] % instances.length;
        this.roundRobinCounters[serviceName]++;

        return instances[index];
    }
}

/**
 * MicroserviceInstance - A microservice that self-registers with the registry
 */
class MicroserviceInstance {
    constructor(config) {
        this.name = config.name;
        this.id = config.id || this.generateId();
        this.host = config.host || 'localhost';
        this.port = config.port;
        this.registryUrl = config.registryUrl;
        this.metadata = config.metadata || {};
        this.heartbeatInterval = config.heartbeatInterval || 5000;
        this.server = null;
        this.heartbeatTimer = null;
    }

    /**
     * Generate unique service ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Start the microservice and register with registry
     */
    async start() {
        // Create HTTP server for the service
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        // Start listening
        await new Promise((resolve) => {
            this.server.listen(this.port, this.host, () => {
                console.log(`Microservice ${this.name} started on ${this.host}:${this.port}`);
                resolve();
            });
        });

        // Self-register with registry
        await this.register();

        // Start sending heartbeats
        this.startHeartbeat();

        // Handle graceful shutdown
        this.setupShutdownHandlers();
    }

    /**
     * Register this service instance with the registry
     */
    async register() {
        const serviceInfo = {
            name: this.name,
            id: this.id,
            host: this.host,
            port: this.port,
            metadata: this.metadata,
            endpoints: this.getEndpoints()
        };

        console.log(`Registering service ${this.name}-${this.id} with registry...`);

        // In a real implementation, this would be an HTTP call to the registry
        // For this example, we'll simulate it
        return serviceInfo;
    }

    /**
     * Send periodic heartbeat to registry
     */
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeat();
        }, this.heartbeatInterval);
    }

    /**
     * Send heartbeat signal to registry
     */
    sendHeartbeat() {
        const serviceId = `${this.name}-${this.id}`;
        console.log(`Sending heartbeat for ${serviceId}`);
        // In a real implementation, this would be an HTTP call to the registry
    }

    /**
     * Deregister from registry
     */
    async deregister() {
        const serviceId = `${this.name}-${this.id}`;
        console.log(`Deregistering service ${serviceId}...`);

        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }

        // In a real implementation, this would be an HTTP call to the registry
        return { success: true };
    }

    /**
     * Handle incoming HTTP requests
     */
    handleRequest(req, res) {
        const url = req.url;

        if (url === '/health') {
            this.handleHealthCheck(req, res);
        } else if (url === '/info') {
            this.handleInfo(req, res);
        } else if (url.startsWith('/api/')) {
            this.handleApiRequest(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    }

    /**
     * Health check endpoint
     */
    handleHealthCheck(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date(),
            uptime: process.uptime()
        }));
    }

    /**
     * Service info endpoint
     */
    handleInfo(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            name: this.name,
            id: this.id,
            host: this.host,
            port: this.port,
            metadata: this.metadata,
            endpoints: this.getEndpoints()
        }));
    }

    /**
     * Handle API requests
     */
    handleApiRequest(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: `Response from ${this.name}-${this.id}`,
            timestamp: new Date()
        }));
    }

    /**
     * Get available endpoints
     */
    getEndpoints() {
        return [
            { path: '/health', method: 'GET', description: 'Health check' },
            { path: '/info', method: 'GET', description: 'Service information' },
            { path: '/api/*', method: 'GET', description: 'API endpoints' }
        ];
    }

    /**
     * Setup graceful shutdown handlers
     */
    setupShutdownHandlers() {
        const shutdown = async () => {
            console.log('\nShutting down gracefully...');

            // Deregister from registry
            await this.deregister();

            // Close server
            if (this.server) {
                this.server.close(() => {
                    console.log('Server closed');
                    process.exit(0);
                });
            }
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }

    /**
     * Stop the service
     */
    async stop() {
        await this.deregister();

        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }

        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(resolve);
            });
        }

        console.log(`Microservice ${this.name}-${this.id} stopped`);
    }
}

/**
 * ServiceDiscoveryClient - Client for discovering services from the registry
 */
class ServiceDiscoveryClient {
    constructor(registryUrl) {
        this.registryUrl = registryUrl;
        this.cache = new Map();
        this.cacheTimeout = 5000; // 5 seconds
    }

    /**
     * Discover service instances by name
     */
    async discoverService(serviceName) {
        // Check cache first
        if (this.cache.has(serviceName)) {
            const cached = this.cache.get(serviceName);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.instances;
            }
        }

        // In a real implementation, this would be an HTTP call to the registry
        console.log(`Discovering service: ${serviceName}`);

        // Simulate discovery
        const instances = [];

        // Cache the result
        this.cache.set(serviceName, {
            instances,
            timestamp: Date.now()
        });

        return instances;
    }

    /**
     * Get a service instance with load balancing
     */
    async getServiceInstance(serviceName) {
        const instances = await this.discoverService(serviceName);

        if (instances.length === 0) {
            throw new Error(`No instances found for service: ${serviceName}`);
        }

        // Simple random load balancing
        return instances[Math.floor(Math.random() * instances.length)];
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Demonstration
async function demonstrateSelfRegistration() {
    console.log('=== Self Registration Pattern Demonstration ===\n');

    // Create service registry
    const registry = new ServiceRegistry();

    // Listen for registration events
    registry.on('serviceRegistered', (service) => {
        console.log(`Event: Service registered - ${service.name}-${service.id}`);
    });

    registry.on('serviceDeregistered', (service) => {
        console.log(`Event: Service deregistered - ${service.name}-${service.id}`);
    });

    // Create and start multiple service instances
    const userService1 = new MicroserviceInstance({
        name: 'user-service',
        port: 3001,
        metadata: { version: '1.0.0', region: 'us-east' }
    });

    const userService2 = new MicroserviceInstance({
        name: 'user-service',
        port: 3002,
        metadata: { version: '1.0.0', region: 'us-west' }
    });

    const orderService = new MicroserviceInstance({
        name: 'order-service',
        port: 3003,
        metadata: { version: '1.0.0', region: 'us-east' }
    });

    // Simulate registration
    registry.register({
        name: userService1.name,
        id: userService1.id,
        host: userService1.host,
        port: userService1.port,
        metadata: userService1.metadata
    });

    registry.register({
        name: userService2.name,
        id: userService2.id,
        host: userService2.host,
        port: userService2.port,
        metadata: userService2.metadata
    });

    registry.register({
        name: orderService.name,
        id: orderService.id,
        host: orderService.host,
        port: orderService.port,
        metadata: orderService.metadata
    });

    // Query services
    console.log('\n--- Discovering Services ---');
    const userServices = registry.getService('user-service');
    console.log(`Found ${userServices.length} instances of user-service`);

    // Load balancing
    console.log('\n--- Load Balancing ---');
    for (let i = 0; i < 4; i++) {
        const instance = registry.getNextInstance('user-service');
        console.log(`Request ${i + 1} routed to: ${instance.serviceId}`);
    }

    // Service discovery client
    console.log('\n--- Service Discovery Client ---');
    const discoveryClient = new ServiceDiscoveryClient('http://localhost:8500');

    // Get all services
    console.log('\n--- All Registered Services ---');
    const allServices = registry.getAllServices();
    console.log(JSON.stringify(allServices, null, 2));
}

// Export classes and run demonstration
module.exports = {
    ServiceRegistry,
    MicroserviceInstance,
    ServiceDiscoveryClient
};

if (require.main === module) {
    demonstrateSelfRegistration().catch(console.error);
}
