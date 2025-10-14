/**
 * Thread Pool Pattern Implementation in JavaScript
 *
 * The Thread Pool pattern manages a pool of worker threads to execute tasks
 * concurrently, reusing threads to avoid the overhead of creating and destroying
 * threads for each task. It provides an efficient way to handle concurrent
 * operations with controlled resource usage.
 *
 * Key Components:
 * - Thread Pool: Manages a collection of worker threads
 * - Worker Thread: Executes tasks from the work queue
 * - Work Queue: Stores pending tasks waiting for execution
 * - Task: Represents a unit of work to be executed
 * - Future/Promise: Provides result of asynchronous task execution
 */

const EventEmitter = require('events');
const { Worker } = require('worker_threads');

/**
 * Task - Represents a unit of work
 */
class Task {
  constructor(id, fn, args = [], priority = 0) {
    this.id = id;
    this.fn = fn;
    this.args = args;
    this.priority = priority;
    this.createdAt = Date.now();
    this.startedAt = null;
    this.completedAt = null;
    this.status = 'pending';
    this.result = null;
    this.error = null;
    this.assignedWorker = null;
  }

  async execute() {
    this.startedAt = Date.now();
    this.status = 'executing';

    try {
      this.result = await this.fn(...this.args);
      this.completedAt = Date.now();
      this.status = 'completed';
      return this.result;
    } catch (error) {
      this.error = error;
      this.completedAt = Date.now();
      this.status = 'failed';
      throw error;
    }
  }

  getWaitTime() {
    const endTime = this.startedAt || Date.now();
    return endTime - this.createdAt;
  }

  getExecutionTime() {
    return this.completedAt ? this.completedAt - this.startedAt : null;
  }

  toString() {
    return `Task[${this.id}:${this.status}]`;
  }
}

/**
 * Work Queue - Manages pending tasks
 */
class WorkQueue {
  constructor(maxSize = Infinity) {
    this.queue = [];
    this.maxSize = maxSize;
    this.waiters = [];
  }

  enqueue(task) {
    if (this.queue.length >= this.maxSize) {
      throw new Error('Work queue is full');
    }

    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority);

    if (this.waiters.length > 0) {
      const resolve = this.waiters.shift();
      resolve();
    }
  }

  async dequeue(timeout = null) {
    while (this.queue.length === 0) {
      if (timeout !== null) {
        await Promise.race([
          new Promise(resolve => this.waiters.push(resolve)),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Dequeue timeout')), timeout)
          )
        ]);
      } else {
        await new Promise(resolve => this.waiters.push(resolve));
      }
    }

    return this.queue.shift();
  }

  size() {
    return this.queue.length;
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  clear() {
    this.queue = [];
  }

  peek() {
    return this.queue[0];
  }
}

/**
 * Worker Thread - Executes tasks from the work queue
 */
class PoolWorker extends EventEmitter {
  constructor(id, workQueue) {
    super();
    this.id = id;
    this.workQueue = workQueue;
    this.active = false;
    this.busy = false;
    this.tasksExecuted = 0;
    this.currentTask = null;
  }

  async run() {
    this.active = true;

    while (this.active) {
      try {
        const task = await this.workQueue.dequeue(100);

        this.busy = true;
        this.currentTask = task;
        task.assignedWorker = this.id;

        console.log(`[Worker-${this.id}] Executing ${task}`);

        await task.execute();

        this.tasksExecuted++;
        this.emit('task-completed', task);

        console.log(`[Worker-${this.id}] Completed ${task} (${task.getExecutionTime()}ms)`);
      } catch (error) {
        if (error.message !== 'Dequeue timeout') {
          console.error(`[Worker-${this.id}] Error:`, error);
          if (this.currentTask) {
            this.emit('task-failed', this.currentTask, error);
          }
        }
      } finally {
        this.busy = false;
        this.currentTask = null;
      }
    }
  }

  stop() {
    this.active = false;
  }

  isBusy() {
    return this.busy;
  }

  isActive() {
    return this.active;
  }

  getStats() {
    return {
      id: this.id,
      active: this.active,
      busy: this.busy,
      tasksExecuted: this.tasksExecuted,
      currentTask: this.currentTask ? this.currentTask.id : null
    };
  }
}

/**
 * Thread Pool - Manages worker threads and task distribution
 */
class ThreadPool extends EventEmitter {
  constructor(name, poolSize = 4, queueSize = Infinity) {
    super();
    this.name = name;
    this.poolSize = poolSize;
    this.workQueue = new WorkQueue(queueSize);
    this.workers = [];
    this.running = false;
    this.taskIdCounter = 0;
    this.submittedTasks = 0;
    this.completedTasks = 0;
    this.failedTasks = 0;
    this.taskPromises = new Map();
  }

  async start() {
    if (this.running) {
      throw new Error('Thread pool already running');
    }

    this.running = true;

    for (let i = 0; i < this.poolSize; i++) {
      const worker = new PoolWorker(i, this.workQueue);

      worker.on('task-completed', (task) => {
        this.completedTasks++;
        this.emit('task-completed', task);

        const promise = this.taskPromises.get(task.id);
        if (promise) {
          promise.resolve(task.result);
          this.taskPromises.delete(task.id);
        }
      });

      worker.on('task-failed', (task, error) => {
        this.failedTasks++;
        this.emit('task-failed', task, error);

        const promise = this.taskPromises.get(task.id);
        if (promise) {
          promise.reject(error);
          this.taskPromises.delete(task.id);
        }
      });

      this.workers.push(worker);
      worker.run();
    }

    console.log(`[${this.name}] Thread pool started with ${this.poolSize} workers`);
  }

  async stop(graceful = true) {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (graceful) {
      while (!this.workQueue.isEmpty()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    for (const worker of this.workers) {
      worker.stop();
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    console.log(`[${this.name}] Thread pool stopped`);
  }

  async submit(fn, args = [], priority = 0) {
    if (!this.running) {
      throw new Error('Thread pool not running');
    }

    const task = new Task(`task-${++this.taskIdCounter}`, fn, args, priority);
    this.submittedTasks++;

    const promise = new Promise((resolve, reject) => {
      this.taskPromises.set(task.id, { resolve, reject });
    });

    this.workQueue.enqueue(task);
    this.emit('task-submitted', task);

    return promise;
  }

  submitAndForget(fn, args = [], priority = 0) {
    const task = new Task(`task-${++this.taskIdCounter}`, fn, args, priority);
    this.submittedTasks++;
    this.workQueue.enqueue(task);
    this.emit('task-submitted', task);
  }

  async submitBatch(tasks) {
    const promises = tasks.map(({ fn, args, priority }) =>
      this.submit(fn, args, priority)
    );
    return await Promise.all(promises);
  }

  getAvailableWorkers() {
    return this.workers.filter(w => w.isActive() && !w.isBusy()).length;
  }

  getBusyWorkers() {
    return this.workers.filter(w => w.isBusy()).length;
  }

  getQueueSize() {
    return this.workQueue.size();
  }

  getStats() {
    return {
      name: this.name,
      poolSize: this.poolSize,
      running: this.running,
      submitted: this.submittedTasks,
      completed: this.completedTasks,
      failed: this.failedTasks,
      queued: this.workQueue.size(),
      availableWorkers: this.getAvailableWorkers(),
      busyWorkers: this.getBusyWorkers(),
      workers: this.workers.map(w => w.getStats())
    };
  }

  async resize(newSize) {
    if (newSize < this.poolSize) {
      const removeCount = this.poolSize - newSize;
      for (let i = 0; i < removeCount; i++) {
        const worker = this.workers.pop();
        worker.stop();
      }
    } else if (newSize > this.poolSize) {
      const addCount = newSize - this.poolSize;
      for (let i = 0; i < addCount; i++) {
        const worker = new PoolWorker(this.workers.length, this.workQueue);
        this.workers.push(worker);
        worker.run();
      }
    }

    this.poolSize = newSize;
    console.log(`[${this.name}] Pool resized to ${newSize} workers`);
  }
}

/**
 * Scheduled Thread Pool - Supports scheduled and periodic task execution
 */
class ScheduledThreadPool extends ThreadPool {
  constructor(name, poolSize = 4) {
    super(name, poolSize);
    this.scheduledTasks = new Map();
    this.recurringTasks = new Map();
  }

  scheduleOnce(fn, args, delay) {
    const timeoutId = setTimeout(async () => {
      await this.submit(fn, args);
      this.scheduledTasks.delete(timeoutId);
    }, delay);

    this.scheduledTasks.set(timeoutId, { fn, args, delay });
    return timeoutId;
  }

  scheduleRecurring(fn, args, interval) {
    const intervalId = setInterval(async () => {
      if (this.running) {
        await this.submit(fn, args);
      }
    }, interval);

    this.recurringTasks.set(intervalId, { fn, args, interval });
    return intervalId;
  }

  cancelScheduled(taskId) {
    if (this.scheduledTasks.has(taskId)) {
      clearTimeout(taskId);
      this.scheduledTasks.delete(taskId);
    }
  }

  cancelRecurring(taskId) {
    if (this.recurringTasks.has(taskId)) {
      clearInterval(taskId);
      this.recurringTasks.delete(taskId);
    }
  }

  async stop(graceful = true) {
    for (const taskId of this.scheduledTasks.keys()) {
      clearTimeout(taskId);
    }

    for (const taskId of this.recurringTasks.keys()) {
      clearInterval(taskId);
    }

    this.scheduledTasks.clear();
    this.recurringTasks.clear();

    await super.stop(graceful);
  }
}

/**
 * Example Applications and Demonstrations
 */

async function demonstrateBasicThreadPool() {
  console.log('\n=== Basic Thread Pool Demo ===\n');

  const pool = new ThreadPool('BasicPool', 3);
  await pool.start();

  const computeTask = async (x, y) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return x + y;
  };

  const results = await Promise.all([
    pool.submit(computeTask, [5, 3]),
    pool.submit(computeTask, [10, 7]),
    pool.submit(computeTask, [2, 8]),
    pool.submit(computeTask, [15, 1])
  ]);

  console.log('\nResults:', results);
  console.log('Stats:', pool.getStats());

  await pool.stop();
}

async function demonstratePriorityTasks() {
  console.log('\n=== Priority Tasks Demo ===\n');

  const pool = new ThreadPool('PriorityPool', 2);
  await pool.start();

  const task = async (name, duration) => {
    console.log(`  Task ${name} started`);
    await new Promise(resolve => setTimeout(resolve, duration));
    console.log(`  Task ${name} completed`);
    return `Result: ${name}`;
  };

  pool.submit(task, ['Low-1', 200], 0);
  pool.submit(task, ['High-1', 150], 10);
  pool.submit(task, ['Low-2', 100], 0);
  pool.submit(task, ['High-2', 180], 10);
  pool.submit(task, ['Medium-1', 120], 5);

  await new Promise(resolve => setTimeout(resolve, 1500));

  await pool.stop();
}

async function demonstrateBatchProcessing() {
  console.log('\n=== Batch Processing Demo ===\n');

  const pool = new ThreadPool('BatchPool', 4);
  await pool.start();

  const processItem = async (itemId) => {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    return { itemId, processed: true, timestamp: Date.now() };
  };

  const batch = Array.from({ length: 10 }, (_, i) => ({
    fn: processItem,
    args: [`item-${i}`],
    priority: 0
  }));

  console.log('Processing batch of 10 items...');

  const results = await pool.submitBatch(batch);

  console.log(`\nProcessed ${results.length} items`);
  console.log('Stats:', pool.getStats());

  await pool.stop();
}

async function demonstrateDynamicResize() {
  console.log('\n=== Dynamic Pool Resize Demo ===\n');

  const pool = new ThreadPool('DynamicPool', 2);
  await pool.start();

  const task = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return `Task ${id} done`;
  };

  console.log('Initial pool size: 2');

  for (let i = 0; i < 4; i++) {
    pool.submit(task, [i]);
  }

  await new Promise(resolve => setTimeout(resolve, 300));

  console.log('\nResizing pool to 4 workers...');
  await pool.resize(4);

  for (let i = 4; i < 8; i++) {
    pool.submit(task, [i]);
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('\nFinal stats:', pool.getStats());

  await pool.stop();
}

async function demonstrateScheduledPool() {
  console.log('\n=== Scheduled Thread Pool Demo ===\n');

  const pool = new ScheduledThreadPool('ScheduledPool', 2);
  await pool.start();

  const task = async (name) => {
    console.log(`  Scheduled task: ${name} executed at ${new Date().toISOString()}`);
    return name;
  };

  console.log('Scheduling tasks...');

  pool.scheduleOnce(task, ['One-time task 1'], 200);
  pool.scheduleOnce(task, ['One-time task 2'], 400);

  const recurringId = pool.scheduleRecurring(task, ['Recurring task'], 300);

  await new Promise(resolve => setTimeout(resolve, 1500));

  pool.cancelRecurring(recurringId);

  await new Promise(resolve => setTimeout(resolve, 500));

  await pool.stop();
}

async function demonstrateErrorHandling() {
  console.log('\n=== Error Handling Demo ===\n');

  const pool = new ThreadPool('ErrorPool', 2);
  await pool.start();

  const faultyTask = async (shouldFail) => {
    await new Promise(resolve => setTimeout(resolve, 100));

    if (shouldFail) {
      throw new Error('Task intentionally failed');
    }

    return 'Success';
  };

  pool.on('task-failed', (task, error) => {
    console.log(`  Task ${task.id} failed: ${error.message}`);
  });

  try {
    await pool.submit(faultyTask, [false]);
    console.log('Task 1: Success');
  } catch (error) {
    console.log('Task 1: Failed');
  }

  try {
    await pool.submit(faultyTask, [true]);
    console.log('Task 2: Success');
  } catch (error) {
    console.log('Task 2: Failed (expected)');
  }

  try {
    await pool.submit(faultyTask, [false]);
    console.log('Task 3: Success');
  } catch (error) {
    console.log('Task 3: Failed');
  }

  await pool.stop();
}

async function demonstrateHighLoad() {
  console.log('\n=== High Load Demo ===\n');

  const pool = new ThreadPool('HighLoadPool', 5);
  await pool.start();

  const cpuIntensiveTask = async (iterations) => {
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += Math.sqrt(i);
    }
    await new Promise(resolve => setTimeout(resolve, 50));
    return result;
  };

  console.log('Submitting 20 CPU-intensive tasks...');

  const startTime = Date.now();

  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(pool.submit(cpuIntensiveTask, [10000]));
  }

  await Promise.all(promises);

  const duration = Date.now() - startTime;

  console.log(`\nCompleted 20 tasks in ${duration}ms`);
  console.log('Stats:', JSON.stringify(pool.getStats(), null, 2));

  await pool.stop();
}

async function demonstrateRealWorldScenario() {
  console.log('\n=== Real World Scenario: Image Processing Service ===\n');

  const pool = new ThreadPool('ImageProcessor', 3);
  await pool.start();

  const processImage = async (imageId, operations) => {
    console.log(`  Processing image ${imageId}...`);

    for (const operation of operations) {
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log(`    Applied ${operation} to image ${imageId}`);
    }

    return {
      imageId,
      operations: operations.length,
      status: 'processed',
      size: Math.floor(Math.random() * 1000) + 100
    };
  };

  const images = [
    { id: 'img-1', ops: ['resize', 'compress'] },
    { id: 'img-2', ops: ['resize', 'watermark', 'compress'] },
    { id: 'img-3', ops: ['crop', 'resize'] },
    { id: 'img-4', ops: ['resize', 'filter', 'compress'] },
    { id: 'img-5', ops: ['resize'] }
  ];

  const results = await Promise.all(
    images.map(img => pool.submit(processImage, [img.id, img.ops], img.ops.length))
  );

  console.log('\nProcessing results:');
  results.forEach(r => console.log(`  ${r.imageId}: ${r.operations} operations, ${r.size}KB`));

  console.log('\nFinal stats:', pool.getStats());

  await pool.stop();
}

async function runAllDemos() {
  await demonstrateBasicThreadPool();
  await demonstratePriorityTasks();
  await demonstrateBatchProcessing();
  await demonstrateDynamicResize();
  await demonstrateScheduledPool();
  await demonstrateErrorHandling();
  await demonstrateHighLoad();
  await demonstrateRealWorldScenario();
}

if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  ThreadPool,
  ScheduledThreadPool,
  PoolWorker,
  WorkQueue,
  Task
};
