/**
 * Branch Pattern
 *
 * The Branch pattern executes multiple microservice calls in parallel and processes
 * their responses independently. Unlike aggregation, branch pattern allows different
 * processing logic for each service response and can combine results using various
 * strategies. This pattern is useful when you need to perform multiple independent
 * operations simultaneously.
 *
 * Key Components:
 * - BranchCoordinator: Manages parallel service execution
 * - BranchExecutor: Executes individual service branches
 * - ResponseProcessor: Processes individual responses
 * - ResultCombiner: Combines processed results
 *
 * Benefits:
 * - Improved performance through parallelization
 * - Independent error handling per branch
 * - Flexible response processing
 * - Reduced latency for multiple service calls
 * - Better resource utilization
 *
 * Use Cases:
 * - Parallel data fetching from multiple sources
 * - Fan-out request patterns
 * - Independent service operations
 * - Scatter-gather patterns
 */

const EventEmitter = require('events');

/**
 * BranchConfig - Configuration for a single branch
 */
class BranchConfig {
    constructor(config) {
        this.id = config.id || this.generateId();
        this.name = config.name;
        this.serviceName = config.serviceName;
        this.endpoint = config.endpoint;
        this.method = config.method || 'GET';
        this.timeout = config.timeout || 5000;
        this.retries = config.retries || 0;
        this.processor = config.processor || ((data) => data);
        this.errorHandler = config.errorHandler || null;
        this.priority = config.priority || 0;
        this.required = config.required !== false;
        this.metadata = config.metadata || {};
    }

    /**
     * Generate branch ID
     */
    generateId() {
        return `branch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Validate configuration
     */
    validate() {
        const errors = [];

        if (!this.serviceName) {
            errors.push('Service name is required');
        }

        if (!this.endpoint) {
            errors.push('Endpoint is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

/**
 * BranchResult - Result from a single branch execution
 */
class BranchResult {
    constructor(config) {
        this.branchId = config.branchId;
        this.branchName = config.branchName;
        this.success = config.success;
        this.data = config.data || null;
        this.error = config.error || null;
        this.executionTime = config.executionTime || 0;
        this.timestamp = new Date();
        this.metadata = config.metadata || {};
    }

    /**
     * Check if result is successful
     */
    isSuccessful() {
        return this.success === true;
    }

    /**
     * Get result data or throw error
     */
    getDataOrThrow() {
        if (!this.success) {
            throw new Error(this.error || 'Branch execution failed');
        }
        return this.data;
    }
}

/**
 * BranchExecutor - Executes a single branch
 */
class BranchExecutor extends EventEmitter {
    constructor(branchConfig) {
        super();
        this.config = branchConfig;
    }

    /**
     * Execute the branch
     */
    async execute(context = {}) {
        const startTime = Date.now();

        console.log(`[Branch ${this.config.name}] Executing...`);

        this.emit('branchStarted', {
            branchId: this.config.id,
            branchName: this.config.name
        });

        try {
            // Execute service call
            const rawData = await this.executeServiceCall();

            // Process response
            const processedData = await this.processResponse(rawData, context);

            const executionTime = Date.now() - startTime;

            const result = new BranchResult({
                branchId: this.config.id,
                branchName: this.config.name,
                success: true,
                data: processedData,
                executionTime,
                metadata: {
                    serviceName: this.config.serviceName,
                    endpoint: this.config.endpoint
                }
            });

            this.emit('branchCompleted', result);

            console.log(`[Branch ${this.config.name}] Completed in ${executionTime}ms`);

            return result;
        } catch (error) {
            const executionTime = Date.now() - startTime;

            // Handle error
            if (this.config.errorHandler) {
                try {
                    const fallbackData = await this.config.errorHandler(error, context);

                    return new BranchResult({
                        branchId: this.config.id,
                        branchName: this.config.name,
                        success: true,
                        data: fallbackData,
                        executionTime,
                        metadata: { fallback: true }
                    });
                } catch (handlerError) {
                    error = handlerError;
                }
            }

            const result = new BranchResult({
                branchId: this.config.id,
                branchName: this.config.name,
                success: false,
                error: error.message,
                executionTime
            });

            this.emit('branchFailed', result);

            console.log(`[Branch ${this.config.name}] Failed: ${error.message}`);

            return result;
        }
    }

    /**
     * Execute service call
     */
    async executeServiceCall() {
        // Simulate service call with timeout
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, this.config.timeout);

            // Simulate async operation
            setTimeout(() => {
                clearTimeout(timer);

                // Simulate occasional failures
                if (Math.random() < 0.15) { // 15% failure rate
                    reject(new Error(`Service ${this.config.serviceName} failed`));
                } else {
                    resolve({
                        service: this.config.serviceName,
                        endpoint: this.config.endpoint,
                        data: {
                            message: `Response from ${this.config.serviceName}`,
                            timestamp: new Date()
                        }
                    });
                }
            }, Math.random() * 500);
        });
    }

    /**
     * Process response using configured processor
     */
    async processResponse(rawData, context) {
        if (this.config.processor) {
            return await this.config.processor(rawData, context);
        }
        return rawData;
    }

    /**
     * Execute with retries
     */
    async executeWithRetries(context = {}) {
        let lastError;

        for (let attempt = 0; attempt <= this.config.retries; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`[Branch ${this.config.name}] Retry attempt ${attempt}`);
                }

                return await this.execute(context);
            } catch (error) {
                lastError = error;

                if (attempt < this.config.retries) {
                    // Wait before retry with exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }

        throw lastError;
    }
}

/**
 * ResultCombiner - Combines results from multiple branches
 */
class ResultCombiner {
    constructor() {
        this.strategies = new Map();
        this.initializeStrategies();
    }

    /**
     * Initialize combination strategies
     */
    initializeStrategies() {
        // All strategy - requires all branches to succeed
        this.strategies.set('all', (results) => {
            const allSuccessful = results.every(r => r.isSuccessful());

            if (!allSuccessful) {
                const failures = results.filter(r => !r.isSuccessful());
                throw new Error(`${failures.length} branches failed`);
            }

            return results.reduce((acc, result) => {
                acc[result.branchName] = result.data;
                return acc;
            }, {});
        });

        // Any strategy - succeeds if at least one branch succeeds
        this.strategies.set('any', (results) => {
            const successful = results.filter(r => r.isSuccessful());

            if (successful.length === 0) {
                throw new Error('All branches failed');
            }

            return successful.map(r => ({
                branch: r.branchName,
                data: r.data
            }));
        });

        // Required strategy - checks required branches
        this.strategies.set('required', (results, requiredBranches = []) => {
            const combined = {};

            for (const result of results) {
                if (result.isSuccessful()) {
                    combined[result.branchName] = result.data;
                } else if (requiredBranches.includes(result.branchName)) {
                    throw new Error(`Required branch failed: ${result.branchName}`);
                }
            }

            return combined;
        });

        // Best effort strategy - includes all successful results
        this.strategies.set('best-effort', (results) => {
            const combined = {
                successful: [],
                failed: []
            };

            for (const result of results) {
                if (result.isSuccessful()) {
                    combined.successful.push({
                        branch: result.branchName,
                        data: result.data
                    });
                } else {
                    combined.failed.push({
                        branch: result.branchName,
                        error: result.error
                    });
                }
            }

            return combined;
        });

        // Priority strategy - uses highest priority successful result
        this.strategies.set('priority', (results, priorities = {}) => {
            const successful = results
                .filter(r => r.isSuccessful())
                .sort((a, b) => {
                    const priorityA = priorities[a.branchName] || 0;
                    const priorityB = priorities[b.branchName] || 0;
                    return priorityB - priorityA;
                });

            if (successful.length === 0) {
                throw new Error('No successful branches');
            }

            return successful[0].data;
        });
    }

    /**
     * Combine results using specified strategy
     */
    combine(results, strategy = 'all', options = {}) {
        const combinerFunction = this.strategies.get(strategy);

        if (!combinerFunction) {
            throw new Error(`Unknown combination strategy: ${strategy}`);
        }

        return combinerFunction(results, options);
    }

    /**
     * Add custom combination strategy
     */
    addStrategy(name, strategyFunction) {
        this.strategies.set(name, strategyFunction);
    }
}

/**
 * BranchCoordinator - Coordinates execution of multiple branches
 */
class BranchCoordinator extends EventEmitter {
    constructor(config = {}) {
        super();
        this.name = config.name || 'BranchCoordinator';
        this.branches = new Map();
        this.combiner = new ResultCombiner();
        this.defaultStrategy = config.defaultStrategy || 'all';
        this.timeout = config.timeout || 30000;
        this.continueOnError = config.continueOnError !== false;
    }

    /**
     * Register a branch
     */
    registerBranch(branchConfig) {
        const validation = branchConfig.validate();

        if (!validation.valid) {
            throw new Error(`Invalid branch config: ${validation.errors.join(', ')}`);
        }

        const executor = new BranchExecutor(branchConfig);

        // Forward branch events
        executor.on('branchStarted', (data) => this.emit('branchStarted', data));
        executor.on('branchCompleted', (data) => this.emit('branchCompleted', data));
        executor.on('branchFailed', (data) => this.emit('branchFailed', data));

        this.branches.set(branchConfig.id, {
            config: branchConfig,
            executor
        });

        console.log(`[${this.name}] Branch registered: ${branchConfig.name}`);
    }

    /**
     * Execute all branches
     */
    async executeAll(context = {}, options = {}) {
        console.log(`[${this.name}] Executing ${this.branches.size} branches`);

        const startTime = Date.now();

        this.emit('executionStarted', {
            branchCount: this.branches.size,
            timestamp: new Date()
        });

        try {
            // Create execution promises
            const executionPromises = [];

            for (const [branchId, { executor, config }] of this.branches.entries()) {
                const promise = config.retries > 0
                    ? executor.executeWithRetries(context)
                    : executor.execute(context);

                executionPromises.push(promise);
            }

            // Execute all branches in parallel
            const results = await Promise.all(
                executionPromises.map(p => p.catch(error => ({
                    success: false,
                    error: error.message
                })))
            );

            // Combine results
            const strategy = options.strategy || this.defaultStrategy;
            const combined = this.combiner.combine(results, strategy, options);

            const executionTime = Date.now() - startTime;

            this.emit('executionCompleted', {
                branchCount: this.branches.size,
                executionTime,
                successCount: results.filter(r => r.isSuccessful()).length,
                failureCount: results.filter(r => !r.isSuccessful()).length
            });

            console.log(`[${this.name}] Execution completed in ${executionTime}ms`);

            return {
                success: true,
                data: combined,
                metadata: {
                    totalBranches: this.branches.size,
                    successfulBranches: results.filter(r => r.isSuccessful()).length,
                    failedBranches: results.filter(r => !r.isSuccessful()).length,
                    executionTime,
                    results
                }
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;

            this.emit('executionFailed', {
                error: error.message,
                executionTime
            });

            console.log(`[${this.name}] Execution failed: ${error.message}`);

            throw error;
        }
    }

    /**
     * Execute specific branches
     */
    async executeSelected(branchIds, context = {}, options = {}) {
        const selectedBranches = branchIds.map(id => {
            const branch = this.branches.get(id);
            if (!branch) {
                throw new Error(`Branch not found: ${id}`);
            }
            return branch;
        });

        console.log(`[${this.name}] Executing ${selectedBranches.length} selected branches`);

        const executionPromises = selectedBranches.map(({ executor, config }) => {
            return config.retries > 0
                ? executor.executeWithRetries(context)
                : executor.execute(context);
        });

        const results = await Promise.all(
            executionPromises.map(p => p.catch(error => ({
                success: false,
                error: error.message
            })))
        );

        const strategy = options.strategy || this.defaultStrategy;
        const combined = this.combiner.combine(results, strategy, options);

        return {
            success: true,
            data: combined,
            metadata: {
                totalBranches: selectedBranches.length,
                successfulBranches: results.filter(r => r.isSuccessful()).length,
                failedBranches: results.filter(r => !r.isSuccessful()).length
            }
        };
    }

    /**
     * Add custom combination strategy
     */
    addCombinationStrategy(name, strategyFunction) {
        this.combiner.addStrategy(name, strategyFunction);
    }

    /**
     * Get registered branches
     */
    getBranches() {
        const branches = [];
        for (const [branchId, { config }] of this.branches.entries()) {
            branches.push({
                id: branchId,
                name: config.name,
                serviceName: config.serviceName,
                endpoint: config.endpoint,
                required: config.required
            });
        }
        return branches;
    }
}

// Demonstration
async function demonstrateBranch() {
    console.log('=== Branch Pattern Demonstration ===\n');

    // Create branch coordinator
    const coordinator = new BranchCoordinator({
        name: 'DataBranchCoordinator',
        defaultStrategy: 'best-effort',
        timeout: 10000
    });

    // Listen to events
    coordinator.on('executionStarted', (data) => {
        console.log(`\n[Event] Execution started with ${data.branchCount} branches`);
    });

    coordinator.on('branchCompleted', (result) => {
        console.log(`[Event] Branch completed: ${result.branchName}`);
    });

    coordinator.on('branchFailed', (result) => {
        console.log(`[Event] Branch failed: ${result.branchName} - ${result.error}`);
    });

    coordinator.on('executionCompleted', (data) => {
        console.log(`[Event] Execution completed: ${data.successCount} succeeded, ${data.failureCount} failed`);
    });

    // Register branches
    console.log('--- Registering Branches ---');

    coordinator.registerBranch(new BranchConfig({
        name: 'user-data',
        serviceName: 'user-service',
        endpoint: '/api/users/123',
        timeout: 3000,
        retries: 2,
        required: true,
        processor: (data) => ({
            userId: 123,
            username: data.data.message,
            processed: true
        })
    }));

    coordinator.registerBranch(new BranchConfig({
        name: 'order-history',
        serviceName: 'order-service',
        endpoint: '/api/orders/user/123',
        timeout: 5000,
        retries: 1,
        required: false,
        processor: (data) => ({
            orders: [1, 2, 3],
            total: 3,
            source: data.service
        })
    }));

    coordinator.registerBranch(new BranchConfig({
        name: 'recommendations',
        serviceName: 'recommendation-service',
        endpoint: '/api/recommendations/123',
        timeout: 2000,
        required: false,
        errorHandler: async (error) => {
            console.log('[ErrorHandler] Using fallback recommendations');
            return { recommendations: ['default-item-1', 'default-item-2'] };
        },
        processor: (data) => ({
            items: ['item-1', 'item-2', 'item-3'],
            count: 3
        })
    }));

    coordinator.registerBranch(new BranchConfig({
        name: 'analytics',
        serviceName: 'analytics-service',
        endpoint: '/api/analytics/user/123',
        timeout: 4000,
        required: false,
        processor: (data) => ({
            pageViews: 100,
            lastVisit: new Date()
        })
    }));

    // Show registered branches
    console.log('\n--- Registered Branches ---');
    const branches = coordinator.getBranches();
    branches.forEach(branch => {
        console.log(`- ${branch.name} (${branch.serviceName})`);
    });

    // Execute all branches with different strategies
    console.log('\n--- Testing Best-Effort Strategy ---');
    const bestEffortResult = await coordinator.executeAll({}, { strategy: 'best-effort' });
    console.log('\nBest-Effort Result:');
    console.log(JSON.stringify(bestEffortResult.data, null, 2));

    console.log('\n--- Testing Required Strategy ---');
    try {
        const requiredResult = await coordinator.executeAll(
            {},
            {
                strategy: 'required',
                requiredBranches: ['user-data']
            }
        );
        console.log('\nRequired Result:');
        console.log(JSON.stringify(requiredResult.data, null, 2));
    } catch (error) {
        console.log('Required strategy failed:', error.message);
    }

    console.log('\n--- Execution Metadata ---');
    console.log(JSON.stringify(bestEffortResult.metadata, null, 2));
}

// Export classes
module.exports = {
    BranchConfig,
    BranchResult,
    BranchExecutor,
    ResultCombiner,
    BranchCoordinator
};

if (require.main === module) {
    demonstrateBranch().catch(console.error);
}
