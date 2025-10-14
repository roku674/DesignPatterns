/**
 * Transaction Log Tailing Pattern
 *
 * Tails the database transaction log to capture changes and publish events.
 * Instead of using triggers or the outbox pattern, reads the database's
 * write-ahead log (WAL) or binlog directly to detect changes.
 *
 * Key Components:
 * - Transaction Log: Database's internal change log (WAL, binlog)
 * - Log Tailer: Reads and parses transaction log entries
 * - Change Detector: Identifies relevant changes
 * - Event Publisher: Publishes changes as domain events
 * - Position Tracking: Remembers last processed position
 * - Log Segments: Handles log rotation and archival
 */

const EventEmitter = require('events');

/**
 * Transaction Log Entry
 */
class TransactionLogEntry {
  constructor(lsn, transactionId, operation, tableName, recordId, data, timestamp) {
    this.lsn = lsn; // Log Sequence Number
    this.transactionId = transactionId;
    this.operation = operation; // BEGIN, INSERT, UPDATE, DELETE, COMMIT, ROLLBACK
    this.tableName = tableName;
    this.recordId = recordId;
    this.data = data;
    this.timestamp = timestamp || new Date().toISOString();
  }

  toJSON() {
    return {
      lsn: this.lsn,
      transactionId: this.transactionId,
      operation: this.operation,
      tableName: this.tableName,
      recordId: this.recordId,
      data: this.data,
      timestamp: this.timestamp
    };
  }
}

/**
 * Transaction Log (simulates WAL/binlog)
 */
class TransactionLog {
  constructor() {
    this.entries = [];
    this.currentLSN = 0;
    this.activeTransactions = new Map();
    this.committedTransactions = new Set();
  }

  /**
   * Append entry to transaction log
   */
  append(transactionId, operation, tableName, recordId, data) {
    const lsn = ++this.currentLSN;
    const entry = new TransactionLogEntry(
      lsn,
      transactionId,
      operation,
      tableName,
      recordId,
      data
    );

    this.entries.push(entry);

    // Track transaction state
    if (operation === 'BEGIN') {
      this.activeTransactions.set(transactionId, { startLSN: lsn, entries: [] });
    } else if (operation === 'COMMIT') {
      this.committedTransactions.add(transactionId);
      this.activeTransactions.delete(transactionId);
    } else if (operation === 'ROLLBACK') {
      this.activeTransactions.delete(transactionId);
    } else {
      const tx = this.activeTransactions.get(transactionId);
      if (tx) {
        tx.entries.push(entry);
      }
    }

    return lsn;
  }

  /**
   * Get entries from specific LSN
   */
  getEntriesFrom(fromLSN = 0) {
    return this.entries.filter(entry => entry.lsn > fromLSN);
  }

  /**
   * Get entries for transaction
   */
  getTransactionEntries(transactionId) {
    return this.entries.filter(entry => entry.transactionId === transactionId);
  }

  /**
   * Check if transaction is committed
   */
  isCommitted(transactionId) {
    return this.committedTransactions.has(transactionId);
  }

  /**
   * Get current position
   */
  getCurrentLSN() {
    return this.currentLSN;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalEntries: this.entries.length,
      currentLSN: this.currentLSN,
      activeTransactions: this.activeTransactions.size,
      committedTransactions: this.committedTransactions.size
    };
  }
}

/**
 * Database with Transaction Log
 */
class TransactionLogDatabase {
  constructor() {
    this.tables = new Map();
    this.transactionLog = new TransactionLog();
    this.nextTxId = 1;
  }

  /**
   * Begin transaction
   */
  beginTransaction() {
    const txId = `tx-${this.nextTxId++}`;
    this.transactionLog.append(txId, 'BEGIN', null, null, null);
    return txId;
  }

  /**
   * Insert with transaction logging
   */
  insert(txId, tableName, recordId, data) {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new Map());
    }

    const table = this.tables.get(tableName);
    table.set(recordId, data);

    this.transactionLog.append(txId, 'INSERT', tableName, recordId, data);
  }

  /**
   * Update with transaction logging
   */
  update(txId, tableName, recordId, newData) {
    const table = this.tables.get(tableName);
    if (!table || !table.has(recordId)) {
      throw new Error(`Record ${recordId} not found in ${tableName}`);
    }

    const oldData = table.get(recordId);
    const updatedData = { ...oldData, ...newData };
    table.set(recordId, updatedData);

    this.transactionLog.append(txId, 'UPDATE', tableName, recordId, {
      old: oldData,
      new: updatedData
    });
  }

  /**
   * Delete with transaction logging
   */
  delete(txId, tableName, recordId) {
    const table = this.tables.get(tableName);
    if (!table || !table.has(recordId)) {
      throw new Error(`Record ${recordId} not found in ${tableName}`);
    }

    const data = table.get(recordId);
    table.delete(recordId);

    this.transactionLog.append(txId, 'DELETE', tableName, recordId, data);
  }

  /**
   * Commit transaction
   */
  commitTransaction(txId) {
    this.transactionLog.append(txId, 'COMMIT', null, null, null);
  }

  /**
   * Rollback transaction
   */
  rollbackTransaction(txId) {
    const entries = this.transactionLog.getTransactionEntries(txId);

    // Reverse the changes
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry.operation === 'INSERT') {
        const table = this.tables.get(entry.tableName);
        if (table) {
          table.delete(entry.recordId);
        }
      } else if (entry.operation === 'UPDATE') {
        const table = this.tables.get(entry.tableName);
        if (table) {
          table.set(entry.recordId, entry.data.old);
        }
      } else if (entry.operation === 'DELETE') {
        const table = this.tables.get(entry.tableName);
        if (table) {
          table.set(entry.recordId, entry.data);
        }
      }
    }

    this.transactionLog.append(txId, 'ROLLBACK', null, null, null);
  }

  /**
   * Read data
   */
  read(tableName, recordId) {
    const table = this.tables.get(tableName);
    return table ? table.get(recordId) : null;
  }

  /**
   * Get transaction log
   */
  getTransactionLog() {
    return this.transactionLog;
  }
}

/**
 * Log Tailer - Reads and processes transaction log
 */
class LogTailer extends EventEmitter {
  constructor(database, options = {}) {
    super();
    this.database = database;
    this.transactionLog = database.getTransactionLog();
    this.currentPosition = 0; // Last processed LSN
    this.pollingInterval = options.pollingInterval || 500;
    this.batchSize = options.batchSize || 10;
    this.isRunning = false;
    this.pollTimer = null;
    this.processedCount = 0;
    this.tablesToWatch = options.tablesToWatch || []; // Empty = watch all
  }

  /**
   * Start tailing
   */
  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.tail();
    console.log(`Log tailer started at position ${this.currentPosition}`);
  }

  /**
   * Stop tailing
   */
  stop() {
    this.isRunning = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    console.log(`Log tailer stopped at position ${this.currentPosition}`);
  }

  /**
   * Tail the log
   */
  async tail() {
    if (!this.isRunning) {
      return;
    }

    try {
      await this.processNewEntries();
    } catch (error) {
      console.error('Error tailing log:', error);
    }

    this.pollTimer = setTimeout(() => this.tail(), this.pollingInterval);
  }

  /**
   * Process new log entries
   */
  async processNewEntries() {
    const entries = this.transactionLog.getEntriesFrom(this.currentPosition);
    const batch = entries.slice(0, this.batchSize);

    for (const entry of batch) {
      await this.processEntry(entry);
      this.currentPosition = entry.lsn;
    }
  }

  /**
   * Process single log entry
   */
  async processEntry(entry) {
    // Skip non-data operations
    if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(entry.operation)) {
      return;
    }

    // Skip if not watching this table
    if (this.tablesToWatch.length > 0 && !this.tablesToWatch.includes(entry.tableName)) {
      return;
    }

    // Only process committed transactions
    if (!this.transactionLog.isCommitted(entry.transactionId)) {
      return;
    }

    this.processedCount++;

    // Emit change event
    const changeEvent = {
      lsn: entry.lsn,
      transactionId: entry.transactionId,
      operation: entry.operation,
      tableName: entry.tableName,
      recordId: entry.recordId,
      data: entry.data,
      timestamp: entry.timestamp
    };

    this.emit('change', changeEvent);
    this.emit(`${entry.tableName}.${entry.operation}`, changeEvent);

    console.log(`Processed LSN ${entry.lsn}: ${entry.tableName}.${entry.operation} [${entry.recordId}]`);
  }

  /**
   * Get current position
   */
  getPosition() {
    return this.currentPosition;
  }

  /**
   * Set position (for recovery)
   */
  setPosition(lsn) {
    this.currentPosition = lsn;
    console.log(`Position reset to ${lsn}`);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      currentPosition: this.currentPosition,
      processedCount: this.processedCount,
      logStats: this.transactionLog.getStats()
    };
  }
}

/**
 * Position Store - Persists last processed position
 */
class PositionStore {
  constructor() {
    this.positions = new Map(); // tailerId -> position
  }

  /**
   * Save position
   */
  save(tailerId, position) {
    this.positions.set(tailerId, {
      position,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Load position
   */
  load(tailerId) {
    const data = this.positions.get(tailerId);
    return data ? data.position : 0;
  }

  /**
   * Get all positions
   */
  getAll() {
    return Object.fromEntries(this.positions);
  }
}

/**
 * Change Data Capture Service
 */
class CDCService {
  constructor(database) {
    this.database = database;
    this.logTailer = new LogTailer(database, {
      pollingInterval: 300,
      batchSize: 5
    });
    this.positionStore = new PositionStore();
    this.tailerId = 'cdc-service-1';
    this.eventHandlers = new Map();

    // Restore position
    const savedPosition = this.positionStore.load(this.tailerId);
    if (savedPosition > 0) {
      this.logTailer.setPosition(savedPosition);
    }

    // Auto-save position
    setInterval(() => {
      this.positionStore.save(this.tailerId, this.logTailer.getPosition());
    }, 1000);
  }

  /**
   * Subscribe to changes
   */
  onTableChange(tableName, operation, handler) {
    const key = `${tableName}.${operation}`;
    if (!this.eventHandlers.has(key)) {
      this.eventHandlers.set(key, []);
    }
    this.eventHandlers.get(key).push(handler);

    this.logTailer.on(key, handler);
  }

  /**
   * Subscribe to all changes
   */
  onChange(handler) {
    this.logTailer.on('change', handler);
  }

  /**
   * Start CDC
   */
  start() {
    this.logTailer.start();
  }

  /**
   * Stop CDC
   */
  stop() {
    this.logTailer.stop();
    this.positionStore.save(this.tailerId, this.logTailer.getPosition());
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.logTailer.getStats(),
      savedPositions: this.positionStore.getAll()
    };
  }
}

/**
 * Example: Product service using CDC
 */
class ProductService {
  constructor() {
    this.database = new TransactionLogDatabase();
    this.cdcService = new CDCService(this.database);
    this.setupHandlers();
  }

  /**
   * Setup CDC handlers
   */
  setupHandlers() {
    this.cdcService.onTableChange('products', 'INSERT', (event) => {
      console.log(`Product created: ${event.recordId}`);
      console.log(`  Data:`, event.data);
    });

    this.cdcService.onTableChange('products', 'UPDATE', (event) => {
      console.log(`Product updated: ${event.recordId}`);
      console.log(`  Old:`, event.data.old);
      console.log(`  New:`, event.data.new);
    });

    this.cdcService.onTableChange('products', 'DELETE', (event) => {
      console.log(`Product deleted: ${event.recordId}`);
      console.log(`  Data:`, event.data);
    });
  }

  /**
   * Create product
   */
  createProduct(productId, name, price) {
    const txId = this.database.beginTransaction();
    try {
      this.database.insert(txId, 'products', productId, { name, price });
      this.database.commitTransaction(txId);
    } catch (error) {
      this.database.rollbackTransaction(txId);
      throw error;
    }
  }

  /**
   * Update product
   */
  updateProduct(productId, updates) {
    const txId = this.database.beginTransaction();
    try {
      this.database.update(txId, 'products', productId, updates);
      this.database.commitTransaction(txId);
    } catch (error) {
      this.database.rollbackTransaction(txId);
      throw error;
    }
  }

  /**
   * Delete product
   */
  deleteProduct(productId) {
    const txId = this.database.beginTransaction();
    try {
      this.database.delete(txId, 'products', productId);
      this.database.commitTransaction(txId);
    } catch (error) {
      this.database.rollbackTransaction(txId);
      throw error;
    }
  }

  /**
   * Get product
   */
  getProduct(productId) {
    return this.database.read('products', productId);
  }

  /**
   * Start CDC
   */
  startCDC() {
    this.cdcService.start();
  }

  /**
   * Stop CDC
   */
  stopCDC() {
    this.cdcService.stop();
  }

  /**
   * Get statistics
   */
  getStats() {
    return this.cdcService.getStats();
  }
}

/**
 * Demo function
 */
async function demonstrateTransactionLogTailing() {
  console.log('=== Transaction Log Tailing Pattern Demo ===\n');

  // Create product service
  const productService = new ProductService();

  // Start CDC
  productService.startCDC();

  // Create products
  console.log('Creating products...\n');
  productService.createProduct('prod-001', 'Laptop', 1200);
  productService.createProduct('prod-002', 'Mouse', 25);
  productService.createProduct('prod-003', 'Keyboard', 75);

  await delay(500);

  // Update products
  console.log('\nUpdating products...\n');
  productService.updateProduct('prod-001', { price: 1100 });
  productService.updateProduct('prod-002', { name: 'Wireless Mouse', price: 35 });

  await delay(500);

  // Delete product
  console.log('\nDeleting product...\n');
  productService.deleteProduct('prod-003');

  await delay(500);

  // Stop CDC
  productService.stopCDC();

  // Display statistics
  console.log('\n=== Statistics ===\n');
  const stats = productService.getStats();
  console.log(JSON.stringify(stats, null, 2));

  // Demonstrate position recovery
  console.log('\n=== Testing Position Recovery ===\n');

  const newService = new ProductService();
  console.log('New service created with saved position');
  newService.startCDC();

  console.log('Adding more products...\n');
  newService.createProduct('prod-004', 'Monitor', 300);

  await delay(500);

  newService.stopCDC();

  console.log('\nFinal Statistics:');
  console.log(JSON.stringify(newService.getStats(), null, 2));

  return productService;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export components
module.exports = {
  TransactionLogEntry,
  TransactionLog,
  TransactionLogDatabase,
  LogTailer,
  PositionStore,
  CDCService,
  ProductService,
  demonstrateTransactionLogTailing
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateTransactionLogTailing()
    .then(() => console.log('\n✅ Transaction Log Tailing demo completed'))
    .catch(error => console.error('❌ Error:', error));
}
