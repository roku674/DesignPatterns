/**
 * Active Object Pattern Implementation
 *
 * The Active Object pattern decouples method execution from method invocation
 * to enhance concurrency and simplify synchronized access to shared resources.
 * Methods are executed in their own thread/context, with requests queued.
 *
 * Key Components:
 * - Proxy: Public interface for clients
 * - Activation Queue: Stores pending method requests
 * - Scheduler: Decides which request to execute next
 * - Servant: Implements the actual functionality
 * - Future: Represents the result of async method invocation
 *
 * Use Cases:
 * - Concurrent servers handling multiple requests
 * - Background task processing
 * - Async API implementations
 * - Message queuing systems
 */

const { EventEmitter } = require('events');

/**
 * Future - Represents a result that will be available in the future
 */
class Future {
  constructor() {
    this.completed = false;
    this.value = null;
    this.error = null;
    this.callbacks = [];
  }

  /**
   * Set the future's value
   * @param {*} value
   */
  resolve(value) {
    if (this.completed) return;
    this.completed = true;
    this.value = value;
    this.callbacks.forEach(cb => cb(null, value));
    this.callbacks = [];
  }

  /**
   * Set the future's error
   * @param {Error} error
   */
  reject(error) {
    if (this.completed) return;
    this.completed = true;
    this.error = error;
    this.callbacks.forEach(cb => cb(error, null));
    this.callbacks = [];
  }

  /**
   * Register callback for when future completes
   * @param {Function} callback
   */
  onComplete(callback) {
    if (this.completed) {
      callback(this.error, this.value);
    } else {
      this.callbacks.push(callback);
    }
  }

  /**
   * Convert to Promise
   * @returns {Promise}
   */
  toPromise() {
    return new Promise((resolve, reject) => {
      this.onComplete((error, value) => {
        if (error) reject(error);
        else resolve(value);
      });
    });
  }

  /**
   * Check if future is ready
   * @returns {boolean}
   */
  isReady() {
    return this.completed;
  }

  /**
   * Get value (throws if not ready)
   * @returns {*}
   */
  getValue() {
    if (!this.completed) {
      throw new Error("Future not ready");
    }
    if (this.error) {
      throw this.error;
    }
    return this.value;
  }
}

/**
 * Method Request - Encapsulates a method call
 */
class MethodRequest {
  constructor(id, methodName, args, future) {
    this.id = id;
    this.methodName = methodName;
    this.args = args;
    this.future = future;
    this.timestamp = Date.now();
  }

  /**
   * Execute the method on a servant
   * @param {*} servant
   */
  async execute(servant) {
    try {
      const method = servant[this.methodName];
      if (!method) {
        throw new Error(`Method ${this.methodName} not found`);
      }
      const result = await method.apply(servant, this.args);
      this.future.resolve(result);
    } catch (error) {
      this.future.reject(error);
    }
  }
}

/**
 * Activation Queue - Stores pending method requests
 */
class ActivationQueue {
  constructor() {
    this.queue = [];
    this.emitter = new EventEmitter();
  }

  /**
   * Enqueue a method request
   * @param {MethodRequest} request
   */
  enqueue(request) {
    this.queue.push(request);
    this.emitter.emit('requestAdded', request);
  }

  /**
   * Dequeue a method request
   * @returns {MethodRequest|null}
   */
  dequeue() {
    return this.queue.shift() || null;
  }

  /**
   * Check if queue is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.queue.length === 0;
  }

  /**
   * Get queue size
   * @returns {number}
   */
  size() {
    return this.queue.length;
  }

  /**
   * Listen for new requests
   * @param {Function} callback
   */
  onRequestAdded(callback) {
    this.emitter.on('requestAdded', callback);
  }
}

/**
 * Scheduler - Manages the execution of method requests
 */
class Scheduler {
  constructor(servant, activationQueue) {
    this.servant = servant;
    this.activationQueue = activationQueue;
    this.running = false;
    this.processing = false;
  }

  /**
   * Start processing requests
   */
  start() {
    this.running = true;
    this.processQueue();

    // Listen for new requests
    this.activationQueue.onRequestAdded(() => {
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Stop processing requests
   */
  stop() {
    this.running = false;
  }

  /**
   * Process requests from the queue
   */
  async processQueue() {
    if (this.processing || !this.running) return;

    this.processing = true;

    while (this.running && !this.activationQueue.isEmpty()) {
      const request = this.activationQueue.dequeue();
      if (request) {
        await request.execute(this.servant);
      }
    }

    this.processing = false;
  }
}

/**
 * Active Object Proxy - Public interface for clients
 */
class ActiveObjectProxy {
  constructor(servant) {
    this.servant = servant;
    this.activationQueue = new ActivationQueue();
    this.scheduler = new Scheduler(servant, this.activationQueue);
    this.requestCounter = 0;
    this.scheduler.start();
  }

  /**
   * Invoke a method asynchronously
   * @param {string} methodName
   * @param {...*} args
   * @returns {Future}
   */
  invoke(methodName, ...args) {
    const future = new Future();
    const request = new MethodRequest(
      ++this.requestCounter,
      methodName,
      args,
      future
    );

    console.log(`[Proxy] Enqueuing request ${request.id}: ${methodName}()`);
    this.activationQueue.enqueue(request);

    return future;
  }

  /**
   * Shutdown the active object
   */
  shutdown() {
    this.scheduler.stop();
    console.log('[Proxy] Active object shut down');
  }

  /**
   * Get queue statistics
   * @returns {Object}
   */
  getStats() {
    return {
      queueSize: this.activationQueue.size(),
      requestsProcessed: this.requestCounter
    };
  }
}

// ============================================================================
// Example Servants
// ============================================================================

/**
 * Bank Account Servant - Manages account operations
 */
class BankAccountServant {
  constructor(accountId, initialBalance = 0) {
    this.accountId = accountId;
    this.balance = initialBalance;
    this.transactions = [];
  }

  async deposit(amount) {
    console.log(`  [Account ${this.accountId}] Processing deposit: $${amount}`);
    await this.simulateProcessing();

    this.balance += amount;
    this.transactions.push({ type: 'deposit', amount, balance: this.balance });

    console.log(`  [Account ${this.accountId}] New balance: $${this.balance}`);
    return { balance: this.balance, transactionId: this.transactions.length };
  }

  async withdraw(amount) {
    console.log(`  [Account ${this.accountId}] Processing withdrawal: $${amount}`);
    await this.simulateProcessing();

    if (this.balance < amount) {
      throw new Error(`Insufficient funds. Balance: $${this.balance}`);
    }

    this.balance -= amount;
    this.transactions.push({ type: 'withdraw', amount, balance: this.balance });

    console.log(`  [Account ${this.accountId}] New balance: $${this.balance}`);
    return { balance: this.balance, transactionId: this.transactions.length };
  }

  async getBalance() {
    console.log(`  [Account ${this.accountId}] Fetching balance`);
    await this.simulateProcessing();
    return this.balance;
  }

  async getTransactionHistory() {
    console.log(`  [Account ${this.accountId}] Fetching transaction history`);
    await this.simulateProcessing();
    return [...this.transactions];
  }

  async simulateProcessing() {
    return new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Logger Servant - Async logging operations
 */
class LoggerServant {
  constructor() {
    this.logs = [];
    this.logFile = 'application.log';
  }

  async log(level, message) {
    await this.simulateIO();

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };

    this.logs.push(entry);
    console.log(`  [Logger] ${level.toUpperCase()}: ${message}`);

    return entry;
  }

  async info(message) {
    return await this.log('info', message);
  }

  async warn(message) {
    return await this.log('warn', message);
  }

  async error(message) {
    return await this.log('error', message);
  }

  async getLogs(level = null) {
    await this.simulateIO();

    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  async simulateIO() {
    return new Promise(resolve => setTimeout(resolve, 50));
  }
}

/**
 * Data Processor Servant - Background data processing
 */
class DataProcessorServant {
  constructor() {
    this.processedItems = 0;
    this.cache = new Map();
  }

  async processData(data) {
    console.log(`  [Processor] Processing data: ${JSON.stringify(data).substring(0, 50)}...`);

    // Simulate heavy computation
    await new Promise(resolve => setTimeout(resolve, 200));

    const processed = {
      original: data,
      processed: true,
      timestamp: Date.now(),
      id: ++this.processedItems
    };

    this.cache.set(processed.id, processed);

    console.log(`  [Processor] Completed processing item ${processed.id}`);
    return processed;
  }

  async batchProcess(items) {
    console.log(`  [Processor] Batch processing ${items.length} items`);

    const results = [];
    for (const item of items) {
      const result = await this.processData(item);
      results.push(result);
    }

    console.log(`  [Processor] Batch complete`);
    return results;
  }

  async getProcessedItem(id) {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.cache.get(id);
  }

  async getStats() {
    return {
      totalProcessed: this.processedItems,
      cacheSize: this.cache.size
    };
  }
}

// ============================================================================
// Usage Examples
// ============================================================================

async function demonstrateActiveObjectPattern() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         Active Object Pattern - Comprehensive Examples        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  // Example 1: Bank Account with concurrent operations
  console.log('\n--- Example 1: Concurrent Bank Account Operations ---');
  const accountServant = new BankAccountServant('ACC-001', 1000);
  const accountProxy = new ActiveObjectProxy(accountServant);

  const f1 = accountProxy.invoke('deposit', 500);
  const f2 = accountProxy.invoke('withdraw', 200);
  const f3 = accountProxy.invoke('deposit', 300);
  const f4 = accountProxy.invoke('getBalance');

  const results = await Promise.all([
    f1.toPromise(),
    f2.toPromise(),
    f3.toPromise(),
    f4.toPromise()
  ]);

  console.log('\nResults:', results);
  accountProxy.shutdown();

  // Example 2: Async Logger
  console.log('\n--- Example 2: Asynchronous Logging ---');
  const loggerServant = new LoggerServant();
  const loggerProxy = new ActiveObjectProxy(loggerServant);

  loggerProxy.invoke('info', 'Application started');
  loggerProxy.invoke('warn', 'Low memory warning');
  loggerProxy.invoke('error', 'Connection failed');
  loggerProxy.invoke('info', 'Retrying connection');

  await sleep(300);

  const logs = await loggerProxy.invoke('getLogs').toPromise();
  console.log(`\nTotal logs: ${logs.length}`);

  loggerProxy.shutdown();

  // Example 3: Background Data Processing
  console.log('\n--- Example 3: Background Data Processing ---');
  const processorServant = new DataProcessorServant();
  const processorProxy = new ActiveObjectProxy(processorServant);

  const data1 = processorProxy.invoke('processData', { name: 'Item 1', value: 100 });
  const data2 = processorProxy.invoke('processData', { name: 'Item 2', value: 200 });
  const data3 = processorProxy.invoke('processData', { name: 'Item 3', value: 300 });

  const processedResults = await Promise.all([
    data1.toPromise(),
    data2.toPromise(),
    data3.toPromise()
  ]);

  console.log(`\nProcessed ${processedResults.length} items`);

  const stats = await processorProxy.invoke('getStats').toPromise();
  console.log('Processor stats:', stats);

  processorProxy.shutdown();

  // Example 4: Multiple accounts with concurrent access
  console.log('\n--- Example 4: Multiple Active Objects ---');
  const account1Servant = new BankAccountServant('ACC-100', 5000);
  const account2Servant = new BankAccountServant('ACC-200', 3000);

  const account1 = new ActiveObjectProxy(account1Servant);
  const account2 = new ActiveObjectProxy(account2Servant);

  // Transfer simulation
  const withdraw = account1.invoke('withdraw', 1000);
  const deposit = account2.invoke('deposit', 1000);

  await Promise.all([withdraw.toPromise(), deposit.toPromise()]);

  const balance1 = await account1.invoke('getBalance').toPromise();
  const balance2 = await account2.invoke('getBalance').toPromise();

  console.log(`\nAccount 1 balance: $${balance1}`);
  console.log(`Account 2 balance: $${balance2}`);

  account1.shutdown();
  account2.shutdown();

  // Example 5: Batch processing with futures
  console.log('\n--- Example 5: Batch Processing with Futures ---');
  const batchProcessor = new ActiveObjectProxy(new DataProcessorServant());

  const items = [
    { id: 1, data: 'First' },
    { id: 2, data: 'Second' },
    { id: 3, data: 'Third' }
  ];

  const batchFuture = batchProcessor.invoke('batchProcess', items);

  console.log('Waiting for batch to complete...');
  const batchResults = await batchFuture.toPromise();
  console.log(`Batch complete: ${batchResults.length} items processed`);

  batchProcessor.shutdown();

  console.log('\n--- Pattern Benefits ---');
  console.log('✓ Decouples method invocation from execution');
  console.log('✓ Simplifies concurrent access to shared objects');
  console.log('✓ Allows async execution without blocking clients');
  console.log('✓ Provides futures for result retrieval');
}

/**
 * Helper function for delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run demonstrations
if (require.main === module) {
  demonstrateActiveObjectPattern().catch(console.error);
}

module.exports = {
  Future,
  MethodRequest,
  ActivationQueue,
  Scheduler,
  ActiveObjectProxy,
  BankAccountServant,
  LoggerServant,
  DataProcessorServant
};
