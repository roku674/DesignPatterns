/**
 * No Caching Anti-Pattern
 *
 * PROBLEM:
 * Repeatedly fetching the same data from databases or external APIs without
 * caching. This wastes resources, increases latency, and can cause rate limiting
 * or database overload.
 *
 * SYMPTOMS:
 * - Same queries executed repeatedly
 * - High database load
 * - Slow response times
 * - Unnecessary API calls
 * - Poor scalability
 *
 * SOLUTION:
 * Implement caching at multiple levels (application, distributed, CDN),
 * with appropriate TTL and invalidation strategies.
 */

// ============================================================================
// SIMULATED EXTERNAL SERVICES
// ============================================================================

class SlowDatabase {
  constructor() {
    this.queryCount = 0;
    this.data = new Map([
      ['user:1', { id: 1, name: 'Alice', email: 'alice@example.com' }],
      ['user:2', { id: 2, name: 'Bob', email: 'bob@example.com' }],
      ['product:1', { id: 1, name: 'Widget', price: 29.99 }],
      ['product:2', { id: 2, name: 'Gadget', price: 49.99 }],
    ]);
  }

  async get(key) {
    this.queryCount++;
    // Simulate slow database query
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`  [DB] Query ${this.queryCount}: Fetching ${key} (100ms latency)`);
    return this.data.get(key);
  }

  getStats() {
    return { queryCount: this.queryCount };
  }

  reset() {
    this.queryCount = 0;
  }
}

class ExternalAPI {
  constructor() {
    this.requestCount = 0;
    this.rateLimit = 10; // Max 10 requests per minute
    this.requestsInWindow = 0;
    this.windowStart = Date.now();
  }

  async fetchData(endpoint) {
    this.requestCount++;

    // Check rate limit
    const now = Date.now();
    if (now - this.windowStart > 60000) {
      this.windowStart = now;
      this.requestsInWindow = 0;
    }

    this.requestsInWindow++;
    if (this.requestsInWindow > this.rateLimit) {
      throw new Error('Rate limit exceeded');
    }

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log(`  [API] Request ${this.requestCount}: ${endpoint} (200ms latency)`);

    return { data: `Response from ${endpoint}`, timestamp: Date.now() };
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      requestsInWindow: this.requestsInWindow,
      rateLimit: this.rateLimit
    };
  }

  reset() {
    this.requestCount = 0;
    this.requestsInWindow = 0;
    this.windowStart = Date.now();
  }
}

// ============================================================================
// ANTI-PATTERN: No Caching
// ============================================================================

class NoCachingService {
  constructor(database, api) {
    this.db = database;
    this.api = api;
  }

  // PROBLEM: Fetch from DB every time, no caching
  async getUser(userId) {
    console.log(`[NO-CACHE] Getting user ${userId}`);
    const user = await this.db.get(`user:${userId}`);
    console.log('PROBLEM: Fetched from DB without checking cache!\n');
    return user;
  }

  // PROBLEM: API call every time
  async getExternalData(endpoint) {
    console.log(`[NO-CACHE] Getting external data from ${endpoint}`);
    const data = await this.api.fetchData(endpoint);
    console.log('PROBLEM: Made API call without caching!\n');
    return data;
  }

  // PROBLEM: Repeated lookups in the same request
  async processOrder(userId, productId) {
    console.log(`[NO-CACHE] Processing order`);

    // PROBLEM: Multiple lookups for same data
    const user = await this.db.get(`user:${userId}`);
    const product = await this.db.get(`product:${productId}`);

    // Validate user (another lookup!)
    const userCheck = await this.db.get(`user:${userId}`);

    // Calculate price (yet another lookup!)
    const productCheck = await this.db.get(`product:${productId}`);

    console.log('PROBLEM: Made 4 DB queries when 2 would suffice!\n');
    return { user, product };
  }
}

// ============================================================================
// SOLUTION: Multi-Level Caching
// ============================================================================

// In-Memory Cache (L1)
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);

      // Check TTL
      if (entry.expiresAt > Date.now()) {
        this.hits++;
        console.log(`  [CACHE-HIT] Memory cache: ${key}`);
        return entry.value;
      } else {
        this.cache.delete(key);
      }
    }

    this.misses++;
    console.log(`  [CACHE-MISS] Memory cache: ${key}`);
    return null;
  }

  set(key, value, ttl = 60000) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses) || 0
    };
  }
}

// Distributed Cache (L2) - Simulated Redis
class DistributedCache {
  constructor() {
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  async get(key) {
    await new Promise(resolve => setTimeout(resolve, 5)); // Small latency

    if (this.cache.has(key)) {
      const entry = this.cache.get(key);

      if (entry.expiresAt > Date.now()) {
        this.hits++;
        console.log(`  [CACHE-HIT] Distributed cache: ${key}`);
        return entry.value;
      } else {
        this.cache.delete(key);
      }
    }

    this.misses++;
    console.log(`  [CACHE-MISS] Distributed cache: ${key}`);
    return null;
  }

  async set(key, value, ttl = 300000) {
    await new Promise(resolve => setTimeout(resolve, 5));
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }

  async delete(key) {
    this.cache.delete(key);
  }

  async clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses) || 0
    };
  }
}

class CachingService {
  constructor(database, api, memoryCache, distributedCache) {
    this.db = database;
    this.api = api;
    this.memoryCache = memoryCache;
    this.distributedCache = distributedCache;
  }

  async getUser(userId) {
    console.log(`[CACHING] Getting user ${userId}`);
    const key = `user:${userId}`;

    // L1: Check memory cache
    let user = this.memoryCache.get(key);
    if (user) {
      console.log('SUCCESS: Served from memory cache!\n');
      return user;
    }

    // L2: Check distributed cache
    user = await this.distributedCache.get(key);
    if (user) {
      // Populate L1
      this.memoryCache.set(key, user);
      console.log('SUCCESS: Served from distributed cache!\n');
      return user;
    }

    // L3: Fetch from database
    user = await this.db.get(key);

    // Populate caches
    this.memoryCache.set(key, user, 60000); // 1 minute
    await this.distributedCache.set(key, user, 300000); // 5 minutes

    console.log('SUCCESS: Fetched from DB and cached!\n');
    return user;
  }

  async getExternalData(endpoint) {
    console.log(`[CACHING] Getting external data from ${endpoint}`);
    const key = `api:${endpoint}`;

    // Check cache first
    let data = this.memoryCache.get(key);
    if (data) {
      console.log('SUCCESS: Served API response from cache!\n');
      return data;
    }

    // Fetch from API
    data = await this.api.fetchData(endpoint);

    // Cache it
    this.memoryCache.set(key, data, 120000); // 2 minutes for API data

    console.log('SUCCESS: Fetched from API and cached!\n');
    return data;
  }

  async processOrder(userId, productId) {
    console.log(`[CACHING] Processing order`);

    // Both lookups will hit cache after first fetch
    const user = await this.getUser(userId);
    const product = await this.db.get(`product:${productId}`);

    // These will be cache hits
    const userCheck = await this.getUser(userId);
    const productCheck = await this.db.get(`product:${productId}`);

    console.log('Note: Additional lookups in same code avoided DB!\n');
    return { user, product };
  }

  async invalidateUser(userId) {
    const key = `user:${userId}`;
    this.memoryCache.delete(key);
    await this.distributedCache.delete(key);
    console.log(`[CACHE] Invalidated ${key}`);
  }
}

// ============================================================================
// ADVANCED: Cache-Aside Pattern with Write-Through
// ============================================================================

class CacheAsideService {
  constructor(database, cache) {
    this.db = database;
    this.cache = cache;
  }

  async get(key) {
    // Try cache first
    let value = await this.cache.get(key);

    if (!value) {
      // Cache miss - fetch from DB
      value = await this.db.get(key);
      if (value) {
        // Store in cache
        await this.cache.set(key, value);
      }
    }

    return value;
  }

  async update(key, value) {
    // Write to database
    // await this.db.update(key, value);

    // Invalidate cache (Cache-Aside)
    await this.cache.delete(key);

    // OR: Update cache (Write-Through)
    // await this.cache.set(key, value);
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

async function demonstrateNoCaching() {
  console.log('='.repeat(80));
  console.log('NO CACHING ANTI-PATTERN DEMONSTRATION');
  console.log('='.repeat(80));

  console.log('\n--- ANTI-PATTERN: No Caching ---\n');
  const db1 = new SlowDatabase();
  const api1 = new ExternalAPI();
  const noCacheService = new NoCachingService(db1, api1);

  const noCacheStart = Date.now();

  // Make same requests multiple times
  for (let i = 0; i < 5; i++) {
    await noCacheService.getUser(1);
  }

  for (let i = 0; i < 3; i++) {
    await noCacheService.getExternalData('/weather/today');
  }

  await noCacheService.processOrder(1, 1);

  const noCacheTime = Date.now() - noCacheStart;
  const noCacheDbStats = db1.getStats();
  const noCacheApiStats = api1.getStats();

  console.log('No-Cache Statistics:');
  console.log(`  Total Time: ${noCacheTime}ms`);
  console.log(`  DB Queries: ${noCacheDbStats.queryCount}`);
  console.log(`  API Requests: ${noCacheApiStats.requestCount}`);
  console.log('  PROBLEM: Excessive redundant requests!\n');

  console.log('\n--- SOLUTION: Multi-Level Caching ---\n');
  const db2 = new SlowDatabase();
  const api2 = new ExternalAPI();
  const memCache = new MemoryCache();
  const distCache = new DistributedCache();
  const cacheService = new CachingService(db2, api2, memCache, distCache);

  const cacheStart = Date.now();

  // Same requests - should be cached
  for (let i = 0; i < 5; i++) {
    await cacheService.getUser(1);
  }

  for (let i = 0; i < 3; i++) {
    await cacheService.getExternalData('/weather/today');
  }

  await cacheService.processOrder(1, 1);

  const cacheTime = Date.now() - cacheStart;
  const cacheDbStats = db2.getStats();
  const cacheApiStats = api2.getStats();
  const memCacheStats = memCache.getStats();
  const distCacheStats = distCache.getStats();

  console.log('Caching Statistics:');
  console.log(`  Total Time: ${cacheTime}ms`);
  console.log(`  DB Queries: ${cacheDbStats.queryCount}`);
  console.log(`  API Requests: ${cacheApiStats.requestCount}`);
  console.log(`  Memory Cache - Hits: ${memCacheStats.hits}, Misses: ${memCacheStats.misses}, Hit Rate: ${(memCacheStats.hitRate * 100).toFixed(1)}%`);
  console.log(`  Distributed Cache - Hits: ${distCacheStats.hits}, Misses: ${distCacheStats.misses}`);
  console.log(`  SUCCESS: ${((1 - cacheTime / noCacheTime) * 100).toFixed(1)}% faster with ${((1 - cacheDbStats.queryCount / noCacheDbStats.queryCount) * 100).toFixed(1)}% fewer DB queries!\n`);

  console.log('\n--- Cache Invalidation ---\n');
  await cacheService.invalidateUser(1);
  console.log('Cache invalidated, next fetch will hit database\n');

  await cacheService.getUser(1);

  console.log('='.repeat(80));
  console.log('KEY TAKEAWAYS:');
  console.log('='.repeat(80));
  console.log('1. Implement multi-level caching (L1: Memory, L2: Distributed)');
  console.log('2. Use appropriate TTL for different data types');
  console.log('3. Implement cache invalidation strategy');
  console.log('4. Monitor cache hit rates in production');
  console.log('5. Consider cache-aside vs write-through patterns');
  console.log('6. Use Redis for distributed caching');
  console.log('7. CDN for static content caching');
  console.log('8. Balance between freshness and performance');
  console.log('='.repeat(80));
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  SlowDatabase,
  ExternalAPI,
  NoCachingService,
  MemoryCache,
  DistributedCache,
  CachingService,
  CacheAsideService,
  demonstrateNoCaching
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateNoCaching().catch(console.error);
}
