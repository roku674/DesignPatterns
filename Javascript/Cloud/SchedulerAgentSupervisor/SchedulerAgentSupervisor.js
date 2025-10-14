/**
 * Scheduler Agent Supervisor Pattern
 *
 * Coordinates distributed actions across a collection of services and resources.
 * The pattern consists of three components:
 * - Scheduler: Initiates actions and tracks state
 * - Agent: Performs distributed work
 * - Supervisor: Monitors and recovers from failures
 *
 * Key Concepts:
 * - Distributed Task Coordination: Manage complex workflows across systems
 * - Fault Tolerance: Recover from failures automatically
 * - State Management: Track progress of distributed operations
 * - Retry Logic: Handle transient failures gracefully
 * - Compensation: Roll back on permanent failures
 */

/**
 * Task Status
 */
const TaskStatus = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  COMPENSATING: 'compensating',
  COMPENSATED: 'compensated'
};

/**
 * Agent
 * Performs distributed work
 */
class Agent {
  constructor(name, executor, config = {}) {
    if (!name) {
      throw new Error('Agent name is required');
    }
    if (typeof executor !== 'function') {
      throw new Error('Executor must be a function');
    }

    this.name = name;
    this.executor = executor;
    this.timeout = config.timeout || 30000;
    this.retryCount = config.retryCount || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.status = 'idle';
    this.currentTask = null;
  }

  /**
   * Execute a task
   */
  async execute(task, context = {}) {
    if (!task) {
      throw new Error('Task is required');
    }

    this.status = 'busy';
    this.currentTask = task;
    let attempts = 0;
    let lastError = null;

    while (attempts < this.retryCount) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Task timeout')), this.timeout);
        });

        const result = await Promise.race([
          this.executor(task, context),
          timeoutPromise
        ]);

        this.status = 'idle';
        this.currentTask = null;

        return {
          success: true,
          agent: this.name,
          task: task.id,
          result,
          attempts: attempts + 1
        };
      } catch (error) {
        lastError = error;
        attempts++;

        if (attempts < this.retryCount) {
          await this.delay(this.retryDelay * attempts);
        }
      }
    }

    this.status = 'idle';
    this.currentTask = null;

    throw new Error(
      `Agent ${this.name} failed after ${attempts} attempts: ${lastError.message}`
    );
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      status: this.status,
      currentTask: this.currentTask ? this.currentTask.id : null
    };
  }
}

/**
 * Task
 * Represents a unit of work
 */
class Task {
  constructor(id, data, config = {}) {
    if (!id) {
      throw new Error('Task ID is required');
    }

    this.id = id;
    this.data = data;
    this.status = TaskStatus.PENDING;
    this.result = null;
    this.error = null;
    this.attempts = 0;
    this.maxAttempts = config.maxAttempts || 3;
    this.createdAt = Date.now();
    this.startedAt = null;
    this.completedAt = null;
    this.compensation = config.compensation || null;
  }

  /**
   * Mark task as scheduled
   */
  schedule() {
    this.status = TaskStatus.SCHEDULED;
  }

  /**
   * Mark task as started
   */
  start() {
    this.status = TaskStatus.IN_PROGRESS;
    this.startedAt = Date.now();
    this.attempts++;
  }

  /**
   * Mark task as completed
   */
  complete(result) {
    this.status = TaskStatus.COMPLETED;
    this.result = result;
    this.completedAt = Date.now();
  }

  /**
   * Mark task as failed
   */
  fail(error) {
    this.status = TaskStatus.FAILED;
    this.error = error.message || error;
    this.completedAt = Date.now();
  }

  /**
   * Check if task can be retried
   */
  canRetry() {
    return this.attempts < this.maxAttempts && this.status === TaskStatus.FAILED;
  }

  /**
   * Get task status
   */
  getStatus() {
    return {
      id: this.id,
      status: this.status,
      attempts: this.attempts,
      maxAttempts: this.maxAttempts,
      duration: this.completedAt ? this.completedAt - this.startedAt : null,
      error: this.error
    };
  }
}

/**
 * Scheduler
 * Coordinates task execution
 */
class Scheduler {
  constructor(config = {}) {
    this.tasks = new Map();
    this.agents = new Map();
    this.queue = [];
    this.pollInterval = config.pollInterval || 1000;
    this.running = false;
    this.pollTimer = null;
  }

  /**
   * Register an agent
   */
  registerAgent(agent) {
    if (!(agent instanceof Agent)) {
      throw new Error('Agent must be an instance of Agent');
    }

    this.agents.set(agent.name, agent);
  }

  /**
   * Schedule a task
   */
  scheduleTask(task) {
    if (!(task instanceof Task)) {
      throw new Error('Task must be an instance of Task');
    }

    this.tasks.set(task.id, task);
    task.schedule();
    this.queue.push(task.id);
  }

  /**
   * Start scheduler
   */
  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.poll();
  }

  /**
   * Stop scheduler
   */
  stop() {
    this.running = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Poll for tasks to execute
   */
  async poll() {
    if (!this.running) {
      return;
    }

    try {
      await this.processTasks();
    } catch (error) {
      console.error('Error processing tasks:', error);
    }

    this.pollTimer = setTimeout(() => this.poll(), this.pollInterval);
  }

  /**
   * Process pending tasks
   */
  async processTasks() {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'idle');

    while (this.queue.length > 0 && availableAgents.length > 0) {
      const taskId = this.queue.shift();
      const task = this.tasks.get(taskId);

      if (!task || task.status !== TaskStatus.SCHEDULED) {
        continue;
      }

      const agent = availableAgents.shift();
      this.executeTask(task, agent);
    }
  }

  /**
   * Execute a task with an agent
   */
  async executeTask(task, agent) {
    task.start();

    try {
      const result = await agent.execute(task);
      task.complete(result);
    } catch (error) {
      task.fail(error);

      if (task.canRetry()) {
        task.schedule();
        this.queue.push(task.id);
      }
    }
  }

  /**
   * Get all tasks
   */
  getAllTasks() {
    return Array.from(this.tasks.values()).map(t => t.getStatus());
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    return task.getStatus();
  }

  /**
   * Get scheduler statistics
   */
  getStatistics() {
    const tasks = Array.from(this.tasks.values());
    return {
      totalTasks: tasks.length,
      pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
      scheduled: tasks.filter(t => t.status === TaskStatus.SCHEDULED).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      failed: tasks.filter(t => t.status === TaskStatus.FAILED).length,
      queueLength: this.queue.length,
      totalAgents: this.agents.size,
      idleAgents: Array.from(this.agents.values()).filter(a => a.status === 'idle').length
    };
  }
}

/**
 * Supervisor
 * Monitors and recovers from failures
 */
class Supervisor {
  constructor(scheduler, config = {}) {
    if (!scheduler) {
      throw new Error('Scheduler is required');
    }

    this.scheduler = scheduler;
    this.monitorInterval = config.monitorInterval || 5000;
    this.taskTimeout = config.taskTimeout || 60000;
    this.running = false;
    this.monitorTimer = null;
    this.alerts = [];
    this.maxAlerts = config.maxAlerts || 100;
  }

  /**
   * Start supervisor
   */
  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.monitor();
  }

  /**
   * Stop supervisor
   */
  stop() {
    this.running = false;
    if (this.monitorTimer) {
      clearTimeout(this.monitorTimer);
      this.monitorTimer = null;
    }
  }

  /**
   * Monitor tasks
   */
  async monitor() {
    if (!this.running) {
      return;
    }

    try {
      await this.checkStuckTasks();
      await this.checkFailedTasks();
    } catch (error) {
      console.error('Supervisor monitor error:', error);
    }

    this.monitorTimer = setTimeout(() => this.monitor(), this.monitorInterval);
  }

  /**
   * Check for stuck tasks
   */
  async checkStuckTasks() {
    const tasks = this.scheduler.getAllTasks();
    const now = Date.now();

    for (const taskStatus of tasks) {
      if (taskStatus.status === TaskStatus.IN_PROGRESS) {
        const task = this.scheduler.tasks.get(taskStatus.id);

        if (task && task.startedAt && (now - task.startedAt) > this.taskTimeout) {
          this.addAlert({
            type: 'stuck_task',
            taskId: task.id,
            duration: now - task.startedAt,
            timestamp: now
          });

          task.fail(new Error('Task timeout by supervisor'));

          if (task.canRetry()) {
            task.schedule();
            this.scheduler.queue.push(task.id);
          }
        }
      }
    }
  }

  /**
   * Check failed tasks
   */
  async checkFailedTasks() {
    const tasks = this.scheduler.getAllTasks();

    for (const taskStatus of tasks) {
      if (taskStatus.status === TaskStatus.FAILED) {
        const task = this.scheduler.tasks.get(taskStatus.id);

        if (task && !task.canRetry()) {
          this.addAlert({
            type: 'task_failed',
            taskId: task.id,
            error: task.error,
            attempts: task.attempts,
            timestamp: Date.now()
          });

          if (task.compensation) {
            await this.compensateTask(task);
          }
        }
      }
    }
  }

  /**
   * Compensate a failed task
   */
  async compensateTask(task) {
    if (!task.compensation) {
      return;
    }

    task.status = TaskStatus.COMPENSATING;

    try {
      await task.compensation(task);
      task.status = TaskStatus.COMPENSATED;

      this.addAlert({
        type: 'task_compensated',
        taskId: task.id,
        timestamp: Date.now()
      });
    } catch (error) {
      this.addAlert({
        type: 'compensation_failed',
        taskId: task.id,
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Add alert
   */
  addAlert(alert) {
    this.alerts.push(alert);

    if (this.alerts.length > this.maxAlerts) {
      this.alerts.shift();
    }
  }

  /**
   * Get alerts
   */
  getAlerts(limit = 10) {
    return this.alerts.slice(-limit);
  }

  /**
   * Get supervisor statistics
   */
  getStatistics() {
    return {
      running: this.running,
      totalAlerts: this.alerts.length,
      alertsByType: this.getAlertsByType()
    };
  }

  /**
   * Get alerts grouped by type
   */
  getAlertsByType() {
    const byType = {};

    for (const alert of this.alerts) {
      if (!byType[alert.type]) {
        byType[alert.type] = 0;
      }
      byType[alert.type]++;
    }

    return byType;
  }
}

/**
 * Main Scheduler Agent Supervisor class
 */
class SchedulerAgentSupervisor {
  constructor(config = {}) {
    this.scheduler = new Scheduler(config.scheduler || {});
    this.supervisor = new Supervisor(this.scheduler, config.supervisor || {});
  }

  /**
   * Register an agent
   */
  registerAgent(name, executor, config) {
    const agent = new Agent(name, executor, config);
    this.scheduler.registerAgent(agent);
    return agent;
  }

  /**
   * Schedule a task
   */
  scheduleTask(id, data, config) {
    const task = new Task(id, data, config);
    this.scheduler.scheduleTask(task);
    return task;
  }

  /**
   * Start the system
   */
  start() {
    this.scheduler.start();
    this.supervisor.start();
  }

  /**
   * Stop the system
   */
  stop() {
    this.scheduler.stop();
    this.supervisor.stop();
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      scheduler: this.scheduler.getStatistics(),
      supervisor: this.supervisor.getStatistics(),
      alerts: this.supervisor.getAlerts()
    };
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId) {
    return this.scheduler.getTaskStatus(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks() {
    return this.scheduler.getAllTasks();
  }
}

module.exports = {
  SchedulerAgentSupervisor,
  Scheduler,
  Agent,
  Supervisor,
  Task,
  TaskStatus
};
