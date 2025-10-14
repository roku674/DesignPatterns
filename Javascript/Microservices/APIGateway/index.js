/**
 * API Gateway Pattern
 *
 * Provides a single entry point for all clients. The API Gateway handles requests in one of two ways:
 * - Proxies/routes requests to appropriate microservices
 * - Fans out requests to multiple services and aggregates results
 *
 * Benefits:
 * - Insulates clients from how the application is partitioned
 * - Reduces number of requests/roundtrips
 * - Simplifies client code
 * - Provides authentication, monitoring, rate limiting
 */

const EventEmitter = require('events');

/**
 * Service Registry for tracking available microservices
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map();
  }

  /**
   * Register a service with the registry
   * @param {string} name - Service name
   * @param {Object} service - Service instance
   */
  register(name, service) {
    this.services.set(name, service);
    console.log(`[Registry] Service registered: ${name}`);
  }

  /**
   * Get a service by name
   * @param {string} name - Service name
   * @returns {Object|null} Service instance or null
   */
  getService(name) {
    return this.services.get(name) || null;
  }

  /**
   * Unregister a service
   * @param {string} name - Service name
   */
  unregister(name) {
    this.services.delete(name);
    console.log(`[Registry] Service unregistered: ${name}`);
  }

  /**
   * Get all registered services
   * @returns {Array} Array of service names
   */
  listServices() {
    return Array.from(this.services.keys());
  }
}

/**
 * Rate Limiter for controlling request rates
 */
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   * @param {string} clientId - Client identifier
   * @returns {boolean} True if request is allowed
   */
  isAllowed(clientId) {
    const now = Date.now();
    const clientRequests = this.requests.get(clientId) || [];

    // Remove old requests outside the window
    const validRequests = clientRequests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(clientId, validRequests);
    return true;
  }

  /**
   * Get remaining requests for a client
   * @param {string} clientId - Client identifier
   * @returns {number} Remaining requests
   */
  getRemaining(clientId) {
    const now = Date.now();
    const clientRequests = this.requests.get(clientId) || [];
    const validRequests = clientRequests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

/**
 * Request Logger for monitoring
 */
class RequestLogger {
  constructor() {
    this.logs = [];
  }

  /**
   * Log a request
   * @param {Object} request - Request details
   */
  log(request) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.path,
      clientId: request.clientId,
      duration: request.duration,
      statusCode: request.statusCode
    };
    this.logs.push(logEntry);
    console.log(`[Logger] ${logEntry.method} ${logEntry.path} - ${logEntry.statusCode} (${logEntry.duration}ms)`);
  }

  /**
   * Get logs for a specific time period
   * @param {number} minutes - Minutes to look back
   * @returns {Array} Filtered logs
   */
  getRecentLogs(minutes = 5) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.logs.filter(log => new Date(log.timestamp).getTime() > cutoff);
  }
}

/**
 * Authentication Manager
 */
class AuthenticationManager {
  constructor() {
    this.tokens = new Map();
  }

  /**
   * Validate authentication token
   * @param {string} token - Auth token
   * @returns {Object|null} User info or null
   */
  validateToken(token) {
    if (!token) {
      return null;
    }
    return this.tokens.get(token) || null;
  }

  /**
   * Create a new token
   * @param {Object} user - User information
   * @returns {string} Generated token
   */
  createToken(user) {
    const token = `token_${Date.now()}_${Math.random().toString(36)}`;
    this.tokens.set(token, { ...user, createdAt: Date.now() });
    return token;
  }

  /**
   * Revoke a token
   * @param {string} token - Token to revoke
   */
  revokeToken(token) {
    this.tokens.delete(token);
  }
}

/**
 * API Gateway - Main implementation
 */
class APIGateway extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      port: config.port || 3000,
      enableRateLimiting: config.enableRateLimiting !== false,
      enableLogging: config.enableLogging !== false,
      enableAuth: config.enableAuth !== false,
      maxRequestsPerMinute: config.maxRequestsPerMinute || 100
    };

    this.registry = new ServiceRegistry();
    this.rateLimiter = new RateLimiter(this.config.maxRequestsPerMinute);
    this.logger = new RequestLogger();
    this.authManager = new AuthenticationManager();
    this.routes = new Map();
  }

  /**
   * Register a microservice
   * @param {string} name - Service name
   * @param {Object} service - Service instance
   */
  registerService(name, service) {
    this.registry.register(name, service);
    this.emit('service-registered', { name, service });
  }

  /**
   * Register a route
   * @param {string} method - HTTP method
   * @param {string} path - Route path
   * @param {Function} handler - Route handler
   */
  registerRoute(method, path, handler) {
    const key = `${method}:${path}`;
    this.routes.set(key, handler);
    console.log(`[Gateway] Route registered: ${key}`);
  }

  /**
   * Handle incoming request
   * @param {Object} request - Request object
   * @returns {Promise<Object>} Response object
   */
  async handleRequest(request) {
    const startTime = Date.now();

    try {
      // Authentication
      if (this.config.enableAuth && !request.skipAuth) {
        const user = this.authManager.validateToken(request.headers?.authorization);
        if (!user) {
          return this.createResponse(401, { error: 'Unauthorized' }, startTime);
        }
        request.user = user;
      }

      // Rate Limiting
      if (this.config.enableRateLimiting) {
        const clientId = request.clientId || request.ip || 'anonymous';
        if (!this.rateLimiter.isAllowed(clientId)) {
          return this.createResponse(429, { error: 'Too Many Requests' }, startTime);
        }
      }

      // Route matching
      const routeKey = `${request.method}:${request.path}`;
      const handler = this.routes.get(routeKey);

      if (!handler) {
        return this.createResponse(404, { error: 'Route not found' }, startTime);
      }

      // Execute handler
      const result = await handler(request, this);
      const response = this.createResponse(200, result, startTime);

      // Logging
      if (this.config.enableLogging) {
        this.logger.log({ ...request, ...response });
      }

      this.emit('request-handled', { request, response });
      return response;

    } catch (error) {
      console.error('[Gateway] Error handling request:', error.message);
      const response = this.createResponse(500, { error: error.message }, startTime);

      if (this.config.enableLogging) {
        this.logger.log({ ...request, ...response, error: error.message });
      }

      this.emit('request-error', { request, error });
      return response;
    }
  }

  /**
   * Create a standardized response
   * @param {number} statusCode - HTTP status code
   * @param {Object} data - Response data
   * @param {number} startTime - Request start time
   * @returns {Object} Response object
   */
  createResponse(statusCode, data, startTime) {
    return {
      statusCode,
      data,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Proxy request to a specific service
   * @param {string} serviceName - Target service name
   * @param {string} method - Method to call
   * @param {Object} params - Method parameters
   * @returns {Promise<any>} Service response
   */
  async proxyToService(serviceName, method, params) {
    const service = this.registry.getService(serviceName);

    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }

    if (typeof service[method] !== 'function') {
      throw new Error(`Method not found: ${serviceName}.${method}`);
    }

    return await service[method](params);
  }

  /**
   * Fan out request to multiple services and aggregate results
   * @param {Array} services - Array of {serviceName, method, params}
   * @returns {Promise<Object>} Aggregated results
   */
  async fanOut(services) {
    const promises = services.map(async ({ serviceName, method, params }) => {
      try {
        const result = await this.proxyToService(serviceName, method, params);
        return { serviceName, success: true, data: result };
      } catch (error) {
        return { serviceName, success: false, error: error.message };
      }
    });

    const results = await Promise.all(promises);

    return {
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * Get gateway statistics
   * @returns {Object} Gateway stats
   */
  getStats() {
    return {
      registeredServices: this.registry.listServices(),
      registeredRoutes: Array.from(this.routes.keys()),
      recentLogs: this.logger.getRecentLogs(5),
      config: this.config
    };
  }

  /**
   * Create authentication token
   * @param {Object} user - User information
   * @returns {string} Auth token
   */
  createAuthToken(user) {
    return this.authManager.createToken(user);
  }
}

// Example Microservices

/**
 * User Service
 */
class UserService {
  constructor() {
    this.users = new Map([
      [1, { id: 1, name: 'Alice', email: 'alice@example.com' }],
      [2, { id: 2, name: 'Bob', email: 'bob@example.com' }]
    ]);
  }

  async getUser(params) {
    await this.simulateLatency();
    const user = this.users.get(params.id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async listUsers() {
    await this.simulateLatency();
    return Array.from(this.users.values());
  }

  simulateLatency() {
    return new Promise(resolve => setTimeout(resolve, 50));
  }
}

/**
 * Order Service
 */
class OrderService {
  constructor() {
    this.orders = new Map([
      [1, { id: 1, userId: 1, total: 150.00, status: 'shipped' }],
      [2, { id: 2, userId: 2, total: 75.50, status: 'pending' }]
    ]);
  }

  async getOrder(params) {
    await this.simulateLatency();
    const order = this.orders.get(params.id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async getOrdersByUser(params) {
    await this.simulateLatency();
    return Array.from(this.orders.values())
      .filter(order => order.userId === params.userId);
  }

  simulateLatency() {
    return new Promise(resolve => setTimeout(resolve, 50));
  }
}

/**
 * Product Service
 */
class ProductService {
  constructor() {
    this.products = new Map([
      [1, { id: 1, name: 'Laptop', price: 999.99 }],
      [2, { id: 2, name: 'Mouse', price: 29.99 }]
    ]);
  }

  async getProduct(params) {
    await this.simulateLatency();
    const product = this.products.get(params.id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async searchProducts(params) {
    await this.simulateLatency();
    return Array.from(this.products.values())
      .filter(p => p.name.toLowerCase().includes(params.query.toLowerCase()));
  }

  simulateLatency() {
    return new Promise(resolve => setTimeout(resolve, 50));
  }
}

// Example Usage and Scenarios

async function demonstrateAPIGateway() {
  console.log('=== API Gateway Pattern Demo ===\n');

  // Scenario 1: Basic Setup
  console.log('Scenario 1: Setting up API Gateway');
  const gateway = new APIGateway({
    port: 3000,
    enableRateLimiting: true,
    enableAuth: true,
    maxRequestsPerMinute: 100
  });

  // Register services
  const userService = new UserService();
  const orderService = new OrderService();
  const productService = new ProductService();

  gateway.registerService('users', userService);
  gateway.registerService('orders', orderService);
  gateway.registerService('products', productService);

  // Scenario 2: Register Routes
  console.log('\nScenario 2: Registering routes');

  gateway.registerRoute('GET', '/api/users/:id', async (req, gateway) => {
    return await gateway.proxyToService('users', 'getUser', { id: parseInt(req.params.id) });
  });

  gateway.registerRoute('GET', '/api/orders/:id', async (req, gateway) => {
    return await gateway.proxyToService('orders', 'getOrder', { id: parseInt(req.params.id) });
  });

  gateway.registerRoute('GET', '/api/products/search', async (req, gateway) => {
    return await gateway.proxyToService('products', 'searchProducts', { query: req.query.q });
  });

  // Aggregated endpoint - combines data from multiple services
  gateway.registerRoute('GET', '/api/users/:id/profile', async (req, gateway) => {
    const userId = parseInt(req.params.id);

    const results = await gateway.fanOut([
      { serviceName: 'users', method: 'getUser', params: { id: userId } },
      { serviceName: 'orders', method: 'getOrdersByUser', params: { userId } }
    ]);

    const userData = results.results.find(r => r.serviceName === 'users');
    const orderData = results.results.find(r => r.serviceName === 'orders');

    return {
      user: userData.success ? userData.data : null,
      orders: orderData.success ? orderData.data : [],
      stats: {
        successful: results.successful,
        failed: results.failed
      }
    };
  });

  // Scenario 3: Authentication
  console.log('\nScenario 3: Creating authentication tokens');
  const token = gateway.createAuthToken({ id: 1, username: 'alice' });
  console.log('Auth token created:', token.substring(0, 20) + '...');

  // Scenario 4: Handling Requests
  console.log('\nScenario 4: Handling authenticated requests');
  const response1 = await gateway.handleRequest({
    method: 'GET',
    path: '/api/users/:id',
    params: { id: '1' },
    headers: { authorization: token },
    clientId: 'client-1'
  });
  console.log('Response:', response1);

  // Scenario 5: Aggregated Request
  console.log('\nScenario 5: Aggregated request (user profile)');
  const response2 = await gateway.handleRequest({
    method: 'GET',
    path: '/api/users/:id/profile',
    params: { id: '1' },
    headers: { authorization: token },
    clientId: 'client-1'
  });
  console.log('Aggregated response:', JSON.stringify(response2.data, null, 2));

  // Scenario 6: Rate Limiting
  console.log('\nScenario 6: Testing rate limiting');
  const limitedGateway = new APIGateway({
    maxRequestsPerMinute: 3
  });

  limitedGateway.registerService('users', userService);
  limitedGateway.registerRoute('GET', '/api/test', async () => ({ success: true }));

  for (let i = 1; i <= 5; i++) {
    const response = await limitedGateway.handleRequest({
      method: 'GET',
      path: '/api/test',
      clientId: 'test-client',
      skipAuth: true
    });
    console.log(`Request ${i}: Status ${response.statusCode}`);
  }

  // Scenario 7: Error Handling
  console.log('\nScenario 7: Error handling');
  const response3 = await gateway.handleRequest({
    method: 'GET',
    path: '/api/users/:id',
    params: { id: '999' },
    headers: { authorization: token },
    clientId: 'client-1'
  });
  console.log('Error response:', response3);

  // Scenario 8: Unauthorized Access
  console.log('\nScenario 8: Unauthorized access');
  const response4 = await gateway.handleRequest({
    method: 'GET',
    path: '/api/users/:id',
    params: { id: '1' },
    headers: { authorization: 'invalid-token' },
    clientId: 'client-1'
  });
  console.log('Unauthorized response:', response4);

  // Scenario 9: Gateway Statistics
  console.log('\nScenario 9: Gateway statistics');
  const stats = gateway.getStats();
  console.log('Gateway stats:', {
    services: stats.registeredServices,
    routes: stats.registeredRoutes.length,
    recentRequests: stats.recentLogs.length
  });

  // Scenario 10: Event Monitoring
  console.log('\nScenario 10: Setting up event monitoring');
  gateway.on('request-handled', (data) => {
    console.log(`Event: Request handled - ${data.request.method} ${data.request.path}`);
  });

  gateway.on('service-registered', (data) => {
    console.log(`Event: Service registered - ${data.name}`);
  });

  await gateway.handleRequest({
    method: 'GET',
    path: '/api/users/:id',
    params: { id: '2' },
    headers: { authorization: token },
    clientId: 'client-1'
  });
}

// Run demonstration
if (require.main === module) {
  demonstrateAPIGateway().catch(console.error);
}

module.exports = APIGateway;
