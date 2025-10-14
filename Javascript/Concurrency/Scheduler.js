/**
 * Scheduler Pattern
 *
 * Purpose:
 * Controls the execution order and timing of asynchronous tasks. It manages
 * task queuing, prioritization, and concurrent execution limits.
 *
 * Use Cases:
 * - Rate limiting API calls
 * - Managing concurrent database connections
 * - Job queue processing
 * - Load balancing across workers
 *
 * @author Design Patterns Implementation
 * @date 2025
 */

/**
 * Priority levels for scheduled tasks
 */
const Priority = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  CRITICAL: 3
};

/**
 * Task representation in the scheduler
 */
class ScheduledTask {
  constructor(fn, priority = Priority.NORMAL, delay = 0, metadata = {}) {
    this.id = Math.random().toString(36).substring(7);
    this.fn = fn;
    this.priority = priority;
    this.delay = delay;
    this.metadata = metadata;
    this.createdAt = Date.now();
    this.startedAt = null;
    this.completedAt = null;
    this.status = 'pending';
    this.result = null;
    this.error = null;
  }

  async execute() {
    this.status = 'running';
    this.startedAt = Date.now();

    try {
      if (this.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }

      this.result = await this.fn();
      this.status = 'completed';
      this.completedAt = Date.now();
      return this.result;
    } catch (error) {
      this.error = error;
      this.status = 'failed';
      this.completedAt = Date.now();
      throw error;
    }
  }

  getExecutionTime() {
    if (!this.startedAt || !this.completedAt) {
      return null;
    }
    return this.completedAt - this.startedAt;
  }

  getWaitTime() {
    if (!this.startedAt) {
      return Date.now() - this.createdAt;
    }
    return this.startedAt - this.createdAt;
  }
}

/**
 * Main Scheduler class
 * Manages task execution with concurrency control and prioritization
 */
class Scheduler {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 5;
    this.defaultPriority = options.defaultPriority || Priority.NORMAL;
    this.retryAttempts = options.retryAttempts || 0;
    this.retryDelay = options.retryDelay || 1000;

    this.queue = [];
    this.running = new Map();
    this.completed = [];
    this.failed = [];
    this.paused = false;

    this.stats = {
      totalScheduled: 0,
      totalCompleted: 0,
      totalFailed: 0,
      totalRetries: 0
    };

    this.listeners = {
      taskStart: [],
      taskComplete: [],
      taskFail: [],
      queueEmpty: [],
      queueFull: []
    };
  }

  /**
   * Schedule a new task
   */
  schedule(fn, options = {}) {
    const task = new ScheduledTask(
      fn,
      options.priority || this.defaultPriority,
      options.delay || 0,
      options.metadata || {}
    );

    this.queue.push(task);
    this.stats.totalScheduled++;

    // Sort queue by priority (higher priority first)
    this.queue.sort((a, b) => b.priority - a.priority);

    this.emit('taskScheduled', task);
    this.processQueue();

    return task.id;
  }

  /**
   * Process the task queue
   */
  async processQueue() {
    if (this.paused) {
      return;
    }

    while (this.queue.length > 0 && this.running.size < this.maxConcurrent) {
      const task = this.queue.shift();

      if (!task) {
        break;
      }

      this.running.set(task.id, task);
      this.emit('taskStart', task);

      // Execute task asynchronously
      this.executeTask(task).catch(() => {
        // Error handling is done in executeTask
      });
    }

    if (this.queue.length === 0 && this.running.size === 0) {
      this.emit('queueEmpty');
    }
  }

  /**
   * Execute a single task with retry logic
   */
  async executeTask(task, attempt = 0) {
    try {
      await task.execute();

      this.running.delete(task.id);
      this.completed.push(task);
      this.stats.totalCompleted++;

      this.emit('taskComplete', task);
      this.processQueue();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        this.stats.totalRetries++;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));

        // Reset task status for retry
        task.status = 'pending';
        task.error = null;

        return this.executeTask(task, attempt + 1);
      } else {
        this.running.delete(task.id);
        this.failed.push(task);
        this.stats.totalFailed++;

        this.emit('taskFail', task);
        this.processQueue();
      }
    }
  }

  /**
   * Pause the scheduler
   */
  pause() {
    this.paused = true;
  }

  /**
   * Resume the scheduler
   */
  resume() {
    this.paused = false;
    this.processQueue();
  }

  /**
   * Cancel a scheduled task
   */
  cancel(taskId) {
    // Remove from queue
    const queueIndex = this.queue.findIndex(t => t.id === taskId);
    if (queueIndex !== -1) {
      const task = this.queue.splice(queueIndex, 1)[0];
      task.status = 'cancelled';
      return true;
    }

    // Cannot cancel running tasks
    return false;
  }

  /**
   * Get current scheduler status
   */
  getStatus() {
    return {
      queued: this.queue.length,
      running: this.running.size,
      completed: this.completed.length,
      failed: this.failed.length,
      paused: this.paused,
      stats: { ...this.stats }
    };
  }

  /**
   * Get task by ID
   */
  getTask(taskId) {
    return this.completed.find(t => t.id === taskId) ||
           this.failed.find(t => t.id === taskId) ||
           this.running.get(taskId) ||
           this.queue.find(t => t.id === taskId);
  }

  /**
   * Clear completed tasks
   */
  clearCompleted() {
    this.completed = [];
  }

  /**
   * Event listener system
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Wait for all tasks to complete
   */
  async waitForCompletion() {
    return new Promise((resolve) => {
      const check = () => {
        if (this.queue.length === 0 && this.running.size === 0) {
          resolve(this.getStatus());
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }
}

/**
 * Advanced scheduler with time-based scheduling
 */
class CronScheduler extends Scheduler {
  constructor(options = {}) {
    super(options);
    this.cronTasks = new Map();
    this.intervals = new Map();
  }

  /**
   * Schedule a recurring task
   */
  scheduleRecurring(fn, intervalMs, options = {}) {
    const taskId = Math.random().toString(36).substring(7);
    const cronTask = {
      id: taskId,
      fn,
      interval: intervalMs,
      lastRun: null,
      nextRun: Date.now() + intervalMs,
      options
    };

    this.cronTasks.set(taskId, cronTask);

    const intervalId = setInterval(() => {
      this.schedule(fn, options);
      cronTask.lastRun = Date.now();
      cronTask.nextRun = Date.now() + intervalMs;
    }, intervalMs);

    this.intervals.set(taskId, intervalId);

    return taskId;
  }

  /**
   * Cancel a recurring task
   */
  cancelRecurring(taskId) {
    const intervalId = this.intervals.get(taskId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(taskId);
      this.cronTasks.delete(taskId);
      return true;
    }
    return false;
  }

  /**
   * Get all recurring tasks
   */
  getRecurringTasks() {
    return Array.from(this.cronTasks.values());
  }
}

// ============================================================================
// COMPREHENSIVE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic Task Scheduling
 */
async function example1_BasicScheduling() {
  console.log('\n=== Example 1: Basic Task Scheduling ===\n');

  const scheduler = new Scheduler({ maxConcurrent: 3 });

  // Add event listeners
  scheduler.on('taskStart', (task) => {
    console.log(`Task ${task.id} started`);
  });

  scheduler.on('taskComplete', (task) => {
    console.log(`Task ${task.id} completed in ${task.getExecutionTime()}ms`);
  });

  // Schedule multiple tasks
  const tasks = [];
  for (let i = 0; i < 10; i++) {
    const taskId = scheduler.schedule(async () => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      return `Task ${i} result`;
    });
    tasks.push(taskId);
  }

  await scheduler.waitForCompletion();

  console.log('\nFinal Status:', scheduler.getStatus());
}

/**
 * Example 2: Priority-based Scheduling
 */
async function example2_PriorityScheduling() {
  console.log('\n=== Example 2: Priority-based Scheduling ===\n');

  const scheduler = new Scheduler({ maxConcurrent: 2 });

  // Schedule tasks with different priorities
  scheduler.schedule(
    async () => {
      console.log('Low priority task executing');
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    { priority: Priority.LOW }
  );

  scheduler.schedule(
    async () => {
      console.log('Critical priority task executing');
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    { priority: Priority.CRITICAL }
  );

  scheduler.schedule(
    async () => {
      console.log('Normal priority task executing');
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    { priority: Priority.NORMAL }
  );

  scheduler.schedule(
    async () => {
      console.log('High priority task executing');
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    { priority: Priority.HIGH }
  );

  await scheduler.waitForCompletion();
}

/**
 * Example 3: Rate-Limited API Calls
 */
async function example3_RateLimitedAPI() {
  console.log('\n=== Example 3: Rate-Limited API Calls ===\n');

  const scheduler = new Scheduler({ maxConcurrent: 2 });

  // Simulate API endpoints
  const mockAPI = {
    async fetchUser(id) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id, name: `User ${id}`, email: `user${id}@example.com` };
    },
    async fetchPosts(userId) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return [
        { id: 1, userId, title: 'Post 1' },
        { id: 2, userId, title: 'Post 2' }
      ];
    }
  };

  // Schedule API calls
  const userIds = [1, 2, 3, 4, 5];
  const results = [];

  for (const userId of userIds) {
    scheduler.schedule(async () => {
      const user = await mockAPI.fetchUser(userId);
      console.log(`Fetched user: ${user.name}`);
      return user;
    }, { metadata: { type: 'fetchUser', userId } });

    scheduler.schedule(async () => {
      const posts = await mockAPI.fetchPosts(userId);
      console.log(`Fetched ${posts.length} posts for user ${userId}`);
      return posts;
    }, { metadata: { type: 'fetchPosts', userId } });
  }

  await scheduler.waitForCompletion();
  console.log('\nAll API calls completed');
}

/**
 * Example 4: Retry Logic
 */
async function example4_RetryLogic() {
  console.log('\n=== Example 4: Retry Logic ===\n');

  const scheduler = new Scheduler({
    maxConcurrent: 2,
    retryAttempts: 3,
    retryDelay: 500
  });

  let attempts = 0;

  scheduler.schedule(async () => {
    attempts++;
    console.log(`Attempt ${attempts}`);

    if (attempts < 3) {
      throw new Error('Simulated failure');
    }

    return 'Success!';
  });

  await scheduler.waitForCompletion();

  const status = scheduler.getStatus();
  console.log(`\nTotal retries: ${status.stats.totalRetries}`);
}

/**
 * Example 5: Recurring Tasks with CronScheduler
 */
async function example5_RecurringTasks() {
  console.log('\n=== Example 5: Recurring Tasks ===\n');

  const scheduler = new CronScheduler({ maxConcurrent: 3 });

  let counter = 0;

  // Schedule a task to run every second
  const recurringTaskId = scheduler.scheduleRecurring(
    async () => {
      counter++;
      console.log(`Recurring task executed: ${counter}`);
      return counter;
    },
    1000,
    { priority: Priority.HIGH }
  );

  // Let it run for 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Cancel the recurring task
  scheduler.cancelRecurring(recurringTaskId);

  console.log(`\nRecurring task cancelled after ${counter} executions`);
}

/**
 * Main execution
 */
async function demonstrateScheduler() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Scheduler Pattern - Comprehensive Examples         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await example1_BasicScheduling();
  await example2_PriorityScheduling();
  await example3_RateLimitedAPI();
  await example4_RetryLogic();
  await example5_RecurringTasks();

  console.log('\n✓ All Scheduler pattern examples completed successfully!');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Scheduler,
    CronScheduler,
    ScheduledTask,
    Priority,
    demonstrateScheduler
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  demonstrateScheduler().catch(console.error);
}
