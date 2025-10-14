/**
 * Compute Resource Consolidation Pattern
 *
 * Consolidates multiple workloads onto shared compute resources to improve
 * resource utilization and reduce costs. Uses techniques like multi-tenancy,
 * containerization, and resource pooling.
 *
 * Benefits:
 * - Cost optimization: Better resource utilization
 * - Simplified management: Fewer resources to manage
 * - Scalability: Easier to scale consolidated resources
 * - Efficiency: Reduced overhead and waste
 *
 * Use Cases:
 * - Microservices deployment
 * - Multi-tenant applications
 * - Development/test environments
 * - Background job processing
 */

class ComputeNode {
  constructor(id, config = {}) {
    this.id = id;
    this.config = {
      cpu: config.cpu || 8,
      memory: config.memory || 16384,
      ...config
    };

    this.workloads = new Map();
    this.resources = {
      cpuUsed: 0,
      memoryUsed: 0
    };

    this.statistics = {
      workloadsDeployed: 0,
      workloadsRemoved: 0,
      requestsProcessed: 0
    };
  }

  canAccommodate(workload) {
    const projectedCpu = this.resources.cpuUsed + workload.requirements.cpu;
    const projectedMemory = this.resources.memoryUsed + workload.requirements.memory;

    return projectedCpu <= this.config.cpu && projectedMemory <= this.config.memory;
  }

  async deployWorkload(workload) {
    if (!this.canAccommodate(workload)) {
      throw new Error(`Node ${this.id} cannot accommodate workload ${workload.id}`);
    }

    this.workloads.set(workload.id, workload);
    this.resources.cpuUsed += workload.requirements.cpu;
    this.resources.memoryUsed += workload.requirements.memory;
    this.statistics.workloadsDeployed++;

    console.log(`[Node:${this.id}] Deployed workload: ${workload.id}`);
  }

  async removeWorkload(workloadId) {
    const workload = this.workloads.get(workloadId);
    if (workload) {
      this.workloads.delete(workloadId);
      this.resources.cpuUsed -= workload.requirements.cpu;
      this.resources.memoryUsed -= workload.requirements.memory;
      this.statistics.workloadsRemoved++;
      console.log(`[Node:${this.id}] Removed workload: ${workloadId}`);
      return true;
    }
    return false;
  }

  async processRequest(workloadId, request) {
    const workload = this.workloads.get(workloadId);
    if (!workload) {
      throw new Error(`Workload ${workloadId} not found on node ${this.id}`);
    }

    this.statistics.requestsProcessed++;
    return await workload.handler(request);
  }

  getUtilization() {
    return {
      cpu: (this.resources.cpuUsed / this.config.cpu * 100).toFixed(1),
      memory: (this.resources.memoryUsed / this.config.memory * 100).toFixed(1)
    };
  }

  getMetrics() {
    return {
      ...this.statistics,
      workloadsCount: this.workloads.size,
      resources: this.resources,
      capacity: this.config,
      utilization: this.getUtilization()
    };
  }
}

class ResourcePool {
  constructor(name, config = {}) {
    this.name = name;
    this.config = {
      initialNodes: config.initialNodes || 3,
      nodeConfig: config.nodeConfig || { cpu: 8, memory: 16384 },
      autoScaling: config.autoScaling !== false,
      targetUtilization: config.targetUtilization || 70,
      ...config
    };

    this.nodes = [];
    this.statistics = {
      nodesCreated: 0,
      nodesRemoved: 0,
      workloadsDeployed: 0,
      scaleUpEvents: 0,
      scaleDownEvents: 0
    };

    this.initialize();
  }

  initialize() {
    for (let i = 0; i < this.config.initialNodes; i++) {
      this.addNode();
    }
  }

  addNode() {
    const nodeId = `node-${this.nodes.length + 1}`;
    const node = new ComputeNode(nodeId, this.config.nodeConfig);
    this.nodes.push(node);
    this.statistics.nodesCreated++;
    console.log(`[Pool:${this.name}] Added node: ${nodeId}`);
    return node;
  }

  removeNode() {
    if (this.nodes.length <= 1) {
      return false;
    }

    const emptyNode = this.nodes.find(node => node.workloads.size === 0);
    if (emptyNode) {
      const index = this.nodes.indexOf(emptyNode);
      this.nodes.splice(index, 1);
      this.statistics.nodesRemoved++;
      console.log(`[Pool:${this.name}] Removed node: ${emptyNode.id}`);
      return true;
    }

    return false;
  }

  async deployWorkload(workload) {
    let targetNode = null;

    for (const node of this.nodes) {
      if (node.canAccommodate(workload)) {
        targetNode = node;
        break;
      }
    }

    if (!targetNode) {
      if (this.config.autoScaling) {
        console.log(`[Pool:${this.name}] No available node, scaling up...`);
        targetNode = this.addNode();
        this.statistics.scaleUpEvents++;
      } else {
        throw new Error('No available node and auto-scaling is disabled');
      }
    }

    await targetNode.deployWorkload(workload);
    this.statistics.workloadsDeployed++;

    return targetNode.id;
  }

  async checkAutoScaling() {
    if (!this.config.autoScaling) {
      return;
    }

    const avgUtilization = this.getAverageUtilization();

    if (avgUtilization > this.config.targetUtilization + 20) {
      console.log(`[Pool:${this.name}] High utilization (${avgUtilization}%), scaling up`);
      this.addNode();
      this.statistics.scaleUpEvents++;
    } else if (avgUtilization < this.config.targetUtilization - 20) {
      if (this.removeNode()) {
        console.log(`[Pool:${this.name}] Low utilization (${avgUtilization}%), scaled down`);
        this.statistics.scaleDownEvents++;
      }
    }
  }

  getAverageUtilization() {
    if (this.nodes.length === 0) return 0;

    const totalCpuUtil = this.nodes.reduce((sum, node) => {
      return sum + parseFloat(node.getUtilization().cpu);
    }, 0);

    return totalCpuUtil / this.nodes.length;
  }

  getMetrics() {
    const nodeMetrics = {};
    for (const node of this.nodes) {
      nodeMetrics[node.id] = node.getMetrics();
    }

    return {
      ...this.statistics,
      nodeCount: this.nodes.length,
      nodes: nodeMetrics,
      averageUtilization: this.getAverageUtilization().toFixed(1)
    };
  }
}

class ComputeResourceConsolidation {
  constructor(config = {}) {
    this.config = {
      pools: config.pools || 1,
      nodesPerPool: config.nodesPerPool || 3,
      nodeConfig: config.nodeConfig || { cpu: 8, memory: 16384 },
      autoScaling: config.autoScaling !== false,
      ...config
    };

    this.pools = new Map();
    this.workloadRegistry = new Map();
  }

  createPool(name, poolConfig = {}) {
    const pool = new ResourcePool(name, {
      initialNodes: poolConfig.initialNodes || this.config.nodesPerPool,
      nodeConfig: poolConfig.nodeConfig || this.config.nodeConfig,
      autoScaling: poolConfig.autoScaling !== undefined ? poolConfig.autoScaling : this.config.autoScaling
    });

    this.pools.set(name, pool);
    console.log(`[Consolidation] Created resource pool: ${name}`);
    return pool;
  }

  async deployWorkload(poolName, workload) {
    const pool = this.pools.get(poolName);
    if (!pool) {
      throw new Error(`Pool ${poolName} not found`);
    }

    const nodeId = await pool.deployWorkload(workload);
    this.workloadRegistry.set(workload.id, {
      pool: poolName,
      node: nodeId,
      workload: workload
    });

    console.log(`[Consolidation] Deployed workload ${workload.id} to ${poolName}/${nodeId}`);
    return nodeId;
  }

  async processRequest(workloadId, request) {
    const registration = this.workloadRegistry.get(workloadId);
    if (!registration) {
      throw new Error(`Workload ${workloadId} not registered`);
    }

    const pool = this.pools.get(registration.pool);
    const node = pool.nodes.find(n => n.id === registration.node);

    return await node.processRequest(workloadId, request);
  }

  async autoScale() {
    for (const pool of this.pools.values()) {
      await pool.checkAutoScaling();
    }
  }

  getStatistics() {
    const poolMetrics = {};
    for (const [name, pool] of this.pools) {
      poolMetrics[name] = pool.getMetrics();
    }

    return {
      totalPools: this.pools.size,
      totalWorkloads: this.workloadRegistry.size,
      pools: poolMetrics
    };
  }

  printStatistics() {
    const stats = this.getStatistics();

    console.log('\n========== Compute Resource Consolidation Statistics ==========');
    console.log(`Total Pools: ${stats.totalPools}`);
    console.log(`Total Workloads: ${stats.totalWorkloads}\n`);

    for (const [poolName, poolMetrics] of Object.entries(stats.pools)) {
      console.log(`Pool: ${poolName}`);
      console.log(`  Nodes: ${poolMetrics.nodeCount}`);
      console.log(`  Workloads Deployed: ${poolMetrics.workloadsDeployed}`);
      console.log(`  Average Utilization: ${poolMetrics.averageUtilization}%`);
      console.log(`  Scale Up Events: ${poolMetrics.scaleUpEvents}`);
      console.log(`  Scale Down Events: ${poolMetrics.scaleDownEvents}`);

      console.log('  Node Details:');
      for (const [nodeId, nodeMetrics] of Object.entries(poolMetrics.nodes)) {
        console.log(`    ${nodeId}:`);
        console.log(`      Workloads: ${nodeMetrics.workloadsCount}`);
        console.log(`      CPU: ${nodeMetrics.utilization.cpu}% (${nodeMetrics.resources.cpuUsed}/${nodeMetrics.capacity.cpu})`);
        console.log(`      Memory: ${nodeMetrics.utilization.memory}% (${nodeMetrics.resources.memoryUsed}/${nodeMetrics.capacity.memory} MB)`);
      }
    }

    console.log('================================================================\n');
  }

  execute() {
    console.log('Compute Resource Consolidation Pattern Demonstration');
    console.log('====================================================\n');
    console.log('Configuration:');
    console.log(`  Pools: ${this.config.pools}`);
    console.log(`  Nodes per Pool: ${this.config.nodesPerPool}`);
    console.log(`  Node Config: CPU=${this.config.nodeConfig.cpu}, Memory=${this.config.nodeConfig.memory}MB`);
    console.log(`  Auto Scaling: ${this.config.autoScaling}`);
    console.log('');

    return {
      success: true,
      pattern: 'ComputeResourceConsolidation',
      config: this.config
    };
  }
}

async function demonstrateComputeResourceConsolidation() {
  console.log('Starting Compute Resource Consolidation Pattern Demonstration\n');

  const consolidation = new ComputeResourceConsolidation({
    pools: 2,
    nodesPerPool: 2,
    nodeConfig: { cpu: 4, memory: 8192 },
    autoScaling: true
  });

  consolidation.execute();

  console.log('--- Creating Resource Pools ---\n');
  consolidation.createPool('production', { initialNodes: 3 });
  consolidation.createPool('development', { initialNodes: 2 });

  console.log('\n--- Deploying Workloads ---\n');

  const workloads = [
    { id: 'api-service', requirements: { cpu: 1, memory: 2048 }, handler: async (req) => ({ api: 'response' }) },
    { id: 'web-service', requirements: { cpu: 2, memory: 4096 }, handler: async (req) => ({ web: 'response' }) },
    { id: 'worker-service', requirements: { cpu: 1, memory: 1024 }, handler: async (req) => ({ worker: 'processed' }) },
    { id: 'batch-job', requirements: { cpu: 2, memory: 2048 }, handler: async (req) => ({ batch: 'completed' }) },
    { id: 'cache-service', requirements: { cpu: 1, memory: 2048 }, handler: async (req) => ({ cache: 'hit' }) }
  ];

  for (const workload of workloads) {
    await consolidation.deployWorkload('production', workload);
  }

  await consolidation.autoScale();

  consolidation.printStatistics();
}

if (require.main === module) {
  demonstrateComputeResourceConsolidation().catch(console.error);
}

module.exports = ComputeResourceConsolidation;
