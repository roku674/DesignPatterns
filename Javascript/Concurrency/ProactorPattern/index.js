/**
 * Proactor Pattern Implementation
 *
 * The Proactor pattern allows event-driven applications to efficiently demultiplex
 * and dispatch service requests triggered by the completion of asynchronous operations.
 * Unlike Reactor (synchronous), Proactor handles async operations that complete in the future.
 *
 * Key Components:
 * - Proactive Initiator: Initiates async operations
 * - Asynchronous Operation Processor: Executes operations asynchronously
 * - Completion Dispatcher: Dispatches completion events to handlers
 * - Completion Handler: Processes completed operations
 *
 * Use Cases:
 * - Async file I/O operations
 * - Network operations with callbacks
 * - Database query completion handling
 * - Long-running computations
 */

const { EventEmitter } = require('events');

/**
 * Async Operation representing a long-running task
 */
class AsyncOperation {
  constructor(id, type, data) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.status = 'pending';
    this.result = null;
    this.error = null;
  }
}

/**
 * Completion Handler interface
 */
class CompletionHandler {
  constructor() {
    if (this.constructor === CompletionHandler) {
      throw new Error("CompletionHandler is abstract");
    }
  }

  /**
   * Called when async operation completes successfully
   * @param {AsyncOperation} operation
   */
  async handleCompletion(operation) {
    throw new Error("handleCompletion must be implemented");
  }

  /**
   * Called when async operation fails
   * @param {AsyncOperation} operation
   */
  async handleError(operation) {
    console.error(`Operation ${operation.id} failed:`, operation.error);
  }
}

/**
 * Asynchronous Operation Processor
 * Simulates async operation execution
 */
class AsyncOperationProcessor {
  constructor() {
    this.operations = new Map();
  }

  /**
   * Execute an async operation
   * @param {AsyncOperation} operation
   * @param {Function} callback - Called when operation completes
   */
  async process(operation, callback) {
    this.operations.set(operation.id, operation);
    operation.status = 'processing';

    try {
      // Simulate async processing
      const result = await this.executeOperation(operation);
      operation.status = 'completed';
      operation.result = result;
      callback(null, operation);
    } catch (error) {
      operation.status = 'failed';
      operation.error = error;
      callback(error, operation);
    } finally {
      this.operations.delete(operation.id);
    }
  }

  /**
   * Simulate actual operation execution
   * @param {AsyncOperation} operation
   * @returns {Promise<*>}
   */
  async executeOperation(operation) {
    return new Promise((resolve, reject) => {
      const delay = Math.random() * 500 + 100;
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve({
            operationId: operation.id,
            type: operation.type,
            processedData: `Processed: ${operation.data}`,
            timestamp: Date.now()
          });
        } else {
          reject(new Error(`Operation ${operation.id} failed randomly`));
        }
      }, delay);
    });
  }
}

/**
 * Completion Event Dispatcher
 * Dispatches completion events to registered handlers
 */
class CompletionDispatcher extends EventEmitter {
  constructor() {
    super();
    this.handlers = new Map();
  }

  /**
   * Register a completion handler for an operation type
   * @param {string} operationType
   * @param {CompletionHandler} handler
   */
  registerHandler(operationType, handler) {
    if (!this.handlers.has(operationType)) {
      this.handlers.set(operationType, []);
    }
    this.handlers.get(operationType).push(handler);
    console.log(`Registered handler for operation type: ${operationType}`);
  }

  /**
   * Dispatch completion event to appropriate handlers
   * @param {AsyncOperation} operation
   */
  async dispatchCompletion(operation) {
    const handlers = this.handlers.get(operation.type) || [];

    for (const handler of handlers) {
      try {
        if (operation.status === 'completed') {
          await handler.handleCompletion(operation);
        } else if (operation.status === 'failed') {
          await handler.handleError(operation);
        }
      } catch (error) {
        console.error(`Error in completion handler:`, error);
      }
    }

    this.emit('operationComplete', operation);
  }
}

/**
 * Proactor - Main coordinator
 * Initiates async operations and coordinates completion handling
 */
class Proactor {
  constructor() {
    this.processor = new AsyncOperationProcessor();
    this.dispatcher = new CompletionDispatcher();
    this.operationCounter = 0;
    this.activeOperations = new Set();
  }

  /**
   * Register a completion handler
   * @param {string} operationType
   * @param {CompletionHandler} handler
   */
  registerHandler(operationType, handler) {
    this.dispatcher.registerHandler(operationType, handler);
  }

  /**
   * Initiate an async operation
   * @param {string} type
   * @param {*} data
   * @returns {number} operation ID
   */
  async initiateOperation(type, data) {
    const operation = new AsyncOperation(++this.operationCounter, type, data);
    this.activeOperations.add(operation.id);

    console.log(`[Proactor] Initiating operation ${operation.id} (${type})`);

    // Process async operation
    this.processor.process(operation, async (error, completedOp) => {
      this.activeOperations.delete(completedOp.id);
      await this.dispatcher.dispatchCompletion(completedOp);
    });

    return operation.id;
  }

  /**
   * Wait for all active operations to complete
   * @returns {Promise<void>}
   */
  async waitForCompletion() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.activeOperations.size === 0) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    });
  }

  /**
   * Get completion event emitter
   * @returns {EventEmitter}
   */
  getEventEmitter() {
    return this.dispatcher;
  }
}

// ============================================================================
// Concrete Completion Handlers
// ============================================================================

/**
 * File I/O Completion Handler
 */
class FileIOCompletionHandler extends CompletionHandler {
  constructor() {
    super();
    this.filesProcessed = 0;
  }

  async handleCompletion(operation) {
    this.filesProcessed++;
    console.log(`\n[FileIO Handler] File operation completed`);
    console.log(`  Operation ID: ${operation.id}`);
    console.log(`  Result: ${JSON.stringify(operation.result)}`);
    console.log(`  Total files processed: ${this.filesProcessed}`);
  }

  async handleError(operation) {
    console.error(`\n[FileIO Handler] File operation failed`);
    console.error(`  Operation ID: ${operation.id}`);
    console.error(`  Error: ${operation.error.message}`);
  }
}

/**
 * Network Request Completion Handler
 */
class NetworkCompletionHandler extends CompletionHandler {
  constructor() {
    super();
    this.requestsHandled = 0;
    this.totalLatency = 0;
  }

  async handleCompletion(operation) {
    this.requestsHandled++;
    const latency = Date.now() - operation.result.timestamp;
    this.totalLatency += latency;

    console.log(`\n[Network Handler] Request completed`);
    console.log(`  Operation ID: ${operation.id}`);
    console.log(`  Data: ${operation.result.processedData}`);
    console.log(`  Average latency: ${(this.totalLatency / this.requestsHandled).toFixed(2)}ms`);
  }
}

/**
 * Database Query Completion Handler
 */
class DatabaseCompletionHandler extends CompletionHandler {
  constructor() {
    super();
    this.cache = new Map();
  }

  async handleCompletion(operation) {
    console.log(`\n[Database Handler] Query completed`);
    console.log(`  Operation ID: ${operation.id}`);
    console.log(`  Query: ${operation.data}`);

    // Cache the result
    this.cache.set(operation.data, operation.result);
    console.log(`  Result cached (cache size: ${this.cache.size})`);
  }

  getCachedResult(query) {
    return this.cache.get(query);
  }
}

// ============================================================================
// Example Applications
// ============================================================================

/**
 * Example: Async File Processing System
 */
class FileProcessingSystem {
  constructor() {
    this.proactor = new Proactor();
    this.handler = new FileIOCompletionHandler();
    this.proactor.registerHandler('fileRead', this.handler);
    this.proactor.registerHandler('fileWrite', this.handler);
  }

  async readFile(filename) {
    return await this.proactor.initiateOperation('fileRead', filename);
  }

  async writeFile(filename, content) {
    return await this.proactor.initiateOperation('fileWrite', { filename, content });
  }

  async waitForAll() {
    await this.proactor.waitForCompletion();
  }
}

/**
 * Example: Async Web Crawler
 */
class WebCrawler {
  constructor() {
    this.proactor = new Proactor();
    this.networkHandler = new NetworkCompletionHandler();
    this.proactor.registerHandler('httpRequest', this.networkHandler);
    this.urlsProcessed = new Set();
  }

  async crawlUrl(url) {
    if (this.urlsProcessed.has(url)) {
      console.log(`[Crawler] URL already processed: ${url}`);
      return;
    }

    this.urlsProcessed.add(url);
    return await this.proactor.initiateOperation('httpRequest', url);
  }

  async crawlMultiple(urls) {
    const operations = [];
    for (const url of urls) {
      operations.push(this.crawlUrl(url));
    }
    await Promise.all(operations);
    await this.proactor.waitForCompletion();
  }
}

/**
 * Example: Database Connection Pool with Proactor
 */
class DatabasePool {
  constructor(maxConnections = 5) {
    this.proactor = new Proactor();
    this.handler = new DatabaseCompletionHandler();
    this.proactor.registerHandler('query', this.handler);
    this.maxConnections = maxConnections;
    this.activeQueries = 0;
  }

  async executeQuery(sql) {
    // Check cache first
    const cached = this.handler.getCachedResult(sql);
    if (cached) {
      console.log(`\n[Database] Cache hit for: ${sql}`);
      return cached;
    }

    this.activeQueries++;
    const opId = await this.proactor.initiateOperation('query', sql);
    return opId;
  }

  async waitForQueries() {
    await this.proactor.waitForCompletion();
    this.activeQueries = 0;
  }
}

// ============================================================================
// Usage Examples
// ============================================================================

async function demonstrateProactorPattern() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║          Proactor Pattern - Comprehensive Examples            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  // Example 1: Basic Proactor with single operation
  console.log('\n--- Example 1: Basic Async Operation ---');
  const proactor1 = new Proactor();
  const handler1 = new FileIOCompletionHandler();
  proactor1.registerHandler('fileRead', handler1);

  await proactor1.initiateOperation('fileRead', 'document.txt');
  await proactor1.waitForCompletion();

  // Example 2: File Processing System
  console.log('\n--- Example 2: Batch File Processing ---');
  const fileSystem = new FileProcessingSystem();

  await fileSystem.readFile('file1.txt');
  await fileSystem.readFile('file2.txt');
  await fileSystem.writeFile('output.txt', 'processed data');
  await fileSystem.waitForAll();

  // Example 3: Web Crawler
  console.log('\n--- Example 3: Concurrent Web Crawling ---');
  const crawler = new WebCrawler();

  const urls = [
    'https://example.com/page1',
    'https://example.com/page2',
    'https://example.com/page3',
    'https://example.com/page4'
  ];

  await crawler.crawlMultiple(urls);

  // Example 4: Database Queries
  console.log('\n--- Example 4: Async Database Queries ---');
  const dbPool = new DatabasePool(3);

  await dbPool.executeQuery('SELECT * FROM users WHERE id = 1');
  await dbPool.executeQuery('SELECT * FROM products WHERE category = "electronics"');
  await dbPool.executeQuery('SELECT * FROM orders WHERE status = "pending"');
  await dbPool.executeQuery('SELECT * FROM users WHERE id = 1'); // Cache hit

  await dbPool.waitForQueries();

  // Example 5: Mixed operations with event monitoring
  console.log('\n--- Example 5: Multiple Operation Types ---');
  const proactor2 = new Proactor();

  const fileHandler = new FileIOCompletionHandler();
  const netHandler = new NetworkCompletionHandler();
  const dbHandler = new DatabaseCompletionHandler();

  proactor2.registerHandler('fileOp', fileHandler);
  proactor2.registerHandler('networkOp', netHandler);
  proactor2.registerHandler('dbOp', dbHandler);

  let completedCount = 0;
  proactor2.getEventEmitter().on('operationComplete', (op) => {
    completedCount++;
    console.log(`\n[Event] Operation ${op.id} completed (${completedCount} total)`);
  });

  await proactor2.initiateOperation('fileOp', 'config.json');
  await proactor2.initiateOperation('networkOp', 'https://api.example.com/data');
  await proactor2.initiateOperation('dbOp', 'SELECT COUNT(*) FROM users');
  await proactor2.initiateOperation('fileOp', 'data.csv');

  await proactor2.waitForCompletion();

  console.log('\n--- Pattern Benefits ---');
  console.log('✓ Efficient handling of async operations');
  console.log('✓ Separation of initiation and completion handling');
  console.log('✓ Better resource utilization with async I/O');
  console.log('✓ Scalable for high-concurrency scenarios');
}

/**
 * Helper function for delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run demonstrations
if (require.main === module) {
  demonstrateProactorPattern().catch(console.error);
}

module.exports = {
  Proactor,
  CompletionHandler,
  AsyncOperation,
  FileIOCompletionHandler,
  NetworkCompletionHandler,
  DatabaseCompletionHandler,
  FileProcessingSystem,
  WebCrawler,
  DatabasePool
};
