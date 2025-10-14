/**
 * Front Controller Pattern
 *
 * Provides a centralized entry point for handling all requests in a web application.
 * It acts as a single handler that processes all incoming requests and delegates
 * them to appropriate handlers while applying common preprocessing and postprocessing.
 *
 * Use Cases:
 * - Centralizing request handling logic
 * - Implementing authentication and authorization
 * - Logging and monitoring all requests
 * - Request routing and dispatching
 * - Common error handling
 * - Security filtering
 */

/**
 * Request class representing an HTTP request
 */
class Request {
  constructor(method, path, headers = {}, body = null, query = {}) {
    this.method = method.toUpperCase();
    this.path = path;
    this.headers = headers;
    this.body = body;
    this.query = query;
    this.params = {};
    this.session = {};
    this.user = null;
    this.timestamp = new Date();
  }

  /**
   * Get header value
   * @param {string} name - Header name
   * @returns {string|undefined} Header value
   */
  getHeader(name) {
    return this.headers[name.toLowerCase()];
  }

  /**
   * Set request parameter
   * @param {string} key - Parameter key
   * @param {*} value - Parameter value
   */
  setParam(key, value) {
    this.params[key] = value;
  }
}

/**
 * Response class representing an HTTP response
 */
class Response {
  constructor() {
    this.status = 200;
    this.headers = {};
    this.body = null;
    this.sent = false;
  }

  /**
   * Set response status
   * @param {number} code - HTTP status code
   * @returns {Response} This response for chaining
   */
  setStatus(code) {
    this.status = code;
    return this;
  }

  /**
   * Set response header
   * @param {string} name - Header name
   * @param {string} value - Header value
   * @returns {Response} This response for chaining
   */
  setHeader(name, value) {
    this.headers[name] = value;
    return this;
  }

  /**
   * Send JSON response
   * @param {Object} data - Response data
   * @returns {Response} This response for chaining
   */
  json(data) {
    this.setHeader('Content-Type', 'application/json');
    this.body = JSON.stringify(data);
    this.sent = true;
    return this;
  }

  /**
   * Send text response
   * @param {string} text - Response text
   * @returns {Response} This response for chaining
   */
  send(text) {
    this.setHeader('Content-Type', 'text/plain');
    this.body = text;
    this.sent = true;
    return this;
  }

  /**
   * Send HTML response
   * @param {string} html - HTML content
   * @returns {Response} This response for chaining
   */
  html(html) {
    this.setHeader('Content-Type', 'text/html');
    this.body = html;
    this.sent = true;
    return this;
  }
}

/**
 * Command interface for handling specific requests
 */
class Command {
  /**
   * Execute the command
   * @param {Request} request - HTTP request
   * @param {Response} response - HTTP response
   * @returns {Promise<void>}
   */
  async execute(request, response) {
    throw new Error('Command must implement execute method');
  }
}

/**
 * Dispatcher that routes requests to appropriate commands
 */
class Dispatcher {
  constructor() {
    this.routes = new Map();
    this.notFoundHandler = null;
  }

  /**
   * Register a route with a command
   * @param {string} method - HTTP method
   * @param {string} path - URL path
   * @param {Command} command - Command to execute
   */
  register(method, path, command) {
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, command);
  }

  /**
   * Register a parameterized route
   * @param {string} method - HTTP method
   * @param {string} pattern - URL pattern with parameters
   * @param {Command} command - Command to execute
   */
  registerPattern(method, pattern, command) {
    const key = `${method.toUpperCase()}:${pattern}`;
    this.routes.set(key, {
      pattern: this.createPatternMatcher(pattern),
      command
    });
  }

  /**
   * Create a pattern matcher for parameterized routes
   * @param {string} pattern - URL pattern
   * @returns {Object} Pattern matcher
   */
  createPatternMatcher(pattern) {
    const paramNames = [];
    const regexPattern = pattern.replace(/:([^/]+)/g, (match, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    return {
      regex: new RegExp(`^${regexPattern}$`),
      paramNames
    };
  }

  /**
   * Set handler for 404 Not Found
   * @param {Function} handler - Not found handler
   */
  onNotFound(handler) {
    this.notFoundHandler = handler;
  }

  /**
   * Dispatch request to appropriate command
   * @param {Request} request - HTTP request
   * @param {Response} response - HTTP response
   * @returns {Promise<void>}
   */
  async dispatch(request, response) {
    // Try exact match first
    const exactKey = `${request.method}:${request.path}`;
    const exactCommand = this.routes.get(exactKey);

    if (exactCommand && typeof exactCommand.execute === 'function') {
      await exactCommand.execute(request, response);
      return;
    }

    // Try pattern matching
    for (const [key, value] of this.routes.entries()) {
      if (value.pattern) {
        const match = request.path.match(value.pattern.regex);
        if (match && key.startsWith(request.method)) {
          // Extract parameters
          value.pattern.paramNames.forEach((name, index) => {
            request.setParam(name, match[index + 1]);
          });

          await value.command.execute(request, response);
          return;
        }
      }
    }

    // No route found
    if (this.notFoundHandler) {
      await this.notFoundHandler(request, response);
    } else {
      response.setStatus(404).json({ error: 'Not Found' });
    }
  }
}

/**
 * Front Controller - Main entry point for all requests
 */
class FrontController {
  constructor() {
    this.dispatcher = new Dispatcher();
    this.filters = [];
    this.errorHandlers = [];
  }

  /**
   * Add a preprocessing filter
   * @param {Function} filter - Filter function
   */
  addFilter(filter) {
    this.filters.push(filter);
  }

  /**
   * Add an error handler
   * @param {Function} handler - Error handler function
   */
  addErrorHandler(handler) {
    this.errorHandlers.push(handler);
  }

  /**
   * Register a route
   * @param {string} method - HTTP method
   * @param {string} path - URL path
   * @param {Command} command - Command to execute
   */
  registerRoute(method, path, command) {
    this.dispatcher.register(method, path, command);
  }

  /**
   * Register a parameterized route
   * @param {string} method - HTTP method
   * @param {string} pattern - URL pattern
   * @param {Command} command - Command to execute
   */
  registerPattern(method, pattern, command) {
    this.dispatcher.registerPattern(method, pattern, command);
  }

  /**
   * Set 404 handler
   * @param {Function} handler - Not found handler
   */
  onNotFound(handler) {
    this.dispatcher.onNotFound(handler);
  }

  /**
   * Handle incoming request
   * @param {Request} request - HTTP request
   * @returns {Promise<Response>} HTTP response
   */
  async handleRequest(request) {
    const response = new Response();

    try {
      // Apply preprocessing filters
      for (const filter of this.filters) {
        const continueProcessing = await filter(request, response);
        if (continueProcessing === false || response.sent) {
          return response;
        }
      }

      // Dispatch to appropriate handler
      await this.dispatcher.dispatch(request, response);

      return response;

    } catch (error) {
      // Handle errors
      for (const errorHandler of this.errorHandlers) {
        const handled = await errorHandler(error, request, response);
        if (handled === true) {
          return response;
        }
      }

      // Default error response
      if (!response.sent) {
        response.setStatus(500).json({
          error: 'Internal Server Error',
          message: error.message
        });
      }

      return response;
    }
  }
}

/**
 * REST Front Controller with common REST patterns
 */
class RESTFrontController extends FrontController {
  constructor() {
    super();
    this.resourceHandlers = new Map();
    this.setupCommonFilters();
  }

  /**
   * Setup common REST filters
   */
  setupCommonFilters() {
    // CORS filter
    this.addFilter(async (request, response) => {
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (request.method === 'OPTIONS') {
        response.setStatus(204).send('');
        return false;
      }

      return true;
    });

    // JSON parsing filter
    this.addFilter(async (request, response) => {
      if (request.body && request.getHeader('content-type') === 'application/json') {
        try {
          request.body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
        } catch (error) {
          response.setStatus(400).json({ error: 'Invalid JSON' });
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Register a RESTful resource
   * @param {string} resource - Resource name
   * @param {Object} handler - Resource handler with CRUD methods
   */
  registerResource(resource, handler) {
    this.resourceHandlers.set(resource, handler);

    // List/Index - GET /resource
    if (handler.list) {
      this.registerRoute('GET', `/${resource}`, {
        execute: async (req, res) => await handler.list(req, res)
      });
    }

    // Show/Get - GET /resource/:id
    if (handler.show) {
      this.registerPattern('GET', `/${resource}/:id`, {
        execute: async (req, res) => await handler.show(req, res)
      });
    }

    // Create - POST /resource
    if (handler.create) {
      this.registerRoute('POST', `/${resource}`, {
        execute: async (req, res) => await handler.create(req, res)
      });
    }

    // Update - PUT /resource/:id
    if (handler.update) {
      this.registerPattern('PUT', `/${resource}/:id`, {
        execute: async (req, res) => await handler.update(req, res)
      });
    }

    // Delete - DELETE /resource/:id
    if (handler.delete) {
      this.registerPattern('DELETE', `/${resource}/:id`, {
        execute: async (req, res) => await handler.delete(req, res)
      });
    }
  }
}

module.exports = {
  FrontController,
  RESTFrontController,
  Request,
  Response,
  Command,
  Dispatcher
};
