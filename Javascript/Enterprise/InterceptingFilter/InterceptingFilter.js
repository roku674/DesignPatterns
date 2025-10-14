/**
 * Intercepting Filter Pattern
 *
 * Provides a pluggable mechanism to process common services in a standard manner
 * before and after request processing. Filters intercept incoming requests and
 * outgoing responses, allowing for preprocessing and postprocessing operations.
 *
 * Use Cases:
 * - Authentication and authorization
 * - Logging and auditing
 * - Data compression and encryption
 * - Input validation and sanitization
 * - Performance monitoring
 * - CORS handling
 * - Rate limiting
 * - Caching
 */

/**
 * Base Filter Interface
 * All filters must implement the execute method
 */
class Filter {
  /**
   * Execute filter logic
   * @param {Object} request - Request object
   * @param {Object} response - Response object
   * @param {FilterChain} chain - Filter chain
   * @returns {Promise<void>}
   */
  async execute(request, response, chain) {
    throw new Error('Filter must implement execute method');
  }

  /**
   * Get filter name
   * @returns {string} Filter name
   */
  getName() {
    return this.constructor.name;
  }
}

/**
 * Filter Chain
 * Manages the execution of filters in sequence
 */
class FilterChain {
  constructor(filters = [], target = null) {
    this.filters = filters;
    this.target = target;
    this.index = 0;
  }

  /**
   * Execute next filter in chain
   * @param {Object} request - Request object
   * @param {Object} response - Response object
   * @returns {Promise<void>}
   */
  async doFilter(request, response) {
    if (this.index < this.filters.length) {
      const filter = this.filters[this.index];
      this.index++;
      await filter.execute(request, response, this);
    } else if (this.target) {
      // All filters executed, call target
      await this.target.execute(request, response);
    }
  }
}

/**
 * Filter Manager
 * Manages filter registration and execution
 */
class FilterManager {
  constructor() {
    this.filters = [];
    this.filterMap = new Map();
  }

  /**
   * Add filter to the chain
   * @param {Filter} filter - Filter to add
   * @param {number} priority - Filter priority (lower executes first)
   */
  addFilter(filter, priority = 100) {
    this.filters.push({ filter, priority });
    this.filterMap.set(filter.getName(), filter);

    // Sort by priority
    this.filters.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove filter by name
   * @param {string} filterName - Name of filter to remove
   */
  removeFilter(filterName) {
    this.filters = this.filters.filter(f => f.filter.getName() !== filterName);
    this.filterMap.delete(filterName);
  }

  /**
   * Get filter by name
   * @param {string} filterName - Filter name
   * @returns {Filter|null} Filter instance
   */
  getFilter(filterName) {
    return this.filterMap.get(filterName) || null;
  }

  /**
   * Create filter chain for request
   * @param {Object} target - Target handler
   * @returns {FilterChain} Filter chain
   */
  createFilterChain(target) {
    const filterInstances = this.filters.map(f => f.filter);
    return new FilterChain(filterInstances, target);
  }

  /**
   * Get all filters
   * @returns {Array} All filters with priorities
   */
  getFilters() {
    return this.filters.map(f => ({
      name: f.filter.getName(),
      priority: f.priority
    }));
  }
}

/**
 * Authentication Filter
 * Validates user authentication
 */
class AuthenticationFilter extends Filter {
  constructor(authService, excludePaths = []) {
    super();
    this.authService = authService;
    this.excludePaths = excludePaths;
  }

  async execute(request, response, chain) {
    // Check if path is excluded
    if (this.excludePaths.some(path => request.path.startsWith(path))) {
      await chain.doFilter(request, response);
      return;
    }

    const token = request.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      response.status = 401;
      response.body = { error: 'Authentication required' };
      return;
    }

    try {
      const user = await this.authService.validateToken(token);
      if (!user) {
        response.status = 401;
        response.body = { error: 'Invalid token' };
        return;
      }

      request.user = user;
      await chain.doFilter(request, response);

    } catch (error) {
      response.status = 401;
      response.body = { error: 'Authentication failed' };
    }
  }
}

/**
 * Authorization Filter
 * Checks user permissions
 */
class AuthorizationFilter extends Filter {
  constructor(permissions) {
    super();
    this.permissions = permissions;
  }

  async execute(request, response, chain) {
    if (!request.user) {
      response.status = 401;
      response.body = { error: 'Not authenticated' };
      return;
    }

    const requiredPermission = this.permissions[request.path];

    if (requiredPermission && !request.user.permissions?.includes(requiredPermission)) {
      response.status = 403;
      response.body = { error: 'Insufficient permissions' };
      return;
    }

    await chain.doFilter(request, response);
  }
}

/**
 * Logging Filter
 * Logs request and response information
 */
class LoggingFilter extends Filter {
  constructor(logger = console) {
    super();
    this.logger = logger;
  }

  async execute(request, response, chain) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    this.logger.log(`[${requestId}] ${request.method} ${request.path} - START`);

    try {
      await chain.doFilter(request, response);
    } finally {
      const duration = Date.now() - startTime;
      this.logger.log(
        `[${requestId}] ${request.method} ${request.path} - END (${duration}ms) Status: ${response.status || 200}`
      );
    }
  }
}

/**
 * Validation Filter
 * Validates request data
 */
class ValidationFilter extends Filter {
  constructor(rules) {
    super();
    this.rules = rules;
  }

  async execute(request, response, chain) {
    const rule = this.rules[request.path];

    if (!rule) {
      await chain.doFilter(request, response);
      return;
    }

    const errors = [];

    if (rule.requiredFields) {
      for (const field of rule.requiredFields) {
        if (!request.body || !request.body[field]) {
          errors.push(`${field} is required`);
        }
      }
    }

    if (rule.validate && request.body) {
      const validationResult = rule.validate(request.body);
      if (validationResult && validationResult.length > 0) {
        errors.push(...validationResult);
      }
    }

    if (errors.length > 0) {
      response.status = 400;
      response.body = { errors };
      return;
    }

    await chain.doFilter(request, response);
  }
}

/**
 * CORS Filter
 * Handles Cross-Origin Resource Sharing
 */
class CORSFilter extends Filter {
  constructor(options = {}) {
    super();
    this.allowedOrigins = options.allowedOrigins || ['*'];
    this.allowedMethods = options.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    this.allowedHeaders = options.allowedHeaders || ['Content-Type', 'Authorization'];
    this.maxAge = options.maxAge || 86400;
  }

  async execute(request, response, chain) {
    const origin = request.headers?.origin;

    if (this.allowedOrigins.includes('*') || this.allowedOrigins.includes(origin)) {
      response.headers = response.headers || {};
      response.headers['Access-Control-Allow-Origin'] = origin || '*';
      response.headers['Access-Control-Allow-Methods'] = this.allowedMethods.join(', ');
      response.headers['Access-Control-Allow-Headers'] = this.allowedHeaders.join(', ');
      response.headers['Access-Control-Max-Age'] = this.maxAge;
    }

    if (request.method === 'OPTIONS') {
      response.status = 204;
      response.body = '';
      return;
    }

    await chain.doFilter(request, response);
  }
}

/**
 * Rate Limiting Filter
 * Implements request rate limiting
 */
class RateLimitFilter extends Filter {
  constructor(options = {}) {
    super();
    this.maxRequests = options.maxRequests || 100;
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.requests = new Map();
  }

  async execute(request, response, chain) {
    const identifier = request.user?.id || request.headers?.['x-forwarded-for'] || 'anonymous';
    const now = Date.now();

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const userRequests = this.requests.get(identifier);
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      response.status = 429;
      response.headers = response.headers || {};
      response.headers['Retry-After'] = Math.ceil(this.windowMs / 1000);
      response.body = { error: 'Too many requests' };
      return;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    response.headers = response.headers || {};
    response.headers['X-RateLimit-Limit'] = this.maxRequests;
    response.headers['X-RateLimit-Remaining'] = this.maxRequests - recentRequests.length;
    response.headers['X-RateLimit-Reset'] = now + this.windowMs;

    await chain.doFilter(request, response);
  }
}

/**
 * Compression Filter
 * Compresses response data
 */
class CompressionFilter extends Filter {
  constructor(minSize = 1024) {
    super();
    this.minSize = minSize;
  }

  async execute(request, response, chain) {
    await chain.doFilter(request, response);

    // Post-processing: compress response if large enough
    if (response.body && JSON.stringify(response.body).length > this.minSize) {
      const acceptEncoding = request.headers?.['accept-encoding'] || '';

      if (acceptEncoding.includes('gzip')) {
        response.headers = response.headers || {};
        response.headers['Content-Encoding'] = 'gzip';
        response.compressed = true;
        // In real implementation, would actually compress the data
      }
    }
  }
}

/**
 * Caching Filter
 * Implements response caching
 */
class CachingFilter extends Filter {
  constructor(ttl = 300000) {
    super();
    this.cache = new Map();
    this.ttl = ttl; // 5 minutes default
  }

  async execute(request, response, chain) {
    if (request.method !== 'GET') {
      await chain.doFilter(request, response);
      return;
    }

    const cacheKey = `${request.method}:${request.path}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.ttl) {
      response.status = cached.response.status;
      response.body = cached.response.body;
      response.headers = { ...cached.response.headers, 'X-Cache': 'HIT' };
      return;
    }

    await chain.doFilter(request, response);

    // Cache successful responses
    if (response.status === 200 || !response.status) {
      this.cache.set(cacheKey, {
        response: {
          status: response.status,
          body: response.body,
          headers: response.headers
        },
        timestamp: Date.now()
      });

      response.headers = response.headers || {};
      response.headers['X-Cache'] = 'MISS';
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

/**
 * Error Handling Filter
 * Catches and formats errors
 */
class ErrorHandlingFilter extends Filter {
  async execute(request, response, chain) {
    try {
      await chain.doFilter(request, response);
    } catch (error) {
      console.error('Error in filter chain:', error);

      response.status = error.statusCode || 500;
      response.body = {
        error: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      };
    }
  }
}

/**
 * Sanitization Filter
 * Sanitizes input data
 */
class SanitizationFilter extends Filter {
  async execute(request, response, chain) {
    if (request.body && typeof request.body === 'object') {
      request.body = this.sanitizeObject(request.body);
    }

    await chain.doFilter(request, response);
  }

  sanitizeObject(obj) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  sanitizeString(str) {
    return str
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }
}

module.exports = {
  Filter,
  FilterChain,
  FilterManager,
  AuthenticationFilter,
  AuthorizationFilter,
  LoggingFilter,
  ValidationFilter,
  CORSFilter,
  RateLimitFilter,
  CompressionFilter,
  CachingFilter,
  ErrorHandlingFilter,
  SanitizationFilter
};
