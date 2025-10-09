/**
 * Chain of Responsibility Pattern - HTTP Request Validation Pipeline
 *
 * Real-world implementation of request validation middleware chain.
 * Each handler validates a specific aspect of the request and passes
 * it along if valid, or rejects with error details.
 */

/**
 * Base Handler for request validation
 */
class ValidationHandler {
  constructor() {
    this.nextHandler = null;
  }

  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }

  async handle(request) {
    if (this.nextHandler) {
      return await this.nextHandler.handle(request);
    }
    return { valid: true, request, errors: [] };
  }
}

/**
 * Validates authentication token
 */
class AuthenticationHandler extends ValidationHandler {
  async handle(request) {
    const errors = [];

    if (!request.headers || !request.headers.authorization) {
      errors.push({ field: 'authorization', message: 'Missing authorization header' });
      return { valid: false, request, errors };
    }

    const token = request.headers.authorization.split(' ')[1];

    if (!token || token.length < 20) {
      errors.push({ field: 'authorization', message: 'Invalid token format' });
      return { valid: false, request, errors };
    }

    // Simulate async token validation
    const isValidToken = await this.validateToken(token);

    if (!isValidToken) {
      errors.push({ field: 'authorization', message: 'Invalid or expired token' });
      return { valid: false, request, errors };
    }

    request.user = this.decodeToken(token);
    return await super.handle(request);
  }

  async validateToken(token) {
    // Simulate async validation (e.g., database lookup)
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(token.startsWith('valid_'));
      }, 10);
    });
  }

  decodeToken(token) {
    // Extract user info from token
    return {
      id: token.slice(-8),
      role: token.includes('admin') ? 'admin' : 'user'
    };
  }
}

/**
 * Validates request body schema
 */
class SchemaValidationHandler extends ValidationHandler {
  constructor(schema) {
    super();
    this.schema = schema;
  }

  async handle(request) {
    const errors = [];

    if (!request.body || typeof request.body !== 'object') {
      errors.push({ field: 'body', message: 'Request body is required' });
      return { valid: false, request, errors };
    }

    // Validate required fields
    if (this.schema.required) {
      for (const field of this.schema.required) {
        if (!(field in request.body)) {
          errors.push({ field, message: `Required field '${field}' is missing` });
        }
      }
    }

    // Validate field types
    if (this.schema.properties) {
      for (const [field, rules] of Object.entries(this.schema.properties)) {
        if (field in request.body) {
          const value = request.body[field];

          if (rules.type && typeof value !== rules.type) {
            errors.push({
              field,
              message: `Field '${field}' must be of type ${rules.type}`
            });
          }

          if (rules.minLength && value.length < rules.minLength) {
            errors.push({
              field,
              message: `Field '${field}' must be at least ${rules.minLength} characters`
            });
          }

          if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
            errors.push({
              field,
              message: `Field '${field}' does not match required pattern`
            });
          }
        }
      }
    }

    if (errors.length > 0) {
      return { valid: false, request, errors };
    }

    return await super.handle(request);
  }
}

/**
 * Validates rate limiting
 */
class RateLimitHandler extends ValidationHandler {
  constructor(maxRequests = 100, windowMs = 60000) {
    super();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  async handle(request) {
    const errors = [];
    const userId = request.user?.id || request.ip || 'anonymous';
    const now = Date.now();

    if (!this.requests.has(userId)) {
      this.requests.set(userId, []);
    }

    const userRequests = this.requests.get(userId);

    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    this.requests.set(userId, validRequests);

    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = new Date(oldestRequest + this.windowMs);

      errors.push({
        field: 'rateLimit',
        message: `Rate limit exceeded. Try again after ${resetTime.toISOString()}`,
        retryAfter: resetTime
      });

      return { valid: false, request, errors };
    }

    validRequests.push(now);
    this.requests.set(userId, validRequests);

    return await super.handle(request);
  }

  clearUserLimits(userId) {
    this.requests.delete(userId);
  }

  resetAllLimits() {
    this.requests.clear();
  }
}

/**
 * Validates user permissions
 */
class PermissionHandler extends ValidationHandler {
  constructor(requiredRole = 'user') {
    super();
    this.requiredRole = requiredRole;
    this.roleHierarchy = { admin: 2, user: 1, guest: 0 };
  }

  async handle(request) {
    const errors = [];

    if (!request.user) {
      errors.push({
        field: 'permission',
        message: 'User information not found in request'
      });
      return { valid: false, request, errors };
    }

    const userRoleLevel = this.roleHierarchy[request.user.role] || 0;
    const requiredRoleLevel = this.roleHierarchy[this.requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      errors.push({
        field: 'permission',
        message: `Insufficient permissions. Required role: ${this.requiredRole}`
      });
      return { valid: false, request, errors };
    }

    return await super.handle(request);
  }
}

/**
 * Sanitizes input to prevent XSS and injection attacks
 */
class SanitizationHandler extends ValidationHandler {
  async handle(request) {
    if (request.body && typeof request.body === 'object') {
      request.body = this.sanitizeObject(request.body);
    }

    if (request.query && typeof request.query === 'object') {
      request.query = this.sanitizeObject(request.query);
    }

    return await super.handle(request);
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
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

/**
 * Request Validator - orchestrates the validation chain
 */
class RequestValidator {
  constructor() {
    this.handler = null;
  }

  buildChain(handlers) {
    if (handlers.length === 0) {
      throw new Error('At least one handler is required');
    }

    this.handler = handlers[0];
    let current = this.handler;

    for (let i = 1; i < handlers.length; i++) {
      current = current.setNext(handlers[i]);
    }

    return this;
  }

  async validate(request) {
    if (!this.handler) {
      throw new Error('Validation chain not built. Call buildChain() first');
    }

    return await this.handler.handle(request);
  }
}

module.exports = {
  ValidationHandler,
  AuthenticationHandler,
  SchemaValidationHandler,
  RateLimitHandler,
  PermissionHandler,
  SanitizationHandler,
  RequestValidator
};
