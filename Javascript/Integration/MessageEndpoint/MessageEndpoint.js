/**
 * MessageEndpoint Pattern Implementation
 *
 * Purpose:
 * Connects application code to the messaging system. Acts as the interface
 * between domain logic and message channels.
 *
 * Use Cases:
 * - Service integration points
 * - Message consumption and production
 * - Request-reply messaging
 * - Event handlers
 *
 * Components:
 * - MessageEndpoint: Base endpoint
 * - PollingEndpoint: Polls for messages
 * - EventDrivenEndpoint: Event-based consumption
 * - ServiceActivator: Connects service methods to messaging
 */

const EventEmitter = require('events');

/**
 * Endpoint Error
 */
class EndpointError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'EndpointError';
        this.code = code;
    }
}

/**
 * Endpoint Status
 */
const EndpointStatus = {
    STOPPED: 'stopped',
    STARTING: 'starting',
    RUNNING: 'running',
    STOPPING: 'stopping',
    FAILED: 'failed'
};

/**
 * Base Message Endpoint
 */
class MessageEndpoint extends EventEmitter {
    constructor(name, channel, options = {}) {
        super();
        this.name = name;
        this.channel = channel;
        this.handler = options.handler || null;
        this.errorHandler = options.errorHandler || null;
        this.status = EndpointStatus.STOPPED;
        this.messagesProcessed = 0;
        this.messagesRejected = 0;
        this.errorCount = 0;
    }

    /**
     * Start endpoint
     */
    async start() {
        if (this.status === EndpointStatus.RUNNING) {
            throw new EndpointError('Endpoint already running', 'ALREADY_RUNNING');
        }

        this.status = EndpointStatus.STARTING;
        this.emit('starting');

        try {
            await this._doStart();
            this.status = EndpointStatus.RUNNING;
            this.emit('started');
        } catch (error) {
            this.status = EndpointStatus.FAILED;
            this.emit('failed', error);
            throw error;
        }
    }

    /**
     * Stop endpoint
     */
    async stop() {
        if (this.status !== EndpointStatus.RUNNING) {
            return;
        }

        this.status = EndpointStatus.STOPPING;
        this.emit('stopping');

        try {
            await this._doStop();
            this.status = EndpointStatus.STOPPED;
            this.emit('stopped');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Send message through endpoint
     */
    async send(message) {
        if (this.status !== EndpointStatus.RUNNING) {
            throw new EndpointError('Endpoint not running', 'NOT_RUNNING');
        }

        try {
            await this.channel.send(message);
            this.emit('sent', message);
            return true;
        } catch (error) {
            this.errorCount++;
            this.emit('send-error', error, message);
            throw error;
        }
    }

    /**
     * Handle received message
     */
    async handleMessage(message) {
        try {
            if (!this.handler) {
                throw new EndpointError('No message handler configured', 'NO_HANDLER');
            }

            const result = await this.handler(message);
            this.messagesProcessed++;
            this.emit('processed', message, result);
            return result;
        } catch (error) {
            this.errorCount++;
            this.emit('processing-error', error, message);

            if (this.errorHandler) {
                try {
                    await this.errorHandler(error, message);
                } catch (handlerError) {
                    this.emit('error-handler-failed', handlerError, message);
                }
            }

            throw error;
        }
    }

    /**
     * Set message handler
     */
    setHandler(handler) {
        this.handler = handler;
        return this;
    }

    /**
     * Set error handler
     */
    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
        return this;
    }

    /**
     * Get endpoint statistics
     */
    getStats() {
        return {
            name: this.name,
            status: this.status,
            messagesProcessed: this.messagesProcessed,
            messagesRejected: this.messagesRejected,
            errorCount: this.errorCount
        };
    }

    /**
     * Internal start implementation
     */
    async _doStart() {
        // Override in subclasses
    }

    /**
     * Internal stop implementation
     */
    async _doStop() {
        // Override in subclasses
    }
}

/**
 * Polling Endpoint
 */
class PollingEndpoint extends MessageEndpoint {
    constructor(name, channel, options = {}) {
        super(name, channel, options);
        this.pollingInterval = options.pollingInterval || 1000;
        this.pollingTimer = null;
    }

    async _doStart() {
        this._startPolling();
    }

    async _doStop() {
        this._stopPolling();
    }

    _startPolling() {
        this._stopPolling();

        this.pollingTimer = setInterval(async () => {
            try {
                const message = await this.channel.receive(0);
                if (message) {
                    await this.handleMessage(message);
                }
            } catch (error) {
                this.emit('polling-error', error);
            }
        }, this.pollingInterval);
    }

    _stopPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
        }
    }

    setPollingInterval(interval) {
        this.pollingInterval = interval;
        if (this.status === EndpointStatus.RUNNING) {
            this._startPolling();
        }
        return this;
    }
}

/**
 * Event-Driven Endpoint
 */
class EventDrivenEndpoint extends MessageEndpoint {
    constructor(name, channel, options = {}) {
        super(name, channel, options);
        this.messageListener = null;
    }

    async _doStart() {
        this.messageListener = async (message) => {
            try {
                await this.handleMessage(message);
            } catch (error) {
                // Error already handled in handleMessage
            }
        };

        this.channel.on('message', this.messageListener);
    }

    async _doStop() {
        if (this.messageListener) {
            this.channel.removeListener('message', this.messageListener);
            this.messageListener = null;
        }
    }
}

/**
 * Service Activator Endpoint
 */
class ServiceActivator extends MessageEndpoint {
    constructor(name, channel, service, methodName, options = {}) {
        super(name, channel, options);
        this.service = service;
        this.methodName = methodName;
        this.replyChannel = options.replyChannel || null;
    }

    async handleMessage(message) {
        try {
            if (!this.service[this.methodName]) {
                throw new EndpointError(
                    `Method ${this.methodName} not found on service`,
                    'METHOD_NOT_FOUND'
                );
            }

            const payload = message.getPayload ? message.getPayload() : message;
            const result = await this.service[this.methodName](payload);

            this.messagesProcessed++;
            this.emit('processed', message, result);

            if (this.replyChannel && message.getHeader && message.getHeader('replyTo')) {
                const replyMessage = {
                    payload: result,
                    headers: {
                        correlationId: message.getId ? message.getId() : undefined
                    }
                };
                await this.replyChannel.send(replyMessage);
            }

            return result;
        } catch (error) {
            this.errorCount++;
            this.emit('activation-error', error, message);
            throw error;
        }
    }
}

/**
 * Request-Reply Endpoint
 */
class RequestReplyEndpoint extends MessageEndpoint {
    constructor(name, requestChannel, options = {}) {
        super(name, requestChannel, options);
        this.pendingRequests = new Map();
        this.timeout = options.timeout || 30000;
        this.replyChannel = options.replyChannel || null;
    }

    async sendAndWait(message) {
        if (this.status !== EndpointStatus.RUNNING) {
            throw new EndpointError('Endpoint not running', 'NOT_RUNNING');
        }

        return new Promise((resolve, reject) => {
            const requestId = message.getId ? message.getId() : `req-${Date.now()}`;
            const timeoutId = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new EndpointError('Request timeout', 'TIMEOUT'));
            }, this.timeout);

            this.pendingRequests.set(requestId, {
                resolve,
                reject,
                timeoutId,
                sentAt: Date.now()
            });

            if (message.setHeader) {
                message.setHeader('replyTo', this.replyChannel ? this.replyChannel.name : 'reply');
                message.setHeader('correlationId', requestId);
            }

            this.channel.send(message)
                .catch(error => {
                    clearTimeout(timeoutId);
                    this.pendingRequests.delete(requestId);
                    reject(error);
                });
        });
    }

    handleReply(replyMessage) {
        const correlationId = replyMessage.getHeader
            ? replyMessage.getHeader('correlationId')
            : null;

        if (!correlationId) {
            this.emit('uncorrelated-reply', replyMessage);
            return;
        }

        const pendingRequest = this.pendingRequests.get(correlationId);
        if (pendingRequest) {
            clearTimeout(pendingRequest.timeoutId);
            this.pendingRequests.delete(correlationId);
            pendingRequest.resolve(replyMessage);
            this.emit('reply-received', correlationId, replyMessage);
        } else {
            this.emit('late-reply', correlationId, replyMessage);
        }
    }

    async _doStart() {
        if (this.replyChannel) {
            this.replyListener = (message) => this.handleReply(message);
            this.replyChannel.on('message', this.replyListener);
        }
    }

    async _doStop() {
        if (this.replyListener && this.replyChannel) {
            this.replyChannel.removeListener('message', this.replyListener);
            this.replyListener = null;
        }

        for (const [id, request] of this.pendingRequests.entries()) {
            clearTimeout(request.timeoutId);
            request.reject(new EndpointError('Endpoint stopped', 'STOPPED'));
        }
        this.pendingRequests.clear();
    }
}

/**
 * Example Usage and Testing
 */
function demonstrateMessageEndpointPattern() {
    console.log('=== MessageEndpoint Pattern Demonstration ===\n');

    // Mock channel for testing
    const mockChannel = new EventEmitter();
    mockChannel.send = async (msg) => { mockChannel.emit('message', msg); };
    mockChannel.receive = async () => null;

    // Example 1: Event-Driven Endpoint
    console.log('1. Event-Driven Endpoint:');
    const eventEndpoint = new EventDrivenEndpoint('event-consumer', mockChannel);
    eventEndpoint.setHandler(async (message) => {
        console.log('Processing message:', message);
        return { status: 'processed' };
    });

    eventEndpoint.start().then(() => {
        console.log('Event endpoint started');
        mockChannel.emit('message', { data: 'test message' });
    });
    console.log();

    // Example 2: Service Activator
    console.log('2. Service Activator:');
    const orderService = {
        processOrder: async (order) => {
            console.log('Processing order:', order);
            return { orderId: order.id, status: 'completed' };
        }
    };

    const activator = new ServiceActivator(
        'order-activator',
        mockChannel,
        orderService,
        'processOrder'
    );

    activator.on('processed', (msg, result) => {
        console.log('Service activation result:', result);
    });
    console.log();

    // Example 3: Endpoint Statistics
    console.log('3. Endpoint Statistics:');
    setTimeout(() => {
        console.log('Event Endpoint Stats:', eventEndpoint.getStats());
    }, 100);
}

// Export classes
module.exports = {
    MessageEndpoint,
    PollingEndpoint,
    EventDrivenEndpoint,
    ServiceActivator,
    RequestReplyEndpoint,
    EndpointStatus,
    EndpointError,
    demonstrateMessageEndpointPattern
};

// Run demonstration if executed directly
if (require.main === module) {
    demonstrateMessageEndpointPattern();
}
