/**
 * Remote Procedure Invocation (RPC) Pattern
 *
 * Allows a client to invoke a procedure on a remote server as if it were
 * a local procedure call. The RPC framework handles all the networking,
 * serialization, and error handling transparently.
 *
 * Key Components:
 * - Client Stub: Local proxy for remote procedures
 * - Server Skeleton: Receives and dispatches RPC calls
 * - Serialization: Convert data for network transmission
 * - Transport Layer: Network communication (TCP, HTTP, etc.)
 * - Service Registry: Discover available RPC services
 * - Timeout Handling: Handle slow or failed calls
 */

const EventEmitter = require('events');

/**
 * RPC Message
 */
class RPCMessage {
  constructor(type, data) {
    this.id = this.generateId();
    this.type = type; // request, response, error
    this.data = data;
    this.timestamp = Date.now();
  }

  generateId() {
    return `rpc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  serialize() {
    return JSON.stringify(this);
  }

  static deserialize(str) {
    const obj = JSON.parse(str);
    const msg = new RPCMessage(obj.type, obj.data);
    msg.id = obj.id;
    msg.timestamp = obj.timestamp;
    return msg;
  }
}

/**
 * RPC Request
 */
class RPCRequest {
  constructor(service, method, params) {
    this.id = this.generateId();
    this.service = service;
    this.method = method;
    this.params = params;
    this.timestamp = Date.now();
  }

  generateId() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * RPC Response
 */
class RPCResponse {
  constructor(requestId, result = null, error = null) {
    this.requestId = requestId;
    this.result = result;
    this.error = error;
    this.timestamp = Date.now();
  }

  isSuccess() {
    return this.error === null;
  }
}

/**
 * RPC Transport (simulated network)
 */
class RPCTransport extends EventEmitter {
  constructor() {
    super();
    this.endpoints = new Map(); // address -> handler
    this.networkDelay = 10; // Simulate network delay
    this.failureRate = 0; // Simulate network failures
  }

  register(address, handler) {
    this.endpoints.set(address, handler);
    console.log(`RPC endpoint registered: ${address}`);
  }

  unregister(address) {
    this.endpoints.delete(address);
    console.log(`RPC endpoint unregistered: ${address}`);
  }

  async send(address, message) {
    // Simulate network delay
    await this.delay(this.networkDelay);

    // Simulate network failures
    if (Math.random() < this.failureRate) {
      throw new Error('Network error: Connection timeout');
    }

    const handler = this.endpoints.get(address);
    if (!handler) {
      throw new Error(`No endpoint registered at ${address}`);
    }

    return await handler(message);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setNetworkDelay(ms) {
    this.networkDelay = ms;
  }

  setFailureRate(rate) {
    this.failureRate = Math.max(0, Math.min(1, rate));
  }
}

/**
 * RPC Server - Handles incoming RPC requests
 */
class RPCServer {
  constructor(address, transport) {
    this.address = address;
    this.transport = transport;
    this.services = new Map(); // serviceName -> service implementation
    this.isRunning = false;
    this.requestCount = 0;

    // Register with transport
    this.transport.register(address, this.handleRequest.bind(this));
  }

  /**
   * Register service implementation
   */
  registerService(serviceName, implementation) {
    this.services.set(serviceName, implementation);
    console.log(`Service registered: ${serviceName} at ${this.address}`);
  }

  /**
   * Handle incoming RPC request
   */
  async handleRequest(message) {
    this.requestCount++;

    try {
      const msg = RPCMessage.deserialize(message);

      if (msg.type !== 'request') {
        throw new Error(`Invalid message type: ${msg.type}`);
      }

      const request = msg.data;
      const service = this.services.get(request.service);

      if (!service) {
        throw new Error(`Service not found: ${request.service}`);
      }

      const method = service[request.method];

      if (!method || typeof method !== 'function') {
        throw new Error(`Method not found: ${request.service}.${request.method}`);
      }

      // Invoke method
      const result = await method.apply(service, request.params);

      const response = new RPCResponse(request.id, result);
      const responseMsg = new RPCMessage('response', response);

      return responseMsg.serialize();
    } catch (error) {
      const response = new RPCResponse(
        message.data ? message.data.id : null,
        null,
        error.message
      );
      const responseMsg = new RPCMessage('error', response);
      return responseMsg.serialize();
    }
  }

  /**
   * Start server
   */
  start() {
    this.isRunning = true;
    console.log(`RPC Server started at ${this.address}`);
  }

  /**
   * Stop server
   */
  stop() {
    this.isRunning = false;
    this.transport.unregister(this.address);
    console.log(`RPC Server stopped at ${this.address}`);
  }

  /**
   * Get server statistics
   */
  getStats() {
    return {
      address: this.address,
      isRunning: this.isRunning,
      requestCount: this.requestCount,
      services: Array.from(this.services.keys())
    };
  }
}

/**
 * RPC Client - Makes RPC calls to remote services
 */
class RPCClient {
  constructor(serverAddress, transport, options = {}) {
    this.serverAddress = serverAddress;
    this.transport = transport;
    this.timeout = options.timeout || 5000;
    this.retries = options.retries || 3;
    this.requestCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
  }

  /**
   * Make RPC call
   */
  async call(service, method, ...params) {
    let lastError = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        return await this.makeCall(service, method, params);
      } catch (error) {
        lastError = error;

        if (attempt < this.retries - 1) {
          console.log(`RPC call failed (attempt ${attempt + 1}/${this.retries}): ${error.message}`);
          await this.delay(Math.pow(2, attempt) * 100); // Exponential backoff
        }
      }
    }

    this.errorCount++;
    throw lastError;
  }

  /**
   * Make single RPC call attempt
   */
  async makeCall(service, method, params) {
    this.requestCount++;

    const request = new RPCRequest(service, method, params);
    const requestMsg = new RPCMessage('request', request);

    // Set timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('RPC timeout')), this.timeout)
    );

    const callPromise = this.transport.send(this.serverAddress, requestMsg.serialize());

    const responseStr = await Promise.race([callPromise, timeoutPromise]);
    const responseMsg = RPCMessage.deserialize(responseStr);

    if (responseMsg.type === 'error') {
      throw new Error(responseMsg.data.error);
    }

    const response = responseMsg.data;

    if (!response.isSuccess()) {
      throw new Error(response.error);
    }

    this.successCount++;
    return response.result;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get client statistics
   */
  getStats() {
    return {
      serverAddress: this.serverAddress,
      requestCount: this.requestCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      successRate: this.requestCount > 0
        ? (this.successCount / this.requestCount * 100).toFixed(2) + '%'
        : '0%'
    };
  }
}

/**
 * RPC Client Stub - Type-safe proxy for remote service
 */
class RPCClientStub {
  constructor(client, serviceName) {
    this.client = client;
    this.serviceName = serviceName;

    // Create proxy for dynamic method calls
    return new Proxy(this, {
      get(target, property) {
        if (property in target) {
          return target[property];
        }

        // Return function that makes RPC call
        return async function(...args) {
          return await target.client.call(target.serviceName, property, ...args);
        };
      }
    });
  }
}

/**
 * Example Service Implementations
 */

/**
 * Calculator Service
 */
class CalculatorService {
  add(a, b) {
    return a + b;
  }

  subtract(a, b) {
    return a - b;
  }

  multiply(a, b) {
    return a * b;
  }

  divide(a, b) {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  }

  async asyncOperation(value) {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    return value * 2;
  }
}

/**
 * User Service
 */
class UserService {
  constructor() {
    this.users = new Map([
      ['user-1', { id: 'user-1', name: 'Alice', email: 'alice@example.com' }],
      ['user-2', { id: 'user-2', name: 'Bob', email: 'bob@example.com' }]
    ]);
  }

  getUser(userId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return user;
  }

  createUser(name, email) {
    const id = `user-${Date.now()}`;
    const user = { id, name, email };
    this.users.set(id, user);
    return user;
  }

  listUsers() {
    return Array.from(this.users.values());
  }
}

/**
 * Demo function
 */
async function demonstrateRemoteProcedureInvocation() {
  console.log('=== Remote Procedure Invocation Pattern Demo ===\n');

  // Create transport
  const transport = new RPCTransport();

  // Create servers
  console.log('Starting RPC servers...\n');

  const calculatorServer = new RPCServer('calc-service', transport);
  calculatorServer.registerService('Calculator', new CalculatorService());
  calculatorServer.start();

  const userServer = new RPCServer('user-service', transport);
  userServer.registerService('User', new UserService());
  userServer.start();

  // Create clients
  console.log('\nCreating RPC clients...\n');

  const calcClient = new RPCClient('calc-service', transport, { timeout: 5000, retries: 3 });
  const userClient = new RPCClient('user-service', transport, { timeout: 5000, retries: 3 });

  // Make RPC calls
  console.log('=== Making RPC Calls ===\n');

  // Calculator service calls
  console.log('Calculator Service:');
  const sum = await calcClient.call('Calculator', 'add', 10, 5);
  console.log(`  10 + 5 = ${sum}`);

  const product = await calcClient.call('Calculator', 'multiply', 7, 3);
  console.log(`  7 * 3 = ${product}`);

  const asyncResult = await calcClient.call('Calculator', 'asyncOperation', 21);
  console.log(`  asyncOperation(21) = ${asyncResult}`);

  // User service calls
  console.log('\nUser Service:');
  const user = await userClient.call('User', 'getUser', 'user-1');
  console.log(`  getUser('user-1'):`, user);

  const newUser = await userClient.call('User', 'createUser', 'Charlie', 'charlie@example.com');
  console.log(`  createUser('Charlie'):`, newUser);

  const users = await userClient.call('User', 'listUsers');
  console.log(`  listUsers(): ${users.length} users`);

  // Test error handling
  console.log('\n=== Testing Error Handling ===\n');

  try {
    await calcClient.call('Calculator', 'divide', 10, 0);
  } catch (error) {
    console.log(`  Caught expected error: ${error.message}`);
  }

  try {
    await userClient.call('User', 'getUser', 'invalid-user');
  } catch (error) {
    console.log(`  Caught expected error: ${error.message}`);
  }

  // Using type-safe stubs
  console.log('\n=== Using Type-Safe Client Stubs ===\n');

  const Calculator = new RPCClientStub(calcClient, 'Calculator');
  const result = await Calculator.add(100, 200);
  console.log(`  Calculator.add(100, 200) = ${result}`);

  // Test with network delay and failures
  console.log('\n=== Testing with Network Issues ===\n');

  transport.setNetworkDelay(50);
  transport.setFailureRate(0.3); // 30% failure rate

  const testClient = new RPCClient('calc-service', transport, {
    timeout: 5000,
    retries: 5
  });

  try {
    const retryResult = await testClient.call('Calculator', 'add', 1, 2);
    console.log(`  Call succeeded with retries: ${retryResult}`);
  } catch (error) {
    console.log(`  Call failed after retries: ${error.message}`);
  }

  // Display statistics
  console.log('\n=== Statistics ===\n');

  console.log('Calculator Server:');
  console.log(JSON.stringify(calculatorServer.getStats(), null, 2));

  console.log('\nCalculator Client:');
  console.log(JSON.stringify(calcClient.getStats(), null, 2));

  console.log('\nUser Client:');
  console.log(JSON.stringify(userClient.getStats(), null, 2));

  // Cleanup
  calculatorServer.stop();
  userServer.stop();

  return { transport, calculatorServer, userServer, calcClient, userClient };
}

// Export components
module.exports = {
  RPCMessage,
  RPCRequest,
  RPCResponse,
  RPCTransport,
  RPCServer,
  RPCClient,
  RPCClientStub,
  CalculatorService,
  UserService,
  demonstrateRemoteProcedureInvocation
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateRemoteProcedureInvocation()
    .then(() => console.log('\n✅ Remote Procedure Invocation demo completed'))
    .catch(error => console.error('❌ Error:', error));
}
