/**
 * Improper Instantiation Anti-Pattern
 *
 * PROBLEM:
 * Creating expensive objects repeatedly instead of reusing them. This causes
 * unnecessary memory allocation, garbage collection pressure, and connection
 * pool exhaustion.
 *
 * SYMPTOMS:
 * - Creating database connections in each request
 * - Instantiating heavy objects in loops
 * - Not reusing HTTP clients
 * - Creating new instances when singletons would suffice
 * - Memory leaks and excessive GC
 *
 * SOLUTION:
 * Use connection pooling, singleton pattern, object pooling, and factory
 * pattern for expensive objects.
 */

// ============================================================================
// SIMULATED EXPENSIVE RESOURCES
// ============================================================================

class DatabaseConnection {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.connected = false;
    this.queries = 0;
    this.createdAt = Date.now();
    this.id = Math.random().toString(36).substr(2, 9);
  }

  async connect() {
    // Simulating expensive connection setup
    await new Promise(resolve => setTimeout(resolve, 100));
    this.connected = true;
    console.log(`  [DB-${this.id}] Connection established (took 100ms)`);
  }

  async query(sql) {
    if (!this.connected) {
      throw new Error('Connection not established');
    }
    this.queries++;
    await new Promise(resolve => setTimeout(resolve, 10));
    return { success: true, data: [] };
  }

  async disconnect() {
    this.connected = false;
    console.log(`  [DB-${this.id}] Connection closed (${this.queries} queries executed)`);
  }
}

class HttpClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.requestCount = 0;
    this.id = Math.random().toString(36).substr(2, 9);
    console.log(`  [HTTP-${this.id}] Client created for ${baseUrl}`);
  }

  async request(path) {
    this.requestCount++;
    await new Promise(resolve => setTimeout(resolve, 50));
    return { status: 200, data: {} };
  }

  getStats() {
    return {
      id: this.id,
      baseUrl: this.baseUrl,
      requestCount: this.requestCount
    };
  }
}

// ============================================================================
// ANTI-PATTERN: Improper Instantiation
// ============================================================================

class ImproperInstantiationService {
  constructor() {
    this.connectionString = 'mongodb://localhost:27017/mydb';
    this.apiUrl = 'https://api.example.com';
    this.connectionsCreated = 0;
    this.clientsCreated = 0;
  }

  // PROBLEM: Creating new connection for each query
  async getUserById(userId) {
    console.log(`[ANTI-PATTERN] Getting user ${userId}`);

    // PROBLEM: New connection every time
    const connection = new DatabaseConnection(this.connectionString);
    this.connectionsCreated++;

    await connection.connect();
    const result = await connection.query(`SELECT * FROM users WHERE id = ${userId}`);
    await connection.disconnect();

    console.log('PROBLEM: Created and destroyed connection for single query!\n');
    return result;
  }

  // PROBLEM: Creating HTTP client in loop
  async fetchMultipleResources(resourceIds) {
    console.log('[ANTI-PATTERN] Fetching multiple resources');

    const results = [];
    for (const id of resourceIds) {
      // PROBLEM: New HTTP client for each request
      const client = new HttpClient(this.apiUrl);
      this.clientsCreated++;

      const result = await client.request(`/resources/${id}`);
      results.push(result);
    }

    console.log(`PROBLEM: Created ${this.clientsCreated} HTTP clients for ${resourceIds.length} requests!\n`);
    return results;
  }

  // PROBLEM: Creating expensive objects repeatedly
  async processOrders(orders) {
    console.log('[ANTI-PATTERN] Processing orders');

    for (const order of orders) {
      // PROBLEM: New connection for each order
      const connection = new DatabaseConnection(this.connectionString);
      this.connectionsCreated++;

      await connection.connect();
      await connection.query(`INSERT INTO orders VALUES (${order.id})`);
      await connection.disconnect();
    }

    console.log(`PROBLEM: Created ${orders.length} connections for ${orders.length} orders!\n`);
  }

  getStats() {
    return {
      connectionsCreated: this.connectionsCreated,
      clientsCreated: this.clientsCreated
    };
  }
}

// ============================================================================
// SOLUTION 1: Connection Pool
// ============================================================================

class ConnectionPool {
  constructor(connectionString, poolSize = 5) {
    this.connectionString = connectionString;
    this.poolSize = poolSize;
    this.pool = [];
    this.available = [];
    this.inUse = new Set();
    this.waitQueue = [];
  }

  async initialize() {
    console.log(`[POOL] Initializing connection pool (size: ${this.poolSize})`);

    for (let i = 0; i < this.poolSize; i++) {
      const connection = new DatabaseConnection(this.connectionString);
      await connection.connect();
      this.pool.push(connection);
      this.available.push(connection);
    }

    console.log(`[POOL] Pool initialized with ${this.pool.length} connections\n`);
  }

  async acquire() {
    if (this.available.length > 0) {
      const connection = this.available.pop();
      this.inUse.add(connection);
      return connection;
    }

    // Wait for available connection
    return new Promise((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(connection) {
    this.inUse.delete(connection);

    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift();
      this.inUse.add(connection);
      resolve(connection);
    } else {
      this.available.push(connection);
    }
  }

  async close() {
    for (const connection of this.pool) {
      await connection.disconnect();
    }
    this.pool = [];
    this.available = [];
    this.inUse.clear();
  }

  getStats() {
    return {
      poolSize: this.poolSize,
      available: this.available.length,
      inUse: this.inUse.size,
      waiting: this.waitQueue.length
    };
  }
}

class PooledService {
  constructor(pool) {
    this.pool = pool;
  }

  async getUserById(userId) {
    console.log(`[POOLED] Getting user ${userId}`);

    // SOLUTION: Reuse connection from pool
    const connection = await this.pool.acquire();

    try {
      const result = await connection.query(`SELECT * FROM users WHERE id = ${userId}`);
      console.log('SUCCESS: Reused pooled connection!\n');
      return result;
    } finally {
      this.pool.release(connection);
    }
  }

  async processOrders(orders) {
    console.log('[POOLED] Processing orders');

    // SOLUTION: Reuse connection for all orders
    const connection = await this.pool.acquire();

    try {
      for (const order of orders) {
        await connection.query(`INSERT INTO orders VALUES (${order.id})`);
      }
      console.log(`SUCCESS: Used single pooled connection for ${orders.length} orders!\n`);
    } finally {
      this.pool.release(connection);
    }
  }
}

// ============================================================================
// SOLUTION 2: Singleton Pattern for HTTP Client
// ============================================================================

class HttpClientSingleton {
  constructor() {
    this.clients = new Map();
  }

  getClient(baseUrl) {
    if (!this.clients.has(baseUrl)) {
      console.log(`[SINGLETON] Creating new HTTP client for ${baseUrl}`);
      this.clients.set(baseUrl, new HttpClient(baseUrl));
    }
    return this.clients.get(baseUrl);
  }

  getStats() {
    const stats = {};
    this.clients.forEach((client, url) => {
      stats[url] = client.getStats();
    });
    return stats;
  }
}

class SingletonService {
  constructor() {
    this.httpClients = new HttpClientSingleton();
    this.apiUrl = 'https://api.example.com';
  }

  async fetchMultipleResources(resourceIds) {
    console.log('[SINGLETON] Fetching multiple resources');

    // SOLUTION: Reuse same HTTP client
    const client = this.httpClients.getClient(this.apiUrl);

    const results = [];
    for (const id of resourceIds) {
      const result = await client.request(`/resources/${id}`);
      results.push(result);
    }

    console.log(`SUCCESS: Reused single HTTP client for ${resourceIds.length} requests!\n`);
    return results;
  }
}

// ============================================================================
// SOLUTION 3: Object Pool Pattern
// ============================================================================

class ObjectPool {
  constructor(factory, resetFn, initialSize = 5) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.available = [];
    this.inUse = new Set();

    // Pre-create objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }

    console.log(`[OBJECT-POOL] Initialized with ${initialSize} objects\n`);
  }

  acquire() {
    let obj;

    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      // Create new if pool exhausted
      obj = this.factory();
      console.log('  [OBJECT-POOL] Pool exhausted, created new object');
    }

    this.inUse.add(obj);
    return obj;
  }

  release(obj) {
    if (!this.inUse.has(obj)) {
      throw new Error('Object not acquired from this pool');
    }

    this.inUse.delete(obj);
    this.resetFn(obj);
    this.available.push(obj);
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}

// Example: Buffer pool for processing
class DataProcessor {
  constructor() {
    this.data = new Array(1000);
    this.processed = false;
  }

  process(input) {
    // Heavy processing
    this.data.fill(input);
    this.processed = true;
    return this.data.length;
  }

  reset() {
    this.data.fill(0);
    this.processed = false;
  }
}

class BufferPoolService {
  constructor() {
    this.pool = new ObjectPool(
      () => new DataProcessor(),
      (processor) => processor.reset(),
      3
    );
  }

  async processItems(items) {
    console.log('[BUFFER-POOL] Processing items');

    const results = [];

    for (const item of items) {
      const processor = this.pool.acquire();
      const result = processor.process(item);
      results.push(result);
      this.pool.release(processor);
    }

    console.log(`SUCCESS: Reused pooled processors for ${items.length} items!\n`);
    return results;
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

async function demonstrateImproperInstantiation() {
  console.log('='.repeat(80));
  console.log('IMPROPER INSTANTIATION ANTI-PATTERN DEMONSTRATION');
  console.log('='.repeat(80));

  console.log('\n--- ANTI-PATTERN: Creating Objects Repeatedly ---\n');
  const improperService = new ImproperInstantiationService();

  const startTime = Date.now();

  await improperService.getUserById(1);
  await improperService.getUserById(2);
  await improperService.fetchMultipleResources([1, 2, 3, 4, 5]);
  await improperService.processOrders([
    { id: 1 }, { id: 2 }, { id: 3 }
  ]);

  const improperTime = Date.now() - startTime;
  const improperStats = improperService.getStats();

  console.log('Anti-Pattern Statistics:');
  console.log(`  Time: ${improperTime}ms`);
  console.log(`  Database connections created: ${improperStats.connectionsCreated}`);
  console.log(`  HTTP clients created: ${improperStats.clientsCreated}`);
  console.log('  PROBLEM: Excessive object creation!\n');

  console.log('\n--- SOLUTION 1: Connection Pooling ---\n');
  const pool = new ConnectionPool('mongodb://localhost:27017/mydb', 3);
  await pool.initialize();

  const pooledService = new PooledService(pool);

  const poolStartTime = Date.now();

  await pooledService.getUserById(1);
  await pooledService.getUserById(2);
  await pooledService.processOrders([
    { id: 1 }, { id: 2 }, { id: 3 }
  ]);

  const poolTime = Date.now() - poolStartTime;
  const poolStats = pool.getStats();

  console.log('Connection Pool Statistics:');
  console.log(`  Time: ${poolTime}ms`);
  console.log(`  Pool size: ${poolStats.poolSize}`);
  console.log(`  Available: ${poolStats.available}`);
  console.log(`  In use: ${poolStats.inUse}`);
  console.log('  SUCCESS: Reused connections efficiently!\n');

  await pool.close();

  console.log('\n--- SOLUTION 2: Singleton Pattern ---\n');
  const singletonService = new SingletonService();

  await singletonService.fetchMultipleResources([1, 2, 3, 4, 5]);

  const singletonStats = singletonService.httpClients.getStats();
  console.log('Singleton Statistics:');
  console.log(`  HTTP clients created: ${Object.keys(singletonStats).length}`);
  console.log('  SUCCESS: Reused single client!\n');

  console.log('\n--- SOLUTION 3: Object Pool ---\n');
  const bufferService = new BufferPoolService();

  await bufferService.processItems([1, 2, 3, 4, 5, 6, 7, 8]);

  const bufferStats = bufferService.pool.getStats();
  console.log('Object Pool Statistics:');
  console.log(`  Total objects: ${bufferStats.total}`);
  console.log(`  Available: ${bufferStats.available}`);
  console.log('  SUCCESS: Reused buffer objects!\n');

  console.log('='.repeat(80));
  console.log('KEY TAKEAWAYS:');
  console.log('='.repeat(80));
  console.log('1. Use connection pools for database connections');
  console.log('2. Reuse HTTP clients with singleton pattern');
  console.log('3. Implement object pooling for expensive objects');
  console.log('4. Avoid creating objects in loops');
  console.log('5. Consider factory pattern for controlled instantiation');
  console.log('6. Monitor object creation in production');
  console.log('7. Be mindful of garbage collection pressure');
  console.log('='.repeat(80));
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  DatabaseConnection,
  HttpClient,
  ImproperInstantiationService,
  ConnectionPool,
  PooledService,
  HttpClientSingleton,
  SingletonService,
  ObjectPool,
  BufferPoolService,
  demonstrateImproperInstantiation
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateImproperInstantiation().catch(console.error);
}
