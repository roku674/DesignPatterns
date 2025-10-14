/**
 * Thread-Specific Storage Pattern (Async Context in JavaScript)
 *
 * Purpose:
 * Provides isolated storage for each execution context (async context in JavaScript).
 * Each context has its own copy of data without interference from other contexts.
 *
 * Use Cases:
 * - Request-scoped data in web servers
 * - Transaction contexts
 * - User session management
 * - Logging and tracing contexts
 *
 * @author Design Patterns Implementation
 * @date 2025
 */

const { AsyncLocalStorage } = require('async_hooks');

/**
 * Thread-Specific Storage using AsyncLocalStorage
 */
class ThreadSpecificStorage {
  constructor() {
    this.storage = new AsyncLocalStorage();
    this.defaultValues = new Map();
  }

  /**
   * Run a function with specific context
   */
  run(context, callback) {
    return this.storage.run(context, callback);
  }

  /**
   * Get value from current context
   */
  get(key) {
    const store = this.storage.getStore();
    if (!store) {
      return this.defaultValues.get(key);
    }
    return store[key] !== undefined ? store[key] : this.defaultValues.get(key);
  }

  /**
   * Set value in current context
   */
  set(key, value) {
    const store = this.storage.getStore();
    if (!store) {
      throw new Error('No active context');
    }
    store[key] = value;
  }

  /**
   * Get all context data
   */
  getContext() {
    return this.storage.getStore() || {};
  }

  /**
   * Check if context exists
   */
  hasContext() {
    return this.storage.getStore() !== undefined;
  }

  /**
   * Set default value for key
   */
  setDefault(key, value) {
    this.defaultValues.set(key, value);
  }

  /**
   * Clear default values
   */
  clearDefaults() {
    this.defaultValues.clear();
  }
}

/**
 * Request context manager
 */
class RequestContext {
  constructor() {
    this.storage = new ThreadSpecificStorage();
    this.middleware = this.middleware.bind(this);
  }

  /**
   * Create middleware for request context
   */
  middleware(req, res, next) {
    const context = {
      requestId: this.generateRequestId(),
      userId: req.userId || null,
      timestamp: Date.now(),
      method: req.method,
      path: req.path,
      metadata: {}
    };

    this.storage.run(context, () => {
      next();
    });
  }

  /**
   * Get current request context
   */
  getCurrentContext() {
    return this.storage.getContext();
  }

  /**
   * Get request ID
   */
  getRequestId() {
    return this.storage.get('requestId');
  }

  /**
   * Get user ID
   */
  getUserId() {
    return this.storage.get('userId');
  }

  /**
   * Set metadata
   */
  setMetadata(key, value) {
    const metadata = this.storage.get('metadata') || {};
    metadata[key] = value;
    this.storage.set('metadata', metadata);
  }

  /**
   * Get metadata
   */
  getMetadata(key) {
    const metadata = this.storage.get('metadata') || {};
    return metadata[key];
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Run function with context
   */
  run(context, callback) {
    return this.storage.run(context, callback);
  }
}

/**
 * Transaction context manager
 */
class TransactionContext {
  constructor() {
    this.storage = new ThreadSpecificStorage();
  }

  /**
   * Start a new transaction
   */
  async begin(isolationLevel = 'READ_COMMITTED') {
    const transaction = {
      id: this.generateTransactionId(),
      isolationLevel,
      startTime: Date.now(),
      operations: [],
      status: 'active',
      metadata: {}
    };

    return new Promise((resolve) => {
      this.storage.run(transaction, () => {
        resolve(transaction.id);
      });
    });
  }

  /**
   * Execute function within transaction
   */
  async execute(transactionFn) {
    const transaction = {
      id: this.generateTransactionId(),
      isolationLevel: 'READ_COMMITTED',
      startTime: Date.now(),
      operations: [],
      status: 'active',
      metadata: {}
    };

    return this.storage.run(transaction, async () => {
      try {
        const result = await transactionFn(this);
        this.commit();
        return result;
      } catch (error) {
        this.rollback();
        throw error;
      }
    });
  }

  /**
   * Get current transaction
   */
  getCurrentTransaction() {
    return this.storage.getContext();
  }

  /**
   * Add operation to transaction
   */
  addOperation(operation) {
    const transaction = this.getCurrentTransaction();
    if (!transaction) {
      throw new Error('No active transaction');
    }
    transaction.operations.push({
      ...operation,
      timestamp: Date.now()
    });
  }

  /**
   * Commit transaction
   */
  commit() {
    const transaction = this.getCurrentTransaction();
    if (!transaction) {
      throw new Error('No active transaction');
    }
    transaction.status = 'committed';
    transaction.endTime = Date.now();
  }

  /**
   * Rollback transaction
   */
  rollback() {
    const transaction = this.getCurrentTransaction();
    if (!transaction) {
      throw new Error('No active transaction');
    }
    transaction.status = 'rolled_back';
    transaction.endTime = Date.now();
  }

  /**
   * Get transaction ID
   */
  getTransactionId() {
    return this.storage.get('id');
  }

  /**
   * Generate unique transaction ID
   */
  generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

/**
 * Logger with context awareness
 */
class ContextualLogger {
  constructor(context) {
    this.context = context;
    this.logs = [];
  }

  /**
   * Log with context
   */
  log(level, message, data = {}) {
    const logEntry = {
      level,
      message,
      data,
      context: this.context.getCurrentContext(),
      timestamp: Date.now()
    };

    this.logs.push(logEntry);
    this.formatAndPrint(logEntry);
  }

  info(message, data) {
    this.log('INFO', message, data);
  }

  warn(message, data) {
    this.log('WARN', message, data);
  }

  error(message, data) {
    this.log('ERROR', message, data);
  }

  debug(message, data) {
    this.log('DEBUG', message, data);
  }

  /**
   * Format and print log entry
   */
  formatAndPrint(entry) {
    const requestId = entry.context.requestId || 'no-context';
    const userId = entry.context.userId || 'anonymous';
    console.log(
      `[${entry.level}] [${requestId}] [${userId}] ${entry.message}`,
      entry.data
    );
  }

  /**
   * Get all logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get logs for specific context
   */
  getLogsForContext(requestId) {
    return this.logs.filter(log => log.context.requestId === requestId);
  }

  /**
   * Clear logs
   */
  clear() {
    this.logs = [];
  }
}

/**
 * User session manager with context
 */
class SessionManager {
  constructor() {
    this.storage = new ThreadSpecificStorage();
    this.sessions = new Map();
  }

  /**
   * Create and run session
   */
  async runWithSession(userId, sessionData, callback) {
    const sessionId = this.generateSessionId();
    const session = {
      sessionId,
      userId,
      data: sessionData || {},
      createdAt: Date.now(),
      lastAccessedAt: Date.now()
    };

    this.sessions.set(sessionId, session);

    try {
      return await this.storage.run(session, callback);
    } finally {
      // Update last accessed time
      if (this.sessions.has(sessionId)) {
        this.sessions.get(sessionId).lastAccessedAt = Date.now();
      }
    }
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    return this.storage.getContext();
  }

  /**
   * Get session ID
   */
  getSessionId() {
    return this.storage.get('sessionId');
  }

  /**
   * Get user ID
   */
  getUserId() {
    return this.storage.get('userId');
  }

  /**
   * Get session data
   */
  getSessionData(key) {
    const data = this.storage.get('data') || {};
    return key ? data[key] : data;
  }

  /**
   * Set session data
   */
  setSessionData(key, value) {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('No active session');
    }
    session.data[key] = value;
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Cleanup old sessions
   */
  cleanupSessions(maxAge) {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastAccessedAt > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get session count
   */
  getSessionCount() {
    return this.sessions.size;
  }
}

/**
 * Distributed tracing context
 */
class TracingContext {
  constructor() {
    this.storage = new ThreadSpecificStorage();
    this.traces = new Map();
  }

  /**
   * Start a trace
   */
  async startTrace(operation, callback) {
    const traceId = this.generateTraceId();
    const trace = {
      traceId,
      parentSpanId: this.storage.get('spanId') || null,
      spanId: this.generateSpanId(),
      operation,
      startTime: Date.now(),
      spans: [],
      metadata: {}
    };

    this.traces.set(traceId, trace);

    return this.storage.run(trace, async () => {
      try {
        const result = await callback();
        trace.endTime = Date.now();
        trace.duration = trace.endTime - trace.startTime;
        trace.status = 'success';
        return result;
      } catch (error) {
        trace.endTime = Date.now();
        trace.duration = trace.endTime - trace.startTime;
        trace.status = 'error';
        trace.error = error.message;
        throw error;
      }
    });
  }

  /**
   * Add span to current trace
   */
  addSpan(name, data = {}) {
    const trace = this.storage.getContext();
    if (!trace) {
      return;
    }

    const span = {
      spanId: this.generateSpanId(),
      parentSpanId: trace.spanId,
      name,
      data,
      timestamp: Date.now()
    };

    trace.spans.push(span);
    return span.spanId;
  }

  /**
   * Get current trace ID
   */
  getTraceId() {
    return this.storage.get('traceId');
  }

  /**
   * Get trace
   */
  getTrace(traceId) {
    return this.traces.get(traceId);
  }

  /**
   * Generate trace ID
   */
  generateTraceId() {
    return `trace_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate span ID
   */
  generateSpanId() {
    return `span_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get all traces
   */
  getAllTraces() {
    return Array.from(this.traces.values());
  }
}

// ============================================================================
// COMPREHENSIVE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic Thread-Specific Storage
 */
async function example1_BasicThreadSpecificStorage() {
  console.log('\n=== Example 1: Basic Thread-Specific Storage ===\n');

  const storage = new ThreadSpecificStorage();

  // Run multiple contexts concurrently
  const context1 = storage.run({ userId: 'user-1', role: 'admin' }, async () => {
    console.log('Context 1 - User:', storage.get('userId'));
    console.log('Context 1 - Role:', storage.get('role'));

    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('Context 1 - After delay, User:', storage.get('userId'));
    return 'Context 1 done';
  });

  const context2 = storage.run({ userId: 'user-2', role: 'user' }, async () => {
    console.log('Context 2 - User:', storage.get('userId'));
    console.log('Context 2 - Role:', storage.get('role'));

    await new Promise(resolve => setTimeout(resolve, 50));

    console.log('Context 2 - After delay, User:', storage.get('userId'));
    return 'Context 2 done';
  });

  const results = await Promise.all([context1, context2]);
  console.log('\nResults:', results);
}

/**
 * Example 2: Request Context
 */
async function example2_RequestContext() {
  console.log('\n=== Example 2: Request Context ===\n');

  const requestContext = new RequestContext();

  // Simulate handling requests
  async function handleRequest(requestId, userId, path) {
    return requestContext.run(
      { requestId, userId, path, timestamp: Date.now(), metadata: {} },
      async () => {
        console.log(`\nHandling request: ${path}`);
        console.log('Request ID:', requestContext.getRequestId());
        console.log('User ID:', requestContext.getUserId());

        // Set some metadata
        requestContext.setMetadata('startTime', Date.now());

        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 100));

        requestContext.setMetadata('endTime', Date.now());

        console.log('Metadata:', requestContext.getMetadata('startTime'));

        return { success: true, requestId: requestContext.getRequestId() };
      }
    );
  }

  // Handle multiple requests concurrently
  const requests = [
    handleRequest('req-1', 'user-100', '/api/users'),
    handleRequest('req-2', 'user-200', '/api/posts'),
    handleRequest('req-3', 'user-300', '/api/comments')
  ];

  const results = await Promise.all(requests);
  console.log('\nAll results:', results);
}

/**
 * Example 3: Transaction Context
 */
async function example3_TransactionContext() {
  console.log('\n=== Example 3: Transaction Context ===\n');

  const txContext = new TransactionContext();

  // Execute database operations in transaction
  async function performDatabaseOperations(txCtx) {
    console.log('Transaction ID:', txCtx.getTransactionId());

    // Operation 1
    txCtx.addOperation({
      type: 'INSERT',
      table: 'users',
      data: { name: 'John' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Operation 2
    txCtx.addOperation({
      type: 'UPDATE',
      table: 'accounts',
      data: { balance: 1000 }
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const tx = txCtx.getCurrentTransaction();
    console.log(`Transaction ${tx.id} executed ${tx.operations.length} operations`);

    return tx.operations;
  }

  // Successful transaction
  console.log('Running successful transaction...');
  try {
    const result = await txContext.execute(performDatabaseOperations);
    console.log('Transaction committed with', result.length, 'operations');
  } catch (error) {
    console.log('Transaction failed:', error.message);
  }

  // Failed transaction
  console.log('\nRunning failed transaction...');
  try {
    await txContext.execute(async (txCtx) => {
      txCtx.addOperation({ type: 'INSERT', table: 'users' });
      throw new Error('Simulated error');
    });
  } catch (error) {
    console.log('Transaction rolled back:', error.message);
  }
}

/**
 * Example 4: Contextual Logging
 */
async function example4_ContextualLogging() {
  console.log('\n=== Example 4: Contextual Logging ===\n');

  const requestContext = new RequestContext();
  const logger = new ContextualLogger(requestContext);

  // Simulate request with logging
  async function handleRequestWithLogging(requestId, userId) {
    return requestContext.run(
      { requestId, userId, timestamp: Date.now() },
      async () => {
        logger.info('Request started');

        await new Promise(resolve => setTimeout(resolve, 50));

        logger.debug('Processing data', { items: 10 });

        await new Promise(resolve => setTimeout(resolve, 50));

        logger.info('Request completed');

        return 'done';
      }
    );
  }

  // Handle multiple requests
  await Promise.all([
    handleRequestWithLogging('req-A', 'user-1'),
    handleRequestWithLogging('req-B', 'user-2'),
    handleRequestWithLogging('req-C', 'user-3')
  ]);

  console.log(`\nTotal logs: ${logger.getLogs().length}`);
  console.log('Logs for req-A:', logger.getLogsForContext('req-A').length);
}

/**
 * Example 5: Session Management
 */
async function example5_SessionManagement() {
  console.log('\n=== Example 5: Session Management ===\n');

  const sessionManager = new SessionManager();

  // Run operations in user sessions
  async function performUserAction(userId, action) {
    return sessionManager.runWithSession(
      userId,
      { preferences: { theme: 'dark' }, cart: [] },
      async () => {
        console.log(`\nUser ${userId} - ${action}`);
        console.log('Session ID:', sessionManager.getSessionId());

        // Access session data
        const preferences = sessionManager.getSessionData('preferences');
        console.log('Preferences:', preferences);

        // Modify session data
        if (action === 'add-to-cart') {
          const cart = sessionManager.getSessionData('cart');
          cart.push({ item: 'Product 1', price: 99.99 });
          sessionManager.setSessionData('cart', cart);
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        const cart = sessionManager.getSessionData('cart');
        console.log('Cart items:', cart.length);

        return { userId, action, cartItems: cart.length };
      }
    );
  }

  // Multiple users performing actions
  const actions = await Promise.all([
    performUserAction('user-1', 'add-to-cart'),
    performUserAction('user-2', 'view-profile'),
    performUserAction('user-1', 'checkout')
  ]);

  console.log('\nActions completed:', actions.length);
  console.log('Active sessions:', sessionManager.getSessionCount());
}

/**
 * Example 6: Distributed Tracing
 */
async function example6_DistributedTracing() {
  console.log('\n=== Example 6: Distributed Tracing ===\n');

  const tracing = new TracingContext();

  // Simulate service calls with tracing
  async function serviceA() {
    return tracing.startTrace('service-a', async () => {
      console.log('Service A - Trace ID:', tracing.getTraceId());

      tracing.addSpan('validate-input', { valid: true });
      await new Promise(resolve => setTimeout(resolve, 100));

      tracing.addSpan('process-data', { records: 10 });
      await new Promise(resolve => setTimeout(resolve, 100));

      // Call service B
      await serviceB();

      return 'Service A done';
    });
  }

  async function serviceB() {
    return tracing.startTrace('service-b', async () => {
      console.log('Service B - Trace ID:', tracing.getTraceId());

      tracing.addSpan('query-database', { query: 'SELECT *' });
      await new Promise(resolve => setTimeout(resolve, 150));

      tracing.addSpan('format-response', { format: 'JSON' });
      await new Promise(resolve => setTimeout(resolve, 50));

      return 'Service B done';
    });
  }

  // Execute traced operation
  console.log('Starting traced operation...\n');
  await serviceA();

  // View traces
  const traces = tracing.getAllTraces();
  console.log(`\nTotal traces: ${traces.length}`);
  traces.forEach(trace => {
    console.log(`\nTrace ${trace.traceId}:`);
    console.log(`  Operation: ${trace.operation}`);
    console.log(`  Duration: ${trace.duration}ms`);
    console.log(`  Spans: ${trace.spans.length}`);
    console.log(`  Status: ${trace.status}`);
  });
}

/**
 * Example 7: Nested Contexts
 */
async function example7_NestedContexts() {
  console.log('\n=== Example 7: Nested Contexts ===\n');

  const storage = new ThreadSpecificStorage();

  // Outer context
  await storage.run({ level: 1, name: 'outer' }, async () => {
    console.log('Outer context:', storage.get('name'));

    // Inner context (nested)
    await storage.run({ level: 2, name: 'inner' }, async () => {
      console.log('Inner context:', storage.get('name'));
      console.log('Inner level:', storage.get('level'));

      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Still in inner context:', storage.get('name'));
    });

    // Back to outer context
    console.log('Back to outer context:', storage.get('name'));
    console.log('Outer level:', storage.get('level'));
  });

  console.log('Outside all contexts');
}

/**
 * Main execution
 */
async function demonstrateThreadSpecificStorage() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Thread-Specific Storage Pattern - Comprehensive Examples ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await example1_BasicThreadSpecificStorage();
  await example2_RequestContext();
  await example3_TransactionContext();
  await example4_ContextualLogging();
  await example5_SessionManagement();
  await example6_DistributedTracing();
  await example7_NestedContexts();

  console.log('\n✓ All Thread-Specific Storage pattern examples completed successfully!');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ThreadSpecificStorage,
    RequestContext,
    TransactionContext,
    ContextualLogger,
    SessionManager,
    TracingContext,
    demonstrateThreadSpecificStorage
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  demonstrateThreadSpecificStorage().catch(console.error);
}
