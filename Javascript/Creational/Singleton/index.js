/**
 * Singleton Pattern - Production Demo
 * Demonstrates real database connection pool, file logger, and configuration manager
 */

const { DatabaseConnectionPool, FileLogger, ConfigurationManager } = require('./database-connection');

async function main() {
  console.log('=== Singleton Pattern - Production Implementation ===\n');

  // Example 1: Database Connection Pool
  console.log('--- Example 1: Database Connection Pool ---\n');

  const pool1 = DatabaseConnectionPool.getInstance();
  const pool2 = DatabaseConnectionPool.getInstance();

  console.log(`pool1 === pool2: ${pool1 === pool2}\n`);

  try {
    await pool1.initialize({
      host: 'localhost',
      port: 5432,
      database: 'production_db',
      username: 'admin',
      password: 'secure_password',
      maxConnections: 5
    });

    console.log('Connection pool initialized successfully\n');

    // Execute multiple queries
    console.log('Executing queries...');
    const result1 = await pool1.query('SELECT * FROM users WHERE active = ?', [true]);
    console.log(`Query 1 returned ${result1.rowCount} rows`);

    const result2 = await pool2.query('INSERT INTO logs (message) VALUES (?)', ['User logged in']);
    console.log(`Query 2 inserted record with ID: ${result2.insertId}`);

    const result3 = await pool1.query('UPDATE users SET last_login = NOW() WHERE id = ?', [123]);
    console.log(`Query 3 updated ${result3.rowCount} rows`);

    // Execute concurrent queries
    console.log('\nExecuting concurrent queries...');
    const queries = Array.from({ length: 10 }, (_, i) =>
      pool1.query(`SELECT * FROM products WHERE id = ${i}`)
    );
    await Promise.all(queries);
    console.log('All concurrent queries completed');

    // Show statistics
    console.log('\nPool Statistics:');
    const stats = pool1.getStats();
    console.log(JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }

  // Example 2: File Logger
  console.log('\n\n--- Example 2: File Logger with File I/O ---\n');

  const logger1 = FileLogger.getInstance();
  const logger2 = FileLogger.getInstance();

  console.log(`logger1 === logger2: ${logger1 === logger2}\n`);

  try {
    await logger1.initialize({
      logLevel: 'DEBUG',
      maxFileSize: 5 * 1024 * 1024 // 5MB
    });

    console.log(`Logging to: ${logger1.getLogFile()}\n`);

    // Different parts of application using logger
    await simulateUserService(logger1);
    await simulatePaymentService(logger2);
    await simulateOrderService(logger1);

    // Force flush to ensure all logs are written
    await logger1.flush();
    console.log('\nAll logs written to file successfully');

  } catch (error) {
    console.error('Logger error:', error.message);
  }

  // Example 3: Configuration Manager
  console.log('\n\n--- Example 3: Configuration Manager ---\n');

  const config1 = ConfigurationManager.getInstance();
  const config2 = ConfigurationManager.getInstance();

  console.log(`config1 === config2: ${config1 === config2}\n`);

  try {
    // Set configurations with validation
    config1.registerValidator('port', (value) => {
      return typeof value === 'number' && value > 0 && value < 65536;
    });

    config1.registerValidator('email', (value) => {
      return typeof value === 'string' && value.includes('@');
    });

    // Watch for configuration changes
    const unwatch = config1.watch('apiUrl', (newValue, oldValue) => {
      console.log(`API URL changed from ${oldValue} to ${newValue}`);
    });

    // Set configuration values
    config1.set('appName', 'My Production App');
    config1.set('port', 3000);
    config1.set('apiUrl', 'https://api.example.com');
    config1.set('email', 'admin@example.com');
    config1.set('debug', true);

    console.log('\nConfiguration set successfully');

    // Get configuration values from different instance
    console.log('\nRetrieving configuration from config2:');
    console.log(`  App Name: ${config2.get('appName')}`);
    console.log(`  Port: ${config2.get('port')}`);
    console.log(`  API URL: ${config2.get('apiUrl')}`);
    console.log(`  Email: ${config2.get('email')}`);
    console.log(`  Debug: ${config2.get('debug')}`);

    // Save configuration to file
    const configPath = '/tmp/app-config.json';
    await config1.saveToFile(configPath);
    console.log(`\nConfiguration saved to: ${configPath}`);

    // Test validation
    console.log('\nTesting validation...');
    try {
      config1.set('port', 'invalid'); // Should fail
    } catch (error) {
      console.log(`  Validation correctly prevented invalid port: ${error.message}`);
    }

    try {
      config1.set('email', 'invalid-email'); // Should fail
    } catch (error) {
      console.log(`  Validation correctly prevented invalid email: ${error.message}`);
    }

    // Lock configuration
    console.log('\nLocking configuration...');
    config1.lock();

    try {
      config1.set('newKey', 'newValue'); // Should fail
    } catch (error) {
      console.log(`  Correctly prevented modification: ${error.message}`);
    }

    // Cleanup watcher
    unwatch();

  } catch (error) {
    console.error('Configuration error:', error.message);
  }

  // Example 4: Event Handling
  console.log('\n\n--- Example 4: Connection Pool Events ---\n');

  const pool = DatabaseConnectionPool.getInstance();

  pool.on('queryExecuted', (data) => {
    console.log(`Query executed on ${data.connectionId} in ${data.queryTime}ms`);
  });

  pool.on('queryError', (data) => {
    console.error(`Query error: ${data.error}`);
  });

  console.log('Executing query with event tracking...');
  await pool.query('SELECT COUNT(*) FROM users');

  // Example 5: Concurrent Access Simulation
  console.log('\n\n--- Example 5: Thread-Safe Singleton Guarantee ---\n');

  const instances = [];
  const promises = [];

  // Simulate multiple modules trying to get instances simultaneously
  for (let i = 0; i < 20; i++) {
    promises.push(
      new Promise((resolve) => {
        setTimeout(() => {
          instances.push(DatabaseConnectionPool.getInstance());
          resolve();
        }, Math.random() * 10);
      })
    );
  }

  await Promise.all(promises);

  console.log(`Created ${instances.length} references`);
  console.log(`All references are same instance: ${instances.every(inst => inst === instances[0])}`);

  // Cleanup
  console.log('\n\n--- Cleanup ---\n');

  await pool.shutdown();
  console.log('Database pool shut down');

  await logger1.shutdown();
  console.log('Logger shut down');

  console.log('\n=== Demo Complete ===');
}

// Helper functions to simulate different services using the logger
async function simulateUserService(logger) {
  await logger.info('User service started');
  await logger.debug('Loading user configuration', { service: 'user' });
  await logger.info('User authentication initialized');
}

async function simulatePaymentService(logger) {
  await logger.info('Payment service started');
  await logger.warn('Payment gateway response time is high', { service: 'payment', responseTime: 2500 });
  await logger.info('Payment processor connected');
}

async function simulateOrderService(logger) {
  await logger.info('Order service started');
  await logger.error('Failed to process order', { service: 'order', orderId: 12345, error: 'Inventory unavailable' });
  await logger.info('Order retry mechanism activated');
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
