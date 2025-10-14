/**
 * Guarded Suspension Pattern
 *
 * Purpose:
 * Suspends execution until a guard condition is met. Threads wait until
 * the system state allows them to proceed safely.
 *
 * Use Cases:
 * - Producer-consumer queues
 * - Resource availability waiting
 * - Conditional execution flow
 * - Event-driven processing
 *
 * @author Design Patterns Implementation
 * @date 2025
 */

/**
 * Guard condition wrapper
 */
class GuardCondition {
  constructor(predicate, description = '') {
    this.predicate = predicate;
    this.description = description;
    this.evaluationCount = 0;
    this.lastResult = false;
  }

  evaluate(context) {
    this.evaluationCount++;
    this.lastResult = this.predicate(context);
    return this.lastResult;
  }

  toString() {
    return this.description || 'Guard condition';
  }
}

/**
 * Waiter tracking
 */
class Waiter {
  constructor(condition, timeout = null) {
    this.id = Math.random().toString(36).substring(7);
    this.condition = condition;
    this.timeout = timeout;
    this.createdAt = Date.now();
    this.resolvedAt = null;
    this.resolve = null;
    this.reject = null;
    this.timedOut = false;
    this.fulfilled = false;
  }

  createPromise() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      if (this.timeout) {
        setTimeout(() => {
          if (!this.fulfilled) {
            this.timedOut = true;
            reject(new Error(`Guarded suspension timeout after ${this.timeout}ms`));
          }
        }, this.timeout);
      }
    });
  }

  fulfill(result) {
    if (!this.fulfilled && !this.timedOut) {
      this.fulfilled = true;
      this.resolvedAt = Date.now();
      this.resolve(result);
    }
  }

  getWaitTime() {
    if (!this.resolvedAt) {
      return Date.now() - this.createdAt;
    }
    return this.resolvedAt - this.createdAt;
  }
}

/**
 * GuardedSuspension implementation
 * Manages conditional waiting and notification
 */
class GuardedSuspension {
  constructor(options = {}) {
    this.state = options.initialState || {};
    this.waiters = [];
    this.defaultTimeout = options.defaultTimeout || 30000;
    this.checkInterval = options.checkInterval || 100;
    this.maxWaiters = options.maxWaiters || Infinity;

    this.stats = {
      totalWaits: 0,
      totalFulfilled: 0,
      totalTimedOut: 0,
      totalNotifications: 0,
      averageWaitTime: 0
    };

    this.listeners = {
      stateChange: [],
      waiterAdded: [],
      waiterFulfilled: [],
      waiterTimedOut: []
    };
  }

  /**
   * Wait for a condition to be true
   */
  async waitFor(condition, timeout = null) {
    // Check if condition is already met
    if (condition.evaluate(this.state)) {
      return this.state;
    }

    // Check if we can accept more waiters
    if (this.waiters.length >= this.maxWaiters) {
      throw new Error('Maximum waiters limit reached');
    }

    const waiter = new Waiter(
      condition,
      timeout || this.defaultTimeout
    );

    this.waiters.push(waiter);
    this.stats.totalWaits++;
    this.emit('waiterAdded', waiter);

    const promise = waiter.createPromise();

    // Periodically check condition
    const intervalId = setInterval(() => {
      if (waiter.fulfilled || waiter.timedOut) {
        clearInterval(intervalId);
        return;
      }

      if (condition.evaluate(this.state)) {
        this.fulfillWaiter(waiter);
        clearInterval(intervalId);
      }
    }, this.checkInterval);

    try {
      await promise;
      return this.state;
    } catch (error) {
      clearInterval(intervalId);
      this.removeWaiter(waiter);
      this.stats.totalTimedOut++;
      this.emit('waiterTimedOut', waiter);
      throw error;
    }
  }

  /**
   * Update state and notify waiting threads
   */
  updateState(updates) {
    Object.assign(this.state, updates);
    this.emit('stateChange', this.state);
    this.notifyWaiters();
    this.stats.totalNotifications++;
  }

  /**
   * Set state completely (replace)
   */
  setState(newState) {
    this.state = { ...newState };
    this.emit('stateChange', this.state);
    this.notifyWaiters();
    this.stats.totalNotifications++;
  }

  /**
   * Get current state (readonly copy)
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Notify all waiters to check their conditions
   */
  notifyWaiters() {
    const toFulfill = [];

    for (const waiter of this.waiters) {
      if (!waiter.fulfilled && !waiter.timedOut) {
        if (waiter.condition.evaluate(this.state)) {
          toFulfill.push(waiter);
        }
      }
    }

    toFulfill.forEach(waiter => this.fulfillWaiter(waiter));
  }

  /**
   * Fulfill a waiter's condition
   */
  fulfillWaiter(waiter) {
    waiter.fulfill(this.state);
    this.removeWaiter(waiter);
    this.stats.totalFulfilled++;

    // Update average wait time
    const totalWaitTime = this.stats.averageWaitTime * (this.stats.totalFulfilled - 1);
    this.stats.averageWaitTime =
      (totalWaitTime + waiter.getWaitTime()) / this.stats.totalFulfilled;

    this.emit('waiterFulfilled', waiter);
  }

  /**
   * Remove a waiter from the queue
   */
  removeWaiter(waiter) {
    const index = this.waiters.indexOf(waiter);
    if (index !== -1) {
      this.waiters.splice(index, 1);
    }
  }

  /**
   * Get status information
   */
  getStatus() {
    return {
      currentState: { ...this.state },
      activeWaiters: this.waiters.length,
      stats: { ...this.stats }
    };
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
   * Clear all waiters
   */
  clearWaiters() {
    this.waiters.forEach(waiter => {
      if (!waiter.fulfilled && !waiter.timedOut) {
        waiter.reject(new Error('Waiters cleared'));
      }
    });
    this.waiters = [];
  }
}

/**
 * Bounded buffer implementation using Guarded Suspension
 */
class BoundedBuffer {
  constructor(capacity = 10) {
    this.capacity = capacity;
    this.buffer = [];
    this.guard = new GuardedSuspension({
      initialState: {
        items: [],
        count: 0,
        capacity: capacity
      }
    });
  }

  async put(item) {
    // Wait until buffer is not full
    await this.guard.waitFor(
      new GuardCondition(
        state => state.count < state.capacity,
        'Buffer not full'
      )
    );

    this.buffer.push(item);
    this.guard.updateState({
      items: [...this.buffer],
      count: this.buffer.length
    });

    return true;
  }

  async take() {
    // Wait until buffer is not empty
    await this.guard.waitFor(
      new GuardCondition(
        state => state.count > 0,
        'Buffer not empty'
      )
    );

    const item = this.buffer.shift();
    this.guard.updateState({
      items: [...this.buffer],
      count: this.buffer.length
    });

    return item;
  }

  size() {
    return this.buffer.length;
  }

  isEmpty() {
    return this.buffer.length === 0;
  }

  isFull() {
    return this.buffer.length >= this.capacity;
  }
}

/**
 * Resource pool with availability waiting
 */
class ResourcePool {
  constructor(resources) {
    this.resources = resources;
    this.available = [...resources];
    this.inUse = new Map();

    this.guard = new GuardedSuspension({
      initialState: {
        availableCount: resources.length,
        inUseCount: 0
      }
    });
  }

  async acquire(timeout = 30000) {
    // Wait for resource availability
    await this.guard.waitFor(
      new GuardCondition(
        state => state.availableCount > 0,
        'Resource available'
      ),
      timeout
    );

    const resource = this.available.shift();
    const acquireId = Math.random().toString(36).substring(7);

    this.inUse.set(acquireId, {
      resource,
      acquiredAt: Date.now()
    });

    this.guard.updateState({
      availableCount: this.available.length,
      inUseCount: this.inUse.size
    });

    return { resource, releaseToken: acquireId };
  }

  release(releaseToken) {
    const entry = this.inUse.get(releaseToken);
    if (!entry) {
      throw new Error('Invalid release token');
    }

    this.available.push(entry.resource);
    this.inUse.delete(releaseToken);

    this.guard.updateState({
      availableCount: this.available.length,
      inUseCount: this.inUse.size
    });

    return true;
  }

  getStatus() {
    return {
      total: this.resources.length,
      available: this.available.length,
      inUse: this.inUse.size
    };
  }
}

/**
 * Event-driven workflow coordinator
 */
class WorkflowCoordinator {
  constructor() {
    this.guard = new GuardedSuspension({
      initialState: {
        events: new Set(),
        data: {}
      }
    });
  }

  async waitForEvent(eventName, timeout = null) {
    await this.guard.waitFor(
      new GuardCondition(
        state => state.events.has(eventName),
        `Event '${eventName}' occurred`
      ),
      timeout
    );

    const state = this.guard.getState();
    return state.data[eventName];
  }

  async waitForAllEvents(eventNames, timeout = null) {
    await this.guard.waitFor(
      new GuardCondition(
        state => eventNames.every(name => state.events.has(name)),
        `All events ${eventNames.join(', ')} occurred`
      ),
      timeout
    );

    const state = this.guard.getState();
    return eventNames.reduce((acc, name) => {
      acc[name] = state.data[name];
      return acc;
    }, {});
  }

  async waitForAnyEvent(eventNames, timeout = null) {
    await this.guard.waitFor(
      new GuardCondition(
        state => eventNames.some(name => state.events.has(name)),
        `Any event ${eventNames.join(', ')} occurred`
      ),
      timeout
    );

    const state = this.guard.getState();
    const occurredEvent = eventNames.find(name => state.events.has(name));
    return {
      event: occurredEvent,
      data: state.data[occurredEvent]
    };
  }

  triggerEvent(eventName, data = null) {
    const state = this.guard.getState();
    state.events.add(eventName);
    state.data[eventName] = data;

    this.guard.setState(state);
  }

  reset() {
    this.guard.setState({
      events: new Set(),
      data: {}
    });
  }
}

// ============================================================================
// COMPREHENSIVE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic Guarded Suspension
 */
async function example1_BasicGuardedSuspension() {
  console.log('\n=== Example 1: Basic Guarded Suspension ===\n');

  const guard = new GuardedSuspension({
    initialState: { ready: false, value: 0 }
  });

  // Start waiting for condition
  console.log('Starting to wait for ready state...');
  const waitPromise = guard.waitFor(
    new GuardCondition(
      state => state.ready === true,
      'System ready'
    )
  );

  // Simulate some processing
  setTimeout(() => {
    console.log('Setting system to ready...');
    guard.updateState({ ready: true, value: 42 });
  }, 1000);

  const result = await waitPromise;
  console.log('Condition met! State:', result);
}

/**
 * Example 2: Producer-Consumer with Bounded Buffer
 */
async function example2_ProducerConsumer() {
  console.log('\n=== Example 2: Producer-Consumer Pattern ===\n');

  const buffer = new BoundedBuffer(5);

  // Producer
  async function producer(id, count) {
    for (let i = 0; i < count; i++) {
      const item = `P${id}-Item${i}`;
      await buffer.put(item);
      console.log(`Producer ${id} produced: ${item} (buffer size: ${buffer.size()})`);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
    }
  }

  // Consumer
  async function consumer(id, count) {
    for (let i = 0; i < count; i++) {
      const item = await buffer.take();
      console.log(`Consumer ${id} consumed: ${item} (buffer size: ${buffer.size()})`);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 700));
    }
  }

  // Start producers and consumers
  await Promise.all([
    producer(1, 5),
    producer(2, 5),
    consumer(1, 5),
    consumer(2, 5)
  ]);

  console.log('\nAll items produced and consumed');
}

/**
 * Example 3: Resource Pool Management
 */
async function example3_ResourcePool() {
  console.log('\n=== Example 3: Resource Pool Management ===\n');

  // Create a pool of database connections
  const connections = [
    { id: 1, name: 'Connection-1' },
    { id: 2, name: 'Connection-2' },
    { id: 3, name: 'Connection-3' }
  ];

  const pool = new ResourcePool(connections);

  async function useConnection(workerId, duration) {
    console.log(`Worker ${workerId} requesting connection...`);

    const { resource, releaseToken } = await pool.acquire();
    console.log(`Worker ${workerId} acquired ${resource.name}`);

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, duration));

    pool.release(releaseToken);
    console.log(`Worker ${workerId} released ${resource.name}`);
  }

  // Multiple workers competing for resources
  await Promise.all([
    useConnection(1, 1000),
    useConnection(2, 1500),
    useConnection(3, 800),
    useConnection(4, 1200),
    useConnection(5, 900)
  ]);

  console.log('\nFinal pool status:', pool.getStatus());
}

/**
 * Example 4: Event-Driven Workflow
 */
async function example4_EventDrivenWorkflow() {
  console.log('\n=== Example 4: Event-Driven Workflow ===\n');

  const coordinator = new WorkflowCoordinator();

  // Task waiting for authentication
  const authTask = coordinator.waitForEvent('auth_complete').then(data => {
    console.log('Authentication completed:', data);
    return data;
  });

  // Task waiting for data loading
  const dataTask = coordinator.waitForEvent('data_loaded').then(data => {
    console.log('Data loaded:', data);
    return data;
  });

  // Task waiting for both events
  const readyTask = coordinator.waitForAllEvents(['auth_complete', 'data_loaded']).then(data => {
    console.log('System fully initialized with:', data);
    return data;
  });

  // Simulate events occurring
  setTimeout(() => {
    console.log('Triggering auth_complete...');
    coordinator.triggerEvent('auth_complete', { userId: 123, token: 'abc123' });
  }, 500);

  setTimeout(() => {
    console.log('Triggering data_loaded...');
    coordinator.triggerEvent('data_loaded', { records: 100, cached: true });
  }, 1000);

  await readyTask;
  console.log('\nWorkflow completed');
}

/**
 * Example 5: Timeout Handling
 */
async function example5_TimeoutHandling() {
  console.log('\n=== Example 5: Timeout Handling ===\n');

  const guard = new GuardedSuspension({
    initialState: { completed: false }
  });

  // Try to wait with a short timeout
  try {
    console.log('Waiting for completion (1 second timeout)...');
    await guard.waitFor(
      new GuardCondition(
        state => state.completed === true,
        'Task completed'
      ),
      1000
    );
    console.log('Condition met!');
  } catch (error) {
    console.log('Timeout occurred:', error.message);
  }

  // Now complete the task
  console.log('\nCompleting the task...');
  guard.updateState({ completed: true });

  // Try again without timeout
  console.log('Waiting again (no timeout)...');
  await guard.waitFor(
    new GuardCondition(
      state => state.completed === true,
      'Task completed'
    )
  );
  console.log('Condition met immediately!');

  console.log('\nGuard status:', guard.getStatus());
}

/**
 * Example 6: Multi-stage Pipeline
 */
async function example6_MultiStagePipeline() {
  console.log('\n=== Example 6: Multi-stage Pipeline ===\n');

  const pipeline = new GuardedSuspension({
    initialState: {
      stage: 'init',
      data: null,
      error: null
    }
  });

  // Stage 1: Wait for validation
  async function stage1_validate() {
    console.log('Stage 1: Waiting for validation...');
    await pipeline.waitFor(
      new GuardCondition(
        state => state.stage === 'validated',
        'Data validated'
      )
    );
    console.log('Stage 1: Validation complete');
  }

  // Stage 2: Wait for processing
  async function stage2_process() {
    console.log('Stage 2: Waiting for processing...');
    await pipeline.waitFor(
      new GuardCondition(
        state => state.stage === 'processed',
        'Data processed'
      )
    );
    console.log('Stage 2: Processing complete');
  }

  // Stage 3: Wait for completion
  async function stage3_complete() {
    console.log('Stage 3: Waiting for completion...');
    await pipeline.waitFor(
      new GuardCondition(
        state => state.stage === 'complete',
        'Pipeline complete'
      )
    );
    console.log('Stage 3: Pipeline complete');
    const state = pipeline.getState();
    console.log('Final data:', state.data);
  }

  // Start all stages
  const stages = Promise.all([
    stage1_validate(),
    stage2_process(),
    stage3_complete()
  ]);

  // Progress through stages
  setTimeout(() => {
    console.log('\n>>> Validating data...');
    pipeline.updateState({ stage: 'validated', data: { raw: 'input' } });
  }, 500);

  setTimeout(() => {
    console.log('\n>>> Processing data...');
    pipeline.updateState({ stage: 'processed', data: { processed: 'output' } });
  }, 1500);

  setTimeout(() => {
    console.log('\n>>> Completing pipeline...');
    pipeline.updateState({ stage: 'complete', data: { final: 'result' } });
  }, 2500);

  await stages;
}

/**
 * Main execution
 */
async function demonstrateGuardedSuspension() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    Guarded Suspension Pattern - Comprehensive Examples     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await example1_BasicGuardedSuspension();
  await example2_ProducerConsumer();
  await example3_ResourcePool();
  await example4_EventDrivenWorkflow();
  await example5_TimeoutHandling();
  await example6_MultiStagePipeline();

  console.log('\n✓ All Guarded Suspension pattern examples completed successfully!');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GuardedSuspension,
    GuardCondition,
    BoundedBuffer,
    ResourcePool,
    WorkflowCoordinator,
    demonstrateGuardedSuspension
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  demonstrateGuardedSuspension().catch(console.error);
}
