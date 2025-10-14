/**
 * Double-Checked Locking Pattern
 *
 * Purpose:
 * Reduces overhead of acquiring a lock by first testing the locking criterion
 * without actually acquiring the lock. Only if the check indicates locking is
 * required does the actual locking logic proceed.
 *
 * Use Cases:
 * - Lazy initialization of expensive resources
 * - Singleton pattern optimization
 * - Cache initialization
 * - Configuration loading
 *
 * @author Design Patterns Implementation
 * @date 2025
 */

/**
 * Simple mutex implementation for JavaScript
 */
class Mutex {
  constructor() {
    this.locked = false;
    this.queue = [];
  }

  async acquire() {
    if (!this.locked) {
      this.locked = true;
      return () => this.release();
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  release() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve(() => this.release());
    } else {
      this.locked = false;
    }
  }

  isLocked() {
    return this.locked;
  }
}

/**
 * Double-Checked Locking implementation
 */
class DoubleCheckedLock {
  constructor(initializer, options = {}) {
    this.initializer = initializer;
    this.instance = null;
    this.mutex = new Mutex();
    this.initializationAttempts = 0;
    this.lastInitializationTime = null;
    this.options = {
      enableMetrics: options.enableMetrics !== false,
      cacheTime: options.cacheTime || null,
      validator: options.validator || null
    };

    this.metrics = {
      checksWithoutLock: 0,
      checksWithLock: 0,
      initializations: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  /**
   * Get instance with double-checked locking
   */
  async getInstance() {
    // First check (without lock) - fast path
    if (this.isValid()) {
      if (this.options.enableMetrics) {
        this.metrics.checksWithoutLock++;
        this.metrics.cacheHits++;
      }
      return this.instance;
    }

    if (this.options.enableMetrics) {
      this.metrics.cacheMisses++;
    }

    // Acquire lock
    const release = await this.mutex.acquire();

    try {
      // Second check (with lock) - slow path
      if (this.isValid()) {
        if (this.options.enableMetrics) {
          this.metrics.checksWithLock++;
          this.metrics.cacheHits++;
        }
        return this.instance;
      }

      // Initialize
      if (this.options.enableMetrics) {
        this.metrics.checksWithLock++;
        this.metrics.initializations++;
      }

      this.initializationAttempts++;
      this.instance = await this.initializer();
      this.lastInitializationTime = Date.now();

      return this.instance;
    } finally {
      release();
    }
  }

  /**
   * Check if instance is valid
   */
  isValid() {
    if (this.instance === null) {
      return false;
    }

    // Check cache time
    if (this.options.cacheTime !== null) {
      const age = Date.now() - this.lastInitializationTime;
      if (age > this.options.cacheTime) {
        this.instance = null;
        return false;
      }
    }

    // Check custom validator
    if (this.options.validator) {
      if (!this.options.validator(this.instance)) {
        this.instance = null;
        return false;
      }
    }

    return true;
  }

  /**
   * Force re-initialization
   */
  async reset() {
    const release = await this.mutex.acquire();
    try {
      this.instance = null;
      this.lastInitializationTime = null;
    } finally {
      release();
    }
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      initializationAttempts: this.initializationAttempts,
      lastInitializationTime: this.lastInitializationTime,
      cacheHitRate: this.metrics.cacheHits /
        (this.metrics.cacheHits + this.metrics.cacheMisses) || 0
    };
  }
}

/**
 * Lazy-initialized singleton with double-checked locking
 */
class LazySingleton {
  constructor() {
    this.instances = new Map();
  }

  async getInstance(key, factory) {
    if (!this.instances.has(key)) {
      this.instances.set(key, new DoubleCheckedLock(factory));
    }

    const lock = this.instances.get(key);
    return await lock.getInstance();
  }

  async reset(key) {
    if (this.instances.has(key)) {
      await this.instances.get(key).reset();
    }
  }

  getMetrics(key) {
    if (!this.instances.has(key)) {
      return null;
    }
    return this.instances.get(key).getMetrics();
  }

  getAllMetrics() {
    const metrics = {};
    for (const [key, lock] of this.instances.entries()) {
      metrics[key] = lock.getMetrics();
    }
    return metrics;
  }
}

/**
 * Configuration loader with double-checked locking
 */
class ConfigurationLoader {
  constructor(options = {}) {
    this.configPath = options.configPath || './config.json';
    this.reloadInterval = options.reloadInterval || 60000; // 1 minute
    this.lock = new DoubleCheckedLock(
      () => this.loadConfiguration(),
      {
        cacheTime: this.reloadInterval,
        validator: (config) => config !== null && typeof config === 'object'
      }
    );
  }

  async loadConfiguration() {
    console.log('Loading configuration from', this.configPath);

    // Simulate loading configuration
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      database: {
        host: 'localhost',
        port: 5432,
        name: 'mydb'
      },
      api: {
        endpoint: 'https://api.example.com',
        timeout: 5000
      },
      features: {
        enableCache: true,
        enableMetrics: true
      },
      loadedAt: Date.now()
    };
  }

  async getConfig() {
    return await this.lock.getInstance();
  }

  async reloadConfig() {
    await this.lock.reset();
    return await this.getConfig();
  }

  getMetrics() {
    return this.lock.getMetrics();
  }
}

/**
 * Database connection pool with lazy initialization
 */
class DatabaseConnectionPool {
  constructor(config) {
    this.config = config;
    this.maxConnections = config.maxConnections || 10;
    this.connections = [];
    this.lock = new DoubleCheckedLock(
      () => this.initializePool(),
      {
        validator: (pool) => pool && pool.length > 0
      }
    );
  }

  async initializePool() {
    console.log(`Initializing connection pool (${this.maxConnections} connections)...`);

    const connections = [];
    for (let i = 0; i < this.maxConnections; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      connections.push({
        id: i,
        host: this.config.host,
        port: this.config.port,
        connected: true,
        createdAt: Date.now()
      });
    }

    console.log(`Pool initialized with ${connections.length} connections`);
    return connections;
  }

  async getConnection() {
    const pool = await this.lock.getInstance();

    // Find available connection
    const connection = pool.find(conn => conn.connected);
    if (!connection) {
      throw new Error('No available connections');
    }

    return connection;
  }

  async reset() {
    await this.lock.reset();
  }

  getMetrics() {
    return this.lock.getMetrics();
  }
}

/**
 * Cache manager with lazy initialization
 */
class CacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.ttl = options.ttl || 300000; // 5 minutes

    this.lock = new DoubleCheckedLock(
      () => this.initializeCache(),
      {
        cacheTime: this.ttl,
        validator: (cache) => cache instanceof Map
      }
    );
  }

  async initializeCache() {
    console.log('Initializing cache...');
    await new Promise(resolve => setTimeout(resolve, 200));

    const cache = new Map();

    // Pre-populate with some data
    for (let i = 0; i < 10; i++) {
      cache.set(`key${i}`, {
        value: `value${i}`,
        timestamp: Date.now()
      });
    }

    console.log(`Cache initialized with ${cache.size} entries`);
    return cache;
  }

  async get(key) {
    const cache = await this.lock.getInstance();
    const entry = cache.get(key);

    if (!entry) {
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key, value) {
    const cache = await this.lock.getInstance();

    // Evict if cache is full
    if (cache.size >= this.maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  async clear() {
    await this.lock.reset();
  }

  getMetrics() {
    return this.lock.getMetrics();
  }
}

/**
 * Resource factory with double-checked locking
 */
class ResourceFactory {
  constructor() {
    this.resources = new Map();
    this.locks = new Map();
  }

  async getResource(resourceId, factory, options = {}) {
    // Get or create lock for this resource
    if (!this.locks.has(resourceId)) {
      this.locks.set(resourceId, new DoubleCheckedLock(
        async () => {
          const resource = await factory(resourceId);
          this.resources.set(resourceId, resource);
          return resource;
        },
        options
      ));
    }

    const lock = this.locks.get(resourceId);
    return await lock.getInstance();
  }

  async resetResource(resourceId) {
    if (this.locks.has(resourceId)) {
      await this.locks.get(resourceId).reset();
      this.resources.delete(resourceId);
    }
  }

  getResourceMetrics(resourceId) {
    if (!this.locks.has(resourceId)) {
      return null;
    }
    return this.locks.get(resourceId).getMetrics();
  }

  getAllMetrics() {
    const metrics = {};
    for (const [resourceId, lock] of this.locks.entries()) {
      metrics[resourceId] = lock.getMetrics();
    }
    return metrics;
  }

  getResourceCount() {
    return this.resources.size;
  }
}

// ============================================================================
// COMPREHENSIVE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic Double-Checked Locking
 */
async function example1_BasicDoubleCheckedLocking() {
  console.log('\n=== Example 1: Basic Double-Checked Locking ===\n');

  let initCount = 0;

  const lock = new DoubleCheckedLock(async () => {
    initCount++;
    console.log(`Initializing... (attempt ${initCount})`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: 'Expensive resource', initCount };
  });

  // Multiple concurrent requests
  console.log('Making 10 concurrent requests...');

  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      lock.getInstance().then(instance => {
        console.log(`Request ${i + 1} got instance (init count: ${instance.initCount})`);
        return instance;
      })
    );
  }

  await Promise.all(promises);

  console.log('\nMetrics:', lock.getMetrics());
  console.log('Total initializations:', initCount);
}

/**
 * Example 2: Lazy Singleton Pattern
 */
async function example2_LazySingleton() {
  console.log('\n=== Example 2: Lazy Singleton Pattern ===\n');

  const singleton = new LazySingleton();

  // Factory for database connection
  async function createDatabaseConnection() {
    console.log('Creating database connection...');
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      host: 'localhost',
      port: 5432,
      connected: true,
      createdAt: Date.now()
    };
  }

  // Factory for cache
  async function createCache() {
    console.log('Creating cache...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return new Map([['default', 'value']]);
  }

  // Multiple requests for same resources
  console.log('Requesting database connection multiple times...\n');

  const dbPromises = [];
  for (let i = 0; i < 5; i++) {
    dbPromises.push(
      singleton.getInstance('database', createDatabaseConnection)
        .then(db => console.log(`Request ${i + 1} got database (port: ${db.port})`))
    );
  }

  await Promise.all(dbPromises);

  console.log('\nRequesting cache multiple times...\n');

  const cachePromises = [];
  for (let i = 0; i < 5; i++) {
    cachePromises.push(
      singleton.getInstance('cache', createCache)
        .then(cache => console.log(`Request ${i + 1} got cache (size: ${cache.size})`))
    );
  }

  await Promise.all(cachePromises);

  console.log('\nAll metrics:', singleton.getAllMetrics());
}

/**
 * Example 3: Configuration Loader
 */
async function example3_ConfigurationLoader() {
  console.log('\n=== Example 3: Configuration Loader ===\n');

  const configLoader = new ConfigurationLoader({
    reloadInterval: 3000
  });

  // First load
  console.log('Loading configuration for the first time...');
  const config1 = await configLoader.getConfig();
  console.log('Config loaded:', config1.database.host);

  // Immediate second load (should use cache)
  console.log('\nLoading configuration again (should hit cache)...');
  const config2 = await configLoader.getConfig();
  console.log('Config loaded:', config2.database.host);
  console.log('Same instance?', config1.loadedAt === config2.loadedAt);

  // Multiple concurrent loads
  console.log('\nMultiple concurrent loads...');
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(configLoader.getConfig());
  }
  await Promise.all(promises);

  console.log('\nMetrics:', configLoader.getMetrics());

  // Force reload
  console.log('\nForcing configuration reload...');
  const config3 = await configLoader.reloadConfig();
  console.log('Config reloaded:', config3.database.host);
  console.log('Different instance?', config1.loadedAt !== config3.loadedAt);
}

/**
 * Example 4: Database Connection Pool
 */
async function example4_DatabaseConnectionPool() {
  console.log('\n=== Example 4: Database Connection Pool ===\n');

  const pool = new DatabaseConnectionPool({
    host: 'localhost',
    port: 5432,
    maxConnections: 5
  });

  // Multiple concurrent connection requests
  console.log('Requesting connections concurrently...\n');

  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      pool.getConnection().then(conn => {
        console.log(`Request ${i + 1} got connection ${conn.id}`);
        return conn;
      })
    );
  }

  await Promise.all(promises);

  console.log('\nPool metrics:', pool.getMetrics());
}

/**
 * Example 5: Cache Manager
 */
async function example5_CacheManager() {
  console.log('\n=== Example 5: Cache Manager ===\n');

  const cacheManager = new CacheManager({
    maxSize: 100,
    ttl: 5000
  });

  // Multiple operations triggering lazy initialization
  console.log('Performing cache operations...\n');

  const operations = [
    cacheManager.get('key1'),
    cacheManager.set('key1', 'value1'),
    cacheManager.get('key2'),
    cacheManager.set('key2', 'value2'),
    cacheManager.get('key1')
  ];

  const results = await Promise.all(operations);
  console.log('Operation results:', results);

  // More gets (should hit initialized cache)
  console.log('\nPerforming more operations...');
  const value1 = await cacheManager.get('key1');
  const value2 = await cacheManager.get('key2');
  console.log('Retrieved values:', { value1, value2 });

  console.log('\nCache metrics:', cacheManager.getMetrics());
}

/**
 * Example 6: Resource Factory
 */
async function example6_ResourceFactory() {
  console.log('\n=== Example 6: Resource Factory ===\n');

  const factory = new ResourceFactory();

  // Factory function for creating resources
  async function createResource(id) {
    console.log(`Creating resource: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id,
      type: 'expensive-resource',
      data: `Data for ${id}`,
      createdAt: Date.now()
    };
  }

  // Request multiple resources concurrently
  console.log('Requesting resources...\n');

  const promises = [];

  // Multiple requests for resource-A
  for (let i = 0; i < 3; i++) {
    promises.push(
      factory.getResource('resource-A', createResource)
        .then(res => console.log(`Request ${i + 1} got ${res.id}`))
    );
  }

  // Multiple requests for resource-B
  for (let i = 0; i < 3; i++) {
    promises.push(
      factory.getResource('resource-B', createResource)
        .then(res => console.log(`Request ${i + 4} got ${res.id}`))
    );
  }

  await Promise.all(promises);

  console.log('\nAll resource metrics:', factory.getAllMetrics());
  console.log('Total resources created:', factory.getResourceCount());
}

/**
 * Example 7: Performance Comparison
 */
async function example7_PerformanceComparison() {
  console.log('\n=== Example 7: Performance Comparison ===\n');

  // Expensive initialization
  async function expensiveInit() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: 'expensive' };
  }

  // Test without double-checked locking
  console.log('Without double-checked locking:');
  const start1 = Date.now();
  const mutex1 = new Mutex();
  let instance1 = null;

  const promises1 = [];
  for (let i = 0; i < 10; i++) {
    promises1.push(
      (async () => {
        const release = await mutex1.acquire();
        try {
          if (!instance1) {
            instance1 = await expensiveInit();
          }
          return instance1;
        } finally {
          release();
        }
      })()
    );
  }

  await Promise.all(promises1);
  const time1 = Date.now() - start1;
  console.log(`Time taken: ${time1}ms`);

  // Test with double-checked locking
  console.log('\nWith double-checked locking:');
  const start2 = Date.now();
  const lock = new DoubleCheckedLock(expensiveInit);

  const promises2 = [];
  for (let i = 0; i < 10; i++) {
    promises2.push(lock.getInstance());
  }

  await Promise.all(promises2);
  const time2 = Date.now() - start2;
  console.log(`Time taken: ${time2}ms`);

  console.log('\nMetrics:', lock.getMetrics());
  console.log(`Improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);
}

/**
 * Main execution
 */
async function demonstrateDoubleCheckedLocking() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Double-Checked Locking Pattern - Comprehensive Examples  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await example1_BasicDoubleCheckedLocking();
  await example2_LazySingleton();
  await example3_ConfigurationLoader();
  await example4_DatabaseConnectionPool();
  await example5_CacheManager();
  await example6_ResourceFactory();
  await example7_PerformanceComparison();

  console.log('\n✓ All Double-Checked Locking pattern examples completed successfully!');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DoubleCheckedLock,
    Mutex,
    LazySingleton,
    ConfigurationLoader,
    DatabaseConnectionPool,
    CacheManager,
    ResourceFactory,
    demonstrateDoubleCheckedLocking
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  demonstrateDoubleCheckedLocking().catch(console.error);
}
