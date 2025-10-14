/**
 * Leader/Followers Pattern Implementation in JavaScript
 *
 * The Leader/Followers pattern provides an efficient concurrency model where
 * multiple threads take turns sharing a set of event sources to detect, demultiplex,
 * dispatch, and process service requests that occur on the event sources.
 *
 * Key Components:
 * - Thread Pool: A set of threads that process events
 * - Leader Thread: The thread waiting for events
 * - Follower Threads: Threads waiting to become leader
 * - Event Handler: Processes events when they occur
 * - Handle Set: Collection of event sources being monitored
 */

const EventEmitter = require('events');

/**
 * Event - Represents an event to be processed
 */
class Event {
  constructor(id, type, data, source = null) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.source = source;
    this.timestamp = Date.now();
    this.processedBy = null;
    this.processingTime = null;
  }

  markProcessed(threadId, processingTime) {
    this.processedBy = threadId;
    this.processingTime = processingTime;
  }

  toString() {
    return `Event[${this.id}:${this.type}]`;
  }
}

/**
 * Handle Set - Manages event sources
 */
class HandleSet extends EventEmitter {
  constructor() {
    super();
    this.handles = new Map();
    this.eventQueue = [];
  }

  registerHandle(handleId, eventTypes) {
    this.handles.set(handleId, { handleId, eventTypes: new Set(eventTypes) });
  }

  unregisterHandle(handleId) {
    this.handles.delete(handleId);
  }

  async waitForEvent(timeout = null) {
    if (this.eventQueue.length > 0) {
      return this.eventQueue.shift();
    }

    return new Promise((resolve, reject) => {
      const handler = (event) => {
        resolve(event);
      };

      this.once('event', handler);

      if (timeout) {
        setTimeout(() => {
          this.removeListener('event', handler);
          reject(new Error('Event wait timeout'));
        }, timeout);
      }
    });
  }

  dispatchEvent(event) {
    this.eventQueue.push(event);
    this.emit('event', event);
  }

  hasEvents() {
    return this.eventQueue.length > 0;
  }
}

/**
 * Thread State - Represents the state of a thread in the pool
 */
const ThreadState = {
  LEADER: 'leader',
  FOLLOWER: 'follower',
  PROCESSING: 'processing',
  IDLE: 'idle'
};

/**
 * Worker Thread - Represents a thread in the Leader/Followers pool
 */
class WorkerThread extends EventEmitter {
  constructor(id, threadSet) {
    super();
    this.id = id;
    this.threadSet = threadSet;
    this.state = ThreadState.IDLE;
    this.active = false;
    this.processedCount = 0;
    this.currentEvent = null;
  }

  async run() {
    this.active = true;

    while (this.active) {
      try {
        await this.threadSet.promoteToLeader(this);

        const event = await this.threadSet.handleSet.waitForEvent(100);

        await this.threadSet.promoteNewLeader();

        this.state = ThreadState.PROCESSING;
        this.currentEvent = event;

        await this.processEvent(event);

        this.currentEvent = null;
        this.processedCount++;
        this.state = ThreadState.FOLLOWER;

        await this.threadSet.joinFollowerSet(this);
      } catch (error) {
        if (error.message !== 'Event wait timeout') {
          console.error(`[Thread-${this.id}] Error:`, error);
        }

        if (this.state === ThreadState.LEADER) {
          await this.threadSet.promoteNewLeader();
        }
      }
    }

    this.state = ThreadState.IDLE;
  }

  async processEvent(event) {
    const startTime = Date.now();

    const handler = this.threadSet.getEventHandler(event.type);
    if (handler) {
      console.log(`[Thread-${this.id}] Processing ${event}`);
      await handler(event, this.id);
    }

    const processingTime = Date.now() - startTime;
    event.markProcessed(this.id, processingTime);
  }

  stop() {
    this.active = false;
  }

  getStats() {
    return {
      id: this.id,
      state: this.state,
      processedCount: this.processedCount,
      active: this.active
    };
  }
}

/**
 * Thread Set - Manages the pool of leader and follower threads
 */
class ThreadSet {
  constructor(handleSet, threadCount = 4) {
    this.handleSet = handleSet;
    this.threadCount = threadCount;
    this.threads = [];
    this.followerQueue = [];
    this.leader = null;
    this.eventHandlers = new Map();
    this.promotionLock = Promise.resolve();
    this.running = false;
  }

  registerEventHandler(eventType, handler) {
    this.eventHandlers.set(eventType, handler);
  }

  getEventHandler(eventType) {
    return this.eventHandlers.get(eventType);
  }

  async start() {
    this.running = true;

    for (let i = 0; i < this.threadCount; i++) {
      const thread = new WorkerThread(i, this);
      this.threads.push(thread);
      this.followerQueue.push(thread);
      thread.run();
    }

    console.log(`Thread set started with ${this.threadCount} threads`);
  }

  async stop() {
    this.running = false;

    for (const thread of this.threads) {
      thread.stop();
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('Thread set stopped');
  }

  async promoteToLeader(thread) {
    this.promotionLock = this.promotionLock.then(async () => {
      while (this.leader !== null && this.leader !== thread) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      if (this.leader === null) {
        this.leader = thread;
        thread.state = ThreadState.LEADER;
        console.log(`[Thread-${thread.id}] Promoted to LEADER`);
      }
    });

    await this.promotionLock;
  }

  async promoteNewLeader() {
    this.promotionLock = this.promotionLock.then(async () => {
      this.leader = null;

      if (this.followerQueue.length > 0) {
        const newLeader = this.followerQueue.shift();
        this.leader = newLeader;
        newLeader.state = ThreadState.LEADER;
        console.log(`[Thread-${newLeader.id}] Promoted to LEADER`);
      }
    });

    await this.promotionLock;
  }

  async joinFollowerSet(thread) {
    if (!this.followerQueue.includes(thread)) {
      this.followerQueue.push(thread);
      thread.state = ThreadState.FOLLOWER;
    }
  }

  getStats() {
    return {
      threadCount: this.threadCount,
      leader: this.leader ? this.leader.id : null,
      followers: this.followerQueue.length,
      threads: this.threads.map(t => t.getStats())
    };
  }

  getTotalProcessed() {
    return this.threads.reduce((sum, thread) => sum + thread.processedCount, 0);
  }
}

/**
 * Leader/Followers System - Main coordinator
 */
class LeaderFollowersSystem {
  constructor(name, threadCount = 4) {
    this.name = name;
    this.handleSet = new HandleSet();
    this.threadSet = new ThreadSet(this.handleSet, threadCount);
    this.eventIdCounter = 0;
  }

  registerHandle(handleId, eventTypes) {
    this.handleSet.registerHandle(handleId, eventTypes);
  }

  registerEventHandler(eventType, handler) {
    this.threadSet.registerEventHandler(eventType, handler);
  }

  async start() {
    await this.threadSet.start();
    console.log(`[${this.name}] System started`);
  }

  async stop() {
    await this.threadSet.stop();
    console.log(`[${this.name}] System stopped`);
  }

  dispatchEvent(type, data, source = null) {
    const event = new Event(`evt-${++this.eventIdCounter}`, type, data, source);
    this.handleSet.dispatchEvent(event);
    return event;
  }

  getStats() {
    return {
      name: this.name,
      totalProcessed: this.threadSet.getTotalProcessed(),
      threadSet: this.threadSet.getStats()
    };
  }
}

/**
 * Example Applications
 */

class WebServerExample {
  constructor(threadCount = 4) {
    this.system = new LeaderFollowersSystem('WebServer', threadCount);
    this.requestCount = 0;
    this.setupHandlers();
  }

  setupHandlers() {
    this.system.registerHandle('http-socket', ['http-request']);

    this.system.registerEventHandler('http-request', async (event, threadId) => {
      const { method, url, body } = event.data;

      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

      console.log(`  [Thread-${threadId}] Handled ${method} ${url} (${event.processingTime}ms)`);
    });
  }

  async start() {
    await this.system.start();
  }

  async stop() {
    await this.system.stop();
  }

  async handleRequest(method, url, body = null) {
    this.requestCount++;
    this.system.dispatchEvent('http-request', { method, url, body }, 'http-socket');
  }

  getStats() {
    return this.system.getStats();
  }
}

class NetworkServerExample {
  constructor(threadCount = 3) {
    this.system = new LeaderFollowersSystem('NetworkServer', threadCount);
    this.connectionCount = 0;
    this.setupHandlers();
  }

  setupHandlers() {
    this.system.registerHandle('tcp-socket', ['connection', 'data', 'close']);

    this.system.registerEventHandler('connection', async (event, threadId) => {
      const { clientId } = event.data;
      console.log(`  [Thread-${threadId}] New connection from ${clientId}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    this.system.registerEventHandler('data', async (event, threadId) => {
      const { clientId, data } = event.data;
      console.log(`  [Thread-${threadId}] Data from ${clientId}: ${data}`);
      await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 120));
    });

    this.system.registerEventHandler('close', async (event, threadId) => {
      const { clientId } = event.data;
      console.log(`  [Thread-${threadId}] Connection closed: ${clientId}`);
      await new Promise(resolve => setTimeout(resolve, 30));
    });
  }

  async start() {
    await this.system.start();
  }

  async stop() {
    await this.system.stop();
  }

  async acceptConnection(clientId) {
    this.connectionCount++;
    this.system.dispatchEvent('connection', { clientId }, 'tcp-socket');
  }

  async receiveData(clientId, data) {
    this.system.dispatchEvent('data', { clientId, data }, 'tcp-socket');
  }

  async closeConnection(clientId) {
    this.system.dispatchEvent('close', { clientId }, 'tcp-socket');
  }

  getStats() {
    return this.system.getStats();
  }
}

class EventProcessorExample {
  constructor(threadCount = 5) {
    this.system = new LeaderFollowersSystem('EventProcessor', threadCount);
    this.eventCount = 0;
    this.setupHandlers();
  }

  setupHandlers() {
    this.system.registerHandle('event-source', ['task', 'notification', 'alert']);

    this.system.registerEventHandler('task', async (event, threadId) => {
      const { taskId, action } = event.data;
      console.log(`  [Thread-${threadId}] Executing task ${taskId}: ${action}`);
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 150));
    });

    this.system.registerEventHandler('notification', async (event, threadId) => {
      const { recipient, message } = event.data;
      console.log(`  [Thread-${threadId}] Sending notification to ${recipient}`);
      await new Promise(resolve => setTimeout(resolve, 60));
    });

    this.system.registerEventHandler('alert', async (event, threadId) => {
      const { severity, message } = event.data;
      console.log(`  [Thread-${threadId}] Alert [${severity}]: ${message}`);
      await new Promise(resolve => setTimeout(resolve, 40));
    });
  }

  async start() {
    await this.system.start();
  }

  async stop() {
    await this.system.stop();
  }

  async submitTask(taskId, action) {
    this.eventCount++;
    this.system.dispatchEvent('task', { taskId, action }, 'event-source');
  }

  async sendNotification(recipient, message) {
    this.eventCount++;
    this.system.dispatchEvent('notification', { recipient, message }, 'event-source');
  }

  async raiseAlert(severity, message) {
    this.eventCount++;
    this.system.dispatchEvent('alert', { severity, message }, 'event-source');
  }

  getStats() {
    return this.system.getStats();
  }
}

class MessageQueueExample {
  constructor(threadCount = 4) {
    this.system = new LeaderFollowersSystem('MessageQueue', threadCount);
    this.messageCount = 0;
    this.setupHandlers();
  }

  setupHandlers() {
    this.system.registerHandle('queue', ['message']);

    this.system.registerEventHandler('message', async (event, threadId) => {
      const { messageId, topic, payload } = event.data;
      console.log(`  [Thread-${threadId}] Processing message ${messageId} on topic ${topic}`);
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      console.log(`  [Thread-${threadId}] Message ${messageId} delivered`);
    });
  }

  async start() {
    await this.system.start();
  }

  async stop() {
    await this.system.stop();
  }

  async publish(topic, payload) {
    this.messageCount++;
    this.system.dispatchEvent('message', {
      messageId: this.messageCount,
      topic,
      payload
    }, 'queue');
  }

  getStats() {
    return this.system.getStats();
  }
}

/**
 * Example Usage and Demonstrations
 */

async function demonstrateWebServer() {
  console.log('\n=== Web Server Leader/Followers Demo ===\n');

  const server = new WebServerExample(3);
  await server.start();

  await new Promise(resolve => setTimeout(resolve, 100));

  const requests = [
    { method: 'GET', url: '/api/users' },
    { method: 'POST', url: '/api/users' },
    { method: 'GET', url: '/api/posts/1' },
    { method: 'PUT', url: '/api/posts/1' },
    { method: 'DELETE', url: '/api/users/5' },
    { method: 'GET', url: '/api/comments' }
  ];

  for (const req of requests) {
    await server.handleRequest(req.method, req.url);
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('\nWeb Server Stats:', JSON.stringify(server.getStats(), null, 2));

  await server.stop();
}

async function demonstrateNetworkServer() {
  console.log('\n=== Network Server Leader/Followers Demo ===\n');

  const server = new NetworkServerExample(3);
  await server.start();

  await new Promise(resolve => setTimeout(resolve, 100));

  await server.acceptConnection('client-1');
  await new Promise(resolve => setTimeout(resolve, 100));

  await server.acceptConnection('client-2');
  await new Promise(resolve => setTimeout(resolve, 100));

  await server.receiveData('client-1', 'Hello Server');
  await server.receiveData('client-2', 'Greetings');
  await new Promise(resolve => setTimeout(resolve, 200));

  await server.closeConnection('client-1');
  await new Promise(resolve => setTimeout(resolve, 100));

  await server.closeConnection('client-2');

  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('\nNetwork Server Stats:', JSON.stringify(server.getStats(), null, 2));

  await server.stop();
}

async function demonstrateEventProcessor() {
  console.log('\n=== Event Processor Leader/Followers Demo ===\n');

  const processor = new EventProcessorExample(4);
  await processor.start();

  await new Promise(resolve => setTimeout(resolve, 100));

  await processor.submitTask('task-1', 'process-data');
  await processor.submitTask('task-2', 'generate-report');
  await processor.sendNotification('user@example.com', 'Report ready');
  await processor.raiseAlert('high', 'System memory at 90%');
  await processor.submitTask('task-3', 'cleanup');
  await processor.sendNotification('admin@example.com', 'Task completed');

  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('\nEvent Processor Stats:', JSON.stringify(processor.getStats(), null, 2));

  await processor.stop();
}

async function demonstrateMessageQueue() {
  console.log('\n=== Message Queue Leader/Followers Demo ===\n');

  const queue = new MessageQueueExample(3);
  await queue.start();

  await new Promise(resolve => setTimeout(resolve, 100));

  await queue.publish('orders', { orderId: 101, total: 99.99 });
  await queue.publish('users', { userId: 42, action: 'login' });
  await queue.publish('notifications', { type: 'email', recipient: 'user@example.com' });
  await queue.publish('orders', { orderId: 102, total: 149.99 });
  await queue.publish('analytics', { event: 'page-view', page: '/home' });

  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('\nMessage Queue Stats:', JSON.stringify(queue.getStats(), null, 2));

  await queue.stop();
}

async function demonstrateHighConcurrency() {
  console.log('\n=== High Concurrency Demo ===\n');

  const server = new WebServerExample(5);
  await server.start();

  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('Simulating 15 concurrent requests...');

  for (let i = 0; i < 15; i++) {
    server.handleRequest('GET', `/api/resource/${i}`);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\nHigh Concurrency Stats:', JSON.stringify(server.getStats(), null, 2));

  await server.stop();
}

async function runAllDemos() {
  await demonstrateWebServer();
  await demonstrateNetworkServer();
  await demonstrateEventProcessor();
  await demonstrateMessageQueue();
  await demonstrateHighConcurrency();
}

if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  LeaderFollowersSystem,
  ThreadSet,
  WorkerThread,
  HandleSet,
  Event,
  ThreadState,
  WebServerExample,
  NetworkServerExample,
  EventProcessorExample,
  MessageQueueExample
};
