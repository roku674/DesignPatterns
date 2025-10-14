/**
 * MessagingGateway Pattern Implementation
 *
 * Purpose:
 * Encapsulates access to the messaging system providing a simple interface
 * for application code to send and receive messages without knowing messaging details.
 *
 * Use Cases:
 * - Simplifying messaging API
 * - Hiding messaging complexity from business logic
 * - Testing message-driven applications
 * - Centralizing messaging configuration
 *
 * Components:
 * - MessagingGateway: Base gateway interface
 * - SimpleGateway: Basic send/receive operations
 * - TransactionalGateway: Transaction-aware messaging
 * - AsyncGateway: Asynchronous messaging support
 */

const EventEmitter = require('events');

/**
 * Gateway Error
 */
class GatewayError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'GatewayError';
        this.code = code;
    }
}

/**
 * Base Messaging Gateway
 */
class MessagingGateway extends EventEmitter {
    constructor(channel, options = {}) {
        super();
        this.channel = channel;
        this.defaultTimeout = options.timeout || 5000;
        this.defaultHeaders = options.defaultHeaders || {};
        this.messageTransformer = options.messageTransformer || null;
        this.replyTransformer = options.replyTransformer || null;
        this.sentCount = 0;
        this.receivedCount = 0;
        this.errorCount = 0;
    }

    /**
     * Send message
     */
    async send(payload, headers = {}) {
        try {
            const message = this._createMessage(payload, headers);
            const transformedMessage = this.messageTransformer
                ? this.messageTransformer(message)
                : message;

            await this.channel.send(transformedMessage);
            this.sentCount++;
            this.emit('sent', transformedMessage);
            return true;
        } catch (error) {
            this.errorCount++;
            this.emit('send-error', error, payload);
            throw new GatewayError(
                `Failed to send message: ${error.message}`,
                'SEND_FAILED'
            );
        }
    }

    /**
     * Send and wait for reply
     */
    async sendAndReceive(payload, headers = {}, timeout = this.defaultTimeout) {
        try {
            const correlationId = this._generateCorrelationId();
            const message = this._createMessage(payload, {
                ...headers,
                correlationId,
                replyRequired: true
            });

            const replyPromise = this._waitForReply(correlationId, timeout);
            await this.channel.send(message);
            this.sentCount++;

            const reply = await replyPromise;
            this.receivedCount++;

            const transformedReply = this.replyTransformer
                ? this.replyTransformer(reply)
                : reply;

            this.emit('reply-received', transformedReply);
            return transformedReply;
        } catch (error) {
            this.errorCount++;
            this.emit('error', error);
            throw new GatewayError(
                `Failed to send and receive: ${error.message}`,
                'SEND_RECEIVE_FAILED'
            );
        }
    }

    /**
     * Receive message
     */
    async receive(timeout = this.defaultTimeout) {
        try {
            const message = await this.channel.receive(timeout);
            if (message) {
                this.receivedCount++;
                this.emit('received', message);
            }
            return message;
        } catch (error) {
            this.errorCount++;
            this.emit('receive-error', error);
            throw new GatewayError(
                `Failed to receive message: ${error.message}`,
                'RECEIVE_FAILED'
            );
        }
    }

    /**
     * Create message with defaults
     */
    _createMessage(payload, headers = {}) {
        return {
            payload,
            headers: {
                ...this.defaultHeaders,
                ...headers,
                timestamp: Date.now()
            }
        };
    }

    /**
     * Generate correlation ID
     */
    _generateCorrelationId() {
        return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Wait for reply with correlation ID
     */
    _waitForReply(correlationId, timeout) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.removeListener('reply', replyHandler);
                reject(new GatewayError('Reply timeout', 'TIMEOUT'));
            }, timeout);

            const replyHandler = (message) => {
                const msgCorrelationId = message.headers
                    ? message.headers.correlationId
                    : null;

                if (msgCorrelationId === correlationId) {
                    clearTimeout(timeoutId);
                    this.removeListener('reply', replyHandler);
                    resolve(message);
                }
            };

            this.on('reply', replyHandler);
        });
    }

    /**
     * Handle incoming reply
     */
    handleReply(message) {
        this.emit('reply', message);
    }

    /**
     * Get gateway statistics
     */
    getStats() {
        return {
            sentCount: this.sentCount,
            receivedCount: this.receivedCount,
            errorCount: this.errorCount
        };
    }
}

/**
 * Simple Messaging Gateway
 */
class SimpleGateway extends MessagingGateway {
    constructor(channel, options = {}) {
        super(channel, options);
        this.handlers = new Map();
    }

    /**
     * Register message handler
     */
    registerHandler(messageType, handler) {
        this.handlers.set(messageType, handler);
        return this;
    }

    /**
     * Unregister message handler
     */
    unregisterHandler(messageType) {
        this.handlers.delete(messageType);
        return this;
    }

    /**
     * Handle incoming message
     */
    async handleMessage(message) {
        const messageType = message.headers ? message.headers.type : 'default';
        const handler = this.handlers.get(messageType) || this.handlers.get('default');

        if (!handler) {
            throw new GatewayError(
                `No handler registered for message type: ${messageType}`,
                'NO_HANDLER'
            );
        }

        try {
            const result = await handler(message.payload, message.headers);
            this.emit('handled', messageType, result);
            return result;
        } catch (error) {
            this.errorCount++;
            this.emit('handler-error', error, message);
            throw error;
        }
    }
}

/**
 * Transactional Gateway
 */
class TransactionalGateway extends MessagingGateway {
    constructor(channel, options = {}) {
        super(channel, options);
        this.activeTransactions = new Map();
        this.transactionTimeout = options.transactionTimeout || 30000;
    }

    /**
     * Begin transaction
     */
    beginTransaction() {
        const transactionId = this._generateTransactionId();
        this.activeTransactions.set(transactionId, {
            messages: [],
            startTime: Date.now(),
            status: 'active'
        });
        this.emit('transaction-started', transactionId);
        return transactionId;
    }

    /**
     * Send message within transaction
     */
    async sendTransactional(transactionId, payload, headers = {}) {
        const transaction = this.activeTransactions.get(transactionId);
        if (!transaction) {
            throw new GatewayError(
                `Transaction ${transactionId} not found`,
                'TRANSACTION_NOT_FOUND'
            );
        }

        if (transaction.status !== 'active') {
            throw new GatewayError(
                `Transaction ${transactionId} is not active`,
                'TRANSACTION_NOT_ACTIVE'
            );
        }

        const message = this._createMessage(payload, {
            ...headers,
            transactionId
        });

        transaction.messages.push(message);
        this.emit('message-added-to-transaction', transactionId, message);
        return true;
    }

    /**
     * Commit transaction
     */
    async commitTransaction(transactionId) {
        const transaction = this.activeTransactions.get(transactionId);
        if (!transaction) {
            throw new GatewayError(
                `Transaction ${transactionId} not found`,
                'TRANSACTION_NOT_FOUND'
            );
        }

        try {
            for (const message of transaction.messages) {
                await this.channel.send(message);
                this.sentCount++;
            }

            transaction.status = 'committed';
            this.emit('transaction-committed', transactionId, transaction.messages.length);
            this.activeTransactions.delete(transactionId);
            return true;
        } catch (error) {
            transaction.status = 'failed';
            this.emit('transaction-failed', transactionId, error);
            throw new GatewayError(
                `Failed to commit transaction: ${error.message}`,
                'COMMIT_FAILED'
            );
        }
    }

    /**
     * Rollback transaction
     */
    rollbackTransaction(transactionId) {
        const transaction = this.activeTransactions.get(transactionId);
        if (!transaction) {
            throw new GatewayError(
                `Transaction ${transactionId} not found`,
                'TRANSACTION_NOT_FOUND'
            );
        }

        transaction.status = 'rolled-back';
        this.emit('transaction-rolled-back', transactionId);
        this.activeTransactions.delete(transactionId);
        return true;
    }

    /**
     * Generate transaction ID
     */
    _generateTransactionId() {
        return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Async Messaging Gateway
 */
class AsyncGateway extends MessagingGateway {
    constructor(channel, options = {}) {
        super(channel, options);
        this.pendingCallbacks = new Map();
        this.asyncTimeout = options.asyncTimeout || 60000;
    }

    /**
     * Send message with callback
     */
    sendAsync(payload, headers = {}, callback) {
        const messageId = this._generateCorrelationId();
        const timeoutId = setTimeout(() => {
            const cb = this.pendingCallbacks.get(messageId);
            if (cb) {
                this.pendingCallbacks.delete(messageId);
                cb(new GatewayError('Async operation timeout', 'TIMEOUT'), null);
            }
        }, this.asyncTimeout);

        this.pendingCallbacks.set(messageId, {
            callback,
            timeoutId,
            sentAt: Date.now()
        });

        this.send(payload, { ...headers, messageId })
            .then(() => {
                this.emit('async-sent', messageId);
            })
            .catch(error => {
                const cb = this.pendingCallbacks.get(messageId);
                if (cb) {
                    clearTimeout(cb.timeoutId);
                    this.pendingCallbacks.delete(messageId);
                    cb.callback(error, null);
                }
            });

        return messageId;
    }

    /**
     * Complete async operation
     */
    completeAsync(messageId, result) {
        const pending = this.pendingCallbacks.get(messageId);
        if (!pending) {
            this.emit('late-completion', messageId);
            return false;
        }

        clearTimeout(pending.timeoutId);
        this.pendingCallbacks.delete(messageId);
        pending.callback(null, result);
        this.emit('async-completed', messageId);
        return true;
    }

    /**
     * Fail async operation
     */
    failAsync(messageId, error) {
        const pending = this.pendingCallbacks.get(messageId);
        if (!pending) {
            return false;
        }

        clearTimeout(pending.timeoutId);
        this.pendingCallbacks.delete(messageId);
        pending.callback(error, null);
        this.emit('async-failed', messageId, error);
        return true;
    }
}

/**
 * Example Usage and Testing
 */
function demonstrateMessagingGatewayPattern() {
    console.log('=== MessagingGateway Pattern Demonstration ===\n');

    // Mock channel
    const mockChannel = {
        send: async (msg) => {
            console.log('Channel sending:', msg.payload);
            return true;
        },
        receive: async (timeout) => {
            return { payload: { status: 'ok' }, headers: {} };
        }
    };

    // Example 1: Simple Gateway
    console.log('1. Simple Gateway:');
    const simpleGateway = new SimpleGateway(mockChannel);
    simpleGateway.registerHandler('order', async (payload) => {
        console.log('Handling order:', payload);
        return { orderId: payload.id, status: 'processed' };
    });

    simpleGateway.send({ orderId: '123', amount: 99.99 }, { type: 'order' })
        .then(() => console.log('Message sent via simple gateway'));
    console.log();

    // Example 2: Transactional Gateway
    console.log('2. Transactional Gateway:');
    const txGateway = new TransactionalGateway(mockChannel);
    const txId = txGateway.beginTransaction();
    console.log('Transaction started:', txId);

    txGateway.sendTransactional(txId, { item: 'A' })
        .then(() => txGateway.sendTransactional(txId, { item: 'B' }))
        .then(() => txGateway.commitTransaction(txId))
        .then(() => console.log('Transaction committed'));
    console.log();

    // Example 3: Async Gateway
    console.log('3. Async Gateway:');
    const asyncGateway = new AsyncGateway(mockChannel);
    const asyncMsgId = asyncGateway.sendAsync(
        { data: 'async message' },
        {},
        (err, result) => {
            if (err) {
                console.error('Async error:', err.message);
            } else {
                console.log('Async result:', result);
            }
        }
    );
    console.log('Async message sent with ID:', asyncMsgId);

    setTimeout(() => {
        asyncGateway.completeAsync(asyncMsgId, { success: true });
    }, 100);
    console.log();

    // Example 4: Gateway Statistics
    setTimeout(() => {
        console.log('4. Gateway Statistics:');
        console.log('Simple Gateway Stats:', simpleGateway.getStats());
    }, 200);
}

// Export classes
module.exports = {
    MessagingGateway,
    SimpleGateway,
    TransactionalGateway,
    AsyncGateway,
    GatewayError,
    demonstrateMessagingGatewayPattern
};

// Run demonstration if executed directly
if (require.main === module) {
    demonstrateMessagingGatewayPattern();
}
