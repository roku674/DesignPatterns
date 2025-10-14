/**
 * Distributed Circuit Breaker Pattern for Cloud Environments
 *
 * Extends the basic Circuit Breaker pattern with distributed state management,
 * allowing multiple instances to share circuit breaker state across a cluster.
 *
 * Features:
 * - Distributed state synchronization
 * - Redis-based state storage
 * - Cross-instance coordination
 * - Automatic failover
 * - Health monitoring
 *
 * @author Design Patterns Implementation
 * @version 1.0.0
 */

const EventEmitter = require('events');

const CircuitState = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN'
};

class DistributedStateManager {
    constructor(config = {}) {
        this.instanceId = config.instanceId || `instance-${Math.random().toString(36).substr(2, 9)}`;
        this.storage = new Map();
        this.subscriptions = new Map();
        this.redis = config.redis || null;
    }

    async getState(breakerName) {
        if (this.redis) {
            try {
                const data = await this.simulateRedisGet(`breaker:${breakerName}:state`);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error('Failed to get state from Redis:', error);
                return this.storage.get(breakerName) || null;
            }
        }
        return this.storage.get(breakerName) || null;
    }

    async setState(breakerName, state) {
        this.storage.set(breakerName, state);

        if (this.redis) {
            try {
                await this.simulateRedisSet(`breaker:${breakerName}:state`, JSON.stringify(state), 300);
                await this.publishStateChange(breakerName, state);
            } catch (error) {
                console.error('Failed to set state in Redis:', error);
            }
        }
    }

    async incrementCounter(breakerName, counterName) {
        const key = `breaker:${breakerName}:counter:${counterName}`;
        if (this.redis) {
            return await this.simulateRedisIncr(key);
        }

        const state = await this.getState(breakerName) || { counters: {} };
        state.counters = state.counters || {};
        state.counters[counterName] = (state.counters[counterName] || 0) + 1;
        await this.setState(breakerName, state);
        return state.counters[counterName];
    }

    async getCounter(breakerName, counterName) {
        const state = await this.getState(breakerName);
        return state?.counters?.[counterName] || 0;
    }

    async publishStateChange(breakerName, state) {
        const message = {
            instanceId: this.instanceId,
            breakerName,
            state,
            timestamp: Date.now()
        };

        if (this.redis) {
            await this.simulateRedisPublish(`breaker:${breakerName}:changes`, JSON.stringify(message));
        }

        const subscribers = this.subscriptions.get(breakerName) || [];
        subscribers.forEach(callback => callback(message));
    }

    subscribe(breakerName, callback) {
        if (!this.subscriptions.has(breakerName)) {
            this.subscriptions.set(breakerName, []);
        }
        this.subscriptions.get(breakerName).push(callback);

        if (this.redis) {
            this.simulateRedisSubscribe(`breaker:${breakerName}:changes`, callback);
        }
    }

    simulateRedisGet(key) {
        return Promise.resolve(this.storage.get(key));
    }

    simulateRedisSet(key, value, ttl) {
        this.storage.set(key, value);
        if (ttl) {
            setTimeout(() => this.storage.delete(key), ttl * 1000);
        }
        return Promise.resolve('OK');
    }

    simulateRedisIncr(key) {
        const current = parseInt(this.storage.get(key) || '0');
        const newValue = current + 1;
        this.storage.set(key, newValue.toString());
        return Promise.resolve(newValue);
    }

    simulateRedisPublish(channel, message) {
        return Promise.resolve(1);
    }

    simulateRedisSubscribe(channel, callback) {
        return Promise.resolve();
    }

    async cleanup(breakerName) {
        if (this.redis) {
            const keys = [`breaker:${breakerName}:state`, `breaker:${breakerName}:counter:*`];
            for (const key of keys) {
                await this.storage.delete(key);
            }
        }
        this.storage.delete(breakerName);
    }
}

class DistributedCircuitBreakerConfig {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.successThreshold = options.successThreshold || 2;
        this.timeout = options.timeout || 60000;
        this.resetTimeout = options.resetTimeout || 30000;
        this.monitoringPeriod = options.monitoringPeriod || 10000;
        this.volumeThreshold = options.volumeThreshold || 10;
        this.errorThresholdPercentage = options.errorThresholdPercentage || 50;
        this.syncInterval = options.syncInterval || 5000;
        this.instanceId = options.instanceId;
        this.redis = options.redis;
    }
}

class CircuitBreakerCloud extends EventEmitter {
    constructor(name, config = {}) {
        super();
        this.name = name;
        this.config = new DistributedCircuitBreakerConfig(config);
        this.stateManager = new DistributedStateManager(this.config);
        this.localState = CircuitState.CLOSED;
        this.localStats = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            rejectedCalls: 0,
            consecutiveFailures: 0,
            consecutiveSuccesses: 0
        };
        this.nextAttempt = Date.now();
        this.syncTimer = null;
        this.monitoringTimer = null;

        this.initialize();
    }

    async initialize() {
        await this.loadDistributedState();
        this.startSync();
        this.startMonitoring();

        this.stateManager.subscribe(this.name, (message) => {
            if (message.instanceId !== this.stateManager.instanceId) {
                this.handleRemoteStateChange(message);
            }
        });
    }

    async loadDistributedState() {
        const distributedState = await this.stateManager.getState(this.name);
        if (distributedState) {
            this.localState = distributedState.state || CircuitState.CLOSED;
            this.nextAttempt = distributedState.nextAttempt || Date.now();
            console.log(`Loaded distributed state for ${this.name}: ${this.localState}`);
        }
    }

    async execute(fn, fallback = null) {
        if (!await this.canExecute()) {
            this.localStats.rejectedCalls++;
            await this.stateManager.incrementCounter(this.name, 'rejectedCalls');

            this.emit('rejected', {
                name: this.name,
                instanceId: this.stateManager.instanceId,
                state: this.localState,
                stats: this.localStats
            });

            if (fallback) {
                return await this.executeFallback(fallback);
            }

            throw new Error(`Circuit breaker '${this.name}' is ${this.localState}`);
        }

        try {
            const result = await this.executeWithTimeout(fn);
            await this.onSuccess();
            return result;
        } catch (error) {
            await this.onFailure(error);

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
            this.emit('fallback', {
                name: this.name,
                instanceId: this.stateManager.instanceId
            });
            return await fallback();
        } catch (fallbackError) {
            this.emit('fallbackError', {
                name: this.name,
                instanceId: this.stateManager.instanceId,
                error: fallbackError
            });
            throw fallbackError;
        }
    }

    async canExecute() {
        await this.loadDistributedState();

        if (this.localState === CircuitState.CLOSED) {
            return true;
        }

        if (this.localState === CircuitState.OPEN) {
            if (Date.now() >= this.nextAttempt) {
                await this.transitionTo(CircuitState.HALF_OPEN);
                return true;
            }
            return false;
        }

        if (this.localState === CircuitState.HALF_OPEN) {
            return true;
        }

        return false;
    }

    async onSuccess() {
        this.localStats.totalCalls++;
        this.localStats.successfulCalls++;
        this.localStats.consecutiveSuccesses++;
        this.localStats.consecutiveFailures = 0;

        await this.stateManager.incrementCounter(this.name, 'successfulCalls');

        this.emit('success', {
            name: this.name,
            instanceId: this.stateManager.instanceId,
            state: this.localState,
            consecutiveSuccesses: this.localStats.consecutiveSuccesses
        });

        if (this.localState === CircuitState.HALF_OPEN) {
            if (this.localStats.consecutiveSuccesses >= this.config.successThreshold) {
                await this.transitionTo(CircuitState.CLOSED);
                this.resetLocalStats();
            }
        }
    }

    async onFailure(error) {
        this.localStats.totalCalls++;
        this.localStats.failedCalls++;
        this.localStats.consecutiveFailures++;
        this.localStats.consecutiveSuccesses = 0;

        await this.stateManager.incrementCounter(this.name, 'failedCalls');

        this.emit('failure', {
            name: this.name,
            instanceId: this.stateManager.instanceId,
            state: this.localState,
            error: error.message,
            consecutiveFailures: this.localStats.consecutiveFailures
        });

        if (this.localState === CircuitState.HALF_OPEN) {
            await this.transitionTo(CircuitState.OPEN);
            this.scheduleNextAttempt();
            return;
        }

        if (this.localState === CircuitState.CLOSED) {
            if (await this.shouldOpenCircuit()) {
                await this.transitionTo(CircuitState.OPEN);
                this.scheduleNextAttempt();
            }
        }
    }

    async shouldOpenCircuit() {
        if (this.localStats.consecutiveFailures >= this.config.failureThreshold) {
            return true;
        }

        const totalFailures = await this.stateManager.getCounter(this.name, 'failedCalls');
        const totalCalls = await this.stateManager.getCounter(this.name, 'totalCalls');

        if (totalCalls >= this.config.volumeThreshold) {
            const errorRate = (totalFailures / totalCalls) * 100;
            if (errorRate >= this.config.errorThresholdPercentage) {
                return true;
            }
        }

        return false;
    }

    async transitionTo(newState) {
        const oldState = this.localState;
        this.localState = newState;

        const stateData = {
            state: newState,
            nextAttempt: this.nextAttempt,
            timestamp: Date.now(),
            instanceId: this.stateManager.instanceId
        };

        await this.stateManager.setState(this.name, stateData);

        this.emit('stateChange', {
            name: this.name,
            instanceId: this.stateManager.instanceId,
            from: oldState,
            to: newState,
            timestamp: Date.now(),
            stats: this.localStats
        });

        console.log(`[${this.stateManager.instanceId}] Circuit breaker '${this.name}' transitioned from ${oldState} to ${newState}`);
    }

    scheduleNextAttempt() {
        this.nextAttempt = Date.now() + this.config.resetTimeout;

        this.emit('scheduled', {
            name: this.name,
            instanceId: this.stateManager.instanceId,
            nextAttempt: this.nextAttempt,
            resetTimeout: this.config.resetTimeout
        });
    }

    handleRemoteStateChange(message) {
        console.log(`[${this.stateManager.instanceId}] Received state change from ${message.instanceId}: ${message.state.state}`);

        if (message.state.state !== this.localState) {
            this.localState = message.state.state;
            this.nextAttempt = message.state.nextAttempt || this.nextAttempt;

            this.emit('remoteStateChange', {
                name: this.name,
                remoteInstanceId: message.instanceId,
                newState: message.state.state
            });
        }
    }

    startSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }

        this.syncTimer = setInterval(async () => {
            await this.loadDistributedState();
        }, this.config.syncInterval);
    }

    startMonitoring() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
        }

        this.monitoringTimer = setInterval(() => {
            this.emit('monitoring', {
                name: this.name,
                instanceId: this.stateManager.instanceId,
                state: this.localState,
                stats: this.localStats
            });
        }, this.config.monitoringPeriod);
    }

    stopSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }

    stopMonitoring() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }
    }

    resetLocalStats() {
        this.localStats = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            rejectedCalls: 0,
            consecutiveFailures: 0,
            consecutiveSuccesses: 0
        };
    }

    async forceOpen() {
        await this.transitionTo(CircuitState.OPEN);
        this.scheduleNextAttempt();
    }

    async forceClosed() {
        await this.transitionTo(CircuitState.CLOSED);
        this.resetLocalStats();
    }

    getState() {
        return this.localState;
    }

    getStats() {
        return {
            ...this.localStats,
            instanceId: this.stateManager.instanceId
        };
    }

    async getHealth() {
        const distributedState = await this.stateManager.getState(this.name);

        return {
            name: this.name,
            instanceId: this.stateManager.instanceId,
            localState: this.localState,
            distributedState: distributedState?.state || 'UNKNOWN',
            healthy: this.localState !== CircuitState.OPEN,
            stats: this.localStats,
            nextAttempt: this.nextAttempt,
            config: {
                failureThreshold: this.config.failureThreshold,
                successThreshold: this.config.successThreshold,
                timeout: this.config.timeout,
                resetTimeout: this.config.resetTimeout,
                syncInterval: this.config.syncInterval
            }
        };
    }

    async shutdown() {
        this.stopSync();
        this.stopMonitoring();
        await this.stateManager.cleanup(this.name);
        this.removeAllListeners();
    }
}

async function demonstrateCircuitBreakerCloud() {
    const instance1 = new CircuitBreakerCloud('cloudApiService', {
        instanceId: 'instance-1',
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 5000,
        resetTimeout: 10000,
        syncInterval: 2000
    });

    const instance2 = new CircuitBreakerCloud('cloudApiService', {
        instanceId: 'instance-2',
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 5000,
        resetTimeout: 10000,
        syncInterval: 2000
    });

    instance1.on('stateChange', (event) => {
        console.log(`[Instance 1] State changed from ${event.from} to ${event.to}`);
    });

    instance2.on('remoteStateChange', (event) => {
        console.log(`[Instance 2] Detected remote state change to ${event.newState}`);
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

    console.log('Starting distributed circuit breaker demonstration...');

    for (let i = 0; i < 5; i++) {
        try {
            const result = await instance1.execute(apiCall, fallback);
            console.log(`[Instance 1] Call ${i + 1} succeeded:`, result);
        } catch (error) {
            console.log(`[Instance 1] Call ${i + 1} failed:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    for (let i = 0; i < 3; i++) {
        try {
            const result = await instance2.execute(apiCall, fallback);
            console.log(`[Instance 2] Call ${i + 1} succeeded:`, result);
        } catch (error) {
            console.log(`[Instance 2] Call ${i + 1} failed:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Instance 1 Health:', await instance1.getHealth());
    console.log('Instance 2 Health:', await instance2.getHealth());

    await instance1.shutdown();
    await instance2.shutdown();
}

module.exports = {
    CircuitBreakerCloud,
    DistributedStateManager,
    CircuitState,
    demonstrateCircuitBreakerCloud
};
