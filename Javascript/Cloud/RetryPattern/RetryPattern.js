/**
 * Retry Pattern with Advanced Backoff Strategies
 *
 * The Retry pattern handles transient failures by automatically retrying failed operations.
 * Implements multiple backoff strategies to prevent overwhelming failed services.
 *
 * Backoff Strategies:
 * - Fixed: Same delay between retries
 * - Linear: Linearly increasing delay
 * - Exponential: Exponentially increasing delay
 * - Fibonacci: Fibonacci sequence delay
 * - Jittered Exponential: Exponential with random jitter
 *
 * @author Design Patterns Implementation
 * @version 1.0.0
 */

const EventEmitter = require('events');

const BackoffStrategy = {
    FIXED: 'FIXED',
    LINEAR: 'LINEAR',
    EXPONENTIAL: 'EXPONENTIAL',
    FIBONACCI: 'FIBONACCI',
    JITTERED_EXPONENTIAL: 'JITTERED_EXPONENTIAL'
};

const RetryResult = {
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    EXHAUSTED: 'EXHAUSTED'
};

class RetryConfig {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.initialDelay = options.initialDelay || 1000;
        this.maxDelay = options.maxDelay || 60000;
        this.backoffStrategy = options.backoffStrategy || BackoffStrategy.EXPONENTIAL;
        this.backoffMultiplier = options.backoffMultiplier || 2;
        this.jitterFactor = options.jitterFactor || 0.1;
        this.timeout = options.timeout || 30000;
        this.retryableErrors = options.retryableErrors || [];
        this.nonRetryableErrors = options.nonRetryableErrors || [];
        this.onRetry = options.onRetry || null;
    }
}

class RetryStats {
    constructor() {
        this.totalAttempts = 0;
        this.successfulAttempts = 0;
        this.failedAttempts = 0;
        this.retriesExhausted = 0;
        this.totalRetries = 0;
        this.totalDelay = 0;
        this.attemptHistory = [];
    }

    recordAttempt(success, retryCount, delay, error = null) {
        this.totalAttempts++;
        if (success) {
            this.successfulAttempts++;
        } else {
            this.failedAttempts++;
        }

        this.totalRetries += retryCount;
        this.totalDelay += delay;

        this.attemptHistory.push({
            success,
            retryCount,
            delay,
            error: error?.message,
            timestamp: Date.now()
        });

        if (this.attemptHistory.length > 100) {
            this.attemptHistory.shift();
        }
    }

    recordExhausted() {
        this.retriesExhausted++;
    }

    getAverageRetries() {
        return this.totalAttempts > 0 ? this.totalRetries / this.totalAttempts : 0;
    }

    getAverageDelay() {
        return this.totalRetries > 0 ? this.totalDelay / this.totalRetries : 0;
    }

    getSuccessRate() {
        return this.totalAttempts > 0 ? (this.successfulAttempts / this.totalAttempts) * 100 : 0;
    }

    getSnapshot() {
        return {
            totalAttempts: this.totalAttempts,
            successfulAttempts: this.successfulAttempts,
            failedAttempts: this.failedAttempts,
            retriesExhausted: this.retriesExhausted,
            totalRetries: this.totalRetries,
            averageRetries: this.getAverageRetries(),
            averageDelay: this.getAverageDelay(),
            successRate: this.getSuccessRate()
        };
    }
}

class BackoffCalculator {
    static calculate(strategy, attempt, config) {
        let delay;

        switch (strategy) {
            case BackoffStrategy.FIXED:
                delay = config.initialDelay;
                break;

            case BackoffStrategy.LINEAR:
                delay = config.initialDelay * attempt;
                break;

            case BackoffStrategy.EXPONENTIAL:
                delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
                break;

            case BackoffStrategy.FIBONACCI:
                delay = config.initialDelay * this.fibonacci(attempt);
                break;

            case BackoffStrategy.JITTERED_EXPONENTIAL:
                const exponentialDelay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
                const jitter = exponentialDelay * config.jitterFactor * (Math.random() * 2 - 1);
                delay = exponentialDelay + jitter;
                break;

            default:
                delay = config.initialDelay;
        }

        return Math.min(delay, config.maxDelay);
    }

    static fibonacci(n) {
        if (n <= 1) return 1;
        if (n === 2) return 2;

        let prev = 1, current = 2;
        for (let i = 3; i <= n; i++) {
            const next = prev + current;
            prev = current;
            current = next;
        }
        return current;
    }
}

class ErrorClassifier {
    static isRetryable(error, config) {
        if (config.nonRetryableErrors.length > 0) {
            for (const pattern of config.nonRetryableErrors) {
                if (this.matchesPattern(error, pattern)) {
                    return false;
                }
            }
        }

        if (config.retryableErrors.length > 0) {
            for (const pattern of config.retryableErrors) {
                if (this.matchesPattern(error, pattern)) {
                    return true;
                }
            }
            return false;
        }

        return this.isTransientError(error);
    }

    static matchesPattern(error, pattern) {
        if (typeof pattern === 'string') {
            return error.message?.includes(pattern) || error.code === pattern;
        }
        if (pattern instanceof RegExp) {
            return pattern.test(error.message);
        }
        if (typeof pattern === 'function') {
            return error instanceof pattern;
        }
        return false;
    }

    static isTransientError(error) {
        const transientPatterns = [
            /timeout/i,
            /ETIMEDOUT/,
            /ECONNREFUSED/,
            /ECONNRESET/,
            /ENOTFOUND/,
            /EHOSTUNREACH/,
            /ENETUNREACH/,
            /socket hang up/i,
            /network/i,
            /temporary/i
        ];

        const transientCodes = ['ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND'];

        for (const pattern of transientPatterns) {
            if (pattern.test(error.message)) {
                return true;
            }
        }

        return transientCodes.includes(error.code);
    }
}

class RetryPattern extends EventEmitter {
    constructor(name, config = {}) {
        super();
        this.name = name;
        this.config = new RetryConfig(config);
        this.stats = new RetryStats();
    }

    async execute(fn, context = {}) {
        const startTime = Date.now();
        let lastError = null;
        let totalDelay = 0;

        this.emit('start', {
            name: this.name,
            maxRetries: this.config.maxRetries,
            backoffStrategy: this.config.backoffStrategy
        });

        for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
            try {
                this.emit('attempt', {
                    name: this.name,
                    attempt,
                    maxAttempts: this.config.maxRetries + 1
                });

                const result = await this.executeWithTimeout(fn, context);

                const duration = Date.now() - startTime;
                this.stats.recordAttempt(true, attempt - 1, totalDelay);

                this.emit('success', {
                    name: this.name,
                    attempt,
                    duration,
                    totalDelay,
                    result
                });

                return {
                    status: RetryResult.SUCCESS,
                    result,
                    attempts: attempt,
                    duration,
                    totalDelay
                };

            } catch (error) {
                lastError = error;

                this.emit('error', {
                    name: this.name,
                    attempt,
                    error: error.message,
                    code: error.code
                });

                if (attempt > this.config.maxRetries) {
                    break;
                }

                const isRetryable = ErrorClassifier.isRetryable(error, this.config);

                if (!isRetryable) {
                    this.emit('nonRetryable', {
                        name: this.name,
                        attempt,
                        error: error.message
                    });

                    const duration = Date.now() - startTime;
                    this.stats.recordAttempt(false, attempt - 1, totalDelay, error);

                    return {
                        status: RetryResult.FAILURE,
                        error: lastError,
                        attempts: attempt,
                        duration,
                        totalDelay
                    };
                }

                const delay = BackoffCalculator.calculate(
                    this.config.backoffStrategy,
                    attempt,
                    this.config
                );

                totalDelay += delay;

                this.emit('retry', {
                    name: this.name,
                    attempt,
                    nextAttempt: attempt + 1,
                    delay,
                    error: error.message
                });

                if (this.config.onRetry) {
                    await this.config.onRetry(error, attempt, delay);
                }

                await this.sleep(delay);
            }
        }

        const duration = Date.now() - startTime;
        this.stats.recordAttempt(false, this.config.maxRetries + 1, totalDelay, lastError);
        this.stats.recordExhausted();

        this.emit('exhausted', {
            name: this.name,
            maxRetries: this.config.maxRetries,
            duration,
            error: lastError?.message
        });

        return {
            status: RetryResult.EXHAUSTED,
            error: lastError,
            attempts: this.config.maxRetries + 1,
            duration,
            totalDelay
        };
    }

    async executeWithTimeout(fn, context) {
        if (this.config.timeout <= 0) {
            return await fn(context);
        }

        return Promise.race([
            fn(context),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Operation timeout')), this.config.timeout)
            )
        ]);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async retry(fn, overrideConfig = {}) {
        const originalConfig = { ...this.config };
        this.config = new RetryConfig({ ...originalConfig, ...overrideConfig });

        try {
            const result = await this.execute(fn);
            return result;
        } finally {
            this.config = new RetryConfig(originalConfig);
        }
    }

    getStats() {
        return this.stats.getSnapshot();
    }

    getConfig() {
        return {
            name: this.name,
            maxRetries: this.config.maxRetries,
            initialDelay: this.config.initialDelay,
            maxDelay: this.config.maxDelay,
            backoffStrategy: this.config.backoffStrategy,
            backoffMultiplier: this.config.backoffMultiplier,
            timeout: this.config.timeout
        };
    }

    resetStats() {
        this.stats = new RetryStats();
    }
}

class RetryPatternFactory {
    constructor() {
        this.retriers = new Map();
    }

    create(name, config = {}) {
        if (this.retriers.has(name)) {
            return this.retriers.get(name);
        }

        const retrier = new RetryPattern(name, config);
        this.retriers.set(name, retrier);
        return retrier;
    }

    get(name) {
        return this.retriers.get(name);
    }

    remove(name) {
        const retrier = this.retriers.get(name);
        if (retrier) {
            retrier.removeAllListeners();
            this.retriers.delete(name);
        }
    }

    getAll() {
        return Array.from(this.retriers.values());
    }

    getStats() {
        const stats = {};
        this.retriers.forEach((retrier, name) => {
            stats[name] = retrier.getStats();
        });
        return stats;
    }

    shutdown() {
        this.retriers.forEach(retrier => retrier.removeAllListeners());
        this.retriers.clear();
    }
}

async function demonstrateRetryPattern() {
    const factory = new RetryPatternFactory();

    const exponentialRetrier = factory.create('exponentialBackoff', {
        maxRetries: 5,
        initialDelay: 100,
        maxDelay: 10000,
        backoffStrategy: BackoffStrategy.EXPONENTIAL,
        backoffMultiplier: 2,
        timeout: 5000
    });

    const jitteredRetrier = factory.create('jitteredBackoff', {
        maxRetries: 4,
        initialDelay: 200,
        maxDelay: 8000,
        backoffStrategy: BackoffStrategy.JITTERED_EXPONENTIAL,
        jitterFactor: 0.2,
        timeout: 5000
    });

    exponentialRetrier.on('retry', (event) => {
        console.log(`[${event.name}] Retry attempt ${event.attempt}, waiting ${event.delay}ms`);
    });

    exponentialRetrier.on('success', (event) => {
        console.log(`[${event.name}] Success after ${event.attempt} attempts`);
    });

    exponentialRetrier.on('exhausted', (event) => {
        console.log(`[${event.name}] Retries exhausted: ${event.error}`);
    });

    let attemptCount = 0;
    const unreliableOperation = async () => {
        attemptCount++;
        console.log(`Executing unreliable operation, attempt ${attemptCount}`);

        if (attemptCount < 3) {
            throw new Error('ETIMEDOUT: Connection timeout');
        }

        return { data: 'Success!' };
    };

    console.log('=== Exponential Backoff Demo ===');
    const result1 = await exponentialRetrier.execute(unreliableOperation);
    console.log('Result:', result1);
    console.log('Stats:', exponentialRetrier.getStats());

    console.log('\n=== Jittered Exponential Backoff Demo ===');
    attemptCount = 0;
    const result2 = await jitteredRetrier.execute(unreliableOperation);
    console.log('Result:', result2);
    console.log('Stats:', jitteredRetrier.getStats());

    console.log('\n=== All Retrier Stats ===');
    console.log(factory.getStats());

    factory.shutdown();
}

module.exports = {
    RetryPattern,
    RetryPatternFactory,
    RetryConfig,
    RetryStats,
    BackoffStrategy,
    RetryResult,
    BackoffCalculator,
    ErrorClassifier,
    demonstrateRetryPattern
};
