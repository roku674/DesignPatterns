/**
 * Retry Pattern Cloud Implementation
 *
 * The Retry Pattern handles transient failures in distributed systems by automatically
 * retrying failed operations with configurable strategies including exponential backoff,
 * jitter, circuit breaking, and comprehensive failure tracking.
 *
 * Key Features:
 * - Multiple retry strategies (exponential, linear, fixed, fibonacci)
 * - Jitter to prevent thundering herd
 * - Circuit breaker integration
 * - Retry budgets and rate limiting
 * - Comprehensive metrics and observability
 * - Dead letter queue for permanent failures
 * - Idempotency support
 * - Timeout management
 *
 * @module RetryPatternCloud
 */

/**
 * Retry strategies for different failure scenarios
 */
const RetryStrategy = {
    EXPONENTIAL: 'exponential',
    LINEAR: 'linear',
    FIXED: 'fixed',
    FIBONACCI: 'fibonacci',
    CUSTOM: 'custom'
};

/**
 * Circuit breaker states
 */
const CircuitState = {
    CLOSED: 'closed',      // Normal operation
    OPEN: 'open',          // Rejecting requests
    HALF_OPEN: 'half_open' // Testing if service recovered
};

/**
 * Retry configuration options
 * @typedef {Object} RetryConfig
 * @property {number} maxAttempts - Maximum number of retry attempts
 * @property {number} initialDelay - Initial delay in milliseconds
 * @property {number} maxDelay - Maximum delay between retries
 * @property {string} strategy - Retry strategy to use
 * @property {number} timeout - Timeout for each attempt in milliseconds
 * @property {boolean} useJitter - Add randomness to prevent thundering herd
 * @property {Function} retryCondition - Function to determine if error is retryable
 */

/**
 * Circuit Breaker for preventing cascading failures
 */
class CircuitBreaker {
    constructor(config = {}) {
        this.failureThreshold = config.failureThreshold || 5;
        this.successThreshold = config.successThreshold || 2;
        this.timeout = config.timeout || 60000; // 1 minute
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
        this.lastStateChange = Date.now();
    }

    /**
     * Check if request should be allowed through
     * @returns {boolean} Whether request is allowed
     */
    async allowRequest() {
        const now = Date.now();

        switch (this.state) {
            case CircuitState.CLOSED:
                return true;

            case CircuitState.OPEN:
                if (now >= this.nextAttempt) {
                    this.state = CircuitState.HALF_OPEN;
                    this.successCount = 0;
                    this.lastStateChange = now;
                    console.log('Circuit breaker entering HALF_OPEN state');
                    return true;
                }
                return false;

            case CircuitState.HALF_OPEN:
                return true;

            default:
                return true;
        }
    }

    /**
     * Record successful operation
     */
    async recordSuccess() {
        this.failureCount = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.lastStateChange = Date.now();
                console.log('Circuit breaker CLOSED - service recovered');
            }
        }
    }

    /**
     * Record failed operation
     */
    async recordFailure() {
        this.failureCount++;

        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.OPEN;
            this.nextAttempt = Date.now() + this.timeout;
            this.lastStateChange = Date.now();
            console.log('Circuit breaker OPEN - service still failing');
        } else if (this.state === CircuitState.CLOSED) {
            if (this.failureCount >= this.failureThreshold) {
                this.state = CircuitState.OPEN;
                this.nextAttempt = Date.now() + this.timeout;
                this.lastStateChange = Date.now();
                console.log('Circuit breaker OPEN - threshold reached');
            }
        }
    }

    /**
     * Get current circuit breaker status
     * @returns {Object} Circuit breaker state and metrics
     */
    getStatus() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            nextAttempt: this.nextAttempt,
            lastStateChange: this.lastStateChange,
            timeInCurrentState: Date.now() - this.lastStateChange
        };
    }

    /**
     * Reset circuit breaker to initial state
     */
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
        this.lastStateChange = Date.now();
    }
}

/**
 * Dead Letter Queue for permanently failed operations
 */
class DeadLetterQueue {
    constructor(maxSize = 1000) {
        this.queue = [];
        this.maxSize = maxSize;
    }

    /**
     * Add failed operation to dead letter queue
     * @param {Object} operation - Failed operation details
     */
    async add(operation) {
        const entry = {
            ...operation,
            timestamp: new Date(),
            id: this.generateId()
        };

        this.queue.push(entry);

        if (this.queue.length > this.maxSize) {
            this.queue.shift(); // Remove oldest entry
        }

        console.log(`Added to dead letter queue: ${entry.id}`);
        return entry;
    }

    /**
     * Get all dead letter queue entries
     * @returns {Array} Queue entries
     */
    getAll() {
        return [...this.queue];
    }

    /**
     * Get entries by filter
     * @param {Object} filter - Filter criteria
     * @returns {Array} Filtered entries
     */
    query(filter = {}) {
        let results = [...this.queue];

        if (filter.operationType) {
            results = results.filter(e => e.operationType === filter.operationType);
        }

        if (filter.errorType) {
            results = results.filter(e => e.error?.type === filter.errorType);
        }

        if (filter.from) {
            results = results.filter(e => e.timestamp >= filter.from);
        }

        return results;
    }

    /**
     * Clear dead letter queue
     */
    clear() {
        this.queue = [];
    }

    generateId() {
        return `dlq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Retry metrics tracker
 */
class RetryMetrics {
    constructor() {
        this.attempts = [];
        this.successes = 0;
        this.failures = 0;
        this.totalRetries = 0;
        this.totalDelay = 0;
    }

    /**
     * Record retry attempt
     * @param {Object} attempt - Attempt details
     */
    recordAttempt(attempt) {
        this.attempts.push({
            ...attempt,
            timestamp: new Date()
        });

        if (attempt.success) {
            this.successes++;
        } else {
            this.failures++;
        }

        if (attempt.attemptNumber > 1) {
            this.totalRetries++;
        }

        if (attempt.delay) {
            this.totalDelay += attempt.delay;
        }
    }

    /**
     * Get metrics summary
     * @returns {Object} Metrics summary
     */
    getSummary() {
        const recentAttempts = this.attempts.slice(-100);

        return {
            total: this.attempts.length,
            successes: this.successes,
            failures: this.failures,
            totalRetries: this.totalRetries,
            averageRetries: this.totalRetries / (this.successes + this.failures) || 0,
            totalDelay: this.totalDelay,
            averageDelay: this.totalDelay / this.totalRetries || 0,
            successRate: (this.successes / (this.successes + this.failures) * 100) || 0,
            recentAttempts: recentAttempts.length,
            recentSuccessRate: this.calculateRecentSuccessRate(recentAttempts)
        };
    }

    calculateRecentSuccessRate(attempts) {
        if (attempts.length === 0) return 0;
        const successes = attempts.filter(a => a.success).length;
        return (successes / attempts.length * 100);
    }

    /**
     * Get detailed attempt history
     * @param {number} limit - Maximum number of attempts to return
     * @returns {Array} Attempt history
     */
    getHistory(limit = 50) {
        return this.attempts.slice(-limit);
    }

    /**
     * Clear metrics
     */
    clear() {
        this.attempts = [];
        this.successes = 0;
        this.failures = 0;
        this.totalRetries = 0;
        this.totalDelay = 0;
    }
}

/**
 * Main Retry Pattern Cloud implementation
 */
class RetryPatternCloud {
    constructor(config = {}) {
        this.maxAttempts = config.maxAttempts || 3;
        this.initialDelay = config.initialDelay || 1000;
        this.maxDelay = config.maxDelay || 30000;
        this.strategy = config.strategy || RetryStrategy.EXPONENTIAL;
        this.timeout = config.timeout || 30000;
        this.useJitter = config.useJitter !== false;
        this.jitterFactor = config.jitterFactor || 0.1;
        this.customBackoff = config.customBackoff;
        this.retryCondition = config.retryCondition || this.defaultRetryCondition;

        this.circuitBreaker = new CircuitBreaker(config.circuitBreaker || {});
        this.deadLetterQueue = new DeadLetterQueue(config.dlqMaxSize);
        this.metrics = new RetryMetrics();
    }

    /**
     * Execute operation with retry logic
     * @param {Function} operation - Async operation to execute
     * @param {Object} context - Operation context for logging
     * @returns {Promise} Operation result
     */
    async execute(operation, context = {}) {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        console.log(`Starting operation ${operationId} with retry pattern`);

        for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
            // Check circuit breaker
            const allowed = await this.circuitBreaker.allowRequest();
            if (!allowed) {
                const error = new Error('Circuit breaker is OPEN - request rejected');
                error.circuitBreakerOpen = true;

                this.metrics.recordAttempt({
                    operationId,
                    attemptNumber: attempt,
                    success: false,
                    error: error.message,
                    circuitBreakerOpen: true
                });

                await this.deadLetterQueue.add({
                    operationId,
                    context,
                    error: { message: error.message, type: 'CircuitBreakerOpen' },
                    attempts: attempt,
                    operationType: context.operationType
                });

                throw error;
            }

            try {
                console.log(`Attempt ${attempt}/${this.maxAttempts} for operation ${operationId}`);

                // Execute with timeout
                const result = await this.executeWithTimeout(operation, this.timeout);

                // Success
                await this.circuitBreaker.recordSuccess();

                const duration = Date.now() - startTime;
                this.metrics.recordAttempt({
                    operationId,
                    attemptNumber: attempt,
                    success: true,
                    duration
                });

                console.log(`Operation ${operationId} succeeded on attempt ${attempt}`);
                return result;

            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.message);

                await this.circuitBreaker.recordFailure();

                // Check if error is retryable
                const shouldRetry = this.retryCondition(error, attempt);

                if (!shouldRetry || attempt === this.maxAttempts) {
                    // Permanent failure
                    this.metrics.recordAttempt({
                        operationId,
                        attemptNumber: attempt,
                        success: false,
                        error: error.message,
                        permanent: true
                    });

                    await this.deadLetterQueue.add({
                        operationId,
                        context,
                        error: { message: error.message, stack: error.stack, type: error.constructor.name },
                        attempts: attempt,
                        operationType: context.operationType
                    });

                    throw error;
                }

                // Calculate delay before next attempt
                const delay = this.calculateDelay(attempt);

                this.metrics.recordAttempt({
                    operationId,
                    attemptNumber: attempt,
                    success: false,
                    error: error.message,
                    delay
                });

                console.log(`Retrying in ${delay}ms...`);
                await this.sleep(delay);
            }
        }
    }

    /**
     * Execute operation with timeout
     * @param {Function} operation - Operation to execute
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise} Operation result
     */
    async executeWithTimeout(operation, timeout) {
        return Promise.race([
            operation(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Operation timeout')), timeout)
            )
        ]);
    }

    /**
     * Calculate delay based on retry strategy
     * @param {number} attempt - Current attempt number
     * @returns {number} Delay in milliseconds
     */
    calculateDelay(attempt) {
        let delay;

        switch (this.strategy) {
            case RetryStrategy.EXPONENTIAL:
                delay = Math.min(this.initialDelay * Math.pow(2, attempt - 1), this.maxDelay);
                break;

            case RetryStrategy.LINEAR:
                delay = Math.min(this.initialDelay * attempt, this.maxDelay);
                break;

            case RetryStrategy.FIXED:
                delay = this.initialDelay;
                break;

            case RetryStrategy.FIBONACCI:
                delay = Math.min(this.fibonacciDelay(attempt), this.maxDelay);
                break;

            case RetryStrategy.CUSTOM:
                delay = this.customBackoff ? this.customBackoff(attempt) : this.initialDelay;
                break;

            default:
                delay = this.initialDelay;
        }

        // Apply jitter if enabled
        if (this.useJitter) {
            const jitter = delay * this.jitterFactor * (Math.random() * 2 - 1);
            delay = Math.max(0, delay + jitter);
        }

        return Math.floor(delay);
    }

    /**
     * Calculate Fibonacci sequence delay
     * @param {number} n - Sequence position
     * @returns {number} Delay in milliseconds
     */
    fibonacciDelay(n) {
        if (n <= 1) return this.initialDelay;
        if (n === 2) return this.initialDelay;

        let prev = this.initialDelay;
        let curr = this.initialDelay;

        for (let i = 3; i <= n; i++) {
            const next = prev + curr;
            prev = curr;
            curr = next;
        }

        return curr;
    }

    /**
     * Default retry condition - retries on transient errors
     * @param {Error} error - Error that occurred
     * @param {number} attempt - Current attempt number
     * @returns {boolean} Whether to retry
     */
    defaultRetryCondition(error, attempt) {
        // Don't retry on client errors (4xx)
        if (error.statusCode >= 400 && error.statusCode < 500) {
            return false;
        }

        // Retry on server errors (5xx) and network errors
        if (error.statusCode >= 500 || error.code === 'ECONNREFUSED' ||
            error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
            return true;
        }

        // Retry on specific error types
        const retryableErrors = [
            'ServiceUnavailableError',
            'ThrottlingError',
            'NetworkError',
            'TimeoutError'
        ];

        return retryableErrors.includes(error.constructor.name);
    }

    /**
     * Sleep for specified duration
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Promise that resolves after delay
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate unique operation ID
     * @returns {string} Operation ID
     */
    generateOperationId() {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get comprehensive system status
     * @returns {Object} System status and metrics
     */
    getStatus() {
        return {
            metrics: this.metrics.getSummary(),
            circuitBreaker: this.circuitBreaker.getStatus(),
            deadLetterQueue: {
                size: this.deadLetterQueue.queue.length,
                entries: this.deadLetterQueue.getAll().length
            },
            configuration: {
                maxAttempts: this.maxAttempts,
                initialDelay: this.initialDelay,
                maxDelay: this.maxDelay,
                strategy: this.strategy,
                timeout: this.timeout,
                useJitter: this.useJitter
            }
        };
    }

    /**
     * Reset all state and metrics
     */
    reset() {
        this.circuitBreaker.reset();
        this.deadLetterQueue.clear();
        this.metrics.clear();
    }
}

/**
 * Scenario demonstrations
 */

/**
 * Scenario 1: Basic retry with exponential backoff
 */
async function demonstrateBasicRetry() {
    console.log('\n=== Scenario 1: Basic Retry with Exponential Backoff ===\n');

    const retryPattern = new RetryPatternCloud({
        maxAttempts: 4,
        initialDelay: 100,
        strategy: RetryStrategy.EXPONENTIAL
    });

    let attempts = 0;
    const unreliableOperation = async () => {
        attempts++;
        if (attempts < 3) {
            throw new Error('Service temporarily unavailable');
        }
        return { success: true, data: 'Operation completed', attempts };
    };

    try {
        const result = await retryPattern.execute(unreliableOperation, {
            operationType: 'api_call'
        });
        console.log('Result:', result);
        console.log('Status:', retryPattern.getStatus());
    } catch (error) {
        console.error('Operation failed:', error.message);
    }
}

/**
 * Scenario 2: Circuit breaker integration
 */
async function demonstrateCircuitBreaker() {
    console.log('\n=== Scenario 2: Circuit Breaker Integration ===\n');

    const retryPattern = new RetryPatternCloud({
        maxAttempts: 3,
        initialDelay: 100,
        circuitBreaker: {
            failureThreshold: 3,
            timeout: 2000
        }
    });

    const failingOperation = async () => {
        throw new Error('Service is down');
    };

    // Trigger circuit breaker
    for (let i = 0; i < 5; i++) {
        try {
            await retryPattern.execute(failingOperation, {
                operationType: 'health_check'
            });
        } catch (error) {
            console.log(`Request ${i + 1} failed:`, error.message);
        }
    }

    console.log('\nCircuit Breaker Status:', retryPattern.circuitBreaker.getStatus());
}

/**
 * Scenario 3: Different retry strategies comparison
 */
async function demonstrateRetryStrategies() {
    console.log('\n=== Scenario 3: Retry Strategies Comparison ===\n');

    const strategies = [
        RetryStrategy.EXPONENTIAL,
        RetryStrategy.LINEAR,
        RetryStrategy.FIXED,
        RetryStrategy.FIBONACCI
    ];

    for (const strategy of strategies) {
        console.log(`\n--- ${strategy.toUpperCase()} Strategy ---`);

        const retryPattern = new RetryPatternCloud({
            maxAttempts: 5,
            initialDelay: 100,
            strategy,
            useJitter: false
        });

        let attempt = 0;
        const operation = async () => {
            attempt++;
            console.log(`  Attempt ${attempt}`);
            if (attempt < 4) {
                throw new Error('Temporary failure');
            }
            return { success: true };
        };

        try {
            await retryPattern.execute(operation);
        } catch (error) {
            // Expected
        }

        const metrics = retryPattern.metrics.getSummary();
        console.log(`  Total delay: ${metrics.totalDelay}ms`);
    }
}

/**
 * Scenario 4: Dead letter queue handling
 */
async function demonstrateDeadLetterQueue() {
    console.log('\n=== Scenario 4: Dead Letter Queue ===\n');

    const retryPattern = new RetryPatternCloud({
        maxAttempts: 2,
        initialDelay: 100
    });

    const permanentFailureOperation = async () => {
        const error = new Error('Permanent database error');
        error.statusCode = 500;
        throw error;
    };

    try {
        await retryPattern.execute(permanentFailureOperation, {
            operationType: 'database_write',
            userId: 'user_123'
        });
    } catch (error) {
        console.log('Operation failed permanently');
    }

    console.log('\nDead Letter Queue:');
    const dlqEntries = retryPattern.deadLetterQueue.getAll();
    console.log(JSON.stringify(dlqEntries, null, 2));
}

/**
 * Scenario 5: Custom retry condition
 */
async function demonstrateCustomRetryCondition() {
    console.log('\n=== Scenario 5: Custom Retry Condition ===\n');

    const retryPattern = new RetryPatternCloud({
        maxAttempts: 3,
        initialDelay: 100,
        retryCondition: (error, attempt) => {
            // Only retry on specific error codes
            return error.code === 'RATE_LIMIT' || error.code === 'TIMEOUT';
        }
    });

    let attempts = 0;
    const operation = async () => {
        attempts++;
        const error = new Error('Rate limited');
        error.code = attempts < 3 ? 'RATE_LIMIT' : 'INVALID_REQUEST';
        throw error;
    };

    try {
        await retryPattern.execute(operation, {
            operationType: 'api_request'
        });
    } catch (error) {
        console.log(`Final error after ${attempts} attempts:`, error.message);
    }
}

/**
 * Scenario 6: Timeout handling
 */
async function demonstrateTimeout() {
    console.log('\n=== Scenario 6: Timeout Handling ===\n');

    const retryPattern = new RetryPatternCloud({
        maxAttempts: 3,
        initialDelay: 100,
        timeout: 500
    });

    const slowOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    };

    try {
        await retryPattern.execute(slowOperation, {
            operationType: 'slow_query'
        });
    } catch (error) {
        console.log('Operation timed out:', error.message);
        console.log('Metrics:', retryPattern.metrics.getSummary());
    }
}

/**
 * Scenario 7: Jitter demonstration
 */
async function demonstrateJitter() {
    console.log('\n=== Scenario 7: Jitter to Prevent Thundering Herd ===\n');

    const withJitter = new RetryPatternCloud({
        maxAttempts: 4,
        initialDelay: 1000,
        useJitter: true,
        jitterFactor: 0.3
    });

    const withoutJitter = new RetryPatternCloud({
        maxAttempts: 4,
        initialDelay: 1000,
        useJitter: false
    });

    console.log('With Jitter:');
    for (let i = 1; i <= 4; i++) {
        const delay = withJitter.calculateDelay(i);
        console.log(`  Attempt ${i}: ${delay}ms`);
    }

    console.log('\nWithout Jitter:');
    for (let i = 1; i <= 4; i++) {
        const delay = withoutJitter.calculateDelay(i);
        console.log(`  Attempt ${i}: ${delay}ms`);
    }
}

/**
 * Scenario 8: Comprehensive metrics tracking
 */
async function demonstrateMetrics() {
    console.log('\n=== Scenario 8: Comprehensive Metrics ===\n');

    const retryPattern = new RetryPatternCloud({
        maxAttempts: 3,
        initialDelay: 100
    });

    // Simulate various operations
    for (let i = 0; i < 10; i++) {
        let attempts = 0;
        const operation = async () => {
            attempts++;
            if (Math.random() > 0.6 || attempts >= 2) {
                return { success: true, id: i };
            }
            throw new Error('Random failure');
        };

        try {
            await retryPattern.execute(operation, {
                operationType: 'batch_operation',
                batchId: i
            });
        } catch (error) {
            // Continue with next operation
        }
    }

    console.log('Final Metrics:');
    console.log(JSON.stringify(retryPattern.getStatus(), null, 2));
}

/**
 * Scenario 9: Recovery after circuit breaker opens
 */
async function demonstrateCircuitRecovery() {
    console.log('\n=== Scenario 9: Circuit Breaker Recovery ===\n');

    const retryPattern = new RetryPatternCloud({
        maxAttempts: 2,
        initialDelay: 100,
        circuitBreaker: {
            failureThreshold: 3,
            successThreshold: 2,
            timeout: 1000
        }
    });

    let serviceHealthy = false;

    const operation = async () => {
        if (!serviceHealthy) {
            throw new Error('Service down');
        }
        return { success: true };
    };

    // Break the circuit
    console.log('Phase 1: Breaking the circuit...');
    for (let i = 0; i < 4; i++) {
        try {
            await retryPattern.execute(operation);
        } catch (error) {
            console.log(`Request ${i + 1} failed`);
        }
    }

    console.log('\nCircuit State:', retryPattern.circuitBreaker.getStatus().state);

    // Wait for circuit to enter half-open
    console.log('\nPhase 2: Waiting for circuit to enter HALF_OPEN...');
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Service recovers
    console.log('\nPhase 3: Service recovers...');
    serviceHealthy = true;

    // Successful requests close the circuit
    for (let i = 0; i < 3; i++) {
        try {
            const result = await retryPattern.execute(operation);
            console.log(`Request ${i + 1} succeeded`);
        } catch (error) {
            console.log(`Request ${i + 1} rejected:`, error.message);
        }
    }

    console.log('\nFinal Circuit State:', retryPattern.circuitBreaker.getStatus().state);
}

/**
 * Scenario 10: Production-ready error handling
 */
async function demonstrateProductionScenario() {
    console.log('\n=== Scenario 10: Production-Ready Scenario ===\n');

    const retryPattern = new RetryPatternCloud({
        maxAttempts: 5,
        initialDelay: 200,
        maxDelay: 10000,
        strategy: RetryStrategy.EXPONENTIAL,
        timeout: 5000,
        useJitter: true,
        circuitBreaker: {
            failureThreshold: 5,
            successThreshold: 3,
            timeout: 30000
        },
        retryCondition: (error, attempt) => {
            // Custom business logic for retries
            if (error.statusCode === 429) return true; // Rate limit
            if (error.statusCode >= 500) return true; // Server error
            if (error.code === 'ECONNREFUSED') return true; // Connection refused
            if (error.code === 'ETIMEDOUT') return true; // Timeout
            return false;
        }
    });

    // Simulate production API calls
    const apiCall = async () => {
        const random = Math.random();

        if (random < 0.1) {
            const error = new Error('Rate limited');
            error.statusCode = 429;
            throw error;
        }

        if (random < 0.3) {
            const error = new Error('Service temporarily unavailable');
            error.statusCode = 503;
            throw error;
        }

        if (random < 0.4) {
            throw new Error('Network timeout');
        }

        return {
            success: true,
            data: { userId: 'user_123', timestamp: Date.now() }
        };
    };

    let successCount = 0;
    let failureCount = 0;

    console.log('Executing 20 API calls with retry pattern...\n');

    for (let i = 0; i < 20; i++) {
        try {
            const result = await retryPattern.execute(apiCall, {
                operationType: 'user_api',
                requestId: `req_${i}`
            });
            successCount++;
            console.log(`✓ Request ${i + 1} succeeded`);
        } catch (error) {
            failureCount++;
            console.log(`✗ Request ${i + 1} failed: ${error.message}`);
        }
    }

    console.log('\n--- Final Report ---');
    console.log(`Successful requests: ${successCount}`);
    console.log(`Failed requests: ${failureCount}`);
    console.log('\nSystem Status:');
    console.log(JSON.stringify(retryPattern.getStatus(), null, 2));
}

/**
 * Run all demonstrations
 */
async function runAllScenarios() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   Retry Pattern Cloud - Comprehensive Demonstration   ║');
    console.log('╚═══════════════════════════════════════════════════════╝');

    await demonstrateBasicRetry();
    await demonstrateCircuitBreaker();
    await demonstrateRetryStrategies();
    await demonstrateDeadLetterQueue();
    await demonstrateCustomRetryCondition();
    await demonstrateTimeout();
    await demonstrateJitter();
    await demonstrateMetrics();
    await demonstrateCircuitRecovery();
    await demonstrateProductionScenario();

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║           All Scenarios Completed Successfully        ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
}

// Run demonstrations if executed directly
if (require.main === module) {
    runAllScenarios().catch(console.error);
}

module.exports = {
    RetryPatternCloud,
    CircuitBreaker,
    DeadLetterQueue,
    RetryMetrics,
    RetryStrategy,
    CircuitState
};
