/**
 * StranglerMS Pattern (Microservices-Specific Implementation)
 *
 * This is a microservices-specific implementation of the Strangler pattern that focuses
 * on service mesh integration, distributed tracing, circuit breakers, and sophisticated
 * traffic routing strategies. It provides additional features for managing complex
 * microservices environments during migration.
 *
 * Key Components:
 * - ServiceMesh: Manages service-to-service communication
 * - TrafficRouter: Advanced routing with A/B testing and shadow traffic
 * - CircuitBreaker: Prevents cascading failures
 * - DistributedTracer: Tracks requests across services
 * - MigrationOrchestrator: Orchestrates complex migrations
 *
 * Benefits:
 * - Service mesh integration
 * - Advanced traffic management
 * - Distributed tracing support
 * - Circuit breaker pattern
 * - Shadow traffic testing
 * - A/B testing capabilities
 *
 * Use Cases:
 * - Complex microservices migrations
 * - Multi-tenant system upgrades
 * - Progressive rollouts
 * - Blue-green deployments
 * - Shadow traffic testing
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * TrafficStrategy - Traffic routing strategies
 * @enum {string}
 */
const TrafficStrategy = {
    CANARY: 'canary',
    BLUE_GREEN: 'blue_green',
    SHADOW: 'shadow',
    AB_TEST: 'ab_test',
    PERCENTAGE: 'percentage',
    HEADER_BASED: 'header_based',
    GEO_BASED: 'geo_based'
};

/**
 * CircuitState - Circuit breaker states
 * @enum {string}
 */
const CircuitState = {
    CLOSED: 'closed',
    OPEN: 'open',
    HALF_OPEN: 'half_open'
};

/**
 * TraceContext - Distributed tracing context
 * @class
 */
class TraceContext {
    /**
     * Create a new trace context
     * @param {Object} config - Configuration
     */
    constructor(config = {}) {
        this.traceId = config.traceId || crypto.randomUUID();
        this.spanId = config.spanId || crypto.randomUUID();
        this.parentSpanId = config.parentSpanId || null;
        this.startTime = Date.now();
        this.spans = [];
        this.metadata = config.metadata || {};
    }

    /**
     * Create a child span
     * @param {string} name - Span name
     * @returns {Object}
     */
    createSpan(name) {
        const span = {
            spanId: crypto.randomUUID(),
            parentSpanId: this.spanId,
            name,
            startTime: Date.now(),
            endTime: null,
            tags: {},
            logs: []
        };

        this.spans.push(span);
        return span;
    }

    /**
     * End a span
     * @param {Object} span - Span to end
     */
    endSpan(span) {
        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
    }

    /**
     * Add tag to span
     * @param {Object} span - Span
     * @param {string} key - Tag key
     * @param {*} value - Tag value
     */
    addTag(span, key, value) {
        span.tags[key] = value;
    }

    /**
     * Add log to span
     * @param {Object} span - Span
     * @param {string} message - Log message
     */
    addLog(span, message) {
        span.logs.push({
            timestamp: Date.now(),
            message
        });
    }

    /**
     * Get trace summary
     * @returns {Object}
     */
    getSummary() {
        return {
            traceId: this.traceId,
            totalSpans: this.spans.length,
            totalDuration: Date.now() - this.startTime,
            spans: this.spans.map(s => ({
                name: s.name,
                duration: s.duration,
                tags: s.tags
            }))
        };
    }
}

/**
 * CircuitBreaker - Prevents cascading failures
 * @class
 * @extends EventEmitter
 */
class CircuitBreaker extends EventEmitter {
    /**
     * Create a new circuit breaker
     * @param {Object} config - Configuration
     */
    constructor(config = {}) {
        super();
        this.name = config.name || 'CircuitBreaker';
        this.failureThreshold = config.failureThreshold || 5;
        this.resetTimeout = config.resetTimeout || 60000;
        this.halfOpenRequests = config.halfOpenRequests || 3;

        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.halfOpenAttempts = 0;
    }

    /**
     * Execute function with circuit breaker
     * @param {Function} fn - Function to execute
     * @returns {Promise<*>}
     */
    async execute(fn) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
                console.log(`[${this.name}] Circuit transitioning to HALF_OPEN`);
                this.state = CircuitState.HALF_OPEN;
                this.halfOpenAttempts = 0;
                this.emit('state-changed', { state: this.state });
            } else {
                const error = new Error('Circuit breaker is OPEN');
                this.emit('request-rejected', { reason: 'circuit open' });
                throw error;
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    /**
     * Handle successful execution
     */
    onSuccess() {
        this.successCount++;

        if (this.state === CircuitState.HALF_OPEN) {
            this.halfOpenAttempts++;

            if (this.halfOpenAttempts >= this.halfOpenRequests) {
                console.log(`[${this.name}] Circuit transitioning to CLOSED`);
                this.state = CircuitState.CLOSED;
                this.failureCount = 0;
                this.successCount = 0;
                this.emit('state-changed', { state: this.state });
            }
        } else if (this.state === CircuitState.CLOSED) {
            this.failureCount = Math.max(0, this.failureCount - 1);
        }
    }

    /**
     * Handle failed execution
     */
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.state === CircuitState.HALF_OPEN) {
            console.log(`[${this.name}] Circuit transitioning to OPEN (failure in half-open)`);
            this.state = CircuitState.OPEN;
            this.emit('state-changed', { state: this.state });
        } else if (this.state === CircuitState.CLOSED) {
            if (this.failureCount >= this.failureThreshold) {
                console.log(`[${this.name}] Circuit transitioning to OPEN (threshold reached)`);
                this.state = CircuitState.OPEN;
                this.emit('state-changed', { state: this.state });
            }
        }
    }

    /**
     * Get circuit breaker status
     * @returns {Object}
     */
    getStatus() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime
        };
    }

    /**
     * Reset circuit breaker
     */
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        console.log(`[${this.name}] Circuit breaker reset`);
        this.emit('reset');
    }
}

/**
 * ServiceInstance - Represents a service instance
 * @class
 */
class ServiceInstance {
    /**
     * Create a new service instance
     * @param {Object} config - Configuration
     */
    constructor(config) {
        this.id = config.id || crypto.randomUUID();
        this.serviceName = config.serviceName;
        this.endpoint = config.endpoint;
        this.version = config.version;
        this.weight = config.weight || 1;
        this.metadata = config.metadata || {};
        this.health = {
            status: 'healthy',
            lastCheck: null,
            consecutiveFailures: 0
        };
        this.circuitBreaker = new CircuitBreaker({
            name: `${config.serviceName}-${this.id}`,
            failureThreshold: config.circuitBreakerThreshold || 5
        });
    }

    /**
     * Call the service instance
     * @param {Object} request - Request data
     * @param {TraceContext} traceContext - Trace context
     * @returns {Promise<Object>}
     */
    async call(request, traceContext) {
        const span = traceContext.createSpan(`call-${this.serviceName}`);
        traceContext.addTag(span, 'service', this.serviceName);
        traceContext.addTag(span, 'version', this.version);
        traceContext.addTag(span, 'endpoint', this.endpoint);

        try {
            const result = await this.circuitBreaker.execute(async () => {
                return await this.executeCall(request);
            });

            traceContext.addTag(span, 'status', 'success');
            traceContext.endSpan(span);

            this.health.consecutiveFailures = 0;
            return result;
        } catch (error) {
            this.health.consecutiveFailures++;
            traceContext.addTag(span, 'status', 'error');
            traceContext.addTag(span, 'error', error.message);
            traceContext.endSpan(span);
            throw error;
        }
    }

    /**
     * Execute the actual service call
     * @param {Object} request - Request data
     * @returns {Promise<Object>}
     */
    async executeCall(request) {
        // Simulate service call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.05) {
                    reject(new Error(`Service ${this.serviceName} failed`));
                } else {
                    resolve({
                        instanceId: this.id,
                        serviceName: this.serviceName,
                        version: this.version,
                        data: {
                            message: `Processed by ${this.serviceName} v${this.version}`,
                            timestamp: new Date()
                        }
                    });
                }
            }, Math.random() * 100);
        });
    }

    /**
     * Update health status
     * @param {boolean} healthy - Is healthy
     */
    updateHealth(healthy) {
        this.health.status = healthy ? 'healthy' : 'unhealthy';
        this.health.lastCheck = new Date();

        if (healthy) {
            this.health.consecutiveFailures = 0;
        }
    }

    /**
     * Check if instance is healthy
     * @returns {boolean}
     */
    isHealthy() {
        return this.health.status === 'healthy' &&
               this.circuitBreaker.state !== CircuitState.OPEN;
    }
}

/**
 * TrafficRouter - Advanced traffic routing
 * @class
 */
class TrafficRouter {
    /**
     * Create a new traffic router
     * @param {Object} config - Configuration
     */
    constructor(config = {}) {
        this.strategy = config.strategy || TrafficStrategy.CANARY;
        this.legacyInstances = [];
        this.newInstances = [];
        this.rules = config.rules || {};
    }

    /**
     * Add legacy service instance
     * @param {ServiceInstance} instance - Service instance
     */
    addLegacyInstance(instance) {
        this.legacyInstances.push(instance);
    }

    /**
     * Add new service instance
     * @param {ServiceInstance} instance - Service instance
     */
    addNewInstance(instance) {
        this.newInstances.push(instance);
    }

    /**
     * Route request to appropriate instance
     * @param {Object} request - Request data
     * @param {Object} context - Routing context
     * @returns {ServiceInstance}
     */
    route(request, context = {}) {
        switch (this.strategy) {
            case TrafficStrategy.CANARY:
                return this.canaryRoute(context.canaryPercentage || 0);

            case TrafficStrategy.BLUE_GREEN:
                return this.blueGreenRoute(context.activeVersion || 'legacy');

            case TrafficStrategy.SHADOW:
                return this.shadowRoute();

            case TrafficStrategy.AB_TEST:
                return this.abTestRoute(request, context);

            case TrafficStrategy.HEADER_BASED:
                return this.headerBasedRoute(request);

            case TrafficStrategy.GEO_BASED:
                return this.geoBasedRoute(request, context);

            default:
                return this.canaryRoute(context.canaryPercentage || 0);
        }
    }

    /**
     * Canary routing
     * @param {number} percentage - Percentage to route to new
     * @returns {ServiceInstance}
     */
    canaryRoute(percentage) {
        const useNew = Math.random() * 100 < percentage;
        const instances = useNew ? this.newInstances : this.legacyInstances;
        return this.selectHealthyInstance(instances);
    }

    /**
     * Blue-green routing
     * @param {string} activeVersion - Active version
     * @returns {ServiceInstance}
     */
    blueGreenRoute(activeVersion) {
        const instances = activeVersion === 'new' ? this.newInstances : this.legacyInstances;
        return this.selectHealthyInstance(instances);
    }

    /**
     * Shadow routing - returns both legacy and new
     * @returns {Object}
     */
    shadowRoute() {
        return {
            primary: this.selectHealthyInstance(this.legacyInstances),
            shadow: this.selectHealthyInstance(this.newInstances)
        };
    }

    /**
     * A/B test routing
     * @param {Object} request - Request data
     * @param {Object} context - Context
     * @returns {ServiceInstance}
     */
    abTestRoute(request, context) {
        const userId = request.userId || request.customerId;

        if (!userId) {
            return this.selectHealthyInstance(this.legacyInstances);
        }

        // Consistent hashing for A/B testing
        const hash = this.hashCode(userId.toString());
        const bucket = hash % 100;

        const testPercentage = context.testPercentage || 50;
        const instances = bucket < testPercentage ? this.newInstances : this.legacyInstances;
        return this.selectHealthyInstance(instances);
    }

    /**
     * Header-based routing
     * @param {Object} request - Request data
     * @returns {ServiceInstance}
     */
    headerBasedRoute(request) {
        const headers = request.headers || {};

        if (headers['x-use-new-version'] === 'true') {
            return this.selectHealthyInstance(this.newInstances);
        }

        if (headers['x-version']) {
            const instances = headers['x-version'] === 'new'
                ? this.newInstances
                : this.legacyInstances;
            return this.selectHealthyInstance(instances);
        }

        return this.selectHealthyInstance(this.legacyInstances);
    }

    /**
     * Geo-based routing
     * @param {Object} request - Request data
     * @param {Object} context - Context
     * @returns {ServiceInstance}
     */
    geoBasedRoute(request, context) {
        const region = request.region || context.region;
        const enabledRegions = context.enabledRegions || [];

        if (enabledRegions.includes(region)) {
            return this.selectHealthyInstance(this.newInstances);
        }

        return this.selectHealthyInstance(this.legacyInstances);
    }

    /**
     * Select healthy instance using weighted round-robin
     * @param {Array<ServiceInstance>} instances - Instances to choose from
     * @returns {ServiceInstance}
     */
    selectHealthyInstance(instances) {
        const healthyInstances = instances.filter(i => i.isHealthy());

        if (healthyInstances.length === 0) {
            throw new Error('No healthy instances available');
        }

        // Weighted random selection
        const totalWeight = healthyInstances.reduce((sum, i) => sum + i.weight, 0);
        let random = Math.random() * totalWeight;

        for (const instance of healthyInstances) {
            random -= instance.weight;
            if (random <= 0) {
                return instance;
            }
        }

        return healthyInstances[0];
    }

    /**
     * Simple hash code function
     * @param {string} str - String to hash
     * @returns {number}
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    /**
     * Get routing statistics
     * @returns {Object}
     */
    getStatistics() {
        return {
            strategy: this.strategy,
            legacyInstances: this.legacyInstances.length,
            newInstances: this.newInstances.length,
            healthyLegacy: this.legacyInstances.filter(i => i.isHealthy()).length,
            healthyNew: this.newInstances.filter(i => i.isHealthy()).length
        };
    }
}

/**
 * MigrationOrchestrator - Orchestrates complex migrations
 * @class
 * @extends EventEmitter
 */
class MigrationOrchestrator extends EventEmitter {
    /**
     * Create a new migration orchestrator
     * @param {Object} config - Configuration
     */
    constructor(config = {}) {
        super();
        this.name = config.name || 'MigrationOrchestrator';
        this.services = new Map();
        this.routers = new Map();
        this.tracers = [];
        this.metrics = new Map();
    }

    /**
     * Register a service for migration
     * @param {string} serviceName - Service name
     * @param {Object} config - Service configuration
     */
    registerService(serviceName, config) {
        if (this.services.has(serviceName)) {
            throw new Error(`Service ${serviceName} already registered`);
        }

        const router = new TrafficRouter({
            strategy: config.strategy || TrafficStrategy.CANARY,
            rules: config.rules || {}
        });

        // Add legacy instances
        for (const legacyConfig of config.legacyInstances || []) {
            const instance = new ServiceInstance({
                ...legacyConfig,
                serviceName: `${serviceName}-legacy`
            });
            router.addLegacyInstance(instance);
        }

        // Add new instances
        for (const newConfig of config.newInstances || []) {
            const instance = new ServiceInstance({
                ...newConfig,
                serviceName: `${serviceName}-new`
            });
            router.addNewInstance(instance);
        }

        this.services.set(serviceName, {
            config,
            router,
            status: 'registered'
        });

        this.routers.set(serviceName, router);

        // Initialize metrics
        this.metrics.set(serviceName, {
            totalRequests: 0,
            legacyRequests: 0,
            newRequests: 0,
            shadowRequests: 0,
            errors: 0,
            avgResponseTime: 0
        });

        console.log(`[${this.name}] Registered service: ${serviceName}`);
    }

    /**
     * Route request through migration
     * @param {string} serviceName - Service name
     * @param {Object} request - Request data
     * @param {Object} context - Routing context
     * @returns {Promise<Object>}
     */
    async route(serviceName, request, context = {}) {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not registered`);
        }

        const traceContext = new TraceContext({
            metadata: { serviceName, request }
        });

        const startTime = Date.now();

        try {
            const router = service.router;
            const metrics = this.metrics.get(serviceName);
            metrics.totalRequests++;

            let result;

            if (router.strategy === TrafficStrategy.SHADOW) {
                // Shadow traffic - call both but only return primary
                const { primary, shadow } = router.route(request, context);

                // Call primary
                const primarySpan = traceContext.createSpan('primary-call');
                result = await primary.call(request, traceContext);
                traceContext.endSpan(primarySpan);
                metrics.legacyRequests++;

                // Call shadow (don't await, don't throw on error)
                if (shadow) {
                    const shadowSpan = traceContext.createSpan('shadow-call');
                    shadow.call(request, traceContext)
                        .then(() => {
                            traceContext.endSpan(shadowSpan);
                            metrics.shadowRequests++;
                        })
                        .catch((error) => {
                            traceContext.addTag(shadowSpan, 'error', error.message);
                            traceContext.endSpan(shadowSpan);
                        });
                }
            } else {
                // Normal routing
                const instance = router.route(request, context);
                const isNew = router.newInstances.includes(instance);

                if (isNew) {
                    metrics.newRequests++;
                } else {
                    metrics.legacyRequests++;
                }

                result = await instance.call(request, traceContext);
            }

            const responseTime = Date.now() - startTime;
            metrics.avgResponseTime =
                (metrics.avgResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests;

            this.tracers.push(traceContext);

            this.emit('request-completed', {
                serviceName,
                success: true,
                responseTime,
                traceId: traceContext.traceId
            });

            return {
                success: true,
                data: result,
                trace: traceContext.getSummary()
            };
        } catch (error) {
            const metrics = this.metrics.get(serviceName);
            metrics.errors++;

            this.emit('request-failed', {
                serviceName,
                error: error.message,
                traceId: traceContext.traceId
            });

            throw error;
        }
    }

    /**
     * Update routing strategy
     * @param {string} serviceName - Service name
     * @param {string} strategy - New strategy
     * @param {Object} context - Strategy context
     */
    updateStrategy(serviceName, strategy, context = {}) {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not registered`);
        }

        service.router.strategy = strategy;
        Object.assign(service.router.rules, context);

        console.log(`[${this.name}] Updated ${serviceName} strategy to ${strategy}`);
        this.emit('strategy-updated', { serviceName, strategy });
    }

    /**
     * Get service metrics
     * @param {string} serviceName - Service name
     * @returns {Object}
     */
    getMetrics(serviceName) {
        return this.metrics.get(serviceName) || null;
    }

    /**
     * Get all traces
     * @returns {Array<Object>}
     */
    getTraces() {
        return this.tracers.map(t => t.getSummary());
    }

    /**
     * Get orchestrator statistics
     * @returns {Object}
     */
    getStatistics() {
        const stats = {
            totalServices: this.services.size,
            totalTraces: this.tracers.length,
            services: {}
        };

        for (const [serviceName, service] of this.services.entries()) {
            const metrics = this.metrics.get(serviceName);
            const routerStats = service.router.getStatistics();

            stats.services[serviceName] = {
                status: service.status,
                strategy: routerStats.strategy,
                metrics,
                instances: routerStats
            };
        }

        return stats;
    }
}

/**
 * Demonstration - 10 Comprehensive Scenarios
 */
async function demonstrateStranglerMS() {
    console.log('=== StranglerMS Pattern Demonstration ===\n');

    // Create migration orchestrator
    const orchestrator = new MigrationOrchestrator({
        name: 'E-commerce Migration Orchestrator'
    });

    // Setup event listeners
    orchestrator.on('request-completed', (data) => {
        console.log(`[Event] Request completed for ${data.serviceName} in ${data.responseTime}ms`);
    });

    orchestrator.on('strategy-updated', (data) => {
        console.log(`[Event] Strategy updated for ${data.serviceName}: ${data.strategy}`);
    });

    // Scenario 1: Register services with different strategies
    console.log('--- Scenario 1: Register Services ---\n');

    orchestrator.registerService('auth', {
        strategy: TrafficStrategy.CANARY,
        legacyInstances: [
            { endpoint: 'http://legacy/auth', version: '1.0', weight: 2 }
        ],
        newInstances: [
            { endpoint: 'http://new/auth', version: '2.0', weight: 1 }
        ]
    });

    orchestrator.registerService('products', {
        strategy: TrafficStrategy.SHADOW,
        legacyInstances: [
            { endpoint: 'http://legacy/products', version: '1.0' }
        ],
        newInstances: [
            { endpoint: 'http://new/products', version: '2.0' }
        ]
    });

    orchestrator.registerService('orders', {
        strategy: TrafficStrategy.AB_TEST,
        legacyInstances: [
            { endpoint: 'http://legacy/orders', version: '1.0' }
        ],
        newInstances: [
            { endpoint: 'http://new/orders', version: '2.0' }
        ]
    });

    console.log('Registered 3 services\n');

    // Scenario 2: Canary routing with increasing percentages
    console.log('--- Scenario 2: Canary Routing ---\n');

    console.log('10% canary:');
    for (let i = 0; i < 10; i++) {
        try {
            const result = await orchestrator.route('auth', { userId: 123 }, { canaryPercentage: 10 });
            console.log(`  Request ${i + 1}: ${result.data.serviceName}`);
        } catch (error) {
            console.log(`  Request ${i + 1}: Error - ${error.message}`);
        }
    }

    console.log('\n50% canary:');
    for (let i = 0; i < 10; i++) {
        try {
            const result = await orchestrator.route('auth', { userId: 456 }, { canaryPercentage: 50 });
            console.log(`  Request ${i + 1}: ${result.data.serviceName}`);
        } catch (error) {
            console.log(`  Request ${i + 1}: Error`);
        }
    }

    // Scenario 3: Shadow traffic testing
    console.log('\n--- Scenario 3: Shadow Traffic Testing ---\n');

    console.log('Shadow traffic (primary: legacy, shadow: new):');
    for (let i = 0; i < 5; i++) {
        try {
            const result = await orchestrator.route('products', { productId: 789 }, {});
            console.log(`  Request ${i + 1}: Primary - ${result.data.serviceName}`);
        } catch (error) {
            console.log(`  Request ${i + 1}: Error`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Scenario 4: A/B testing
    console.log('\n--- Scenario 4: A/B Testing ---\n');

    const users = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
    console.log('A/B test (50% split):');
    for (const userId of users) {
        try {
            const result = await orchestrator.route('orders', { userId }, { testPercentage: 50 });
            console.log(`  ${userId}: ${result.data.serviceName}`);
        } catch (error) {
            console.log(`  ${userId}: Error`);
        }
    }

    // Verify consistency
    console.log('\nVerifying consistency (same user):');
    for (let i = 0; i < 3; i++) {
        try {
            const result = await orchestrator.route('orders', { userId: 'user-1' }, { testPercentage: 50 });
            console.log(`  Attempt ${i + 1}: ${result.data.serviceName}`);
        } catch (error) {
            console.log(`  Attempt ${i + 1}: Error`);
        }
    }

    // Scenario 5: Switch to blue-green deployment
    console.log('\n--- Scenario 5: Blue-Green Deployment ---\n');

    orchestrator.updateStrategy('auth', TrafficStrategy.BLUE_GREEN, { activeVersion: 'legacy' });

    console.log('Active: legacy');
    for (let i = 0; i < 5; i++) {
        try {
            const result = await orchestrator.route('auth', { userId: 999 }, { activeVersion: 'legacy' });
            console.log(`  Request ${i + 1}: ${result.data.serviceName}`);
        } catch (error) {
            console.log(`  Request ${i + 1}: Error`);
        }
    }

    console.log('\nSwitching to new...');
    console.log('Active: new');
    for (let i = 0; i < 5; i++) {
        try {
            const result = await orchestrator.route('auth', { userId: 999 }, { activeVersion: 'new' });
            console.log(`  Request ${i + 1}: ${result.data.serviceName}`);
        } catch (error) {
            console.log(`  Request ${i + 1}: Error`);
        }
    }

    // Scenario 6: Header-based routing
    console.log('\n--- Scenario 6: Header-Based Routing ---\n');

    orchestrator.registerService('payments', {
        strategy: TrafficStrategy.HEADER_BASED,
        legacyInstances: [
            { endpoint: 'http://legacy/payments', version: '1.0' }
        ],
        newInstances: [
            { endpoint: 'http://new/payments', version: '2.0' }
        ]
    });

    console.log('Request without header:');
    try {
        const result = await orchestrator.route('payments', {}, {});
        console.log(`  Routed to: ${result.data.serviceName}`);
    } catch (error) {
        console.log(`  Error: ${error.message}`);
    }

    console.log('\nRequest with x-use-new-version header:');
    try {
        const result = await orchestrator.route('payments', {
            headers: { 'x-use-new-version': 'true' }
        }, {});
        console.log(`  Routed to: ${result.data.serviceName}`);
    } catch (error) {
        console.log(`  Error: ${error.message}`);
    }

    // Scenario 7: Circuit breaker demonstration
    console.log('\n--- Scenario 7: Circuit Breaker ---\n');

    console.log('Simulating failures to trigger circuit breaker...');
    const service = orchestrator.services.get('auth');
    const instance = service.router.legacyInstances[0];

    // Force failures to open circuit
    for (let i = 0; i < 6; i++) {
        instance.circuitBreaker.onFailure();
    }

    console.log(`Circuit state: ${instance.circuitBreaker.getStatus().state}`);

    // Scenario 8: View metrics
    console.log('\n--- Scenario 8: Service Metrics ---\n');

    const authMetrics = orchestrator.getMetrics('auth');
    console.log('Authentication Service Metrics:');
    console.log(JSON.stringify(authMetrics, null, 2));

    const productsMetrics = orchestrator.getMetrics('products');
    console.log('\nProducts Service Metrics:');
    console.log(JSON.stringify(productsMetrics, null, 2));

    // Scenario 9: Distributed tracing
    console.log('\n--- Scenario 9: Distributed Tracing ---\n');

    const traces = orchestrator.getTraces();
    console.log(`Total traces collected: ${traces.length}`);
    console.log('\nSample trace:');
    if (traces.length > 0) {
        console.log(JSON.stringify(traces[traces.length - 1], null, 2));
    }

    // Scenario 10: Overall statistics
    console.log('\n--- Scenario 10: Overall Statistics ---\n');

    const stats = orchestrator.getStatistics();
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n--- Additional Scenarios ---\n');

    // Geo-based routing
    console.log('Testing geo-based routing:');
    orchestrator.registerService('notifications', {
        strategy: TrafficStrategy.GEO_BASED,
        legacyInstances: [
            { endpoint: 'http://legacy/notifications', version: '1.0' }
        ],
        newInstances: [
            { endpoint: 'http://new/notifications', version: '2.0' }
        ]
    });

    const regions = ['us-east', 'eu-west', 'ap-south'];
    for (const region of regions) {
        try {
            const result = await orchestrator.route('notifications', { region }, {
                region,
                enabledRegions: ['eu-west', 'ap-south']
            });
            console.log(`  ${region}: ${result.data.serviceName}`);
        } catch (error) {
            console.log(`  ${region}: Error`);
        }
    }

    console.log('\nMigration orchestration complete!');
}

// Export classes
module.exports = {
    TrafficStrategy,
    CircuitState,
    TraceContext,
    CircuitBreaker,
    ServiceInstance,
    TrafficRouter,
    MigrationOrchestrator
};

if (require.main === module) {
    demonstrateStranglerMS().catch(console.error);
}
