/**
 * Cache-Aside Pattern Implementation
 *
 * Cache-Aside (Lazy Loading) pattern loads data into cache on demand.
 * Application code is responsible for loading data into cache.
 *
 * Key Components:
 * - Cache Layer: In-memory storage with eviction policies
 * - Data Store: Persistent storage backend
 * - Cache Manager: Manages cache operations
 * - Eviction Policies: LRU, LFU, TTL-based
 * - Cache Statistics: Hit/miss rates, performance metrics
 */

/**
 * LRU (Least Recently Used) Cache Implementation
 */
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.statistics = {
            hits: 0,
            misses: 0,
            evictions: 0,
            sets: 0
        };
    }

    get(key) {
        if (!this.cache.has(key)) {
            this.statistics.misses++;
            return null;
        }

        const value = this.cache.get(key);
        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, value);
        this.statistics.hits++;

        return value;
    }

    set(key, value, ttl = null) {
        // Remove if exists
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }

        // Evict least recently used if at capacity
        if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.statistics.evictions++;
        }

        const entry = {
            value,
            createdAt: Date.now(),
            expiresAt: ttl ? Date.now() + ttl : null
        };

        this.cache.set(key, entry);
        this.statistics.sets++;
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }

    getStatistics() {
        const total = this.statistics.hits + this.statistics.misses;
        const hitRate = total > 0 ? (this.statistics.hits / total) * 100 : 0;

        return {
            ...this.statistics,
            total,
            hitRate: hitRate.toFixed(2) + '%',
            size: this.cache.size,
            capacity: this.capacity
        };
    }
}

/**
 * LFU (Least Frequently Used) Cache Implementation
 */
class LFUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.frequencies = new Map();
        this.statistics = {
            hits: 0,
            misses: 0,
            evictions: 0,
            sets: 0
        };
    }

    get(key) {
        if (!this.cache.has(key)) {
            this.statistics.misses++;
            return null;
        }

        const entry = this.cache.get(key);
        entry.frequency++;
        this.statistics.hits++;

        return entry.value;
    }

    set(key, value, ttl = null) {
        if (this.cache.has(key)) {
            const entry = this.cache.get(key);
            entry.value = value;
            entry.frequency++;
            return;
        }

        // Evict least frequently used if at capacity
        if (this.cache.size >= this.capacity) {
            let minFrequency = Infinity;
            let leastFrequentKey = null;

            for (const [k, entry] of this.cache) {
                if (entry.frequency < minFrequency) {
                    minFrequency = entry.frequency;
                    leastFrequentKey = k;
                }
            }

            if (leastFrequentKey) {
                this.cache.delete(leastFrequentKey);
                this.statistics.evictions++;
            }
        }

        this.cache.set(key, {
            value,
            frequency: 1,
            createdAt: Date.now(),
            expiresAt: ttl ? Date.now() + ttl : null
        });
        this.statistics.sets++;
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }

    getStatistics() {
        const total = this.statistics.hits + this.statistics.misses;
        const hitRate = total > 0 ? (this.statistics.hits / total) * 100 : 0;

        return {
            ...this.statistics,
            total,
            hitRate: hitRate.toFixed(2) + '%',
            size: this.cache.size,
            capacity: this.capacity
        };
    }
}

/**
 * Data Store Interface (simulates database)
 */
class DataStore {
    constructor() {
        this.data = new Map();
        this.readLatency = 50; // ms
        this.writeLatency = 30; // ms
    }

    async read(key) {
        // Simulate database read latency
        await this.sleep(this.readLatency);

        if (!this.data.has(key)) {
            return null;
        }

        return this.data.get(key);
    }

    async write(key, value) {
        // Simulate database write latency
        await this.sleep(this.writeLatency);
        this.data.set(key, value);
    }

    async delete(key) {
        await this.sleep(this.writeLatency);
        return this.data.delete(key);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    size() {
        return this.data.size;
    }
}

/**
 * Cache Manager - Implements Cache-Aside Pattern
 */
class CacheManager {
    constructor(cache, dataStore, options = {}) {
        this.cache = cache;
        this.dataStore = dataStore;
        this.defaultTTL = options.defaultTTL || 60000; // 1 minute
        this.writeThrough = options.writeThrough || false;
        this.statistics = {
            cacheReads: 0,
            dbReads: 0,
            writes: 0,
            deletes: 0
        };
    }

    async get(key) {
        this.statistics.cacheReads++;

        // Try to get from cache first
        const cachedValue = this.cache.get(key);

        if (cachedValue !== null) {
            // Check if expired
            if (cachedValue.expiresAt && Date.now() > cachedValue.expiresAt) {
                this.cache.delete(key);
                return await this.loadFromDataStore(key);
            }
            return cachedValue.value;
        }

        // Cache miss - load from data store
        return await this.loadFromDataStore(key);
    }

    async loadFromDataStore(key) {
        this.statistics.dbReads++;
        const value = await this.dataStore.read(key);

        if (value !== null) {
            // Load into cache
            this.cache.set(key, value, this.defaultTTL);
        }

        return value;
    }

    async set(key, value, ttl = null) {
        this.statistics.writes++;
        ttl = ttl || this.defaultTTL;

        if (this.writeThrough) {
            // Write-through: Update cache and database simultaneously
            await Promise.all([
                this.dataStore.write(key, value),
                Promise.resolve(this.cache.set(key, value, ttl))
            ]);
        } else {
            // Write-behind: Update database first, then invalidate cache
            await this.dataStore.write(key, value);
            this.cache.delete(key);
        }
    }

    async delete(key) {
        this.statistics.deletes++;

        // Delete from both cache and data store
        await this.dataStore.delete(key);
        this.cache.delete(key);
    }

    invalidate(key) {
        this.cache.delete(key);
    }

    invalidateAll() {
        this.cache.clear();
    }

    getStatistics() {
        return {
            manager: this.statistics,
            cache: this.cache.getStatistics(),
            dataStore: {
                size: this.dataStore.size()
            }
        };
    }
}

/**
 * Multi-Layer Cache for hierarchical caching
 */
class MultiLayerCache {
    constructor() {
        this.layers = [];
    }

    addLayer(name, cache, priority = 0) {
        this.layers.push({ name, cache, priority });
        this.layers.sort((a, b) => a.priority - b.priority);
    }

    async get(key) {
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const value = layer.cache.get(key);

            if (value !== null) {
                // Promote to higher layers
                for (let j = 0; j < i; j++) {
                    this.layers[j].cache.set(key, value.value);
                }
                return value.value;
            }
        }

        return null;
    }

    set(key, value, ttl = null) {
        // Set in all layers
        for (const layer of this.layers) {
            layer.cache.set(key, value, ttl);
        }
    }

    delete(key) {
        for (const layer of this.layers) {
            layer.cache.delete(key);
        }
    }

    getStatistics() {
        const stats = {};
        for (const layer of this.layers) {
            stats[layer.name] = layer.cache.getStatistics();
        }
        return stats;
    }
}

/**
 * Cache Warming - Pre-load frequently accessed data
 */
class CacheWarmer {
    constructor(cacheManager, dataStore) {
        this.cacheManager = cacheManager;
        this.dataStore = dataStore;
    }

    async warmCache(keys) {
        console.log(`Warming cache with ${keys.length} keys...`);

        const promises = keys.map(async (key) => {
            const value = await this.dataStore.read(key);
            if (value !== null) {
                this.cacheManager.cache.set(key, value);
            }
        });

        await Promise.all(promises);
        console.log('Cache warming completed');
    }

    async warmCacheWithPattern(keyPattern, limit = 100) {
        // In a real system, would query database for keys matching pattern
        console.log(`Warming cache with pattern: ${keyPattern}`);
    }
}

/**
 * Demonstration
 */
async function demonstrateCacheAside() {
    console.log('=== Cache-Aside Pattern Demonstration ===\n');

    // Setup
    const dataStore = new DataStore();
    const lruCache = new LRUCache(5);
    const cacheManager = new CacheManager(lruCache, dataStore, {
        defaultTTL: 5000,
        writeThrough: false
    });

    // Pre-populate data store
    console.log('1. Populating data store...');
    await dataStore.write('user:1', { id: 1, name: 'Alice', role: 'admin' });
    await dataStore.write('user:2', { id: 2, name: 'Bob', role: 'user' });
    await dataStore.write('user:3', { id: 3, name: 'Charlie', role: 'user' });

    // Test cache-aside reads
    console.log('\n2. Testing cache-aside reads...');
    console.time('First read (cache miss)');
    const user1 = await cacheManager.get('user:1');
    console.timeEnd('First read (cache miss)');
    console.log('User 1:', user1);

    console.time('Second read (cache hit)');
    const user1Again = await cacheManager.get('user:1');
    console.timeEnd('Second read (cache hit)');
    console.log('User 1 (cached):', user1Again);

    // Test writes
    console.log('\n3. Testing writes...');
    await cacheManager.set('user:4', { id: 4, name: 'David', role: 'user' });
    const user4 = await cacheManager.get('user:4');
    console.log('User 4:', user4);

    // Test cache eviction (LRU)
    console.log('\n4. Testing LRU eviction...');
    for (let i = 5; i <= 10; i++) {
        await cacheManager.set(`user:${i}`, { id: i, name: `User ${i}`, role: 'user' });
    }

    // Statistics
    console.log('\n5. Cache Statistics:');
    console.log(JSON.stringify(cacheManager.getStatistics(), null, 2));

    // Multi-layer cache
    console.log('\n6. Testing multi-layer cache...');
    const l1Cache = new LRUCache(3);
    const l2Cache = new LRUCache(10);
    const multiCache = new MultiLayerCache();
    multiCache.addLayer('L1', l1Cache, 1);
    multiCache.addLayer('L2', l2Cache, 2);

    multiCache.set('key1', 'value1');
    multiCache.set('key2', 'value2');

    console.log('Multi-layer stats:');
    console.log(JSON.stringify(multiCache.getStatistics(), null, 2));

    // LFU Cache comparison
    console.log('\n7. Comparing LRU vs LFU...');
    const lfuCache = new LFUCache(3);
    const lfuManager = new CacheManager(lfuCache, dataStore);

    // Access pattern favoring certain keys
    await lfuManager.get('user:1');
    await lfuManager.get('user:1');
    await lfuManager.get('user:2');
    await lfuManager.get('user:2');
    await lfuManager.get('user:2');
    await lfuManager.get('user:3');

    console.log('LFU Cache Statistics:');
    console.log(JSON.stringify(lfuManager.getStatistics(), null, 2));
}

// Run demonstration
if (require.main === module) {
    demonstrateCacheAside().catch(console.error);
}

module.exports = {
    LRUCache,
    LFUCache,
    DataStore,
    CacheManager,
    MultiLayerCache,
    CacheWarmer
};
