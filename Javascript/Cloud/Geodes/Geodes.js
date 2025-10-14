/**
 * Geodes Pattern
 *
 * Deploys backend services into a set of "geodes" - geographical units that act as
 * deployment targets. Each geode contains a complete set of services and can serve
 * requests independently. Data is replicated across geodes for local access.
 *
 * Benefits:
 * - Low latency: Users connect to nearest geode
 * - High availability: Multiple geodes provide redundancy
 * - Data sovereignty: Data can be kept in specific regions
 * - Disaster recovery: Geodes can failover to each other
 *
 * Use Cases:
 * - Global applications with strict latency requirements
 * - Applications with data residency requirements
 * - Mission-critical systems requiring high availability
 * - Content delivery networks
 */

class DataStore {
  constructor(geodeId, region) {
    this.geodeId = geodeId;
    this.region = region;
    this.data = new Map();
    this.replicationLog = [];
    this.statistics = {
      reads: 0,
      writes: 0,
      replications: 0
    };
  }

  async write(key, value, metadata = {}) {
    this.data.set(key, {
      value: value,
      version: Date.now(),
      geodeId: this.geodeId,
      metadata: metadata
    });

    this.statistics.writes++;

    const replicationEntry = {
      operation: 'write',
      key: key,
      value: value,
      timestamp: Date.now(),
      sourceGeode: this.geodeId
    };

    this.replicationLog.push(replicationEntry);
    console.log(`[DataStore:${this.geodeId}] Write: ${key}`);

    return replicationEntry;
  }

  async read(key) {
    this.statistics.reads++;
    const entry = this.data.get(key);

    if (entry) {
      console.log(`[DataStore:${this.geodeId}] Read: ${key} (local)`);
    } else {
      console.log(`[DataStore:${this.geodeId}] Read: ${key} (miss)`);
    }

    return entry;
  }

  async replicate(replicationEntry) {
    const existing = this.data.get(replicationEntry.key);

    if (!existing || existing.version < replicationEntry.timestamp) {
      this.data.set(replicationEntry.key, {
        value: replicationEntry.value,
        version: replicationEntry.timestamp,
        geodeId: replicationEntry.sourceGeode,
        replicated: true
      });

      this.statistics.replications++;
      console.log(`[DataStore:${this.geodeId}] Replicated: ${replicationEntry.key} from ${replicationEntry.sourceGeode}`);
      return true;
    }

    return false;
  }

  getStatistics() {
    return {
      ...this.statistics,
      dataSize: this.data.size,
      replicationLogSize: this.replicationLog.length
    };
  }
}

class Geode {
  constructor(id, config = {}) {
    this.id = id;
    this.config = {
      region: config.region || 'us-east-1',
      capacity: config.capacity || 1000,
      replicationStrategy: config.replicationStrategy || 'async',
      ...config
    };

    this.dataStore = new DataStore(this.id, this.config.region);
    this.services = new Map();
    this.connectedGeodes = new Map();
    this.healthStatus = 'healthy';
    this.metrics = {
      requestCount: 0,
      latency: [],
      errors: 0
    };
  }

  async deploy(serviceDefinitions) {
    console.log(`[Geode:${this.id}] Deploying services in ${this.config.region}...`);

    for (const [name, definition] of Object.entries(serviceDefinitions)) {
      this.services.set(name, {
        name: name,
        version: definition.version,
        status: 'running',
        handler: definition.handler
      });
      console.log(`[Geode:${this.id}]   Deployed service: ${name}`);
    }

    console.log(`[Geode:${this.id}] Deployment complete`);
  }

  connectGeode(geode) {
    this.connectedGeodes.set(geode.id, geode);
    console.log(`[Geode:${this.id}] Connected to geode: ${geode.id} (${geode.config.region})`);
  }

  async handleRequest(request) {
    this.metrics.requestCount++;
    const startTime = Date.now();

    const service = this.services.get(request.service);
    if (!service) {
      this.metrics.errors++;
      throw new Error(`Service ${request.service} not found in geode ${this.id}`);
    }

    let result;
    if (request.operation === 'read') {
      result = await this.dataStore.read(request.key);
    } else if (request.operation === 'write') {
      const replicationEntry = await this.dataStore.write(request.key, request.value, request.metadata);

      if (this.config.replicationStrategy === 'sync') {
        await this.replicateToAll(replicationEntry);
      } else {
        this.replicateToAll(replicationEntry);
      }

      result = { success: true, replicated: true };
    } else {
      result = await service.handler(request);
    }

    const latency = Date.now() - startTime;
    this.metrics.latency.push(latency);

    if (this.metrics.latency.length > 100) {
      this.metrics.latency.shift();
    }

    return {
      success: true,
      geodeId: this.id,
      region: this.config.region,
      latency: latency,
      result: result
    };
  }

  async replicateToAll(replicationEntry) {
    const replicationPromises = [];

    for (const [geodeId, geode] of this.connectedGeodes) {
      replicationPromises.push(
        geode.dataStore.replicate(replicationEntry)
          .catch(error => {
            console.error(`[Geode:${this.id}] Replication failed to ${geodeId}:`, error.message);
          })
      );
    }

    await Promise.allSettled(replicationPromises);
  }

  getMetrics() {
    const avgLatency = this.metrics.latency.length > 0
      ? this.metrics.latency.reduce((a, b) => a + b, 0) / this.metrics.latency.length
      : 0;

    return {
      ...this.metrics,
      averageLatency: Math.round(avgLatency),
      dataStore: this.dataStore.getStatistics(),
      connectedGeodes: this.connectedGeodes.size,
      healthStatus: this.healthStatus
    };
  }
}

class GeodeRouter {
  constructor() {
    this.geodes = new Map();
    this.latencyMatrix = new Map();
    this.statistics = {
      totalRequests: 0,
      routedRequests: 0,
      failovers: 0
    };
  }

  registerGeode(geode, userRegions = []) {
    this.geodes.set(geode.id, {
      geode: geode,
      userRegions: userRegions
    });

    console.log(`[Router] Registered geode: ${geode.id} (${geode.config.region})`);
  }

  setLatency(fromRegion, toGeodeId, latency) {
    if (!this.latencyMatrix.has(fromRegion)) {
      this.latencyMatrix.set(fromRegion, new Map());
    }
    this.latencyMatrix.get(fromRegion).set(toGeodeId, latency);
  }

  async route(request) {
    this.statistics.totalRequests++;

    const geode = this.selectGeode(request.userRegion);

    if (!geode) {
      throw new Error('No available geode for request');
    }

    const response = await geode.handleRequest(request);
    this.statistics.routedRequests++;

    return response;
  }

  selectGeode(userRegion) {
    let selectedGeode = null;
    let minLatency = Infinity;

    const regionLatencies = this.latencyMatrix.get(userRegion) || new Map();

    for (const [geodeId, entry] of this.geodes) {
      if (entry.geode.healthStatus !== 'healthy') {
        continue;
      }

      if (entry.userRegions.includes(userRegion)) {
        return entry.geode;
      }

      const latency = regionLatencies.get(geodeId) || 100;
      if (latency < minLatency) {
        minLatency = latency;
        selectedGeode = entry.geode;
      }
    }

    return selectedGeode;
  }

  getStatistics() {
    return { ...this.statistics };
  }
}

class Geodes {
  constructor(config = {}) {
    this.config = {
      regions: config.regions || ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      replicationStrategy: config.replicationStrategy || 'async',
      ...config
    };

    this.geodes = [];
    this.router = new GeodeRouter();
  }

  async deployGeode(region, serviceDefinitions) {
    const geodeId = `geode-${region}`;

    const geode = new Geode(geodeId, {
      region: region,
      replicationStrategy: this.config.replicationStrategy
    });

    await geode.deploy(serviceDefinitions);
    this.geodes.push(geode);

    for (const existingGeode of this.geodes) {
      if (existingGeode.id !== geode.id) {
        geode.connectGeode(existingGeode);
        existingGeode.connectGeode(geode);
      }
    }

    this.router.registerGeode(geode, [region]);

    this.setupLatencyMatrix();

    return geode;
  }

  setupLatencyMatrix() {
    const latencyMap = {
      'us-east-1': { 'geode-us-east-1': 5, 'geode-eu-west-1': 80, 'geode-ap-southeast-1': 200 },
      'eu-west-1': { 'geode-us-east-1': 80, 'geode-eu-west-1': 5, 'geode-ap-southeast-1': 150 },
      'ap-southeast-1': { 'geode-us-east-1': 200, 'geode-eu-west-1': 150, 'geode-ap-southeast-1': 5 }
    };

    for (const [region, latencies] of Object.entries(latencyMap)) {
      for (const [geodeId, latency] of Object.entries(latencies)) {
        this.router.setLatency(region, geodeId, latency);
      }
    }
  }

  async processRequest(request) {
    return await this.router.route(request);
  }

  getStatistics() {
    const geodeMetrics = {};
    for (const geode of this.geodes) {
      geodeMetrics[geode.id] = geode.getMetrics();
    }

    return {
      router: this.router.getStatistics(),
      geodes: geodeMetrics,
      totalGeodes: this.geodes.length
    };
  }

  printStatistics() {
    const stats = this.getStatistics();

    console.log('\n========== Geodes Pattern Statistics ==========');
    console.log(`Total Geodes: ${stats.totalGeodes}\n`);

    console.log('Router:');
    console.log(`  Total Requests: ${stats.router.totalRequests}`);
    console.log(`  Routed Requests: ${stats.router.routedRequests}`);
    console.log(`  Failovers: ${stats.router.failovers}`);

    console.log('\nGeode Metrics:');
    for (const [geodeId, metrics] of Object.entries(stats.geodes)) {
      console.log(`  ${geodeId}:`);
      console.log(`    Health: ${metrics.healthStatus}`);
      console.log(`    Requests: ${metrics.requestCount}`);
      console.log(`    Errors: ${metrics.errors}`);
      console.log(`    Avg Latency: ${metrics.averageLatency}ms`);
      console.log(`    Data Store Reads: ${metrics.dataStore.reads}`);
      console.log(`    Data Store Writes: ${metrics.dataStore.writes}`);
      console.log(`    Replications: ${metrics.dataStore.replications}`);
      console.log(`    Data Size: ${metrics.dataStore.dataSize}`);
      console.log(`    Connected Geodes: ${metrics.connectedGeodes}`);
    }

    console.log('==============================================\n');
  }

  execute() {
    console.log('Geodes Pattern Demonstration');
    console.log('============================\n');
    console.log('Configuration:');
    console.log(`  Regions: ${this.config.regions.join(', ')}`);
    console.log(`  Replication Strategy: ${this.config.replicationStrategy}`);
    console.log('');

    return {
      success: true,
      pattern: 'Geodes',
      config: this.config,
      components: {
        geodes: this.geodes.length
      }
    };
  }
}

async function demonstrateGeodes() {
  console.log('Starting Geodes Pattern Demonstration\n');

  const geodesSystem = new Geodes({
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    replicationStrategy: 'async'
  });

  const serviceDefinitions = {
    'user-service': {
      version: '1.0.0',
      handler: async (request) => {
        return { userId: request.userId, data: 'user data' };
      }
    },
    'order-service': {
      version: '1.0.0',
      handler: async (request) => {
        return { orderId: request.orderId, status: 'processed' };
      }
    }
  };

  console.log('--- Deploying Geodes ---\n');

  for (const region of geodesSystem.config.regions) {
    await geodesSystem.deployGeode(region, serviceDefinitions);
  }

  geodesSystem.execute();

  console.log('\n--- Processing Requests ---\n');

  await geodesSystem.processRequest({
    userRegion: 'us-east-1',
    service: 'user-service',
    operation: 'write',
    key: 'user:123',
    value: { name: 'John Doe', email: 'john@example.com' }
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  await geodesSystem.processRequest({
    userRegion: 'eu-west-1',
    service: 'user-service',
    operation: 'read',
    key: 'user:123'
  });

  await geodesSystem.processRequest({
    userRegion: 'ap-southeast-1',
    service: 'order-service',
    operation: 'write',
    key: 'order:456',
    value: { items: ['item1', 'item2'], total: 99.99 }
  });

  geodesSystem.printStatistics();
}

if (require.main === module) {
  demonstrateGeodes().catch(console.error);
}

module.exports = Geodes;
