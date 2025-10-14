/**
 * Monolithic Persistence Anti-Pattern
 *
 * PROBLEM:
 * Using a single database for all data types regardless of their characteristics
 * and access patterns. Different data types have different requirements (relational,
 * document, key-value, time-series, etc.), and forcing them into one database
 * leads to poor performance and scalability issues.
 *
 * SYMPTOMS:
 * - Complex joins for simple lookups
 * - Storing JSON blobs in relational databases
 * - Poor query performance for diverse data types
 * - Difficulty scaling specific data types
 * - Inappropriate data modeling
 *
 * SOLUTION:
 * Use polyglot persistence - choose the right database for each data type
 * (Polyglot Persistence Pattern).
 */

// ============================================================================
// SIMULATED SINGLE DATABASE (Relational)
// ============================================================================

class MonolithicDatabase {
  constructor() {
    this.users = new Map([
      [1, { id: 1, name: 'Alice', email: 'alice@example.com', profile: '{"bio":"Developer","skills":["JS","Node"]}' }],
      [2, { id: 2, name: 'Bob', email: 'bob@example.com', profile: '{"bio":"Designer","skills":["UI","UX"]}' }],
    ]);

    this.sessions = new Map([
      ['sess_1', { sessionId: 'sess_1', userId: 1, data: '{"lastAccess":1234567890}', expiresAt: Date.now() + 3600000 }],
      ['sess_2', { sessionId: 'sess_2', userId: 2, data: '{"lastAccess":1234567891}', expiresAt: Date.now() + 3600000 }],
    ]);

    this.metrics = new Map();
    this.metricCounter = 0;

    this.products = new Map([
      [1, { id: 1, name: 'Widget', searchText: 'widget tool gadget', tags: 'electronics,tool,gadget' }],
      [2, { id: 2, name: 'Gadget', searchText: 'gadget device electronic', tags: 'electronics,device' }],
    ]);

    this.queryCount = 0;
  }

  async findUser(id) {
    this.queryCount++;
    await this.simulateLatency(20);
    const user = this.users.get(id);
    if (user) {
      user.profile = JSON.parse(user.profile); // PROBLEM: Parse JSON blob
    }
    return user;
  }

  async findSession(sessionId) {
    this.queryCount++;
    await this.simulateLatency(20);
    const session = this.sessions.get(sessionId);
    if (session) {
      session.data = JSON.parse(session.data); // PROBLEM: Parse JSON blob
    }
    return session;
  }

  async storeMetric(metric) {
    this.queryCount++;
    await this.simulateLatency(30);
    // PROBLEM: Storing time-series data in relational table
    this.metrics.set(this.metricCounter++, {
      timestamp: metric.timestamp,
      metricName: metric.name,
      value: metric.value,
      tags: JSON.stringify(metric.tags) // PROBLEM: JSON in relational DB
    });
  }

  async queryMetrics(metricName, startTime, endTime) {
    this.queryCount++;
    await this.simulateLatency(100); // PROBLEM: Slow for time-series queries
    const results = [];
    this.metrics.forEach(metric => {
      if (metric.metricName === metricName &&
          metric.timestamp >= startTime &&
          metric.timestamp <= endTime) {
        results.push(metric);
      }
    });
    return results;
  }

  async searchProducts(query) {
    this.queryCount++;
    await this.simulateLatency(150); // PROBLEM: Slow full-text search
    const results = [];
    this.products.forEach(product => {
      // PROBLEM: Poor full-text search in relational DB
      if (product.searchText.includes(query.toLowerCase())) {
        results.push(product);
      }
    });
    return results;
  }

  async simulateLatency(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return { queryCount: this.queryCount };
  }
}

// ============================================================================
// ANTI-PATTERN: Monolithic Persistence Service
// ============================================================================

class MonolithicPersistenceService {
  constructor(database) {
    this.db = database;
  }

  async getUser(userId) {
    console.log('[ANTI-PATTERN] Fetching user from relational DB');
    const user = await this.db.findUser(userId);
    console.log('PROBLEM: Parsing JSON from relational database!\n');
    return user;
  }

  async getSession(sessionId) {
    console.log('[ANTI-PATTERN] Fetching session from relational DB');
    const session = await this.db.findSession(sessionId);
    console.log('PROBLEM: Using relational DB for temporary session data!\n');
    return session;
  }

  async recordMetrics(metrics) {
    console.log('[ANTI-PATTERN] Storing time-series metrics in relational DB');
    for (const metric of metrics) {
      await this.db.storeMetric(metric);
    }
    console.log('PROBLEM: Relational DB not optimized for time-series data!\n');
  }

  async analyzeMetrics(metricName, startTime, endTime) {
    console.log('[ANTI-PATTERN] Querying time-series from relational DB');
    const metrics = await this.db.queryMetrics(metricName, startTime, endTime);
    console.log('PROBLEM: Slow time-series queries in relational DB!\n');
    return metrics;
  }

  async searchProducts(query) {
    console.log('[ANTI-PATTERN] Full-text search in relational DB');
    const results = await this.db.searchProducts(query);
    console.log('PROBLEM: Poor full-text search performance!\n');
    return results;
  }
}

// ============================================================================
// SOLUTION: Polyglot Persistence with Multiple Databases
// ============================================================================

// Document Database for user profiles
class DocumentDatabase {
  constructor() {
    this.collections = new Map();
    this.collections.set('users', new Map([
      [1, { id: 1, name: 'Alice', email: 'alice@example.com', profile: { bio: 'Developer', skills: ['JS', 'Node'] } }],
      [2, { id: 2, name: 'Bob', email: 'bob@example.com', profile: { bio: 'Designer', skills: ['UI', 'UX'] } }],
    ]));
    this.queryCount = 0;
  }

  async findOne(collection, query) {
    this.queryCount++;
    await this.simulateLatency(10);
    const coll = this.collections.get(collection);
    return coll ? coll.get(query.id) : null;
  }

  async simulateLatency(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return { queryCount: this.queryCount };
  }
}

// Key-Value Store for sessions
class KeyValueStore {
  constructor() {
    this.store = new Map();
    this.queryCount = 0;
  }

  async get(key) {
    this.queryCount++;
    await this.simulateLatency(5); // Very fast lookups
    return this.store.get(key);
  }

  async set(key, value, ttl = 3600) {
    this.queryCount++;
    await this.simulateLatency(5);
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttl * 1000)
    });
  }

  async delete(key) {
    this.queryCount++;
    return this.store.delete(key);
  }

  async simulateLatency(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return { queryCount: this.queryCount };
  }
}

// Time-Series Database for metrics
class TimeSeriesDatabase {
  constructor() {
    this.series = new Map();
    this.queryCount = 0;
  }

  async write(metricName, dataPoints) {
    this.queryCount++;
    await this.simulateLatency(15);

    if (!this.series.has(metricName)) {
      this.series.set(metricName, []);
    }

    const series = this.series.get(metricName);
    series.push(...dataPoints);

    // Keep sorted by timestamp
    series.sort((a, b) => a.timestamp - b.timestamp);
  }

  async query(metricName, startTime, endTime) {
    this.queryCount++;
    await this.simulateLatency(20); // Fast time-range queries

    const series = this.series.get(metricName) || [];
    return series.filter(point =>
      point.timestamp >= startTime && point.timestamp <= endTime
    );
  }

  async aggregate(metricName, startTime, endTime, aggregation) {
    const data = await this.query(metricName, startTime, endTime);

    if (aggregation === 'avg') {
      const sum = data.reduce((acc, point) => acc + point.value, 0);
      return sum / data.length || 0;
    } else if (aggregation === 'max') {
      return Math.max(...data.map(point => point.value));
    }

    return data;
  }

  async simulateLatency(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return { queryCount: this.queryCount };
  }
}

// Search Engine for full-text search
class SearchEngine {
  constructor() {
    this.indices = new Map();
    this.queryCount = 0;

    // Pre-index products
    this.indices.set('products', [
      { id: 1, name: 'Widget', tags: ['electronics', 'tool', 'gadget'], score: 0 },
      { id: 2, name: 'Gadget', tags: ['electronics', 'device'], score: 0 },
    ]);
  }

  async search(index, query) {
    this.queryCount++;
    await this.simulateLatency(25);

    const docs = this.indices.get(index) || [];
    const lowerQuery = query.toLowerCase();

    // Calculate relevance scores
    const results = docs.map(doc => {
      let score = 0;

      if (doc.name.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }

      doc.tags.forEach(tag => {
        if (tag.includes(lowerQuery)) {
          score += 5;
        }
      });

      return { ...doc, score };
    }).filter(doc => doc.score > 0)
      .sort((a, b) => b.score - a.score);

    return results;
  }

  async simulateLatency(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return { queryCount: this.queryCount };
  }
}

// ============================================================================
// SOLUTION: Polyglot Persistence Service
// ============================================================================

class PolyglotPersistenceService {
  constructor(documentDb, kvStore, timeSeriesDb, searchEngine) {
    this.documentDb = documentDb;
    this.kvStore = kvStore;
    this.timeSeriesDb = timeSeriesDb;
    this.searchEngine = searchEngine;
  }

  async getUser(userId) {
    console.log('[POLYGLOT] Fetching user from Document DB');
    const user = await this.documentDb.findOne('users', { id: userId });
    console.log('SUCCESS: Native document storage, no JSON parsing needed!\n');
    return user;
  }

  async getSession(sessionId) {
    console.log('[POLYGLOT] Fetching session from Key-Value Store');
    const sessionData = await this.kvStore.get(sessionId);
    console.log('SUCCESS: Fast key-value lookup for session data!\n');
    return sessionData;
  }

  async setSession(sessionId, data, ttl = 3600) {
    console.log('[POLYGLOT] Storing session in Key-Value Store');
    await this.kvStore.set(sessionId, data, ttl);
    console.log('SUCCESS: Session stored with automatic TTL!\n');
  }

  async recordMetrics(metrics) {
    console.log('[POLYGLOT] Storing metrics in Time-Series DB');

    // Group by metric name
    const grouped = {};
    metrics.forEach(metric => {
      if (!grouped[metric.name]) {
        grouped[metric.name] = [];
      }
      grouped[metric.name].push({
        timestamp: metric.timestamp,
        value: metric.value,
        tags: metric.tags
      });
    });

    // Write to time-series DB
    for (const [metricName, dataPoints] of Object.entries(grouped)) {
      await this.timeSeriesDb.write(metricName, dataPoints);
    }

    console.log('SUCCESS: Optimized for time-series writes!\n');
  }

  async analyzeMetrics(metricName, startTime, endTime) {
    console.log('[POLYGLOT] Querying metrics from Time-Series DB');
    const metrics = await this.timeSeriesDb.query(metricName, startTime, endTime);
    const avg = await this.timeSeriesDb.aggregate(metricName, startTime, endTime, 'avg');
    console.log('SUCCESS: Fast time-range queries and aggregations!\n');
    return { metrics, average: avg };
  }

  async searchProducts(query) {
    console.log('[POLYGLOT] Searching products in Search Engine');
    const results = await this.searchEngine.search('products', query);
    console.log('SUCCESS: Fast full-text search with relevance scoring!\n');
    return results;
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

async function demonstrateMonolithicPersistence() {
  console.log('='.repeat(80));
  console.log('MONOLITHIC PERSISTENCE ANTI-PATTERN DEMONSTRATION');
  console.log('='.repeat(80));

  console.log('\n--- ANTI-PATTERN: Single Database for Everything ---\n');
  const monolithicDb = new MonolithicDatabase();
  const monolithicService = new MonolithicPersistenceService(monolithicDb);

  const startTime = Date.now();

  await monolithicService.getUser(1);
  await monolithicService.getSession('sess_1');

  const metrics = [
    { name: 'cpu_usage', value: 45.5, timestamp: Date.now() - 5000, tags: { host: 'server1' } },
    { name: 'cpu_usage', value: 52.3, timestamp: Date.now() - 4000, tags: { host: 'server1' } },
    { name: 'cpu_usage', value: 48.9, timestamp: Date.now() - 3000, tags: { host: 'server1' } },
  ];
  await monolithicService.recordMetrics(metrics);
  await monolithicService.analyzeMetrics('cpu_usage', Date.now() - 10000, Date.now());
  await monolithicService.searchProducts('gadget');

  const monolithicTime = Date.now() - startTime;
  const monolithicStats = monolithicDb.getStats();

  console.log('Monolithic Statistics:');
  console.log(`  Total Time: ${monolithicTime}ms`);
  console.log(`  Total Queries: ${monolithicStats.queryCount}`);
  console.log('  PROBLEM: One size does NOT fit all!\n');

  console.log('\n--- SOLUTION: Polyglot Persistence ---\n');
  const documentDb = new DocumentDatabase();
  const kvStore = new KeyValueStore();
  const timeSeriesDb = new TimeSeriesDatabase();
  const searchEngine = new SearchEngine();

  const polyglotService = new PolyglotPersistenceService(
    documentDb,
    kvStore,
    timeSeriesDb,
    searchEngine
  );

  const polyglotStartTime = Date.now();

  await polyglotService.getUser(1);
  await polyglotService.getSession('sess_1');
  await polyglotService.recordMetrics(metrics);
  await polyglotService.analyzeMetrics('cpu_usage', Date.now() - 10000, Date.now());
  await polyglotService.searchProducts('gadget');

  const polyglotTime = Date.now() - polyglotStartTime;

  console.log('Polyglot Statistics:');
  console.log(`  Total Time: ${polyglotTime}ms`);
  console.log(`  Document DB queries: ${documentDb.getStats().queryCount}`);
  console.log(`  KV Store queries: ${kvStore.getStats().queryCount}`);
  console.log(`  Time-Series DB queries: ${timeSeriesDb.getStats().queryCount}`);
  console.log(`  Search Engine queries: ${searchEngine.getStats().queryCount}`);
  console.log(`  SUCCESS: ${((1 - polyglotTime / monolithicTime) * 100).toFixed(1)}% faster!\n`);

  console.log('='.repeat(80));
  console.log('KEY TAKEAWAYS:');
  console.log('='.repeat(80));
  console.log('1. Use Document DB (MongoDB) for flexible, nested documents');
  console.log('2. Use Key-Value Store (Redis) for sessions and caching');
  console.log('3. Use Time-Series DB (InfluxDB) for metrics and logs');
  console.log('4. Use Search Engine (Elasticsearch) for full-text search');
  console.log('5. Use Relational DB (PostgreSQL) for transactional data');
  console.log('6. Choose the right tool for the job (Polyglot Persistence)');
  console.log('7. Different data types have different access patterns');
  console.log('='.repeat(80));
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  MonolithicDatabase,
  MonolithicPersistenceService,
  DocumentDatabase,
  KeyValueStore,
  TimeSeriesDatabase,
  SearchEngine,
  PolyglotPersistenceService,
  demonstrateMonolithicPersistence
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateMonolithicPersistence().catch(console.error);
}
