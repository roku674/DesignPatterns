/**
 * Message Pattern Implementation
 *
 * Purpose:
 * Represents a unit of communication between applications or components in a messaging system.
 * Encapsulates data, metadata, and routing information for reliable message delivery.
 *
 * Use Cases:
 * - Inter-application communication
 * - Event-driven architectures
 * - Asynchronous processing systems
 * - Message queue implementations
 *
 * Components:
 * - Message: Base message with headers and payload
 * - MessageBuilder: Fluent API for message construction
 * - MessageValidator: Validates message structure and content
 * - MessageSerializer: Handles message serialization/deserialization
 */

/**
 * Message Header Constants
 */
const MessageHeaders = {
    MESSAGE_ID: 'messageId',
    TIMESTAMP: 'timestamp',
    CORRELATION_ID: 'correlationId',
    REPLY_TO: 'replyTo',
    CONTENT_TYPE: 'contentType',
    PRIORITY: 'priority',
    EXPIRATION: 'expiration',
    SOURCE: 'source',
    DESTINATION: 'destination',
    RETRY_COUNT: 'retryCount'
};

/**
 * Message Priority Levels
 */
const MessagePriority = {
    CRITICAL: 1,
    HIGH: 2,
    NORMAL: 3,
    LOW: 4
};

/**
 * Content Types
 */
const ContentType = {
    JSON: 'application/json',
    XML: 'application/xml',
    TEXT: 'text/plain',
    BINARY: 'application/octet-stream'
};

/**
 * Message Validation Error
 */
class MessageValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'MessageValidationError';
        this.field = field;
    }
}

/**
 * Core Message Implementation
 */
class Message {
    constructor(payload, headers = {}) {
        this.headers = {
            [MessageHeaders.MESSAGE_ID]: this._generateMessageId(),
            [MessageHeaders.TIMESTAMP]: Date.now(),
            [MessageHeaders.CONTENT_TYPE]: ContentType.JSON,
            [MessageHeaders.PRIORITY]: MessagePriority.NORMAL,
            ...headers
        };
        this.payload = payload;
        this._validated = false;
    }

    /**
     * Generate unique message ID
     */
    _generateMessageId() {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get message ID
     */
    getId() {
        return this.headers[MessageHeaders.MESSAGE_ID];
    }

    /**
     * Get message timestamp
     */
    getTimestamp() {
        return this.headers[MessageHeaders.TIMESTAMP];
    }

    /**
     * Get payload
     */
    getPayload() {
        return this.payload;
    }

    /**
     * Get all headers
     */
    getHeaders() {
        return { ...this.headers };
    }

    /**
     * Get specific header
     */
    getHeader(key) {
        return this.headers[key];
    }

    /**
     * Set header
     */
    setHeader(key, value) {
        this.headers[key] = value;
        return this;
    }

    /**
     * Remove header
     */
    removeHeader(key) {
        delete this.headers[key];
        return this;
    }

    /**
     * Check if message is expired
     */
    isExpired() {
        const expiration = this.headers[MessageHeaders.EXPIRATION];
        if (!expiration) {
            return false;
        }
        return Date.now() > expiration;
    }

    /**
     * Get message age in milliseconds
     */
    getAge() {
        return Date.now() - this.headers[MessageHeaders.TIMESTAMP];
    }

    /**
     * Clone message
     */
    clone() {
        return new Message(
            JSON.parse(JSON.stringify(this.payload)),
            { ...this.headers }
        );
    }

    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            headers: this.headers,
            payload: this.payload
        };
    }

    /**
     * Convert to string
     */
    toString() {
        return JSON.stringify(this.toJSON(), null, 2);
    }
}

/**
 * Message Builder with Fluent API
 */
class MessageBuilder {
    constructor() {
        this._payload = null;
        this._headers = {};
    }

    /**
     * Set payload
     */
    withPayload(payload) {
        this._payload = payload;
        return this;
    }

    /**
     * Set header
     */
    withHeader(key, value) {
        this._headers[key] = value;
        return this;
    }

    /**
     * Set multiple headers
     */
    withHeaders(headers) {
        this._headers = { ...this._headers, ...headers };
        return this;
    }

    /**
     * Set correlation ID
     */
    withCorrelationId(correlationId) {
        this._headers[MessageHeaders.CORRELATION_ID] = correlationId;
        return this;
    }

    /**
     * Set reply-to address
     */
    withReplyTo(replyTo) {
        this._headers[MessageHeaders.REPLY_TO] = replyTo;
        return this;
    }

    /**
     * Set content type
     */
    withContentType(contentType) {
        this._headers[MessageHeaders.CONTENT_TYPE] = contentType;
        return this;
    }

    /**
     * Set priority
     */
    withPriority(priority) {
        this._headers[MessageHeaders.PRIORITY] = priority;
        return this;
    }

    /**
     * Set expiration (milliseconds from now)
     */
    withExpiration(milliseconds) {
        this._headers[MessageHeaders.EXPIRATION] = Date.now() + milliseconds;
        return this;
    }

    /**
     * Set source
     */
    withSource(source) {
        this._headers[MessageHeaders.SOURCE] = source;
        return this;
    }

    /**
     * Set destination
     */
    withDestination(destination) {
        this._headers[MessageHeaders.DESTINATION] = destination;
        return this;
    }

    /**
     * Build message
     */
    build() {
        if (this._payload === null) {
            throw new MessageValidationError('Payload is required', 'payload');
        }
        return new Message(this._payload, this._headers);
    }

    /**
     * Reset builder
     */
    reset() {
        this._payload = null;
        this._headers = {};
        return this;
    }
}

/**
 * Message Validator
 */
class MessageValidator {
    constructor() {
        this.rules = new Map();
        this._setupDefaultRules();
    }

    /**
     * Setup default validation rules
     */
    _setupDefaultRules() {
        this.addRule('required-payload', (message) => {
            if (message.getPayload() === null || message.getPayload() === undefined) {
                throw new MessageValidationError('Payload is required', 'payload');
            }
        });

        this.addRule('valid-priority', (message) => {
            const priority = message.getHeader(MessageHeaders.PRIORITY);
            const validPriorities = Object.values(MessagePriority);
            if (priority && !validPriorities.includes(priority)) {
                throw new MessageValidationError(
                    `Invalid priority: ${priority}`,
                    MessageHeaders.PRIORITY
                );
            }
        });

        this.addRule('valid-content-type', (message) => {
            const contentType = message.getHeader(MessageHeaders.CONTENT_TYPE);
            const validTypes = Object.values(ContentType);
            if (contentType && !validTypes.includes(contentType)) {
                throw new MessageValidationError(
                    `Invalid content type: ${contentType}`,
                    MessageHeaders.CONTENT_TYPE
                );
            }
        });
    }

    /**
     * Add validation rule
     */
    addRule(name, validationFn) {
        this.rules.set(name, validationFn);
        return this;
    }

    /**
     * Remove validation rule
     */
    removeRule(name) {
        this.rules.delete(name);
        return this;
    }

    /**
     * Validate message
     */
    validate(message) {
        const errors = [];

        for (const [name, validationFn] of this.rules.entries()) {
            try {
                validationFn(message);
            } catch (error) {
                if (error instanceof MessageValidationError) {
                    errors.push({ rule: name, error });
                } else {
                    throw error;
                }
            }
        }

        if (errors.length > 0) {
            const errorMessage = errors
                .map(e => `${e.rule}: ${e.error.message}`)
                .join('; ');
            throw new MessageValidationError(`Validation failed: ${errorMessage}`);
        }

        return true;
    }
}

/**
 * Message Serializer
 */
class MessageSerializer {
    /**
     * Serialize message to string
     */
    serialize(message) {
        try {
            return JSON.stringify(message.toJSON());
        } catch (error) {
            throw new Error(`Failed to serialize message: ${error.message}`);
        }
    }

    /**
     * Deserialize string to message
     */
    deserialize(data) {
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;

            if (!parsed.headers || !('payload' in parsed)) {
                throw new Error('Invalid message format');
            }

            return new Message(parsed.payload, parsed.headers);
        } catch (error) {
            throw new Error(`Failed to deserialize message: ${error.message}`);
        }
    }

    /**
     * Serialize to Buffer
     */
    serializeToBuffer(message) {
        const jsonString = this.serialize(message);
        return Buffer.from(jsonString, 'utf8');
    }

    /**
     * Deserialize from Buffer
     */
    deserializeFromBuffer(buffer) {
        const jsonString = buffer.toString('utf8');
        return this.deserialize(jsonString);
    }
}

/**
 * Example Usage and Testing
 */
function demonstrateMessagePattern() {
    console.log('=== Message Pattern Demonstration ===\n');

    // Example 1: Basic message creation
    console.log('1. Basic Message Creation:');
    const message1 = new Message(
        { orderId: '12345', amount: 99.99 },
        { [MessageHeaders.SOURCE]: 'OrderService' }
    );
    console.log('Message ID:', message1.getId());
    console.log('Payload:', message1.getPayload());
    console.log('Headers:', message1.getHeaders());
    console.log();

    // Example 2: Using MessageBuilder
    console.log('2. Message Builder:');
    const builder = new MessageBuilder();
    const message2 = builder
        .withPayload({ userId: '999', action: 'LOGIN' })
        .withPriority(MessagePriority.HIGH)
        .withSource('AuthService')
        .withDestination('AuditService')
        .withExpiration(60000)
        .withCorrelationId('corr-123')
        .build();
    console.log('Built message:', message2.toJSON());
    console.log();

    // Example 3: Message validation
    console.log('3. Message Validation:');
    const validator = new MessageValidator();
    try {
        validator.validate(message2);
        console.log('Message validation passed');
    } catch (error) {
        console.error('Validation error:', error.message);
    }
    console.log();

    // Example 4: Message serialization
    console.log('4. Message Serialization:');
    const serializer = new MessageSerializer();
    const serialized = serializer.serialize(message2);
    console.log('Serialized:', serialized.substring(0, 100) + '...');
    const deserialized = serializer.deserialize(serialized);
    console.log('Deserialized ID:', deserialized.getId());
    console.log();

    // Example 5: Message expiration
    console.log('5. Message Expiration:');
    const expiringMessage = builder.reset()
        .withPayload({ temp: 'data' })
        .withExpiration(1000)
        .build();
    console.log('Initially expired:', expiringMessage.isExpired());
    setTimeout(() => {
        console.log('After 1.5s expired:', expiringMessage.isExpired());
        console.log('Message age:', expiringMessage.getAge(), 'ms');
    }, 1500);
}

// Export classes and constants
module.exports = {
    Message,
    MessageBuilder,
    MessageValidator,
    MessageSerializer,
    MessageHeaders,
    MessagePriority,
    ContentType,
    MessageValidationError,
    demonstrateMessagePattern
};

// Run demonstration if executed directly
if (require.main === module) {
    demonstrateMessagePattern();
}
