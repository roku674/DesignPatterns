/**
 * Strangler Fig Pattern
 *
 * Incrementally migrates a legacy system by gradually replacing specific
 * functionality with new services. Named after strangler fig vines that grow
 * around trees.
 *
 * Use Cases:
 * - Migrating monolithic applications to microservices
 * - Replacing legacy systems without downtime
 * - Gradual technology stack migrations
 * - Risk mitigation during large-scale rewrites
 * - A/B testing new implementations
 */

const EventEmitter = require('events');

/**
 * Legacy System Proxy
 */
class LegacySystem {
  constructor(config = {}) {
    this.name = config.name || 'Legacy System';
    this.endpoints = new Map();
    this.metrics = {
      requests: 0,
      errors: 0
    };
  }

  registerEndpoint(path, handler) {
    this.endpoints.set(path, handler);
  }

  async handleRequest(path, data) {
    this.metrics.requests++;

    const handler = this.endpoints.get(path);

    if (!handler) {
      this.metrics.errors++;
      throw new Error(`Legacy endpoint not found: ${path}`);
    }

    try {
      return await handler(data);
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      errorRate: this.metrics.requests > 0
        ? ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

/**
 * New System Implementation
 */
class NewSystem {
  constructor(config = {}) {
    this.name = config.name || 'New System';
    this.endpoints = new Map();
    this.metrics = {
      requests: 0,
      errors: 0
    };
  }

  registerEndpoint(path, handler) {
    this.endpoints.set(path, handler);
  }

  async handleRequest(path, data) {
    this.metrics.requests++;

    const handler = this.endpoints.get(path);

    if (!handler) {
      this.metrics.errors++;
      throw new Error(`New endpoint not found: ${path}`);
    }

    try {
      return await handler(data);
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      errorRate: this.metrics.requests > 0
        ? ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

/**
 * Migration Router
 */
class MigrationRouter {
  constructor() {
    this.routes = new Map();
  }

  addRoute(path, config) {
    this.routes.set(path, {
      path,
      target: config.target,
      rolloutPercentage: config.rolloutPercentage || 0,
      enabledAt: config.enabledAt || Date.now(),
      condition: config.condition || null
    });
  }

  getTarget(path, context = {}) {
    const route = this.routes.get(path);

    if (!route) {
      return 'legacy';
    }

    if (route.target === 'new') {
      if (route.rolloutPercentage >= 100) {
        return 'new';
      }

      if (route.rolloutPercentage > 0) {
        const random = Math.random() * 100;
        if (random < route.rolloutPercentage) {
          return 'new';
        }
      }

      if (route.condition && route.condition(context)) {
        return 'new';
      }
    }

    return 'legacy';
  }

  updateRollout(path, percentage) {
    const route = this.routes.get(path);

    if (!route) {
      throw new Error(`Route not found: ${path}`);
    }

    route.rolloutPercentage = Math.max(0, Math.min(100, percentage));
  }

  getRoutes() {
    return Array.from(this.routes.values());
  }
}

/**
 * Feature Flag Manager
 */
class FeatureFlagManager {
  constructor() {
    this.flags = new Map();
  }

  setFlag(name, enabled, conditions = {}) {
    this.flags.set(name, {
      enabled,
      conditions,
      enabledAt: enabled ? Date.now() : null
    });
  }

  isEnabled(name, context = {}) {
    const flag = this.flags.get(name);

    if (!flag || !flag.enabled) {
      return false;
    }

    if (flag.conditions.userIds && context.userId) {
      return flag.conditions.userIds.includes(context.userId);
    }

    if (flag.conditions.percentage) {
      const random = Math.random() * 100;
      return random < flag.conditions.percentage;
    }

    return true;
  }

  getFlags() {
    return Array.from(this.flags.entries()).map(([name, flag]) => ({
      name,
      enabled: flag.enabled,
      conditions: flag.conditions
    }));
  }
}

/**
 * Data Synchronizer for legacy/new system consistency
 */
class DataSynchronizer {
  constructor() {
    this.syncQueue = [];
    this.syncLog = [];
  }

  async syncData(source, target, data) {
    this.syncQueue.push({
      source,
      target,
      data,
      timestamp: Date.now()
    });

    await this.processSyncQueue();
  }

  async processSyncQueue() {
    while (this.syncQueue.length > 0) {
      const syncItem = this.syncQueue.shift();

      await new Promise(resolve => setTimeout(resolve, 10));

      this.syncLog.push({
        ...syncItem,
        completedAt: Date.now(),
        success: true
      });
    }
  }

  getSyncLog() {
    return this.syncLog;
  }
}

/**
 * Main Strangler Fig implementation
 */
class StranglerFig extends EventEmitter {
  constructor(config = {}) {
    super();
    this.legacySystem = new LegacySystem(config.legacy || {});
    this.newSystem = new NewSystem(config.new || {});
    this.router = new MigrationRouter();
    this.featureFlags = new FeatureFlagManager();
    this.synchronizer = new DataSynchronizer();
    this.metrics = {
      totalRequests: 0,
      legacyRequests: 0,
      newRequests: 0,
      migrationErrors: 0
    };
  }

  registerLegacyEndpoint(path, handler) {
    this.legacySystem.registerEndpoint(path, handler);
  }

  registerNewEndpoint(path, handler) {
    this.newSystem.registerEndpoint(path, handler);
  }

  migrateEndpoint(path, options = {}) {
    this.router.addRoute(path, {
      target: 'new',
      rolloutPercentage: options.rolloutPercentage || 0,
      condition: options.condition
    });

    this.emit('endpoint:migrated', {
      path,
      rolloutPercentage: options.rolloutPercentage
    });
  }

  rollout(path, percentage) {
    this.router.updateRollout(path, percentage);

    this.emit('rollout:updated', { path, percentage });
  }

  async handleRequest(path, data, context = {}) {
    this.metrics.totalRequests++;

    const target = this.router.getTarget(path, context);

    try {
      this.emit('request:routed', { path, target });

      let response;

      if (target === 'new') {
        this.metrics.newRequests++;
        response = await this.newSystem.handleRequest(path, data);

        if (context.syncToLegacy) {
          await this.synchronizer.syncData('new', 'legacy', data);
        }
      } else {
        this.metrics.legacyRequests++;
        response = await this.legacySystem.handleRequest(path, data);

        if (context.syncToNew) {
          await this.synchronizer.syncData('legacy', 'new', data);
        }
      }

      this.emit('request:completed', { path, target, response });

      return {
        success: true,
        target,
        response
      };
    } catch (error) {
      this.metrics.migrationErrors++;

      this.emit('request:error', { path, target, error: error.message });

      if (target === 'new' && context.fallbackToLegacy) {
        this.emit('fallback:triggered', { path });

        try {
          this.metrics.legacyRequests++;
          const response = await this.legacySystem.handleRequest(path, data);

          return {
            success: true,
            target: 'legacy',
            fallback: true,
            response
          };
        } catch (fallbackError) {
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  enableFeatureFlag(name, conditions = {}) {
    this.featureFlags.setFlag(name, true, conditions);
    this.emit('feature:enabled', { name, conditions });
  }

  disableFeatureFlag(name) {
    this.featureFlags.setFlag(name, false);
    this.emit('feature:disabled', { name });
  }

  isFeatureEnabled(name, context = {}) {
    return this.featureFlags.isEnabled(name, context);
  }

  getMigrationStatus() {
    const routes = this.router.getRoutes();

    return {
      totalEndpoints: routes.length,
      migratedEndpoints: routes.filter(r => r.rolloutPercentage === 100).length,
      inProgressEndpoints: routes.filter(r => r.rolloutPercentage > 0 && r.rolloutPercentage < 100).length,
      pendingEndpoints: routes.filter(r => r.rolloutPercentage === 0).length
    };
  }

  getMetrics() {
    return {
      ...this.metrics,
      migrationPercentage: this.metrics.totalRequests > 0
        ? ((this.metrics.newRequests / this.metrics.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      legacySystem: this.legacySystem.getMetrics(),
      newSystem: this.newSystem.getMetrics(),
      migrationStatus: this.getMigrationStatus()
    };
  }

  getSyncLog() {
    return this.synchronizer.getSyncLog();
  }
}

/**
 * Example usage and demonstration
 */
function demonstrateStranglerFig() {
  console.log('=== Strangler Fig Pattern Demo ===\n');

  const strangler = new StranglerFig({
    legacy: { name: 'Legacy Monolith' },
    new: { name: 'New Microservices' }
  });

  strangler.registerLegacyEndpoint('/api/users', async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      users: [{ id: data.id, name: 'John Doe (Legacy)' }],
      source: 'legacy'
    };
  });

  strangler.registerNewEndpoint('/api/users', async (data) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      users: [{ id: data.id, name: 'John Doe (New)', email: 'john@example.com' }],
      source: 'new'
    };
  });

  strangler.registerLegacyEndpoint('/api/orders', async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      orders: [{ id: data.id, total: 99.99 }],
      source: 'legacy'
    };
  });

  strangler.registerNewEndpoint('/api/orders', async (data) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      orders: [{ id: data.id, total: 99.99, status: 'confirmed' }],
      source: 'new'
    };
  });

  strangler.on('endpoint:migrated', ({ path, rolloutPercentage }) => {
    console.log(`Endpoint ${path} migrated with ${rolloutPercentage}% rollout`);
  });

  strangler.on('rollout:updated', ({ path, percentage }) => {
    console.log(`Rollout for ${path} updated to ${percentage}%`);
  });

  strangler.on('request:routed', ({ path, target }) => {
    console.log(`Request to ${path} routed to ${target} system`);
  });

  console.log('Phase 1: All traffic to legacy');
  strangler.handleRequest('/api/users', { id: 123 })
    .then(result => {
      console.log(`Result: ${JSON.stringify(result.response)}\n`);

      console.log('Phase 2: Migrate /api/users with 50% rollout');
      strangler.migrateEndpoint('/api/users', {
        rolloutPercentage: 50
      });

      return Promise.all([
        strangler.handleRequest('/api/users', { id: 123 }),
        strangler.handleRequest('/api/users', { id: 124 })
      ]);
    })
    .then(results => {
      console.log(`\nPhase 3: Increase /api/users to 100%`);
      strangler.rollout('/api/users', 100);

      return strangler.handleRequest('/api/users', { id: 125 });
    })
    .then(result => {
      console.log(`Result: ${JSON.stringify(result.response)}\n`);

      console.log('Phase 4: Migrate /api/orders');
      strangler.migrateEndpoint('/api/orders', {
        rolloutPercentage: 100
      });

      return strangler.handleRequest('/api/orders', { id: 456 });
    })
    .then(result => {
      console.log(`Result: ${JSON.stringify(result.response)}\n`);

      console.log('Migration Metrics:');
      console.log(JSON.stringify(strangler.getMetrics(), null, 2));
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}

if (require.main === module) {
  demonstrateStranglerFig();
}

module.exports = StranglerFig;
