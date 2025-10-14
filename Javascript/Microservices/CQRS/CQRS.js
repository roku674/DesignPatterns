/**
 * CQRS (Command Query Responsibility Segregation) Pattern
 *
 * Separates read and write operations into different models to optimize performance,
 * scalability, and security. Commands modify state, queries retrieve state.
 *
 * Key benefits:
 * - Independent scaling of read and write workloads
 * - Optimized data models for different access patterns
 * - Enhanced security through separation of concerns
 * - Improved performance through specialized data stores
 *
 * @module CQRS
 */

const EventEmitter = require('events');

/**
 * Command handler for write operations
 */
class CommandHandler {
  constructor(eventStore) {
    this.eventStore = eventStore;
  }

  /**
   * Handle a command to create a new entity
   * @param {Object} command - Command object
   * @returns {Promise<Object>} Command result
   */
  async handleCreate(command) {
    const { aggregateId, data, userId } = command;

    const event = {
      type: 'ENTITY_CREATED',
      aggregateId,
      data,
      userId,
      timestamp: new Date().toISOString(),
      version: 1
    };

    await this.eventStore.append(event);
    return { success: true, aggregateId, version: 1 };
  }

  /**
   * Handle a command to update an entity
   * @param {Object} command - Command object
   * @returns {Promise<Object>} Command result
   */
  async handleUpdate(command) {
    const { aggregateId, data, userId } = command;

    const currentVersion = await this.eventStore.getVersion(aggregateId);
    const newVersion = currentVersion + 1;

    const event = {
      type: 'ENTITY_UPDATED',
      aggregateId,
      data,
      userId,
      timestamp: new Date().toISOString(),
      version: newVersion
    };

    await this.eventStore.append(event);
    return { success: true, aggregateId, version: newVersion };
  }

  /**
   * Handle a command to delete an entity
   * @param {Object} command - Command object
   * @returns {Promise<Object>} Command result
   */
  async handleDelete(command) {
    const { aggregateId, userId } = command;

    const currentVersion = await this.eventStore.getVersion(aggregateId);
    const newVersion = currentVersion + 1;

    const event = {
      type: 'ENTITY_DELETED',
      aggregateId,
      userId,
      timestamp: new Date().toISOString(),
      version: newVersion
    };

    await this.eventStore.append(event);
    return { success: true, aggregateId, version: newVersion };
  }

  /**
   * Handle batch command operations
   * @param {Array<Object>} commands - Array of commands
   * @returns {Promise<Array<Object>>} Results
   */
  async handleBatch(commands) {
    const results = [];

    for (const command of commands) {
      try {
        let result;
        switch (command.type) {
          case 'CREATE':
            result = await this.handleCreate(command);
            break;
          case 'UPDATE':
            result = await this.handleUpdate(command);
            break;
          case 'DELETE':
            result = await this.handleDelete(command);
            break;
          default:
            throw new Error(`Unknown command type: ${command.type}`);
        }
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message, commandId: command.id });
      }
    }

    return results;
  }
}

/**
 * Query handler for read operations
 */
class QueryHandler {
  constructor(readStore) {
    this.readStore = readStore;
  }

  /**
   * Query single entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<Object>} Entity data
   */
  async queryById(id) {
    return await this.readStore.findById(id);
  }

  /**
   * Query entities with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array<Object>>} Matching entities
   */
  async queryByFilters(filters) {
    return await this.readStore.find(filters);
  }

  /**
   * Query with pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated results
   */
  async queryWithPagination(params) {
    const { page = 1, limit = 10, filters = {} } = params;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.readStore.find(filters, { skip, limit }),
      this.readStore.count(filters)
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Query with aggregations
   * @param {Object} params - Aggregation parameters
   * @returns {Promise<Object>} Aggregated results
   */
  async queryAggregated(params) {
    const { groupBy, aggregations, filters = {} } = params;
    return await this.readStore.aggregate(groupBy, aggregations, filters);
  }

  /**
   * Full-text search query
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array<Object>>} Search results
   */
  async search(searchTerm, options = {}) {
    return await this.readStore.search(searchTerm, options);
  }
}

/**
 * Event store for persisting domain events
 */
class EventStore extends EventEmitter {
  constructor() {
    super();
    this.events = [];
    this.snapshots = new Map();
  }

  /**
   * Append event to store
   * @param {Object} event - Domain event
   * @returns {Promise<void>}
   */
  async append(event) {
    this.events.push(event);
    this.emit('event', event);

    if (this.events.length % 10 === 0) {
      await this.createSnapshot(event.aggregateId);
    }
  }

  /**
   * Get all events for an aggregate
   * @param {string} aggregateId - Aggregate ID
   * @returns {Promise<Array<Object>>} Events
   */
  async getEvents(aggregateId) {
    return this.events.filter(e => e.aggregateId === aggregateId);
  }

  /**
   * Get current version of aggregate
   * @param {string} aggregateId - Aggregate ID
   * @returns {Promise<number>} Version number
   */
  async getVersion(aggregateId) {
    const events = await this.getEvents(aggregateId);
    return events.length > 0 ? events[events.length - 1].version : 0;
  }

  /**
   * Create snapshot of aggregate state
   * @param {string} aggregateId - Aggregate ID
   * @returns {Promise<void>}
   */
  async createSnapshot(aggregateId) {
    const events = await this.getEvents(aggregateId);
    const state = this.replayEvents(events);

    this.snapshots.set(aggregateId, {
      state,
      version: events.length > 0 ? events[events.length - 1].version : 0,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Replay events to build current state
   * @param {Array<Object>} events - Events to replay
   * @returns {Object} Current state
   */
  replayEvents(events) {
    let state = {};

    for (const event of events) {
      switch (event.type) {
        case 'ENTITY_CREATED':
          state = { ...event.data, id: event.aggregateId };
          break;
        case 'ENTITY_UPDATED':
          state = { ...state, ...event.data };
          break;
        case 'ENTITY_DELETED':
          state = { ...state, deleted: true };
          break;
      }
    }

    return state;
  }
}

/**
 * Read model store for optimized queries
 */
class ReadStore {
  constructor() {
    this.data = new Map();
    this.indexes = new Map();
  }

  /**
   * Find entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<Object>} Entity
   */
  async findById(id) {
    return this.data.get(id);
  }

  /**
   * Find entities matching filters
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options
   * @returns {Promise<Array<Object>>} Matching entities
   */
  async find(filters, options = {}) {
    let results = Array.from(this.data.values());

    Object.entries(filters).forEach(([key, value]) => {
      results = results.filter(item => item[key] === value);
    });

    if (options.skip) {
      results = results.slice(options.skip);
    }

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Count entities matching filters
   * @param {Object} filters - Query filters
   * @returns {Promise<number>} Count
   */
  async count(filters) {
    const results = await this.find(filters);
    return results.length;
  }

  /**
   * Update or insert entity in read model
   * @param {string} id - Entity ID
   * @param {Object} data - Entity data
   * @returns {Promise<void>}
   */
  async upsert(id, data) {
    this.data.set(id, { ...data, id });
    await this.updateIndexes(id, data);
  }

  /**
   * Delete entity from read model
   * @param {string} id - Entity ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    this.data.delete(id);
  }

  /**
   * Perform aggregation query
   * @param {string} groupBy - Field to group by
   * @param {Object} aggregations - Aggregation functions
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Aggregated results
   */
  async aggregate(groupBy, aggregations, filters) {
    const items = await this.find(filters);
    const groups = new Map();

    items.forEach(item => {
      const key = item[groupBy];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(item);
    });

    const results = {};
    groups.forEach((items, key) => {
      results[key] = {};
      Object.entries(aggregations).forEach(([field, func]) => {
        if (func === 'count') {
          results[key][field] = items.length;
        } else if (func === 'sum') {
          results[key][field] = items.reduce((sum, item) => sum + (item[field] || 0), 0);
        } else if (func === 'avg') {
          const sum = items.reduce((sum, item) => sum + (item[field] || 0), 0);
          results[key][field] = sum / items.length;
        }
      });
    });

    return results;
  }

  /**
   * Full-text search
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array<Object>>} Search results
   */
  async search(searchTerm, options = {}) {
    const { fields = [], limit = 10 } = options;
    const results = [];

    for (const [id, item] of this.data) {
      let matches = false;

      if (fields.length === 0) {
        matches = JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        matches = fields.some(field =>
          String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (matches) {
        results.push(item);
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  /**
   * Update indexes for efficient querying
   * @param {string} id - Entity ID
   * @param {Object} data - Entity data
   * @returns {Promise<void>}
   */
  async updateIndexes(id, data) {
    Object.entries(data).forEach(([field, value]) => {
      if (!this.indexes.has(field)) {
        this.indexes.set(field, new Map());
      }

      const fieldIndex = this.indexes.get(field);
      if (!fieldIndex.has(value)) {
        fieldIndex.set(value, new Set());
      }
      fieldIndex.get(value).add(id);
    });
  }
}

/**
 * Event projector that updates read models based on events
 */
class EventProjector {
  constructor(eventStore, readStore) {
    this.eventStore = eventStore;
    this.readStore = readStore;
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers to project events to read model
   */
  setupEventHandlers() {
    this.eventStore.on('event', async (event) => {
      await this.projectEvent(event);
    });
  }

  /**
   * Project single event to read model
   * @param {Object} event - Domain event
   * @returns {Promise<void>}
   */
  async projectEvent(event) {
    switch (event.type) {
      case 'ENTITY_CREATED':
      case 'ENTITY_UPDATED':
        await this.readStore.upsert(event.aggregateId, event.data);
        break;
      case 'ENTITY_DELETED':
        await this.readStore.delete(event.aggregateId);
        break;
    }
  }

  /**
   * Rebuild entire read model from event store
   * @returns {Promise<void>}
   */
  async rebuildProjections() {
    const allEvents = this.eventStore.events;

    for (const event of allEvents) {
      await this.projectEvent(event);
    }
  }
}

/**
 * Main CQRS coordinator
 */
class CQRS {
  constructor(config = {}) {
    this.config = config;
    this.eventStore = new EventStore();
    this.readStore = new ReadStore();
    this.commandHandler = new CommandHandler(this.eventStore);
    this.queryHandler = new QueryHandler(this.readStore);
    this.projector = new EventProjector(this.eventStore, this.readStore);
  }

  /**
   * Execute a command (write operation)
   * @param {Object} command - Command to execute
   * @returns {Promise<Object>} Command result
   */
  async executeCommand(command) {
    const { type, ...params } = command;

    switch (type) {
      case 'CREATE':
        return await this.commandHandler.handleCreate(params);
      case 'UPDATE':
        return await this.commandHandler.handleUpdate(params);
      case 'DELETE':
        return await this.commandHandler.handleDelete(params);
      case 'BATCH':
        return await this.commandHandler.handleBatch(params.commands);
      default:
        throw new Error(`Unknown command type: ${type}`);
    }
  }

  /**
   * Execute a query (read operation)
   * @param {Object} query - Query to execute
   * @returns {Promise<Object>} Query results
   */
  async executeQuery(query) {
    const { type, ...params } = query;

    switch (type) {
      case 'BY_ID':
        return await this.queryHandler.queryById(params.id);
      case 'BY_FILTERS':
        return await this.queryHandler.queryByFilters(params.filters);
      case 'PAGINATED':
        return await this.queryHandler.queryWithPagination(params);
      case 'AGGREGATED':
        return await this.queryHandler.queryAggregated(params);
      case 'SEARCH':
        return await this.queryHandler.search(params.searchTerm, params.options);
      default:
        throw new Error(`Unknown query type: ${type}`);
    }
  }

  /**
   * Get event history for an aggregate
   * @param {string} aggregateId - Aggregate ID
   * @returns {Promise<Array<Object>>} Event history
   */
  async getEventHistory(aggregateId) {
    return await this.eventStore.getEvents(aggregateId);
  }

  /**
   * Rebuild read models from event store
   * @returns {Promise<void>}
   */
  async rebuildReadModels() {
    await this.projector.rebuildProjections();
  }

  /**
   * Get system statistics
   * @returns {Object} System statistics
   */
  getStatistics() {
    return {
      totalEvents: this.eventStore.events.length,
      totalEntities: this.readStore.data.size,
      snapshots: this.eventStore.snapshots.size,
      indexes: this.readStore.indexes.size
    };
  }
}

module.exports = CQRS;
