/**
 * Gateway Routing Pattern
 *
 * Routes requests to different backend services based on request attributes
 * such as path, headers, query parameters, or custom routing logic.
 *
 * Use Cases:
 * - API versioning (route to different service versions)
 * - A/B testing and canary deployments
 * - Geographic routing (route based on user location)
 * - Multi-tenant applications (route based on tenant ID)
 * - Protocol-based routing (HTTP, WebSocket, gRPC)
 * - Load distribution across service instances
 */

const EventEmitter = require('events');

/**
 * Route Configuration
 */
class Route {
  constructor(config) {
    this.id = config.id;
    this.pattern = config.pattern;
    this.target = config.target;
    this.method = config.method || null;
    this.priority = config.priority || 0;
    this.weight = config.weight || 100;
    this.conditions = config.conditions || [];
    this.metadata = config.metadata || {};
    this.enabled = config.enabled !== false;
  }

  matches(request) {
    if (!this.enabled) {
      return false;
    }

    if (this.method && request.method !== this.method) {
      return false;
    }

    const pathMatches = this.matchesPath(request.path);
    if (!pathMatches) {
      return false;
    }

    return this.matchesConditions(request);
  }

  matchesPath(path) {
    if (typeof this.pattern === 'string') {
      return this.matchesStringPattern(path, this.pattern);
    }

    if (this.pattern instanceof RegExp) {
      return this.pattern.test(path);
    }

    return false;
  }

  matchesStringPattern(path, pattern) {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\{(\w+)\}/g, '([^/]+)');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  matchesConditions(request) {
    return this.conditions.every(condition => {
      return condition(request);
    });
  }

  extractParams(path) {
    if (typeof this.pattern !== 'string') {
      return {};
    }

    const paramNames = [];
    const regexPattern = this.pattern.replace(/\{(\w+)\}/g, (match, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPattern}$`);
    const matches = path.match(regex);

    if (!matches) {
      return {};
    }

    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = matches[index + 1];
    });

    return params;
  }
}

/**
 * Service Target with health checking
 */
class ServiceTarget {
  constructor(config) {
    this.id = config.id;
    this.url = config.url;
    this.weight = config.weight || 100;
    this.timeout = config.timeout || 5000;
    this.retries = config.retries || 3;
    this.healthy = true;
    this.metadata = config.metadata || {};
    this.stats = {
      requests: 0,
      successes: 0,
      failures: 0,
      averageLatency: 0
    };
  }

  async healthCheck() {
    try {
      await new Promise(resolve => setTimeout(resolve, 10));
      this.healthy = true;
      return true;
    } catch (error) {
      this.healthy = false;
      return false;
    }
  }

  recordRequest(success, latency) {
    this.stats.requests++;

    if (success) {
      this.stats.successes++;
    } else {
      this.stats.failures++;
    }

    const total = this.stats.requests;
    const currentAvg = this.stats.averageLatency;
    this.stats.averageLatency = (currentAvg * (total - 1) + latency) / total;
  }

  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.requests > 0
        ? ((this.stats.successes / this.stats.requests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

/**
 * Load Balancer for distributing requests
 */
class LoadBalancer {
  constructor(strategy = 'round-robin') {
    this.strategy = strategy;
    this.currentIndex = 0;
  }

  select(targets) {
    const healthyTargets = targets.filter(t => t.healthy);

    if (healthyTargets.length === 0) {
      throw new Error('No healthy targets available');
    }

    switch (this.strategy) {
      case 'round-robin':
        return this.roundRobin(healthyTargets);
      case 'weighted':
        return this.weighted(healthyTargets);
      case 'least-connections':
        return this.leastConnections(healthyTargets);
      case 'random':
        return this.random(healthyTargets);
      default:
        return healthyTargets[0];
    }
  }

  roundRobin(targets) {
    const target = targets[this.currentIndex % targets.length];
    this.currentIndex++;
    return target;
  }

  weighted(targets) {
    const totalWeight = targets.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;

    for (const target of targets) {
      random -= target.weight;
      if (random <= 0) {
        return target;
      }
    }

    return targets[0];
  }

  leastConnections(targets) {
    return targets.reduce((min, target) => {
      const minRequests = min.stats.requests - min.stats.successes - min.stats.failures;
      const targetRequests = target.stats.requests - target.stats.successes - target.stats.failures;
      return targetRequests < minRequests ? target : min;
    });
  }

  random(targets) {
    const index = Math.floor(Math.random() * targets.length);
    return targets[index];
  }
}

/**
 * Router with dynamic route management
 */
class Router {
  constructor() {
    this.routes = [];
    this.targets = new Map();
    this.loadBalancer = new LoadBalancer('round-robin');
  }

  addRoute(routeConfig) {
    const route = new Route(routeConfig);
    this.routes.push(route);
    this.routes.sort((a, b) => b.priority - a.priority);
    return route;
  }

  removeRoute(routeId) {
    const index = this.routes.findIndex(r => r.id === routeId);
    if (index !== -1) {
      this.routes.splice(index, 1);
      return true;
    }
    return false;
  }

  addTarget(targetConfig) {
    const target = new ServiceTarget(targetConfig);
    if (!this.targets.has(targetConfig.routeId)) {
      this.targets.set(targetConfig.routeId, []);
    }
    this.targets.get(targetConfig.routeId).push(target);
    return target;
  }

  findRoute(request) {
    for (const route of this.routes) {
      if (route.matches(request)) {
        return route;
      }
    }
    return null;
  }

  selectTarget(route) {
    const targets = this.targets.get(route.id);

    if (!targets || targets.length === 0) {
      return null;
    }

    if (targets.length === 1) {
      return targets[0];
    }

    return this.loadBalancer.select(targets);
  }

  getRoutes() {
    return this.routes.map(r => ({
      id: r.id,
      pattern: r.pattern,
      target: r.target,
      method: r.method,
      priority: r.priority,
      enabled: r.enabled
    }));
  }

  getTargetStats(routeId) {
    const targets = this.targets.get(routeId);
    if (!targets) {
      return [];
    }

    return targets.map(t => ({
      id: t.id,
      url: t.url,
      healthy: t.healthy,
      stats: t.getStats()
    }));
  }
}

/**
 * Main Gateway Routing implementation
 */
class GatewayRouting extends EventEmitter {
  constructor(config = {}) {
    super();
    this.router = new Router();
    this.healthCheckInterval = config.healthCheckInterval || 30000;
    this.healthCheckTimer = null;
    this.metrics = {
      totalRequests: 0,
      routedRequests: 0,
      failedRoutes: 0,
      averageRoutingTime: 0
    };

    if (config.routes) {
      config.routes.forEach(route => this.router.addRoute(route));
    }

    if (config.autoHealthCheck !== false) {
      this.startHealthChecks();
    }
  }

  async route(request) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      this.emit('routing:start', { request });

      const route = this.router.findRoute(request);

      if (!route) {
        this.metrics.failedRoutes++;
        throw new Error(`No route found for ${request.method} ${request.path}`);
      }

      const params = route.extractParams(request.path);
      const target = this.router.selectTarget(route);

      if (!target) {
        this.metrics.failedRoutes++;
        throw new Error(`No healthy target found for route ${route.id}`);
      }

      this.emit('route:matched', { route, target, params });

      const response = await this.forwardRequest(request, target, params);
      const routingTime = Date.now() - startTime;

      target.recordRequest(true, routingTime);
      this.updateMetrics(routingTime);
      this.metrics.routedRequests++;

      this.emit('routing:complete', {
        request,
        route,
        target,
        response,
        routingTime
      });

      return {
        success: true,
        route: route.id,
        target: target.id,
        response,
        params,
        routingTime
      };
    } catch (error) {
      const routingTime = Date.now() - startTime;
      this.updateMetrics(routingTime);
      this.emit('routing:error', { request, error, routingTime });
      throw error;
    }
  }

  async forwardRequest(request, target, params) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));

    return {
      status: 200,
      data: {
        message: 'Request routed successfully',
        target: target.url,
        params
      },
      headers: {
        'X-Routed-To': target.url,
        'X-Route-Params': JSON.stringify(params)
      }
    };
  }

  addRoute(routeConfig) {
    const route = this.router.addRoute(routeConfig);
    this.emit('route:added', route);
    return route;
  }

  removeRoute(routeId) {
    const removed = this.router.removeRoute(routeId);
    if (removed) {
      this.emit('route:removed', { routeId });
    }
    return removed;
  }

  addTarget(targetConfig) {
    const target = this.router.addTarget(targetConfig);
    this.emit('target:added', target);
    return target;
  }

  startHealthChecks() {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.healthCheckInterval);
  }

  stopHealthChecks() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  async performHealthChecks() {
    const allTargets = Array.from(this.router.targets.values()).flat();

    for (const target of allTargets) {
      const wasHealthy = target.healthy;
      await target.healthCheck();

      if (wasHealthy !== target.healthy) {
        this.emit('target:health-changed', {
          target: target.id,
          healthy: target.healthy
        });
      }
    }
  }

  updateMetrics(routingTime) {
    const currentAvg = this.metrics.averageRoutingTime;
    const total = this.metrics.totalRequests;
    this.metrics.averageRoutingTime =
      (currentAvg * (total - 1) + routingTime) / total;
  }

  getMetrics() {
    return {
      ...this.metrics,
      routingSuccessRate: this.metrics.totalRequests > 0
        ? ((this.metrics.routedRequests / this.metrics.totalRequests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  getRoutes() {
    return this.router.getRoutes();
  }

  getTargetStats(routeId) {
    return this.router.getTargetStats(routeId);
  }

  shutdown() {
    this.stopHealthChecks();
    this.emit('shutdown');
  }
}

/**
 * Example usage and demonstration
 */
function demonstrateGatewayRouting() {
  console.log('=== Gateway Routing Pattern Demo ===\n');

  const gateway = new GatewayRouting({
    healthCheckInterval: 60000,
    routes: [
      {
        id: 'api-v1',
        pattern: '/api/v1/*',
        target: 'v1-service',
        priority: 10
      },
      {
        id: 'api-v2',
        pattern: '/api/v2/*',
        target: 'v2-service',
        priority: 10
      },
      {
        id: 'users',
        pattern: '/api/users/{id}',
        target: 'users-service',
        method: 'GET',
        priority: 20
      }
    ]
  });

  gateway.addTarget({
    routeId: 'api-v1',
    id: 'v1-instance-1',
    url: 'http://api-v1-1.example.com',
    weight: 70
  });

  gateway.addTarget({
    routeId: 'api-v1',
    id: 'v1-instance-2',
    url: 'http://api-v1-2.example.com',
    weight: 30
  });

  gateway.addTarget({
    routeId: 'users',
    id: 'users-instance-1',
    url: 'http://users.example.com'
  });

  gateway.on('route:matched', ({ route, target, params }) => {
    console.log(`Route matched: ${route.id} -> ${target.id}`);
    if (Object.keys(params).length > 0) {
      console.log(`Params: ${JSON.stringify(params)}`);
    }
  });

  gateway.on('routing:complete', ({ route, target, routingTime }) => {
    console.log(`Request routed in ${routingTime}ms`);
  });

  const requests = [
    { method: 'GET', path: '/api/v1/products' },
    { method: 'GET', path: '/api/v2/products' },
    { method: 'GET', path: '/api/users/123' }
  ];

  Promise.all(requests.map(req => gateway.route(req)))
    .then(results => {
      console.log('\nRouting Results:');
      results.forEach((result, i) => {
        console.log(`\nRequest ${i + 1}:`);
        console.log(`  Route: ${result.route}`);
        console.log(`  Target: ${result.target}`);
        console.log(`  Time: ${result.routingTime}ms`);
      });

      console.log('\nGateway Metrics:');
      console.log(JSON.stringify(gateway.getMetrics(), null, 2));

      gateway.shutdown();
    })
    .catch(error => {
      console.error('Routing failed:', error.message);
    });
}

if (require.main === module) {
  demonstrateGatewayRouting();
}

module.exports = GatewayRouting;
