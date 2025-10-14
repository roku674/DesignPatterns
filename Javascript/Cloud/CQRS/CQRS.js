/**
 * CQRS Pattern (Command Query Responsibility Segregation)
 *
 * CQRS separates read and write operations into different models.
 * This pattern improves scalability, performance, and security by allowing
 * independent optimization of read and write operations.
 *
 * Key Concepts:
 * - Commands: Mutate state (writes)
 * - Queries: Return data (reads)
 * - Separate models for reads and writes
 * - Event sourcing integration
 * - Eventual consistency
 * - Read model optimization
 *
 * Benefits:
 * - Independent scaling of reads and writes
 * - Optimized data models for different use cases
 * - Better security through separation
 * - Improved performance
 * - Audit trail through event sourcing
 *
 * Use Cases:
 * - High-traffic applications
 * - Complex business logic
 * - Event-driven architectures
 * - Systems requiring audit trails
 * - Microservices architectures
 *
 * @module CQRS
 */

/**
 * Command result status
 */
const CommandStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  PENDING: 'pending'
};

/**
 * Event types for event sourcing
 */
const EventType = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  STATE_CHANGED: 'state_changed'
};

/**
 * Base Command class
 */
class Command {
  /**
   * Create a command
   * @param {string} type - Command type
   * @param {Object} payload - Command data
   */
  constructor(type, payload = {}) {
    this.id = this.generateId();
    this.type = type;
    this.payload = payload;
    this.timestamp = new Date();
    this.userId = payload.userId || 'system';
  }

  generateId() {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Base Query class
 */
class Query {
  /**
   * Create a query
   * @param {string} type - Query type
   * @param {Object} criteria - Query criteria
   */
  constructor(type, criteria = {}) {
    this.id = this.generateId();
    this.type = type;
    this.criteria = criteria;
    this.timestamp = new Date();
  }

  generateId() {
    return `qry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Domain Event for event sourcing
 */
class DomainEvent {
  /**
   * Create a domain event
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  constructor(type, data = {}) {
    this.id = this.generateId();
    this.type = type;
    this.data = data;
    this.timestamp = new Date();
    this.version = 1;
  }

  generateId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Event Store for storing domain events
 */
class EventStore {
  constructor() {
    this.events = [];
    this.subscribers = new Map();
  }

  /**
   * Append event to store
   * @param {DomainEvent} event - Event to store
   */
  async append(event) {
    this.events.push(event);
    await this.notifySubscribers(event);
    console.log(`[EventStore] Event stored: ${event.type} (${event.id})`);
  }

  /**
   * Get all events
   * @returns {Array<DomainEvent>} All events
   */
  getAllEvents() {
    return [...this.events];
  }

  /**
   * Get events by type
   * @param {string} type - Event type
   * @returns {Array<DomainEvent>} Filtered events
   */
  getEventsByType(type) {
    return this.events.filter(e => e.type === type);
  }

  /**
   * Get events after timestamp
   * @param {Date} timestamp - Starting timestamp
   * @returns {Array<DomainEvent>} Filtered events
   */
  getEventsSince(timestamp) {
    return this.events.filter(e => e.timestamp >= timestamp);
  }

  /**
   * Subscribe to events
   * @param {string} eventType - Event type to subscribe to
   * @param {Function} handler - Event handler
   */
  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(handler);
  }

  /**
   * Notify subscribers of new event
   * @param {DomainEvent} event - Event to notify about
   */
  async notifySubscribers(event) {
    const handlers = this.subscribers.get(event.type) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`[EventStore] Subscriber error:`, error);
      }
    }
  }
}

/**
 * Write Model - Handles commands and business logic
 */
class WriteModel {
  constructor(eventStore) {
    this.eventStore = eventStore;
    this.entities = new Map();
  }

  /**
   * Handle command
   * @param {Command} command - Command to handle
   * @returns {Promise<Object>} Command result
   */
  async handleCommand(command) {
    console.log(`[WriteModel] Handling command: ${command.type}`);

    try {
      let event;

      switch (command.type) {
        case 'CREATE_USER':
          event = await this.createUser(command);
          break;
        case 'UPDATE_USER':
          event = await this.updateUser(command);
          break;
        case 'DELETE_USER':
          event = await this.deleteUser(command);
          break;
        case 'CREATE_ORDER':
          event = await this.createOrder(command);
          break;
        case 'UPDATE_ORDER_STATUS':
          event = await this.updateOrderStatus(command);
          break;
        default:
          throw new Error(`Unknown command type: ${command.type}`);
      }

      await this.eventStore.append(event);

      return {
        status: CommandStatus.SUCCESS,
        commandId: command.id,
        eventId: event.id,
        data: event.data
      };

    } catch (error) {
      console.error(`[WriteModel] Command failed:`, error);
      return {
        status: CommandStatus.FAILURE,
        commandId: command.id,
        error: error.message
      };
    }
  }

  /**
   * Create user entity
   * @param {Command} command - Create user command
   * @returns {Promise<DomainEvent>} User created event
   */
  async createUser(command) {
    const { name, email } = command.payload;
    const userId = `user_${Date.now()}`;

    const user = {
      id: userId,
      name,
      email,
      createdAt: new Date(),
      version: 1
    };

    this.entities.set(userId, user);

    return new DomainEvent(EventType.CREATED, {
      entityType: 'user',
      entityId: userId,
      user
    });
  }

  /**
   * Update user entity
   * @param {Command} command - Update user command
   * @returns {Promise<DomainEvent>} User updated event
   */
  async updateUser(command) {
    const { userId, updates } = command.payload;

    const user = this.entities.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
      version: user.version + 1
    };

    this.entities.set(userId, updatedUser);

    return new DomainEvent(EventType.UPDATED, {
      entityType: 'user',
      entityId: userId,
      updates,
      user: updatedUser
    });
  }

  /**
   * Delete user entity
   * @param {Command} command - Delete user command
   * @returns {Promise<DomainEvent>} User deleted event
   */
  async deleteUser(command) {
    const { userId } = command.payload;

    const user = this.entities.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    this.entities.delete(userId);

    return new DomainEvent(EventType.DELETED, {
      entityType: 'user',
      entityId: userId,
      deletedUser: user
    });
  }

  /**
   * Create order entity
   * @param {Command} command - Create order command
   * @returns {Promise<DomainEvent>} Order created event
   */
  async createOrder(command) {
    const { userId, items, total } = command.payload;
    const orderId = `order_${Date.now()}`;

    const order = {
      id: orderId,
      userId,
      items,
      total,
      status: 'pending',
      createdAt: new Date(),
      version: 1
    };

    this.entities.set(orderId, order);

    return new DomainEvent(EventType.CREATED, {
      entityType: 'order',
      entityId: orderId,
      order
    });
  }

  /**
   * Update order status
   * @param {Command} command - Update order status command
   * @returns {Promise<DomainEvent>} Order status changed event
   */
  async updateOrderStatus(command) {
    const { orderId, status } = command.payload;

    const order = this.entities.get(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date(),
      version: order.version + 1
    };

    this.entities.set(orderId, updatedOrder);

    return new DomainEvent(EventType.STATE_CHANGED, {
      entityType: 'order',
      entityId: orderId,
      oldStatus: order.status,
      newStatus: status,
      order: updatedOrder
    });
  }
}

/**
 * Read Model - Optimized for queries
 */
class ReadModel {
  constructor(eventStore) {
    this.eventStore = eventStore;
    this.projections = new Map();
    this.initializeProjections();
  }

  /**
   * Initialize projections from event store
   */
  initializeProjections() {
    // Subscribe to events to keep read model in sync
    this.eventStore.subscribe(EventType.CREATED, event => this.projectCreated(event));
    this.eventStore.subscribe(EventType.UPDATED, event => this.projectUpdated(event));
    this.eventStore.subscribe(EventType.DELETED, event => this.projectDeleted(event));
    this.eventStore.subscribe(EventType.STATE_CHANGED, event => this.projectStateChanged(event));

    // Rebuild from existing events
    this.rebuild();
  }

  /**
   * Rebuild projections from event store
   */
  async rebuild() {
    console.log('[ReadModel] Rebuilding projections from events...');
    const events = this.eventStore.getAllEvents();

    for (const event of events) {
      await this.applyEvent(event);
    }

    console.log('[ReadModel] Projections rebuilt');
  }

  /**
   * Apply event to projections
   * @param {DomainEvent} event - Event to apply
   */
  async applyEvent(event) {
    switch (event.type) {
      case EventType.CREATED:
        await this.projectCreated(event);
        break;
      case EventType.UPDATED:
        await this.projectUpdated(event);
        break;
      case EventType.DELETED:
        await this.projectDeleted(event);
        break;
      case EventType.STATE_CHANGED:
        await this.projectStateChanged(event);
        break;
    }
  }

  /**
   * Project created entity
   * @param {DomainEvent} event - Created event
   */
  async projectCreated(event) {
    const { entityType, entityId } = event.data;
    const key = `${entityType}:${entityId}`;

    if (entityType === 'user') {
      this.projections.set(key, event.data.user);
    } else if (entityType === 'order') {
      this.projections.set(key, event.data.order);
    }
  }

  /**
   * Project updated entity
   * @param {DomainEvent} event - Updated event
   */
  async projectUpdated(event) {
    const { entityType, entityId, user } = event.data;
    const key = `${entityType}:${entityId}`;

    if (user) {
      this.projections.set(key, user);
    }
  }

  /**
   * Project deleted entity
   * @param {DomainEvent} event - Deleted event
   */
  async projectDeleted(event) {
    const { entityType, entityId } = event.data;
    const key = `${entityType}:${entityId}`;
    this.projections.delete(key);
  }

  /**
   * Project state changed entity
   * @param {DomainEvent} event - State changed event
   */
  async projectStateChanged(event) {
    const { entityType, entityId, order } = event.data;
    const key = `${entityType}:${entityId}`;

    if (order) {
      this.projections.set(key, order);
    }
  }

  /**
   * Handle query
   * @param {Query} query - Query to handle
   * @returns {Promise<Object>} Query result
   */
  async handleQuery(query) {
    console.log(`[ReadModel] Handling query: ${query.type}`);

    try {
      let data;

      switch (query.type) {
        case 'GET_USER':
          data = await this.getUser(query);
          break;
        case 'GET_ALL_USERS':
          data = await this.getAllUsers(query);
          break;
        case 'GET_ORDER':
          data = await this.getOrder(query);
          break;
        case 'GET_ORDERS_BY_USER':
          data = await this.getOrdersByUser(query);
          break;
        case 'GET_ORDERS_BY_STATUS':
          data = await this.getOrdersByStatus(query);
          break;
        default:
          throw new Error(`Unknown query type: ${query.type}`);
      }

      return {
        success: true,
        queryId: query.id,
        data
      };

    } catch (error) {
      console.error(`[ReadModel] Query failed:`, error);
      return {
        success: false,
        queryId: query.id,
        error: error.message
      };
    }
  }

  /**
   * Get user by ID
   * @param {Query} query - Get user query
   * @returns {Promise<Object>} User data
   */
  async getUser(query) {
    const { userId } = query.criteria;
    const key = `user:${userId}`;
    const user = this.projections.get(key);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    return user;
  }

  /**
   * Get all users
   * @param {Query} query - Get all users query
   * @returns {Promise<Array>} All users
   */
  async getAllUsers(query) {
    const users = [];

    for (const [key, value] of this.projections.entries()) {
      if (key.startsWith('user:')) {
        users.push(value);
      }
    }

    return users;
  }

  /**
   * Get order by ID
   * @param {Query} query - Get order query
   * @returns {Promise<Object>} Order data
   */
  async getOrder(query) {
    const { orderId } = query.criteria;
    const key = `order:${orderId}`;
    const order = this.projections.get(key);

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    return order;
  }

  /**
   * Get orders by user
   * @param {Query} query - Get orders by user query
   * @returns {Promise<Array>} User orders
   */
  async getOrdersByUser(query) {
    const { userId } = query.criteria;
    const orders = [];

    for (const [key, value] of this.projections.entries()) {
      if (key.startsWith('order:') && value.userId === userId) {
        orders.push(value);
      }
    }

    return orders;
  }

  /**
   * Get orders by status
   * @param {Query} query - Get orders by status query
   * @returns {Promise<Array>} Orders with matching status
   */
  async getOrdersByStatus(query) {
    const { status } = query.criteria;
    const orders = [];

    for (const [key, value] of this.projections.entries()) {
      if (key.startsWith('order:') && value.status === status) {
        orders.push(value);
      }
    }

    return orders;
  }
}

/**
 * Main CQRS implementation
 */
class CQRS {
  /**
   * Create CQRS instance
   * @param {Object} config - CQRS configuration
   */
  constructor(config = {}) {
    this.eventStore = new EventStore();
    this.writeModel = new WriteModel(this.eventStore);
    this.readModel = new ReadModel(this.eventStore);
  }

  /**
   * Execute command
   * @param {Command} command - Command to execute
   * @returns {Promise<Object>} Command result
   */
  async executeCommand(command) {
    return await this.writeModel.handleCommand(command);
  }

  /**
   * Execute query
   * @param {Query} query - Query to execute
   * @returns {Promise<Object>} Query result
   */
  async executeQuery(query) {
    return await this.readModel.handleQuery(query);
  }

  /**
   * Get event store
   * @returns {EventStore} Event store instance
   */
  getEventStore() {
    return this.eventStore;
  }
}

/**
 * Scenario demonstrations
 */

/**
 * Scenario 1: Basic user management
 */
async function demonstrateUserManagement() {
  console.log('\n=== Scenario 1: User Management ===');

  const cqrs = new CQRS();

  // Create user
  const createCommand = new Command('CREATE_USER', {
    name: 'John Doe',
    email: 'john@example.com'
  });

  const createResult = await cqrs.executeCommand(createCommand);
  console.log('Create result:', createResult);

  const userId = createResult.data.user.id;

  // Query user
  await sleep(50);
  const getQuery = new Query('GET_USER', { userId });
  const getResult = await cqrs.executeQuery(getQuery);
  console.log('Get result:', getResult);

  // Update user
  const updateCommand = new Command('UPDATE_USER', {
    userId,
    updates: { name: 'John Smith' }
  });

  await cqrs.executeCommand(updateCommand);

  // Query updated user
  const getUpdatedResult = await cqrs.executeQuery(getQuery);
  console.log('Updated user:', getUpdatedResult);
}

/**
 * Scenario 2: Order processing
 */
async function demonstrateOrderProcessing() {
  console.log('\n=== Scenario 2: Order Processing ===');

  const cqrs = new CQRS();

  // Create user first
  const createUserCmd = new Command('CREATE_USER', {
    name: 'Jane Doe',
    email: 'jane@example.com'
  });

  const userResult = await cqrs.executeCommand(createUserCmd);
  const userId = userResult.data.user.id;

  // Create order
  const createOrderCmd = new Command('CREATE_ORDER', {
    userId,
    items: [
      { product: 'Laptop', quantity: 1, price: 999 }
    ],
    total: 999
  });

  const orderResult = await cqrs.executeCommand(createOrderCmd);
  console.log('Order created:', orderResult);

  const orderId = orderResult.data.order.id;

  // Update order status
  const statusUpdates = ['processing', 'shipped', 'delivered'];

  for (const status of statusUpdates) {
    await sleep(100);

    const updateStatusCmd = new Command('UPDATE_ORDER_STATUS', {
      orderId,
      status
    });

    await cqrs.executeCommand(updateStatusCmd);
    console.log(`Order status updated to: ${status}`);
  }

  // Query final order state
  const orderQuery = new Query('GET_ORDER', { orderId });
  const finalOrder = await cqrs.executeQuery(orderQuery);
  console.log('Final order state:', finalOrder);
}

/**
 * Scenario 3: Event sourcing replay
 */
async function demonstrateEventSourcing() {
  console.log('\n=== Scenario 3: Event Sourcing ===');

  const cqrs = new CQRS();

  // Generate some events
  const createCmd = new Command('CREATE_USER', {
    name: 'Alice',
    email: 'alice@example.com'
  });

  const result = await cqrs.executeCommand(createCmd);
  const userId = result.data.user.id;

  await cqrs.executeCommand(new Command('UPDATE_USER', {
    userId,
    updates: { name: 'Alice Smith' }
  }));

  await cqrs.executeCommand(new Command('UPDATE_USER', {
    userId,
    updates: { email: 'alice.smith@example.com' }
  }));

  // Get all events
  const events = cqrs.getEventStore().getAllEvents();
  console.log(`Total events in store: ${events.length}`);

  events.forEach((event, index) => {
    console.log(`Event ${index + 1}:`, {
      type: event.type,
      entityType: event.data.entityType,
      timestamp: event.timestamp
    });
  });
}

/**
 * Scenario 4: Query optimization
 */
async function demonstrateQueryOptimization() {
  console.log('\n=== Scenario 4: Query Optimization ===');

  const cqrs = new CQRS();

  // Create multiple users
  for (let i = 1; i <= 5; i++) {
    await cqrs.executeCommand(new Command('CREATE_USER', {
      name: `User ${i}`,
      email: `user${i}@example.com`
    }));
  }

  await sleep(100);

  // Query all users
  const getAllQuery = new Query('GET_ALL_USERS');
  const allUsers = await cqrs.executeQuery(getAllQuery);
  console.log(`Found ${allUsers.data.length} users`);
}

/**
 * Scenario 5: Complex order queries
 */
async function demonstrateComplexQueries() {
  console.log('\n=== Scenario 5: Complex Order Queries ===');

  const cqrs = new CQRS();

  // Create user
  const userResult = await cqrs.executeCommand(new Command('CREATE_USER', {
    name: 'Bob',
    email: 'bob@example.com'
  }));

  const userId = userResult.data.user.id;

  // Create multiple orders
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];

  for (let i = 0; i < 4; i++) {
    const orderResult = await cqrs.executeCommand(new Command('CREATE_ORDER', {
      userId,
      items: [{ product: `Product ${i}`, quantity: 1, price: 100 }],
      total: 100
    }));

    const orderId = orderResult.data.order.id;

    await cqrs.executeCommand(new Command('UPDATE_ORDER_STATUS', {
      orderId,
      status: statuses[i]
    }));
  }

  await sleep(100);

  // Query orders by user
  const userOrdersQuery = new Query('GET_ORDERS_BY_USER', { userId });
  const userOrders = await cqrs.executeQuery(userOrdersQuery);
  console.log(`User has ${userOrders.data.length} orders`);

  // Query orders by status
  const pendingQuery = new Query('GET_ORDERS_BY_STATUS', { status: 'shipped' });
  const shippedOrders = await cqrs.executeQuery(pendingQuery);
  console.log(`Shipped orders: ${shippedOrders.data.length}`);
}

/**
 * Scenario 6: Event-driven updates
 */
async function demonstrateEventDrivenUpdates() {
  console.log('\n=== Scenario 6: Event-Driven Updates ===');

  const cqrs = new CQRS();

  // Subscribe to events
  cqrs.getEventStore().subscribe(EventType.CREATED, event => {
    console.log(`  Event notification: ${event.data.entityType} created`);
  });

  cqrs.getEventStore().subscribe(EventType.STATE_CHANGED, event => {
    console.log(`  Event notification: Order status changed to ${event.data.newStatus}`);
  });

  // Create entities
  const userResult = await cqrs.executeCommand(new Command('CREATE_USER', {
    name: 'Charlie',
    email: 'charlie@example.com'
  }));

  await sleep(50);

  const orderResult = await cqrs.executeCommand(new Command('CREATE_ORDER', {
    userId: userResult.data.user.id,
    items: [{ product: 'Book', quantity: 1, price: 20 }],
    total: 20
  }));

  await sleep(50);

  await cqrs.executeCommand(new Command('UPDATE_ORDER_STATUS', {
    orderId: orderResult.data.order.id,
    status: 'shipped'
  }));
}

/**
 * Scenario 7: Read model consistency
 */
async function demonstrateReadModelConsistency() {
  console.log('\n=== Scenario 7: Read Model Consistency ===');

  const cqrs = new CQRS();

  // Create user
  const createResult = await cqrs.executeCommand(new Command('CREATE_USER', {
    name: 'David',
    email: 'david@example.com'
  }));

  const userId = createResult.data.user.id;

  // Immediate read - should be consistent
  await sleep(10);
  const query1 = await cqrs.executeQuery(new Query('GET_USER', { userId }));
  console.log('Read 1:', query1.data.name);

  // Update
  await cqrs.executeCommand(new Command('UPDATE_USER', {
    userId,
    updates: { name: 'David Johnson' }
  }));

  await sleep(10);

  // Read after update - should reflect changes
  const query2 = await cqrs.executeQuery(new Query('GET_USER', { userId }));
  console.log('Read 2:', query2.data.name);
}

/**
 * Scenario 8: Command validation
 */
async function demonstrateCommandValidation() {
  console.log('\n=== Scenario 8: Command Validation ===');

  const cqrs = new CQRS();

  // Try to update non-existent user
  const invalidCmd = new Command('UPDATE_USER', {
    userId: 'non_existent',
    updates: { name: 'Test' }
  });

  const result = await cqrs.executeCommand(invalidCmd);
  console.log('Invalid command result:', {
    status: result.status,
    error: result.error
  });
}

/**
 * Scenario 9: Aggregate operations
 */
async function demonstrateAggregateOperations() {
  console.log('\n=== Scenario 9: Aggregate Operations ===');

  const cqrs = new CQRS();

  // Create multiple users and orders
  for (let i = 1; i <= 3; i++) {
    const userResult = await cqrs.executeCommand(new Command('CREATE_USER', {
      name: `User ${i}`,
      email: `user${i}@test.com`
    }));

    const userId = userResult.data.user.id;

    for (let j = 1; j <= 2; j++) {
      await cqrs.executeCommand(new Command('CREATE_ORDER', {
        userId,
        items: [{ product: 'Item', quantity: 1, price: 50 }],
        total: 50
      }));
    }
  }

  await sleep(100);

  // Aggregate queries
  const allUsers = await cqrs.executeQuery(new Query('GET_ALL_USERS'));
  console.log(`Total users: ${allUsers.data.length}`);

  const events = cqrs.getEventStore().getAllEvents();
  const orderEvents = events.filter(e => e.data.entityType === 'order');
  console.log(`Total orders: ${orderEvents.length / 2}`); // Created events only
}

/**
 * Scenario 10: Complete workflow
 */
async function demonstrateCompleteWorkflow() {
  console.log('\n=== Scenario 10: Complete E-commerce Workflow ===');

  const cqrs = new CQRS();

  // 1. User registration
  console.log('\n1. User Registration');
  const userResult = await cqrs.executeCommand(new Command('CREATE_USER', {
    name: 'Emma Wilson',
    email: 'emma@example.com'
  }));

  const userId = userResult.data.user.id;
  console.log(`User created: ${userId}`);

  // 2. Create order
  await sleep(50);
  console.log('\n2. Create Order');
  const orderResult = await cqrs.executeCommand(new Command('CREATE_ORDER', {
    userId,
    items: [
      { product: 'Laptop', quantity: 1, price: 999 },
      { product: 'Mouse', quantity: 1, price: 25 }
    ],
    total: 1024
  }));

  const orderId = orderResult.data.order.id;
  console.log(`Order created: ${orderId}`);

  // 3. Process order through states
  await sleep(50);
  console.log('\n3. Processing Order');

  const states = ['processing', 'shipped', 'delivered'];
  for (const status of states) {
    await sleep(100);
    await cqrs.executeCommand(new Command('UPDATE_ORDER_STATUS', {
      orderId,
      status
    }));
    console.log(`Status: ${status}`);
  }

  // 4. Final queries
  await sleep(50);
  console.log('\n4. Final State');

  const finalUser = await cqrs.executeQuery(new Query('GET_USER', { userId }));
  const userOrders = await cqrs.executeQuery(new Query('GET_ORDERS_BY_USER', { userId }));

  console.log('User:', finalUser.data);
  console.log('Orders:', userOrders.data.length);
  console.log('Event count:', cqrs.getEventStore().getAllEvents().length);
}

/**
 * Helper function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run all scenarios
 */
async function runAllScenarios() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     CQRS Pattern - Comprehensive Demo      ║');
  console.log('╚══════════════════════════════════════════════╝');

  await demonstrateUserManagement();
  await demonstrateOrderProcessing();
  await demonstrateEventSourcing();
  await demonstrateQueryOptimization();
  await demonstrateComplexQueries();
  await demonstrateEventDrivenUpdates();
  await demonstrateReadModelConsistency();
  await demonstrateCommandValidation();
  await demonstrateAggregateOperations();
  await demonstrateCompleteWorkflow();

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║      All Scenarios Completed Successfully   ║');
  console.log('╚══════════════════════════════════════════════╝');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CQRS,
    Command,
    Query,
    DomainEvent,
    EventStore,
    WriteModel,
    ReadModel,
    CommandStatus,
    EventType,
    runAllScenarios
  };
}

// Run demonstrations if executed directly
if (require.main === module) {
  runAllScenarios().catch(console.error);
}
