/**
 * CQRS (Command Query Responsibility Segregation) Pattern
 * 
 * Separates read and write operations into different models.
 * Commands modify state, queries return data.
 */

/**
 * Event Store - Stores all events
 */
class EventStore {
  constructor() {
    this.events = [];
  }

  /**
   * Append an event to the store
   * @param {Object} event - The event to store
   */
  append(event) {
    this.events.push({
      ...event,
      timestamp: Date.now(),
      id: this.events.length + 1
    });
  }

  /**
   * Get all events
   * @returns {Array} All events
   */
  getEvents() {
    return [...this.events];
  }

  /**
   * Get events for specific aggregate
   * @param {string} aggregateId - The aggregate ID
   * @returns {Array} Events for the aggregate
   */
  getEventsForAggregate(aggregateId) {
    return this.events.filter(e => e.aggregateId === aggregateId);
  }
}

/**
 * Command Service - Handles write operations
 */
class CommandService {
  constructor(eventStore) {
    this.eventStore = eventStore;
  }

  /**
   * Create a new user
   * @param {string} id - User ID
   * @param {string} name - User name
   * @param {string} email - User email
   */
  createUser(id, name, email) {
    const event = {
      type: 'UserCreated',
      aggregateId: id,
      data: { id, name, email }
    };
    this.eventStore.append(event);
  }

  /**
   * Update user email
   * @param {string} id - User ID
   * @param {string} newEmail - New email address
   */
  updateUserEmail(id, newEmail) {
    const event = {
      type: 'UserEmailUpdated',
      aggregateId: id,
      data: { id, newEmail }
    };
    this.eventStore.append(event);
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   */
  deleteUser(id) {
    const event = {
      type: 'UserDeleted',
      aggregateId: id,
      data: { id }
    };
    this.eventStore.append(event);
  }
}

/**
 * Query Service - Handles read operations
 */
class QueryService {
  constructor(eventStore) {
    this.eventStore = eventStore;
    this.readModel = new Map();
    this.rebuildReadModel();
  }

  /**
   * Rebuild read model from events
   */
  rebuildReadModel() {
    this.readModel.clear();
    const events = this.eventStore.getEvents();
    
    events.forEach(event => {
      switch (event.type) {
        case 'UserCreated':
          this.readModel.set(event.data.id, {
            id: event.data.id,
            name: event.data.name,
            email: event.data.email
          });
          break;
        case 'UserEmailUpdated':
          const user = this.readModel.get(event.data.id);
          if (user) {
            user.email = event.data.newEmail;
          }
          break;
        case 'UserDeleted':
          this.readModel.delete(event.data.id);
          break;
      }
    });
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Object|null} User data or null
   */
  getUserById(id) {
    this.rebuildReadModel();
    return this.readModel.get(id) || null;
  }

  /**
   * Get all users
   * @returns {Array} All users
   */
  getAllUsers() {
    this.rebuildReadModel();
    return Array.from(this.readModel.values());
  }

  /**
   * Search users by email domain
   * @param {string} domain - Email domain
   * @returns {Array} Matching users
   */
  searchUsersByEmail(domain) {
    this.rebuildReadModel();
    return Array.from(this.readModel.values())
      .filter(user => user.email.includes(domain));
  }

  /**
   * Get user count
   * @returns {number} Total users
   */
  getUserCount() {
    this.rebuildReadModel();
    return this.readModel.size;
  }
}

module.exports = {
  EventStore,
  CommandService,
  QueryService
};
