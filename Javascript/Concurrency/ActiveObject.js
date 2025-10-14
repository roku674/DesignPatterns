/**
 * Active Object Pattern Implementation in JavaScript
 *
 * The Active Object pattern decouples method execution from method invocation to
 * enhance concurrency and simplify synchronized access to objects that reside in
 * their own thread of control.
 *
 * Key Components:
 * - Proxy: Provides an interface for clients to invoke methods
 * - Activation Queue: Buffers pending method requests
 * - Scheduler: Determines which method request to execute next
 * - Servant: Implements the actual methods
 * - Method Request: Represents a deferred method call
 * - Future: Allows clients to obtain results asynchronously
 */

const EventEmitter = require('events');

/**
 * Future - Represents a value that will be available in the future
 */
class Future {
  constructor() {
    this.value = null;
    this.error = null;
    this.resolved = false;
    this.callbacks = [];
    this.errorCallbacks = [];
  }

  set(value) {
    if (this.resolved) {
      throw new Error('Future already resolved');
    }

    this.value = value;
    this.resolved = true;

    this.callbacks.forEach(callback => callback(value));
    this.callbacks = [];
  }

  setError(error) {
    if (this.resolved) {
      throw new Error('Future already resolved');
    }

    this.error = error;
    this.resolved = true;

    this.errorCallbacks.forEach(callback => callback(error));
    this.errorCallbacks = [];
  }

  async get(timeout = null) {
    if (this.resolved) {
      if (this.error) {
        throw this.error;
      }
      return this.value;
    }

    return new Promise((resolve, reject) => {
      this.callbacks.push(resolve);
      this.errorCallbacks.push(reject);

      if (timeout) {
        setTimeout(() => {
          reject(new Error('Future timeout'));
        }, timeout);
      }
    });
  }

  isDone() {
    return this.resolved;
  }

  onComplete(callback) {
    if (this.resolved && !this.error) {
      callback(this.value);
    } else {
      this.callbacks.push(callback);
    }
  }

  onError(callback) {
    if (this.resolved && this.error) {
      callback(this.error);
    } else {
      this.errorCallbacks.push(callback);
    }
  }
}

/**
 * Method Request - Encapsulates a deferred method invocation
 */
class MethodRequest {
  constructor(name, args, servant, future) {
    this.name = name;
    this.args = args;
    this.servant = servant;
    this.future = future;
    this.timestamp = Date.now();
    this.priority = 0;
  }

  async call() {
    try {
      const result = await this.servant[this.name](...this.args);
      if (this.future) {
        this.future.set(result);
      }
      return result;
    } catch (error) {
      if (this.future) {
        this.future.setError(error);
      }
      throw error;
    }
  }

  setPriority(priority) {
    this.priority = priority;
  }

  toString() {
    return `MethodRequest[${this.name}(${this.args.join(', ')})]`;
  }
}

/**
 * Activation Queue - Buffers pending method requests
 */
class ActivationQueue {
  constructor(maxSize = Infinity) {
    this.queue = [];
    this.maxSize = maxSize;
  }

  enqueue(methodRequest) {
    if (this.queue.length >= this.maxSize) {
      throw new Error('Activation queue is full');
    }

    this.queue.push(methodRequest);
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.queue.shift();
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  size() {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
  }

  peek() {
    return this.queue[0] || null;
  }
}

/**
 * Scheduler - Determines which method request to execute next
 */
class Scheduler {
  constructor(activationQueue) {
    this.activationQueue = activationQueue;
    this.running = false;
    this.executedCount = 0;
  }

  async run() {
    this.running = true;

    while (this.running || !this.activationQueue.isEmpty()) {
      const methodRequest = this.activationQueue.dequeue();

      if (methodRequest) {
        try {
          await methodRequest.call();
          this.executedCount++;
        } catch (error) {
          console.error(`Error executing ${methodRequest}:`, error);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  stop() {
    this.running = false;
  }

  getExecutedCount() {
    return this.executedCount;
  }
}

/**
 * Active Object - Main class that coordinates the pattern
 */
class ActiveObject {
  constructor(servant) {
    this.servant = servant;
    this.activationQueue = new ActivationQueue();
    this.scheduler = new Scheduler(this.activationQueue);
    this.started = false;
  }

  start() {
    if (this.started) {
      return;
    }

    this.started = true;
    this.scheduler.run();
  }

  stop() {
    this.scheduler.stop();
    this.started = false;
  }

  invoke(methodName, args = [], priority = 0) {
    const future = new Future();
    const methodRequest = new MethodRequest(methodName, args, this.servant, future);
    methodRequest.setPriority(priority);

    this.activationQueue.enqueue(methodRequest);

    return future;
  }

  invokeAndForget(methodName, args = [], priority = 0) {
    const methodRequest = new MethodRequest(methodName, args, this.servant, null);
    methodRequest.setPriority(priority);

    this.activationQueue.enqueue(methodRequest);
  }

  getQueueSize() {
    return this.activationQueue.size();
  }

  getExecutedCount() {
    return this.scheduler.getExecutedCount();
  }
}

/**
 * Servant Implementations
 */

class Calculator {
  constructor(name) {
    this.name = name;
    this.operations = 0;
  }

  async add(a, b) {
    this.operations++;
    await new Promise(resolve => setTimeout(resolve, 50));
    const result = a + b;
    console.log(`[${this.name}] add(${a}, ${b}) = ${result}`);
    return result;
  }

  async subtract(a, b) {
    this.operations++;
    await new Promise(resolve => setTimeout(resolve, 50));
    const result = a - b;
    console.log(`[${this.name}] subtract(${a}, ${b}) = ${result}`);
    return result;
  }

  async multiply(a, b) {
    this.operations++;
    await new Promise(resolve => setTimeout(resolve, 75));
    const result = a * b;
    console.log(`[${this.name}] multiply(${a}, ${b}) = ${result}`);
    return result;
  }

  async divide(a, b) {
    this.operations++;
    await new Promise(resolve => setTimeout(resolve, 75));
    if (b === 0) {
      throw new Error('Division by zero');
    }
    const result = a / b;
    console.log(`[${this.name}] divide(${a}, ${b}) = ${result}`);
    return result;
  }

  async getOperationCount() {
    return this.operations;
  }
}

class DataStore {
  constructor(name) {
    this.name = name;
    this.data = new Map();
    this.accessCount = 0;
  }

  async put(key, value) {
    this.accessCount++;
    await new Promise(resolve => setTimeout(resolve, 30));
    this.data.set(key, value);
    console.log(`[${this.name}] put(${key}, ${value})`);
    return true;
  }

  async get(key) {
    this.accessCount++;
    await new Promise(resolve => setTimeout(resolve, 20));
    const value = this.data.get(key);
    console.log(`[${this.name}] get(${key}) = ${value}`);
    return value;
  }

  async delete(key) {
    this.accessCount++;
    await new Promise(resolve => setTimeout(resolve, 25));
    const existed = this.data.delete(key);
    console.log(`[${this.name}] delete(${key}) = ${existed}`);
    return existed;
  }

  async size() {
    return this.data.size;
  }

  async clear() {
    this.data.clear();
    console.log(`[${this.name}] clear()`);
  }
}

class Logger {
  constructor(name) {
    this.name = name;
    this.logs = [];
  }

  async log(level, message) {
    await new Promise(resolve => setTimeout(resolve, 10));
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };
    this.logs.push(entry);
    console.log(`[${this.name}] ${level.toUpperCase()}: ${message}`);
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

  async getLogs() {
    return [...this.logs];
  }

  async getLogCount() {
    return this.logs.length;
  }
}

class TaskProcessor {
  constructor(name) {
    this.name = name;
    this.processedTasks = [];
  }

  async processTask(task) {
    console.log(`[${this.name}] Processing task: ${task.id}`);
    await new Promise(resolve => setTimeout(resolve, task.duration || 100));

    const result = {
      taskId: task.id,
      status: 'completed',
      processedAt: Date.now(),
      data: task.data ? task.data.toUpperCase() : null
    };

    this.processedTasks.push(result);
    console.log(`[${this.name}] Task ${task.id} completed`);

    return result;
  }

  async getProcessedCount() {
    return this.processedTasks.length;
  }

  async getResults() {
    return [...this.processedTasks];
  }
}

class BankAccount {
  constructor(name, initialBalance = 0) {
    this.name = name;
    this.balance = initialBalance;
    this.transactions = [];
  }

  async deposit(amount) {
    await new Promise(resolve => setTimeout(resolve, 40));

    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    this.balance += amount;
    this.transactions.push({ type: 'deposit', amount, timestamp: Date.now() });
    console.log(`[${this.name}] Deposited ${amount}, Balance: ${this.balance}`);

    return this.balance;
  }

  async withdraw(amount) {
    await new Promise(resolve => setTimeout(resolve, 40));

    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    if (amount > this.balance) {
      throw new Error('Insufficient funds');
    }

    this.balance -= amount;
    this.transactions.push({ type: 'withdraw', amount, timestamp: Date.now() });
    console.log(`[${this.name}] Withdrew ${amount}, Balance: ${this.balance}`);

    return this.balance;
  }

  async getBalance() {
    await new Promise(resolve => setTimeout(resolve, 10));
    return this.balance;
  }

  async getTransactionHistory() {
    return [...this.transactions];
  }
}

/**
 * Example Usage and Demonstrations
 */

async function demonstrateBasicActiveObject() {
  console.log('\n=== Basic Active Object Demo ===\n');

  const calculator = new Calculator('Calculator-1');
  const activeCalc = new ActiveObject(calculator);
  activeCalc.start();

  const future1 = activeCalc.invoke('add', [5, 3]);
  const future2 = activeCalc.invoke('multiply', [4, 7]);
  const future3 = activeCalc.invoke('subtract', [10, 2]);

  const result1 = await future1.get();
  const result2 = await future2.get();
  const result3 = await future3.get();

  console.log(`\nResults: ${result1}, ${result2}, ${result3}`);

  activeCalc.stop();
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function demonstrateDataStore() {
  console.log('\n=== Data Store Active Object Demo ===\n');

  const store = new DataStore('DataStore-1');
  const activeStore = new ActiveObject(store);
  activeStore.start();

  activeStore.invoke('put', ['user:1', { name: 'Alice', age: 30 }]);
  activeStore.invoke('put', ['user:2', { name: 'Bob', age: 25 }]);
  activeStore.invoke('put', ['user:3', { name: 'Charlie', age: 35 }]);

  await new Promise(resolve => setTimeout(resolve, 200));

  const user1 = await activeStore.invoke('get', ['user:1']).get();
  const user2 = await activeStore.invoke('get', ['user:2']).get();

  console.log(`\nRetrieved users:`, user1, user2);

  const size = await activeStore.invoke('size', []).get();
  console.log(`Store size: ${size}`);

  activeStore.stop();
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function demonstratePriorityExecution() {
  console.log('\n=== Priority Execution Demo ===\n');

  const calculator = new Calculator('PriorityCalc');
  const activeCalc = new ActiveObject(calculator);
  activeCalc.start();

  activeCalc.invoke('add', [1, 1], 0);
  activeCalc.invoke('add', [2, 2], 5);
  activeCalc.invoke('add', [3, 3], 10);
  activeCalc.invoke('add', [4, 4], 2);

  await new Promise(resolve => setTimeout(resolve, 300));

  activeCalc.stop();
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function demonstrateLogger() {
  console.log('\n=== Logger Active Object Demo ===\n');

  const logger = new Logger('AppLogger');
  const activeLogger = new ActiveObject(logger);
  activeLogger.start();

  activeLogger.invokeAndForget('info', ['Application started']);
  activeLogger.invokeAndForget('warn', ['Low memory warning']);
  activeLogger.invokeAndForget('error', ['Database connection failed']);
  activeLogger.invokeAndForget('info', ['Retrying connection...']);
  activeLogger.invokeAndForget('info', ['Connection established']);

  await new Promise(resolve => setTimeout(resolve, 200));

  const logCount = await activeLogger.invoke('getLogCount', []).get();
  console.log(`\nTotal logs: ${logCount}`);

  activeLogger.stop();
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function demonstrateTaskProcessor() {
  console.log('\n=== Task Processor Active Object Demo ===\n');

  const processor = new TaskProcessor('TaskProcessor-1');
  const activeProcessor = new ActiveObject(processor);
  activeProcessor.start();

  const tasks = [
    { id: 'task-1', data: 'process this', duration: 80 },
    { id: 'task-2', data: 'analyze that', duration: 60 },
    { id: 'task-3', data: 'compute value', duration: 100 },
    { id: 'task-4', data: 'transform data', duration: 70 }
  ];

  const futures = tasks.map(task =>
    activeProcessor.invoke('processTask', [task])
  );

  const results = await Promise.all(futures.map(f => f.get()));

  console.log(`\nAll tasks completed. Results:`);
  results.forEach(r => console.log(`  ${r.taskId}: ${r.status}`));

  activeProcessor.stop();
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function demonstrateBankAccount() {
  console.log('\n=== Bank Account Active Object Demo ===\n');

  const account = new BankAccount('Account-1', 1000);
  const activeAccount = new ActiveObject(account);
  activeAccount.start();

  const operations = [
    activeAccount.invoke('deposit', [500]),
    activeAccount.invoke('withdraw', [200]),
    activeAccount.invoke('deposit', [100]),
    activeAccount.invoke('withdraw', [300])
  ];

  try {
    const balances = await Promise.all(operations.map(f => f.get()));
    console.log(`\nBalance after each operation:`, balances);

    const finalBalance = await activeAccount.invoke('getBalance', []).get();
    console.log(`Final balance: ${finalBalance}`);
  } catch (error) {
    console.error('Error:', error.message);
  }

  activeAccount.stop();
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function demonstrateErrorHandling() {
  console.log('\n=== Error Handling Demo ===\n');

  const calculator = new Calculator('ErrorCalc');
  const activeCalc = new ActiveObject(calculator);
  activeCalc.start();

  const validFuture = activeCalc.invoke('add', [5, 3]);
  const errorFuture = activeCalc.invoke('divide', [10, 0]);

  try {
    const result1 = await validFuture.get();
    console.log(`Valid result: ${result1}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }

  try {
    const result2 = await errorFuture.get();
    console.log(`Error result: ${result2}`);
  } catch (error) {
    console.error(`Caught expected error: ${error.message}`);
  }

  activeCalc.stop();
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function runAllDemos() {
  await demonstrateBasicActiveObject();
  await demonstrateDataStore();
  await demonstratePriorityExecution();
  await demonstrateLogger();
  await demonstrateTaskProcessor();
  await demonstrateBankAccount();
  await demonstrateErrorHandling();
}

if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  ActiveObject,
  Future,
  MethodRequest,
  ActivationQueue,
  Scheduler,
  Calculator,
  DataStore,
  Logger,
  TaskProcessor,
  BankAccount
};
