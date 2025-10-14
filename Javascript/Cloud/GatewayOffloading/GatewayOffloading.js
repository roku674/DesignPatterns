/**
 * Gateway Offloading Pattern
 *
 * Offloads shared or specialized service functionality to a gateway proxy.
 * Common tasks include SSL termination, authentication, authorization, logging,
 * rate limiting, and request/response transformation.
 *
 * Use Cases:
 * - SSL/TLS termination at the edge
 * - Centralized authentication and authorization
 * - Request/response logging and monitoring
 * - Rate limiting and throttling
 * - Request/response transformation
 * - Caching static content
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * SSL/TLS Termination Handler
 */
class SSLTermination {
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.forceHTTPS = config.forceHTTPS || false;
    this.hstsEnabled = config.hstsEnabled || false;
    this.hstsMaxAge = config.hstsMaxAge || 31536000;
  }

  process(request) {
    if (!this.enabled) {
      return request;
    }

    if (this.forceHTTPS && request.protocol === 'http') {
      throw new Error('HTTPS required. Redirecting to secure connection.');
    }

    const processedRequest = {
      ...request,
      secure: true,
      protocol: 'https',
      headers: {
        ...request.headers,
        'X-Forwarded-Proto': 'https'
      }
    };

    if (this.hstsEnabled) {
      processedRequest.headers['Strict-Transport-Security'] =
        `max-age=${this.hstsMaxAge}; includeSubDomains`;
    }

    return processedRequest;
  }
}

/**
 * Authentication Handler
 */
class AuthenticationHandler {
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.type = config.type || 'jwt';
    this.secretKey = config.secretKey || 'default-secret-key';
    this.tokenExpiry = config.tokenExpiry || 3600;
    this.sessions = new Map();
  }

  authenticate(request) {
    if (!this.enabled) {
      return { authenticated: true, user: null };
    }

    const token = this.extractToken(request);

    if (!token) {
      throw new Error('Authentication token missing');
    }

    const user = this.validateToken(token);

    if (!user) {
      throw new Error('Invalid authentication token');
    }

    return {
      authenticated: true,
      user,
      token
    };
  }

  extractToken(request) {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  validateToken(token) {
    const session = this.sessions.get(token);

    if (!session) {
      return null;
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    return session.user;
  }

  generateToken(user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (this.tokenExpiry * 1000);

    this.sessions.set(token, {
      user,
      expiresAt,
      createdAt: Date.now()
    });

    return { token, expiresAt };
  }

  revokeToken(token) {
    return this.sessions.delete(token);
  }
}

/**
 * Authorization Handler
 */
class AuthorizationHandler {
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.policies = new Map();
    this.roles = new Map();
  }

  authorize(user, resource, action) {
    if (!this.enabled) {
      return { authorized: true };
    }

    if (!user) {
      throw new Error('User not authenticated');
    }

    const userRoles = this.getUserRoles(user);
    const policy = this.policies.get(resource);

    if (!policy) {
      return { authorized: true };
    }

    const allowed = this.checkPermissions(userRoles, policy, action);

    if (!allowed) {
      throw new Error(`User not authorized to ${action} ${resource}`);
    }

    return {
      authorized: true,
      user,
      resource,
      action
    };
  }

  getUserRoles(user) {
    return user.roles || ['user'];
  }

  checkPermissions(roles, policy, action) {
    const requiredRoles = policy[action];

    if (!requiredRoles) {
      return true;
    }

    return roles.some(role => requiredRoles.includes(role));
  }

  addPolicy(resource, policy) {
    this.policies.set(resource, policy);
  }

  addRole(roleName, permissions) {
    this.roles.set(roleName, permissions);
  }
}

/**
 * Rate Limiting Handler
 */
class RateLimiter {
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.maxRequests = config.maxRequests || 100;
    this.windowMs = config.windowMs || 60000;
    this.clients = new Map();
  }

  checkLimit(clientId) {
    if (!this.enabled) {
      return { allowed: true, remaining: this.maxRequests };
    }

    const now = Date.now();
    const client = this.clients.get(clientId) || {
      requests: [],
      blocked: false
    };

    client.requests = client.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (client.requests.length >= this.maxRequests) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    client.requests.push(now);
    this.clients.set(clientId, client);

    return {
      allowed: true,
      remaining: this.maxRequests - client.requests.length,
      resetAt: now + this.windowMs
    };
  }

  resetClient(clientId) {
    this.clients.delete(clientId);
  }

  getStats(clientId) {
    const client = this.clients.get(clientId);
    if (!client) {
      return { requests: 0, remaining: this.maxRequests };
    }

    const now = Date.now();
    const activeRequests = client.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    return {
      requests: activeRequests.length,
      remaining: this.maxRequests - activeRequests.length,
      windowMs: this.windowMs
    };
  }
}

/**
 * Request Logger
 */
class RequestLogger {
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.logLevel = config.logLevel || 'info';
    this.logs = [];
    this.maxLogs = config.maxLogs || 1000;
  }

  log(request, response, duration) {
    if (!this.enabled) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.path,
      status: response.status,
      duration,
      clientId: request.clientId,
      userAgent: request.headers['user-agent'],
      ip: request.ip
    };

    this.logs.push(logEntry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.printLog(logEntry);
  }

  printLog(entry) {
    const statusColor = entry.status >= 400 ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(
      `[${entry.timestamp}] ${statusColor}${entry.status}${reset} ${entry.method} ${entry.path} - ${entry.duration}ms`
    );
  }

  getLogs(filter = {}) {
    let filtered = [...this.logs];

    if (filter.method) {
      filtered = filtered.filter(log => log.method === filter.method);
    }

    if (filter.status) {
      filtered = filtered.filter(log => log.status === filter.status);
    }

    if (filter.clientId) {
      filtered = filtered.filter(log => log.clientId === filter.clientId);
    }

    return filtered;
  }

  clearLogs() {
    this.logs = [];
  }
}

/**
 * Request/Response Transformer
 */
class RequestTransformer {
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.transformations = [];
  }

  addTransformation(transformation) {
    this.transformations.push(transformation);
  }

  transform(request) {
    if (!this.enabled) {
      return request;
    }

    let transformed = { ...request };

    for (const transformation of this.transformations) {
      transformed = transformation(transformed);
    }

    return transformed;
  }

  removeHeaders(headers) {
    this.addTransformation(request => {
      const newHeaders = { ...request.headers };
      headers.forEach(header => delete newHeaders[header]);
      return { ...request, headers: newHeaders };
    });
  }

  addHeaders(headers) {
    this.addTransformation(request => ({
      ...request,
      headers: { ...request.headers, ...headers }
    }));
  }

  rewritePath(pattern, replacement) {
    this.addTransformation(request => ({
      ...request,
      path: request.path.replace(pattern, replacement)
    }));
  }
}

/**
 * Main Gateway Offloading implementation
 */
class GatewayOffloading extends EventEmitter {
  constructor(config = {}) {
    super();
    this.sslTermination = new SSLTermination(config.ssl || {});
    this.authentication = new AuthenticationHandler(config.auth || {});
    this.authorization = new AuthorizationHandler(config.authz || {});
    this.rateLimiter = new RateLimiter(config.rateLimit || {});
    this.logger = new RequestLogger(config.logging || {});
    this.transformer = new RequestTransformer(config.transform || {});
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      blockedRequests: 0,
      averageResponseTime: 0
    };
  }

  async process(request) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      this.emit('request:received', request);

      let processedRequest = this.sslTermination.process(request);
      this.emit('ssl:processed', processedRequest);

      const rateLimitResult = this.rateLimiter.checkLimit(request.clientId);
      processedRequest.rateLimit = rateLimitResult;
      this.emit('ratelimit:checked', rateLimitResult);

      const authResult = this.authentication.authenticate(processedRequest);
      processedRequest.auth = authResult;
      this.emit('auth:completed', authResult);

      const authzResult = this.authorization.authorize(
        authResult.user,
        request.resource,
        request.action
      );
      processedRequest.authz = authzResult;
      this.emit('authz:completed', authzResult);

      processedRequest = this.transformer.transform(processedRequest);
      this.emit('transform:completed', processedRequest);

      const response = await this.forwardRequest(processedRequest);
      const duration = Date.now() - startTime;

      this.logger.log(request, response, duration);
      this.updateMetrics(duration, true);
      this.emit('request:completed', { request, response, duration });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const response = {
        status: 403,
        error: error.message
      };

      this.logger.log(request, response, duration);
      this.updateMetrics(duration, false);
      this.emit('request:failed', { request, error, duration });

      if (error.message.includes('Rate limit')) {
        this.metrics.blockedRequests++;
      }

      throw error;
    }
  }

  async forwardRequest(request) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));

    return {
      status: 200,
      data: {
        message: 'Request processed successfully',
        user: request.auth?.user,
        resource: request.resource
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Processed': 'true'
      }
    };
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
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0
        ? ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      blockedRequests: 0,
      averageResponseTime: 0
    };
  }
}

/**
 * Example usage and demonstration
 */
function demonstrateGatewayOffloading() {
  console.log('=== Gateway Offloading Pattern Demo ===\n');

  const gateway = new GatewayOffloading({
    ssl: {
      enabled: true,
      forceHTTPS: true,
      hstsEnabled: true
    },
    auth: {
      enabled: true,
      tokenExpiry: 3600
    },
    authz: {
      enabled: true
    },
    rateLimit: {
      enabled: true,
      maxRequests: 10,
      windowMs: 60000
    },
    logging: {
      enabled: true
    }
  });

  gateway.authorization.addPolicy('users', {
    read: ['user', 'admin'],
    write: ['admin'],
    delete: ['admin']
  });

  gateway.transformer.addHeaders({
    'X-Gateway-Version': '1.0',
    'X-Processed-By': 'GatewayOffloading'
  });

  const user = {
    id: 1,
    username: 'john_doe',
    roles: ['user']
  };

  const { token } = gateway.authentication.generateToken(user);

  const request = {
    method: 'GET',
    path: '/api/users/123',
    protocol: 'http',
    clientId: 'client-123',
    resource: 'users',
    action: 'read',
    headers: {
      'authorization': `Bearer ${token}`,
      'user-agent': 'Mozilla/5.0',
      'content-type': 'application/json'
    },
    ip: '192.168.1.100'
  };

  gateway.on('request:received', req => {
    console.log(`Request received: ${req.method} ${req.path}`);
  });

  gateway.on('auth:completed', auth => {
    console.log(`User authenticated: ${auth.user.username}`);
  });

  gateway.on('request:completed', data => {
    console.log(`Request completed in ${data.duration}ms`);
  });

  gateway.process(request)
    .then(response => {
      console.log('\nResponse:');
      console.log(JSON.stringify(response, null, 2));
      console.log('\nMetrics:');
      console.log(JSON.stringify(gateway.getMetrics(), null, 2));
    })
    .catch(error => {
      console.error('Request failed:', error.message);
    });
}

if (require.main === module) {
  demonstrateGatewayOffloading();
}

module.exports = GatewayOffloading;
