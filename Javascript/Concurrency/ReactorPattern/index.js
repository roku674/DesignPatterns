/**
 * Reactor Pattern Implementation
 *
 * The Reactor pattern handles service requests delivered concurrently to an application
 * by one or more clients. It demultiplexes incoming requests and dispatches them
 * synchronously to associated request handlers.
 *
 * Key Components:
 * - Event Demultiplexer: Waits for events on a set of handles
 * - Reactor: Registers/removes handlers and dispatches events
 * - Event Handler: Processes specific types of events
 *
 * Use Cases:
 * - Event-driven servers (Node.js HTTP servers)
 * - GUI event handling
 * - Network I/O multiplexing
 * - Real-time data processing
 */

const { EventEmitter } = require('events');

/**
 * Event handle representing a resource
 */
class Handle {
  constructor(id, type) {
    this.id = id;
    this.type = type;
  }
}

/**
 * Base event handler interface
 */
class EventHandler {
  constructor() {
    if (this.constructor === EventHandler) {
      throw new Error("EventHandler is abstract and cannot be instantiated");
    }
  }

  /**
   * Hook method called when event occurs
   * @param {Handle} handle - The event handle
   * @param {*} data - Event data
   */
  async handleEvent(handle, data) {
    throw new Error("handleEvent must be implemented");
  }

  /**
   * Get the handle this handler manages
   * @returns {Handle}
   */
  getHandle() {
    throw new Error("getHandle must be implemented");
  }
}

/**
 * Synchronous Event Demultiplexer
 * In JavaScript, this is simulated using event emitters and timers
 */
class Demultiplexer extends EventEmitter {
  constructor() {
    super();
    this.handles = new Map();
  }

  /**
   * Register a handle for monitoring
   * @param {Handle} handle
   * @param {string} eventType
   */
  registerHandle(handle, eventType) {
    if (!this.handles.has(eventType)) {
      this.handles.set(eventType, new Set());
    }
    this.handles.get(eventType).add(handle);
  }

  /**
   * Remove a handle from monitoring
   * @param {Handle} handle
   * @param {string} eventType
   */
  removeHandle(handle, eventType) {
    if (this.handles.has(eventType)) {
      this.handles.get(eventType).delete(handle);
    }
  }

  /**
   * Simulate event occurrence
   * @param {string} eventType
   * @param {Handle} handle
   * @param {*} data
   */
  triggerEvent(eventType, handle, data) {
    this.emit('event', { type: eventType, handle, data });
  }
}

/**
 * Initiation Dispatcher (Reactor)
 * Manages event handlers and dispatches events
 */
class Reactor {
  constructor() {
    this.demultiplexer = new Demultiplexer();
    this.handlers = new Map();
    this.running = false;

    // Listen for events from demultiplexer
    this.demultiplexer.on('event', async (event) => {
      await this.dispatch(event);
    });
  }

  /**
   * Register an event handler
   * @param {EventHandler} handler
   * @param {string} eventType
   */
  registerHandler(handler, eventType) {
    const handle = handler.getHandle();

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Map());
    }

    this.handlers.get(eventType).set(handle.id, handler);
    this.demultiplexer.registerHandle(handle, eventType);

    console.log(`Registered handler for ${eventType} on handle ${handle.id}`);
  }

  /**
   * Remove an event handler
   * @param {EventHandler} handler
   * @param {string} eventType
   */
  removeHandler(handler, eventType) {
    const handle = handler.getHandle();

    if (this.handlers.has(eventType)) {
      this.handlers.get(eventType).delete(handle.id);
    }

    this.demultiplexer.removeHandle(handle, eventType);
    console.log(`Removed handler for ${eventType} on handle ${handle.id}`);
  }

  /**
   * Dispatch an event to its handler
   * @param {Object} event
   */
  async dispatch(event) {
    const { type, handle, data } = event;

    if (this.handlers.has(type)) {
      const handler = this.handlers.get(type).get(handle.id);
      if (handler) {
        try {
          await handler.handleEvent(handle, data);
        } catch (error) {
          console.error(`Error handling event ${type} on handle ${handle.id}:`, error);
        }
      }
    }
  }

  /**
   * Start the event loop
   */
  handleEvents() {
    this.running = true;
    console.log('Reactor event loop started');
  }

  /**
   * Stop the event loop
   */
  stop() {
    this.running = false;
    console.log('Reactor event loop stopped');
  }

  /**
   * Trigger an event externally
   * @param {string} eventType
   * @param {Handle} handle
   * @param {*} data
   */
  triggerEvent(eventType, handle, data) {
    this.demultiplexer.triggerEvent(eventType, handle, data);
  }
}

/**
 * Concrete Event Handler: HTTP Request Handler
 */
class HTTPRequestHandler extends EventHandler {
  constructor(id) {
    super();
    this.handle = new Handle(id, 'http');
  }

  getHandle() {
    return this.handle;
  }

  async handleEvent(handle, data) {
    console.log(`\n[HTTP Handler ${handle.id}] Processing request`);
    console.log(`  Method: ${data.method}`);
    console.log(`  Path: ${data.path}`);

    // Simulate request processing
    await this.processRequest(data);

    console.log(`[HTTP Handler ${handle.id}] Request completed`);
  }

  async processRequest(data) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`  Response: 200 OK`);
        resolve();
      }, 100);
    });
  }
}

/**
 * Concrete Event Handler: Timer Event Handler
 */
class TimerHandler extends EventHandler {
  constructor(id, callback) {
    super();
    this.handle = new Handle(id, 'timer');
    this.callback = callback;
  }

  getHandle() {
    return this.handle;
  }

  async handleEvent(handle, data) {
    console.log(`\n[Timer Handler ${handle.id}] Timer expired at ${new Date().toISOString()}`);
    if (this.callback) {
      await this.callback(data);
    }
  }
}

/**
 * Concrete Event Handler: Network I/O Handler
 */
class NetworkIOHandler extends EventHandler {
  constructor(id) {
    super();
    this.handle = new Handle(id, 'network');
    this.buffer = [];
  }

  getHandle() {
    return this.handle;
  }

  async handleEvent(handle, data) {
    console.log(`\n[Network Handler ${handle.id}] Data received`);
    console.log(`  Bytes: ${data.length}`);
    console.log(`  Content: ${data.substring(0, 50)}...`);

    this.buffer.push(data);
    await this.processBuffer();
  }

  async processBuffer() {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`  Buffer size: ${this.buffer.length} messages`);
        resolve();
      }, 50);
    });
  }
}

/**
 * Example: Web Server using Reactor Pattern
 */
class WebServer {
  constructor(port) {
    this.port = port;
    this.reactor = new Reactor();
    this.requestCount = 0;
  }

  start() {
    console.log(`\n=== Starting Web Server on port ${this.port} ===`);

    // Register multiple request handlers
    for (let i = 1; i <= 3; i++) {
      const handler = new HTTPRequestHandler(i);
      this.reactor.registerHandler(handler, 'http');
    }

    this.reactor.handleEvents();
    console.log('Server is ready to accept connections\n');
  }

  simulateRequest(method, path) {
    const handlerId = (this.requestCount++ % 3) + 1;
    const handle = new Handle(handlerId, 'http');

    this.reactor.triggerEvent('http', handle, {
      method,
      path,
      timestamp: Date.now()
    });
  }

  stop() {
    this.reactor.stop();
  }
}

/**
 * Example: Real-time Event Processing System
 */
class EventProcessingSystem {
  constructor() {
    this.reactor = new Reactor();
    this.timers = new Map();
  }

  start() {
    console.log('\n=== Starting Event Processing System ===');
    this.reactor.handleEvents();
  }

  scheduleTimer(id, interval, callback) {
    const handler = new TimerHandler(id, callback);
    this.reactor.registerHandler(handler, 'timer');

    const timerId = setInterval(() => {
      const handle = handler.getHandle();
      this.reactor.triggerEvent('timer', handle, { interval });
    }, interval);

    this.timers.set(id, timerId);
    console.log(`Scheduled timer ${id} with interval ${interval}ms`);
  }

  cancelTimer(id) {
    if (this.timers.has(id)) {
      clearInterval(this.timers.get(id));
      this.timers.delete(id);
      console.log(`Cancelled timer ${id}`);
    }
  }

  stop() {
    this.timers.forEach(timerId => clearInterval(timerId));
    this.timers.clear();
    this.reactor.stop();
  }
}

// ============================================================================
// Usage Examples
// ============================================================================

async function demonstrateReactorPattern() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           Reactor Pattern - Comprehensive Examples            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  // Example 1: Basic Reactor with single handler
  console.log('\n--- Example 1: Basic Reactor Setup ---');
  const reactor = new Reactor();
  const handler1 = new HTTPRequestHandler(1);
  reactor.registerHandler(handler1, 'http');
  reactor.handleEvents();

  const handle1 = handler1.getHandle();
  reactor.triggerEvent('http', handle1, { method: 'GET', path: '/api/users' });

  await sleep(200);

  // Example 2: Web Server with multiple handlers
  console.log('\n--- Example 2: Web Server with Load Distribution ---');
  const server = new WebServer(8080);
  server.start();

  // Simulate incoming requests
  server.simulateRequest('GET', '/api/users/1');
  await sleep(50);
  server.simulateRequest('POST', '/api/users');
  await sleep(50);
  server.simulateRequest('PUT', '/api/users/2');
  await sleep(50);
  server.simulateRequest('DELETE', '/api/users/3');

  await sleep(200);
  server.stop();

  // Example 3: Timer-based events
  console.log('\n--- Example 3: Timer Event Handling ---');
  const eventSystem = new EventProcessingSystem();
  eventSystem.start();

  eventSystem.scheduleTimer(1, 200, async (data) => {
    console.log('  Executing periodic task...');
  });

  await sleep(650);
  eventSystem.cancelTimer(1);
  eventSystem.stop();

  // Example 4: Network I/O handling
  console.log('\n--- Example 4: Network I/O Event Handling ---');
  const ioReactor = new Reactor();
  const networkHandler = new NetworkIOHandler(1);
  ioReactor.registerHandler(networkHandler, 'network');
  ioReactor.handleEvents();

  const networkHandle = networkHandler.getHandle();
  ioReactor.triggerEvent('network', networkHandle, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...');
  await sleep(100);
  ioReactor.triggerEvent('network', networkHandle, 'Second chunk of network data received...');

  await sleep(200);

  // Example 5: Multiple event types
  console.log('\n--- Example 5: Multiple Event Types ---');
  const multiReactor = new Reactor();

  const httpHandler = new HTTPRequestHandler(10);
  const timerHandler = new TimerHandler(20, async () => {
    console.log('  Heartbeat check completed');
  });
  const ioHandler = new NetworkIOHandler(30);

  multiReactor.registerHandler(httpHandler, 'http');
  multiReactor.registerHandler(timerHandler, 'timer');
  multiReactor.registerHandler(ioHandler, 'network');
  multiReactor.handleEvents();

  multiReactor.triggerEvent('http', httpHandler.getHandle(), { method: 'GET', path: '/health' });
  await sleep(50);
  multiReactor.triggerEvent('timer', timerHandler.getHandle(), {});
  await sleep(50);
  multiReactor.triggerEvent('network', ioHandler.getHandle(), 'Network packet data');

  await sleep(200);
  multiReactor.stop();

  console.log('\n--- Pattern Benefits ---');
  console.log('✓ Separation of concerns between event detection and handling');
  console.log('✓ Single-threaded concurrency without explicit synchronization');
  console.log('✓ Scalable event handling for multiple sources');
  console.log('✓ Decoupled event producers and consumers');
}

/**
 * Helper function for delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run demonstrations
if (require.main === module) {
  demonstrateReactorPattern().catch(console.error);
}

module.exports = {
  Reactor,
  EventHandler,
  HTTPRequestHandler,
  TimerHandler,
  NetworkIOHandler,
  Handle,
  Demultiplexer,
  WebServer,
  EventProcessingSystem
};
