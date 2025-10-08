/**
 * Singleton Pattern - Demo
 * Demonstrates ensuring only one instance of a class exists
 */

const { DatabaseConnection, configManager, logger } = require('./database-connection');

console.log('=== Singleton Pattern Demo ===\n');

// Example 1: Classic Singleton with getInstance()
console.log('--- Example 1: Database Connection Singleton ---\n');

const db1 = DatabaseConnection.getInstance();
db1.connect({ database: 'production_db', host: 'db.example.com' });

const db2 = DatabaseConnection.getInstance();
console.log(`\ndb1 === db2: ${db1 === db2}`); // true - same instance

// Execute queries from different "instances"
db1.query('SELECT * FROM users');
db2.query('SELECT * FROM products');

console.log('\nConnection status from db1:');
console.log(db1.getStatus());

console.log('\nConnection status from db2 (same instance):');
console.log(db2.getStatus());

// Example 2: Using constructor (still returns same instance)
console.log('\n--- Example 2: Creating with new operator ---\n');

const db3 = new DatabaseConnection();
console.log(`db3 === db1: ${db3 === db1}`); // true

db3.query('SELECT * FROM orders');

console.log('\nTotal queries across all references:');
console.log(`Query count: ${db3.getStatus().queryCount}`);

// Example 3: Module Singleton Pattern (ConfigurationManager)
console.log('\n--- Example 3: Configuration Manager Singleton ---\n');

configManager.loadConfig({
  appName: 'MyApp',
  version: '1.0.0',
  environment: 'production',
  apiUrl: 'https://api.example.com',
  maxConnections: 100
});

console.log('\nAccessing config from different modules:');

// Simulate different modules accessing config
function moduleA() {
  const config = require('./database-connection').configManager;
  console.log(`Module A - App Name: ${config.get('appName')}`);
  console.log(`Module A - API URL: ${config.get('apiUrl')}`);
}

function moduleB() {
  const config = require('./database-connection').configManager;
  console.log(`Module B - Environment: ${config.get('environment')}`);
  console.log(`Module B - Version: ${config.get('version')}`);
}

moduleA();
moduleB();

console.log('\nAll configuration:');
console.log(configManager.getAll());

// Example 4: Logger Singleton
console.log('\n--- Example 4: Logger Singleton ---\n');

// Different parts of the application use the logger
function userService() {
  const log = require('./database-connection').logger;
  log.info('User service initialized');
  log.info('Fetching user data');
}

function paymentService() {
  const log = require('./database-connection').logger;
  log.info('Payment service initialized');
  log.warn('Payment gateway response slow');
}

function orderService() {
  const log = require('./database-connection').logger;
  log.info('Order service initialized');
  log.error('Failed to process order #12345');
}

userService();
paymentService();
orderService();

console.log('\nAll logs:');
logger.getLogs().forEach(log => {
  console.log(`  [${log.level}] ${log.timestamp.toISOString()} - ${log.message}`);
});

console.log('\nError logs only:');
logger.getLogsByLevel('ERROR').forEach(log => {
  console.log(`  ${log.message}`);
});

// Example 5: Thread Safety Demonstration (simulated)
console.log('\n--- Example 5: Concurrent Access Simulation ---\n');

// Simulate multiple parts of code trying to create instances simultaneously
console.log('Attempting to create multiple instances concurrently:');

const instances = [];
for (let i = 0; i < 5; i++) {
  instances.push(DatabaseConnection.getInstance());
}

console.log(`\nCreated ${instances.length} references`);
console.log(`All references point to same instance: ${instances.every(inst => inst === instances[0])}`);

// Example 6: Singleton Benefits - Resource Management
console.log('\n--- Example 6: Resource Management Benefits ---\n');

console.log('Without Singleton: Each module creates its own connection');
console.log('  Module 1: new Connection() -> Connection #1');
console.log('  Module 2: new Connection() -> Connection #2');
console.log('  Module 3: new Connection() -> Connection #3');
console.log('  Result: 3 connections, wasted resources\n');

console.log('With Singleton: All modules share one connection');
console.log('  Module 1: getInstance() -> Connection #1');
console.log('  Module 2: getInstance() -> Connection #1 (same)');
console.log('  Module 3: getInstance() -> Connection #1 (same)');
console.log('  Result: 1 connection, efficient resource usage\n');

// Example 7: Resetting Singleton (for testing)
console.log('--- Example 7: Resetting Singleton ---\n');

console.log('Current query count:', DatabaseConnection.getInstance().getStatus().queryCount);

console.log('\nResetting singleton instance...');
DatabaseConnection.reset();

console.log('\nCreating new instance after reset:');
const freshDb = DatabaseConnection.getInstance();
freshDb.connect({ database: 'test_db' });
console.log('New query count:', freshDb.getStatus().queryCount);

// Cleanup
DatabaseConnection.reset();
console.log('\n=== Demo Complete ===');
