/**
 * API Composition Pattern Implementation
 *
 * Purpose:
 * The API Composition pattern aggregates data from multiple services
 * into a single response, composing results from different microservices
 * to fulfill client requests without requiring multiple round trips.
 *
 * Use Cases:
 * - Aggregate data from multiple microservices
 * - Reduce client-server round trips
 * - Build composite views from distributed data
 * - Backend for frontend (BFF) pattern
 * - Real-time data aggregation
 *
 * Components:
 * - Composer: Orchestrates service calls
 * - ServiceClient: Makes requests to microservices
 * - DataMerger: Combines results from multiple services
 * - CacheManager: Caches composed results
 * - CorrelationTracker: Tracks request flow
 */

const http = require('http');
const https = require('https');
const url = require('url');

/**
 * Generate a UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Service Client for making HTTP requests to microservices
 */
class ServiceClient {
    constructor(options = {}) {
        this.timeout = options.timeout || 5000;
        this.retries = options.retries || 3;
        this.retryDelay = options.retryDelay || 1000;
    }

    /**
     * Make HTTP request to a service
     */
    async request(serviceUrl, options = {}) {
        const urlObj = new url.URL(serviceUrl);
        const protocol = urlObj.protocol === 'https:' ? https : http;

        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: this.timeout
        };

        return new Promise((resolve, reject) => {
            const req = protocol.request(requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: parsed
                        });
                    } catch (error) {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: data
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (options.body) {
                req.write(JSON.stringify(options.body));
            }

            req.end();
        });
    }

    /**
     * Make request with retry logic
     */
    async requestWithRetry(serviceUrl, options = {}, attempt = 1) {
        try {
            return await this.request(serviceUrl, options);
        } catch (error) {
            if (attempt >= this.retries) {
                throw error;
            }

            console.log(`[ServiceClient] Retry attempt ${attempt + 1} for ${serviceUrl}`);
            await this.delay(this.retryDelay * attempt);
            return this.requestWithRetry(serviceUrl, options, attempt + 1);
        }
    }

    /**
     * Delay utility for retries
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Cache Manager for caching composed results
 */
class CacheManager {
    constructor(options = {}) {
        this.cache = new Map();
        this.ttl = options.ttl || 60000; // 1 minute default
        this.maxSize = options.maxSize || 1000;
    }

    /**
     * Get cached value
     */
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if entry has expired
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        console.log(`[CacheManager] Cache hit for key: ${key}`);
        return entry.value;
    }

    /**
     * Set cached value
     */
    set(key, value) {
        // Implement LRU eviction if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            value: value,
            timestamp: Date.now()
        });

        console.log(`[CacheManager] Cached value for key: ${key}`);
    }

    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
        console.log('[CacheManager] Cache cleared');
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            ttl: this.ttl
        };
    }
}

/**
 * Correlation Tracker for distributed tracing
 */
class CorrelationTracker {
    constructor() {
        this.traces = new Map();
    }

    /**
     * Start tracking a request
     */
    startTracking(correlationId) {
        const trace = {
            correlationId: correlationId,
            startTime: Date.now(),
            services: [],
            metadata: {}
        };

        this.traces.set(correlationId, trace);
        return trace;
    }

    /**
     * Add service call to trace
     */
    addServiceCall(correlationId, serviceName, startTime, endTime, success, data = {}) {
        const trace = this.traces.get(correlationId);

        if (trace) {
            trace.services.push({
                serviceName: serviceName,
                startTime: startTime,
                endTime: endTime,
                duration: endTime - startTime,
                success: success,
                data: data
            });
        }
    }

    /**
     * Complete tracking
     */
    completeTracking(correlationId) {
        const trace = this.traces.get(correlationId);

        if (trace) {
            trace.endTime = Date.now();
            trace.totalDuration = trace.endTime - trace.startTime;

            console.log(`[CorrelationTracker] Request ${correlationId} completed in ${trace.totalDuration}ms`);
            console.log(`  Services called: ${trace.services.length}`);

            return trace;
        }

        return null;
    }

    /**
     * Get trace information
     */
    getTrace(correlationId) {
        return this.traces.get(correlationId);
    }
}

/**
 * Data Merger for combining results from multiple services
 */
class DataMerger {
    /**
     * Merge results based on strategy
     */
    merge(results, strategy = 'combine') {
        switch (strategy) {
            case 'combine':
                return this.combineResults(results);
            case 'nested':
                return this.nestedResults(results);
            case 'flat':
                return this.flattenResults(results);
            default:
                return results;
        }
    }

    /**
     * Combine all results into a single object
     */
    combineResults(results) {
        const combined = {};

        Object.keys(results).forEach(serviceName => {
            combined[serviceName] = results[serviceName];
        });

        return combined;
    }

    /**
     * Create nested structure
     */
    nestedResults(results) {
        return {
            data: results,
            timestamp: Date.now()
        };
    }

    /**
     * Flatten all results into a single array
     */
    flattenResults(results) {
        const flattened = [];

        Object.values(results).forEach(result => {
            if (Array.isArray(result)) {
                flattened.push(...result);
            } else {
                flattened.push(result);
            }
        });

        return flattened;
    }
}

/**
 * API Composer orchestrates service calls and composition
 */
class APIComposer {
    constructor(options = {}) {
        this.serviceClient = new ServiceClient(options.client);
        this.cacheManager = new CacheManager(options.cache);
        this.correlationTracker = new CorrelationTracker();
        this.dataMerger = new DataMerger();
        this.services = new Map();
        this.parallelExecution = options.parallelExecution !== false;
    }

    /**
     * Register a service endpoint
     */
    registerService(serviceName, serviceUrl, options = {}) {
        this.services.set(serviceName, {
            name: serviceName,
            url: serviceUrl,
            options: options,
            cacheable: options.cacheable || false,
            required: options.required !== false
        });

        console.log(`[APIComposer] Registered service: ${serviceName}`);
    }

    /**
     * Compose data from multiple services
     */
    async compose(serviceNames, options = {}) {
        const correlationId = options.correlationId || generateUUID();
        const cacheKey = this.generateCacheKey(serviceNames, options);

        // Start tracking
        this.correlationTracker.startTracking(correlationId);

        // Check cache if enabled
        if (options.useCache) {
            const cached = this.cacheManager.get(cacheKey);
            if (cached) {
                this.correlationTracker.completeTracking(correlationId);
                return cached;
            }
        }

        try {
            // Execute service calls
            const results = this.parallelExecution
                ? await this.composeParallel(serviceNames, correlationId, options)
                : await this.composeSequential(serviceNames, correlationId, options);

            // Merge results
            const mergeStrategy = options.mergeStrategy || 'combine';
            const composed = this.dataMerger.merge(results, mergeStrategy);

            // Add metadata
            const response = {
                data: composed,
                metadata: {
                    correlationId: correlationId,
                    services: Object.keys(results),
                    timestamp: Date.now()
                }
            };

            // Cache if enabled
            if (options.useCache) {
                this.cacheManager.set(cacheKey, response);
            }

            // Complete tracking
            this.correlationTracker.completeTracking(correlationId);

            return response;

        } catch (error) {
            this.correlationTracker.completeTracking(correlationId);
            throw error;
        }
    }

    /**
     * Compose services in parallel
     */
    async composeParallel(serviceNames, correlationId, options) {
        const promises = serviceNames.map(serviceName =>
            this.callService(serviceName, correlationId, options)
        );

        const results = await Promise.allSettled(promises);
        const composedResults = {};

        results.forEach((result, index) => {
            const serviceName = serviceNames[index];
            const service = this.services.get(serviceName);

            if (result.status === 'fulfilled') {
                composedResults[serviceName] = result.value;
            } else if (service.required) {
                throw new Error(`Required service ${serviceName} failed: ${result.reason.message}`);
            } else {
                console.log(`[APIComposer] Optional service ${serviceName} failed, continuing`);
                composedResults[serviceName] = null;
            }
        });

        return composedResults;
    }

    /**
     * Compose services sequentially
     */
    async composeSequential(serviceNames, correlationId, options) {
        const results = {};

        for (const serviceName of serviceNames) {
            try {
                results[serviceName] = await this.callService(serviceName, correlationId, options);
            } catch (error) {
                const service = this.services.get(serviceName);

                if (service.required) {
                    throw new Error(`Required service ${serviceName} failed: ${error.message}`);
                } else {
                    console.log(`[APIComposer] Optional service ${serviceName} failed, continuing`);
                    results[serviceName] = null;
                }
            }
        }

        return results;
    }

    /**
     * Call a single service
     */
    async callService(serviceName, correlationId, options = {}) {
        const service = this.services.get(serviceName);

        if (!service) {
            throw new Error(`Service ${serviceName} not registered`);
        }

        const startTime = Date.now();

        try {
            const response = await this.serviceClient.requestWithRetry(service.url, {
                method: options.method || 'GET',
                headers: {
                    'X-Correlation-ID': correlationId,
                    ...options.headers
                },
                body: options.body
            });

            const endTime = Date.now();

            // Track service call
            this.correlationTracker.addServiceCall(
                correlationId,
                serviceName,
                startTime,
                endTime,
                true,
                { statusCode: response.statusCode }
            );

            if (response.statusCode >= 400) {
                throw new Error(`Service returned error: ${response.statusCode}`);
            }

            return response.data;

        } catch (error) {
            const endTime = Date.now();

            // Track failed service call
            this.correlationTracker.addServiceCall(
                correlationId,
                serviceName,
                startTime,
                endTime,
                false,
                { error: error.message }
            );

            throw error;
        }
    }

    /**
     * Generate cache key
     */
    generateCacheKey(serviceNames, options) {
        return `compose:${serviceNames.join(',')}:${JSON.stringify(options.params || {})}`;
    }

    /**
     * Get composition statistics
     */
    getStats() {
        return {
            registeredServices: this.services.size,
            cache: this.cacheManager.getStats()
        };
    }
}

// Example usage demonstration
if (require.main === module) {
    // Create API Composer
    const composer = new APIComposer({
        client: { timeout: 5000, retries: 3 },
        cache: { ttl: 60000, maxSize: 100 },
        parallelExecution: true
    });

    // Register services
    composer.registerService('user-service', 'http://localhost:3001/users', {
        cacheable: true,
        required: true
    });

    composer.registerService('order-service', 'http://localhost:3002/orders', {
        cacheable: true,
        required: true
    });

    composer.registerService('product-service', 'http://localhost:3003/products', {
        cacheable: true,
        required: false
    });

    // Compose data from multiple services
    console.log('\n=== API Composition Pattern Demo ===\n');

    // Example: Compose user profile with orders and products
    composer.compose(['user-service', 'order-service', 'product-service'], {
        useCache: true,
        mergeStrategy: 'combine',
        correlationId: generateUUID()
    })
    .then(result => {
        console.log('\nComposed Result:');
        console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
        console.error('Composition failed:', error.message);
    });

    console.log('\nComposer Statistics:');
    console.log(JSON.stringify(composer.getStats(), null, 2));
}

module.exports = {
    APIComposer,
    ServiceClient,
    CacheManager,
    CorrelationTracker,
    DataMerger
};
