/**
 * Circuit Breaker Pattern Implementation
 *
 * Purpose:
 * The Circuit Breaker pattern prevents cascading failures by wrapping
 * service calls and monitoring for failures. When failures exceed a threshold,
 * the circuit "opens" and subsequent calls fail immediately without attempting
 * the operation.
 *
 * Use Cases:
 * - Protect against cascading failures
 * - Fail fast when services are down
 * - Give failing services time to recover
 * - Improve system resilience
 * - Monitor service health
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failures exceeded threshold, requests fail immediately
 * - HALF_OPEN: Testing if service has recovered
 *
 * Components:
 * - CircuitBreaker: Main circuit breaker implementation
 * - CircuitState: Manages circuit state transitions
 * - FailureCounter: Tracks failures
 * - MetricsCollector: Collects circuit metrics
 */

const EventEmitter = require('events');

/**
 * Circuit states
 */
const CircuitState = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN'
};

/**
 * Failure Counter tracks failures in a time window
 */
class FailureCounter {
    constructor(windowSize = 60000) {
        this.windowSize = windowSize;
        this.failures = [];
        this.successes = [];
    }

    recordFailure() {
        const now = Date.now();
        this.failures.push(now);
        this.cleanup(now);
    }

    recordSuccess() {
        const now = Date.now();
        this.successes.push(now);
        this.cleanup(now);
    }

    cleanup(now) {
        const cutoff = now - this.windowSize;
        this.failures = this.failures.filter(t => t > cutoff);
        this.successes = this.successes.filter(t => t > cutoff);
    }

    getFailureCount() {
        this.cleanup(Date.now());
        return this.failures.length;
    }

    getSuccessCount() {
        this.cleanup(Date.now());
        return this.successes.length;
    }

    getFailureRate() {
        const total = this.failures.length + this.successes.length;
        return total === 0 ? 0 : this.failures.length / total;
    }

    reset() {
        this.failures = [];
        this.successes = [];
    }
}

/**
 * Metrics Collector
 */
class MetricsCollector {
    constructor() {
        this.metrics = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            rejectedCalls: 0,
            totalResponseTime: 0,
            stateChanges: [],
            lastStateChange: null
        };
    }

    recordCall(success, responseTime, rejected = false) {
        this.metrics.totalCalls++;
        
        if (rejected) {
            this.metrics.rejectedCalls++;
        } else if (success) {
            this.metrics.successfulCalls++;
            this.metrics.totalResponseTime += responseTime;
        } else {
            this.metrics.failedCalls++;
            this.metrics.totalResponseTime += responseTime;
        }
    }

    recordStateChange(from, to) {
        const change = {
            from: from,
            to: to,
            timestamp: Date.now()
        };
        this.metrics.stateChanges.push(change);
        this.metrics.lastStateChange = change;
    }

    getMetrics() {
        return {
            ...this.metrics,
            avgResponseTime: this.metrics.successfulCalls > 0
                ? this.metrics.totalResponseTime / this.metrics.successfulCalls
                : 0,
            successRate: this.metrics.totalCalls > 0
                ? this.metrics.successfulCalls / this.metrics.totalCalls
                : 0,
            failureRate: this.metrics.totalCalls > 0
                ? this.metrics.failedCalls / this.metrics.totalCalls
                : 0
        };
    }

    reset() {
        this.metrics = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            rejectedCalls: 0,
            totalResponseTime: 0,
            stateChanges: [],
            lastStateChange: null
        };
    }
}

/**
 * Circuit Breaker Implementation
 */
class CircuitBreaker extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.name = options.name || 'circuit-breaker';
        this.failureThreshold = options.failureThreshold || 5;
        this.failureRateThreshold = options.failureRateThreshold || 0.5;
        this.resetTimeout = options.resetTimeout || 60000;
        this.halfOpenRequests = options.halfOpenRequests || 3;
        this.windowSize = options.windowSize || 60000;
        
        this.state = CircuitState.CLOSED;
        this.failureCounter = new FailureCounter(this.windowSize);
        this.metricsCollector = new MetricsCollector();
        
        this.openedAt = null;
        this.halfOpenSuccesses = 0;
        this.halfOpenFailures = 0;
    }

    /**
     * Execute a function with circuit breaker protection
     */
    async execute(fn, correlationId = null) {
        if (!this.canExecute()) {
            this.metricsCollector.recordCall(false, 0, true);
            this.emit('rejected', { name: this.name, correlationId: correlationId });
            throw new Error(`Circuit breaker is ${this.state}`);
        }

        const startTime = Date.now();
        
        try {
            const result = await fn();
            const responseTime = Date.now() - startTime;
            
            this.onSuccess(responseTime, correlationId);
            return result;
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.onFailure(responseTime, correlationId);
            throw error;
        }
    }

    /**
     * Check if request can be executed
     */
    canExecute() {
        if (this.state === CircuitState.CLOSED) {
            return true;
        }
        
        if (this.state === CircuitState.OPEN) {
            // Check if reset timeout has elapsed
            if (Date.now() - this.openedAt >= this.resetTimeout) {
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

    /**
     * Handle successful execution
     */
    onSuccess(responseTime, correlationId) {
        this.failureCounter.recordSuccess();
        this.metricsCollector.recordCall(true, responseTime);
        this.emit('success', {
            name: this.name,
            correlationId: correlationId,
            responseTime: responseTime
        });

        if (this.state === CircuitState.HALF_OPEN) {
            this.halfOpenSuccesses++;
            
            if (this.halfOpenSuccesses >= this.halfOpenRequests) {
                this.transitionTo(CircuitState.CLOSED);
                this.halfOpenSuccesses = 0;
                this.halfOpenFailures = 0;
            }
        }
    }

    /**
     * Handle failed execution
     */
    onFailure(responseTime, correlationId) {
        this.failureCounter.recordFailure();
        this.metricsCollector.recordCall(false, responseTime);
        this.emit('failure', {
            name: this.name,
            correlationId: correlationId,
            responseTime: responseTime
        });

        if (this.state === CircuitState.HALF_OPEN) {
            this.halfOpenFailures++;
            this.transitionTo(CircuitState.OPEN);
            this.halfOpenSuccesses = 0;
            this.halfOpenFailures = 0;
            return;
        }

        if (this.state === CircuitState.CLOSED) {
            const failureCount = this.failureCounter.getFailureCount();
            const failureRate = this.failureCounter.getFailureRate();

            if (failureCount >= this.failureThreshold || failureRate >= this.failureRateThreshold) {
                this.transitionTo(CircuitState.OPEN);
            }
        }
    }

    /**
     * Transition to a new state
     */
    transitionTo(newState) {
        const oldState = this.state;
        this.state = newState;
        
        this.metricsCollector.recordStateChange(oldState, newState);
        this.emit('stateChange', {
            name: this.name,
            from: oldState,
            to: newState,
            timestamp: Date.now()
        });

        console.log(`[CircuitBreaker] ${this.name}: ${oldState} -> ${newState}`);

        if (newState === CircuitState.OPEN) {
            this.openedAt = Date.now();
        } else if (newState === CircuitState.CLOSED) {
            this.failureCounter.reset();
        }
    }

    /**
     * Get current state
     */
    getState() {
        return this.state;
    }

    /**
     * Get metrics
     */
    getMetrics() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCounter.getFailureCount(),
            successCount: this.failureCounter.getSuccessCount(),
            failureRate: this.failureCounter.getFailureRate(),
            ...this.metricsCollector.getMetrics()
        };
    }

    /**
     * Force circuit open
     */
    forceOpen() {
        this.transitionTo(CircuitState.OPEN);
    }

    /**
     * Force circuit closed
     */
    forceClosed() {
        this.transitionTo(CircuitState.CLOSED);
        this.failureCounter.reset();
    }

    /**
     * Reset circuit
     */
    reset() {
        this.transitionTo(CircuitState.CLOSED);
        this.failureCounter.reset();
        this.metricsCollector.reset();
        this.halfOpenSuccesses = 0;
        this.halfOpenFailures = 0;
    }
}

// Example usage
if (require.main === module) {
    const breaker = new CircuitBreaker({
        name: 'user-service',
        failureThreshold: 3,
        resetTimeout: 5000,
        windowSize: 10000
    });

    breaker.on('stateChange', (data) => {
        console.log(`State changed: ${data.from} -> ${data.to}`);
    });

    breaker.on('failure', (data) => {
        console.log(`Call failed after ${data.responseTime}ms`);
    });

    console.log('\n=== Circuit Breaker Pattern Demo ===\n');

    // Simulated service call
    const simulatedServiceCall = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 70% failure rate to demonstrate circuit opening
                if (Math.random() < 0.7) {
                    reject(new Error('Service error'));
                } else {
                    resolve({ data: 'Success' });
                }
            }, 100);
        });
    };

    // Make multiple calls
    async function makeCall(i) {
        try {
            const result = await breaker.execute(simulatedServiceCall);
            console.log(`Call ${i}: SUCCESS`);
        } catch (error) {
            console.log(`Call ${i}: FAILED - ${error.message}`);
        }
    }

    async function demo() {
        for (let i = 1; i <= 10; i++) {
            await makeCall(i);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\nCircuit Breaker Metrics:');
        console.log(JSON.stringify(breaker.getMetrics(), null, 2));
    }

    demo();
}

module.exports = {
    CircuitBreaker,
    CircuitState,
    FailureCounter,
    MetricsCollector
};
