/**
 * Dependency Injection Pattern
 * 
 * Provides dependencies to an object from external sources rather than
 * having the object create them itself.
 */

/**
 * Database interface
 */
class Database {
  query(sql) {
    throw new Error('Must implement query method');
  }
}

/**
 * MySQL Database implementation
 */
class MySQLDatabase extends Database {
  query(sql) {
    return `MySQL: Executing ${sql}`;
  }
}

/**
 * PostgreSQL Database implementation
 */
class PostgreSQLDatabase extends Database {
  query(sql) {
    return `PostgreSQL: Executing ${sql}`;
  }
}

/**
 * Logger interface
 */
class Logger {
  log(message) {
    throw new Error('Must implement log method');
  }
}

/**
 * Console Logger implementation
 */
class ConsoleLogger extends Logger {
  log(message) {
    console.log(`[LOG] ${message}`);
  }
}

/**
 * File Logger implementation
 */
class FileLogger extends Logger {
  log(message) {
    console.log(`[FILE] Writing to log: ${message}`);
  }
}

/**
 * User Service with constructor injection
 */
class UserService {
  constructor(database, logger) {
    this.database = database;
    this.logger = logger;
  }

  /**
   * Create a user
   * @param {string} username - Username
   */
  createUser(username) {
    this.logger.log(`Creating user: ${username}`);
    const result = this.database.query(`INSERT INTO users (username) VALUES ('${username}')`);
    this.logger.log(`User created: ${username}`);
    return result;
  }

  /**
   * Get a user
   * @param {number} id - User ID
   */
  getUser(id) {
    this.logger.log(`Fetching user: ${id}`);
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

/**
 * Simple DI Container
 */
class DIContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  /**
   * Register a service
   * @param {string} name - Service name
   * @param {Function} factory - Factory function
   * @param {boolean} singleton - Whether to create singleton
   */
  register(name, factory, singleton = false) {
    this.services.set(name, { factory, singleton });
  }

  /**
   * Resolve a service
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  resolve(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory(this));
      }
      return this.singletons.get(name);
    }

    return service.factory(this);
  }
}

module.exports = {
  Database,
  MySQLDatabase,
  PostgreSQLDatabase,
  Logger,
  ConsoleLogger,
  FileLogger,
  UserService,
  DIContainer
};
