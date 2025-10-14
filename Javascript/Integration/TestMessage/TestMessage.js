/**
 * TestMessage Pattern
 *
 * Provides comprehensive testing infrastructure for messaging systems:
 * - Message validation and schema verification
 * - Mock message generation
 * - Message interception and inspection
 * - Test data management
 * - Assertion helpers for message properties
 * - Performance and load testing support
 *
 * Use cases:
 * - Integration testing of messaging systems
 * - Contract testing between services
 * - Load and performance testing
 * - Message format validation
 * - Debugging message flows
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');

class TestMessage extends EventEmitter {
  constructor(config = {}) {
    super();

    this.schemas = new Map();
    this.interceptedMessages = [];
    this.sentMessages = [];
    this.receivedMessages = [];
    this.maxStoredMessages = config.maxStoredMessages || 1000;
    this.validationEnabled = config.validationEnabled !== false;
    this.metricsEnabled = config.metricsEnabled !== false;
    this.mockingEnabled = config.mockingEnabled !== false;

    // Test metrics
    this.metrics = {
      totalSent: 0,
      totalReceived: 0,
      totalIntercepted: 0,
      validationFailures: 0,
      averageMessageSize: 0,
      messageSizes: [],
      validationErrors: []
    };

    // Mock responses
    this.mockResponses = new Map();
    this.mockDelays = new Map();

    // Assertions tracking
    this.assertions = [];
    this.assertionFailures = [];

    // Message templates
    this.templates = new Map();

    // Interceptors
    this.interceptors = [];
    this.interceptionEnabled = config.interceptionEnabled !== false;
  }

  /**
   * Register a message schema for validation
   */
  registerSchema(messageType, schema) {
    if (!messageType) {
      throw new Error('Message type is required');
    }

    if (!schema || typeof schema !== 'object') {
      throw new Error('Schema must be an object');
    }

    this.schemas.set(messageType, {
      schema,
      registeredAt: Date.now()
    });

    this.emit('schemaRegistered', { messageType, schema });
  }

  /**
   * Validate a message against its schema
   */
  validateMessage(message) {
    if (!this.validationEnabled) {
      return { valid: true };
    }

    if (!message || !message.type) {
      const error = 'Message must have a type property';
      this.metrics.validationFailures++;
      this.metrics.validationErrors.push({
        timestamp: Date.now(),
        error,
        message
      });
      return { valid: false, errors: [error] };
    }

    const schemaEntry = this.schemas.get(message.type);
    if (!schemaEntry) {
      return { valid: true, warning: 'No schema registered for this message type' };
    }

    const errors = this.validateAgainstSchema(message, schemaEntry.schema);

    if (errors.length > 0) {
      this.metrics.validationFailures++;
      this.metrics.validationErrors.push({
        timestamp: Date.now(),
        errors,
        message
      });
      return { valid: false, errors };
    }

    return { valid: true };
  }

  /**
   * Validate message against schema
   */
  validateAgainstSchema(message, schema, path = '') {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
      const fieldPath = path ? `${path}.${key}` : key;
      const value = message[key];

      // Required field check
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`Field ${fieldPath} is required but missing`);
        continue;
      }

      // Skip validation if field is not required and not present
      if (value === undefined || value === null) {
        continue;
      }

      // Type check
      if (rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          errors.push(`Field ${fieldPath} should be ${rules.type} but got ${actualType}`);
          continue;
        }
      }

      // Min/Max for numbers
      if (rules.type === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`Field ${fieldPath} should be >= ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`Field ${fieldPath} should be <= ${rules.max}`);
        }
      }

      // Min/Max length for strings and arrays
      if (rules.type === 'string' || rules.type === 'array') {
        const length = value.length;
        if (rules.minLength !== undefined && length < rules.minLength) {
          errors.push(`Field ${fieldPath} length should be >= ${rules.minLength}`);
        }
        if (rules.maxLength !== undefined && length > rules.maxLength) {
          errors.push(`Field ${fieldPath} length should be <= ${rules.maxLength}`);
        }
      }

      // Pattern matching for strings
      if (rules.type === 'string' && rules.pattern) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          errors.push(`Field ${fieldPath} does not match pattern ${rules.pattern}`);
        }
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`Field ${fieldPath} must be one of: ${rules.enum.join(', ')}`);
      }

      // Nested object validation
      if (rules.type === 'object' && rules.properties) {
        const nestedErrors = this.validateAgainstSchema(value, rules.properties, fieldPath);
        errors.push(...nestedErrors);
      }

      // Array item validation
      if (rules.type === 'array' && rules.items) {
        value.forEach((item, index) => {
          const itemPath = `${fieldPath}[${index}]`;
          const itemErrors = this.validateAgainstSchema({ item }, { item: rules.items }, fieldPath);
          errors.push(...itemErrors);
        });
      }

      // Custom validator
      if (rules.validator && typeof rules.validator === 'function') {
        const customResult = rules.validator(value);
        if (customResult !== true) {
          errors.push(`Field ${fieldPath} failed custom validation: ${customResult}`);
        }
      }
    }

    return errors;
  }

  /**
   * Create a test message from a template
   */
  createMessage(type, data = {}, options = {}) {
    const template = this.templates.get(type) || {};

    const message = {
      id: options.id || this.generateMessageId(),
      type,
      timestamp: options.timestamp || Date.now(),
      correlationId: options.correlationId || this.generateCorrelationId(),
      ...template,
      ...data
    };

    // Add test metadata
    if (options.testMetadata) {
      message._test = {
        generated: true,
        createdAt: Date.now(),
        ...options.testMetadata
      };
    }

    // Validate if schema exists
    if (this.validationEnabled && this.schemas.has(type)) {
      const validation = this.validateMessage(message);
      if (!validation.valid) {
        throw new Error(`Message validation failed: ${validation.errors.join(', ')}`);
      }
    }

    return message;
  }

  /**
   * Register a message template
   */
  registerTemplate(type, template) {
    if (!type) {
      throw new Error('Message type is required');
    }

    this.templates.set(type, template);
    this.emit('templateRegistered', { type, template });
  }

  /**
   * Send a test message
   */
  async sendMessage(message, options = {}) {
    // Validate message
    if (this.validationEnabled) {
      const validation = this.validateMessage(message);
      if (!validation.valid) {
        throw new Error(`Message validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Check for mock response
    if (this.mockingEnabled && this.mockResponses.has(message.type)) {
      const mockDelay = this.mockDelays.get(message.type) || 0;
      if (mockDelay > 0) {
        await this.delay(mockDelay);
      }

      const mockResponse = this.mockResponses.get(message.type);
      const response = typeof mockResponse === 'function'
        ? mockResponse(message)
        : mockResponse;

      this.sentMessages.push({
        message,
        timestamp: Date.now(),
        mocked: true,
        response
      });

      this.metrics.totalSent++;
      this.updateMessageSizeMetrics(message);

      this.emit('messageSent', { message, mocked: true, response });

      return response;
    }

    // Intercept if enabled
    if (this.interceptionEnabled) {
      await this.interceptMessage(message, 'outgoing');
    }

    // Store sent message
    this.sentMessages.push({
      message,
      timestamp: Date.now(),
      mocked: false
    });

    // Trim if exceeds max
    if (this.sentMessages.length > this.maxStoredMessages) {
      this.sentMessages = this.sentMessages.slice(-this.maxStoredMessages);
    }

    this.metrics.totalSent++;
    this.updateMessageSizeMetrics(message);

    this.emit('messageSent', { message, mocked: false });

    // Call actual send handler if provided
    if (options.sendHandler) {
      return await options.sendHandler(message);
    }

    return { success: true, messageId: message.id };
  }

  /**
   * Receive a test message
   */
  async receiveMessage(message, options = {}) {
    // Validate message
    if (this.validationEnabled) {
      const validation = this.validateMessage(message);
      if (!validation.valid && options.strict !== false) {
        throw new Error(`Message validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Intercept if enabled
    if (this.interceptionEnabled) {
      await this.interceptMessage(message, 'incoming');
    }

    // Store received message
    this.receivedMessages.push({
      message,
      timestamp: Date.now()
    });

    // Trim if exceeds max
    if (this.receivedMessages.length > this.maxStoredMessages) {
      this.receivedMessages = this.receivedMessages.slice(-this.maxStoredMessages);
    }

    this.metrics.totalReceived++;
    this.updateMessageSizeMetrics(message);

    this.emit('messageReceived', { message });

    return { success: true, messageId: message.id };
  }

  /**
   * Intercept a message
   */
  async interceptMessage(message, direction) {
    for (const interceptor of this.interceptors) {
      if (interceptor.direction === direction || interceptor.direction === 'both') {
        try {
          await interceptor.handler(message, direction);
        } catch (error) {
          this.emit('interceptorError', { error, interceptor, message });
        }
      }
    }

    this.interceptedMessages.push({
      message,
      direction,
      timestamp: Date.now()
    });

    this.metrics.totalIntercepted++;

    // Trim if exceeds max
    if (this.interceptedMessages.length > this.maxStoredMessages) {
      this.interceptedMessages = this.interceptedMessages.slice(-this.maxStoredMessages);
    }
  }

  /**
   * Add an interceptor
   */
  addInterceptor(handler, options = {}) {
    const interceptor = {
      id: this.generateInterceptorId(),
      handler,
      direction: options.direction || 'both',
      createdAt: Date.now()
    };

    this.interceptors.push(interceptor);

    return interceptor.id;
  }

  /**
   * Remove an interceptor
   */
  removeInterceptor(interceptorId) {
    const index = this.interceptors.findIndex(i => i.id === interceptorId);
    if (index !== -1) {
      this.interceptors.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Register a mock response for a message type
   */
  mockResponse(messageType, response, delay = 0) {
    this.mockResponses.set(messageType, response);
    if (delay > 0) {
      this.mockDelays.set(messageType, delay);
    }
  }

  /**
   * Clear mock response
   */
  clearMock(messageType) {
    this.mockResponses.delete(messageType);
    this.mockDelays.delete(messageType);
  }

  /**
   * Clear all mocks
   */
  clearAllMocks() {
    this.mockResponses.clear();
    this.mockDelays.clear();
  }

  /**
   * Assert that a message was sent
   */
  assertMessageSent(predicate) {
    const found = this.sentMessages.some(entry => {
      return typeof predicate === 'function'
        ? predicate(entry.message)
        : entry.message.type === predicate;
    });

    const assertion = {
      type: 'messageSent',
      predicate,
      passed: found,
      timestamp: Date.now()
    };

    this.assertions.push(assertion);

    if (!found) {
      this.assertionFailures.push(assertion);
      throw new Error(`Assertion failed: Message not sent matching predicate`);
    }

    return true;
  }

  /**
   * Assert that a message was received
   */
  assertMessageReceived(predicate) {
    const found = this.receivedMessages.some(entry => {
      return typeof predicate === 'function'
        ? predicate(entry.message)
        : entry.message.type === predicate;
    });

    const assertion = {
      type: 'messageReceived',
      predicate,
      passed: found,
      timestamp: Date.now()
    };

    this.assertions.push(assertion);

    if (!found) {
      this.assertionFailures.push(assertion);
      throw new Error(`Assertion failed: Message not received matching predicate`);
    }

    return true;
  }

  /**
   * Get all sent messages
   */
  getSentMessages(filter = null) {
    if (!filter) {
      return this.sentMessages.map(e => e.message);
    }

    return this.sentMessages
      .filter(entry => filter(entry.message))
      .map(e => e.message);
  }

  /**
   * Get all received messages
   */
  getReceivedMessages(filter = null) {
    if (!filter) {
      return this.receivedMessages.map(e => e.message);
    }

    return this.receivedMessages
      .filter(entry => filter(entry.message))
      .map(e => e.message);
  }

  /**
   * Get all intercepted messages
   */
  getInterceptedMessages(direction = null) {
    if (!direction) {
      return this.interceptedMessages.map(e => e.message);
    }

    return this.interceptedMessages
      .filter(entry => entry.direction === direction)
      .map(e => e.message);
  }

  /**
   * Update message size metrics
   */
  updateMessageSizeMetrics(message) {
    const size = JSON.stringify(message).length;
    this.metrics.messageSizes.push(size);

    // Keep only last 100 sizes
    if (this.metrics.messageSizes.length > 100) {
      this.metrics.messageSizes = this.metrics.messageSizes.slice(-100);
    }

    // Calculate average
    const sum = this.metrics.messageSizes.reduce((a, b) => a + b, 0);
    this.metrics.averageMessageSize = sum / this.metrics.messageSizes.length;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      storedSentMessages: this.sentMessages.length,
      storedReceivedMessages: this.receivedMessages.length,
      storedInterceptedMessages: this.interceptedMessages.length,
      totalAssertions: this.assertions.length,
      failedAssertions: this.assertionFailures.length,
      registeredSchemas: this.schemas.size,
      registeredTemplates: this.templates.size,
      activeMocks: this.mockResponses.size,
      activeInterceptors: this.interceptors.length
    };
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate correlation ID
   */
  generateCorrelationId() {
    return `corr_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate interceptor ID
   */
  generateInterceptorId() {
    return `int_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all stored messages
   */
  clearMessages() {
    this.sentMessages = [];
    this.receivedMessages = [];
    this.interceptedMessages = [];
  }

  /**
   * Reset all state
   */
  reset() {
    this.clearMessages();
    this.clearAllMocks();
    this.interceptors = [];
    this.assertions = [];
    this.assertionFailures = [];
    this.metrics = {
      totalSent: 0,
      totalReceived: 0,
      totalIntercepted: 0,
      validationFailures: 0,
      averageMessageSize: 0,
      messageSizes: [],
      validationErrors: []
    };
    this.emit('reset');
  }
}

module.exports = TestMessage;
