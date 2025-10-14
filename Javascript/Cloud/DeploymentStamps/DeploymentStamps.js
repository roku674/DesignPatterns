/**
 * Deployment Stamps Pattern
 *
 * Deploys multiple independent copies (stamps) of application components
 * to support scale-out and multi-tenancy. Each stamp contains a full set
 * of application resources and serves a subset of users or tenants.
 *
 * Benefits:
 * - Scalability: Add stamps to handle more load
 * - Isolation: Failures in one stamp don't affect others
 * - Geographic distribution: Deploy stamps in multiple regions
 * - Tenant isolation: Dedicate stamps to specific tenants
 * - Cost management: Size stamps based on tenant needs
 *
 * Use Cases:
 * - Multi-tenant SaaS applications
 * - Global content delivery
 * - Regulated workloads requiring data isolation
 * - Large-scale consumer applications
 */

class Stamp {
  constructor(id, config = {}) {
    this.id = id;
    this.config = {
      region: config.region || 'us-east-1',
      capacity: config.capacity || 1000,
      dedicated: config.dedicated || false,
      tenantIds: config.tenantIds || [],
      ...config
    };

    this.resources = {
      compute: [],
      database: null,
      storage: null,
      cache: null
    };

    this.metrics = {
      activeUsers: 0,
      requestCount: 0,
      errorCount: 0,
      responseTime: [],
      cpuUsage: 0,
      memoryUsage: 0
    };

    this.status = 'healthy';
    this.createdAt = Date.now();
  }

  async deploy() {
    console.log(`[Stamp:${this.id}] Deploying in region ${this.config.region}...`);

    await this.provisionCompute();
    await this.provisionDatabase();
    await this.provisionStorage();
    await this.provisionCache();

    this.status = 'deployed';
    console.log(`[Stamp:${this.id}] Deployment complete`);

    return {
      stampId: this.id,
      region: this.config.region,
      status: this.status,
      resources: {
        compute: this.resources.compute.length,
        database: this.resources.database ? 'provisioned' : 'none',
        storage: this.resources.storage ? 'provisioned' : 'none',
        cache: this.resources.cache ? 'provisioned' : 'none'
      }
    };
  }

  async provisionCompute() {
    const instanceCount = Math.ceil(this.config.capacity / 100);
    for (let i = 0; i < instanceCount; i++) {
      this.resources.compute.push({
        id: `${this.id}-compute-${i}`,
        type: 'standard',
        status: 'running'
      });
    }
    console.log(`[Stamp:${this.id}] Provisioned ${instanceCount} compute instances`);
  }

  async provisionDatabase() {
    this.resources.database = {
      id: `${this.id}-db`,
      type: 'regional',
      replication: 'sync',
      status: 'running'
    };
    console.log(`[Stamp:${this.id}] Provisioned database`);
  }

  async provisionStorage() {
    this.resources.storage = {
      id: `${this.id}-storage`,
      type: 'object-storage',
      capacity: this.config.capacity * 10,
      status: 'available'
    };
    console.log(`[Stamp:${this.id}] Provisioned storage`);
  }

  async provisionCache() {
    this.resources.cache = {
      id: `${this.id}-cache`,
      type: 'redis',
      size: 'standard',
      status: 'running'
    };
    console.log(`[Stamp:${this.id}] Provisioned cache`);
  }

  async handleRequest(request) {
    this.metrics.requestCount++;

    const startTime = Date.now();

    if (this.config.dedicated && !this.config.tenantIds.includes(request.tenantId)) {
      throw new Error(`Tenant ${request.tenantId} not authorized for stamp ${this.id}`);
    }

    await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 40));

    const responseTime = Date.now() - startTime;
    this.metrics.responseTime.push(responseTime);

    if (this.metrics.responseTime.length > 100) {
      this.metrics.responseTime.shift();
    }

    this.updateResourceMetrics();

    return {
      success: true,
      stampId: this.id,
      region: this.config.region,
      responseTime: responseTime,
      data: request.data
    };
  }

  updateResourceMetrics() {
    const load = this.metrics.requestCount / this.config.capacity;
    this.metrics.cpuUsage = Math.min(95, load * 80 + Math.random() * 20);
    this.metrics.memoryUsage = Math.min(90, load * 70 + Math.random() * 15);

    if (this.metrics.cpuUsage > 85 || this.metrics.memoryUsage > 85) {
      this.status = 'overloaded';
    } else if (this.metrics.cpuUsage > 70 || this.metrics.memoryUsage > 70) {
      this.status = 'busy';
    } else {
      this.status = 'healthy';
    }
  }

  getMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
      : 0;

    return {
      ...this.metrics,
      averageResponseTime: Math.round(avgResponseTime),
      capacity: this.config.capacity,
      utilization: Math.round((this.metrics.requestCount / this.config.capacity) * 100),
      status: this.status
    };
  }

  async scale(newCapacity) {
    console.log(`[Stamp:${this.id}] Scaling from ${this.config.capacity} to ${newCapacity}...`);
    this.config.capacity = newCapacity;
    await this.provisionCompute();
    console.log(`[Stamp:${this.id}] Scaling complete`);
  }
}

class StampRouter {
  constructor(config = {}) {
    this.config = {
      routingStrategy: config.routingStrategy || 'round-robin',
      enableHealthChecks: config.enableHealthChecks !== false,
      ...config
    };

    this.stamps = new Map();
    this.currentIndex = 0;
    this.statistics = {
      totalRequests: 0,
      routedRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    };
  }

  registerStamp(stamp) {
    this.stamps.set(stamp.id, stamp);
    console.log(`[Router] Registered stamp: ${stamp.id} (${stamp.config.region})`);
  }

  async route(request) {
    this.statistics.totalRequests++;

    let stamp = null;

    switch (this.config.routingStrategy) {
      case 'round-robin':
        stamp = this.roundRobinRoute();
        break;
      case 'least-loaded':
        stamp = this.leastLoadedRoute();
        break;
      case 'geographic':
        stamp = this.geographicRoute(request.region);
        break;
      case 'tenant-dedicated':
        stamp = this.tenantDedicatedRoute(request.tenantId);
        break;
      default:
        stamp = this.roundRobinRoute();
    }

    if (!stamp) {
      this.statistics.failedRequests++;
      throw new Error('No available stamp for request');
    }

    const startTime = Date.now();
    const response = await stamp.handleRequest(request);

    const responseTime = Date.now() - startTime;
    this.statistics.routedRequests++;
    this.statistics.averageResponseTime =
      ((this.statistics.averageResponseTime * (this.statistics.routedRequests - 1)) + responseTime) /
      this.statistics.routedRequests;

    return response;
  }

  roundRobinRoute() {
    const stamps = Array.from(this.stamps.values()).filter(s => s.status === 'healthy' || s.status === 'busy');
    if (stamps.length === 0) return null;

    const stamp = stamps[this.currentIndex % stamps.length];
    this.currentIndex++;
    return stamp;
  }

  leastLoadedRoute() {
    const stamps = Array.from(this.stamps.values()).filter(s => s.status !== 'overloaded');
    if (stamps.length === 0) return null;

    return stamps.reduce((least, current) => {
      const leastMetrics = least.getMetrics();
      const currentMetrics = current.getMetrics();
      return currentMetrics.utilization < leastMetrics.utilization ? current : least;
    });
  }

  geographicRoute(region) {
    const regionalStamps = Array.from(this.stamps.values())
      .filter(s => s.config.region === region && s.status !== 'overloaded');

    if (regionalStamps.length > 0) {
      return this.leastLoadedFromSet(regionalStamps);
    }

    return this.leastLoadedRoute();
  }

  tenantDedicatedRoute(tenantId) {
    const dedicatedStamp = Array.from(this.stamps.values())
      .find(s => s.config.dedicated && s.config.tenantIds.includes(tenantId));

    if (dedicatedStamp) {
      return dedicatedStamp;
    }

    const sharedStamps = Array.from(this.stamps.values())
      .filter(s => !s.config.dedicated && s.status !== 'overloaded');

    return this.leastLoadedFromSet(sharedStamps);
  }

  leastLoadedFromSet(stamps) {
    if (stamps.length === 0) return null;

    return stamps.reduce((least, current) => {
      const leastMetrics = least.getMetrics();
      const currentMetrics = current.getMetrics();
      return currentMetrics.utilization < leastMetrics.utilization ? current : least;
    });
  }

  getStatistics() {
    return {
      ...this.statistics,
      registeredStamps: this.stamps.size
    };
  }
}

class DeploymentStamps {
  constructor(config = {}) {
    this.config = {
      regions: config.regions || ['us-east-1', 'us-west-2', 'eu-west-1'],
      stampsPerRegion: config.stampsPerRegion || 2,
      defaultCapacity: config.defaultCapacity || 1000,
      routingStrategy: config.routingStrategy || 'least-loaded',
      ...config
    };

    this.stamps = [];
    this.router = new StampRouter({
      routingStrategy: this.config.routingStrategy,
      enableHealthChecks: true
    });

    this.deploymentHistory = [];
  }

  async deployStamp(region, config = {}) {
    const stampId = `stamp-${region}-${this.stamps.length + 1}`;

    const stamp = new Stamp(stampId, {
      region: region,
      capacity: config.capacity || this.config.defaultCapacity,
      dedicated: config.dedicated || false,
      tenantIds: config.tenantIds || []
    });

    const deploymentResult = await stamp.deploy();
    this.stamps.push(stamp);
    this.router.registerStamp(stamp);

    this.deploymentHistory.push({
      stampId: stampId,
      region: region,
      deployedAt: Date.now(),
      config: config
    });

    return deploymentResult;
  }

  async deployAllRegions() {
    console.log(`\n[DeploymentStamps] Deploying ${this.config.stampsPerRegion} stamps per region...`);

    const deploymentPromises = [];

    for (const region of this.config.regions) {
      for (let i = 0; i < this.config.stampsPerRegion; i++) {
        deploymentPromises.push(
          this.deployStamp(region, {
            capacity: this.config.defaultCapacity
          })
        );
      }
    }

    const results = await Promise.all(deploymentPromises);
    console.log(`[DeploymentStamps] All stamps deployed\n`);

    return results;
  }

  async processRequest(request) {
    return await this.router.route(request);
  }

  async processRequests(requests) {
    const results = await Promise.all(
      requests.map(req => this.processRequest(req))
    );
    return results;
  }

  getStampMetrics() {
    const metrics = {};
    for (const stamp of this.stamps) {
      metrics[stamp.id] = stamp.getMetrics();
    }
    return metrics;
  }

  getStatistics() {
    return {
      router: this.router.getStatistics(),
      stamps: this.getStampMetrics(),
      totalStamps: this.stamps.length,
      deploymentHistory: this.deploymentHistory.length
    };
  }

  printStatistics() {
    const stats = this.getStatistics();

    console.log('\n========== Deployment Stamps Statistics ==========');
    console.log(`Total Stamps: ${stats.totalStamps}`);
    console.log(`Total Deployments: ${stats.deploymentHistory}\n`);

    console.log('Router:');
    console.log(`  Total Requests: ${stats.router.totalRequests}`);
    console.log(`  Routed Requests: ${stats.router.routedRequests}`);
    console.log(`  Failed Requests: ${stats.router.failedRequests}`);
    console.log(`  Avg Response Time: ${Math.round(stats.router.averageResponseTime)}ms`);

    console.log('\nStamp Metrics:');
    for (const [stampId, metrics] of Object.entries(stats.stamps)) {
      console.log(`  ${stampId}:`);
      console.log(`    Status: ${metrics.status}`);
      console.log(`    Requests: ${metrics.requestCount}`);
      console.log(`    Capacity: ${metrics.capacity}`);
      console.log(`    Utilization: ${metrics.utilization}%`);
      console.log(`    Avg Response Time: ${metrics.averageResponseTime}ms`);
      console.log(`    CPU Usage: ${Math.round(metrics.cpuUsage)}%`);
      console.log(`    Memory Usage: ${Math.round(metrics.memoryUsage)}%`);
    }

    console.log('=================================================\n');
  }

  execute() {
    console.log('DeploymentStamps Pattern Demonstration');
    console.log('======================================\n');
    console.log('Configuration:');
    console.log(`  Regions: ${this.config.regions.join(', ')}`);
    console.log(`  Stamps per Region: ${this.config.stampsPerRegion}`);
    console.log(`  Default Capacity: ${this.config.defaultCapacity}`);
    console.log(`  Routing Strategy: ${this.config.routingStrategy}`);
    console.log('');

    return {
      success: true,
      pattern: 'DeploymentStamps',
      config: this.config,
      components: {
        stamps: this.stamps.length,
        regions: this.config.regions.length
      }
    };
  }
}

async function demonstrateDeploymentStamps() {
  console.log('Starting Deployment Stamps Pattern Demonstration\n');

  const deployment = new DeploymentStamps({
    regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
    stampsPerRegion: 2,
    defaultCapacity: 500,
    routingStrategy: 'least-loaded'
  });

  deployment.execute();

  await deployment.deployAllRegions();

  await deployment.deployStamp('us-east-1', {
    dedicated: true,
    tenantIds: ['tenant-vip-001'],
    capacity: 2000
  });

  console.log('--- Processing Requests ---\n');

  const requests = [];
  for (let i = 0; i < 50; i++) {
    requests.push({
      id: `req-${i}`,
      tenantId: `tenant-${Math.floor(Math.random() * 10)}`,
      region: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'][Math.floor(Math.random() * 4)],
      data: { operation: 'get-data', userId: `user-${i}` }
    });
  }

  await deployment.processRequests(requests);

  deployment.printStatistics();
}

if (require.main === module) {
  demonstrateDeploymentStamps().catch(console.error);
}

module.exports = DeploymentStamps;
