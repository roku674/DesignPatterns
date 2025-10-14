/**
 * CQRSMS (Command Query Responsibility Segregation for Microservices) Pattern
 *
 * Extends CQRS pattern specifically for microservices architectures with distributed
 * components, service mesh integration, and cross-service event propagation.
 *
 * Key benefits:
 * - Service-level separation of read and write concerns
 * - Distributed event sourcing across microservices
 * - Service-to-service communication optimization
 * - Independent deployment and scaling of command/query services
 *
 * @module CQRSMS
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Service registry for microservices discovery
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthChecks = new Map();
  }

  /**
   * Register a service
   * @param {string} serviceName - Service name
   * @param {Object} serviceInfo - Service information
   * @returns {Promise<void>}
   */
  async register(serviceName, serviceInfo) {
    this.services.set(serviceName, {
      ...serviceInfo,
      registeredAt: new Date().toISOString(),
      status: 'healthy'
    });
  }

  /**
   * Discover a service by name
   * @param {string} serviceName - Service name
   * @returns {Promise<Object>} Service information
   */
  async discover(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }
    return service;
  }

  /**
   * Get all healthy services
   * @returns {Promise<Array<Object>>} Healthy services
   */
  async getHealthyServices() {
    return Array.from(this.services.values()).filter(s => s.status === 'healthy');
  }

  /**
   * Update service health status
   * @param {string} serviceName - Service name
   * @param {string} status - Health status
   * @returns {Promise<void>}
   */
  async updateHealthStatus(serviceName, status) {
    const service = this.services.get(serviceName);
    if (service) {
      service.status = status;
      service.lastHealthCheck = new Date().toISOString();
    }
  }
}

/**
 * Distributed command service for write operations
 */
class CommandService {
  constructor(serviceName, eventBus, serviceRegistry) {
    this.serviceName = serviceName;
    this.eventBus = eventBus;
    this.serviceRegistry = serviceRegistry;
    this.commandHandlers = new Map();
  }

  /**
   * Register command handler
   * @param {string} commandType - Command type
   * @param {Function} handler - Handler function
   */
  registerHandler(commandType, handler) {
    this.commandHandlers.set(commandType, handler);
  }

  /**
   * Process command with distributed tracing
   * @param {Object} command - Command object
   * @returns {Promise<Object>} Command result
   */
  async processCommand(command) {
    const traceId = crypto.randomUUID();
    const spanId = crypto.randomUUID();

    console.log(`[${this.serviceName}] Processing command: ${command.type} [TraceId: ${traceId}]`);

    const handler = this.commandHandlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command type: ${command.type}`);
    }

    const enrichedCommand = {
      ...command,
      metadata: {
        traceId,
        spanId,
        serviceName: this.serviceName,
        timestamp: new Date().toISOString()
      }
    };

    const result = await handler(enrichedCommand);

    await this.eventBus.publish({
      type: `${command.type}_COMPLETED`,
      aggregateId: command.aggregateId,
      result,
      metadata: enrichedCommand.metadata
    });

    return result;
  }

  /**
   * Process batch commands with parallel execution
   * @param {Array<Object>} commands - Array of commands
   * @returns {Promise<Array<Object>>} Results
   */
  async processBatch(commands) {
    const results = await Promise.allSettled(
      commands.map(cmd => this.processCommand(cmd))
    );

    return results.map((result, index) => ({
      commandId: commands[index].id,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));
  }

  /**
   * Validate command before processing
   * @param {Object} command - Command to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateCommand(command) {
    const errors = [];

    if (!command.type) {
      errors.push('Command type is required');
    }

    if (!command.aggregateId) {
      errors.push('Aggregate ID is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Distributed query service for read operations
 */
class QueryService {
  constructor(serviceName, serviceRegistry) {
    this.serviceName = serviceName;
    this.serviceRegistry = serviceRegistry;
    this.queryHandlers = new Map();
    this.cache = new Map();
    this.cacheTTL = 60000; // 60 seconds
  }

  /**
   * Register query handler
   * @param {string} queryType - Query type
   * @param {Function} handler - Handler function
   */
  registerHandler(queryType, handler) {
    this.queryHandlers.set(queryType, handler);
  }

  /**
   * Execute query with caching
   * @param {Object} query - Query object
   * @returns {Promise<Object>} Query results
   */
  async executeQuery(query) {
    const cacheKey = this.generateCacheKey(query);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      console.log(`[${this.serviceName}] Cache hit for query: ${query.type}`);
      return cached;
    }

    const handler = this.queryHandlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler registered for query type: ${query.type}`);
    }

    const enrichedQuery = {
      ...query,
      metadata: {
        traceId: crypto.randomUUID(),
        serviceName: this.serviceName,
        timestamp: new Date().toISOString()
      }
    };

    const result = await handler(enrichedQuery);
    this.setCache(cacheKey, result);

    return result;
  }

  /**
   * Execute federated query across multiple services
   * @param {Object} query - Federated query
   * @returns {Promise<Object>} Combined results
   */
  async executeFederatedQuery(query) {
    const { services, queryParts, combiner } = query;

    const results = await Promise.all(
      queryParts.map(async (queryPart, index) => {
        const serviceName = services[index];
        const service = await this.serviceRegistry.discover(serviceName);

        return {
          serviceName,
          data: await this.executeQuery(queryPart)
        };
      })
    );

    return combiner ? combiner(results) : results;
  }

  /**
   * Invalidate cache for query type
   * @param {string} queryType - Query type
   */
  invalidateCache(queryType) {
    for (const [key] of this.cache) {
      if (key.includes(queryType)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Generate cache key from query
   * @param {Object} query - Query object
   * @returns {string} Cache key
   */
  generateCacheKey(query) {
    return crypto.createHash('sha256')
      .update(JSON.stringify(query))
      .digest('hex');
  }

  /**
   * Get cached result
   * @param {string} key - Cache key
   * @returns {Object|null} Cached result
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache entry
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

/**
 * Distributed event bus for cross-service communication
 */
class DistributedEventBus extends EventEmitter {
  constructor() {
    super();
    this.subscribers = new Map();
    this.eventLog = [];
    this.maxLogSize = 1000;
  }

  /**
   * Publish event to all subscribers
   * @param {Object} event - Event to publish
   * @returns {Promise<void>}
   */
  async publish(event) {
    const enrichedEvent = {
      ...event,
      eventId: crypto.randomUUID(),
      publishedAt: new Date().toISOString()
    };

    this.logEvent(enrichedEvent);
    this.emit('event', enrichedEvent);

    const subscribers = this.subscribers.get(event.type) || [];
    await Promise.all(
      subscribers.map(subscriber => subscriber(enrichedEvent))
    );
  }

  /**
   * Subscribe to event type
   * @param {string} eventType - Event type
   * @param {Function} handler - Event handler
   */
  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(handler);
  }

  /**
   * Unsubscribe from event type
   * @param {string} eventType - Event type
   * @param {Function} handler - Event handler
   */
  unsubscribe(eventType, handler) {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Log event for audit trail
   * @param {Object} event - Event to log
   */
  logEvent(event) {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
  }

  /**
   * Get event history
   * @param {Object} filters - Filter criteria
   * @returns {Array<Object>} Filtered events
   */
  getEventHistory(filters = {}) {
    let events = [...this.eventLog];

    if (filters.type) {
      events = events.filter(e => e.type === filters.type);
    }

    if (filters.aggregateId) {
      events = events.filter(e => e.aggregateId === filters.aggregateId);
    }

    if (filters.from) {
      events = events.filter(e => new Date(e.publishedAt) >= new Date(filters.from));
    }

    if (filters.to) {
      events = events.filter(e => new Date(e.publishedAt) <= new Date(filters.to));
    }

    return events;
  }
}

/**
 * Read model synchronizer for eventual consistency
 */
class ReadModelSynchronizer {
  constructor(eventBus, queryService) {
    this.eventBus = eventBus;
    this.queryService = queryService;
    this.projections = new Map();
    this.setupEventHandlers();
  }

  /**
   * Register projection handler
   * @param {string} eventType - Event type
   * @param {Function} projector - Projection function
   */
  registerProjection(eventType, projector) {
    if (!this.projections.has(eventType)) {
      this.projections.set(eventType, []);
    }
    this.projections.get(eventType).push(projector);
  }

  /**
   * Setup event handlers for projections
   */
  setupEventHandlers() {
    this.eventBus.on('event', async (event) => {
      await this.projectEvent(event);
    });
  }

  /**
   * Project event to read models
   * @param {Object} event - Domain event
   * @returns {Promise<void>}
   */
  async projectEvent(event) {
    const projectors = this.projections.get(event.type) || [];

    await Promise.all(
      projectors.map(projector => projector(event))
    );

    this.queryService.invalidateCache(event.type);
  }

  /**
   * Rebuild all projections from event history
   * @param {Array<Object>} events - Historical events
   * @returns {Promise<void>}
   */
  async rebuildProjections(events) {
    for (const event of events) {
      await this.projectEvent(event);
    }
  }
}

/**
 * Circuit breaker for service resilience
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.threshold = options.threshold || 5;
    this.timeout = options.timeout || 60000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = null;
  }

  /**
   * Execute function with circuit breaker protection
   * @param {Function} fn - Function to execute
   * @returns {Promise<any>} Function result
   */
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  /**
   * Handle failed execution
   */
  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  /**
   * Get circuit breaker status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Main CQRSMS coordinator
 */
class CQRSMS {
  constructor(config = {}) {
    this.config = config;
    this.serviceName = config.serviceName || 'cqrs-service';

    this.serviceRegistry = new ServiceRegistry();
    this.eventBus = new DistributedEventBus();
    this.commandService = new CommandService(
      this.serviceName,
      this.eventBus,
      this.serviceRegistry
    );
    this.queryService = new QueryService(
      this.serviceName,
      this.serviceRegistry
    );
    this.synchronizer = new ReadModelSynchronizer(
      this.eventBus,
      this.queryService
    );
    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);

    this.setupDefaultHandlers();
  }

  /**
   * Setup default command and query handlers
   */
  setupDefaultHandlers() {
    this.commandService.registerHandler('CREATE', async (command) => {
      return {
        success: true,
        aggregateId: command.aggregateId,
        data: command.data
      };
    });

    this.commandService.registerHandler('UPDATE', async (command) => {
      return {
        success: true,
        aggregateId: command.aggregateId,
        data: command.data
      };
    });

    this.commandService.registerHandler('DELETE', async (command) => {
      return {
        success: true,
        aggregateId: command.aggregateId
      };
    });

    this.queryService.registerHandler('BY_ID', async (query) => {
      return {
        id: query.id,
        data: {}
      };
    });
  }

  /**
   * Execute command through circuit breaker
   * @param {Object} command - Command to execute
   * @returns {Promise<Object>} Command result
   */
  async executeCommand(command) {
    return await this.circuitBreaker.execute(async () => {
      return await this.commandService.processCommand(command);
    });
  }

  /**
   * Execute query through circuit breaker
   * @param {Object} query - Query to execute
   * @returns {Promise<Object>} Query results
   */
  async executeQuery(query) {
    return await this.circuitBreaker.execute(async () => {
      return await this.queryService.executeQuery(query);
    });
  }

  /**
   * Execute federated query across services
   * @param {Object} query - Federated query
   * @returns {Promise<Object>} Combined results
   */
  async executeFederatedQuery(query) {
    return await this.queryService.executeFederatedQuery(query);
  }

  /**
   * Register service in registry
   * @param {string} serviceName - Service name
   * @param {Object} serviceInfo - Service information
   * @returns {Promise<void>}
   */
  async registerService(serviceName, serviceInfo) {
    await this.serviceRegistry.register(serviceName, serviceInfo);
  }

  /**
   * Subscribe to event type
   * @param {string} eventType - Event type
   * @param {Function} handler - Event handler
   */
  subscribeToEvent(eventType, handler) {
    this.eventBus.subscribe(eventType, handler);
  }

  /**
   * Register read model projection
   * @param {string} eventType - Event type
   * @param {Function} projector - Projection function
   */
  registerProjection(eventType, projector) {
    this.synchronizer.registerProjection(eventType, projector);
  }

  /**
   * Get event history
   * @param {Object} filters - Filter criteria
   * @returns {Array<Object>} Filtered events
   */
  getEventHistory(filters) {
    return this.eventBus.getEventHistory(filters);
  }

  /**
   * Get service health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    return {
      serviceName: this.serviceName,
      status: 'healthy',
      circuitBreaker: this.circuitBreaker.getStatus(),
      registeredServices: Array.from(this.serviceRegistry.services.keys()),
      eventSubscribers: Array.from(this.eventBus.subscribers.keys()),
      cacheSize: this.queryService.cache.size
    };
  }

  /**
   * Shutdown service gracefully
   * @returns {Promise<void>}
   */
  async shutdown() {
    console.log(`[${this.serviceName}] Shutting down...`);
    this.eventBus.removeAllListeners();
    this.commandService.commandHandlers.clear();
    this.queryService.queryHandlers.clear();
    this.queryService.cache.clear();
  }
}

module.exports = CQRSMS;
