/**
 * Half-Sync/Half-Async Pattern Implementation in JavaScript
 *
 * The Half-Sync/Half-Async pattern decouples asynchronous and synchronous service
 * processing in concurrent systems, to simplify programming without unduly reducing
 * performance. It introduces two intercommunicating layers: one for async and one
 * for sync service processing.
 *
 * Key Components:
 * - Async Layer: Handles I/O operations asynchronously
 * - Sync Layer: Processes requests synchronously in separate threads
 * - Queueing Layer: Mediates communication between async and sync layers
 * - External Event Source: Generates events processed by the async layer
 */

const EventEmitter = require('events');
const { Worker } = require('worker_threads');

/**
 * Message - Represents data passed between layers
 */
class Message {
  constructor(id, type, data, priority = 0) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.priority = priority;
    this.timestamp = Date.now();
    this.source = null;
    this.destination = null;
  }

  setSource(source) {
    this.source = source;
  }

  setDestination(destination) {
    this.destination = destination;
  }

  getAge() {
    return Date.now() - this.timestamp;
  }

  toString() {
    return `Message[${this.id}:${this.type}]`;
  }
}

/**
 * Queueing Layer - Mediates between async and sync layers
 */
class QueueingLayer extends EventEmitter {
  constructor(maxSize = Infinity) {
    super();
    this.queue = [];
    this.maxSize = maxSize;
    this.enqueueCount = 0;
    this.dequeueCount = 0;
    this.waiters = [];
  }

  async enqueue(message) {
    if (this.queue.length >= this.maxSize) {
      throw new Error('Queue is full');
    }

    this.queue.push(message);
    this.enqueueCount++;
    this.queue.sort((a, b) => b.priority - a.priority);

    this.emit('message-enqueued', message);

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

    const message = this.queue.shift();
    this.dequeueCount++;

    this.emit('message-dequeued', message);

    return message;
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

  getStats() {
    return {
      size: this.queue.length,
      enqueued: this.enqueueCount,
      dequeued: this.dequeueCount,
      waiters: this.waiters.length
    };
  }
}

/**
 * Async Layer - Handles asynchronous I/O operations
 */
class AsyncLayer extends EventEmitter {
  constructor(name, queueingLayer) {
    super();
    this.name = name;
    this.queueingLayer = queueingLayer;
    this.handlers = new Map();
    this.running = false;
    this.processedCount = 0;
  }

  registerHandler(eventType, handler) {
    this.handlers.set(eventType, handler);
  }

  async start() {
    this.running = true;
    console.log(`[${this.name}] Async layer started`);
  }

  async stop() {
    this.running = false;
    console.log(`[${this.name}] Async layer stopped`);
  }

  async handleExternalEvent(eventType, data) {
    if (!this.running) {
      throw new Error('Async layer not running');
    }

    const handler = this.handlers.get(eventType);
    if (handler) {
      try {
        const message = await handler(data);
        if (message) {
          await this.queueingLayer.enqueue(message);
          this.processedCount++;
        }
      } catch (error) {
        console.error(`[${this.name}] Error handling ${eventType}:`, error);
      }
    }
  }

  getProcessedCount() {
    return this.processedCount;
  }
}

/**
 * Sync Layer - Processes messages synchronously
 */
class SyncLayer extends EventEmitter {
  constructor(name, queueingLayer, workerCount = 2) {
    super();
    this.name = name;
    this.queueingLayer = queueingLayer;
    this.workerCount = workerCount;
    this.workers = [];
    this.running = false;
    this.processedCount = 0;
    this.messageHandlers = new Map();
  }

  registerMessageHandler(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
  }

  async start() {
    this.running = true;

    for (let i = 0; i < this.workerCount; i++) {
      const worker = this.createWorker(i);
      this.workers.push(worker);
      worker.run();
    }

    console.log(`[${this.name}] Sync layer started with ${this.workerCount} workers`);
  }

  async stop() {
    this.running = false;

    for (const worker of this.workers) {
      worker.stop();
    }

    console.log(`[${this.name}] Sync layer stopped`);
  }

  createWorker(id) {
    const self = this;

    return {
      id,
      active: false,
      processedCount: 0,

      async run() {
        this.active = true;

        while (self.running) {
          try {
            const message = await self.queueingLayer.dequeue(100);
            await this.processMessage(message);
          } catch (error) {
            if (error.message !== 'Dequeue timeout') {
              console.error(`[${self.name}] Worker ${id} error:`, error);
            }
          }
        }

        this.active = false;
      },

      async processMessage(message) {
        console.log(`[${self.name}] Worker ${id} processing ${message}`);

        const handler = self.messageHandlers.get(message.type);
        if (handler) {
          try {
            await handler(message);
            this.processedCount++;
            self.processedCount++;
          } catch (error) {
            console.error(`[${self.name}] Worker ${id} handler error:`, error);
          }
        } else {
          console.warn(`[${self.name}] No handler for message type: ${message.type}`);
        }
      },

      stop() {
        this.active = false;
      }
    };
  }

  getProcessedCount() {
    return this.processedCount;
  }

  getWorkerStats() {
    return this.workers.map(w => ({
      id: w.id,
      active: w.active,
      processed: w.processedCount
    }));
  }
}

/**
 * Half-Sync/Half-Async System - Coordinates all layers
 */
class HalfSyncHalfAsyncSystem {
  constructor(name, queueSize = 100, workerCount = 2) {
    this.name = name;
    this.queueingLayer = new QueueingLayer(queueSize);
    this.asyncLayer = new AsyncLayer(`${name}-Async`, this.queueingLayer);
    this.syncLayer = new SyncLayer(`${name}-Sync`, this.queueingLayer, workerCount);
    this.messageIdCounter = 0;
  }

  registerAsyncHandler(eventType, handler) {
    this.asyncLayer.registerHandler(eventType, handler);
  }

  registerSyncHandler(messageType, handler) {
    this.syncLayer.registerMessageHandler(messageType, handler);
  }

  async start() {
    await this.asyncLayer.start();
    await this.syncLayer.start();
    console.log(`[${this.name}] System started`);
  }

  async stop() {
    await this.asyncLayer.stop();

    while (!this.queueingLayer.isEmpty()) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    await this.syncLayer.stop();
    console.log(`[${this.name}] System stopped`);
  }

  async submitEvent(eventType, data) {
    await this.asyncLayer.handleExternalEvent(eventType, data);
  }

  createMessage(type, data, priority = 0) {
    const id = `msg-${++this.messageIdCounter}`;
    return new Message(id, type, data, priority);
  }

  getStats() {
    return {
      asyncProcessed: this.asyncLayer.getProcessedCount(),
      syncProcessed: this.syncLayer.getProcessedCount(),
      queue: this.queueingLayer.getStats(),
      workers: this.syncLayer.getWorkerStats()
    };
  }
}

/**
 * Example Use Cases
 */

class WebServerExample {
  constructor() {
    this.system = new HalfSyncHalfAsyncSystem('WebServer', 50, 3);
    this.requestCount = 0;
    this.setupHandlers();
  }

  setupHandlers() {
    this.system.registerAsyncHandler('http-request', async (data) => {
      this.requestCount++;
      console.log(`[WebServer] Received HTTP request: ${data.method} ${data.url}`);

      const message = this.system.createMessage('process-request', {
        requestId: this.requestCount,
        method: data.method,
        url: data.url,
        headers: data.headers || {}
      });

      return message;
    });

    this.system.registerSyncHandler('process-request', async (message) => {
      const { requestId, method, url } = message.data;

      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

      console.log(`[WebServer] Processed request ${requestId}: ${method} ${url}`);
    });
  }

  async start() {
    await this.system.start();
  }

  async stop() {
    await this.system.stop();
  }

  async handleRequest(method, url, headers = {}) {
    await this.system.submitEvent('http-request', { method, url, headers });
  }

  getStats() {
    return this.system.getStats();
  }
}

class DatabaseServerExample {
  constructor() {
    this.system = new HalfSyncHalfAsyncSystem('DatabaseServer', 100, 4);
    this.queryCount = 0;
    this.setupHandlers();
  }

  setupHandlers() {
    this.system.registerAsyncHandler('db-query', async (data) => {
      this.queryCount++;
      console.log(`[DatabaseServer] Received query: ${data.sql}`);

      const message = this.system.createMessage('execute-query', {
        queryId: this.queryCount,
        sql: data.sql,
        params: data.params || []
      }, data.priority || 0);

      return message;
    });

    this.system.registerSyncHandler('execute-query', async (message) => {
      const { queryId, sql } = message.data;

      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250));

      const rows = Math.floor(Math.random() * 100);
      console.log(`[DatabaseServer] Executed query ${queryId}: ${rows} rows affected`);
    });
  }

  async start() {
    await this.system.start();
  }

  async stop() {
    await this.system.stop();
  }

  async executeQuery(sql, params = [], priority = 0) {
    await this.system.submitEvent('db-query', { sql, params, priority });
  }

  getStats() {
    return this.system.getStats();
  }
}

class ImageProcessingExample {
  constructor() {
    this.system = new HalfSyncHalfAsyncSystem('ImageProcessor', 30, 2);
    this.imageCount = 0;
    this.setupHandlers();
  }

  setupHandlers() {
    this.system.registerAsyncHandler('image-upload', async (data) => {
      this.imageCount++;
      console.log(`[ImageProcessor] Image uploaded: ${data.filename}`);

      const message = this.system.createMessage('process-image', {
        imageId: this.imageCount,
        filename: data.filename,
        operations: data.operations || ['resize', 'compress']
      });

      return message;
    });

    this.system.registerSyncHandler('process-image', async (message) => {
      const { imageId, filename, operations } = message.data;

      console.log(`[ImageProcessor] Processing image ${imageId}: ${filename}`);

      for (const operation of operations) {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log(`[ImageProcessor]   Applied ${operation} to ${filename}`);
      }

      console.log(`[ImageProcessor] Completed image ${imageId}`);
    });
  }

  async start() {
    await this.system.start();
  }

  async stop() {
    await this.system.stop();
  }

  async uploadImage(filename, operations) {
    await this.system.submitEvent('image-upload', { filename, operations });
  }

  getStats() {
    return this.system.getStats();
  }
}

class MessageBrokerExample {
  constructor() {
    this.system = new HalfSyncHalfAsyncSystem('MessageBroker', 200, 5);
    this.messageCount = 0;
    this.setupHandlers();
  }

  setupHandlers() {
    this.system.registerAsyncHandler('publish', async (data) => {
      this.messageCount++;
      console.log(`[MessageBroker] Message published to topic: ${data.topic}`);

      const message = this.system.createMessage('deliver-message', {
        messageId: this.messageCount,
        topic: data.topic,
        payload: data.payload,
        subscribers: data.subscribers || []
      });

      return message;
    });

    this.system.registerSyncHandler('deliver-message', async (message) => {
      const { messageId, topic, subscribers } = message.data;

      console.log(`[MessageBroker] Delivering message ${messageId} to ${subscribers.length} subscribers`);

      for (const subscriber of subscribers) {
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log(`[MessageBroker]   Delivered to ${subscriber}`);
      }
    });
  }

  async start() {
    await this.system.start();
  }

  async stop() {
    await this.system.stop();
  }

  async publish(topic, payload, subscribers) {
    await this.system.submitEvent('publish', { topic, payload, subscribers });
  }

  getStats() {
    return this.system.getStats();
  }
}

/**
 * Example Usage and Demonstrations
 */

async function demonstrateWebServer() {
  console.log('\n=== Web Server Example ===\n');

  const webServer = new WebServerExample();
  await webServer.start();

  const requests = [
    { method: 'GET', url: '/api/users' },
    { method: 'POST', url: '/api/users' },
    { method: 'GET', url: '/api/posts' },
    { method: 'PUT', url: '/api/users/1' },
    { method: 'DELETE', url: '/api/users/2' }
  ];

  for (const request of requests) {
    await webServer.handleRequest(request.method, request.url);
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\nWeb Server Stats:', webServer.getStats());

  await webServer.stop();
}

async function demonstrateDatabaseServer() {
  console.log('\n=== Database Server Example ===\n');

  const dbServer = new DatabaseServerExample();
  await dbServer.start();

  const queries = [
    { sql: 'SELECT * FROM users', priority: 0 },
    { sql: 'UPDATE users SET active=true WHERE id=1', priority: 10 },
    { sql: 'INSERT INTO logs VALUES (...)', priority: 0 },
    { sql: 'SELECT * FROM orders WHERE date > NOW()', priority: 5 }
  ];

  for (const query of queries) {
    await dbServer.executeQuery(query.sql, [], query.priority);
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('\nDatabase Server Stats:', dbServer.getStats());

  await dbServer.stop();
}

async function demonstrateImageProcessing() {
  console.log('\n=== Image Processing Example ===\n');

  const imageProcessor = new ImageProcessingExample();
  await imageProcessor.start();

  const images = [
    { filename: 'photo1.jpg', operations: ['resize', 'compress'] },
    { filename: 'photo2.png', operations: ['resize', 'watermark', 'compress'] },
    { filename: 'photo3.jpg', operations: ['resize'] }
  ];

  for (const image of images) {
    await imageProcessor.uploadImage(image.filename, image.operations);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\nImage Processor Stats:', imageProcessor.getStats());

  await imageProcessor.stop();
}

async function demonstrateMessageBroker() {
  console.log('\n=== Message Broker Example ===\n');

  const broker = new MessageBrokerExample();
  await broker.start();

  const messages = [
    { topic: 'orders', payload: { orderId: 1 }, subscribers: ['service-a', 'service-b'] },
    { topic: 'users', payload: { userId: 42 }, subscribers: ['service-c'] },
    { topic: 'notifications', payload: { type: 'email' }, subscribers: ['service-d', 'service-e', 'service-f'] }
  ];

  for (const msg of messages) {
    await broker.publish(msg.topic, msg.payload, msg.subscribers);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\nMessage Broker Stats:', broker.getStats());

  await broker.stop();
}

async function demonstrateHighLoad() {
  console.log('\n=== High Load Example ===\n');

  const webServer = new WebServerExample();
  await webServer.start();

  console.log('Simulating high load with 20 concurrent requests...');

  const requests = Array.from({ length: 20 }, (_, i) => ({
    method: 'GET',
    url: `/api/resource/${i}`
  }));

  await Promise.all(requests.map(req => webServer.handleRequest(req.method, req.url)));

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\nHigh Load Stats:', webServer.getStats());

  await webServer.stop();
}

async function runAllDemos() {
  await demonstrateWebServer();
  await demonstrateDatabaseServer();
  await demonstrateImageProcessing();
  await demonstrateMessageBroker();
  await demonstrateHighLoad();
}

if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  HalfSyncHalfAsyncSystem,
  AsyncLayer,
  SyncLayer,
  QueueingLayer,
  Message,
  WebServerExample,
  DatabaseServerExample,
  ImageProcessingExample,
  MessageBrokerExample
};
