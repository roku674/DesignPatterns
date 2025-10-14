/**
 * Branch Microservice Pattern
 *
 * The Branch Microservice (BranchMS) pattern implements a complete microservice
 * that coordinates parallel execution of multiple service calls with independent
 * processing. This is a production-ready implementation with features like request
 * tracking, performance monitoring, and adaptive execution strategies.
 *
 * Key Components:
 * - BranchMicroservice: Complete microservice implementation
 * - ExecutionStrategy: Different branch execution strategies
 * - RequestTracker: Tracks and monitors branch executions
 * - PerformanceOptimizer: Optimizes branch execution based on history
 *
 * Benefits:
 * - Production-ready branch coordination service
 * - Advanced execution strategies
 * - Performance monitoring and optimization
 * - Request tracking and tracing
 * - Adaptive timeout management
 *
 * Use Cases:
 * - Complex parallel data aggregation
 * - Multi-source data composition
 * - Scatter-gather implementations
 * - Parallel processing pipelines
 */

const EventEmitter = require('events');
const http = require('http');
const crypto = require('crypto');

/**
 * RequestTracker - Tracks branch execution requests
 */
class RequestTracker {
    constructor() {
        this.activeRequests = new Map();
        this.completedRequests = [];
        this.maxHistory = 1000;
    }

    /**
     * Start tracking a request
     */
    startRequest(requestId, branchCount) {
        const request = {
            requestId,
            branchCount,
            startTime: Date.now(),
            branches: new Map(),
            status: 'in-progress'
        };

        this.activeRequests.set(requestId, request);
        return request;
    }

    /**
     * Track branch start
     */
    trackBranchStart(requestId, branchName) {
        const request = this.activeRequests.get(requestId);
        if (!request) return;

        request.branches.set(branchName, {
            branchName,
            startTime: Date.now(),
            status: 'running'
        });
    }

    /**
     * Track branch completion
     */
    trackBranchComplete(requestId, branchName, success, executionTime) {
        const request = this.activeRequests.get(requestId);
        if (!request) return;

        const branch = request.branches.get(branchName);
        if (branch) {
            branch.status = success ? 'completed' : 'failed';
            branch.executionTime = executionTime;
            branch.endTime = Date.now();
        }
    }

    /**
     * Complete request tracking
     */
    completeRequest(requestId, success, totalTime) {
        const request = this.activeRequests.get(requestId);
        if (!request) return;

        request.status = success ? 'completed' : 'failed';
        request.totalTime = totalTime;
        request.endTime = Date.now();

        // Move to history
        this.completedRequests.push(request);
        this.activeRequests.delete(requestId);

        // Limit history size
        if (this.completedRequests.length > this.maxHistory) {
            this.completedRequests.shift();
        }
    }

    /**
     * Get request status
     */
    getRequestStatus(requestId) {
        const active = this.activeRequests.get(requestId);
        if (active) {
            return {
                status: 'active',
                request: this.formatRequest(active)
            };
        }

        const completed = this.completedRequests.find(r => r.requestId === requestId);
        if (completed) {
            return {
                status: 'completed',
                request: this.formatRequest(completed)
            };
        }

        return { status: 'not-found' };
    }

    /**
     * Format request for output
     */
    formatRequest(request) {
        return {
            requestId: request.requestId,
            branchCount: request.branchCount,
            status: request.status,
            totalTime: request.totalTime,
            branches: Array.from(request.branches.values())
        };
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const total = this.completedRequests.length;
        const successful = this.completedRequests.filter(r => r.status === 'completed').length;
        const failed = this.completedRequests.filter(r => r.status === 'failed').length;

        const avgTime = total > 0
            ? this.completedRequests.reduce((sum, r) => sum + (r.totalTime || 0), 0) / total
            : 0;

        return {
            activeRequests: this.activeRequests.size,
            totalCompleted: total,
            successful,
            failed,
            successRate: total > 0 ? (successful / total) * 100 : 0,
            averageExecutionTime: Math.round(avgTime)
        };
    }
}

/**
 * PerformanceOptimizer - Optimizes branch execution based on history
 */
class PerformanceOptimizer {
    constructor() {
        this.branchMetrics = new Map();
    }

    /**
     * Record branch execution
     */
    recordExecution(branchName, executionTime, success) {
        if (!this.branchMetrics.has(branchName)) {
            this.branchMetrics.set(branchName, {
                executions: [],
                totalExecutions: 0,
                successfulExecutions: 0,
                failedExecutions: 0
            });
        }

        const metrics = this.branchMetrics.get(branchName);
        metrics.executions.push({ executionTime, success, timestamp: Date.now() });
        metrics.totalExecutions++;

        if (success) {
            metrics.successfulExecutions++;
        } else {
            metrics.failedExecutions++;
        }

        // Keep only last 100 executions
        if (metrics.executions.length > 100) {
            metrics.executions.shift();
        }
    }

    /**
     * Get optimal timeout for branch
     */
    getOptimalTimeout(branchName, defaultTimeout = 5000) {
        const metrics = this.branchMetrics.get(branchName);

        if (!metrics || metrics.executions.length < 5) {
            return defaultTimeout;
        }

        // Calculate 95th percentile execution time
        const times = metrics.executions
            .filter(e => e.success)
            .map(e => e.executionTime)
            .sort((a, b) => a - b);

        if (times.length === 0) {
            return defaultTimeout;
        }

        const p95Index = Math.floor(times.length * 0.95);
        const p95Time = times[p95Index];

        // Add 20% buffer
        return Math.min(Math.round(p95Time * 1.2), defaultTimeout);
    }

    /**
     * Get branch health score
     */
    getBranchHealthScore(branchName) {
        const metrics = this.branchMetrics.get(branchName);

        if (!metrics || metrics.totalExecutions === 0) {
            return 100; // Assume healthy if no data
        }

        const successRate = (metrics.successfulExecutions / metrics.totalExecutions) * 100;

        // Recent performance (last 10 executions)
        const recentExecutions = metrics.executions.slice(-10);
        const recentSuccessRate = recentExecutions.length > 0
            ? (recentExecutions.filter(e => e.success).length / recentExecutions.length) * 100
            : 100;

        // Weight recent performance more heavily
        return (successRate * 0.3) + (recentSuccessRate * 0.7);
    }

    /**
     * Get performance recommendations
     */
    getRecommendations() {
        const recommendations = [];

        for (const [branchName, metrics] of this.branchMetrics.entries()) {
            const healthScore = this.getBranchHealthScore(branchName);

            if (healthScore < 50) {
                recommendations.push({
                    branch: branchName,
                    type: 'health',
                    severity: 'high',
                    message: `Branch ${branchName} has low health score: ${healthScore.toFixed(2)}%`
                });
            }

            const avgTime = metrics.executions.length > 0
                ? metrics.executions.reduce((sum, e) => sum + e.executionTime, 0) / metrics.executions.length
                : 0;

            if (avgTime > 3000) {
                recommendations.push({
                    branch: branchName,
                    type: 'performance',
                    severity: 'medium',
                    message: `Branch ${branchName} has high average execution time: ${avgTime.toFixed(0)}ms`
                });
            }
        }

        return recommendations;
    }

    /**
     * Get all metrics
     */
    getAllMetrics() {
        const metrics = {};

        for (const [branchName, data] of this.branchMetrics.entries()) {
            metrics[branchName] = {
                totalExecutions: data.totalExecutions,
                successRate: data.totalExecutions > 0
                    ? (data.successfulExecutions / data.totalExecutions) * 100
                    : 0,
                healthScore: this.getBranchHealthScore(branchName),
                optimalTimeout: this.getOptimalTimeout(branchName)
            };
        }

        return metrics;
    }
}

/**
 * ExecutionStrategy - Different strategies for executing branches
 */
class ExecutionStrategy {
    constructor() {
        this.strategies = new Map();
        this.initializeStrategies();
    }

    /**
     * Initialize execution strategies
     */
    initializeStrategies() {
        // Parallel strategy - execute all branches simultaneously
        this.strategies.set('parallel', async (branches, context) => {
            const promises = branches.map(branch => branch.execute(context));
            return await Promise.all(promises.map(p => p.catch(e => e)));
        });

        // Sequential strategy - execute branches one by one
        this.strategies.set('sequential', async (branches, context) => {
            const results = [];
            for (const branch of branches) {
                const result = await branch.execute(context).catch(e => e);
                results.push(result);
            }
            return results;
        });

        // Priority strategy - execute high priority branches first
        this.strategies.set('priority', async (branches, context) => {
            const sorted = [...branches].sort((a, b) => {
                return (b.config.priority || 0) - (a.config.priority || 0);
            });

            const results = [];
            for (const branch of sorted) {
                const result = await branch.execute(context).catch(e => e);
                results.push(result);
            }
            return results;
        });

        // Fast-first strategy - execute fastest branches first
        this.strategies.set('fast-first', async (branches, context, optimizer) => {
            const sorted = [...branches].sort((a, b) => {
                const timeoutA = optimizer.getOptimalTimeout(a.config.name, a.config.timeout);
                const timeoutB = optimizer.getOptimalTimeout(b.config.name, b.config.timeout);
                return timeoutA - timeoutB;
            });

            return await Promise.all(
                sorted.map(branch => branch.execute(context).catch(e => e))
            );
        });

        // Adaptive strategy - adjust based on performance
        this.strategies.set('adaptive', async (branches, context, optimizer) => {
            const highHealthBranches = [];
            const lowHealthBranches = [];

            for (const branch of branches) {
                const health = optimizer.getBranchHealthScore(branch.config.name);
                if (health >= 70) {
                    highHealthBranches.push(branch);
                } else {
                    lowHealthBranches.push(branch);
                }
            }

            // Execute healthy branches in parallel, unhealthy ones sequentially
            const healthyPromises = highHealthBranches.map(b => b.execute(context).catch(e => e));
            const healthyResults = await Promise.all(healthyPromises);

            const unhealthyResults = [];
            for (const branch of lowHealthBranches) {
                const result = await branch.execute(context).catch(e => e);
                unhealthyResults.push(result);
            }

            return [...healthyResults, ...unhealthyResults];
        });
    }

    /**
     * Execute branches using specified strategy
     */
    async execute(strategyName, branches, context, optimizer) {
        const strategy = this.strategies.get(strategyName);

        if (!strategy) {
            throw new Error(`Unknown execution strategy: ${strategyName}`);
        }

        return await strategy(branches, context, optimizer);
    }

    /**
     * Add custom strategy
     */
    addStrategy(name, strategyFunction) {
        this.strategies.set(name, strategyFunction);
    }

    /**
     * Get available strategies
     */
    getAvailableStrategies() {
        return Array.from(this.strategies.keys());
    }
}

/**
 * BranchMicroservice - Complete branch coordination microservice
 */
class BranchMicroservice extends EventEmitter {
    constructor(config) {
        super();
        this.name = config.name || 'BranchMS';
        this.port = config.port || 6000;
        this.host = config.host || 'localhost';

        // Initialize components
        this.branches = new Map();
        this.tracker = new RequestTracker();
        this.optimizer = new PerformanceOptimizer();
        this.executionStrategy = new ExecutionStrategy();

        this.defaultStrategy = config.defaultStrategy || 'parallel';
        this.server = null;

        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            startTime: null
        };
    }

    /**
     * Register a branch
     */
    registerBranch(branchConfig) {
        this.branches.set(branchConfig.name, branchConfig);
        console.log(`[${this.name}] Branch registered: ${branchConfig.name}`);
    }

    /**
     * Start the microservice
     */
    async start() {
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
            } else if (url === '/execute') {
                await this.handleExecute(req, res);
            } else if (url === '/metrics') {
                await this.handleMetrics(req, res);
            } else if (url === '/branches') {
                await this.handleBranches(req, res);
            } else if (url === '/optimize') {
                await this.handleOptimize(req, res);
            } else if (url.startsWith('/status/')) {
                await this.handleStatus(req, res);
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
            branches: this.branches.size
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health));
    }

    /**
     * Execute branches endpoint
     */
    async handleExecute(req, res) {
        const requestId = this.generateRequestId();
        const strategy = this.defaultStrategy;

        console.log(`[${this.name}] Executing request ${requestId} with strategy: ${strategy}`);

        // Start tracking
        this.tracker.startRequest(requestId, this.branches.size);

        const startTime = Date.now();

        try {
            // Create branch executors
            const { BranchExecutor } = require('./Branch');
            const executors = [];

            for (const [name, config] of this.branches.entries()) {
                const executor = new BranchExecutor(config);

                executor.on('branchStarted', () => {
                    this.tracker.trackBranchStart(requestId, name);
                });

                executor.on('branchCompleted', (result) => {
                    this.tracker.trackBranchComplete(requestId, name, true, result.executionTime);
                    this.optimizer.recordExecution(name, result.executionTime, true);
                });

                executor.on('branchFailed', (result) => {
                    this.tracker.trackBranchComplete(requestId, name, false, result.executionTime);
                    this.optimizer.recordExecution(name, result.executionTime, false);
                });

                executors.push(executor);
            }

            // Execute branches
            const results = await this.executionStrategy.execute(
                strategy,
                executors,
                {},
                this.optimizer
            );

            const totalTime = Date.now() - startTime;

            // Complete tracking
            this.tracker.completeRequest(requestId, true, totalTime);
            this.metrics.successfulRequests++;

            // Format response
            const response = {
                requestId,
                success: true,
                data: this.formatResults(results),
                metadata: {
                    strategy,
                    totalBranches: this.branches.size,
                    executionTime: totalTime
                }
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        } catch (error) {
            const totalTime = Date.now() - startTime;
            this.tracker.completeRequest(requestId, false, totalTime);
            this.metrics.failedRequests++;

            throw error;
        }
    }

    /**
     * Format execution results
     */
    formatResults(results) {
        const formatted = {};

        for (const result of results) {
            if (result.isSuccessful && result.isSuccessful()) {
                formatted[result.branchName] = result.data;
            } else if (result.success) {
                formatted[result.branchName] = result.data;
            }
        }

        return formatted;
    }

    /**
     * Metrics endpoint
     */
    async handleMetrics(req, res) {
        const metrics = {
            service: this.metrics,
            tracker: this.tracker.getStatistics(),
            optimizer: this.optimizer.getAllMetrics()
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(metrics));
    }

    /**
     * Branches endpoint
     */
    async handleBranches(req, res) {
        const branches = [];

        for (const [name, config] of this.branches.entries()) {
            branches.push({
                name: config.name,
                serviceName: config.serviceName,
                endpoint: config.endpoint,
                healthScore: this.optimizer.getBranchHealthScore(name),
                optimalTimeout: this.optimizer.getOptimalTimeout(name, config.timeout)
            });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ branches }));
    }

    /**
     * Optimization recommendations endpoint
     */
    async handleOptimize(req, res) {
        const recommendations = this.optimizer.getRecommendations();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ recommendations }));
    }

    /**
     * Request status endpoint
     */
    async handleStatus(req, res) {
        const requestId = req.url.split('/').pop();
        const status = this.tracker.getRequestStatus(requestId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
    }

    /**
     * Generate request ID
     */
    generateRequestId() {
        return crypto.randomBytes(16).toString('hex');
    }
}

// Demonstration
async function demonstrateBranchMS() {
    console.log('=== Branch Microservice Pattern Demonstration ===\n');

    const { BranchConfig } = require('./Branch');

    // Create branch microservice
    const branchMS = new BranchMicroservice({
        name: 'BranchCoordinator',
        port: 7000,
        defaultStrategy: 'adaptive'
    });

    // Register branches
    console.log('--- Registering Branches ---');

    branchMS.registerBranch(new BranchConfig({
        name: 'user-profile',
        serviceName: 'user-service',
        endpoint: '/api/profile',
        timeout: 3000,
        priority: 10
    }));

    branchMS.registerBranch(new BranchConfig({
        name: 'user-preferences',
        serviceName: 'preference-service',
        endpoint: '/api/preferences',
        timeout: 2000,
        priority: 5
    }));

    branchMS.registerBranch(new BranchConfig({
        name: 'activity-log',
        serviceName: 'activity-service',
        endpoint: '/api/activity',
        timeout: 4000,
        priority: 3
    }));

    // Start the microservice
    console.log('\n--- Starting Branch Microservice ---');
    await branchMS.start();

    console.log('\n--- Branch Microservice Running ---');
    console.log(`Access endpoints:`);
    console.log(`  Health: http://localhost:7000/health`);
    console.log(`  Execute: http://localhost:7000/execute`);
    console.log(`  Metrics: http://localhost:7000/metrics`);
    console.log(`  Branches: http://localhost:7000/branches`);
    console.log(`  Optimize: http://localhost:7000/optimize`);
}

// Export classes
module.exports = {
    RequestTracker,
    PerformanceOptimizer,
    ExecutionStrategy,
    BranchMicroservice
};

if (require.main === module) {
    demonstrateBranchMS().catch(console.error);
}
