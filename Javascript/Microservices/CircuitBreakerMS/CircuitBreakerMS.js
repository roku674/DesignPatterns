/**
 * Circuit Breaker Microservice Pattern
 *
 * Purpose:
 * Circuit Breaker implemented as a dedicated microservice proxy that wraps
 * downstream services with circuit breaker protection. Acts as a protective
 * layer between clients and services.
 *
 * Use Cases:
 * - Centralized circuit breaker management
 * - Service mesh integration
 * - Distributed resilience patterns
 * - Multi-tenant circuit breaking
 *
 * Components:
 * - CircuitBreakerProxy: HTTP proxy with circuit breaker
 * - CircuitManager: Manages multiple circuit breakers
 * - ProxyRouter: Routes requests through circuit breakers
 * - MetricsEndpoint: Exposes circuit breaker metrics
 */

const http = require('http');
const EventEmitter = require('events');

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const CircuitState = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN'
};

class SimpleCircuitBreaker extends EventEmitter {
    constructor(name, options = {}) {
        super();
        this.name = name;
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 60000;
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.openedAt = null;
        this.totalCalls = 0;
        this.successfulCalls = 0;
        this.failedCalls = 0;
    }

    async execute(fn, correlationId) {
        if (!this.canExecute()) {
            throw new Error(`Circuit breaker is ${this.state}`);
        }

        this.totalCalls++;

        try {
            const result = await fn();
            this.onSuccess(correlationId);
            return result;
        } catch (error) {
            this.onFailure(correlationId);
            throw error;
        }
    }

    canExecute() {
        if (this.state === CircuitState.CLOSED) {
            return true;
        }

        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.openedAt >= this.resetTimeout) {
                this.transitionTo(CircuitState.HALF_OPEN);
                return true;
            }
            return false;
        }

        return true; // HALF_OPEN
    }

    onSuccess(correlationId) {
        this.successfulCalls++;
        this.failures = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            this.transitionTo(CircuitState.CLOSED);
        }
    }

    onFailure(correlationId) {
        this.failedCalls++;
        this.failures++;

        if (this.failures >= this.failureThreshold) {
            this.transitionTo(CircuitState.OPEN);
        }
    }

    transitionTo(newState) {
        const oldState = this.state;
        this.state = newState;

        console.log(`[CircuitBreaker] ${this.name}: ${oldState} -> ${newState}`);

        if (newState === CircuitState.OPEN) {
            this.openedAt = Date.now();
        }

        this.emit('stateChange', { name: this.name, from: oldState, to: newState });
    }

    getMetrics() {
        return {
            name: this.name,
            state: this.state,
            failures: this.failures,
            totalCalls: this.totalCalls,
            successfulCalls: this.successfulCalls,
            failedCalls: this.failedCalls,
            successRate: this.totalCalls > 0 ? this.successfulCalls / this.totalCalls : 0
        };
    }
}

class CircuitManager {
    constructor() {
        this.circuits = new Map();
    }

    getCircuit(serviceName, options = {}) {
        if (!this.circuits.has(serviceName)) {
            const circuit = new SimpleCircuitBreaker(serviceName, options);
            this.circuits.set(serviceName, circuit);
        }
        return this.circuits.get(serviceName);
    }

    getAllMetrics() {
        const metrics = {};
        this.circuits.forEach((circuit, name) => {
            metrics[name] = circuit.getMetrics();
        });
        return metrics;
    }
}

class ProxyRouter {
    constructor(manager) {
        this.manager = manager;
        this.routes = new Map();
    }

    registerRoute(path, serviceUrl, options = {}) {
        this.routes.set(path, {
            serviceUrl: serviceUrl,
            serviceName: options.serviceName || path,
            circuitOptions: options.circuit || {}
        });
    }

    async routeRequest(path, correlationId) {
        const route = this.routes.get(path);
        if (!route) {
            throw new Error('Route not found');
        }

        const circuit = this.manager.getCircuit(route.serviceName, route.circuitOptions);

        return circuit.execute(async () => {
            // Simulated service call
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (Math.random() > 0.2) {
                        resolve({
                            message: 'Success',
                            service: route.serviceName,
                            correlationId: correlationId
                        });
                    } else {
                        reject(new Error('Service error'));
                    }
                }, Math.random() * 100 + 50);
            });
        }, correlationId);
    }
}

class CircuitBreakerMS {
    constructor(port = 8080) {
        this.port = port;
        this.manager = new CircuitManager();
        this.router = new ProxyRouter(this.manager);
    }

    registerRoute(path, serviceUrl, options = {}) {
        this.router.registerRoute(path, serviceUrl, options);
        console.log(`[CircuitBreakerMS] Registered route: ${path} -> ${serviceUrl}`);
    }

    async handleRequest(req, res) {
        const correlationId = req.headers['x-correlation-id'] || generateUUID();
        const path = req.url.split('?')[0];

        // Metrics endpoint
        if (path === '/metrics') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(this.manager.getAllMetrics(), null, 2));
            return;
        }

        try {
            const result = await this.router.routeRequest(path, correlationId);

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
            });
            res.end(JSON.stringify(result));

        } catch (error) {
            const statusCode = error.message.includes('Circuit breaker') ? 503 : 500;

            res.writeHead(statusCode, {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
            });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, () => {
            console.log(`[CircuitBreakerMS] Proxy started on port ${this.port}`);
        });
    }

    stop() {
        if (this.server) {
            this.server.close(() => {
                console.log('[CircuitBreakerMS] Proxy stopped');
            });
        }
    }
}

// Example usage
if (require.main === module) {
    const proxy = new CircuitBreakerMS(8080);

    // Register routes with circuit breaker protection
    proxy.registerRoute('/users', 'http://localhost:3001/users', {
        serviceName: 'user-service',
        circuit: { failureThreshold: 3, resetTimeout: 5000 }
    });

    proxy.registerRoute('/orders', 'http://localhost:3002/orders', {
        serviceName: 'order-service',
        circuit: { failureThreshold: 5, resetTimeout: 10000 }
    });

    proxy.start();

    console.log('\n=== Circuit Breaker Microservice Pattern Demo ===\n');
    console.log('Circuit Breaker Proxy running on http://localhost:8080');
    console.log('Metrics endpoint: http://localhost:8080/metrics');
}

module.exports = {
    CircuitBreakerMS,
    CircuitManager,
    ProxyRouter,
    SimpleCircuitBreaker,
    CircuitState
};
