/**
 * Backends for Frontends (BFF) Pattern
 *
 * Creates separate backend services tailored to specific frontend applications
 * or user experience requirements. Each BFF optimizes API responses and aggregates
 * data specifically for its client.
 *
 * Use Cases:
 * - Mobile vs Web vs Desktop specific APIs
 * - Different API needs for iOS vs Android
 * - Optimized responses for different client capabilities
 * - Partner or third-party specific APIs
 * - Regional or localized backend variants
 */

const EventEmitter = require('events');

/**
 * Client Profile for different frontend types
 */
class ClientProfile {
  constructor(config) {
    this.type = config.type;
    this.capabilities = config.capabilities || {};
    this.preferences = config.preferences || {};
    this.constraints = config.constraints || {};
  }

  supportsFeature(feature) {
    return this.capabilities[feature] === true;
  }

  getOptimalDataFormat() {
    return this.preferences.dataFormat || 'json';
  }

  getMaxPayloadSize() {
    return this.constraints.maxPayloadSize || 1024 * 1024;
  }

  shouldCompress() {
    return this.constraints.bandwidth === 'limited';
  }
}

/**
 * Data Transformer for client-specific formatting
 */
class DataTransformer {
  constructor(clientProfile) {
    this.clientProfile = clientProfile;
  }

  transform(data, context = {}) {
    let transformed = this.filterFields(data, context);
    transformed = this.formatData(transformed);
    transformed = this.optimizePayload(transformed);

    return transformed;
  }

  filterFields(data, context) {
    if (!context.includeFields && !context.excludeFields) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.filterFields(item, context));
    }

    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const filtered = {};

    if (context.includeFields) {
      context.includeFields.forEach(field => {
        if (data[field] !== undefined) {
          filtered[field] = data[field];
        }
      });
    } else if (context.excludeFields) {
      Object.keys(data).forEach(key => {
        if (!context.excludeFields.includes(key)) {
          filtered[key] = data[key];
        }
      });
    }

    return Object.keys(filtered).length > 0 ? filtered : data;
  }

  formatData(data) {
    if (this.clientProfile.preferences.camelCase) {
      return this.toCamelCase(data);
    }

    if (this.clientProfile.preferences.snakeCase) {
      return this.toSnakeCase(data);
    }

    return data;
  }

  optimizePayload(data) {
    if (this.clientProfile.shouldCompress()) {
      return this.compressData(data);
    }

    return data;
  }

  toCamelCase(data) {
    if (Array.isArray(data)) {
      return data.map(item => this.toCamelCase(item));
    }

    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const result = {};
    Object.keys(data).forEach(key => {
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      result[camelKey] = this.toCamelCase(data[key]);
    });

    return result;
  }

  toSnakeCase(data) {
    if (Array.isArray(data)) {
      return data.map(item => this.toSnakeCase(item));
    }

    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const result = {};
    Object.keys(data).forEach(key => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = this.toSnakeCase(data[key]);
    });

    return result;
  }

  compressData(data) {
    return {
      compressed: true,
      data: JSON.stringify(data),
      originalSize: JSON.stringify(data).length
    };
  }
}

/**
 * Service Aggregator for BFF
 */
class ServiceAggregator {
  constructor() {
    this.services = new Map();
  }

  registerService(name, handler) {
    this.services.set(name, handler);
  }

  async aggregate(requests, options = {}) {
    const promises = requests.map(async request => {
      const service = this.services.get(request.service);

      if (!service) {
        throw new Error(`Service ${request.service} not found`);
      }

      try {
        const result = await service(request.params);
        return {
          service: request.service,
          success: true,
          data: result
        };
      } catch (error) {
        return {
          service: request.service,
          success: false,
          error: error.message
        };
      }
    });

    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }

      return {
        service: requests[index].service,
        success: false,
        error: result.reason.message
      };
    });
  }
}

/**
 * Backend for specific frontend type
 */
class BackendForFrontend extends EventEmitter {
  constructor(config) {
    super();
    this.type = config.type;
    this.clientProfile = new ClientProfile(config.profile);
    this.transformer = new DataTransformer(this.clientProfile);
    this.aggregator = new ServiceAggregator();
    this.endpoints = new Map();
    this.middleware = [];
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    };
  }

  use(middleware) {
    this.middleware.push(middleware);
  }

  registerEndpoint(path, handler) {
    this.endpoints.set(path, handler);
  }

  registerService(name, handler) {
    this.aggregator.registerService(name, handler);
  }

  async handleRequest(request) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      this.emit('request:start', { type: this.type, request });

      let processedRequest = request;
      for (const middleware of this.middleware) {
        processedRequest = await middleware(processedRequest);
      }

      const endpoint = this.endpoints.get(request.path);

      if (!endpoint) {
        throw new Error(`Endpoint ${request.path} not found`);
      }

      const rawData = await endpoint(processedRequest);

      const transformedData = this.transformer.transform(
        rawData,
        request.transformContext || {}
      );

      const duration = Date.now() - startTime;
      this.updateMetrics(duration, true);

      const response = {
        success: true,
        data: transformedData,
        metadata: {
          bffType: this.type,
          clientProfile: this.clientProfile.type,
          duration
        }
      };

      this.emit('request:complete', { request, response, duration });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(duration, false);

      this.emit('request:error', { request, error, duration });

      throw error;
    }
  }

  updateMetrics(duration, success) {
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    const currentAvg = this.metrics.averageResponseTime;
    const total = this.metrics.totalRequests;
    this.metrics.averageResponseTime =
      (currentAvg * (total - 1) + duration) / total;
  }

  getMetrics() {
    return {
      type: this.type,
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0
        ? ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

/**
 * Main Backends for Frontends implementation
 */
class BackendsForFrontends extends EventEmitter {
  constructor(config = {}) {
    super();
    this.backends = new Map();
    this.router = new Map();
    this.sharedServices = new Map();
    this.metrics = {
      totalRequests: 0,
      requestsByBackend: {}
    };
  }

  createBackend(type, config) {
    const backend = new BackendForFrontend({
      type,
      profile: config.profile
    });

    backend.on('request:start', data => {
      this.emit('request:routed', { backend: type, data });
    });

    backend.on('request:complete', data => {
      this.emit('request:completed', { backend: type, data });
    });

    backend.on('request:error', data => {
      this.emit('request:failed', { backend: type, data });
    });

    this.backends.set(type, backend);

    this.sharedServices.forEach((handler, name) => {
      backend.registerService(name, handler);
    });

    return backend;
  }

  getBackend(type) {
    return this.backends.get(type);
  }

  registerSharedService(name, handler) {
    this.sharedServices.set(name, handler);

    this.backends.forEach(backend => {
      backend.registerService(name, handler);
    });
  }

  routeToBackend(clientType) {
    const backend = this.backends.get(clientType);

    if (!backend) {
      throw new Error(`No backend found for client type: ${clientType}`);
    }

    return backend;
  }

  async handleRequest(clientType, request) {
    this.metrics.totalRequests++;

    if (!this.metrics.requestsByBackend[clientType]) {
      this.metrics.requestsByBackend[clientType] = 0;
    }

    this.metrics.requestsByBackend[clientType]++;

    const backend = this.routeToBackend(clientType);
    return await backend.handleRequest(request);
  }

  getMetrics() {
    const backendMetrics = {};

    this.backends.forEach((backend, type) => {
      backendMetrics[type] = backend.getMetrics();
    });

    return {
      total: this.metrics.totalRequests,
      byBackend: this.metrics.requestsByBackend,
      backends: backendMetrics
    };
  }

  getAllBackends() {
    return Array.from(this.backends.keys());
  }
}

/**
 * Example usage and demonstration
 */
function demonstrateBackendsForFrontends() {
  console.log('=== Backends for Frontends Pattern Demo ===\n');

  const bff = new BackendsForFrontends();

  const mobileBackend = bff.createBackend('mobile', {
    profile: {
      type: 'mobile',
      capabilities: {
        pushNotifications: true,
        location: true
      },
      preferences: {
        camelCase: true,
        dataFormat: 'json'
      },
      constraints: {
        bandwidth: 'limited',
        maxPayloadSize: 512 * 1024
      }
    }
  });

  const webBackend = bff.createBackend('web', {
    profile: {
      type: 'web',
      capabilities: {
        webSockets: true,
        serviceWorker: true
      },
      preferences: {
        snakeCase: false,
        dataFormat: 'json'
      },
      constraints: {
        bandwidth: 'high',
        maxPayloadSize: 2 * 1024 * 1024
      }
    }
  });

  bff.registerSharedService('users', async (params) => {
    return {
      user_id: params.id,
      user_name: 'John Doe',
      email_address: 'john@example.com',
      profile_image: 'https://example.com/image.jpg',
      created_at: '2024-01-01'
    };
  });

  bff.registerSharedService('products', async (params) => {
    return {
      product_id: params.id,
      product_name: 'Sample Product',
      price_amount: 99.99,
      in_stock: true
    };
  });

  mobileBackend.registerEndpoint('/dashboard', async (request) => {
    const results = await mobileBackend.aggregator.aggregate([
      { service: 'users', params: { id: request.userId } },
      { service: 'products', params: { id: 123 } }
    ]);

    return {
      user: results[0].data,
      featured_product: results[1].data,
      notifications_count: 5
    };
  });

  webBackend.registerEndpoint('/dashboard', async (request) => {
    const results = await webBackend.aggregator.aggregate([
      { service: 'users', params: { id: request.userId } },
      { service: 'products', params: { id: 123 } }
    ]);

    return {
      user: results[0].data,
      featured_product: results[1].data,
      notifications_count: 5,
      recommendations: ['item1', 'item2', 'item3'],
      recent_activity: []
    };
  });

  bff.on('request:completed', ({ backend, data }) => {
    console.log(`Request completed on ${backend} backend in ${data.duration}ms`);
  });

  Promise.all([
    bff.handleRequest('mobile', {
      path: '/dashboard',
      userId: 123,
      transformContext: {
        excludeFields: ['profile_image']
      }
    }),
    bff.handleRequest('web', {
      path: '/dashboard',
      userId: 123
    })
  ]).then(results => {
    console.log('\nMobile Response:');
    console.log(JSON.stringify(results[0], null, 2));

    console.log('\nWeb Response:');
    console.log(JSON.stringify(results[1], null, 2));

    console.log('\nBFF Metrics:');
    console.log(JSON.stringify(bff.getMetrics(), null, 2));
  }).catch(error => {
    console.error('Request failed:', error.message);
  });
}

if (require.main === module) {
  demonstrateBackendsForFrontends();
}

module.exports = BackendsForFrontends;
