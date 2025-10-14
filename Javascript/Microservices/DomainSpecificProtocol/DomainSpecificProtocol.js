/**
 * Domain-Specific Protocol Pattern
 *
 * Uses a domain-specific communication protocol tailored to the specific needs
 * of the application domain rather than generic protocols like HTTP or gRPC.
 * This allows for optimized communication patterns and semantics specific to the
 * business domain.
 *
 * Key Components:
 * - Protocol Definition: Domain-specific message types and formats
 * - Message Codec: Serialization/deserialization for protocol messages
 * - Protocol Handler: Process domain-specific messages
 * - Connection Management: Handle connections and sessions
 * - Protocol Versioning: Support multiple protocol versions
 * - Domain Operations: Business-specific operations in the protocol
 */

const EventEmitter = require('events');

/**
 * Protocol Message Types for Trading Domain
 */
const MessageType = {
  // Order messages
  PLACE_ORDER: 'PLACE_ORDER',
  ORDER_PLACED: 'ORDER_PLACED',
  CANCEL_ORDER: 'CANCEL_ORDER',
  ORDER_CANCELLED: 'ORDER_CANCELLED',

  // Market data
  SUBSCRIBE_MARKET_DATA: 'SUBSCRIBE_MARKET_DATA',
  MARKET_DATA_UPDATE: 'MARKET_DATA_UPDATE',

  // Execution
  ORDER_FILLED: 'ORDER_FILLED',
  PARTIAL_FILL: 'PARTIAL_FILL',

  // Control
  HEARTBEAT: 'HEARTBEAT',
  SESSION_START: 'SESSION_START',
  SESSION_END: 'SESSION_END',
  ERROR: 'ERROR'
};

/**
 * Protocol Message
 */
class ProtocolMessage {
  constructor(type, payload, metadata = {}) {
    this.messageId = this.generateId();
    this.type = type;
    this.payload = payload;
    this.version = metadata.version || '1.0';
    this.timestamp = Date.now();
    this.sessionId = metadata.sessionId;
    this.correlationId = metadata.correlationId;
  }

  generateId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Encode message to wire format (binary-like representation)
   */
  encode() {
    // In real implementation, this would use efficient binary encoding
    // For demo, using JSON with prefix
    const json = JSON.stringify({
      messageId: this.messageId,
      type: this.type,
      payload: this.payload,
      version: this.version,
      timestamp: this.timestamp,
      sessionId: this.sessionId,
      correlationId: this.correlationId
    });

    // Add length prefix (simulated)
    const length = Buffer.byteLength(json, 'utf8');
    return `${length}|${json}`;
  }

  /**
   * Decode message from wire format
   */
  static decode(encoded) {
    const [lengthStr, json] = encoded.split('|', 2);
    const data = JSON.parse(json);

    const msg = new ProtocolMessage(data.type, data.payload, {
      version: data.version,
      sessionId: data.sessionId,
      correlationId: data.correlationId
    });

    msg.messageId = data.messageId;
    msg.timestamp = data.timestamp;

    return msg;
  }

  /**
   * Validate message against protocol rules
   */
  validate() {
    if (!Object.values(MessageType).includes(this.type)) {
      throw new Error(`Invalid message type: ${this.type}`);
    }

    if (!this.payload) {
      throw new Error('Message payload is required');
    }

    if (!this.version) {
      throw new Error('Protocol version is required');
    }

    return true;
  }
}

/**
 * Trading Order (Domain Model)
 */
class Order {
  constructor(symbol, side, quantity, price, orderType = 'LIMIT') {
    this.orderId = this.generateId();
    this.symbol = symbol;
    this.side = side; // BUY or SELL
    this.quantity = quantity;
    this.price = price;
    this.orderType = orderType;
    this.status = 'PENDING';
    this.filledQuantity = 0;
    this.createdAt = Date.now();
  }

  generateId() {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  fill(quantity, price) {
    this.filledQuantity += quantity;
    if (this.filledQuantity >= this.quantity) {
      this.status = 'FILLED';
    } else {
      this.status = 'PARTIALLY_FILLED';
    }
  }

  cancel() {
    this.status = 'CANCELLED';
  }
}

/**
 * Market Data (Domain Model)
 */
class MarketData {
  constructor(symbol) {
    this.symbol = symbol;
    this.bid = 0;
    this.ask = 0;
    this.last = 0;
    this.volume = 0;
    this.timestamp = Date.now();
  }

  update(bid, ask, last, volume) {
    this.bid = bid;
    this.ask = ask;
    this.last = last;
    this.volume = volume;
    this.timestamp = Date.now();
  }
}

/**
 * Protocol Session
 */
class ProtocolSession {
  constructor(sessionId, clientId) {
    this.sessionId = sessionId;
    this.clientId = clientId;
    this.state = 'INACTIVE'; // INACTIVE, ACTIVE, TERMINATED
    this.startTime = null;
    this.lastHeartbeat = null;
    this.subscriptions = new Set();
    this.orders = new Map();
  }

  start() {
    this.state = 'ACTIVE';
    this.startTime = Date.now();
    this.lastHeartbeat = Date.now();
  }

  heartbeat() {
    this.lastHeartbeat = Date.now();
  }

  isAlive(timeoutMs = 30000) {
    if (this.state !== 'ACTIVE') {
      return false;
    }
    return (Date.now() - this.lastHeartbeat) < timeoutMs;
  }

  terminate() {
    this.state = 'TERMINATED';
  }

  subscribe(symbol) {
    this.subscriptions.add(symbol);
  }

  unsubscribe(symbol) {
    this.subscriptions.delete(symbol);
  }

  addOrder(order) {
    this.orders.set(order.orderId, order);
  }

  getOrder(orderId) {
    return this.orders.get(orderId);
  }
}

/**
 * Domain-Specific Protocol Server
 */
class TradingProtocolServer extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map();
    this.marketData = new Map();
    this.orderBook = new Map();
    this.messageCount = 0;

    // Initialize sample market data
    this.initializeMarketData();

    // Start market data simulation
    this.startMarketDataSimulation();
  }

  initializeMarketData() {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN'];

    for (const symbol of symbols) {
      const md = new MarketData(symbol);
      md.update(
        100 + Math.random() * 10,
        100 + Math.random() * 10 + 0.1,
        100 + Math.random() * 10,
        Math.floor(Math.random() * 1000000)
      );
      this.marketData.set(symbol, md);
    }
  }

  startMarketDataSimulation() {
    setInterval(() => {
      for (const [symbol, md] of this.marketData) {
        const change = (Math.random() - 0.5) * 2;
        md.update(
          md.bid + change,
          md.ask + change,
          md.last + change,
          md.volume + Math.floor(Math.random() * 1000)
        );

        // Publish to subscribers
        this.publishMarketData(symbol, md);
      }
    }, 1000);
  }

  /**
   * Handle incoming protocol message
   */
  async handleMessage(encodedMessage, clientId) {
    this.messageCount++;

    try {
      const message = ProtocolMessage.decode(encodedMessage);
      message.validate();

      const session = this.getOrCreateSession(message.sessionId, clientId);

      switch (message.type) {
        case MessageType.SESSION_START:
          return this.handleSessionStart(message, session);

        case MessageType.HEARTBEAT:
          return this.handleHeartbeat(message, session);

        case MessageType.PLACE_ORDER:
          return this.handlePlaceOrder(message, session);

        case MessageType.CANCEL_ORDER:
          return this.handleCancelOrder(message, session);

        case MessageType.SUBSCRIBE_MARKET_DATA:
          return this.handleSubscribeMarketData(message, session);

        case MessageType.SESSION_END:
          return this.handleSessionEnd(message, session);

        default:
          throw new Error(`Unsupported message type: ${message.type}`);
      }
    } catch (error) {
      return this.createErrorResponse(error.message);
    }
  }

  getOrCreateSession(sessionId, clientId) {
    if (!this.sessions.has(sessionId)) {
      const session = new ProtocolSession(sessionId, clientId);
      this.sessions.set(sessionId, session);
    }
    return this.sessions.get(sessionId);
  }

  handleSessionStart(message, session) {
    session.start();

    const response = new ProtocolMessage(
      MessageType.SESSION_START,
      {
        sessionId: session.sessionId,
        status: 'ACTIVE',
        serverTime: Date.now()
      },
      { sessionId: session.sessionId, correlationId: message.messageId }
    );

    console.log(`Session started: ${session.sessionId}`);
    return response.encode();
  }

  handleHeartbeat(message, session) {
    session.heartbeat();

    const response = new ProtocolMessage(
      MessageType.HEARTBEAT,
      { serverTime: Date.now() },
      { sessionId: session.sessionId, correlationId: message.messageId }
    );

    return response.encode();
  }

  handlePlaceOrder(message, session) {
    const { symbol, side, quantity, price, orderType } = message.payload;

    const order = new Order(symbol, side, quantity, price, orderType);
    session.addOrder(order);

    if (!this.orderBook.has(symbol)) {
      this.orderBook.set(symbol, []);
    }
    this.orderBook.get(symbol).push(order);

    // Simulate order execution
    setTimeout(() => {
      this.executeOrder(order, session);
    }, Math.random() * 2000);

    const response = new ProtocolMessage(
      MessageType.ORDER_PLACED,
      {
        orderId: order.orderId,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: order.price,
        status: order.status
      },
      { sessionId: session.sessionId, correlationId: message.messageId }
    );

    console.log(`Order placed: ${order.orderId} - ${side} ${quantity} ${symbol} @ ${price}`);
    return response.encode();
  }

  executeOrder(order, session) {
    order.fill(order.quantity, order.price);

    const execution = new ProtocolMessage(
      MessageType.ORDER_FILLED,
      {
        orderId: order.orderId,
        symbol: order.symbol,
        fillQuantity: order.quantity,
        fillPrice: order.price,
        status: order.status
      },
      { sessionId: session.sessionId }
    );

    this.emit('message', execution.encode(), session.clientId);
    console.log(`Order filled: ${order.orderId}`);
  }

  handleCancelOrder(message, session) {
    const { orderId } = message.payload;
    const order = session.getOrder(orderId);

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    if (order.status === 'FILLED' || order.status === 'CANCELLED') {
      throw new Error(`Cannot cancel order in status: ${order.status}`);
    }

    order.cancel();

    const response = new ProtocolMessage(
      MessageType.ORDER_CANCELLED,
      {
        orderId: order.orderId,
        status: order.status
      },
      { sessionId: session.sessionId, correlationId: message.messageId }
    );

    console.log(`Order cancelled: ${orderId}`);
    return response.encode();
  }

  handleSubscribeMarketData(message, session) {
    const { symbol } = message.payload;

    if (!this.marketData.has(symbol)) {
      throw new Error(`Symbol not found: ${symbol}`);
    }

    session.subscribe(symbol);

    const md = this.marketData.get(symbol);
    const response = new ProtocolMessage(
      MessageType.MARKET_DATA_UPDATE,
      {
        symbol: md.symbol,
        bid: md.bid,
        ask: md.ask,
        last: md.last,
        volume: md.volume
      },
      { sessionId: session.sessionId, correlationId: message.messageId }
    );

    console.log(`Market data subscription: ${symbol}`);
    return response.encode();
  }

  handleSessionEnd(message, session) {
    session.terminate();

    const response = new ProtocolMessage(
      MessageType.SESSION_END,
      { sessionId: session.sessionId, status: 'TERMINATED' },
      { sessionId: session.sessionId, correlationId: message.messageId }
    );

    console.log(`Session ended: ${session.sessionId}`);
    return response.encode();
  }

  publishMarketData(symbol, marketData) {
    for (const [sessionId, session] of this.sessions) {
      if (session.subscriptions.has(symbol)) {
        const update = new ProtocolMessage(
          MessageType.MARKET_DATA_UPDATE,
          {
            symbol: marketData.symbol,
            bid: marketData.bid,
            ask: marketData.ask,
            last: marketData.last,
            volume: marketData.volume
          },
          { sessionId }
        );

        this.emit('message', update.encode(), session.clientId);
      }
    }
  }

  createErrorResponse(errorMessage) {
    const response = new ProtocolMessage(
      MessageType.ERROR,
      { error: errorMessage }
    );
    return response.encode();
  }

  getStats() {
    return {
      activeSessions: Array.from(this.sessions.values()).filter(s => s.state === 'ACTIVE').length,
      totalSessions: this.sessions.size,
      messageCount: this.messageCount,
      symbols: Array.from(this.marketData.keys()),
      totalOrders: Array.from(this.sessions.values()).reduce((sum, s) => sum + s.orders.size, 0)
    };
  }
}

/**
 * Domain-Specific Protocol Client
 */
class TradingProtocolClient extends EventEmitter {
  constructor(clientId) {
    super();
    this.clientId = clientId;
    this.sessionId = this.generateSessionId();
    this.messageCount = 0;
    this.server = null;
  }

  generateSessionId() {
    return `SES-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  connect(server) {
    this.server = server;

    // Listen for server messages
    this.server.on('message', (encodedMessage, clientId) => {
      if (clientId === this.clientId) {
        this.handleServerMessage(encodedMessage);
      }
    });
  }

  async sendMessage(type, payload) {
    const message = new ProtocolMessage(type, payload, {
      sessionId: this.sessionId
    });

    this.messageCount++;

    const response = await this.server.handleMessage(message.encode(), this.clientId);
    return ProtocolMessage.decode(response);
  }

  async startSession() {
    const response = await this.sendMessage(MessageType.SESSION_START, {
      clientId: this.clientId
    });
    console.log(`Client ${this.clientId}: Session started`);
    return response;
  }

  async placeOrder(symbol, side, quantity, price, orderType = 'LIMIT') {
    const response = await this.sendMessage(MessageType.PLACE_ORDER, {
      symbol,
      side,
      quantity,
      price,
      orderType
    });
    console.log(`Client ${this.clientId}: Order placed - ${response.payload.orderId}`);
    return response;
  }

  async cancelOrder(orderId) {
    const response = await this.sendMessage(MessageType.CANCEL_ORDER, { orderId });
    console.log(`Client ${this.clientId}: Order cancelled - ${orderId}`);
    return response;
  }

  async subscribeMarketData(symbol) {
    const response = await this.sendMessage(MessageType.SUBSCRIBE_MARKET_DATA, { symbol });
    console.log(`Client ${this.clientId}: Subscribed to ${symbol}`);
    return response;
  }

  async sendHeartbeat() {
    await this.sendMessage(MessageType.HEARTBEAT, {});
  }

  async endSession() {
    const response = await this.sendMessage(MessageType.SESSION_END, {});
    console.log(`Client ${this.clientId}: Session ended`);
    return response;
  }

  handleServerMessage(encodedMessage) {
    const message = ProtocolMessage.decode(encodedMessage);

    switch (message.type) {
      case MessageType.ORDER_FILLED:
        console.log(`Client ${this.clientId}: Order filled -`, message.payload);
        this.emit('orderFilled', message.payload);
        break;

      case MessageType.MARKET_DATA_UPDATE:
        this.emit('marketData', message.payload);
        break;

      case MessageType.ERROR:
        console.error(`Client ${this.clientId}: Error -`, message.payload.error);
        this.emit('error', message.payload.error);
        break;
    }
  }
}

/**
 * Demo function
 */
async function demonstrateDomainSpecificProtocol() {
  console.log('=== Domain-Specific Protocol Pattern Demo ===\n');

  // Create trading protocol server
  const server = new TradingProtocolServer();

  // Create clients
  const client1 = new TradingProtocolClient('CLIENT-001');
  const client2 = new TradingProtocolClient('CLIENT-002');

  client1.connect(server);
  client2.connect(server);

  // Subscribe to client events
  client1.on('orderFilled', (order) => {
    console.log('  [CLIENT-001 Event] Order filled:', order.orderId);
  });

  client1.on('marketData', (md) => {
    console.log(`  [CLIENT-001 Event] Market data: ${md.symbol} - Last: ${md.last.toFixed(2)}`);
  });

  // Start trading session
  console.log('=== Starting Trading Sessions ===\n');
  await client1.startSession();
  await client2.startSession();

  // Subscribe to market data
  console.log('\n=== Market Data Subscriptions ===\n');
  await client1.subscribeMarketData('AAPL');
  await client2.subscribeMarketData('GOOGL');

  await delay(2000);

  // Place orders
  console.log('\n=== Placing Orders ===\n');
  const order1 = await client1.placeOrder('AAPL', 'BUY', 100, 150.50);
  const order2 = await client2.placeOrder('GOOGL', 'SELL', 50, 2800.00);
  const order3 = await client1.placeOrder('MSFT', 'BUY', 200, 300.00);

  // Wait for executions
  await delay(3000);

  // Cancel an order
  console.log('\n=== Cancelling Order ===\n');
  const order4Response = await client1.placeOrder('AMZN', 'BUY', 25, 3500.00);
  await delay(500);
  await client1.cancelOrder(order4Response.payload.orderId);

  // Get statistics
  console.log('\n=== Server Statistics ===\n');
  console.log(JSON.stringify(server.getStats(), null, 2));

  // End sessions
  console.log('\n=== Ending Sessions ===\n');
  await client1.endSession();
  await client2.endSession();

  return { server, client1, client2 };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export components
module.exports = {
  MessageType,
  ProtocolMessage,
  Order,
  MarketData,
  ProtocolSession,
  TradingProtocolServer,
  TradingProtocolClient,
  demonstrateDomainSpecificProtocol
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateDomainSpecificProtocol()
    .then(() => {
      console.log('\n✅ Domain-Specific Protocol demo completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
