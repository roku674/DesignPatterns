/**
 * Balking Pattern
 *
 * Purpose:
 * Prevents an action from executing if the object is not in an appropriate state.
 * The operation "balks" (refuses to execute) if preconditions are not met.
 *
 * Use Cases:
 * - Preventing duplicate operations
 * - State-dependent behavior
 * - Resource protection
 * - Idempotent operations
 *
 * @author Design Patterns Implementation
 * @date 2025
 */

/**
 * Balking states
 */
const BalkingState = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DISABLED: 'disabled'
};

/**
 * Balking result types
 */
const BalkingResult = {
  EXECUTED: 'executed',
  BALKED: 'balked',
  ERROR: 'error'
};

/**
 * Balking operation result
 */
class OperationResult {
  constructor(type, reason = null, data = null, error = null) {
    this.type = type;
    this.reason = reason;
    this.data = data;
    this.error = error;
    this.timestamp = Date.now();
  }

  static executed(data) {
    return new OperationResult(BalkingResult.EXECUTED, null, data);
  }

  static balked(reason) {
    return new OperationResult(BalkingResult.BALKED, reason);
  }

  static error(error) {
    return new OperationResult(BalkingResult.ERROR, error.message, null, error);
  }

  isExecuted() {
    return this.type === BalkingResult.EXECUTED;
  }

  isBalked() {
    return this.type === BalkingResult.BALKED;
  }

  isError() {
    return this.type === BalkingResult.ERROR;
  }
}

/**
 * Base Balking Guard
 */
class BalkingGuard {
  constructor(options = {}) {
    this.state = options.initialState || BalkingState.IDLE;
    this.allowedTransitions = options.allowedTransitions || this.getDefaultTransitions();
    this.stats = {
      executions: 0,
      balks: 0,
      errors: 0
    };
    this.listeners = {
      stateChange: [],
      executed: [],
      balked: [],
      error: []
    };
  }

  getDefaultTransitions() {
    return {
      [BalkingState.IDLE]: [BalkingState.RUNNING, BalkingState.DISABLED],
      [BalkingState.RUNNING]: [BalkingState.COMPLETED, BalkingState.FAILED],
      [BalkingState.COMPLETED]: [BalkingState.IDLE],
      [BalkingState.FAILED]: [BalkingState.IDLE],
      [BalkingState.DISABLED]: [BalkingState.IDLE]
    };
  }

  async execute(operation, checkFn = null) {
    // Check custom condition if provided
    if (checkFn && !checkFn(this.state)) {
      const result = OperationResult.balked('Custom check failed');
      this.stats.balks++;
      this.emit('balked', result);
      return result;
    }

    // Check if we can transition to RUNNING
    if (!this.canTransition(BalkingState.RUNNING)) {
      const result = OperationResult.balked(`Cannot execute in ${this.state} state`);
      this.stats.balks++;
      this.emit('balked', result);
      return result;
    }

    // Transition to RUNNING
    this.transition(BalkingState.RUNNING);

    try {
      const data = await operation();
      this.transition(BalkingState.COMPLETED);

      const result = OperationResult.executed(data);
      this.stats.executions++;
      this.emit('executed', result);

      // Return to IDLE
      this.transition(BalkingState.IDLE);

      return result;
    } catch (error) {
      this.transition(BalkingState.FAILED);

      const result = OperationResult.error(error);
      this.stats.errors++;
      this.emit('error', result);

      // Return to IDLE
      this.transition(BalkingState.IDLE);

      return result;
    }
  }

  canTransition(newState) {
    const allowed = this.allowedTransitions[this.state] || [];
    return allowed.includes(newState);
  }

  transition(newState) {
    if (!this.canTransition(newState)) {
      throw new Error(`Invalid state transition from ${this.state} to ${newState}`);
    }

    const oldState = this.state;
    this.state = newState;
    this.emit('stateChange', { from: oldState, to: newState });
  }

  getState() {
    return this.state;
  }

  getStats() {
    return { ...this.stats };
  }

  reset() {
    this.state = BalkingState.IDLE;
  }

  disable() {
    this.state = BalkingState.DISABLED;
  }

  enable() {
    if (this.state === BalkingState.DISABLED) {
      this.state = BalkingState.IDLE;
    }
  }

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
}

/**
 * Auto-save manager with balking
 */
class AutoSaveManager {
  constructor(options = {}) {
    this.saveInterval = options.saveInterval || 5000;
    this.minChangeThreshold = options.minChangeThreshold || 1;

    this.guard = new BalkingGuard();
    this.data = null;
    this.lastSavedData = null;
    this.changeCount = 0;
    this.lastSaveTime = null;
    this.saveCallback = null;
  }

  setSaveCallback(callback) {
    this.saveCallback = callback;
  }

  updateData(newData) {
    this.data = newData;
    this.changeCount++;
  }

  async save() {
    // Balk if no changes
    if (this.changeCount < this.minChangeThreshold) {
      return OperationResult.balked('No changes to save');
    }

    // Balk if saved too recently
    if (this.lastSaveTime &&
        Date.now() - this.lastSaveTime < this.saveInterval) {
      return OperationResult.balked('Saved too recently');
    }

    const result = await this.guard.execute(async () => {
      if (!this.saveCallback) {
        throw new Error('Save callback not configured');
      }

      await this.saveCallback(this.data);
      this.lastSavedData = { ...this.data };
      this.changeCount = 0;
      this.lastSaveTime = Date.now();

      return { saved: true, timestamp: this.lastSaveTime };
    });

    return result;
  }

  hasUnsavedChanges() {
    return this.changeCount > 0;
  }

  getStatus() {
    return {
      state: this.guard.getState(),
      changeCount: this.changeCount,
      lastSaveTime: this.lastSaveTime,
      stats: this.guard.getStats()
    };
  }
}

/**
 * Task executor with duplicate prevention
 */
class SingletonTaskExecutor {
  constructor() {
    this.runningTasks = new Map();
  }

  async execute(taskId, taskFn) {
    // Balk if task is already running
    if (this.runningTasks.has(taskId)) {
      return OperationResult.balked(`Task ${taskId} is already running`);
    }

    this.runningTasks.set(taskId, Date.now());

    try {
      const result = await taskFn();
      this.runningTasks.delete(taskId);
      return OperationResult.executed(result);
    } catch (error) {
      this.runningTasks.delete(taskId);
      return OperationResult.error(error);
    }
  }

  isRunning(taskId) {
    return this.runningTasks.has(taskId);
  }

  getRunningTasks() {
    return Array.from(this.runningTasks.keys());
  }

  getTaskRunTime(taskId) {
    if (!this.runningTasks.has(taskId)) {
      return null;
    }
    return Date.now() - this.runningTasks.get(taskId);
  }
}

/**
 * Rate limiter using balking
 */
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow; // in milliseconds
    this.requests = [];
  }

  async attempt(operation) {
    const now = Date.now();

    // Clean old requests
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.timeWindow
    );

    // Balk if rate limit exceeded
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const timeUntilAvailable = this.timeWindow - (now - oldestRequest);

      return OperationResult.balked(
        `Rate limit exceeded. Try again in ${timeUntilAvailable}ms`
      );
    }

    this.requests.push(now);

    try {
      const result = await operation();
      return OperationResult.executed(result);
    } catch (error) {
      return OperationResult.error(error);
    }
  }

  getRemainingRequests() {
    const now = Date.now();
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    return this.maxRequests - this.requests.length;
  }

  getResetTime() {
    if (this.requests.length === 0) {
      return 0;
    }
    const oldestRequest = Math.min(...this.requests);
    return oldestRequest + this.timeWindow;
  }
}

/**
 * Connection manager with balking
 */
class ConnectionManager {
  constructor(maxConnections = 10) {
    this.maxConnections = maxConnections;
    this.connections = new Map();
    this.guard = new BalkingGuard();
  }

  async connect(connectionId, connectFn) {
    // Balk if already connected
    if (this.connections.has(connectionId)) {
      return OperationResult.balked(`Already connected: ${connectionId}`);
    }

    // Balk if max connections reached
    if (this.connections.size >= this.maxConnections) {
      return OperationResult.balked(
        `Maximum connections (${this.maxConnections}) reached`
      );
    }

    const result = await this.guard.execute(async () => {
      const connection = await connectFn();
      this.connections.set(connectionId, {
        connection,
        connectedAt: Date.now()
      });
      return { connectionId, connected: true };
    });

    return result;
  }

  async disconnect(connectionId, disconnectFn = null) {
    // Balk if not connected
    if (!this.connections.has(connectionId)) {
      return OperationResult.balked(`Not connected: ${connectionId}`);
    }

    const result = await this.guard.execute(async () => {
      const entry = this.connections.get(connectionId);

      if (disconnectFn) {
        await disconnectFn(entry.connection);
      }

      this.connections.delete(connectionId);
      return { connectionId, disconnected: true };
    });

    return result;
  }

  isConnected(connectionId) {
    return this.connections.has(connectionId);
  }

  getConnectionCount() {
    return this.connections.size;
  }

  getAvailableSlots() {
    return this.maxConnections - this.connections.size;
  }
}

/**
 * Idempotent operation handler
 */
class IdempotentHandler {
  constructor(options = {}) {
    this.completedOperations = new Map();
    this.ttl = options.ttl || 300000; // 5 minutes default
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute

    // Start cleanup timer
    this.startCleanup();
  }

  async execute(operationId, operation) {
    // Balk if operation already completed
    const existing = this.completedOperations.get(operationId);
    if (existing) {
      return OperationResult.balked(
        `Operation ${operationId} already completed`
      );
    }

    try {
      const result = await operation();

      // Store completion
      this.completedOperations.set(operationId, {
        result,
        completedAt: Date.now()
      });

      return OperationResult.executed(result);
    } catch (error) {
      return OperationResult.error(error);
    }
  }

  isCompleted(operationId) {
    return this.completedOperations.has(operationId);
  }

  getResult(operationId) {
    const entry = this.completedOperations.get(operationId);
    return entry ? entry.result : null;
  }

  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();

      for (const [operationId, entry] of this.completedOperations.entries()) {
        if (now - entry.completedAt > this.ttl) {
          this.completedOperations.delete(operationId);
        }
      }
    }, this.cleanupInterval);
  }

  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  clear() {
    this.completedOperations.clear();
  }
}

// ============================================================================
// COMPREHENSIVE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic Balking Pattern
 */
async function example1_BasicBalking() {
  console.log('\n=== Example 1: Basic Balking Pattern ===\n');

  const guard = new BalkingGuard();

  // Listen to events
  guard.on('executed', () => console.log('Operation executed'));
  guard.on('balked', (result) => console.log('Operation balked:', result.reason));

  // First execution - should succeed
  console.log('Attempting first execution...');
  const result1 = await guard.execute(async () => {
    console.log('  Executing operation...');
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'Success';
  });
  console.log('Result:', result1.type, result1.data);

  // Try to execute while running - should balk
  console.log('\nAttempting second execution (should balk)...');
  const result2Promise = guard.execute(async () => {
    console.log('  This should not execute');
    return 'Should not happen';
  });

  const result2 = await result2Promise;
  console.log('Result:', result2.type, result2.reason);

  console.log('\nStats:', guard.getStats());
}

/**
 * Example 2: Auto-Save Manager
 */
async function example2_AutoSave() {
  console.log('\n=== Example 2: Auto-Save Manager ===\n');

  const autoSave = new AutoSaveManager({
    saveInterval: 2000,
    minChangeThreshold: 3
  });

  // Set save callback
  autoSave.setSaveCallback(async (data) => {
    console.log('Saving data:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  // Make some changes
  console.log('Making changes...');
  autoSave.updateData({ content: 'First change' });
  autoSave.updateData({ content: 'Second change' });

  // Try to save with too few changes
  console.log('\nAttempt 1 (should balk - not enough changes):');
  const result1 = await autoSave.save();
  console.log('Result:', result1.type, result1.reason);

  // Make one more change
  autoSave.updateData({ content: 'Third change' });

  // Now save should work
  console.log('\nAttempt 2 (should succeed):');
  const result2 = await autoSave.save();
  console.log('Result:', result2.type, result2.data);

  // Try to save again immediately
  console.log('\nAttempt 3 (should balk - saved too recently):');
  autoSave.updateData({ content: 'Fourth change' });
  autoSave.updateData({ content: 'Fifth change' });
  autoSave.updateData({ content: 'Sixth change' });
  const result3 = await autoSave.save();
  console.log('Result:', result3.type, result3.reason);

  console.log('\nStatus:', autoSave.getStatus());
}

/**
 * Example 3: Singleton Task Executor
 */
async function example3_SingletonTask() {
  console.log('\n=== Example 3: Singleton Task Executor ===\n');

  const executor = new SingletonTaskExecutor();

  async function longRunningTask(id, duration) {
    console.log(`Task ${id} starting...`);
    await new Promise(resolve => setTimeout(resolve, duration));
    console.log(`Task ${id} completed`);
    return `Result of task ${id}`;
  }

  // Start task 1
  console.log('Starting task-1...');
  const task1Promise = executor.execute('task-1', () => longRunningTask(1, 2000));

  // Try to start task 1 again (should balk)
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('\nAttempting to start task-1 again (should balk)...');
  const result2 = await executor.execute('task-1', () => longRunningTask(1, 1000));
  console.log('Result:', result2.type, result2.reason);

  // Start task 2 (should succeed - different task)
  console.log('\nStarting task-2...');
  const task2Promise = executor.execute('task-2', () => longRunningTask(2, 1000));

  // Wait for all
  const [result1, task2Result] = await Promise.all([task1Promise, task2Promise]);
  console.log('\nTask 1 result:', result1.type);
  console.log('Task 2 result:', task2Result.type);

  console.log('\nRunning tasks:', executor.getRunningTasks());
}

/**
 * Example 4: Rate Limiter
 */
async function example4_RateLimiter() {
  console.log('\n=== Example 4: Rate Limiter ===\n');

  // Allow 3 requests per 2 seconds
  const limiter = new RateLimiter(3, 2000);

  async function apiCall(id) {
    console.log(`API call ${id}...`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return `Response ${id}`;
  }

  // Make 5 requests rapidly
  console.log('Making 5 rapid requests (limit: 3 per 2 seconds)...\n');

  for (let i = 1; i <= 5; i++) {
    const result = await limiter.attempt(() => apiCall(i));

    if (result.isExecuted()) {
      console.log(`Request ${i}: SUCCESS - ${result.data}`);
    } else if (result.isBalked()) {
      console.log(`Request ${i}: BALKED - ${result.reason}`);
    }

    console.log(`  Remaining: ${limiter.getRemainingRequests()}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Wait for rate limit to reset
  console.log('\nWaiting 2 seconds for rate limit reset...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\nMaking another request after reset...');
  const result = await limiter.attempt(() => apiCall(6));
  console.log(`Result: ${result.type}`);
  console.log(`Remaining: ${limiter.getRemainingRequests()}`);
}

/**
 * Example 5: Connection Manager
 */
async function example5_ConnectionManager() {
  console.log('\n=== Example 5: Connection Manager ===\n');

  const manager = new ConnectionManager(3);

  async function createConnection(id) {
    console.log(`Creating connection ${id}...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id, socket: `socket-${id}` };
  }

  // Connect 3 times (should all succeed)
  console.log('Creating 3 connections...\n');
  for (let i = 1; i <= 3; i++) {
    const result = await manager.connect(`conn-${i}`, () => createConnection(i));
    console.log(`Connection ${i}:`, result.type);
  }

  console.log(`\nConnected: ${manager.getConnectionCount()}`);
  console.log(`Available slots: ${manager.getAvailableSlots()}`);

  // Try to connect again (should balk - max reached)
  console.log('\nAttempting 4th connection (should balk)...');
  const result4 = await manager.connect('conn-4', () => createConnection(4));
  console.log('Result:', result4.type, result4.reason);

  // Try to connect with existing ID (should balk - already connected)
  console.log('\nAttempting duplicate connection (should balk)...');
  const resultDup = await manager.connect('conn-1', () => createConnection(1));
  console.log('Result:', resultDup.type, resultDup.reason);

  // Disconnect one
  console.log('\nDisconnecting conn-2...');
  const disconnectResult = await manager.disconnect('conn-2');
  console.log('Result:', disconnectResult.type);

  // Now we can connect again
  console.log('\nAttempting connection after disconnect...');
  const result5 = await manager.connect('conn-5', () => createConnection(5));
  console.log('Result:', result5.type);

  console.log(`\nFinal state - Connected: ${manager.getConnectionCount()}`);
}

/**
 * Example 6: Idempotent Operations
 */
async function example6_IdempotentOperations() {
  console.log('\n=== Example 6: Idempotent Operations ===\n');

  const handler = new IdempotentHandler({ ttl: 5000 });

  async function processPayment(orderId, amount) {
    console.log(`Processing payment for order ${orderId}: $${amount}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { orderId, amount, transactionId: Math.random().toString(36) };
  }

  // Process payment for order 123
  console.log('Processing payment for order-123...');
  const result1 = await handler.execute('order-123', () =>
    processPayment('order-123', 100)
  );
  console.log('Result 1:', result1.type);
  if (result1.isExecuted()) {
    console.log('Transaction ID:', result1.data.transactionId);
  }

  // Try to process same payment again (should balk)
  console.log('\nAttempting to process order-123 again (should balk)...');
  const result2 = await handler.execute('order-123', () =>
    processPayment('order-123', 100)
  );
  console.log('Result 2:', result2.type, result2.reason);

  // Get cached result
  console.log('\nRetrieving cached result...');
  const cached = handler.getResult('order-123');
  console.log('Cached transaction ID:', cached.transactionId);

  // Process different order (should succeed)
  console.log('\nProcessing payment for order-456...');
  const result3 = await handler.execute('order-456', () =>
    processPayment('order-456', 200)
  );
  console.log('Result 3:', result3.type);

  handler.stopCleanup();
}

/**
 * Main execution
 */
async function demonstrateBalking() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Balking Pattern - Comprehensive Examples            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await example1_BasicBalking();
  await example2_AutoSave();
  await example3_SingletonTask();
  await example4_RateLimiter();
  await example5_ConnectionManager();
  await example6_IdempotentOperations();

  console.log('\n✓ All Balking pattern examples completed successfully!');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BalkingGuard,
    BalkingState,
    BalkingResult,
    OperationResult,
    AutoSaveManager,
    SingletonTaskExecutor,
    RateLimiter,
    ConnectionManager,
    IdempotentHandler,
    demonstrateBalking
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  demonstrateBalking().catch(console.error);
}
