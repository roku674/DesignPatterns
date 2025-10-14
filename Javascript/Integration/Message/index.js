/**
 * Message Pattern
 *
 * A Message is the basic unit of data transfer in messaging systems.
 * It contains a header (metadata) and a body (payload).
 *
 * Use this pattern when you need to:
 * - Exchange data between applications
 * - Decouple sender and receiver
 * - Enable asynchronous communication
 * - Track message metadata
 */

const { EventEmitter } = require('events');
const crypto = require('crypto');

/**
 * Base Message class representing a unit of data transfer
 */
class Message {
  /**
   * @param {*} body - The message payload
   * @param {Object} headers - Message metadata
   */
  constructor(body, headers = {}) {
    this.id = headers.id || this.generateId();
    this.timestamp = headers.timestamp || Date.now();
    this.correlationId = headers.correlationId || null;
    this.replyTo = headers.replyTo || null;
    this.expiration = headers.expiration || null;
    this.priority = headers.priority || 5; // 1-10, 10 is highest
    this.contentType = headers.contentType || 'application/json';
    this.headers = { ...headers };
    this.body = body;
    this.attempts = 0;
    this.history = [];
  }

  /**
   * Generate unique message ID
   */
  generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Check if message has expired
   */
  isExpired() {
    if (!this.expiration) return false;
    return Date.now() > this.expiration;
  }

  /**
   * Add processing history entry
   */
  addHistory(component, action, metadata = {}) {
    this.history.push({
      component,
      action,
      timestamp: Date.now(),
      ...metadata
    });
  }

  /**
   * Increment attempt counter
   */
  incrementAttempts() {
    this.attempts++;
  }

  /**
   * Get message age in milliseconds
   */
  getAge() {
    return Date.now() - this.timestamp;
  }

  /**
   * Clone the message
   */
  clone() {
    const cloned = new Message(
      typeof this.body === 'object' ? { ...this.body } : this.body,
      { ...this.headers }
    );
    cloned.id = this.id;
    cloned.timestamp = this.timestamp;
    cloned.correlationId = this.correlationId;
    cloned.replyTo = this.replyTo;
    cloned.expiration = this.expiration;
    cloned.priority = this.priority;
    cloned.contentType = this.contentType;
    cloned.attempts = this.attempts;
    cloned.history = [...this.history];
    return cloned;
  }

  /**
   * Convert message to JSON
   */
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      replyTo: this.replyTo,
      expiration: this.expiration,
      priority: this.priority,
      contentType: this.contentType,
      headers: this.headers,
      body: this.body,
      attempts: this.attempts,
      history: this.history
    };
  }

  /**
   * Create message from JSON
   */
  static fromJSON(json) {
    const message = new Message(json.body, json.headers);
    message.id = json.id;
    message.timestamp = json.timestamp;
    message.correlationId = json.correlationId;
    message.replyTo = json.replyTo;
    message.expiration = json.expiration;
    message.priority = json.priority;
    message.contentType = json.contentType;
    message.attempts = json.attempts || 0;
    message.history = json.history || [];
    return message;
  }
}

/**
 * Message Builder for fluent message construction
 */
class MessageBuilder {
  constructor(body) {
    this.body = body;
    this.headers = {};
  }

  withId(id) {
    this.headers.id = id;
    return this;
  }

  withCorrelationId(correlationId) {
    this.headers.correlationId = correlationId;
    return this;
  }

  withReplyTo(replyTo) {
    this.headers.replyTo = replyTo;
    return this;
  }

  withExpiration(expiration) {
    this.headers.expiration = expiration;
    return this;
  }

  withPriority(priority) {
    this.headers.priority = priority;
    return this;
  }

  withContentType(contentType) {
    this.headers.contentType = contentType;
    return this;
  }

  withHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  build() {
    return new Message(this.body, this.headers);
  }
}

/**
 * Message Queue for storing messages
 */
class MessageQueue extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.messages = [];
    this.maxSize = 1000;
  }

  /**
   * Enqueue a message
   */
  enqueue(message) {
    if (message.isExpired()) {
      this.emit('expired', message);
      return false;
    }

    if (this.messages.length >= this.maxSize) {
      this.emit('full', message);
      return false;
    }

    // Insert based on priority (higher priority first)
    let inserted = false;
    for (let i = 0; i < this.messages.length; i++) {
      if (message.priority > this.messages[i].priority) {
        this.messages.splice(i, 0, message);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.messages.push(message);
    }

    this.emit('enqueue', message);
    return true;
  }

  /**
   * Dequeue a message
   */
  dequeue() {
    // Remove expired messages
    while (this.messages.length > 0 && this.messages[0].isExpired()) {
      const expired = this.messages.shift();
      this.emit('expired', expired);
    }

    if (this.messages.length === 0) {
      return null;
    }

    const message = this.messages.shift();
    this.emit('dequeue', message);
    return message;
  }

  /**
   * Peek at the next message without removing it
   */
  peek() {
    // Skip expired messages
    while (this.messages.length > 0 && this.messages[0].isExpired()) {
      const expired = this.messages.shift();
      this.emit('expired', expired);
    }

    return this.messages.length > 0 ? this.messages[0] : null;
  }

  /**
   * Get queue size
   */
  size() {
    return this.messages.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty() {
    return this.messages.length === 0;
  }

  /**
   * Clear the queue
   */
  clear() {
    const count = this.messages.length;
    this.messages = [];
    this.emit('cleared', count);
  }

  /**
   * Get messages by correlation ID
   */
  getByCorrelationId(correlationId) {
    return this.messages.filter(m => m.correlationId === correlationId);
  }
}

// Usage Examples
console.log('=== Message Pattern Examples ===\n');

// Example 1: Basic message creation
console.log('1. Basic Message Creation:');
const message1 = new Message({ userId: 123, action: 'login' });
console.log('Message ID:', message1.id);
console.log('Body:', message1.body);
console.log('');

// Example 2: Message with headers
console.log('2. Message with Headers:');
const message2 = new Message(
  { orderId: 'ORD-001', amount: 99.99 },
  {
    correlationId: 'CORR-123',
    replyTo: 'order.responses',
    priority: 8,
    contentType: 'application/json'
  }
);
console.log('Correlation ID:', message2.correlationId);
console.log('Priority:', message2.priority);
console.log('');

// Example 3: Message Builder
console.log('3. Message Builder:');
const message3 = new MessageBuilder({ event: 'userSignup', email: 'user@example.com' })
  .withCorrelationId('SIGNUP-001')
  .withPriority(9)
  .withExpiration(Date.now() + 60000) // 1 minute
  .withHeader('source', 'web-app')
  .build();
console.log('Built message:', message3.toJSON());
console.log('');

// Example 4: Message history tracking
console.log('4. Message History Tracking:');
const message4 = new Message({ data: 'process me' });
message4.addHistory('InputChannel', 'received');
message4.addHistory('Validator', 'validated');
message4.addHistory('Processor', 'processed');
console.log('Message history:', message4.history);
console.log('');

// Example 5: Message expiration
console.log('5. Message Expiration:');
const message5 = new Message(
  { temp: 'data' },
  { expiration: Date.now() + 100 }
);
console.log('Is expired now:', message5.isExpired());
setTimeout(() => {
  console.log('Is expired after 200ms:', message5.isExpired());
}, 200);
console.log('');

// Example 6: Message cloning
console.log('6. Message Cloning:');
const original = new Message({ value: 100 });
original.addHistory('Service1', 'processed');
const cloned = original.clone();
cloned.body.value = 200;
console.log('Original value:', original.body.value);
console.log('Cloned value:', cloned.body.value);
console.log('History preserved:', cloned.history.length > 0);
console.log('');

// Example 7: Message Queue with priority
console.log('7. Message Queue with Priority:');
const queue = new MessageQueue('orders');
queue.enqueue(new Message({ order: 1 }, { priority: 5 }));
queue.enqueue(new Message({ order: 2 }, { priority: 9 }));
queue.enqueue(new Message({ order: 3 }, { priority: 7 }));
console.log('Queue size:', queue.size());
console.log('First message (highest priority):', queue.dequeue().body);
console.log('Second message:', queue.dequeue().body);
console.log('');

// Example 8: Message Queue events
console.log('8. Message Queue Events:');
const eventQueue = new MessageQueue('events');
eventQueue.on('enqueue', (msg) => {
  console.log('Message enqueued:', msg.id);
});
eventQueue.on('dequeue', (msg) => {
  console.log('Message dequeued:', msg.id);
});
eventQueue.enqueue(new Message({ event: 'test' }));
eventQueue.dequeue();
console.log('');

// Example 9: JSON serialization
console.log('9. JSON Serialization:');
const message9 = new Message({ data: 'serialize me' }, { source: 'app' });
const json = message9.toJSON();
const deserialized = Message.fromJSON(json);
console.log('Original ID:', message9.id);
console.log('Deserialized ID:', deserialized.id);
console.log('IDs match:', message9.id === deserialized.id);
console.log('');

// Example 10: Correlation and reply patterns
console.log('10. Correlation and Reply:');
const request = new MessageBuilder({ action: 'getUser', userId: 42 })
  .withReplyTo('user.responses')
  .withCorrelationId('REQ-001')
  .build();

const response = new MessageBuilder({ userId: 42, name: 'John Doe' })
  .withCorrelationId(request.correlationId)
  .build();

console.log('Request sent to:', request.replyTo);
console.log('Response correlation ID:', response.correlationId);
console.log('Correlation matches:', request.correlationId === response.correlationId);

module.exports = {
  Message,
  MessageBuilder,
  MessageQueue
};
