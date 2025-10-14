/**
 * Reactor Pattern Implementation in JavaScript
 *
 * The Reactor pattern handles service requests delivered concurrently to an application
 * by one or more clients. It demultiplexes incoming requests and dispatches them
 * synchronously to the associated request handlers.
 *
 * Key Components:
 * - Handle: Identifies resources managed by the OS
 * - Event Demultiplexer: Waits for events to occur on a set of handles
 * - Event Handler: Defines the interface for handling events
 * - Concrete Event Handler: Implements the event handling logic
 * - Reactor: Defines the interface for registering, removing, and dispatching events
 */

const EventEmitter = require('events');

/**
 * Handle - Represents a resource identifier
 */
class Handle {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.timestamp = Date.now();
  }

  toString() {
    return `Handle[${this.type}:${this.id}]`;
  }
}

/**
 * Event Types
 */
const EventType = {
  READ: 'read',
  WRITE: 'write',
  ACCEPT: 'accept',
  CONNECT: 'connect',
  TIMEOUT: 'timeout',
  CLOSE: 'close'
};

/**
 * Event - Represents an event that occurred on a handle
 */
class Event {
  constructor(handle, type, data = null) {
    this.handle = handle;
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();
  }

  toString() {
    return `Event[${this.type} on ${this.handle}]`;
  }
}

/**
 * Event Handler Interface
 */
class EventHandler {
  constructor(handle) {
    this.handle = handle;
  }

  async handleEvent(event) {
    throw new Error('handleEvent must be implemented by subclass');
  }

  getHandle() {
    return this.handle;
  }
}

/**
 * Event Demultiplexer - Waits for events on registered handles
 */
class EventDemultiplexer extends EventEmitter {
  constructor() {
    super();
    this.handles = new Map();
    this.running = false;
  }

  register(handle, eventTypes) {
    if (!this.handles.has(handle.id)) {
      this.handles.set(handle.id, { handle, eventTypes: new Set(eventTypes) });
    } else {
      const entry = this.handles.get(handle.id);
      eventTypes.forEach(type => entry.eventTypes.add(type));
    }
  }

  unregister(handle) {
    this.handles.delete(handle.id);
  }

  async select(timeout = 1000) {
    return new Promise((resolve) => {
      const events = [];
      const timeoutId = setTimeout(() => {
        resolve(events);
      }, timeout);

      this.once('event', (event) => {
        clearTimeout(timeoutId);
        events.push(event);
        resolve(events);
      });
    });
  }

  dispatchEvent(event) {
    this.emit('event', event);
  }

  isRegistered(handle) {
    return this.handles.has(handle.id);
  }
}

/**
 * Reactor - Main event loop that dispatches events to handlers
 */
class Reactor {
  constructor() {
    this.demultiplexer = new EventDemultiplexer();
    this.handlers = new Map();
    this.running = false;
    this.eventQueue = [];
  }

  registerHandler(handler, eventTypes) {
    const handle = handler.getHandle();
    this.handlers.set(handle.id, { handler, eventTypes: new Set(eventTypes) });
    this.demultiplexer.register(handle, eventTypes);
  }

  removeHandler(handler) {
    const handle = handler.getHandle();
    this.handlers.delete(handle.id);
    this.demultiplexer.unregister(handle);
  }

  async handleEvents(timeout = 1000) {
    const events = await this.demultiplexer.select(timeout);

    for (const event of events) {
      const entry = this.handlers.get(event.handle.id);
      if (entry && entry.eventTypes.has(event.type)) {
        try {
          await entry.handler.handleEvent(event);
        } catch (error) {
          console.error(`Error handling event ${event}:`, error);
        }
      }
    }

    return events.length;
  }

  async run() {
    this.running = true;
    console.log('Reactor started');

    while (this.running) {
      await this.handleEvents();
    }

    console.log('Reactor stopped');
  }

  stop() {
    this.running = false;
  }

  simulateEvent(handle, eventType, data) {
    const event = new Event(handle, eventType, data);
    this.demultiplexer.dispatchEvent(event);
  }
}

/**
 * Concrete Event Handlers
 */

class ConnectionHandler extends EventHandler {
  constructor(handle, name) {
    super(handle);
    this.name = name;
    this.connected = false;
  }

  async handleEvent(event) {
    switch (event.type) {
      case EventType.ACCEPT:
        console.log(`[${this.name}] Accepting connection from ${event.data}`);
        this.connected = true;
        break;
      case EventType.CONNECT:
        console.log(`[${this.name}] Connected to ${event.data}`);
        this.connected = true;
        break;
      case EventType.CLOSE:
        console.log(`[${this.name}] Connection closed`);
        this.connected = false;
        break;
      default:
        console.log(`[${this.name}] Unhandled event: ${event.type}`);
    }
  }
}

class DataHandler extends EventHandler {
  constructor(handle, name) {
    super(handle);
    this.name = name;
    this.buffer = [];
  }

  async handleEvent(event) {
    switch (event.type) {
      case EventType.READ:
        console.log(`[${this.name}] Reading data: ${event.data}`);
        this.buffer.push(event.data);
        await this.processData(event.data);
        break;
      case EventType.WRITE:
        console.log(`[${this.name}] Writing data: ${event.data}`);
        break;
      default:
        console.log(`[${this.name}] Unhandled event: ${event.type}`);
    }
  }

  async processData(data) {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`[${this.name}] Processed: ${data}`);
  }
}

class TimerHandler extends EventHandler {
  constructor(handle, name, interval) {
    super(handle);
    this.name = name;
    this.interval = interval;
    this.count = 0;
  }

  async handleEvent(event) {
    if (event.type === EventType.TIMEOUT) {
      this.count++;
      console.log(`[${this.name}] Timer fired (${this.count}): ${event.data}`);
    }
  }
}

/**
 * HTTP Request Handler Example
 */
class HttpRequestHandler extends EventHandler {
  constructor(handle, name) {
    super(handle);
    this.name = name;
    this.requests = [];
  }

  async handleEvent(event) {
    if (event.type === EventType.READ) {
      const request = this.parseRequest(event.data);
      this.requests.push(request);
      console.log(`[${this.name}] Received ${request.method} ${request.path}`);

      await this.processRequest(request);
    }
  }

  parseRequest(data) {
    const lines = data.split('\n');
    const [method, path] = lines[0].split(' ');
    return { method, path, data };
  }

  async processRequest(request) {
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(`[${this.name}] Processed request: ${request.path}`);
  }
}

/**
 * Example Usage and Demonstrations
 */

async function demonstrateBasicReactor() {
  console.log('\n=== Basic Reactor Pattern Demo ===\n');

  const reactor = new Reactor();

  const handle1 = new Handle('conn-1', 'connection');
  const handler1 = new ConnectionHandler(handle1, 'ConnectionHandler-1');
  reactor.registerHandler(handler1, [EventType.ACCEPT, EventType.CLOSE]);

  const handle2 = new Handle('data-1', 'data');
  const handler2 = new DataHandler(handle2, 'DataHandler-1');
  reactor.registerHandler(handler2, [EventType.READ, EventType.WRITE]);

  setTimeout(() => reactor.simulateEvent(handle1, EventType.ACCEPT, 'client-192.168.1.1'), 100);
  setTimeout(() => reactor.simulateEvent(handle2, EventType.READ, 'Hello World'), 200);
  setTimeout(() => reactor.simulateEvent(handle2, EventType.WRITE, 'Response Data'), 300);
  setTimeout(() => reactor.simulateEvent(handle1, EventType.CLOSE, null), 400);
  setTimeout(() => reactor.stop(), 500);

  await reactor.run();
}

async function demonstrateMultipleHandlers() {
  console.log('\n=== Multiple Handlers Demo ===\n');

  const reactor = new Reactor();

  const handlers = [];
  for (let i = 0; i < 3; i++) {
    const handle = new Handle(`data-${i}`, 'data');
    const handler = new DataHandler(handle, `DataHandler-${i}`);
    reactor.registerHandler(handler, [EventType.READ]);
    handlers.push({ handle, handler });
  }

  for (let i = 0; i < 3; i++) {
    const delay = (i + 1) * 100;
    setTimeout(() => {
      reactor.simulateEvent(handlers[i].handle, EventType.READ, `Message ${i}`);
    }, delay);
  }

  setTimeout(() => reactor.stop(), 500);

  await reactor.run();
}

async function demonstrateTimerEvents() {
  console.log('\n=== Timer Events Demo ===\n');

  const reactor = new Reactor();

  const timerHandle = new Handle('timer-1', 'timer');
  const timerHandler = new TimerHandler(timerHandle, 'Timer-1', 1000);
  reactor.registerHandler(timerHandler, [EventType.TIMEOUT]);

  const intervals = [100, 200, 300, 400];
  intervals.forEach((delay, i) => {
    setTimeout(() => {
      reactor.simulateEvent(timerHandle, EventType.TIMEOUT, new Date().toISOString());
    }, delay);
  });

  setTimeout(() => reactor.stop(), 500);

  await reactor.run();
}

async function demonstrateHttpServer() {
  console.log('\n=== HTTP Server Simulation Demo ===\n');

  const reactor = new Reactor();

  const serverHandle = new Handle('http-server', 'http');
  const serverHandler = new HttpRequestHandler(serverHandle, 'HttpServer');
  reactor.registerHandler(serverHandler, [EventType.READ]);

  const requests = [
    'GET /api/users HTTP/1.1\nHost: localhost',
    'POST /api/data HTTP/1.1\nHost: localhost',
    'GET /api/status HTTP/1.1\nHost: localhost',
    'DELETE /api/users/1 HTTP/1.1\nHost: localhost'
  ];

  requests.forEach((request, i) => {
    setTimeout(() => {
      reactor.simulateEvent(serverHandle, EventType.READ, request);
    }, (i + 1) * 100);
  });

  setTimeout(() => reactor.stop(), 600);

  await reactor.run();
}

async function demonstrateHandlerRegistration() {
  console.log('\n=== Dynamic Handler Registration Demo ===\n');

  const reactor = new Reactor();

  const handle1 = new Handle('dynamic-1', 'connection');
  const handler1 = new ConnectionHandler(handle1, 'DynamicHandler-1');

  console.log('Registering handler 1...');
  reactor.registerHandler(handler1, [EventType.ACCEPT]);

  setTimeout(() => reactor.simulateEvent(handle1, EventType.ACCEPT, 'client-1'), 100);

  setTimeout(() => {
    console.log('Removing handler 1...');
    reactor.removeHandler(handler1);
  }, 200);

  setTimeout(() => {
    console.log('Attempting to trigger removed handler (should not respond)...');
    reactor.simulateEvent(handle1, EventType.ACCEPT, 'client-2');
  }, 300);

  setTimeout(() => reactor.stop(), 400);

  await reactor.run();
}

async function runAllDemos() {
  await demonstrateBasicReactor();
  await demonstrateMultipleHandlers();
  await demonstrateTimerEvents();
  await demonstrateHttpServer();
  await demonstrateHandlerRegistration();
}

if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  Reactor,
  EventHandler,
  EventDemultiplexer,
  Handle,
  Event,
  EventType,
  ConnectionHandler,
  DataHandler,
  TimerHandler,
  HttpRequestHandler
};
