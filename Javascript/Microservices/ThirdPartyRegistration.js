/**
 * Third Party Registration Pattern
 *
 * The Third Party Registration pattern uses an external service registrar to manage
 * service registration on behalf of microservice instances. Unlike self-registration,
 * services don't register themselves - instead, a third-party component (like Kubernetes,
 * Consul, or a custom service registrar) handles the registration process.
 *
 * Key Components:
 * - Service Registrar: External component that registers services
 * - Service Registry: Central repository of service instances
 * - Service Instance: Microservice that is registered externally
 * - Health Monitor: External component that monitors service health
 *
 * Benefits:
 * - Separation of concerns (services focus on business logic)
 * - Centralized registration management
 * - Consistent registration logic across services
 * - Easier to enforce organizational policies
 *
 * Use Cases:
 * - Kubernetes-based deployments
 * - Container orchestration platforms
 * - Legacy systems integration
 * - Polyglot microservice environments
 */

const http = require('http');
const EventEmitter = require('events');

/**
 * ServiceRegistry - Central registry managed by third-party registrar
 */
class ServiceRegistry extends EventEmitter {
    constructor() {
        super();
        this.services = new Map();
        this.registrationHistory = [];
    }

    /**
     * Register a service (called by registrar, not by service itself)
     */
    registerService(serviceInfo, registrarId) {
        const serviceId = `${serviceInfo.name}-${serviceInfo.id}`;

        const registration = {
            ...serviceInfo,
            registeredAt: new Date(),
            registeredBy: registrarId,
            status: 'active',
            healthStatus: 'unknown'
        };

        this.services.set(serviceId, registration);
        this.registrationHistory.push({
            action: 'register',
            serviceId,
            registrarId,
            timestamp: new Date()
        });

        this.emit('serviceRegistered', registration);
        console.log(`[Registry] Service ${serviceId} registered by ${registrarId}`);

        return { success: true, serviceId };
    }

    /**
     * Deregister a service
     */
    deregisterService(serviceId, registrarId) {
        if (!this.services.has(serviceId)) {
            return { success: false, error: 'Service not found' };
        }

        const service = this.services.get(serviceId);
        this.services.delete(serviceId);

        this.registrationHistory.push({
            action: 'deregister',
            serviceId,
            registrarId,
            timestamp: new Date()
        });

        this.emit('serviceDeregistered', service);
        console.log(`[Registry] Service ${serviceId} deregistered by ${registrarId}`);

        return { success: true };
    }

    /**
     * Update service health status
     */
    updateHealthStatus(serviceId, healthStatus) {
        if (!this.services.has(serviceId)) {
            return { success: false, error: 'Service not found' };
        }

        const service = this.services.get(serviceId);
        service.healthStatus = healthStatus;
        service.lastHealthCheck = new Date();

        if (healthStatus === 'unhealthy') {
            service.status = 'degraded';
            this.emit('serviceUnhealthy', service);
        } else {
            service.status = 'active';
        }

        return { success: true };
    }

    /**
     * Query services by name
     */
    queryServices(serviceName, filters = {}) {
        const instances = [];

        for (const [serviceId, service] of this.services.entries()) {
            if (service.name === serviceName) {
                let includeService = true;

                // Apply filters
                if (filters.status && service.status !== filters.status) {
                    includeService = false;
                }

                if (filters.healthStatus && service.healthStatus !== filters.healthStatus) {
                    includeService = false;
                }

                if (filters.region && service.metadata.region !== filters.region) {
                    includeService = false;
                }

                if (includeService) {
                    instances.push({ serviceId, ...service });
                }
            }
        }

        return instances;
    }

    /**
     * Get registration history
     */
    getRegistrationHistory(limit = 10) {
        return this.registrationHistory.slice(-limit);
    }

    /**
     * Get service by ID
     */
    getServiceById(serviceId) {
        return this.services.get(serviceId);
    }

    /**
     * Get all services grouped by name
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
}

/**
 * ServiceRegistrar - Third-party component that registers services
 */
class ServiceRegistrar extends EventEmitter {
    constructor(config) {
        super();
        this.id = config.id || this.generateId();
        this.registry = config.registry;
        this.discoveryMechanism = config.discoveryMechanism || 'polling';
        this.pollInterval = config.pollInterval || 10000;
        this.healthCheckInterval = config.healthCheckInterval || 15000;
        this.registeredServices = new Map();
        this.isRunning = false;
    }

    /**
     * Generate unique registrar ID
     */
    generateId() {
        return `registrar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Start the registrar
     */
    start() {
        console.log(`[Registrar ${this.id}] Starting...`);
        this.isRunning = true;

        // Start service discovery
        this.startServiceDiscovery();

        // Start health monitoring
        this.startHealthMonitoring();
    }

    /**
     * Stop the registrar
     */
    stop() {
        console.log(`[Registrar ${this.id}] Stopping...`);
        this.isRunning = false;

        // Deregister all services
        for (const serviceId of this.registeredServices.keys()) {
            this.deregisterService(serviceId);
        }
    }

    /**
     * Start discovering services
     */
    startServiceDiscovery() {
        if (this.discoveryMechanism === 'polling') {
            this.discoveryTimer = setInterval(() => {
                this.discoverServices();
            }, this.pollInterval);
        }
    }

    /**
     * Discover new services
     */
    async discoverServices() {
        console.log(`[Registrar ${this.id}] Discovering services...`);

        // In a real implementation, this would query container orchestrators,
        // cloud platforms, or network discovery mechanisms
        // For demonstration, we'll simulate discovery

        // This method would be called when new services are detected
        // For example, when a new container starts in Kubernetes
    }

    /**
     * Register a discovered service
     */
    registerService(serviceInfo) {
        const serviceId = `${serviceInfo.name}-${serviceInfo.id}`;

        console.log(`[Registrar ${this.id}] Registering service ${serviceId}...`);

        // Register with the central registry
        const result = this.registry.registerService(serviceInfo, this.id);

        if (result.success) {
            this.registeredServices.set(serviceId, {
                serviceInfo,
                registeredAt: new Date()
            });

            this.emit('serviceRegistered', { serviceId, serviceInfo });
        }

        return result;
    }

    /**
     * Deregister a service
     */
    deregisterService(serviceId) {
        console.log(`[Registrar ${this.id}] Deregistering service ${serviceId}...`);

        const result = this.registry.deregisterService(serviceId, this.id);

        if (result.success) {
            this.registeredServices.delete(serviceId);
            this.emit('serviceDeregistered', { serviceId });
        }

        return result;
    }

    /**
     * Start monitoring health of registered services
     */
    startHealthMonitoring() {
        this.healthMonitorTimer = setInterval(() => {
            this.monitorHealth();
        }, this.healthCheckInterval);
    }

    /**
     * Monitor health of all registered services
     */
    async monitorHealth() {
        console.log(`[Registrar ${this.id}] Monitoring service health...`);

        for (const [serviceId, data] of this.registeredServices.entries()) {
            const healthStatus = await this.checkServiceHealth(data.serviceInfo);

            // Update health status in registry
            this.registry.updateHealthStatus(serviceId, healthStatus);

            // Deregister if unhealthy for too long
            if (healthStatus === 'unhealthy') {
                console.log(`[Registrar ${this.id}] Service ${serviceId} is unhealthy`);
                // Could implement deregistration logic here
            }
        }
    }

    /**
     * Check health of a single service
     */
    async checkServiceHealth(serviceInfo) {
        try {
            // In a real implementation, this would make an HTTP request
            // to the service's health endpoint
            console.log(`[Registrar ${this.id}] Checking health of ${serviceInfo.name}`);

            // Simulate health check
            const isHealthy = Math.random() > 0.1; // 90% healthy

            return isHealthy ? 'healthy' : 'unhealthy';
        } catch (error) {
            console.error(`[Registrar ${this.id}] Health check failed:`, error.message);
            return 'unhealthy';
        }
    }

    /**
     * Handle service lifecycle events
     */
    handleServiceStarted(serviceInfo) {
        console.log(`[Registrar ${this.id}] Service started event received`);
        this.registerService(serviceInfo);
    }

    /**
     * Handle service stopped event
     */
    handleServiceStopped(serviceId) {
        console.log(`[Registrar ${this.id}] Service stopped event received`);
        this.deregisterService(serviceId);
    }
}

/**
 * ManagedService - A service that is registered by a third party
 */
class ManagedService {
    constructor(config) {
        this.name = config.name;
        this.id = config.id || this.generateId();
        this.host = config.host || 'localhost';
        this.port = config.port;
        this.metadata = config.metadata || {};
        this.server = null;
        this.onStartCallback = config.onStart;
        this.onStopCallback = config.onStop;
    }

    /**
     * Generate unique service ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Start the service
     */
    async start() {
        console.log(`[Service ${this.name}] Starting...`);

        // Create HTTP server
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        // Start listening
        await new Promise((resolve) => {
            this.server.listen(this.port, this.host, () => {
                console.log(`[Service ${this.name}] Listening on ${this.host}:${this.port}`);
                resolve();
            });
        });

        // Notify registrar that service has started
        if (this.onStartCallback) {
            this.onStartCallback(this.getServiceInfo());
        }
    }

    /**
     * Stop the service
     */
    async stop() {
        console.log(`[Service ${this.name}] Stopping...`);

        // Notify registrar that service is stopping
        if (this.onStopCallback) {
            this.onStopCallback(`${this.name}-${this.id}`);
        }

        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(resolve);
            });
        }

        console.log(`[Service ${this.name}] Stopped`);
    }

    /**
     * Get service information
     */
    getServiceInfo() {
        return {
            name: this.name,
            id: this.id,
            host: this.host,
            port: this.port,
            metadata: this.metadata,
            endpoints: this.getEndpoints()
        };
    }

    /**
     * Handle incoming requests
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
        res.end(JSON.stringify(this.getServiceInfo()));
    }

    /**
     * API request handler
     */
    handleApiRequest(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: `Response from ${this.name}-${this.id}`,
            path: req.url,
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
}

/**
 * ServiceOrchestrator - Simulates a container orchestrator
 */
class ServiceOrchestrator {
    constructor(registry) {
        this.registry = registry;
        this.registrars = [];
        this.services = new Map();
    }

    /**
     * Add a registrar to the orchestrator
     */
    addRegistrar(registrar) {
        this.registrars.push(registrar);
        registrar.start();
        console.log(`[Orchestrator] Registrar ${registrar.id} added and started`);
    }

    /**
     * Deploy a new service
     */
    async deployService(serviceConfig) {
        const service = new ManagedService({
            ...serviceConfig,
            onStart: (serviceInfo) => this.handleServiceStarted(serviceInfo),
            onStop: (serviceId) => this.handleServiceStopped(serviceId)
        });

        await service.start();

        const serviceId = `${service.name}-${service.id}`;
        this.services.set(serviceId, service);

        console.log(`[Orchestrator] Service ${serviceId} deployed`);

        return service;
    }

    /**
     * Handle service started event
     */
    handleServiceStarted(serviceInfo) {
        console.log(`[Orchestrator] Service started: ${serviceInfo.name}`);

        // Notify all registrars
        for (const registrar of this.registrars) {
            registrar.handleServiceStarted(serviceInfo);
        }
    }

    /**
     * Handle service stopped event
     */
    handleServiceStopped(serviceId) {
        console.log(`[Orchestrator] Service stopped: ${serviceId}`);

        // Notify all registrars
        for (const registrar of this.registrars) {
            registrar.handleServiceStopped(serviceId);
        }

        this.services.delete(serviceId);
    }

    /**
     * Terminate a service
     */
    async terminateService(serviceId) {
        const service = this.services.get(serviceId);

        if (!service) {
            console.log(`[Orchestrator] Service ${serviceId} not found`);
            return;
        }

        await service.stop();
        console.log(`[Orchestrator] Service ${serviceId} terminated`);
    }

    /**
     * Get orchestrator status
     */
    getStatus() {
        return {
            registrars: this.registrars.length,
            services: this.services.size,
            serviceList: Array.from(this.services.keys())
        };
    }
}

// Demonstration
async function demonstrateThirdPartyRegistration() {
    console.log('=== Third Party Registration Pattern Demonstration ===\n');

    // Create central registry
    const registry = new ServiceRegistry();

    // Listen for registry events
    registry.on('serviceRegistered', (service) => {
        console.log(`[Event] Service registered: ${service.name}-${service.id}`);
    });

    registry.on('serviceDeregistered', (service) => {
        console.log(`[Event] Service deregistered: ${service.name}-${service.id}`);
    });

    // Create service registrar
    const registrar = new ServiceRegistrar({
        registry: registry,
        pollInterval: 5000,
        healthCheckInterval: 10000
    });

    // Create orchestrator
    const orchestrator = new ServiceOrchestrator(registry);
    orchestrator.addRegistrar(registrar);

    // Deploy services
    console.log('\n--- Deploying Services ---');

    await orchestrator.deployService({
        name: 'payment-service',
        port: 4001,
        metadata: { version: '2.0.0', region: 'us-east' }
    });

    await orchestrator.deployService({
        name: 'payment-service',
        port: 4002,
        metadata: { version: '2.0.0', region: 'us-west' }
    });

    await orchestrator.deployService({
        name: 'notification-service',
        port: 4003,
        metadata: { version: '1.5.0', region: 'eu-west' }
    });

    // Wait for registration to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Query services
    console.log('\n--- Querying Services ---');
    const paymentServices = registry.queryServices('payment-service');
    console.log(`Found ${paymentServices.length} payment-service instances`);

    const eastServices = registry.queryServices('payment-service', { region: 'us-east' });
    console.log(`Found ${eastServices.length} payment-service instances in us-east`);

    // Show all services
    console.log('\n--- All Registered Services ---');
    const allServices = registry.getAllServices();
    console.log(JSON.stringify(allServices, null, 2));

    // Show orchestrator status
    console.log('\n--- Orchestrator Status ---');
    console.log(JSON.stringify(orchestrator.getStatus(), null, 2));

    // Show registration history
    console.log('\n--- Registration History ---');
    const history = registry.getRegistrationHistory(5);
    console.log(JSON.stringify(history, null, 2));
}

// Export classes
module.exports = {
    ServiceRegistry,
    ServiceRegistrar,
    ManagedService,
    ServiceOrchestrator
};

if (require.main === module) {
    demonstrateThirdPartyRegistration().catch(console.error);
}
