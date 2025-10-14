/**
 * Command Message Pattern
 *
 * A Command Message is used to invoke a procedure or method on a remote system.
 * It encapsulates a request as a message containing all necessary parameters.
 *
 * Use this pattern when you need to:
 * - Invoke remote procedures reliably
 * - Queue commands for later execution
 * - Support asynchronous command processing
 * - Enable command auditing and replay
 */

const { EventEmitter } = require('events');
const crypto = require('crypto');

/**
 * Command Message class
 */
class CommandMessage extends EventEmitter {
  constructor(command, parameters = {}, options = {}) {
    super();
    this.id = options.id || this.generateId();
    this.command = command;
    this.parameters = parameters;
    this.timestamp = Date.now();
    this.correlationId = options.correlationId || null;
    this.replyTo = options.replyTo || null;
    this.timeout = options.timeout || 30000;
    this.priority = options.priority || 5;
    this.retryCount = 0;
    this.maxRetries = options.maxRetries || 3;
    this.status = 'pending'; // pending, executing, completed, failed
    this.result = null;
    this.error = null;
  }

  generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Mark command as executing
   */
  markExecuting() {
    this.status = 'executing';
    this.emit('executing', this);
  }

  /**
   * Mark command as completed
   */
  markCompleted(result) {
    this.status = 'completed';
    this.result = result;
    this.emit('completed', this);
  }

  /**
   * Mark command as failed
   */
  markFailed(error) {
    this.status = 'failed';
    this.error = error;
    this.emit('failed', this);
  }

  /**
   * Check if command can be retried
   */
  canRetry() {
    return this.retryCount < this.maxRetries;
  }

  /**
   * Increment retry counter
   */
  incrementRetry() {
    this.retryCount++;
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      command: this.command,
      parameters: this.parameters,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      replyTo: this.replyTo,
      timeout: this.timeout,
      priority: this.priority,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      status: this.status,
      result: this.result,
      error: this.error
    };
  }
}

/**
 * Command Dispatcher - Processes command messages
 */
class CommandDispatcher extends EventEmitter {
  constructor() {
    super();
    this.handlers = new Map();
    this.queue = [];
    this.processing = false;
    this.stats = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      retried: 0
    };
  }

  /**
   * Register a command handler
   */
  registerHandler(command, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    this.handlers.set(command, handler);
  }

  /**
   * Dispatch a command message
   */
  async dispatch(commandMessage) {
    this.queue.push(commandMessage);
    this.emit('queued', commandMessage);

    if (!this.processing) {
      await this.processQueue();
    }
  }

  /**
   * Process command queue
   */
  async processQueue() {
    this.processing = true;

    while (this.queue.length > 0) {
      // Sort by priority
      this.queue.sort((a, b) => b.priority - a.priority);

      const commandMessage = this.queue.shift();
      await this.processCommand(commandMessage);
    }

    this.processing = false;
  }

  /**
   * Process a single command
   */
  async processCommand(commandMessage) {
    const handler = this.handlers.get(commandMessage.command);

    if (!handler) {
      commandMessage.markFailed(new Error(`No handler for command: ${commandMessage.command}`));
      this.stats.failed++;
      this.emit('error', commandMessage);
      return;
    }

    commandMessage.markExecuting();
    this.stats.processed++;

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(
        handler,
        commandMessage.parameters,
        commandMessage.timeout
      );

      commandMessage.markCompleted(result);
      this.stats.succeeded++;
      this.emit('success', commandMessage);

      // Send reply if replyTo is specified
      if (commandMessage.replyTo) {
        this.emit('reply', {
          channel: commandMessage.replyTo,
          correlationId: commandMessage.correlationId,
          result
        });
      }
    } catch (error) {
      if (commandMessage.canRetry()) {
        commandMessage.incrementRetry();
        this.stats.retried++;
        this.queue.push(commandMessage); // Re-queue for retry
        this.emit('retry', commandMessage);
      } else {
        commandMessage.markFailed(error);
        this.stats.failed++;
        this.emit('error', commandMessage);
      }
    }
  }

  /**
   * Execute handler with timeout
   */
  executeWithTimeout(handler, parameters, timeout) {
    return Promise.race([
      handler(parameters),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Command timeout')), timeout)
      )
    ]);
  }

  /**
   * Get dispatcher statistics
   */
  getStats() {
    return { ...this.stats };
  }
}

/**
 * Command Builder for fluent command construction
 */
class CommandBuilder {
  constructor(command) {
    this.command = command;
    this.parameters = {};
    this.options = {};
  }

  withParameters(parameters) {
    this.parameters = { ...this.parameters, ...parameters };
    return this;
  }

  withParameter(key, value) {
    this.parameters[key] = value;
    return this;
  }

  withCorrelationId(correlationId) {
    this.options.correlationId = correlationId;
    return this;
  }

  withReplyTo(replyTo) {
    this.options.replyTo = replyTo;
    return this;
  }

  withTimeout(timeout) {
    this.options.timeout = timeout;
    return this;
  }

  withPriority(priority) {
    this.options.priority = priority;
    return this;
  }

  withMaxRetries(maxRetries) {
    this.options.maxRetries = maxRetries;
    return this;
  }

  build() {
    return new CommandMessage(this.command, this.parameters, this.options);
  }
}

// Usage Examples
console.log('=== Command Message Pattern Examples ===\n');

// Example 1: Basic command message
console.log('1. Basic Command Message:');
const cmd1 = new CommandMessage('createUser', { name: 'John', email: 'john@example.com' });
console.log('Command:', cmd1.command);
console.log('Parameters:', cmd1.parameters);
console.log('Status:', cmd1.status);
console.log('');

// Example 2: Command with builder
console.log('2. Command Builder:');
const cmd2 = new CommandBuilder('processPayment')
  .withParameter('orderId', 'ORD-001')
  .withParameter('amount', 99.99)
  .withPriority(9)
  .withTimeout(5000)
  .withReplyTo('payment.responses')
  .build();
console.log('Built command:', cmd2.toJSON());
console.log('');

// Example 3: Command dispatcher with handlers
console.log('3. Command Dispatcher:');
const dispatcher = new CommandDispatcher();

dispatcher.registerHandler('createUser', async (params) => {
  console.log('Creating user:', params.name);
  return { userId: 123, name: params.name, created: true };
});

dispatcher.registerHandler('deleteUser', async (params) => {
  console.log('Deleting user:', params.userId);
  return { userId: params.userId, deleted: true };
});

const cmd3 = new CommandMessage('createUser', { name: 'Alice' });
dispatcher.dispatch(cmd3).then(() => {
  console.log('Command result:', cmd3.result);
});
console.log('');

// Example 4: Command with retry logic
console.log('4. Command Retry Logic:');
let attemptCount = 0;
dispatcher.registerHandler('unreliableCommand', async (params) => {
  attemptCount++;
  if (attemptCount < 3) {
    throw new Error('Temporary failure');
  }
  return { success: true, attempts: attemptCount };
});

const cmd4 = new CommandBuilder('unreliableCommand')
  .withMaxRetries(5)
  .build();

setTimeout(() => {
  dispatcher.dispatch(cmd4).then(() => {
    setTimeout(() => {
      console.log('Command succeeded after retries:', cmd4.result);
      console.log('Total attempts:', attemptCount);
    }, 500);
  });
}, 100);
console.log('');

// Example 5: Command with timeout
console.log('5. Command Timeout:');
dispatcher.registerHandler('slowCommand', async (params) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { completed: true };
});

const cmd5 = new CommandBuilder('slowCommand')
  .withTimeout(500)
  .withMaxRetries(0)
  .build();

setTimeout(() => {
  dispatcher.dispatch(cmd5).then(() => {
    setTimeout(() => {
      console.log('Command status:', cmd5.status);
      console.log('Error:', cmd5.error ? cmd5.error.message : 'none');
    }, 1000);
  });
}, 200);
console.log('');

// Example 6: Command priority queue
console.log('6. Command Priority Queue:');
const dispatcher2 = new CommandDispatcher();
dispatcher2.registerHandler('task', async (params) => {
  console.log(`Executing task ${params.id} with priority ${params.priority}`);
  return { completed: true };
});

// Dispatch in reverse priority order
const lowPriority = new CommandBuilder('task')
  .withParameter('id', 1)
  .withParameter('priority', 3)
  .withPriority(3)
  .build();

const highPriority = new CommandBuilder('task')
  .withParameter('id', 2)
  .withParameter('priority', 9)
  .withPriority(9)
  .build();

const mediumPriority = new CommandBuilder('task')
  .withParameter('id', 3)
  .withParameter('priority', 6)
  .withPriority(6)
  .build();

setTimeout(() => {
  dispatcher2.dispatch(lowPriority);
  dispatcher2.dispatch(highPriority);
  dispatcher2.dispatch(mediumPriority);
}, 300);
console.log('');

// Example 7: Command events
console.log('7. Command Events:');
const cmd7 = new CommandMessage('testCommand', { data: 'test' });

cmd7.on('executing', () => console.log('Command executing...'));
cmd7.on('completed', () => console.log('Command completed!'));
cmd7.on('failed', () => console.log('Command failed!'));

dispatcher.registerHandler('testCommand', async (params) => {
  return { result: 'success' };
});

setTimeout(() => {
  dispatcher.dispatch(cmd7);
}, 400);
console.log('');

// Example 8: Request-Reply pattern
console.log('8. Request-Reply Pattern:');
const dispatcher3 = new CommandDispatcher();

dispatcher3.registerHandler('getUser', async (params) => {
  return {
    userId: params.userId,
    name: 'John Doe',
    email: 'john@example.com'
  };
});

dispatcher3.on('reply', (reply) => {
  console.log('Reply sent to:', reply.channel);
  console.log('Correlation ID:', reply.correlationId);
  console.log('Result:', reply.result);
});

const cmd8 = new CommandBuilder('getUser')
  .withParameter('userId', 42)
  .withReplyTo('user.responses')
  .withCorrelationId('REQ-001')
  .build();

setTimeout(() => {
  dispatcher3.dispatch(cmd8);
}, 500);
console.log('');

// Example 9: Dispatcher statistics
console.log('9. Dispatcher Statistics:');
setTimeout(() => {
  console.log('Stats:', dispatcher.getStats());
}, 1500);
console.log('');

// Example 10: Batch command processing
console.log('10. Batch Command Processing:');
const batchDispatcher = new CommandDispatcher();

batchDispatcher.registerHandler('batchTask', async (params) => {
  return { taskId: params.taskId, processed: true };
});

const commands = [];
for (let i = 1; i <= 5; i++) {
  const cmd = new CommandBuilder('batchTask')
    .withParameter('taskId', i)
    .withPriority(Math.floor(Math.random() * 10))
    .build();
  commands.push(cmd);
}

setTimeout(() => {
  commands.forEach(cmd => batchDispatcher.dispatch(cmd));

  setTimeout(() => {
    console.log('Batch processing complete');
    console.log('Batch stats:', batchDispatcher.getStats());
  }, 500);
}, 600);

module.exports = {
  CommandMessage,
  CommandDispatcher,
  CommandBuilder
};
