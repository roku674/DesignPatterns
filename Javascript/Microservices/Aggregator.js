/**
 * Aggregator Pattern
 *
 * The Aggregator pattern collects data from multiple microservices and combines
 * them into a single response. This pattern acts as a composition layer that
 * coordinates calls to multiple services and aggregates their responses.
 *
 * Key Components:
 * - Aggregator: Coordinates calls to multiple services
 * - Service Clients: Interfaces to individual microservices
 * - Response Composer: Combines multiple service responses
 * - Circuit Breaker: Handles service failures gracefully
 *
 * Benefits:
 * - Simplified client interface
 * - Reduced client-side complexity
 * - Single point of data composition
 * - Better performance through parallel requests
 * - Centralized error handling
 *
 * Use Cases:
 * - Dashboard data composition
 * - API gateways
 * - Backend for frontend (BFF) pattern
 * - Complex data queries spanning multiple services
 */

const EventEmitter = require('events');
const http = require('http');

/**
 * ServiceClient - Client for communicating with individual microservices
 */
class ServiceClient {
    constructor(config) {
        this.serviceName = config.serviceName;
        this.baseUrl = config.baseUrl;
        this.timeout = config.timeout || 5000;
        this.retries = config.retries || 0;
        this.circuitBreaker = config.circuitBreaker || null;
    }

    /**
     * Make request to service
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const method = options.method || 'GET';
        const body = options.body;

        console.log(`[Client ${this.serviceName}] ${method} ${endpoint}`);

        // Check circuit breaker
        if (this.circuitBreaker && !this.circuitBreaker.allowRequest()) {
            throw new Error(`Circuit breaker open for ${this.serviceName}`);
        }

        try {
            const result = await this.executeRequest(url, method, body);

            // Report success to circuit breaker
            if (this.circuitBreaker) {
                this.circuitBreaker.recordSuccess();
            }

            return result;
        } catch (error) {
            // Report failure to circuit breaker
            if (this.circuitBreaker) {
                this.circuitBreaker.recordFailure();
            }

            // Retry if configured
            if (this.retries > 0) {
                return this.retryRequest(endpoint, options, this.retries);
            }

            throw error;
        }
    }

    /**
     * Execute HTTP request
     */
    async executeRequest(url, method, body) {
        // Simulate HTTP request
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional failures
                if (Math.random() < 0.1) { // 10% failure rate
                    reject(new Error(`Request to ${this.serviceName} failed`));
                    return;
                }

                resolve({
                    service: this.serviceName,
                    data: { message: `Response from ${this.serviceName}`, timestamp: new Date() },
                    status: 200
                });
            }, Math.random() * 100);
        });
    }

    /**
     * Retry failed request
     */
    async retryRequest(endpoint, options, retriesLeft) {
        console.log(`[Client ${this.serviceName}] Retrying... (${retriesLeft} left)`);

        try {
            return await this.request(endpoint, { ...options, retries: retriesLeft - 1 });
        } catch (error) {
            if (retriesLeft <= 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.retryRequest(endpoint, options, retriesLeft - 1);
        }
    }
}

/**
 * CircuitBreaker - Protects against cascading failures
 */
class CircuitBreaker {
    constructor(config) {
        this.serviceName = config.serviceName;
        this.threshold = config.threshold || 5;
        this.timeout = config.timeout || 60000;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.successCount = 0;
    }

    /**
     * Check if request is allowed
     */
    allowRequest() {
        if (this.state === 'CLOSED') {
            return true;
        }

        if (this.state === 'OPEN') {
            // Check if timeout has elapsed
            if (Date.now() - this.lastFailureTime > this.timeout) {
                console.log(`[CircuitBreaker ${this.serviceName}] Transitioning to HALF_OPEN`);
                this.state = 'HALF_OPEN';
                return true;
            }
            return false;
        }

        if (this.state === 'HALF_OPEN') {
            return true;
        }

        return false;
    }

    /**
     * Record successful request
     */
    recordSuccess() {
        this.failureCount = 0;

        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= 3) {
                console.log(`[CircuitBreaker ${this.serviceName}] Transitioning to CLOSED`);
                this.state = 'CLOSED';
                this.successCount = 0;
            }
        }
    }

    /**
     * Record failed request
     */
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.threshold) {
            console.log(`[CircuitBreaker ${this.serviceName}] Transitioning to OPEN`);
            this.state = 'OPEN';
        }

        if (this.state === 'HALF_OPEN') {
            console.log(`[CircuitBreaker ${this.serviceName}] Transitioning back to OPEN`);
            this.state = 'OPEN';
            this.successCount = 0;
        }
    }

    /**
     * Get circuit breaker state
     */
    getState() {
        return {
            serviceName: this.serviceName,
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount
        };
    }
}

/**
 * ResponseComposer - Composes responses from multiple services
 */
class ResponseComposer {
    constructor() {
        this.strategies = new Map();
        this.initializeStrategies();
    }

    /**
     * Initialize composition strategies
     */
    initializeStrategies() {
        // Merge strategy - combines all responses into one object
        this.strategies.set('merge', (responses) => {
            const merged = {};
            for (const response of responses) {
                if (response.success) {
                    merged[response.service] = response.data;
                }
            }
            return merged;
        });

        // Array strategy - returns array of responses
        this.strategies.set('array', (responses) => {
            return responses.map(r => ({
                service: r.service,
                data: r.success ? r.data : null,
                error: r.success ? null : r.error
            }));
        });

        // First successful strategy - returns first successful response
        this.strategies.set('first', (responses) => {
            const successful = responses.find(r => r.success);
            return successful ? successful.data : null;
        });

        // Custom merge with priorities
        this.strategies.set('priority', (responses, priorities = {}) => {
            const sorted = responses
                .filter(r => r.success)
                .sort((a, b) => {
                    const priorityA = priorities[a.service] || 0;
                    const priorityB = priorities[b.service] || 0;
                    return priorityB - priorityA;
                });

            return sorted.length > 0 ? sorted[0].data : null;
        });
    }

    /**
     * Compose responses using specified strategy
     */
    compose(responses, strategy = 'merge', options = {}) {
        const composerFunction = this.strategies.get(strategy);

        if (!composerFunction) {
            throw new Error(`Unknown composition strategy: ${strategy}`);
        }

        return composerFunction(responses, options);
    }

    /**
     * Add custom composition strategy
     */
    addStrategy(name, strategyFunction) {
        this.strategies.set(name, strategyFunction);
    }
}

/**
 * Aggregator - Main aggregator that coordinates service calls
 */
class Aggregator extends EventEmitter {
    constructor(config) {
        super();
        this.name = config.name || 'Aggregator';
        this.clients = new Map();
        this.composer = new ResponseComposer();
        this.defaultTimeout = config.timeout || 10000;
        this.parallel = config.parallel !== false;
    }

    /**
     * Register service client
     */
    registerClient(serviceName, client) {
        this.clients.set(serviceName, client);
        console.log(`[${this.name}] Client registered: ${serviceName}`);
    }

    /**
     * Aggregate data from multiple services
     */
    async aggregate(serviceRequests, options = {}) {
        const strategy = options.strategy || 'merge';
        const timeout = options.timeout || this.defaultTimeout;

        console.log(`[${this.name}] Aggregating data from ${serviceRequests.length} services`);

        this.emit('aggregationStarted', { serviceCount: serviceRequests.length });

        let responses;

        if (this.parallel) {
            // Execute requests in parallel
            responses = await this.executeParallel(serviceRequests, timeout);
        } else {
            // Execute requests sequentially
            responses = await this.executeSequential(serviceRequests);
        }

        // Compose final response
        const composed = this.composer.compose(responses, strategy, options);

        this.emit('aggregationCompleted', {
            serviceCount: serviceRequests.length,
            successCount: responses.filter(r => r.success).length,
            failureCount: responses.filter(r => !r.success).length
        });

        return {
            data: composed,
            metadata: {
                totalServices: serviceRequests.length,
                successfulServices: responses.filter(r => r.success).length,
                failedServices: responses.filter(r => !r.success).length,
                responses: responses
            }
        };
    }

    /**
     * Execute service requests in parallel
     */
    async executeParallel(serviceRequests, timeout) {
        const promises = serviceRequests.map(request => {
            return this.executeServiceRequest(request)
                .catch(error => ({
                    service: request.service,
                    success: false,
                    error: error.message
                }));
        });

        // Wait for all requests with timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Aggregation timeout')), timeout);
        });

        try {
            return await Promise.race([
                Promise.all(promises),
                timeoutPromise
            ]);
        } catch (error) {
            console.error(`[${this.name}] Aggregation error:`, error.message);
            throw error;
        }
    }

    /**
     * Execute service requests sequentially
     */
    async executeSequential(serviceRequests) {
        const responses = [];

        for (const request of serviceRequests) {
            try {
                const response = await this.executeServiceRequest(request);
                responses.push(response);
            } catch (error) {
                responses.push({
                    service: request.service,
                    success: false,
                    error: error.message
                });
            }
        }

        return responses;
    }

    /**
     * Execute single service request
     */
    async executeServiceRequest(request) {
        const client = this.clients.get(request.service);

        if (!client) {
            throw new Error(`Client not found for service: ${request.service}`);
        }

        try {
            const result = await client.request(request.endpoint, request.options);

            return {
                service: request.service,
                success: true,
                data: result.data,
                status: result.status
            };
        } catch (error) {
            return {
                service: request.service,
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Add custom composition strategy
     */
    addCompositionStrategy(name, strategyFunction) {
        this.composer.addStrategy(name, strategyFunction);
    }

    /**
     * Get aggregator statistics
     */
    getStatistics() {
        return {
            name: this.name,
            clientCount: this.clients.size,
            parallel: this.parallel
        };
    }
}

/**
 * AggregatorService - HTTP service that exposes aggregator functionality
 */
class AggregatorService extends EventEmitter {
    constructor(config) {
        super();
        this.name = config.name || 'AggregatorService';
        this.port = config.port || 4000;
        this.host = config.host || 'localhost';
        this.aggregator = config.aggregator;
        this.server = null;
    }

    /**
     * Start the service
     */
    async start() {
        console.log(`[${this.name}] Starting on ${this.host}:${this.port}`);

        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        await new Promise((resolve) => {
            this.server.listen(this.port, this.host, () => {
                console.log(`[${this.name}] Listening on ${this.host}:${this.port}`);
                resolve();
            });
        });
    }

    /**
     * Stop the service
     */
    async stop() {
        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(resolve);
            });
        }
        console.log(`[${this.name}] Stopped`);
    }

    /**
     * Handle incoming requests
     */
    async handleRequest(req, res) {
        const url = req.url;

        if (url === '/health') {
            this.handleHealth(req, res);
        } else if (url === '/aggregate') {
            await this.handleAggregate(req, res);
        } else if (url === '/stats') {
            this.handleStats(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    }

    /**
     * Health check endpoint
     */
    handleHealth(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy' }));
    }

    /**
     * Aggregation endpoint
     */
    async handleAggregate(req, res) {
        try {
            // In a real implementation, parse request body for service requests
            const serviceRequests = [
                { service: 'user-service', endpoint: '/api/user' },
                { service: 'order-service', endpoint: '/api/orders' },
                { service: 'inventory-service', endpoint: '/api/inventory' }
            ];

            const result = await this.aggregator.aggregate(serviceRequests);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    /**
     * Statistics endpoint
     */
    handleStats(req, res) {
        const stats = this.aggregator.getStatistics();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stats));
    }
}

// Demonstration
async function demonstrateAggregator() {
    console.log('=== Aggregator Pattern Demonstration ===\n');

    // Create circuit breakers for services
    const userCircuitBreaker = new CircuitBreaker({
        serviceName: 'user-service',
        threshold: 3,
        timeout: 30000
    });

    const orderCircuitBreaker = new CircuitBreaker({
        serviceName: 'order-service',
        threshold: 3,
        timeout: 30000
    });

    // Create service clients
    const userClient = new ServiceClient({
        serviceName: 'user-service',
        baseUrl: 'http://localhost:3001',
        timeout: 5000,
        retries: 2,
        circuitBreaker: userCircuitBreaker
    });

    const orderClient = new ServiceClient({
        serviceName: 'order-service',
        baseUrl: 'http://localhost:3002',
        timeout: 5000,
        retries: 2,
        circuitBreaker: orderCircuitBreaker
    });

    const inventoryClient = new ServiceClient({
        serviceName: 'inventory-service',
        baseUrl: 'http://localhost:3003',
        timeout: 5000,
        retries: 1
    });

    // Create aggregator
    const aggregator = new Aggregator({
        name: 'DataAggregator',
        parallel: true,
        timeout: 10000
    });

    // Register clients
    aggregator.registerClient('user-service', userClient);
    aggregator.registerClient('order-service', orderClient);
    aggregator.registerClient('inventory-service', inventoryClient);

    // Listen to aggregation events
    aggregator.on('aggregationStarted', (data) => {
        console.log(`\n[Event] Aggregation started with ${data.serviceCount} services`);
    });

    aggregator.on('aggregationCompleted', (data) => {
        console.log(`[Event] Aggregation completed: ${data.successCount} succeeded, ${data.failureCount} failed`);
    });

    // Define service requests
    const serviceRequests = [
        { service: 'user-service', endpoint: '/api/user/123' },
        { service: 'order-service', endpoint: '/api/orders/user/123' },
        { service: 'inventory-service', endpoint: '/api/inventory/available' }
    ];

    // Test different composition strategies
    console.log('\n--- Testing Merge Strategy ---');
    const mergeResult = await aggregator.aggregate(serviceRequests, { strategy: 'merge' });
    console.log('Result:', JSON.stringify(mergeResult.data, null, 2));
    console.log('Metadata:', JSON.stringify(mergeResult.metadata, null, 2));

    console.log('\n--- Testing Array Strategy ---');
    const arrayResult = await aggregator.aggregate(serviceRequests, { strategy: 'array' });
    console.log('Result:', JSON.stringify(arrayResult.data, null, 2));

    // Add custom composition strategy
    console.log('\n--- Testing Custom Strategy ---');
    aggregator.addCompositionStrategy('summary', (responses) => {
        const summary = {
            totalServices: responses.length,
            successful: responses.filter(r => r.success).length,
            services: responses.map(r => r.service)
        };
        return summary;
    });

    const summaryResult = await aggregator.aggregate(serviceRequests, { strategy: 'summary' });
    console.log('Summary:', JSON.stringify(summaryResult.data, null, 2));

    // Show circuit breaker states
    console.log('\n--- Circuit Breaker States ---');
    console.log('User Service:', JSON.stringify(userCircuitBreaker.getState(), null, 2));
    console.log('Order Service:', JSON.stringify(orderCircuitBreaker.getState(), null, 2));

    // Show aggregator statistics
    console.log('\n--- Aggregator Statistics ---');
    const stats = aggregator.getStatistics();
    console.log(JSON.stringify(stats, null, 2));
}

// Export classes
module.exports = {
    ServiceClient,
    CircuitBreaker,
    ResponseComposer,
    Aggregator,
    AggregatorService
};

if (require.main === module) {
    demonstrateAggregator().catch(console.error);
}
