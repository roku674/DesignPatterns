/**
 * Strangler Pattern
 *
 * The Strangler pattern is used for gradually migrating legacy monolithic applications
 * to microservices architecture. It works by incrementally replacing specific pieces of
 * functionality with new microservices while keeping the legacy system running. The name
 * comes from the strangler fig tree, which grows around another tree and eventually
 * replaces it.
 *
 * Key Components:
 * - StranglerFacade: Routes requests between legacy and new systems
 * - MigrationRegistry: Tracks which features have been migrated
 * - FeatureRouter: Determines routing based on migration status
 * - HealthMonitor: Monitors health of both legacy and new systems
 * - RollbackManager: Manages rollback when new services fail
 *
 * Benefits:
 * - Zero downtime migration
 * - Incremental risk management
 * - Gradual learning curve
 * - Easy rollback capabilities
 * - Parallel system operation
 *
 * Use Cases:
 * - Legacy system modernization
 * - Monolith to microservices migration
 * - Technology stack upgrades
 * - Gradual system replacement
 * - Risk-managed deployments
 */

const EventEmitter = require('events');

/**
 * MigrationStatus - Represents the migration status of a feature
 * @enum {string}
 */
const MigrationStatus = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    TESTING: 'testing',
    CANARY: 'canary',
    MIGRATED: 'migrated',
    ROLLED_BACK: 'rolled_back'
};

/**
 * Feature - Represents a feature being migrated
 * @class
 */
class Feature {
    /**
     * Create a new feature
     * @param {Object} config - Feature configuration
     */
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.path = config.path;
        this.status = config.status || MigrationStatus.NOT_STARTED;
        this.legacyEndpoint = config.legacyEndpoint;
        this.newEndpoint = config.newEndpoint || null;
        this.canaryPercentage = config.canaryPercentage || 0;
        this.migrationStartDate = null;
        this.migrationCompleteDate = null;
        this.rollbackCount = 0;
        this.metadata = config.metadata || {};
    }

    /**
     * Update migration status
     * @param {string} status - New status
     */
    updateStatus(status) {
        const oldStatus = this.status;
        this.status = status;

        if (status === MigrationStatus.IN_PROGRESS && !this.migrationStartDate) {
            this.migrationStartDate = new Date();
        }

        if (status === MigrationStatus.MIGRATED && !this.migrationCompleteDate) {
            this.migrationCompleteDate = new Date();
        }

        if (status === MigrationStatus.ROLLED_BACK) {
            this.rollbackCount++;
        }

        return { oldStatus, newStatus: status };
    }

    /**
     * Set canary percentage
     * @param {number} percentage - Percentage of traffic to route to new service
     */
    setCanaryPercentage(percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new Error('Canary percentage must be between 0 and 100');
        }
        this.canaryPercentage = percentage;
    }

    /**
     * Check if feature should route to new service
     * @returns {boolean}
     */
    shouldRouteToNew() {
        if (this.status === MigrationStatus.MIGRATED) {
            return true;
        }

        if (this.status === MigrationStatus.CANARY) {
            return Math.random() * 100 < this.canaryPercentage;
        }

        return false;
    }

    /**
     * Get feature info
     * @returns {Object}
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            path: this.path,
            status: this.status,
            canaryPercentage: this.canaryPercentage,
            migrationStartDate: this.migrationStartDate,
            migrationCompleteDate: this.migrationCompleteDate,
            rollbackCount: this.rollbackCount
        };
    }
}

/**
 * MigrationRegistry - Tracks migration status of features
 * @class
 */
class MigrationRegistry {
    constructor() {
        this.features = new Map();
        this.pathIndex = new Map();
    }

    /**
     * Register a feature
     * @param {Feature} feature - Feature to register
     */
    registerFeature(feature) {
        if (this.features.has(feature.id)) {
            throw new Error(`Feature ${feature.id} already registered`);
        }

        this.features.set(feature.id, feature);
        this.pathIndex.set(feature.path, feature);

        console.log(`[MigrationRegistry] Registered feature: ${feature.name} at ${feature.path}`);
    }

    /**
     * Get feature by ID
     * @param {string} featureId - Feature ID
     * @returns {Feature|null}
     */
    getFeature(featureId) {
        return this.features.get(featureId) || null;
    }

    /**
     * Get feature by path
     * @param {string} path - Feature path
     * @returns {Feature|null}
     */
    getFeatureByPath(path) {
        return this.pathIndex.get(path) || null;
    }

    /**
     * Update feature status
     * @param {string} featureId - Feature ID
     * @param {string} status - New status
     */
    updateFeatureStatus(featureId, status) {
        const feature = this.features.get(featureId);
        if (!feature) {
            throw new Error(`Feature ${featureId} not found`);
        }

        return feature.updateStatus(status);
    }

    /**
     * Get all features by status
     * @param {string} status - Migration status
     * @returns {Array<Feature>}
     */
    getFeaturesByStatus(status) {
        const results = [];
        for (const feature of this.features.values()) {
            if (feature.status === status) {
                results.push(feature);
            }
        }
        return results;
    }

    /**
     * Get migration statistics
     * @returns {Object}
     */
    getStatistics() {
        const stats = {
            total: this.features.size,
            notStarted: 0,
            inProgress: 0,
            testing: 0,
            canary: 0,
            migrated: 0,
            rolledBack: 0
        };

        for (const feature of this.features.values()) {
            switch (feature.status) {
                case MigrationStatus.NOT_STARTED:
                    stats.notStarted++;
                    break;
                case MigrationStatus.IN_PROGRESS:
                    stats.inProgress++;
                    break;
                case MigrationStatus.TESTING:
                    stats.testing++;
                    break;
                case MigrationStatus.CANARY:
                    stats.canary++;
                    break;
                case MigrationStatus.MIGRATED:
                    stats.migrated++;
                    break;
                case MigrationStatus.ROLLED_BACK:
                    stats.rolledBack++;
                    break;
            }
        }

        stats.migrationPercentage = stats.total > 0
            ? ((stats.migrated / stats.total) * 100).toFixed(2)
            : 0;

        return stats;
    }

    /**
     * Get all features
     * @returns {Array<Feature>}
     */
    getAllFeatures() {
        return Array.from(this.features.values());
    }
}

/**
 * HealthMonitor - Monitors health of legacy and new systems
 * @class
 * @extends EventEmitter
 */
class HealthMonitor extends EventEmitter {
    constructor(config = {}) {
        super();
        this.checkInterval = config.checkInterval || 5000;
        this.healthThreshold = config.healthThreshold || 0.8;
        this.legacyHealth = { status: 'healthy', successRate: 1.0, lastCheck: null };
        this.newServiceHealth = new Map();
        this.isMonitoring = false;
        this.intervalId = null;
    }

    /**
     * Start health monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) {
            return;
        }

        this.isMonitoring = true;
        this.intervalId = setInterval(() => {
            this.performHealthCheck();
        }, this.checkInterval);

        console.log('[HealthMonitor] Started monitoring');
    }

    /**
     * Stop health monitoring
     */
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isMonitoring = false;
        console.log('[HealthMonitor] Stopped monitoring');
    }

    /**
     * Perform health check
     */
    async performHealthCheck() {
        const timestamp = new Date();

        // Check legacy system
        const legacyHealthy = await this.checkLegacyHealth();
        this.legacyHealth.lastCheck = timestamp;

        if (!legacyHealthy) {
            this.emit('health-degraded', {
                system: 'legacy',
                health: this.legacyHealth
            });
        }

        // Check new services
        for (const [serviceId, health] of this.newServiceHealth.entries()) {
            const serviceHealthy = await this.checkServiceHealth(serviceId);
            health.lastCheck = timestamp;

            if (!serviceHealthy) {
                this.emit('health-degraded', {
                    system: 'new-service',
                    serviceId,
                    health
                });
            }
        }
    }

    /**
     * Check legacy system health
     * @returns {Promise<boolean>}
     */
    async checkLegacyHealth() {
        // Simulate health check
        return new Promise((resolve) => {
            setTimeout(() => {
                const successRate = 0.9 + Math.random() * 0.1;
                this.legacyHealth.successRate = successRate;
                this.legacyHealth.status = successRate >= this.healthThreshold ? 'healthy' : 'degraded';
                resolve(successRate >= this.healthThreshold);
            }, Math.random() * 100);
        });
    }

    /**
     * Check new service health
     * @param {string} serviceId - Service ID
     * @returns {Promise<boolean>}
     */
    async checkServiceHealth(serviceId) {
        // Simulate health check
        return new Promise((resolve) => {
            setTimeout(() => {
                const health = this.newServiceHealth.get(serviceId);
                if (health) {
                    const successRate = 0.85 + Math.random() * 0.15;
                    health.successRate = successRate;
                    health.status = successRate >= this.healthThreshold ? 'healthy' : 'degraded';
                    resolve(successRate >= this.healthThreshold);
                } else {
                    resolve(true);
                }
            }, Math.random() * 100);
        });
    }

    /**
     * Register new service for monitoring
     * @param {string} serviceId - Service ID
     */
    registerService(serviceId) {
        if (!this.newServiceHealth.has(serviceId)) {
            this.newServiceHealth.set(serviceId, {
                status: 'healthy',
                successRate: 1.0,
                lastCheck: null
            });
            console.log(`[HealthMonitor] Registered service: ${serviceId}`);
        }
    }

    /**
     * Record request result
     * @param {string} system - System name
     * @param {boolean} success - Request success
     */
    recordRequest(system, success) {
        if (system === 'legacy') {
            const currentRate = this.legacyHealth.successRate;
            this.legacyHealth.successRate = currentRate * 0.95 + (success ? 0.05 : 0);
        } else {
            const health = this.newServiceHealth.get(system);
            if (health) {
                const currentRate = health.successRate;
                health.successRate = currentRate * 0.95 + (success ? 0.05 : 0);
            }
        }
    }

    /**
     * Get health status
     * @returns {Object}
     */
    getHealthStatus() {
        const newServices = {};
        for (const [serviceId, health] of this.newServiceHealth.entries()) {
            newServices[serviceId] = { ...health };
        }

        return {
            legacy: { ...this.legacyHealth },
            newServices,
            overallHealthy: this.legacyHealth.status === 'healthy' &&
                Array.from(this.newServiceHealth.values()).every(h => h.status === 'healthy')
        };
    }
}

/**
 * RollbackManager - Manages rollback operations
 * @class
 * @extends EventEmitter
 */
class RollbackManager extends EventEmitter {
    constructor(registry) {
        super();
        this.registry = registry;
        this.rollbackHistory = [];
        this.autoRollbackEnabled = true;
        this.failureThreshold = 0.3; // 30% failure rate triggers rollback
    }

    /**
     * Rollback a feature
     * @param {string} featureId - Feature ID
     * @param {string} reason - Rollback reason
     * @returns {Promise<Object>}
     */
    async rollback(featureId, reason) {
        const feature = this.registry.getFeature(featureId);
        if (!feature) {
            throw new Error(`Feature ${featureId} not found`);
        }

        console.log(`[RollbackManager] Rolling back feature: ${feature.name}`);
        console.log(`[RollbackManager] Reason: ${reason}`);

        const previousStatus = feature.status;

        // Update feature status
        feature.updateStatus(MigrationStatus.ROLLED_BACK);
        feature.canaryPercentage = 0;

        // Record rollback
        const rollbackEntry = {
            featureId,
            featureName: feature.name,
            previousStatus,
            reason,
            timestamp: new Date()
        };

        this.rollbackHistory.push(rollbackEntry);

        this.emit('rollback-completed', rollbackEntry);

        return rollbackEntry;
    }

    /**
     * Check if feature should be rolled back
     * @param {string} featureId - Feature ID
     * @param {Object} metrics - Feature metrics
     * @returns {Promise<boolean>}
     */
    async shouldRollback(featureId, metrics) {
        if (!this.autoRollbackEnabled) {
            return false;
        }

        const feature = this.registry.getFeature(featureId);
        if (!feature || feature.status !== MigrationStatus.CANARY) {
            return false;
        }

        // Check failure rate
        if (metrics.failureRate > this.failureThreshold) {
            await this.rollback(featureId, `High failure rate: ${(metrics.failureRate * 100).toFixed(2)}%`);
            return true;
        }

        return false;
    }

    /**
     * Get rollback history
     * @returns {Array<Object>}
     */
    getRollbackHistory() {
        return [...this.rollbackHistory];
    }

    /**
     * Enable auto rollback
     */
    enableAutoRollback() {
        this.autoRollbackEnabled = true;
        console.log('[RollbackManager] Auto-rollback enabled');
    }

    /**
     * Disable auto rollback
     */
    disableAutoRollback() {
        this.autoRollbackEnabled = false;
        console.log('[RollbackManager] Auto-rollback disabled');
    }
}

/**
 * StranglerFacade - Routes requests between legacy and new systems
 * @class
 * @extends EventEmitter
 */
class StranglerFacade extends EventEmitter {
    constructor(config = {}) {
        super();
        this.name = config.name || 'StranglerFacade';
        this.registry = new MigrationRegistry();
        this.healthMonitor = new HealthMonitor(config.healthMonitor);
        this.rollbackManager = new RollbackManager(this.registry);
        this.metrics = new Map();

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.healthMonitor.on('health-degraded', (data) => {
            console.log(`[${this.name}] Health degraded:`, data.system);
            this.emit('health-degraded', data);
        });

        this.rollbackManager.on('rollback-completed', (data) => {
            console.log(`[${this.name}] Rollback completed:`, data.featureName);
            this.emit('rollback-completed', data);
        });
    }

    /**
     * Register a feature for migration
     * @param {Object} featureConfig - Feature configuration
     */
    registerFeature(featureConfig) {
        const feature = new Feature(featureConfig);
        this.registry.registerFeature(feature);

        if (feature.newEndpoint) {
            this.healthMonitor.registerService(feature.id);
        }

        // Initialize metrics
        this.metrics.set(feature.id, {
            legacyRequests: 0,
            newRequests: 0,
            legacyFailures: 0,
            newFailures: 0,
            avgLegacyResponseTime: 0,
            avgNewResponseTime: 0
        });
    }

    /**
     * Route request to appropriate system
     * @param {string} path - Request path
     * @param {Object} request - Request data
     * @returns {Promise<Object>}
     */
    async route(path, request = {}) {
        const feature = this.registry.getFeatureByPath(path);

        if (!feature) {
            throw new Error(`No feature registered for path: ${path}`);
        }

        const useNew = feature.shouldRouteToNew();
        const targetSystem = useNew ? 'new' : 'legacy';

        console.log(`[${this.name}] Routing ${path} to ${targetSystem} system`);

        const startTime = Date.now();

        try {
            let result;

            if (useNew) {
                result = await this.callNewService(feature, request);
                this.recordMetric(feature.id, 'new', true, Date.now() - startTime);
            } else {
                result = await this.callLegacyService(feature, request);
                this.recordMetric(feature.id, 'legacy', true, Date.now() - startTime);
            }

            this.emit('request-completed', {
                feature: feature.name,
                system: targetSystem,
                success: true,
                responseTime: Date.now() - startTime
            });

            return result;
        } catch (error) {
            this.recordMetric(feature.id, targetSystem, false, Date.now() - startTime);

            this.emit('request-failed', {
                feature: feature.name,
                system: targetSystem,
                error: error.message
            });

            // Check if rollback is needed
            const metrics = this.getFeatureMetrics(feature.id);
            await this.rollbackManager.shouldRollback(feature.id, metrics);

            throw error;
        }
    }

    /**
     * Call legacy service
     * @param {Feature} feature - Feature
     * @param {Object} request - Request data
     * @returns {Promise<Object>}
     */
    async callLegacyService(feature, request) {
        // Simulate legacy service call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.05) { // 5% failure rate
                    reject(new Error('Legacy service error'));
                } else {
                    resolve({
                        system: 'legacy',
                        feature: feature.name,
                        endpoint: feature.legacyEndpoint,
                        data: {
                            message: `Processed by legacy system`,
                            timestamp: new Date()
                        }
                    });
                }
            }, 50 + Math.random() * 100);
        });
    }

    /**
     * Call new service
     * @param {Feature} feature - Feature
     * @param {Object} request - Request data
     * @returns {Promise<Object>}
     */
    async callNewService(feature, request) {
        // Simulate new service call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.03) { // 3% failure rate
                    reject(new Error('New service error'));
                } else {
                    resolve({
                        system: 'new',
                        feature: feature.name,
                        endpoint: feature.newEndpoint,
                        data: {
                            message: `Processed by new microservice`,
                            timestamp: new Date()
                        }
                    });
                }
            }, 20 + Math.random() * 50);
        });
    }

    /**
     * Record metric
     * @param {string} featureId - Feature ID
     * @param {string} system - System name
     * @param {boolean} success - Request success
     * @param {number} responseTime - Response time in ms
     */
    recordMetric(featureId, system, success, responseTime) {
        const metrics = this.metrics.get(featureId);
        if (!metrics) return;

        if (system === 'new') {
            metrics.newRequests++;
            if (!success) metrics.newFailures++;
            metrics.avgNewResponseTime =
                (metrics.avgNewResponseTime * (metrics.newRequests - 1) + responseTime) / metrics.newRequests;
        } else {
            metrics.legacyRequests++;
            if (!success) metrics.legacyFailures++;
            metrics.avgLegacyResponseTime =
                (metrics.avgLegacyResponseTime * (metrics.legacyRequests - 1) + responseTime) / metrics.legacyRequests;
        }

        this.healthMonitor.recordRequest(system === 'new' ? featureId : 'legacy', success);
    }

    /**
     * Get feature metrics
     * @param {string} featureId - Feature ID
     * @returns {Object}
     */
    getFeatureMetrics(featureId) {
        const metrics = this.metrics.get(featureId);
        if (!metrics) return null;

        const totalNew = metrics.newRequests;
        const totalLegacy = metrics.legacyRequests;

        return {
            ...metrics,
            failureRate: totalNew > 0 ? metrics.newFailures / totalNew : 0,
            legacyFailureRate: totalLegacy > 0 ? metrics.legacyFailures / totalLegacy : 0
        };
    }

    /**
     * Start migration for a feature
     * @param {string} featureId - Feature ID
     * @param {string} newEndpoint - New service endpoint
     */
    async startMigration(featureId, newEndpoint) {
        const feature = this.registry.getFeature(featureId);
        if (!feature) {
            throw new Error(`Feature ${featureId} not found`);
        }

        feature.newEndpoint = newEndpoint;
        feature.updateStatus(MigrationStatus.IN_PROGRESS);

        this.healthMonitor.registerService(featureId);

        console.log(`[${this.name}] Started migration for ${feature.name}`);
        this.emit('migration-started', { feature: feature.name });
    }

    /**
     * Start canary deployment
     * @param {string} featureId - Feature ID
     * @param {number} percentage - Initial canary percentage
     */
    async startCanary(featureId, percentage = 10) {
        const feature = this.registry.getFeature(featureId);
        if (!feature) {
            throw new Error(`Feature ${featureId} not found`);
        }

        feature.updateStatus(MigrationStatus.CANARY);
        feature.setCanaryPercentage(percentage);

        console.log(`[${this.name}] Started canary for ${feature.name} at ${percentage}%`);
        this.emit('canary-started', { feature: feature.name, percentage });
    }

    /**
     * Complete migration
     * @param {string} featureId - Feature ID
     */
    async completeMigration(featureId) {
        const feature = this.registry.getFeature(featureId);
        if (!feature) {
            throw new Error(`Feature ${featureId} not found`);
        }

        feature.updateStatus(MigrationStatus.MIGRATED);
        feature.setCanaryPercentage(100);

        console.log(`[${this.name}] Completed migration for ${feature.name}`);
        this.emit('migration-completed', { feature: feature.name });
    }

    /**
     * Get migration statistics
     * @returns {Object}
     */
    getStatistics() {
        return {
            registry: this.registry.getStatistics(),
            health: this.healthMonitor.getHealthStatus(),
            rollbacks: this.rollbackManager.getRollbackHistory().length
        };
    }

    /**
     * Start health monitoring
     */
    startMonitoring() {
        this.healthMonitor.startMonitoring();
    }

    /**
     * Stop health monitoring
     */
    stopMonitoring() {
        this.healthMonitor.stopMonitoring();
    }
}

/**
 * Demonstration - 8+ Comprehensive Scenarios
 */
async function demonstrateStrangler() {
    console.log('=== Strangler Pattern Demonstration ===\n');

    // Create strangler facade
    const facade = new StranglerFacade({
        name: 'E-commerce Migration',
        healthMonitor: {
            checkInterval: 2000,
            healthThreshold: 0.8
        }
    });

    // Setup event listeners
    facade.on('migration-started', (data) => {
        console.log(`[Event] Migration started: ${data.feature}`);
    });

    facade.on('canary-started', (data) => {
        console.log(`[Event] Canary started: ${data.feature} at ${data.percentage}%`);
    });

    facade.on('migration-completed', (data) => {
        console.log(`[Event] Migration completed: ${data.feature}`);
    });

    facade.on('rollback-completed', (data) => {
        console.log(`[Event] Rollback completed: ${data.featureName} - ${data.reason}`);
    });

    // Scenario 1: Register features for migration
    console.log('--- Scenario 1: Register Features ---\n');

    facade.registerFeature({
        id: 'feature-1',
        name: 'User Authentication',
        path: '/auth',
        legacyEndpoint: 'http://legacy/auth'
    });

    facade.registerFeature({
        id: 'feature-2',
        name: 'Product Catalog',
        path: '/products',
        legacyEndpoint: 'http://legacy/products'
    });

    facade.registerFeature({
        id: 'feature-3',
        name: 'Order Management',
        path: '/orders',
        legacyEndpoint: 'http://legacy/orders'
    });

    facade.registerFeature({
        id: 'feature-4',
        name: 'Payment Processing',
        path: '/payments',
        legacyEndpoint: 'http://legacy/payments'
    });

    console.log('Registered 4 features\n');

    // Scenario 2: Start monitoring
    console.log('--- Scenario 2: Start Health Monitoring ---\n');
    facade.startMonitoring();

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Scenario 3: Route requests to legacy system
    console.log('\n--- Scenario 3: Route to Legacy System ---\n');

    for (let i = 0; i < 5; i++) {
        try {
            const result = await facade.route('/auth', { userId: 123 });
            console.log(`Request ${i + 1}: Routed to ${result.system} - ${result.data.message}`);
        } catch (error) {
            console.log(`Request ${i + 1}: Failed - ${error.message}`);
        }
    }

    // Scenario 4: Start migration for authentication
    console.log('\n--- Scenario 4: Start Authentication Migration ---\n');
    await facade.startMigration('feature-1', 'http://new-auth-service/auth');

    // Scenario 5: Start canary deployment
    console.log('\n--- Scenario 5: Start Canary Deployment ---\n');
    await facade.startCanary('feature-1', 20);

    console.log('Sending requests during canary phase...\n');
    for (let i = 0; i < 10; i++) {
        try {
            const result = await facade.route('/auth', { userId: 123 });
            console.log(`Request ${i + 1}: ${result.system} system`);
        } catch (error) {
            console.log(`Request ${i + 1}: Failed - ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Scenario 6: Increase canary percentage
    console.log('\n--- Scenario 6: Increase Canary to 50% ---\n');
    const feature1 = facade.registry.getFeature('feature-1');
    feature1.setCanaryPercentage(50);

    for (let i = 0; i < 10; i++) {
        try {
            const result = await facade.route('/auth', { userId: 123 });
            console.log(`Request ${i + 1}: ${result.system} system`);
        } catch (error) {
            console.log(`Request ${i + 1}: Failed`);
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Scenario 7: Complete migration
    console.log('\n--- Scenario 7: Complete Migration ---\n');
    await facade.completeMigration('feature-1');

    console.log('Sending requests to migrated feature...\n');
    for (let i = 0; i < 5; i++) {
        try {
            const result = await facade.route('/auth', { userId: 123 });
            console.log(`Request ${i + 1}: ${result.system} system - ${result.data.message}`);
        } catch (error) {
            console.log(`Request ${i + 1}: Failed`);
        }
    }

    // Scenario 8: Migrate another feature
    console.log('\n--- Scenario 8: Migrate Product Catalog ---\n');
    await facade.startMigration('feature-2', 'http://new-product-service/products');
    await facade.startCanary('feature-2', 30);

    for (let i = 0; i < 8; i++) {
        try {
            const result = await facade.route('/products', {});
            console.log(`Request ${i + 1}: ${result.system} system`);
        } catch (error) {
            console.log(`Request ${i + 1}: Failed`);
        }
    }

    // Scenario 9: View metrics
    console.log('\n--- Scenario 9: View Metrics ---\n');

    const authMetrics = facade.getFeatureMetrics('feature-1');
    console.log('Authentication Metrics:');
    console.log(`  Legacy requests: ${authMetrics.legacyRequests}`);
    console.log(`  New requests: ${authMetrics.newRequests}`);
    console.log(`  Avg legacy response time: ${authMetrics.avgLegacyResponseTime.toFixed(2)}ms`);
    console.log(`  Avg new response time: ${authMetrics.avgNewResponseTime.toFixed(2)}ms`);
    console.log(`  Failure rate: ${(authMetrics.failureRate * 100).toFixed(2)}%`);

    // Scenario 10: View overall statistics
    console.log('\n--- Scenario 10: Overall Statistics ---\n');
    const stats = facade.getStatistics();
    console.log('Migration Registry:');
    console.log(JSON.stringify(stats.registry, null, 2));
    console.log('\nHealth Status:');
    console.log(`  Overall healthy: ${stats.health.overallHealthy}`);
    console.log(`  Total rollbacks: ${stats.rollbacks}`);

    // Cleanup
    facade.stopMonitoring();

    console.log('\n--- Feature Details ---');
    const allFeatures = facade.registry.getAllFeatures();
    allFeatures.forEach(f => {
        const info = f.getInfo();
        console.log(`\n${info.name}:`);
        console.log(`  Status: ${info.status}`);
        console.log(`  Canary: ${info.canaryPercentage}%`);
        if (info.migrationStartDate) {
            console.log(`  Started: ${info.migrationStartDate.toISOString()}`);
        }
        if (info.migrationCompleteDate) {
            console.log(`  Completed: ${info.migrationCompleteDate.toISOString()}`);
        }
    });
}

// Export classes
module.exports = {
    MigrationStatus,
    Feature,
    MigrationRegistry,
    HealthMonitor,
    RollbackManager,
    StranglerFacade
};

if (require.main === module) {
    demonstrateStrangler().catch(console.error);
}
