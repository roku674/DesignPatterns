/**
 * Proactor Pattern Implementation in JavaScript
 *
 * The Proactor pattern handles asynchronous operations efficiently by initiating
 * operations and processing their completions asynchronously. Unlike Reactor which
 * demultiplexes events synchronously, Proactor handles asynchronous I/O completions.
 *
 * Key Components:
 * - Proactive Initiator: Initiates asynchronous operations
 * - Asynchronous Operation Processor: Executes operations asynchronously
 * - Completion Handler: Handles completed operations
 * - Completion Dispatcher: Dispatches completion events to handlers
 * - Proactor: Manages the completion event queue
 */

const EventEmitter = require('events');
const { Worker } = require('worker_threads');

/**
 * Asynchronous Operation - Represents an async operation
 */
class AsyncOperation {
  constructor(id, type, data, priority = 0) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.priority = priority;
    this.startTime = Date.now();
    this.endTime = null;
    this.status = 'pending';
    this.result = null;
    this.error = null;
  }

  complete(result) {
    this.endTime = Date.now();
    this.status = 'completed';
    this.result = result;
  }

  fail(error) {
    this.endTime = Date.now();
    this.status = 'failed';
    this.error = error;
  }

  getDuration() {
    return this.endTime ? this.endTime - this.startTime : Date.now() - this.startTime;
  }

  toString() {
    return `AsyncOp[${this.id}:${this.type}:${this.status}]`;
  }
}

/**
 * Completion Event - Represents a completed operation
 */
class CompletionEvent {
  constructor(operation, result) {
    this.operation = operation;
    this.result = result;
    this.timestamp = Date.now();
  }

  toString() {
    return `CompletionEvent[${this.operation.id}]`;
  }
}

/**
 * Completion Handler Interface
 */
class CompletionHandler {
  async handleCompletion(event) {
    throw new Error('handleCompletion must be implemented by subclass');
  }

  getOperationType() {
    throw new Error('getOperationType must be implemented by subclass');
  }
}

/**
 * Asynchronous Operation Processor
 */
class AsyncOperationProcessor extends EventEmitter {
  constructor(concurrency = 4) {
    super();
    this.concurrency = concurrency;
    this.activeOperations = new Map();
    this.running = false;
  }

  async processOperation(operation) {
    this.activeOperations.set(operation.id, operation);

    try {
      const result = await this.executeOperation(operation);
      operation.complete(result);
      this.emit('completion', new CompletionEvent(operation, result));
    } catch (error) {
      operation.fail(error);
      this.emit('completion', new CompletionEvent(operation, null));
    } finally {
      this.activeOperations.delete(operation.id);
    }
  }

  async executeOperation(operation) {
    switch (operation.type) {
      case 'read':
        return await this.simulateRead(operation.data);
      case 'write':
        return await this.simulateWrite(operation.data);
      case 'compute':
        return await this.simulateCompute(operation.data);
      case 'network':
        return await this.simulateNetwork(operation.data);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  async simulateRead(data) {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    return { type: 'read', data: `Read: ${data}`, size: data.length };
  }

  async simulateWrite(data) {
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 70));
    return { type: 'write', data: `Written: ${data}`, size: data.length };
  }

  async simulateCompute(data) {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    return { type: 'compute', result: data.value * 2, computation: data.operation };
  }

  async simulateNetwork(data) {
    await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 120));
    return { type: 'network', response: { status: 200, data: `Response for ${data.url}` } };
  }

  getActiveCount() {
    return this.activeOperations.size;
  }
}

/**
 * Completion Dispatcher - Routes completion events to appropriate handlers
 */
class CompletionDispatcher {
  constructor() {
    this.handlers = new Map();
    this.completionQueue = [];
  }

  registerHandler(operationType, handler) {
    if (!this.handlers.has(operationType)) {
      this.handlers.set(operationType, []);
    }
    this.handlers.get(operationType).push(handler);
  }

  unregisterHandler(operationType, handler) {
    const handlers = this.handlers.get(operationType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  async dispatch(event) {
    const handlers = this.handlers.get(event.operation.type);
    if (handlers && handlers.length > 0) {
      for (const handler of handlers) {
        try {
          await handler.handleCompletion(event);
        } catch (error) {
          console.error(`Error in completion handler for ${event.operation.type}:`, error);
        }
      }
    }
  }

  queueCompletion(event) {
    this.completionQueue.push(event);
  }

  async processQueue() {
    while (this.completionQueue.length > 0) {
      const event = this.completionQueue.shift();
      await this.dispatch(event);
    }
  }
}

/**
 * Proactor - Main coordinator for asynchronous operations
 */
class Proactor {
  constructor(concurrency = 4) {
    this.processor = new AsyncOperationProcessor(concurrency);
    this.dispatcher = new CompletionDispatcher();
    this.operationQueue = [];
    this.running = false;
    this.operationCount = 0;
    this.completedCount = 0;

    this.processor.on('completion', (event) => {
      this.dispatcher.queueCompletion(event);
      this.completedCount++;
    });
  }

  registerHandler(operationType, handler) {
    this.dispatcher.registerHandler(operationType, handler);
  }

  unregisterHandler(operationType, handler) {
    this.dispatcher.unregisterHandler(operationType, handler);
  }

  async initiateOperation(type, data, priority = 0) {
    const operation = new AsyncOperation(
      `op-${++this.operationCount}`,
      type,
      data,
      priority
    );

    this.operationQueue.push(operation);
    this.operationQueue.sort((a, b) => b.priority - a.priority);

    if (this.running) {
      await this.processNextOperation();
    }

    return operation;
  }

  async processNextOperation() {
    if (this.operationQueue.length === 0) {
      return;
    }

    const maxConcurrent = this.processor.concurrency;
    const activeCount = this.processor.getActiveCount();

    if (activeCount < maxConcurrent) {
      const operation = this.operationQueue.shift();
      this.processor.processOperation(operation);
    }
  }

  async run() {
    this.running = true;
    console.log('Proactor started');

    while (this.running || this.operationQueue.length > 0 || this.processor.getActiveCount() > 0) {
      await this.processNextOperation();
      await this.dispatcher.processQueue();
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log(`Proactor stopped - Completed ${this.completedCount} operations`);
  }

  stop() {
    this.running = false;
  }

  getStats() {
    return {
      total: this.operationCount,
      completed: this.completedCount,
      queued: this.operationQueue.length,
      active: this.processor.getActiveCount()
    };
  }
}

/**
 * Concrete Completion Handlers
 */

class ReadCompletionHandler extends CompletionHandler {
  constructor(name) {
    super();
    this.name = name;
    this.results = [];
  }

  async handleCompletion(event) {
    const { operation, result } = event;
    this.results.push(result);
    console.log(`[${this.name}] Read completed: ${operation.id} (${operation.getDuration()}ms)`);
    console.log(`  Result:`, result);
  }

  getOperationType() {
    return 'read';
  }
}

class WriteCompletionHandler extends CompletionHandler {
  constructor(name) {
    super();
    this.name = name;
    this.writtenBytes = 0;
  }

  async handleCompletion(event) {
    const { operation, result } = event;
    if (result && result.size) {
      this.writtenBytes += result.size;
    }
    console.log(`[${this.name}] Write completed: ${operation.id} (${operation.getDuration()}ms)`);
    console.log(`  Total bytes written: ${this.writtenBytes}`);
  }

  getOperationType() {
    return 'write';
  }
}

class ComputeCompletionHandler extends CompletionHandler {
  constructor(name) {
    super();
    this.name = name;
    this.computations = [];
  }

  async handleCompletion(event) {
    const { operation, result } = event;
    this.computations.push(result);
    console.log(`[${this.name}] Compute completed: ${operation.id} (${operation.getDuration()}ms)`);
    console.log(`  Result:`, result);
  }

  getOperationType() {
    return 'compute';
  }
}

class NetworkCompletionHandler extends CompletionHandler {
  constructor(name) {
    super();
    this.name = name;
    this.responses = [];
  }

  async handleCompletion(event) {
    const { operation, result } = event;
    this.responses.push(result);
    console.log(`[${this.name}] Network completed: ${operation.id} (${operation.getDuration()}ms)`);
    console.log(`  Response:`, result.response);
  }

  getOperationType() {
    return 'network';
  }
}

/**
 * File Operations Handler with Proactor
 */
class FileOperationsHandler {
  constructor(proactor) {
    this.proactor = proactor;
    this.pendingOperations = new Map();
  }

  async readFile(filename) {
    const operation = await this.proactor.initiateOperation('read', filename);
    return new Promise((resolve, reject) => {
      this.pendingOperations.set(operation.id, { resolve, reject });
    });
  }

  async writeFile(filename, content) {
    const operation = await this.proactor.initiateOperation('write', content);
    return new Promise((resolve, reject) => {
      this.pendingOperations.set(operation.id, { resolve, reject });
    });
  }

  handleFileCompletion(event) {
    const pending = this.pendingOperations.get(event.operation.id);
    if (pending) {
      if (event.operation.status === 'completed') {
        pending.resolve(event.result);
      } else {
        pending.reject(event.operation.error);
      }
      this.pendingOperations.delete(event.operation.id);
    }
  }
}

/**
 * Example Usage and Demonstrations
 */

async function demonstrateBasicProactor() {
  console.log('\n=== Basic Proactor Pattern Demo ===\n');

  const proactor = new Proactor(2);

  const readHandler = new ReadCompletionHandler('ReadHandler');
  const writeHandler = new WriteCompletionHandler('WriteHandler');

  proactor.registerHandler('read', readHandler);
  proactor.registerHandler('write', writeHandler);

  setTimeout(async () => {
    await proactor.initiateOperation('read', 'file1.txt');
    await proactor.initiateOperation('read', 'file2.txt');
    await proactor.initiateOperation('write', 'Hello World');
    await proactor.initiateOperation('write', 'Goodbye World');
  }, 100);

  setTimeout(() => proactor.stop(), 500);

  await proactor.run();
}

async function demonstratePriorityOperations() {
  console.log('\n=== Priority Operations Demo ===\n');

  const proactor = new Proactor(1);

  const readHandler = new ReadCompletionHandler('PriorityReadHandler');
  proactor.registerHandler('read', readHandler);

  setTimeout(async () => {
    await proactor.initiateOperation('read', 'low-priority.txt', 0);
    await proactor.initiateOperation('read', 'high-priority.txt', 10);
    await proactor.initiateOperation('read', 'medium-priority.txt', 5);
    await proactor.initiateOperation('read', 'urgent.txt', 20);
  }, 100);

  setTimeout(() => proactor.stop(), 800);

  await proactor.run();
}

async function demonstrateMultipleOperationTypes() {
  console.log('\n=== Multiple Operation Types Demo ===\n');

  const proactor = new Proactor(3);

  const readHandler = new ReadCompletionHandler('ReadHandler');
  const writeHandler = new WriteCompletionHandler('WriteHandler');
  const computeHandler = new ComputeCompletionHandler('ComputeHandler');
  const networkHandler = new NetworkCompletionHandler('NetworkHandler');

  proactor.registerHandler('read', readHandler);
  proactor.registerHandler('write', writeHandler);
  proactor.registerHandler('compute', computeHandler);
  proactor.registerHandler('network', networkHandler);

  setTimeout(async () => {
    await proactor.initiateOperation('read', 'data.json');
    await proactor.initiateOperation('compute', { value: 42, operation: 'double' });
    await proactor.initiateOperation('network', { url: 'https://api.example.com/data' });
    await proactor.initiateOperation('write', 'Processing complete');
  }, 100);

  setTimeout(() => proactor.stop(), 700);

  await proactor.run();
}

async function demonstrateBulkOperations() {
  console.log('\n=== Bulk Operations Demo ===\n');

  const proactor = new Proactor(4);

  const readHandler = new ReadCompletionHandler('BulkReadHandler');
  proactor.registerHandler('read', readHandler);

  setTimeout(async () => {
    const files = ['file1', 'file2', 'file3', 'file4', 'file5', 'file6', 'file7', 'file8'];

    console.log(`Initiating ${files.length} read operations...`);
    for (const file of files) {
      await proactor.initiateOperation('read', `${file}.txt`);
    }

    setInterval(() => {
      const stats = proactor.getStats();
      console.log(`Stats: ${stats.completed}/${stats.total} completed, ${stats.active} active, ${stats.queued} queued`);
    }, 150);
  }, 100);

  setTimeout(() => proactor.stop(), 1000);

  await proactor.run();
}

async function demonstrateAsyncWorkflow() {
  console.log('\n=== Async Workflow Demo ===\n');

  const proactor = new Proactor(2);

  const workflowHandler = new CompletionHandler();
  workflowHandler.handleCompletion = async (event) => {
    const { operation, result } = event;
    console.log(`Step ${operation.data.step}: ${operation.type} completed (${operation.getDuration()}ms)`);

    if (operation.data.nextStep) {
      console.log(`  Triggering next step: ${operation.data.nextStep}`);
      await proactor.initiateOperation(
        operation.data.nextStep,
        { step: operation.data.step + 1, nextStep: operation.data.nextNext }
      );
    }
  };

  proactor.registerHandler('read', workflowHandler);
  proactor.registerHandler('compute', workflowHandler);
  proactor.registerHandler('write', workflowHandler);

  setTimeout(async () => {
    console.log('Starting workflow: read -> compute -> write');
    await proactor.initiateOperation('read', {
      step: 1,
      nextStep: 'compute',
      nextNext: 'write'
    });
  }, 100);

  setTimeout(() => proactor.stop(), 1000);

  await proactor.run();
}

async function runAllDemos() {
  await demonstrateBasicProactor();
  await demonstratePriorityOperations();
  await demonstrateMultipleOperationTypes();
  await demonstrateBulkOperations();
  await demonstrateAsyncWorkflow();
}

if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  Proactor,
  AsyncOperation,
  CompletionEvent,
  CompletionHandler,
  AsyncOperationProcessor,
  CompletionDispatcher,
  ReadCompletionHandler,
  WriteCompletionHandler,
  ComputeCompletionHandler,
  NetworkCompletionHandler,
  FileOperationsHandler
};
