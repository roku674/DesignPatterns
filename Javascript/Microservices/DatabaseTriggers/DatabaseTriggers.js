/**
 * Database Triggers Pattern
 *
 * Uses database triggers to automatically capture data changes and publish events.
 * Triggers execute stored procedures when INSERT, UPDATE, or DELETE operations occur,
 * writing change events to an event table that can be consumed by other services.
 *
 * Key Components:
 * - Database Triggers: Automatic execution on data changes
 * - Event Table: Stores captured change events
 * - Change Data Capture: Records what changed, when, and by whom
 * - Event Publisher: Polls event table and publishes to message bus
 * - Trigger Types: BEFORE/AFTER INSERT/UPDATE/DELETE
 */

const EventEmitter = require('events');

/**
 * Database Change Event
 */
class ChangeEvent {
  constructor(operation, tableName, recordId, oldData, newData, metadata = {}) {
    this.id = this.generateId();
    this.operation = operation; // INSERT, UPDATE, DELETE
    this.tableName = tableName;
    this.recordId = recordId;
    this.oldData = oldData;
    this.newData = newData;
    this.timestamp = new Date().toISOString();
    this.userId = metadata.userId || 'system';
    this.transactionId = metadata.transactionId;
    this.published = false;
    this.publishedAt = null;
    this.metadata = metadata;
  }

  generateId() {
    return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getChangedFields() {
    if (this.operation === 'INSERT') {
      return Object.keys(this.newData || {});
    }
    if (this.operation === 'DELETE') {
      return Object.keys(this.oldData || {});
    }
    if (this.operation === 'UPDATE') {
      const changed = [];
      const newKeys = Object.keys(this.newData || {});
      for (const key of newKeys) {
        if (JSON.stringify(this.oldData[key]) !== JSON.stringify(this.newData[key])) {
          changed.push(key);
        }
      }
      return changed;
    }
    return [];
  }

  toJSON() {
    return {
      id: this.id,
      operation: this.operation,
      tableName: this.tableName,
      recordId: this.recordId,
      oldData: this.oldData,
      newData: this.newData,
      changedFields: this.getChangedFields(),
      timestamp: this.timestamp,
      userId: this.userId,
      transactionId: this.transactionId,
      published: this.published,
      publishedAt: this.publishedAt,
      metadata: this.metadata
    };
  }
}

/**
 * Database Trigger
 */
class DatabaseTrigger {
  constructor(name, tableName, operation, timing, handler) {
    this.name = name;
    this.tableName = tableName;
    this.operation = operation; // INSERT, UPDATE, DELETE
    this.timing = timing; // BEFORE, AFTER
    this.handler = handler;
    this.enabled = true;
    this.executionCount = 0;
    this.lastExecutedAt = null;
  }

  /**
   * Execute trigger
   */
  async execute(oldData, newData, context) {
    if (!this.enabled) {
      return { proceed: true, modifiedData: newData };
    }

    this.executionCount++;
    this.lastExecutedAt = new Date().toISOString();

    try {
      const result = await this.handler(oldData, newData, context);
      return result || { proceed: true, modifiedData: newData };
    } catch (error) {
      console.error(`Trigger ${this.name} failed:`, error);
      throw error;
    }
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  getStats() {
    return {
      name: this.name,
      tableName: this.tableName,
      operation: this.operation,
      timing: this.timing,
      enabled: this.enabled,
      executionCount: this.executionCount,
      lastExecutedAt: this.lastExecutedAt
    };
  }
}

/**
 * Database with Trigger Support
 */
class TriggerEnabledDatabase {
  constructor() {
    this.tables = new Map();
    this.triggers = new Map(); // triggerKey -> trigger
    this.eventTable = []; // Stores change events
    this.transactionLog = [];
    this.currentTransaction = null;
  }

  /**
   * Register trigger
   */
  registerTrigger(trigger) {
    const key = `${trigger.tableName}.${trigger.operation}.${trigger.timing}`;

    if (!this.triggers.has(key)) {
      this.triggers.set(key, []);
    }

    this.triggers.get(key).push(trigger);
    console.log(`Registered trigger: ${trigger.name} on ${key}`);
  }

  /**
   * Get triggers for operation
   */
  getTriggers(tableName, operation, timing) {
    const key = `${tableName}.${operation}.${timing}`;
    return this.triggers.get(key) || [];
  }

  /**
   * Create table
   */
  createTable(tableName, schema = {}) {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, {
        name: tableName,
        schema,
        records: new Map()
      });
      console.log(`Table created: ${tableName}`);
    }
  }

  /**
   * Insert record with triggers
   */
  async insert(tableName, recordId, data, metadata = {}) {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    const context = {
      metadata,
      transactionId: this.currentTransaction,
      timestamp: new Date().toISOString()
    };

    // Execute BEFORE INSERT triggers
    const beforeTriggers = this.getTriggers(tableName, 'INSERT', 'BEFORE');
    let modifiedData = { ...data };

    for (const trigger of beforeTriggers) {
      const result = await trigger.execute(null, modifiedData, context);
      if (!result.proceed) {
        throw new Error(`Insert rejected by trigger ${trigger.name}`);
      }
      modifiedData = result.modifiedData || modifiedData;
    }

    // Perform insert
    table.records.set(recordId, { ...modifiedData, id: recordId });

    // Execute AFTER INSERT triggers
    const afterTriggers = this.getTriggers(tableName, 'INSERT', 'AFTER');
    for (const trigger of afterTriggers) {
      await trigger.execute(null, modifiedData, context);
    }

    return table.records.get(recordId);
  }

  /**
   * Update record with triggers
   */
  async update(tableName, recordId, newData, metadata = {}) {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    const oldRecord = table.records.get(recordId);
    if (!oldRecord) {
      throw new Error(`Record ${recordId} not found in ${tableName}`);
    }

    const context = {
      metadata,
      transactionId: this.currentTransaction,
      timestamp: new Date().toISOString()
    };

    // Execute BEFORE UPDATE triggers
    const beforeTriggers = this.getTriggers(tableName, 'UPDATE', 'BEFORE');
    let modifiedData = { ...newData };

    for (const trigger of beforeTriggers) {
      const result = await trigger.execute(oldRecord, modifiedData, context);
      if (!result.proceed) {
        throw new Error(`Update rejected by trigger ${trigger.name}`);
      }
      modifiedData = result.modifiedData || modifiedData;
    }

    // Perform update
    const updatedRecord = { ...oldRecord, ...modifiedData };
    table.records.set(recordId, updatedRecord);

    // Execute AFTER UPDATE triggers
    const afterTriggers = this.getTriggers(tableName, 'UPDATE', 'AFTER');
    for (const trigger of afterTriggers) {
      await trigger.execute(oldRecord, updatedRecord, context);
    }

    return updatedRecord;
  }

  /**
   * Delete record with triggers
   */
  async delete(tableName, recordId, metadata = {}) {
    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    const oldRecord = table.records.get(recordId);
    if (!oldRecord) {
      throw new Error(`Record ${recordId} not found in ${tableName}`);
    }

    const context = {
      metadata,
      transactionId: this.currentTransaction,
      timestamp: new Date().toISOString()
    };

    // Execute BEFORE DELETE triggers
    const beforeTriggers = this.getTriggers(tableName, 'DELETE', 'BEFORE');
    for (const trigger of beforeTriggers) {
      const result = await trigger.execute(oldRecord, null, context);
      if (!result.proceed) {
        throw new Error(`Delete rejected by trigger ${trigger.name}`);
      }
    }

    // Perform delete
    table.records.delete(recordId);

    // Execute AFTER DELETE triggers
    const afterTriggers = this.getTriggers(tableName, 'DELETE', 'AFTER');
    for (const trigger of afterTriggers) {
      await trigger.execute(oldRecord, null, context);
    }

    return oldRecord;
  }

  /**
   * Read record
   */
  read(tableName, recordId) {
    const table = this.tables.get(tableName);
    if (!table) {
      return null;
    }
    return table.records.get(recordId);
  }

  /**
   * Add event to event table
   */
  addEvent(event) {
    this.eventTable.push(event);
  }

  /**
   * Get unpublished events
   */
  getUnpublishedEvents(limit = 10) {
    return this.eventTable
      .filter(evt => !evt.published)
      .slice(0, limit);
  }

  /**
   * Mark event as published
   */
  markEventPublished(eventId) {
    const event = this.eventTable.find(evt => evt.id === eventId);
    if (event) {
      event.published = true;
      event.publishedAt = new Date().toISOString();
    }
  }

  /**
   * Get trigger statistics
   */
  getTriggerStats() {
    const stats = [];
    for (const triggers of this.triggers.values()) {
      for (const trigger of triggers) {
        stats.push(trigger.getStats());
      }
    }
    return stats;
  }

  /**
   * Get event table statistics
   */
  getEventStats() {
    const stats = {
      total: this.eventTable.length,
      published: 0,
      unpublished: 0,
      byOperation: {},
      byTable: {}
    };

    for (const evt of this.eventTable) {
      if (evt.published) {
        stats.published++;
      } else {
        stats.unpublished++;
      }

      stats.byOperation[evt.operation] = (stats.byOperation[evt.operation] || 0) + 1;
      stats.byTable[evt.tableName] = (stats.byTable[evt.tableName] || 0) + 1;
    }

    return stats;
  }
}

/**
 * Event Publisher - publishes database events to message bus
 */
class DatabaseEventPublisher extends EventEmitter {
  constructor(database, options = {}) {
    super();
    this.database = database;
    this.pollingInterval = options.pollingInterval || 1000;
    this.batchSize = options.batchSize || 10;
    this.isRunning = false;
    this.pollTimer = null;
    this.publishedCount = 0;
  }

  /**
   * Start polling and publishing
   */
  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.poll();
    console.log(`Event publisher started (polling every ${this.pollingInterval}ms)`);
  }

  /**
   * Stop polling
   */
  stop() {
    this.isRunning = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    console.log('Event publisher stopped');
  }

  /**
   * Poll event table
   */
  async poll() {
    if (!this.isRunning) {
      return;
    }

    try {
      await this.publishEvents();
    } catch (error) {
      console.error('Error publishing events:', error);
    }

    this.pollTimer = setTimeout(() => this.poll(), this.pollingInterval);
  }

  /**
   * Publish unpublished events
   */
  async publishEvents() {
    const events = this.database.getUnpublishedEvents(this.batchSize);

    for (const event of events) {
      await this.publishEvent(event);
    }
  }

  /**
   * Publish single event
   */
  async publishEvent(event) {
    try {
      // Emit event
      this.emit('database-change', event);
      this.emit(`${event.tableName}.${event.operation}`, event);

      // Mark as published
      this.database.markEventPublished(event.id);
      this.publishedCount++;

      console.log(`Published event: ${event.tableName}.${event.operation} [${event.recordId}]`);
    } catch (error) {
      console.error(`Failed to publish event ${event.id}:`, error);
    }
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      publishedCount: this.publishedCount,
      eventStats: this.database.getEventStats()
    };
  }
}

/**
 * Example: User service with database triggers
 */
class UserService {
  constructor() {
    this.database = new TriggerEnabledDatabase();
    this.eventPublisher = new DatabaseEventPublisher(this.database, {
      pollingInterval: 500
    });

    this.setupDatabase();
    this.setupTriggers();
  }

  /**
   * Setup database tables
   */
  setupDatabase() {
    this.database.createTable('users', {
      id: 'string',
      email: 'string',
      name: 'string',
      status: 'string',
      createdAt: 'string',
      updatedAt: 'string'
    });

    this.database.createTable('audit_log', {
      id: 'string',
      action: 'string',
      userId: 'string',
      details: 'object',
      timestamp: 'string'
    });
  }

  /**
   * Setup triggers
   */
  setupTriggers() {
    // BEFORE INSERT: Set timestamps
    this.database.registerTrigger(new DatabaseTrigger(
      'user_before_insert',
      'users',
      'INSERT',
      'BEFORE',
      async (oldData, newData, context) => {
        const now = new Date().toISOString();
        return {
          proceed: true,
          modifiedData: {
            ...newData,
            createdAt: now,
            updatedAt: now,
            status: newData.status || 'active'
          }
        };
      }
    ));

    // AFTER INSERT: Create change event
    this.database.registerTrigger(new DatabaseTrigger(
      'user_after_insert',
      'users',
      'INSERT',
      'AFTER',
      async (oldData, newData, context) => {
        const event = new ChangeEvent(
          'INSERT',
          'users',
          newData.id,
          null,
          newData,
          context.metadata
        );
        this.database.addEvent(event);
        return { proceed: true };
      }
    ));

    // BEFORE UPDATE: Update timestamp
    this.database.registerTrigger(new DatabaseTrigger(
      'user_before_update',
      'users',
      'UPDATE',
      'BEFORE',
      async (oldData, newData, context) => {
        return {
          proceed: true,
          modifiedData: {
            ...newData,
            updatedAt: new Date().toISOString()
          }
        };
      }
    ));

    // AFTER UPDATE: Create change event
    this.database.registerTrigger(new DatabaseTrigger(
      'user_after_update',
      'users',
      'UPDATE',
      'AFTER',
      async (oldData, newData, context) => {
        const event = new ChangeEvent(
          'UPDATE',
          'users',
          newData.id,
          oldData,
          newData,
          context.metadata
        );
        this.database.addEvent(event);
        return { proceed: true };
      }
    ));

    // AFTER DELETE: Create change event
    this.database.registerTrigger(new DatabaseTrigger(
      'user_after_delete',
      'users',
      'DELETE',
      'AFTER',
      async (oldData, newData, context) => {
        const event = new ChangeEvent(
          'DELETE',
          'users',
          oldData.id,
          oldData,
          null,
          context.metadata
        );
        this.database.addEvent(event);
        return { proceed: true };
      }
    ));

    // Validation trigger
    this.database.registerTrigger(new DatabaseTrigger(
      'user_validate_email',
      'users',
      'INSERT',
      'BEFORE',
      async (oldData, newData, context) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newData.email)) {
          throw new Error('Invalid email format');
        }
        return { proceed: true, modifiedData: newData };
      }
    ));
  }

  /**
   * Create user
   */
  async createUser(userId, email, name) {
    return await this.database.insert('users', userId, { email, name }, { userId: 'admin' });
  }

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    return await this.database.update('users', userId, updates, { userId: 'admin' });
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    return await this.database.delete('users', userId, { userId: 'admin' });
  }

  /**
   * Get user
   */
  getUser(userId) {
    return this.database.read('users', userId);
  }

  /**
   * Start event publisher
   */
  startPublisher() {
    this.eventPublisher.start();
  }

  /**
   * Stop event publisher
   */
  stopPublisher() {
    this.eventPublisher.stop();
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      triggers: this.database.getTriggerStats(),
      events: this.database.getEventStats(),
      publisher: this.eventPublisher.getStats()
    };
  }
}

/**
 * Demo function
 */
async function demonstrateDatabaseTriggers() {
  console.log('=== Database Triggers Pattern Demo ===\n');

  // Create user service
  const userService = new UserService();

  // Subscribe to change events
  userService.eventPublisher.on('database-change', (event) => {
    console.log(`Change detected: ${event.operation} on ${event.tableName} [${event.recordId}]`);
  });

  userService.eventPublisher.on('users.INSERT', (event) => {
    console.log(`New user created: ${event.newData.email}`);
  });

  userService.eventPublisher.on('users.UPDATE', (event) => {
    console.log(`User updated: ${event.recordId}, changed fields:`, event.getChangedFields());
  });

  // Start event publisher
  userService.startPublisher();

  // Create users (triggers will fire automatically)
  console.log('Creating users (triggers execute automatically)...\n');
  await userService.createUser('user-001', 'john@example.com', 'John Doe');
  await userService.createUser('user-002', 'jane@example.com', 'Jane Smith');
  await userService.createUser('user-003', 'bob@example.com', 'Bob Johnson');

  // Wait for events to publish
  await delay(1000);

  // Update users
  console.log('\nUpdating users...\n');
  await userService.updateUser('user-001', { name: 'John Updated' });
  await userService.updateUser('user-002', { status: 'inactive' });

  await delay(1000);

  // Delete user
  console.log('\nDeleting user...\n');
  await userService.deleteUser('user-003');

  await delay(1000);

  // Stop publisher
  userService.stopPublisher();

  // Display statistics
  console.log('\n=== Statistics ===\n');
  const stats = userService.getStats();

  console.log('Trigger Statistics:');
  stats.triggers.forEach(trigger => {
    console.log(`  ${trigger.name}: ${trigger.executionCount} executions`);
  });

  console.log('\nEvent Statistics:');
  console.log(JSON.stringify(stats.events, null, 2));

  console.log('\nPublisher Statistics:');
  console.log(JSON.stringify(stats.publisher, null, 2));

  return userService;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export components
module.exports = {
  ChangeEvent,
  DatabaseTrigger,
  TriggerEnabledDatabase,
  DatabaseEventPublisher,
  UserService,
  demonstrateDatabaseTriggers
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateDatabaseTriggers()
    .then(() => console.log('\n✅ Database Triggers demo completed'))
    .catch(error => console.error('❌ Error:', error));
}
