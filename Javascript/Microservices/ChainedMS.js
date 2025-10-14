/**
 * Chained Microservice Pattern
 *
 * The Chained Microservice (ChainedMS) pattern implements a complete microservice
 * that orchestrates sequential execution of service chains. This production-ready
 * implementation includes chain management, execution tracking, performance
 * optimization, and advanced features like conditional execution and dynamic chains.
 *
 * Key Components:
 * - ChainedMicroservice: Complete microservice implementation
 * - ChainRegistry: Manages multiple chain definitions
 * - ExecutionTracker: Tracks chain executions
 * - ChainOptimizer: Optimizes chain performance
 * - DynamicChainBuilder: Builds chains dynamically
 *
 * Benefits:
 * - Production-ready chain orchestration service
 * - Multiple chain management
 * - Execution tracking and analytics
 * - Performance optimization
 * - Dynamic chain composition
 *
 * Use Cases:
 * - Workflow orchestration platforms
 * - Business process automation
 * - Data pipeline management
 * - Multi-stage processing systems
 */

const EventEmitter = require('events');
const http = require('http');
const crypto = require('crypto');

/**
 * ChainRegistry - Manages multiple chain definitions
 */
class ChainRegistry {
    constructor() {
        this.chains = new Map();
    }

    /**
     * Register a chain
     */
    registerChain(chainId, chainDefinition) {
        this.chains.set(chainId, {
            id: chainId,
            definition: chainDefinition,
            registeredAt: new Date(),
            executionCount: 0,
            lastExecuted: null
        });

        console.log(`[ChainRegistry] Chain registered: ${chainId}`);
    }

    /**
     * Get chain definition
     */
    getChain(chainId) {
        return this.chains.get(chainId);
    }

    /**
     * Update chain execution stats
     */
    updateStats(chainId) {
        const chain = this.chains.get(chainId);
        if (chain) {
            chain.executionCount++;
            chain.lastExecuted = new Date();
        }
    }

    /**
     * Get all chains
     */
    getAllChains() {
        const chains = [];
        for (const [chainId, chain] of this.chains.entries()) {
            chains.push({
                id: chainId,
                linkCount: chain.definition.links ? chain.definition.links.length : 0,
                executionCount: chain.executionCount,
                lastExecuted: chain.lastExecuted
            });
        }
        return chains;
    }

    /**
     * Deregister a chain
     */
    deregisterChain(chainId) {
        return this.chains.delete(chainId);
    }
}

/**
 * ExecutionTracker - Tracks chain executions
 */
class ExecutionTracker {
    constructor() {
        this.executions = new Map();
        this.completedExecutions = [];
        this.maxHistory = 500;
    }

    /**
     * Start tracking an execution
     */
    startExecution(executionId, chainId, linkCount) {
        const execution = {
            executionId,
            chainId,
            linkCount,
            startTime: Date.now(),
            status: 'running',
            links: [],
            currentLink: null
        };

        this.executions.set(executionId, execution);
        return execution;
    }

    /**
     * Track link execution
     */
    trackLink(executionId, linkName, status, duration, data = {}) {
        const execution = this.executions.get(executionId);
        if (!execution) return;

        execution.links.push({
            linkName,
            status,
            duration,
            timestamp: Date.now(),
            ...data
        });

        execution.currentLink = linkName;
    }

    /**
     * Complete execution tracking
     */
    completeExecution(executionId, status, finalData = {}) {
        const execution = this.executions.get(executionId);
        if (!execution) return;

        execution.status = status;
        execution.endTime = Date.now();
        execution.totalDuration = execution.endTime - execution.startTime;
        execution.finalData = finalData;

        // Move to completed
        this.completedExecutions.push(execution);
        this.executions.delete(executionId);

        // Limit history
        if (this.completedExecutions.length > this.maxHistory) {
            this.completedExecutions.shift();
        }
    }

    /**
     * Get execution status
     */
    getExecutionStatus(executionId) {
        const active = this.executions.get(executionId);
        if (active) {
            return {
                status: 'active',
                execution: this.formatExecution(active)
            };
        }

        const completed = this.completedExecutions.find(e => e.executionId === executionId);
        if (completed) {
            return {
                status: 'completed',
                execution: this.formatExecution(completed)
            };
        }

        return { status: 'not-found' };
    }

    /**
     * Format execution for output
     */
    formatExecution(execution) {
        return {
            executionId: execution.executionId,
            chainId: execution.chainId,
            status: execution.status,
            linkCount: execution.linkCount,
            linksCompleted: execution.links.length,
            currentLink: execution.currentLink,
            duration: execution.totalDuration || (Date.now() - execution.startTime),
            links: execution.links
        };
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const total = this.completedExecutions.length;
        const successful = this.completedExecutions.filter(e => e.status === 'success').length;
        const failed = this.completedExecutions.filter(e => e.status === 'failed').length;

        const avgDuration = total > 0
            ? this.completedExecutions.reduce((sum, e) => sum + e.totalDuration, 0) / total
            : 0;

        return {
            activeExecutions: this.executions.size,
            totalCompleted: total,
            successful,
            failed,
            successRate: total > 0 ? (successful / total) * 100 : 0,
            averageDuration: Math.round(avgDuration)
        };
    }

    /**
     * Get chain-specific statistics
     */
    getChainStatistics(chainId) {
        const chainExecutions = this.completedExecutions.filter(e => e.chainId === chainId);

        if (chainExecutions.length === 0) {
            return null;
        }

        const successful = chainExecutions.filter(e => e.status === 'success').length;
        const avgDuration = chainExecutions.reduce((sum, e) => sum + e.totalDuration, 0) / chainExecutions.length;

        return {
            chainId,
            totalExecutions: chainExecutions.length,
            successful,
            failed: chainExecutions.length - successful,
            successRate: (successful / chainExecutions.length) * 100,
            averageDuration: Math.round(avgDuration)
        };
    }
}

/**
 * ChainOptimizer - Optimizes chain execution
 */
class ChainOptimizer {
    constructor() {
        this.linkPerformance = new Map();
    }

    /**
     * Record link performance
     */
    recordPerformance(chainId, linkName, duration, success) {
        const key = `${chainId}:${linkName}`;

        if (!this.linkPerformance.has(key)) {
            this.linkPerformance.set(key, {
                executions: [],
                totalExecutions: 0,
                successCount: 0,
                failCount: 0
            });
        }

        const perf = this.linkPerformance.get(key);
        perf.executions.push({ duration, success, timestamp: Date.now() });
        perf.totalExecutions++;

        if (success) {
            perf.successCount++;
        } else {
            perf.failCount++;
        }

        // Keep only last 50 executions
        if (perf.executions.length > 50) {
            perf.executions.shift();
        }
    }

    /**
     * Get recommended timeout for link
     */
    getRecommendedTimeout(chainId, linkName, defaultTimeout = 5000) {
        const key = `${chainId}:${linkName}`;
        const perf = this.linkPerformance.get(key);

        if (!perf || perf.executions.length < 3) {
            return defaultTimeout;
        }

        const successfulDurations = perf.executions
            .filter(e => e.success)
            .map(e => e.duration)
            .sort((a, b) => a - b);

        if (successfulDurations.length === 0) {
            return defaultTimeout;
        }

        // Use 90th percentile + 50% buffer
        const p90Index = Math.floor(successfulDurations.length * 0.9);
        const p90Duration = successfulDurations[p90Index];

        return Math.min(Math.round(p90Duration * 1.5), defaultTimeout);
    }

    /**
     * Get bottleneck links
     */
    getBottlenecks(chainId, threshold = 3000) {
        const bottlenecks = [];

        for (const [key, perf] of this.linkPerformance.entries()) {
            if (!key.startsWith(`${chainId}:`)) continue;

            const avgDuration = perf.executions.reduce((sum, e) => sum + e.duration, 0) / perf.executions.length;

            if (avgDuration > threshold) {
                const linkName = key.split(':')[1];
                bottlenecks.push({
                    linkName,
                    averageDuration: Math.round(avgDuration),
                    executions: perf.totalExecutions
                });
            }
        }

        return bottlenecks.sort((a, b) => b.averageDuration - a.averageDuration);
    }

    /**
     * Get optimization recommendations
     */
    getRecommendations(chainId) {
        const recommendations = [];
        const bottlenecks = this.getBottlenecks(chainId);

        if (bottlenecks.length > 0) {
            recommendations.push({
                type: 'bottleneck',
                severity: 'high',
                message: `Chain has ${bottlenecks.length} slow link(s)`,
                details: bottlenecks
            });
        }

        // Check for high failure rates
        for (const [key, perf] of this.linkPerformance.entries()) {
            if (!key.startsWith(`${chainId}:`)) continue;

            const failureRate = (perf.failCount / perf.totalExecutions) * 100;

            if (failureRate > 20) {
                const linkName = key.split(':')[1];
                recommendations.push({
                    type: 'reliability',
                    severity: 'high',
                    message: `Link ${linkName} has high failure rate: ${failureRate.toFixed(1)}%`
                });
            }
        }

        return recommendations;
    }
}

/**
 * DynamicChainBuilder - Builds chains dynamically based on conditions
 */
class DynamicChainBuilder {
    constructor() {
        this.rules = new Map();
    }

    /**
     * Add a rule for dynamic chain building
     */
    addRule(ruleName, ruleFunction) {
        this.rules.set(ruleName, ruleFunction);
    }

    /**
     * Build chain dynamically based on input data
     */
    buildChain(baseChain, inputData) {
        let chain = { ...baseChain };

        for (const [ruleName, ruleFunction] of this.rules.entries()) {
            chain = ruleFunction(chain, inputData);
        }

        return chain;
    }

    /**
     * Add conditional link
     */
    static addConditionalLink(chain, linkConfig, condition) {
        return {
            ...chain,
            links: [
                ...chain.links,
                {
                    ...linkConfig,
                    condition: condition
                }
            ]
        };
    }

    /**
     * Remove link by name
     */
    static removeLink(chain, linkName) {
        return {
            ...chain,
            links: chain.links.filter(link => link.name !== linkName)
        };
    }
}

/**
 * ChainedMicroservice - Complete chained orchestration microservice
 */
class ChainedMicroservice extends EventEmitter {
    constructor(config) {
        super();
        this.name = config.name || 'ChainedMS';
        this.port = config.port || 8000;
        this.host = config.host || 'localhost';

        // Initialize components
        this.registry = new ChainRegistry();
        this.tracker = new ExecutionTracker();
        this.optimizer = new ChainOptimizer();
        this.dynamicBuilder = new DynamicChainBuilder();

        this.server = null;

        this.metrics = {
            totalRequests: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            startTime: null
        };
    }

    /**
     * Register a chain definition
     */
    registerChain(chainId, chainDefinition) {
        this.registry.registerChain(chainId, chainDefinition);
        console.log(`[${this.name}] Chain registered: ${chainId}`);
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
            } else if (url.startsWith('/execute/')) {
                await this.handleExecute(req, res);
            } else if (url === '/chains') {
                await this.handleChains(req, res);
            } else if (url === '/metrics') {
                await this.handleMetrics(req, res);
            } else if (url.startsWith('/status/')) {
                await this.handleStatus(req, res);
            } else if (url.startsWith('/optimize/')) {
                await this.handleOptimize(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not found' }));
            }
        } catch (error) {
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
            chains: this.registry.getAllChains().length,
            activeExecutions: this.tracker.executions.size
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health));
    }

    /**
     * Execute chain endpoint
     */
    async handleExecute(req, res) {
        const chainId = req.url.split('/')[2];
        const executionId = this.generateExecutionId();

        console.log(`[${this.name}] Executing chain ${chainId} (execution: ${executionId})`);

        const chain = this.registry.getChain(chainId);

        if (!chain) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Chain not found' }));
            return;
        }

        // Start tracking
        this.tracker.startExecution(executionId, chainId, chain.definition.links.length);

        try {
            // Execute chain using ChainCoordinator
            const { ChainCoordinator } = require('./Chained');
            const coordinator = this.buildCoordinator(chain.definition);

            const result = await coordinator.executeChain({});

            // Track each link performance
            if (result.metadata && result.metadata.executedLinks) {
                for (const link of result.metadata.executedLinks) {
                    this.optimizer.recordPerformance(
                        chainId,
                        link.linkName,
                        link.executionTime,
                        link.success
                    );

                    this.tracker.trackLink(
                        executionId,
                        link.linkName,
                        link.success ? 'success' : 'failed',
                        link.executionTime
                    );
                }
            }

            // Complete tracking
            this.tracker.completeExecution(
                executionId,
                result.success ? 'success' : 'failed',
                result.data
            );

            // Update metrics
            if (result.success) {
                this.metrics.successfulExecutions++;
            } else {
                this.metrics.failedExecutions++;
            }

            // Update registry stats
            this.registry.updateStats(chainId);

            const response = {
                executionId,
                chainId,
                success: result.success,
                data: result.data,
                metadata: result.metadata
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        } catch (error) {
            this.tracker.completeExecution(executionId, 'failed');
            this.metrics.failedExecutions++;

            throw error;
        }
    }

    /**
     * Build chain coordinator from definition
     */
    buildCoordinator(definition) {
        const { ChainCoordinator } = require('./Chained');
        const coordinator = new ChainCoordinator({
            name: definition.name,
            stopOnError: definition.stopOnError
        });

        for (const linkDef of definition.links) {
            coordinator.addLink(linkDef);
        }

        return coordinator;
    }

    /**
     * Chains list endpoint
     */
    async handleChains(req, res) {
        const chains = this.registry.getAllChains();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ chains }));
    }

    /**
     * Metrics endpoint
     */
    async handleMetrics(req, res) {
        const metrics = {
            service: this.metrics,
            tracker: this.tracker.getStatistics(),
            chains: this.registry.getAllChains().map(chain => ({
                ...chain,
                statistics: this.tracker.getChainStatistics(chain.id)
            }))
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(metrics));
    }

    /**
     * Execution status endpoint
     */
    async handleStatus(req, res) {
        const executionId = req.url.split('/')[2];
        const status = this.tracker.getExecutionStatus(executionId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
    }

    /**
     * Optimization endpoint
     */
    async handleOptimize(req, res) {
        const chainId = req.url.split('/')[2];
        const recommendations = this.optimizer.getRecommendations(chainId);
        const bottlenecks = this.optimizer.getBottlenecks(chainId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ recommendations, bottlenecks }));
    }

    /**
     * Generate execution ID
     */
    generateExecutionId() {
        return crypto.randomBytes(16).toString('hex');
    }
}

// Demonstration
async function demonstrateChainedMS() {
    console.log('=== Chained Microservice Pattern Demonstration ===\n');

    // Create chained microservice
    const chainedMS = new ChainedMicroservice({
        name: 'WorkflowOrchestrator',
        port: 8500
    });

    // Register chains
    console.log('--- Registering Chains ---');

    chainedMS.registerChain('user-onboarding', {
        name: 'UserOnboardingChain',
        stopOnError: false,
        links: [
            {
                name: 'validate-user',
                serviceName: 'validation-service',
                endpoint: '/api/validate',
                timeout: 3000,
                required: true
            },
            {
                name: 'create-account',
                serviceName: 'account-service',
                endpoint: '/api/create',
                timeout: 4000,
                required: true
            },
            {
                name: 'send-welcome',
                serviceName: 'email-service',
                endpoint: '/api/send',
                timeout: 2000,
                required: false
            }
        ]
    });

    chainedMS.registerChain('order-fulfillment', {
        name: 'OrderFulfillmentChain',
        stopOnError: true,
        links: [
            {
                name: 'validate-order',
                serviceName: 'validation-service',
                endpoint: '/api/validate-order',
                timeout: 3000
            },
            {
                name: 'reserve-inventory',
                serviceName: 'inventory-service',
                endpoint: '/api/reserve',
                timeout: 4000
            },
            {
                name: 'process-payment',
                serviceName: 'payment-service',
                endpoint: '/api/charge',
                timeout: 5000
            },
            {
                name: 'create-shipment',
                serviceName: 'shipping-service',
                endpoint: '/api/ship',
                timeout: 3000
            }
        ]
    });

    // Start the microservice
    console.log('\n--- Starting Chained Microservice ---');
    await chainedMS.start();

    console.log('\n--- Chained Microservice Running ---');
    console.log(`Access endpoints:`);
    console.log(`  Health: http://localhost:8500/health`);
    console.log(`  Execute Chain: http://localhost:8500/execute/{chainId}`);
    console.log(`  Chains: http://localhost:8500/chains`);
    console.log(`  Metrics: http://localhost:8500/metrics`);
    console.log(`  Status: http://localhost:8500/status/{executionId}`);
    console.log(`  Optimize: http://localhost:8500/optimize/{chainId}`);
}

// Export classes
module.exports = {
    ChainRegistry,
    ExecutionTracker,
    ChainOptimizer,
    DynamicChainBuilder,
    ChainedMicroservice
};

if (require.main === module) {
    demonstrateChainedMS().catch(console.error);
}
