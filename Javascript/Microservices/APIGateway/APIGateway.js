/**
 * API Gateway Pattern Implementation
 *
 * Purpose:
 * The API Gateway pattern provides a single entry point for all clients,
 * routing requests to appropriate microservices, handling authentication,
 * rate limiting, request/response transformation, and distributed tracing.
 *
 * Use Cases:
 * - Mobile and web application backends
 * - Microservices architecture entry point
 * - Cross-cutting concerns management
 * - Request aggregation and orchestration
 * - Protocol translation (REST to gRPC, etc.)
 *
 * Components:
 * - Gateway: Routes requests to backend services
 * - ServiceRegistry: Tracks available services
 * - CircuitBreaker: Prevents cascading failures
 * - RateLimiter: Controls request rates
 * - DistributedTracer: Tracks requests across services
 */

const http = require('http');
const url = require('url');

/**
 * Generate a UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * ServiceRegistry maintains a registry of all available microservices
 */
class ServiceRegistry {
    constructor() {
        this.services = new Map();
        this.healthCheckInterval = 30000; // 30 seconds
        this.startHealthChecks();
    }

    /**
     * Register a service with the registry
     */
    register(serviceName, serviceUrl, metadata = {}) {
        const service = {
            name: serviceName,
            url: serviceUrl,
            metadata: metadata,
            healthy: true,
            lastHealthCheck: Date.now(),
            registeredAt: Date.now()
        };

        if (!this.services.has(serviceName)) {
            this.services.set(serviceName, []);
        }

        this.services.get(serviceName).push(service);
        console.log(`[ServiceRegistry] Registered service: ${serviceName} at ${serviceUrl}`);
        return service;
    }

    /**
     * Deregister a service
     */
    deregister(serviceName, serviceUrl) {
        if (this.services.has(serviceName)) {
            const instances = this.services.get(serviceName);
            const filtered = instances.filter(s => s.url !== serviceUrl);

            if (filtered.length === 0) {
                this.services.delete(serviceName);
            } else {
                this.services.set(serviceName, filtered);
            }

            console.log(`[ServiceRegistry] Deregistered service: ${serviceName} at ${serviceUrl}`);
        }
    }

    /**
     * Get a healthy service instance (load balancing with round-robin)
     */
    getService(serviceName) {
        if (!this.services.has(serviceName)) {
            throw new Error(`Service ${serviceName} not found`);
        }

        const instances = this.services.get(serviceName).filter(s => s.healthy);

        if (instances.length === 0) {
            throw new Error(`No healthy instances available for ${serviceName}`);
        }

        // Simple round-robin load balancing
        const instance = instances[Math.floor(Math.random() * instances.length)];
        return instance;
    }

    /**
     * Mark service as healthy or unhealthy
     */
    updateHealth(serviceName, serviceUrl, healthy) {
        if (this.services.has(serviceName)) {
            const instances = this.services.get(serviceName);
            const service = instances.find(s => s.url === serviceUrl);

            if (service) {
                service.healthy = healthy;
                service.lastHealthCheck = Date.now();
            }
        }
    }

    /**
     * Start periodic health checks for all services
     */
    startHealthChecks() {
        setInterval(() => {
            this.services.forEach((instances, serviceName) => {
                instances.forEach(service => {
                    this.performHealthCheck(serviceName, service);
                });
            });
        }, this.healthCheckInterval);
    }

    /**
     * Perform health check on a service
     */
    performHealthCheck(serviceName, service) {
        // Simulated health check - in production, make actual HTTP request
        const healthy = Math.random() > 0.1; // 90% chance of being healthy
        this.updateHealth(serviceName, service.url, healthy);

        if (!healthy) {
            console.log(`[ServiceRegistry] Health check failed for ${serviceName} at ${service.url}`);
        }
    }

    /**
     * Get all registered services
     */
    getAllServices() {
        const result = {};
        this.services.forEach((instances, serviceName) => {
            result[serviceName] = instances.map(s => ({
                url: s.url,
                healthy: s.healthy,
                metadata: s.metadata
            }));
        });
        return result;
    }
}

/**
 * Circuit Breaker prevents cascading failures
 */
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.failures = new Map();
        this.state = new Map(); // 'closed', 'open', 'half-open'
    }

    /**
     * Check if circuit is open for a service
     */
    isOpen(serviceName) {
        const state = this.state.get(serviceName) || 'closed';

        if (state === 'open') {
            const failureInfo = this.failures.get(serviceName);
            const now = Date.now();

            // Check if timeout has elapsed
            if (now - failureInfo.openedAt >= this.timeout) {
                this.state.set(serviceName, 'half-open');
                console.log(`[CircuitBreaker] Circuit half-open for ${serviceName}`);
                return false;
            }
            return true;
        }

        return false;
    }

    /**
     * Record a failure
     */
    recordFailure(serviceName) {
        if (!this.failures.has(serviceName)) {
            this.failures.set(serviceName, { count: 0, openedAt: null });
        }

        const failureInfo = this.failures.get(serviceName);
        failureInfo.count++;

        if (failureInfo.count >= this.threshold) {
            this.state.set(serviceName, 'open');
            failureInfo.openedAt = Date.now();
            console.log(`[CircuitBreaker] Circuit opened for ${serviceName}`);
        }
    }

    /**
     * Record a success
     */
    recordSuccess(serviceName) {
        const state = this.state.get(serviceName);

        if (state === 'half-open') {
            this.state.set(serviceName, 'closed');
            this.failures.delete(serviceName);
            console.log(`[CircuitBreaker] Circuit closed for ${serviceName}`);
        } else if (state === 'closed' && this.failures.has(serviceName)) {
            // Reset failure count on success
            this.failures.get(serviceName).count = 0;
        }
    }
}

/**
 * Rate Limiter controls request rates per client
 */
class RateLimiter {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    /**
     * Check if request is allowed
     */
    isAllowed(clientId) {
        const now = Date.now();

        if (!this.requests.has(clientId)) {
            this.requests.set(clientId, []);
        }

        const clientRequests = this.requests.get(clientId);

        // Remove old requests outside the window
        const validRequests = clientRequests.filter(timestamp => now - timestamp < this.windowMs);
        this.requests.set(clientId, validRequests);

        if (validRequests.length >= this.maxRequests) {
            return false;
        }

        validRequests.push(now);
        return true;
    }

    /**
     * Get remaining requests for client
     */
    getRemaining(clientId) {
        if (!this.requests.has(clientId)) {
            return this.maxRequests;
        }

        const now = Date.now();
        const clientRequests = this.requests.get(clientId);
        const validRequests = clientRequests.filter(timestamp => now - timestamp < this.windowMs);

        return Math.max(0, this.maxRequests - validRequests.length);
    }
}

/**
 * Distributed Tracer tracks requests across services
 */
class DistributedTracer {
    constructor() {
        this.traces = new Map();
    }

    /**
     * Start a new trace
     */
    startTrace(correlationId) {
        const trace = {
            correlationId: correlationId,
            startTime: Date.now(),
            spans: [],
            metadata: {}
        };

        this.traces.set(correlationId, trace);
        return trace;
    }

    /**
     * Add a span to the trace
     */
    addSpan(correlationId, serviceName, operation, duration, metadata = {}) {
        if (this.traces.has(correlationId)) {
            const trace = this.traces.get(correlationId);
            trace.spans.push({
                serviceName: serviceName,
                operation: operation,
                duration: duration,
                timestamp: Date.now(),
                metadata: metadata
            });
        }
    }

    /**
     * Complete a trace
     */
    completeTrace(correlationId) {
        if (this.traces.has(correlationId)) {
            const trace = this.traces.get(correlationId);
            trace.endTime = Date.now();
            trace.totalDuration = trace.endTime - trace.startTime;

            console.log(`[DistributedTracer] Trace completed: ${correlationId}`);
            console.log(`  Total duration: ${trace.totalDuration}ms`);
            console.log(`  Spans: ${trace.spans.length}`);

            return trace;
        }
        return null;
    }

    /**
     * Get trace by correlation ID
     */
    getTrace(correlationId) {
        return this.traces.get(correlationId);
    }
}

/**
 * API Gateway implementation
 */
class APIGateway {
    constructor(port = 8080) {
        this.port = port;
        this.serviceRegistry = new ServiceRegistry();
        this.circuitBreaker = new CircuitBreaker();
        this.rateLimiter = new RateLimiter();
        this.tracer = new DistributedTracer();
        this.routes = new Map();
        this.middleware = [];
    }

    /**
     * Register a route
     */
    registerRoute(path, serviceName, options = {}) {
        this.routes.set(path, {
            serviceName: serviceName,
            method: options.method || 'GET',
            timeout: options.timeout || 5000,
            retries: options.retries || 3
        });

        console.log(`[APIGateway] Registered route: ${path} -> ${serviceName}`);
    }

    /**
     * Add middleware
     */
    use(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * Route request to appropriate service
     */
    async routeRequest(req, res, correlationId) {
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;

        // Find matching route
        let route = null;
        for (const [routePath, routeConfig] of this.routes.entries()) {
            if (path.startsWith(routePath)) {
                route = routeConfig;
                break;
            }
        }

        if (!route) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Route not found' }));
            return;
        }

        // Check circuit breaker
        if (this.circuitBreaker.isOpen(route.serviceName)) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Service temporarily unavailable' }));
            return;
        }

        try {
            // Get service instance
            const service = this.serviceRegistry.getService(route.serviceName);
            const startTime = Date.now();

            // Simulate service call (in production, use actual HTTP client)
            const response = await this.callService(service, req, correlationId);
            const duration = Date.now() - startTime;

            // Record success
            this.circuitBreaker.recordSuccess(route.serviceName);
            this.tracer.addSpan(correlationId, route.serviceName, req.method, duration, {
                path: path,
                statusCode: 200
            });

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
            });
            res.end(JSON.stringify(response));

        } catch (error) {
            // Record failure
            this.circuitBreaker.recordFailure(route.serviceName);

            res.writeHead(500, {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
            });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    /**
     * Call a service (simulated)
     */
    async callService(service, req, correlationId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 10% failure rate
                if (Math.random() < 0.1) {
                    reject(new Error('Service error'));
                } else {
                    resolve({
                        message: 'Success',
                        service: service.name,
                        correlationId: correlationId,
                        timestamp: Date.now()
                    });
                }
            }, Math.random() * 100 + 50); // 50-150ms latency
        });
    }

    /**
     * Handle incoming request
     */
    handleRequest(req, res) {
        const correlationId = req.headers['x-correlation-id'] || generateUUID();
        const clientId = req.headers['x-client-id'] || req.connection.remoteAddress;

        // Start trace
        this.tracer.startTrace(correlationId);

        // Rate limiting
        if (!this.rateLimiter.isAllowed(clientId)) {
            const remaining = this.rateLimiter.getRemaining(clientId);
            res.writeHead(429, {
                'Content-Type': 'application/json',
                'X-RateLimit-Remaining': remaining.toString()
            });
            res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
            return;
        }

        // Execute middleware chain
        let middlewareIndex = 0;
        const next = () => {
            if (middlewareIndex < this.middleware.length) {
                const middleware = this.middleware[middlewareIndex++];
                middleware(req, res, next);
            } else {
                // Route the request
                this.routeRequest(req, res, correlationId).then(() => {
                    this.tracer.completeTrace(correlationId);
                });
            }
        };

        next();
    }

    /**
     * Start the gateway server
     */
    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, () => {
            console.log(`[APIGateway] Server started on port ${this.port}`);
        });
    }

    /**
     * Stop the gateway server
     */
    stop() {
        if (this.server) {
            this.server.close(() => {
                console.log('[APIGateway] Server stopped');
            });
        }
    }
}

// Example usage demonstration
if (require.main === module) {
    // Create API Gateway
    const gateway = new APIGateway(8080);

    // Register services
    gateway.serviceRegistry.register('user-service', 'http://localhost:3001', { version: 'v1' });
    gateway.serviceRegistry.register('order-service', 'http://localhost:3002', { version: 'v1' });
    gateway.serviceRegistry.register('product-service', 'http://localhost:3003', { version: 'v1' });

    // Register routes
    gateway.registerRoute('/users', 'user-service');
    gateway.registerRoute('/orders', 'order-service');
    gateway.registerRoute('/products', 'product-service');

    // Add authentication middleware
    gateway.use((req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Authorization required' }));
            return;
        }
        next();
    });

    // Add logging middleware
    gateway.use((req, res, next) => {
        console.log(`[APIGateway] ${req.method} ${req.url}`);
        next();
    });

    // Start gateway
    gateway.start();

    console.log('\n=== API Gateway Pattern Demo ===');
    console.log('Gateway running on http://localhost:8080');
    console.log('\nRegistered Services:');
    console.log(JSON.stringify(gateway.serviceRegistry.getAllServices(), null, 2));
    console.log('\nTry making requests to:');
    console.log('  - http://localhost:8080/users');
    console.log('  - http://localhost:8080/orders');
    console.log('  - http://localhost:8080/products');
}

module.exports = {
    APIGateway,
    ServiceRegistry,
    CircuitBreaker,
    RateLimiter,
    DistributedTracer
};
