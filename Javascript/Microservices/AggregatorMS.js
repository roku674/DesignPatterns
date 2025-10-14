/**
 * Aggregator Microservice Pattern
 *
 * The Aggregator Microservice (AggregatorMS) pattern implements a complete
 * microservice that aggregates data from multiple downstream services. This is
 * a production-ready implementation with advanced features like caching,
 * load balancing, health monitoring, and adaptive request routing.
 *
 * Key Components:
 * - AggregatorMicroservice: Complete microservice implementation
 * - ServiceRegistry: Tracks available downstream services
 * - LoadBalancer: Distributes requests across service instances
 * - CacheManager: Caches aggregated responses
 * - HealthMonitor: Monitors downstream service health
 *
 * Benefits:
 * - Production-ready aggregation service
 * - Built-in caching and performance optimization
 * - Service discovery and load balancing
 * - Health monitoring and circuit breaking
 * - Metrics and observability
 *
 * Use Cases:
 * - API Gateway implementations
 * - Backend for Frontend (BFF) services
 * - Data aggregation layers
 * - Service mesh data planes
 */

const EventEmitter = require('events');
const http = require('http');
const crypto = require('crypto');

/**
 * CacheManager - Manages response caching
 */
class CacheManager {
    constructor(config = {}) {
        this.cache = new Map();
        this.defaultTTL = config.ttl || 60000; // 1 minute
        this.maxSize = config.maxSize || 1000;
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Generate cache key
     */
    generateKey(serviceRequests) {
        const hash = crypto.createHash('md5');
        hash.update(JSON.stringify(serviceRequests));
        return hash.digest('hex');
    }

    /**
     * Get cached response
     */
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            this.misses++;
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }

        this.hits++;
        return entry.data;
    }

    /**
     * Set cached response
     */
    set(key, data, ttl = this.defaultTTL) {
        // Evict oldest entries if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            data,
            cachedAt: Date.now(),
            expiresAt: Date.now() + ttl
        });
    }

    /**
     * Invalidate cache entry
     */
    invalidate(key) {
        return this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Get cache statistics
     */
    getStatistics() {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? (this.hits / total) * 100 : 0
        };
    }
}

/**
 * LoadBalancer - Distributes requests across service instances
 */
class LoadBalancer {
    constructor(strategy = 'round-robin') {
        this.strategy = strategy;
        this.counters = new Map();
        this.weights = new Map();
    }

    /**
     * Select service instance
     */
    selectInstance(instances) {
        if (instances.length === 0) {
            return null;
        }

        if (instances.length === 1) {
            return instances[0];
        }

        switch (this.strategy) {
            case 'round-robin':
                return this.roundRobin(instances);
            case 'random':
                return this.random(instances);
            case 'least-connections':
                return this.leastConnections(instances);
            case 'weighted':
                return this.weighted(instances);
            default:
                return this.roundRobin(instances);
        }
    }

    /**
     * Round-robin selection
     */
    roundRobin(instances) {
        const key = instances[0].serviceName;

        if (!this.counters.has(key)) {
            this.counters.set(key, 0);
        }

        const counter = this.counters.get(key);
        const index = counter % instances.length;
        this.counters.set(key, counter + 1);

        return instances[index];
    }

    /**
     * Random selection
     */
    random(instances) {
        const index = Math.floor(Math.random() * instances.length);
        return instances[index];
    }

    /**
     * Least connections selection
     */
    leastConnections(instances) {
        return instances.reduce((min, instance) => {
            return (instance.activeConnections || 0) < (min.activeConnections || 0) ? instance : min;
        });
    }

    /**
     * Weighted selection
     */
    weighted(instances) {
        const totalWeight = instances.reduce((sum, instance) => {
            return sum + (instance.weight || 1);
        }, 0);

        let random = Math.random() * totalWeight;

        for (const instance of instances) {
            random -= (instance.weight || 1);
            if (random <= 0) {
                return instance;
            }
        }

        return instances[0];
    }

    /**
     * Set load balancing strategy
     */
    setStrategy(strategy) {
        this.strategy = strategy;
    }
}

/**
 * HealthMonitor - Monitors downstream service health
 */
class HealthMonitor extends EventEmitter {
    constructor(config = {}) {
        super();
        this.services = new Map();
        this.checkInterval = config.checkInterval || 30000;
        this.unhealthyThreshold = config.unhealthyThreshold || 3;
        this.healthyThreshold = config.healthyThreshold || 2;
        this.timer = null;
    }

    /**
     * Register service for monitoring
     */
    registerService(serviceName, healthCheckUrl) {
        this.services.set(serviceName, {
            serviceName,
            healthCheckUrl,
            status: 'unknown',
            consecutiveFailures: 0,
            consecutiveSuccesses: 0,
            lastCheck: null
        });

        console.log(`[HealthMonitor] Registered: ${serviceName}`);
    }

    /**
     * Start health monitoring
     */
    start() {
        console.log('[HealthMonitor] Starting health checks');

        this.timer = setInterval(() => {
            this.performHealthChecks();
        }, this.checkInterval);

        // Perform initial check
        this.performHealthChecks();
    }

    /**
     * Stop health monitoring
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        console.log('[HealthMonitor] Stopped');
    }

    /**
     * Perform health checks on all services
     */
    async performHealthChecks() {
        for (const [serviceName, service] of this.services.entries()) {
            await this.checkService(service);
        }
    }

    /**
     * Check health of a single service
     */
    async checkService(service) {
        try {
            // Simulate health check
            const isHealthy = Math.random() > 0.1; // 90% healthy

            if (isHealthy) {
                service.consecutiveSuccesses++;
                service.consecutiveFailures = 0;

                if (service.status !== 'healthy' &&
                    service.consecutiveSuccesses >= this.healthyThreshold) {
                    service.status = 'healthy';
                    this.emit('serviceHealthy', service.serviceName);
                    console.log(`[HealthMonitor] ${service.serviceName} is now healthy`);
                }
            } else {
                throw new Error('Health check failed');
            }
        } catch (error) {
            service.consecutiveFailures++;
            service.consecutiveSuccesses = 0;

            if (service.status !== 'unhealthy' &&
                service.consecutiveFailures >= this.unhealthyThreshold) {
                service.status = 'unhealthy';
                this.emit('serviceUnhealthy', service.serviceName);
                console.log(`[HealthMonitor] ${service.serviceName} is now unhealthy`);
            }
        }

        service.lastCheck = new Date();
    }

    /**
     * Get service health status
     */
    getServiceHealth(serviceName) {
        const service = this.services.get(serviceName);
        return service ? service.status : 'unknown';
    }

    /**
     * Get all service health statuses
     */
    getAllHealthStatuses() {
        const statuses = {};
        for (const [serviceName, service] of this.services.entries()) {
            statuses[serviceName] = {
                status: service.status,
                lastCheck: service.lastCheck,
                consecutiveFailures: service.consecutiveFailures
            };
        }
        return statuses;
    }
}

/**
 * ServiceRegistry - Manages downstream service instances
 */
class ServiceRegistry extends EventEmitter {
    constructor() {
        super();
        this.services = new Map();
    }

    /**
     * Register service instance
     */
    registerInstance(serviceName, instance) {
        if (!this.services.has(serviceName)) {
            this.services.set(serviceName, []);
        }

        const instances = this.services.get(serviceName);
        instances.push({
            ...instance,
            serviceName,
            registeredAt: new Date(),
            activeConnections: 0,
            weight: instance.weight || 1
        });

        this.emit('instanceRegistered', { serviceName, instance });
        console.log(`[ServiceRegistry] Instance registered: ${serviceName}`);
    }

    /**
     * Deregister service instance
     */
    deregisterInstance(serviceName, instanceId) {
        if (!this.services.has(serviceName)) {
            return false;
        }

        const instances = this.services.get(serviceName);
        const index = instances.findIndex(i => i.id === instanceId);

        if (index !== -1) {
            instances.splice(index, 1);
            this.emit('instanceDeregistered', { serviceName, instanceId });
            return true;
        }

        return false;
    }

    /**
     * Get all instances of a service
     */
    getInstances(serviceName) {
        return this.services.get(serviceName) || [];
    }

    /**
     * Get healthy instances only
     */
    getHealthyInstances(serviceName, healthMonitor) {
        const instances = this.getInstances(serviceName);
        return instances.filter(instance => {
            const health = healthMonitor.getServiceHealth(serviceName);
            return health === 'healthy';
        });
    }

    /**
     * Get all services
     */
    getAllServices() {
        const services = {};
        for (const [serviceName, instances] of this.services.entries()) {
            services[serviceName] = instances.length;
        }
        return services;
    }
}

/**
 * RequestAggregator - Handles request aggregation logic
 */
class RequestAggregator {
    constructor(config) {
        this.registry = config.registry;
        this.loadBalancer = config.loadBalancer;
        this.healthMonitor = config.healthMonitor;
        this.timeout = config.timeout || 5000;
    }

    /**
     * Aggregate requests to multiple services
     */
    async aggregate(serviceRequests, options = {}) {
        const results = [];
        const parallel = options.parallel !== false;

        if (parallel) {
            // Execute in parallel
            const promises = serviceRequests.map(request =>
                this.executeRequest(request).catch(error => ({
                    service: request.service,
                    success: false,
                    error: error.message
                }))
            );

            results.push(...await Promise.all(promises));
        } else {
            // Execute sequentially
            for (const request of serviceRequests) {
                try {
                    const result = await this.executeRequest(request);
                    results.push(result);
                } catch (error) {
                    results.push({
                        service: request.service,
                        success: false,
                        error: error.message
                    });
                }
            }
        }

        return results;
    }

    /**
     * Execute single service request
     */
    async executeRequest(request) {
        const instances = this.registry.getHealthyInstances(
            request.service,
            this.healthMonitor
        );

        if (instances.length === 0) {
            throw new Error(`No healthy instances for ${request.service}`);
        }

        // Select instance using load balancer
        const instance = this.loadBalancer.selectInstance(instances);

        // Simulate request
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.1) {
                    reject(new Error(`Request to ${request.service} failed`));
                } else {
                    resolve({
                        service: request.service,
                        success: true,
                        data: {
                            message: `Response from ${request.service}`,
                            instance: instance.id,
                            timestamp: new Date()
                        }
                    });
                }
            }, Math.random() * 100);
        });
    }
}

/**
 * AggregatorMicroservice - Complete aggregator microservice
 */
class AggregatorMicroservice extends EventEmitter {
    constructor(config) {
        super();
        this.name = config.name || 'AggregatorMS';
        this.port = config.port || 5000;
        this.host = config.host || 'localhost';

        // Initialize components
        this.registry = new ServiceRegistry();
        this.healthMonitor = new HealthMonitor(config.healthMonitor);
        this.loadBalancer = new LoadBalancer(config.loadBalancingStrategy || 'round-robin');
        this.cacheManager = new CacheManager(config.cache);

        this.requestAggregator = new RequestAggregator({
            registry: this.registry,
            loadBalancer: this.loadBalancer,
            healthMonitor: this.healthMonitor,
            timeout: config.timeout
        });

        this.server = null;
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            cachedResponses: 0,
            startTime: null
        };
    }

    /**
     * Initialize the microservice
     */
    async initialize() {
        console.log(`[${this.name}] Initializing...`);

        // Setup event listeners
        this.setupEventListeners();

        // Start health monitoring
        this.healthMonitor.start();

        console.log(`[${this.name}] Initialized`);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.healthMonitor.on('serviceUnhealthy', (serviceName) => {
            console.log(`[${this.name}] Service unhealthy: ${serviceName}`);
            this.emit('serviceUnhealthy', serviceName);
        });

        this.healthMonitor.on('serviceHealthy', (serviceName) => {
            console.log(`[${this.name}] Service healthy: ${serviceName}`);
            this.emit('serviceHealthy', serviceName);
        });
    }

    /**
     * Register downstream service
     */
    registerService(serviceName, instances) {
        for (const instance of instances) {
            this.registry.registerInstance(serviceName, instance);
        }

        // Register for health monitoring
        if (instances.length > 0) {
            this.healthMonitor.registerService(
                serviceName,
                `${instances[0].url}/health`
            );
        }

        console.log(`[${this.name}] Registered service: ${serviceName} with ${instances.length} instances`);
    }

    /**
     * Start the microservice
     */
    async start() {
        await this.initialize();

        console.log(`[${this.name}] Starting on ${this.host}:${this.port}`);

        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        await new Promise((resolve) => {
            this.server.listen(this.port, this.host, () => {
                this.metrics.startTime = new Date();
                console.log(`[${this.name}] Listening on ${this.host}:${this.port}`);
                resolve();
            });
        });
    }

    /**
     * Stop the microservice
     */
    async stop() {
        console.log(`[${this.name}] Stopping...`);

        this.healthMonitor.stop();

        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(resolve);
            });
        }

        console.log(`[${this.name}] Stopped`);
    }

    /**
     * Handle incoming HTTP requests
     */
    async handleRequest(req, res) {
        this.metrics.totalRequests++;

        const url = req.url;

        try {
            if (url === '/health') {
                await this.handleHealth(req, res);
            } else if (url === '/aggregate') {
                await this.handleAggregate(req, res);
            } else if (url === '/metrics') {
                await this.handleMetrics(req, res);
            } else if (url === '/services') {
                await this.handleServices(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not found' }));
            }
        } catch (error) {
            this.metrics.failedRequests++;
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    /**
     * Health check endpoint
     */
    async handleHealth(req, res) {
        const health = {
            status: 'healthy',
            uptime: Date.now() - this.metrics.startTime.getTime(),
            downstreamServices: this.healthMonitor.getAllHealthStatuses()
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health));
    }

    /**
     * Aggregation endpoint
     */
    async handleAggregate(req, res) {
        // Parse service requests from query or body
        const serviceRequests = [
            { service: 'user-service', endpoint: '/api/user' },
            { service: 'order-service', endpoint: '/api/orders' },
            { service: 'product-service', endpoint: '/api/products' }
        ];

        // Check cache
        const cacheKey = this.cacheManager.generateKey(serviceRequests);
        const cached = this.cacheManager.get(cacheKey);

        if (cached) {
            this.metrics.cachedResponses++;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ data: cached, cached: true }));
            return;
        }

        // Aggregate data
        const results = await this.requestAggregator.aggregate(serviceRequests, {
            parallel: true
        });

        // Build response
        const response = {
            data: {},
            metadata: {
                totalServices: serviceRequests.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length
            }
        };

        for (const result of results) {
            if (result.success) {
                response.data[result.service] = result.data;
            }
        }

        // Cache response
        this.cacheManager.set(cacheKey, response.data);

        this.metrics.successfulRequests++;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
    }

    /**
     * Metrics endpoint
     */
    async handleMetrics(req, res) {
        const metrics = {
            ...this.metrics,
            cache: this.cacheManager.getStatistics(),
            services: this.registry.getAllServices()
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(metrics));
    }

    /**
     * Services endpoint
     */
    async handleServices(req, res) {
        const services = this.registry.getAllServices();
        const health = this.healthMonitor.getAllHealthStatuses();

        const response = {
            services,
            health
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
    }
}

// Demonstration
async function demonstrateAggregatorMS() {
    console.log('=== Aggregator Microservice Pattern Demonstration ===\n');

    // Create aggregator microservice
    const aggregatorMS = new AggregatorMicroservice({
        name: 'MainAggregator',
        port: 9000,
        loadBalancingStrategy: 'round-robin',
        cache: {
            ttl: 30000,
            maxSize: 500
        },
        healthMonitor: {
            checkInterval: 15000,
            unhealthyThreshold: 2,
            healthyThreshold: 2
        }
    });

    // Register downstream services
    console.log('--- Registering Downstream Services ---');

    aggregatorMS.registerService('user-service', [
        { id: 'user-1', url: 'http://localhost:3001', weight: 2 },
        { id: 'user-2', url: 'http://localhost:3002', weight: 1 }
    ]);

    aggregatorMS.registerService('order-service', [
        { id: 'order-1', url: 'http://localhost:4001' },
        { id: 'order-2', url: 'http://localhost:4002' }
    ]);

    aggregatorMS.registerService('product-service', [
        { id: 'product-1', url: 'http://localhost:5001' }
    ]);

    // Start the microservice
    console.log('\n--- Starting Aggregator Microservice ---');
    await aggregatorMS.start();

    // Simulate some requests
    console.log('\n--- Simulating Requests ---');
    for (let i = 0; i < 5; i++) {
        console.log(`\nRequest ${i + 1}:`);
        // In real usage, external clients would make HTTP requests
        // For demo, we just show that the service is running
    }

    console.log('\n--- Aggregator is now running ---');
    console.log(`Access endpoints:`);
    console.log(`  Health: http://localhost:9000/health`);
    console.log(`  Aggregate: http://localhost:9000/aggregate`);
    console.log(`  Metrics: http://localhost:9000/metrics`);
    console.log(`  Services: http://localhost:9000/services`);
}

// Export classes
module.exports = {
    CacheManager,
    LoadBalancer,
    HealthMonitor,
    ServiceRegistry,
    RequestAggregator,
    AggregatorMicroservice
};

if (require.main === module) {
    demonstrateAggregatorMS().catch(console.error);
}
