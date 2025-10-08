/**
 * Singleton Pattern - Database Connection Example
 *
 * The Singleton pattern ensures a class has only one instance and
 * provides a global point of access to it.
 */

/**
 * Singleton: DatabaseConnection
 * Ensures only one database connection exists throughout the application
 */
class DatabaseConnection {
  constructor() {
    // Prevent direct construction calls with the `new` operator
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }

    // Initialize connection properties
    this.host = 'localhost';
    this.port = 5432;
    this.database = 'myapp_db';
    this.connected = false;
    this.connectionTime = null;
    this.queryCount = 0;

    // Store the instance
    DatabaseConnection.instance = this;

    console.log('DatabaseConnection instance created');
  }

  /**
   * Static method to get the singleton instance
   */
  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Connect to the database
   */
  connect(config = {}) {
    if (this.connected) {
      console.log('Already connected to database');
      return;
    }

    this.host = config.host || this.host;
    this.port = config.port || this.port;
    this.database = config.database || this.database;

    // Simulate connection
    this.connected = true;
    this.connectionTime = new Date();

    console.log(`Connected to database: ${this.database} at ${this.host}:${this.port}`);
  }

  /**
   * Disconnect from the database
   */
  disconnect() {
    if (!this.connected) {
      console.log('Not connected to database');
      return;
    }

    this.connected = false;
    this.connectionTime = null;

    console.log('Disconnected from database');
  }

  /**
   * Execute a query
   */
  query(sql) {
    if (!this.connected) {
      throw new Error('Database not connected. Call connect() first.');
    }

    this.queryCount++;
    console.log(`Executing query #${this.queryCount}: ${sql}`);

    // Simulate query execution
    return {
      success: true,
      rows: [],
      queryNumber: this.queryCount
    };
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.connected,
      host: this.host,
      port: this.port,
      database: this.database,
      connectionTime: this.connectionTime,
      queryCount: this.queryCount
    };
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset() {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.disconnect();
      DatabaseConnection.instance = null;
      console.log('DatabaseConnection instance reset');
    }
  }
}

/**
 * Alternative Singleton Implementation using Module Pattern
 * This leverages JavaScript's module system
 */
class ConfigurationManager {
  constructor() {
    this.config = new Map();
    this.loadTime = new Date();

    console.log('ConfigurationManager instance created');
  }

  /**
   * Set a configuration value
   */
  set(key, value) {
    this.config.set(key, value);
    console.log(`Config set: ${key} = ${value}`);
  }

  /**
   * Get a configuration value
   */
  get(key) {
    return this.config.get(key);
  }

  /**
   * Check if a key exists
   */
  has(key) {
    return this.config.has(key);
  }

  /**
   * Get all configuration
   */
  getAll() {
    return Object.fromEntries(this.config);
  }

  /**
   * Load configuration from object
   */
  loadConfig(configObject) {
    Object.entries(configObject).forEach(([key, value]) => {
      this.config.set(key, value);
    });
    console.log('Configuration loaded');
  }
}

// Create and export a single instance (Module Singleton Pattern)
const configManager = new ConfigurationManager();
Object.freeze(configManager); // Prevent modification

/**
 * Logger Singleton using ES6 Module Pattern
 */
class Logger {
  constructor() {
    this.logs = [];
    this.startTime = new Date();
  }

  /**
   * Log info message
   */
  info(message) {
    const logEntry = {
      level: 'INFO',
      message,
      timestamp: new Date()
    };
    this.logs.push(logEntry);
    console.log(`[INFO] ${message}`);
  }

  /**
   * Log warning message
   */
  warn(message) {
    const logEntry = {
      level: 'WARN',
      message,
      timestamp: new Date()
    };
    this.logs.push(logEntry);
    console.warn(`[WARN] ${message}`);
  }

  /**
   * Log error message
   */
  error(message) {
    const logEntry = {
      level: 'ERROR',
      message,
      timestamp: new Date()
    };
    this.logs.push(logEntry);
    console.error(`[ERROR] ${message}`);
  }

  /**
   * Get all logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
    console.log('Logs cleared');
  }
}

// Create and export singleton instance
const logger = new Logger();
Object.freeze(logger);

module.exports = {
  DatabaseConnection,
  configManager,
  logger
};
