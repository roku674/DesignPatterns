/**
 * Acceptor-Connector Pattern Implementation in JavaScript
 *
 * The Acceptor-Connector pattern decouples the connection and initialization of
 * cooperating peer services in a networked system. It separates the concerns of
 * connection establishment from the concerns of service processing.
 *
 * Key Components:
 * - Acceptor: Passively accepts connection requests
 * - Connector: Actively establishes connections
 * - Service Handler: Processes service-specific requests
 * - Transport Endpoint: Represents a communication endpoint
 * - Strategy: Defines the connection establishment strategy
 */

const EventEmitter = require('events');
const net = require('net');

/**
 * Transport Endpoint - Represents a communication endpoint
 */
class TransportEndpoint {
  constructor(host, port, protocol = 'tcp') {
    this.host = host;
    this.port = port;
    this.protocol = protocol;
    this.id = `${protocol}://${host}:${port}`;
  }

  toString() {
    return this.id;
  }

  equals(other) {
    return this.id === other.id;
  }

  clone() {
    return new TransportEndpoint(this.host, this.port, this.protocol);
  }
}

/**
 * Connection - Represents an established connection
 */
class Connection extends EventEmitter {
  constructor(id, localEndpoint, remoteEndpoint) {
    super();
    this.id = id;
    this.localEndpoint = localEndpoint;
    this.remoteEndpoint = remoteEndpoint;
    this.state = 'connected';
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.bytesSent = 0;
    this.bytesReceived = 0;
  }

  async send(data) {
    if (this.state !== 'connected') {
      throw new Error(`Connection ${this.id} is not connected`);
    }

    this.bytesSent += data.length;
    this.lastActivity = Date.now();
    this.emit('data-sent', data);

    await new Promise(resolve => setTimeout(resolve, 10));
    return data.length;
  }

  async receive() {
    if (this.state !== 'connected') {
      throw new Error(`Connection ${this.id} is not connected`);
    }

    this.lastActivity = Date.now();
    return new Promise((resolve) => {
      this.once('data-received', (data) => {
        this.bytesReceived += data.length;
        resolve(data);
      });
    });
  }

  async close() {
    this.state = 'closed';
    this.emit('closed');
  }

  isConnected() {
    return this.state === 'connected';
  }

  getUptime() {
    return Date.now() - this.createdAt;
  }
}

/**
 * Service Handler - Base class for handling service requests
 */
class ServiceHandler extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.connection = null;
    this.active = false;
  }

  async open(connection) {
    this.connection = connection;
    this.active = true;
    console.log(`[${this.name}] Service opened on connection ${connection.id}`);

    this.connection.on('data-received', async (data) => {
      await this.handleRequest(data);
    });

    this.connection.on('closed', () => {
      this.handleClose();
    });
  }

  async handleRequest(data) {
    throw new Error('handleRequest must be implemented by subclass');
  }

  async handleClose() {
    this.active = false;
    console.log(`[${this.name}] Connection closed`);
  }

  async send(data) {
    if (!this.connection || !this.connection.isConnected()) {
      throw new Error('No active connection');
    }
    return await this.connection.send(data);
  }

  async close() {
    if (this.connection) {
      await this.connection.close();
    }
    this.active = false;
  }
}

/**
 * Acceptor - Passively waits for and accepts connections
 */
class Acceptor extends EventEmitter {
  constructor(endpoint, serviceHandlerFactory) {
    super();
    this.endpoint = endpoint;
    this.serviceHandlerFactory = serviceHandlerFactory;
    this.listening = false;
    this.connections = new Map();
    this.connectionCount = 0;
  }

  async open() {
    if (this.listening) {
      throw new Error('Acceptor already listening');
    }

    this.listening = true;
    console.log(`[Acceptor] Listening on ${this.endpoint}`);
    this.emit('opened');
  }

  async accept() {
    if (!this.listening) {
      throw new Error('Acceptor not listening');
    }

    return new Promise((resolve) => {
      this.once('connection-request', async (remoteEndpoint) => {
        const connection = await this.createConnection(remoteEndpoint);
        const serviceHandler = this.serviceHandlerFactory();

        await serviceHandler.open(connection);
        this.connections.set(connection.id, { connection, serviceHandler });

        this.emit('connection-accepted', { connection, serviceHandler });
        resolve({ connection, serviceHandler });
      });
    });
  }

  async createConnection(remoteEndpoint) {
    const connectionId = `conn-${++this.connectionCount}`;
    const connection = new Connection(connectionId, this.endpoint, remoteEndpoint);

    console.log(`[Acceptor] Created connection ${connectionId}: ${remoteEndpoint} -> ${this.endpoint}`);

    connection.on('closed', () => {
      this.connections.delete(connection.id);
    });

    return connection;
  }

  simulateConnectionRequest(remoteEndpoint) {
    if (this.listening) {
      this.emit('connection-request', remoteEndpoint);
    }
  }

  async close() {
    this.listening = false;

    for (const [id, { connection, serviceHandler }] of this.connections) {
      await serviceHandler.close();
    }

    this.connections.clear();
    console.log(`[Acceptor] Closed`);
    this.emit('closed');
  }

  getActiveConnections() {
    return this.connections.size;
  }
}

/**
 * Connector - Actively initiates connections
 */
class Connector extends EventEmitter {
  constructor(serviceHandlerFactory, strategy = null) {
    super();
    this.serviceHandlerFactory = serviceHandlerFactory;
    this.strategy = strategy || new SimpleConnectStrategy();
    this.connections = new Map();
    this.connectionCount = 0;
  }

  async connect(remoteEndpoint, localEndpoint = null) {
    console.log(`[Connector] Attempting to connect to ${remoteEndpoint}`);

    if (!localEndpoint) {
      localEndpoint = new TransportEndpoint('localhost', 0, remoteEndpoint.protocol);
    }

    try {
      const connection = await this.strategy.connect(
        remoteEndpoint,
        localEndpoint,
        `conn-${++this.connectionCount}`
      );

      const serviceHandler = this.serviceHandlerFactory();
      await serviceHandler.open(connection);

      this.connections.set(connection.id, { connection, serviceHandler });
      this.emit('connected', { connection, serviceHandler });

      console.log(`[Connector] Connected: ${connection.id}`);

      return { connection, serviceHandler };
    } catch (error) {
      console.error(`[Connector] Connection failed:`, error.message);
      this.emit('connection-failed', { remoteEndpoint, error });
      throw error;
    }
  }

  async disconnect(connectionId) {
    const entry = this.connections.get(connectionId);
    if (entry) {
      await entry.serviceHandler.close();
      this.connections.delete(connectionId);
    }
  }

  async disconnectAll() {
    for (const [id, { serviceHandler }] of this.connections) {
      await serviceHandler.close();
    }
    this.connections.clear();
  }

  getActiveConnections() {
    return this.connections.size;
  }
}

/**
 * Connection Strategies
 */

class SimpleConnectStrategy {
  async connect(remoteEndpoint, localEndpoint, connectionId) {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    const connection = new Connection(connectionId, localEndpoint, remoteEndpoint);
    console.log(`[SimpleStrategy] Established connection ${connectionId}`);

    return connection;
  }
}

class RetryConnectStrategy {
  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async connect(remoteEndpoint, localEndpoint, connectionId) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[RetryStrategy] Connection attempt ${attempt}/${this.maxRetries}`);

        if (Math.random() > 0.3) {
          await new Promise(resolve => setTimeout(resolve, 50));
          const connection = new Connection(connectionId, localEndpoint, remoteEndpoint);
          console.log(`[RetryStrategy] Connection successful on attempt ${attempt}`);
          return connection;
        } else {
          throw new Error('Connection refused');
        }
      } catch (error) {
        lastError = error;
        console.log(`[RetryStrategy] Attempt ${attempt} failed: ${error.message}`);

        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    throw new Error(`Failed after ${this.maxRetries} attempts: ${lastError.message}`);
  }
}

class TimeoutConnectStrategy {
  constructor(timeout = 5000) {
    this.timeout = timeout;
  }

  async connect(remoteEndpoint, localEndpoint, connectionId) {
    const connectPromise = new Promise(async (resolve) => {
      await new Promise(r => setTimeout(r, 100));
      resolve(new Connection(connectionId, localEndpoint, remoteEndpoint));
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Connection timeout after ${this.timeout}ms`)), this.timeout);
    });

    return await Promise.race([connectPromise, timeoutPromise]);
  }
}

/**
 * Concrete Service Handlers
 */

class EchoServiceHandler extends ServiceHandler {
  constructor() {
    super('EchoService');
    this.requestCount = 0;
  }

  async handleRequest(data) {
    this.requestCount++;
    console.log(`[${this.name}] Request ${this.requestCount}: ${data}`);

    const response = `Echo: ${data}`;
    await this.send(response);
  }
}

class DataProcessingServiceHandler extends ServiceHandler {
  constructor() {
    super('DataProcessingService');
    this.processedData = [];
  }

  async handleRequest(data) {
    console.log(`[${this.name}] Processing data: ${data}`);

    await new Promise(resolve => setTimeout(resolve, 50));

    const processed = data.toUpperCase();
    this.processedData.push(processed);

    await this.send(`Processed: ${processed}`);
  }
}

class AuthenticationServiceHandler extends ServiceHandler {
  constructor() {
    super('AuthService');
    this.authenticated = false;
    this.username = null;
  }

  async handleRequest(data) {
    const message = JSON.parse(data);

    if (message.type === 'login') {
      console.log(`[${this.name}] Login request for user: ${message.username}`);

      if (message.username && message.password) {
        this.authenticated = true;
        this.username = message.username;
        await this.send(JSON.stringify({ status: 'success', message: 'Authenticated' }));
      } else {
        await this.send(JSON.stringify({ status: 'error', message: 'Invalid credentials' }));
      }
    } else if (message.type === 'logout') {
      console.log(`[${this.name}] Logout request`);
      this.authenticated = false;
      this.username = null;
      await this.send(JSON.stringify({ status: 'success', message: 'Logged out' }));
    }
  }
}

class ChatServiceHandler extends ServiceHandler {
  constructor() {
    super('ChatService');
    this.messages = [];
    this.nickname = null;
  }

  async handleRequest(data) {
    const message = JSON.parse(data);

    if (message.type === 'join') {
      this.nickname = message.nickname;
      console.log(`[${this.name}] ${this.nickname} joined the chat`);
      await this.send(JSON.stringify({ type: 'system', message: 'Welcome to chat!' }));
    } else if (message.type === 'message') {
      this.messages.push({ from: this.nickname, text: message.text });
      console.log(`[${this.name}] ${this.nickname}: ${message.text}`);
      await this.send(JSON.stringify({ type: 'ack', messageId: this.messages.length }));
    }
  }
}

/**
 * Example Usage and Demonstrations
 */

async function demonstrateBasicAcceptorConnector() {
  console.log('\n=== Basic Acceptor-Connector Demo ===\n');

  const serverEndpoint = new TransportEndpoint('localhost', 8080);
  const acceptor = new Acceptor(serverEndpoint, () => new EchoServiceHandler());

  await acceptor.open();

  const acceptPromise = acceptor.accept();

  const clientEndpoint = new TransportEndpoint('localhost', 8080);
  const connector = new Connector(() => new EchoServiceHandler());

  setTimeout(() => acceptor.simulateConnectionRequest(new TransportEndpoint('client', 12345)), 100);

  const { connection: serverConn, serviceHandler: serverHandler } = await acceptPromise;

  setTimeout(async () => {
    serverConn.emit('data-received', 'Hello from client');
  }, 200);

  setTimeout(async () => {
    await acceptor.close();
  }, 500);

  await new Promise(resolve => setTimeout(resolve, 600));
}

async function demonstrateMultipleConnections() {
  console.log('\n=== Multiple Connections Demo ===\n');

  const serverEndpoint = new TransportEndpoint('localhost', 9000);
  const acceptor = new Acceptor(serverEndpoint, () => new DataProcessingServiceHandler());

  await acceptor.open();

  const acceptConnections = async () => {
    for (let i = 0; i < 3; i++) {
      acceptor.accept().then(({ connection }) => {
        console.log(`Server accepted connection: ${connection.id}`);
      });
    }
  };

  acceptConnections();

  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      acceptor.simulateConnectionRequest(new TransportEndpoint('client', 20000 + i));
    }
  }, 100);

  setTimeout(() => {
    console.log(`Active connections: ${acceptor.getActiveConnections()}`);
  }, 300);

  setTimeout(async () => {
    await acceptor.close();
  }, 500);

  await new Promise(resolve => setTimeout(resolve, 600));
}

async function demonstrateConnectorWithStrategies() {
  console.log('\n=== Connector Strategies Demo ===\n');

  const endpoint = new TransportEndpoint('remote-server', 8080);

  console.log('--- Simple Strategy ---');
  const simpleConnector = new Connector(() => new EchoServiceHandler(), new SimpleConnectStrategy());
  try {
    await simpleConnector.connect(endpoint);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }

  console.log('\n--- Retry Strategy ---');
  const retryConnector = new Connector(() => new EchoServiceHandler(), new RetryConnectStrategy(3, 200));
  try {
    await retryConnector.connect(endpoint);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }

  console.log('\n--- Timeout Strategy ---');
  const timeoutConnector = new Connector(() => new EchoServiceHandler(), new TimeoutConnectStrategy(300));
  try {
    await timeoutConnector.connect(endpoint);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 200));
}

async function demonstrateAuthenticationService() {
  console.log('\n=== Authentication Service Demo ===\n');

  const serverEndpoint = new TransportEndpoint('localhost', 8443);
  const acceptor = new Acceptor(serverEndpoint, () => new AuthenticationServiceHandler());

  await acceptor.open();

  const acceptPromise = acceptor.accept();

  setTimeout(() => acceptor.simulateConnectionRequest(new TransportEndpoint('client', 33333)), 100);

  const { connection, serviceHandler } = await acceptPromise;

  setTimeout(() => {
    connection.emit('data-received', JSON.stringify({
      type: 'login',
      username: 'alice',
      password: 'secret123'
    }));
  }, 200);

  setTimeout(() => {
    connection.emit('data-received', JSON.stringify({ type: 'logout' }));
  }, 400);

  setTimeout(async () => {
    await acceptor.close();
  }, 600);

  await new Promise(resolve => setTimeout(resolve, 700));
}

async function demonstrateChatService() {
  console.log('\n=== Chat Service Demo ===\n');

  const serverEndpoint = new TransportEndpoint('localhost', 7000);
  const acceptor = new Acceptor(serverEndpoint, () => new ChatServiceHandler());

  await acceptor.open();

  const acceptPromises = [];
  for (let i = 0; i < 2; i++) {
    acceptPromises.push(acceptor.accept());
  }

  setTimeout(() => {
    acceptor.simulateConnectionRequest(new TransportEndpoint('client1', 40001));
    acceptor.simulateConnectionRequest(new TransportEndpoint('client2', 40002));
  }, 100);

  const connections = await Promise.all(acceptPromises);

  setTimeout(() => {
    connections[0].connection.emit('data-received', JSON.stringify({
      type: 'join',
      nickname: 'Alice'
    }));
  }, 200);

  setTimeout(() => {
    connections[1].connection.emit('data-received', JSON.stringify({
      type: 'join',
      nickname: 'Bob'
    }));
  }, 300);

  setTimeout(() => {
    connections[0].connection.emit('data-received', JSON.stringify({
      type: 'message',
      text: 'Hello everyone!'
    }));
  }, 400);

  setTimeout(async () => {
    await acceptor.close();
  }, 600);

  await new Promise(resolve => setTimeout(resolve, 700));
}

async function runAllDemos() {
  await demonstrateBasicAcceptorConnector();
  await demonstrateMultipleConnections();
  await demonstrateConnectorWithStrategies();
  await demonstrateAuthenticationService();
  await demonstrateChatService();
}

if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  Acceptor,
  Connector,
  ServiceHandler,
  Connection,
  TransportEndpoint,
  SimpleConnectStrategy,
  RetryConnectStrategy,
  TimeoutConnectStrategy,
  EchoServiceHandler,
  DataProcessingServiceHandler,
  AuthenticationServiceHandler,
  ChatServiceHandler
};
