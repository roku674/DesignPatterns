/**
 * Asynchronous Completion Token (ACT) Pattern Implementation in JavaScript
 *
 * The ACT pattern allows an application to demultiplex and process efficiently
 * the responses of asynchronous operations it invokes on services. It associates
 * application-specific information with asynchronous operations so that this
 * information is available when the operation completes.
 *
 * Key Components:
 * - Asynchronous Operation: An operation that completes asynchronously
 * - Completion Token: Contains application-specific context for the operation
 * - Asynchronous Operation Processor: Executes async operations
 * - Completion Handler: Processes completed operations using token context
 * - Token Factory: Creates completion tokens with context
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Completion Token - Encapsulates context for asynchronous operations
 */
class CompletionToken {
  constructor(id, context = {}) {
    this.id = id;
    this.context = context;
    this.timestamp = Date.now();
    this.metadata = {};
  }

  setMetadata(key, value) {
    this.metadata[key] = value;
  }

  getMetadata(key) {
    return this.metadata[key];
  }

  getContext(key) {
    return this.context[key];
  }

  setContext(key, value) {
    this.context[key] = value;
  }

  getAge() {
    return Date.now() - this.timestamp;
  }

  clone() {
    const token = new CompletionToken(this.id, { ...this.context });
    token.metadata = { ...this.metadata };
    return token;
  }

  toString() {
    return `Token[${this.id}]`;
  }
}

/**
 * Token Factory - Creates completion tokens with specific context
 */
class TokenFactory {
  constructor() {
    this.tokenCount = 0;
    this.defaultContext = {};
  }

  setDefaultContext(context) {
    this.defaultContext = { ...context };
  }

  createToken(context = {}) {
    const mergedContext = { ...this.defaultContext, ...context };
    const id = `token-${++this.tokenCount}-${crypto.randomBytes(4).toString('hex')}`;
    return new CompletionToken(id, mergedContext);
  }

  createBatchTokens(count, contextFn = null) {
    const tokens = [];
    for (let i = 0; i < count; i++) {
      const context = contextFn ? contextFn(i) : {};
      tokens.push(this.createToken(context));
    }
    return tokens;
  }
}

/**
 * Async Operation Result - Represents the result of an async operation
 */
class AsyncOperationResult {
  constructor(token, success, data = null, error = null) {
    this.token = token;
    this.success = success;
    this.data = data;
    this.error = error;
    this.completionTime = Date.now();
    this.duration = this.completionTime - token.timestamp;
  }

  isSuccess() {
    return this.success;
  }

  getData() {
    return this.data;
  }

  getError() {
    return this.error;
  }

  getToken() {
    return this.token;
  }

  getDuration() {
    return this.duration;
  }
}

/**
 * Asynchronous Operation - Represents an async operation with token
 */
class AsyncOperation {
  constructor(name, token, executor) {
    this.name = name;
    this.token = token;
    this.executor = executor;
    this.startTime = null;
    this.endTime = null;
    this.status = 'pending';
  }

  async execute() {
    this.startTime = Date.now();
    this.status = 'executing';

    try {
      const result = await this.executor(this.token);
      this.endTime = Date.now();
      this.status = 'completed';

      return new AsyncOperationResult(this.token, true, result);
    } catch (error) {
      this.endTime = Date.now();
      this.status = 'failed';

      return new AsyncOperationResult(this.token, false, null, error);
    }
  }

  getDuration() {
    return this.endTime ? this.endTime - this.startTime : null;
  }

  toString() {
    return `AsyncOp[${this.name}, ${this.token.id}]`;
  }
}

/**
 * Completion Handler - Processes completed operations
 */
class CompletionHandler {
  constructor(name) {
    this.name = name;
    this.handledCount = 0;
  }

  async handleCompletion(result) {
    this.handledCount++;
    const token = result.getToken();

    if (result.isSuccess()) {
      await this.onSuccess(token, result.getData());
    } else {
      await this.onError(token, result.getError());
    }
  }

  async onSuccess(token, data) {
    console.log(`[${this.name}] Success for ${token.id}: ${JSON.stringify(data)}`);
  }

  async onError(token, error) {
    console.log(`[${this.name}] Error for ${token.id}: ${error.message}`);
  }

  getHandledCount() {
    return this.handledCount;
  }
}

/**
 * Asynchronous Operation Processor - Executes and manages async operations
 */
class AsyncOperationProcessor extends EventEmitter {
  constructor(concurrency = 4) {
    super();
    this.concurrency = concurrency;
    this.activeOperations = new Map();
    this.completedOperations = [];
    this.handlers = new Map();
  }

  registerHandler(operationType, handler) {
    if (!this.handlers.has(operationType)) {
      this.handlers.set(operationType, []);
    }
    this.handlers.get(operationType).push(handler);
  }

  async initiateOperation(name, token, executor) {
    const operation = new AsyncOperation(name, token, executor);
    this.activeOperations.set(token.id, operation);

    const result = await operation.execute();
    this.activeOperations.delete(token.id);
    this.completedOperations.push(result);

    await this.dispatchCompletion(name, result);

    return result;
  }

  async dispatchCompletion(operationType, result) {
    const handlers = this.handlers.get(operationType) || [];

    for (const handler of handlers) {
      try {
        await handler.handleCompletion(result);
      } catch (error) {
        console.error(`Error in completion handler for ${operationType}:`, error);
      }
    }

    this.emit('completion', { operationType, result });
  }

  getActiveCount() {
    return this.activeOperations.size;
  }

  getCompletedCount() {
    return this.completedOperations.length;
  }

  getStats() {
    return {
      active: this.getActiveCount(),
      completed: this.getCompletedCount(),
      handlers: this.handlers.size
    };
  }
}

/**
 * Concrete Completion Handlers
 */

class HttpRequestHandler extends CompletionHandler {
  constructor() {
    super('HttpRequestHandler');
    this.responses = [];
  }

  async onSuccess(token, data) {
    const url = token.getContext('url');
    const method = token.getContext('method');

    console.log(`[${this.name}] ${method} ${url} -> ${data.status}`);
    this.responses.push({ token, data });
  }

  async onError(token, error) {
    const url = token.getContext('url');
    console.error(`[${this.name}] Request to ${url} failed: ${error.message}`);
  }

  getResponses() {
    return this.responses;
  }
}

class DatabaseQueryHandler extends CompletionHandler {
  constructor() {
    super('DatabaseQueryHandler');
    this.results = [];
  }

  async onSuccess(token, data) {
    const query = token.getContext('query');
    const table = token.getContext('table');

    console.log(`[${this.name}] Query on ${table} returned ${data.rows} rows`);
    this.results.push({ token, data });
  }

  async onError(token, error) {
    const query = token.getContext('query');
    console.error(`[${this.name}] Query failed: ${error.message}`);
  }

  getResults() {
    return this.results;
  }
}

class FileOperationHandler extends CompletionHandler {
  constructor() {
    super('FileOperationHandler');
    this.operations = [];
  }

  async onSuccess(token, data) {
    const filename = token.getContext('filename');
    const operation = token.getContext('operation');

    console.log(`[${this.name}] ${operation} on ${filename}: ${data.size} bytes`);
    this.operations.push({ token, data });
  }

  async onError(token, error) {
    const filename = token.getContext('filename');
    console.error(`[${this.name}] Operation on ${filename} failed: ${error.message}`);
  }
}

class NotificationHandler extends CompletionHandler {
  constructor() {
    super('NotificationHandler');
    this.notifications = [];
  }

  async onSuccess(token, data) {
    const recipient = token.getContext('recipient');
    const messageType = token.getContext('messageType');

    console.log(`[${this.name}] ${messageType} sent to ${recipient}`);
    this.notifications.push({ recipient, messageType, data });

    const callback = token.getContext('onComplete');
    if (callback) {
      await callback(data);
    }
  }

  async onError(token, error) {
    const recipient = token.getContext('recipient');
    console.error(`[${this.name}] Failed to send to ${recipient}: ${error.message}`);
  }
}

class BatchProcessingHandler extends CompletionHandler {
  constructor() {
    super('BatchProcessingHandler');
    this.batches = new Map();
  }

  async onSuccess(token, data) {
    const batchId = token.getContext('batchId');
    const itemId = token.getContext('itemId');

    if (!this.batches.has(batchId)) {
      this.batches.set(batchId, []);
    }

    this.batches.get(batchId).push({ itemId, data });
    console.log(`[${this.name}] Item ${itemId} in batch ${batchId} completed`);

    const totalItems = token.getContext('totalItems');
    const currentBatch = this.batches.get(batchId);

    if (currentBatch.length === totalItems) {
      console.log(`[${this.name}] Batch ${batchId} fully completed!`);
      const onBatchComplete = token.getContext('onBatchComplete');
      if (onBatchComplete) {
        await onBatchComplete(batchId, currentBatch);
      }
    }
  }

  getBatchStatus(batchId) {
    return this.batches.get(batchId) || [];
  }
}

/**
 * Example Usage and Demonstrations
 */

async function demonstrateBasicACT() {
  console.log('\n=== Basic Asynchronous Completion Token Demo ===\n');

  const factory = new TokenFactory();
  const processor = new AsyncOperationProcessor();
  const handler = new CompletionHandler('BasicHandler');

  processor.registerHandler('compute', handler);

  const token1 = factory.createToken({ taskId: 'task-1', priority: 'high' });
  const token2 = factory.createToken({ taskId: 'task-2', priority: 'low' });

  await processor.initiateOperation('compute', token1, async (token) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { result: 42, taskId: token.getContext('taskId') };
  });

  await processor.initiateOperation('compute', token2, async (token) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { result: 84, taskId: token.getContext('taskId') };
  });

  console.log(`\nStats:`, processor.getStats());
}

async function demonstrateHttpRequests() {
  console.log('\n=== HTTP Requests with ACT Demo ===\n');

  const factory = new TokenFactory();
  const processor = new AsyncOperationProcessor();
  const handler = new HttpRequestHandler();

  processor.registerHandler('http', handler);

  const urls = [
    { url: 'https://api.example.com/users', method: 'GET' },
    { url: 'https://api.example.com/posts', method: 'GET' },
    { url: 'https://api.example.com/data', method: 'POST' }
  ];

  const promises = urls.map(({ url, method }) => {
    const token = factory.createToken({ url, method, requestId: crypto.randomBytes(4).toString('hex') });

    return processor.initiateOperation('http', token, async () => {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      return { status: 200, body: 'Success' };
    });
  });

  await Promise.all(promises);

  console.log(`\nTotal responses: ${handler.getResponses().length}`);
}

async function demonstrateDatabaseQueries() {
  console.log('\n=== Database Queries with ACT Demo ===\n');

  const factory = new TokenFactory();
  factory.setDefaultContext({ database: 'myapp' });

  const processor = new AsyncOperationProcessor();
  const handler = new DatabaseQueryHandler();

  processor.registerHandler('db-query', handler);

  const queries = [
    { table: 'users', query: 'SELECT * FROM users WHERE active=true' },
    { table: 'orders', query: 'SELECT * FROM orders WHERE date > NOW() - INTERVAL 7 DAY' },
    { table: 'products', query: 'SELECT * FROM products WHERE stock > 0' }
  ];

  for (const { table, query } of queries) {
    const token = factory.createToken({ table, query });

    processor.initiateOperation('db-query', token, async () => {
      await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 120));
      return { rows: Math.floor(Math.random() * 100) + 1, executionTime: '15ms' };
    });
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  console.log(`\nTotal query results: ${handler.getResults().length}`);
}

async function demonstrateFileOperations() {
  console.log('\n=== File Operations with ACT Demo ===\n');

  const factory = new TokenFactory();
  const processor = new AsyncOperationProcessor();
  const handler = new FileOperationHandler();

  processor.registerHandler('file', handler);

  const files = ['document.txt', 'image.png', 'data.json', 'report.pdf'];
  const operations = ['read', 'write', 'read', 'read'];

  for (let i = 0; i < files.length; i++) {
    const token = factory.createToken({
      filename: files[i],
      operation: operations[i],
      path: `/data/${files[i]}`
    });

    processor.initiateOperation('file', token, async () => {
      await new Promise(resolve => setTimeout(resolve, 60 + Math.random() * 90));
      return { size: Math.floor(Math.random() * 10000) + 100 };
    });
  }

  await new Promise(resolve => setTimeout(resolve, 400));
}

async function demonstrateNotifications() {
  console.log('\n=== Notifications with ACT Demo ===\n');

  const factory = new TokenFactory();
  const processor = new AsyncOperationProcessor();
  const handler = new NotificationHandler();

  processor.registerHandler('notification', handler);

  const recipients = ['alice@example.com', 'bob@example.com', 'charlie@example.com'];

  for (const recipient of recipients) {
    const token = factory.createToken({
      recipient,
      messageType: 'email',
      onComplete: async (data) => {
        console.log(`  Callback: Email to ${recipient} was delivered`);
      }
    });

    processor.initiateOperation('notification', token, async () => {
      await new Promise(resolve => setTimeout(resolve, 70 + Math.random() * 100));
      return { messageId: crypto.randomBytes(8).toString('hex'), delivered: true };
    });
  }

  await new Promise(resolve => setTimeout(resolve, 500));
}

async function demonstrateBatchProcessing() {
  console.log('\n=== Batch Processing with ACT Demo ===\n');

  const factory = new TokenFactory();
  const processor = new AsyncOperationProcessor();
  const handler = new BatchProcessingHandler();

  processor.registerHandler('batch', handler);

  const batches = [
    { batchId: 'batch-1', items: ['item-1', 'item-2', 'item-3'] },
    { batchId: 'batch-2', items: ['item-4', 'item-5'] }
  ];

  for (const batch of batches) {
    for (const item of batch.items) {
      const token = factory.createToken({
        batchId: batch.batchId,
        itemId: item,
        totalItems: batch.items.length,
        onBatchComplete: async (batchId, results) => {
          console.log(`  *** Batch ${batchId} complete with ${results.length} items ***`);
        }
      });

      processor.initiateOperation('batch', token, async () => {
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        return { processed: true, value: Math.random() * 100 };
      });
    }
  }

  await new Promise(resolve => setTimeout(resolve, 600));
}

async function demonstrateErrorHandling() {
  console.log('\n=== Error Handling with ACT Demo ===\n');

  const factory = new TokenFactory();
  const processor = new AsyncOperationProcessor();
  const handler = new CompletionHandler('ErrorHandler');

  processor.registerHandler('risky-operation', handler);

  const tokens = factory.createBatchTokens(5, (i) => ({
    operationId: `op-${i}`,
    shouldFail: i % 2 === 0
  }));

  for (const token of tokens) {
    processor.initiateOperation('risky-operation', token, async (token) => {
      await new Promise(resolve => setTimeout(resolve, 50));

      if (token.getContext('shouldFail')) {
        throw new Error('Simulated failure');
      }

      return { success: true };
    });
  }

  await new Promise(resolve => setTimeout(resolve, 400));

  console.log(`\nHandler processed: ${handler.getHandledCount()} operations`);
}

async function runAllDemos() {
  await demonstrateBasicACT();
  await demonstrateHttpRequests();
  await demonstrateDatabaseQueries();
  await demonstrateFileOperations();
  await demonstrateNotifications();
  await demonstrateBatchProcessing();
  await demonstrateErrorHandling();
}

if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  CompletionToken,
  TokenFactory,
  AsyncOperation,
  AsyncOperationResult,
  AsyncOperationProcessor,
  CompletionHandler,
  HttpRequestHandler,
  DatabaseQueryHandler,
  FileOperationHandler,
  NotificationHandler,
  BatchProcessingHandler
};
