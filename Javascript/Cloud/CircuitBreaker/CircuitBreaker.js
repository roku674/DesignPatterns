/**
 * Circuit Breaker Pattern
 *
 * The Circuit Breaker pattern prevents an application from repeatedly trying to execute
 * an operation that's likely to fail, allowing it to continue without waiting for the fault
 * to be fixed or wasting CPU cycles while it determines that the fault is long-lasting.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failure threshold reached, requests fail immediately
 * - HALF_OPEN: Testing if the underlying issue has been resolved
 *
 * @author Design Patterns Implementation
 * @version 1.0.0
 */

const EventEmitter = require('events');

/**
 * Circuit Breaker States
 */
const CircuitState = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN'
};

/**
 * Circuit Breaker Configuration
 */
class CircuitBreakerConfig {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.successThreshold = options.successThreshold || 2;
        this.timeout = options.timeout || 60000;
        this.resetTimeout = options.resetTimeout || 30000;
        this.monitoringPeriod = options.monitoringPeriod || 10000;
        this.volumeThreshold = options.volumeThreshold || 10;
        this.errorThresholdPercentage = options.errorThresholdPercentage || 50;
    }
}

/**
 * Circuit Breaker Statistics
 */
class CircuitBreakerStats {
    constructor() {
        this.totalCalls = 0;
        this.successfulCalls = 0;
        this.failedCalls = 0;
        this.rejectedCalls = 0;
        this.consecutiveFailures = 0;
        this.consecutiveSuccesses = 0;
        this.lastFailureTime = null;
        this.lastSuccessTime = null;
        this.stateChanges = [];
    }

    recordSuccess() {
        this.totalCalls++;
        this.successfulCalls++;
        this.consecutiveSuccesses++;
        this.consecutiveFailures = 0;
        this.lastSuccessTime = Date.now();
    }

    recordFailure() {
        this.totalCalls++;
        this.failedCalls++;
        this.consecutiveFailures++;
        this.consecutiveSuccesses = 0;
        this.lastFailureTime = Date.now();
    }

    recordRejection() {
        this.rejectedCalls++;
    }

    recordStateChange(fromState, toState) {
        this.stateChanges.push({
            from: fromState,
            to: toState,
            timestamp: Date.now()
        });
    }

    getErrorRate() {
        if (this.totalCalls === 0) return 0;
        return (this.failedCalls / this.totalCalls) * 100;
    }

    reset() {
        this.totalCalls = 0;
        this.successfulCalls = 0;
        this.failedCalls = 0;
        this.consecutiveFailures = 0;
        this.consecutiveSuccesses = 0;
    }

    getSnapshot() {
        return {
            totalCalls: this.totalCalls,
            successfulCalls: this.successfulCalls,
            failedCalls: this.failedCalls,
            rejectedCalls: this.rejectedCalls,
            consecutiveFailures: this.consecutiveFailures,
            consecutiveSuccesses: this.consecutiveSuccesses,
            errorRate: this.getErrorRate(),
            lastFailureTime: this.lastFailureTime,
            lastSuccessTime: this.lastSuccessTime
        };
    }
}

/**
 * Circuit Breaker Implementation
 */
class CircuitBreaker extends EventEmitter {
    constructor(name, config = {}) {
        super();
        this.name = name;
        this.config = new CircuitBreakerConfig(config);
        this.state = CircuitState.CLOSED;
        this.stats = new CircuitBreakerStats();
        this.nextAttempt = Date.now();
        this.monitoringTimer = null;

        this.startMonitoring();
    }

    async execute(fn, fallback = null) {
        if (!this.canExecute()) {
            this.stats.recordRejection();
            this.emit('rejected', {
                name: this.name,
                state: this.state,
                stats: this.stats.getSnapshot()
            });

            if (fallback) {
                return await this.executeFallback(fallback);
            }

            throw new Error(`Circuit breaker '${this.name}' is ${this.state}`);
        }

        try {
            const result = await this.executeWithTimeout(fn);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure(error);

            if (fallback) {
                return await this.executeFallback(fallback);
            }

            throw error;
        }
    }

    async executeWithTimeout(fn) {
        return Promise.race([
            fn(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Operation timeout')), this.config.timeout)
            )
        ]);
    }

    async executeFallback(fallback) {
        try {
            this.emit('fallback', { name: this.name });
            return await fallback();
        } catch (fallbackError) {
            this.emit('fallbackError', {
                name: this.name,
                error: fallbackError
            });
            throw fallbackError;
        }
    }

    canExecute() {
        if (this.state === CircuitState.CLOSED) {
            return true;
        }

        if (this.state === CircuitState.OPEN) {
            if (Date.now() >= this.nextAttempt) {
                this.transitionTo(CircuitState.HALF_OPEN);
                return true;
            }
            return false;
        }

        if (this.state === CircuitState.HALF_OPEN) {
            return true;
        }

        return false;
    }

    onSuccess() {
        this.stats.recordSuccess();

        this.emit('success', {
            name: this.name,
            state: this.state,
            consecutiveSuccesses: this.stats.consecutiveSuccesses
        });

        if (this.state === CircuitState.HALF_OPEN) {
            if (this.stats.consecutiveSuccesses >= this.config.successThreshold) {
                this.transitionTo(CircuitState.CLOSED);
                this.stats.reset();
            }
        }
    }

    onFailure(error) {
        this.stats.recordFailure();

        this.emit('failure', {
            name: this.name,
            state: this.state,
            error: error.message,
            consecutiveFailures: this.stats.consecutiveFailures
        });

        if (this.state === CircuitState.HALF_OPEN) {
            this.transitionTo(CircuitState.OPEN);
            this.scheduleNextAttempt();
            return;
        }

        if (this.state === CircuitState.CLOSED) {
            if (this.shouldOpenCircuit()) {
                this.transitionTo(CircuitState.OPEN);
                this.scheduleNextAttempt();
            }
        }
    }

    shouldOpenCircuit() {
        if (this.stats.consecutiveFailures >= this.config.failureThreshold) {
            return true;
        }

        if (this.stats.totalCalls >= this.config.volumeThreshold) {
            const errorRate = this.stats.getErrorRate();
            if (errorRate >= this.config.errorThresholdPercentage) {
                return true;
            }
        }

        return false;
    }

    transitionTo(newState) {
        const oldState = this.state;
        this.state = newState;
        this.stats.recordStateChange(oldState, newState);

        this.emit('stateChange', {
            name: this.name,
            from: oldState,
            to: newState,
            timestamp: Date.now(),
            stats: this.stats.getSnapshot()
        });

        console.log(`Circuit breaker '${this.name}' transitioned from ${oldState} to ${newState}`);
    }

    scheduleNextAttempt() {
        this.nextAttempt = Date.now() + this.config.resetTimeout;

        this.emit('scheduled', {
            name: this.name,
            nextAttempt: this.nextAttempt,
            resetTimeout: this.config.resetTimeout
        });
    }

    startMonitoring() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
        }

        this.monitoringTimer = setInterval(() => {
            this.emit('monitoring', {
                name: this.name,
                state: this.state,
                stats: this.stats.getSnapshot()
            });

            if (this.state === CircuitState.CLOSED &&
                this.stats.totalCalls > 0 &&
                Date.now() - (this.stats.lastSuccessTime || 0) > this.config.monitoringPeriod) {
                this.stats.reset();
            }
        }, this.config.monitoringPeriod);
    }

    stopMonitoring() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }
    }

    forceOpen() {
        this.transitionTo(CircuitState.OPEN);
        this.scheduleNextAttempt();
    }

    forceClosed() {
        this.transitionTo(CircuitState.CLOSED);
        this.stats.reset();
    }

    getState() {
        return this.state;
    }

    getStats() {
        return this.stats.getSnapshot();
    }

    getHealth() {
        return {
            name: this.name,
            state: this.state,
            healthy: this.state !== CircuitState.OPEN,
            stats: this.stats.getSnapshot(),
            nextAttempt: this.nextAttempt,
            config: {
                failureThreshold: this.config.failureThreshold,
                successThreshold: this.config.successThreshold,
                timeout: this.config.timeout,
                resetTimeout: this.config.resetTimeout
            }
        };
    }

    shutdown() {
        this.stopMonitoring();
        this.removeAllListeners();
    }
}

/**
 * Circuit Breaker Factory
 */
class CircuitBreakerFactory {
    constructor() {
        this.breakers = new Map();
    }

    create(name, config = {}) {
        if (this.breakers.has(name)) {
            return this.breakers.get(name);
        }

        const breaker = new CircuitBreaker(name, config);
        this.breakers.set(name, breaker);
        return breaker;
    }

    get(name) {
        return this.breakers.get(name);
    }

    remove(name) {
        const breaker = this.breakers.get(name);
        if (breaker) {
            breaker.shutdown();
            this.breakers.delete(name);
        }
    }

    getAll() {
        return Array.from(this.breakers.values());
    }

    getHealth() {
        return Array.from(this.breakers.values()).map(breaker => breaker.getHealth());
    }

    shutdown() {
        this.breakers.forEach(breaker => breaker.shutdown());
        this.breakers.clear();
    }
}

async function demonstrateCircuitBreaker() {
    const factory = new CircuitBreakerFactory();

    const breaker = factory.create('apiService', {
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 5000,
        resetTimeout: 10000
    });

    breaker.on('stateChange', (event) => {
        console.log(`State changed from ${event.from} to ${event.to}`);
    });

    breaker.on('failure', (event) => {
        console.log(`Call failed: ${event.error}`);
    });

    breaker.on('rejected', (event) => {
        console.log(`Call rejected - circuit is ${event.state}`);
    });

    const apiCall = async () => {
        const random = Math.random();
        if (random < 0.7) {
            throw new Error('API call failed');
        }
        return { data: 'Success' };
    };

    const fallback = async () => {
        return { data: 'Fallback response' };
    };

    for (let i = 0; i < 10; i++) {
        try {
            const result = await breaker.execute(apiCall, fallback);
            console.log(`Call ${i + 1} succeeded:`, result);
        } catch (error) {
            console.log(`Call ${i + 1} failed:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Circuit Breaker Health:', breaker.getHealth());

    factory.shutdown();
}

module.exports = {
    CircuitBreaker,
    CircuitBreakerFactory,
    CircuitBreakerConfig,
    CircuitBreakerStats,
    CircuitState,
    demonstrateCircuitBreaker
};
