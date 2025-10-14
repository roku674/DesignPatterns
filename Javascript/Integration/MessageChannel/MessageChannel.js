/**
 * MessageChannel Pattern Implementation
 *
 * Purpose:
 * Provides a communication pathway for messages between senders and receivers.
 * Decouples message producers from consumers and handles message delivery semantics.
 *
 * Use Cases:
 * - Point-to-point messaging
 * - Publish-subscribe systems
 * - Message buffering and queuing
 * - Asynchronous communication
 *
 * Components:
 * - MessageChannel: Base channel interface
 * - PointToPointChannel: One sender, one receiver
 * - PublishSubscribeChannel: One sender, multiple receivers
 * - ChannelInterceptor: Intercepts messages for logging/transformation
 */

const EventEmitter = require('events');

/**
 * Channel Types
 */
const ChannelType = {
    POINT_TO_POINT: 'point-to-point',
    PUBLISH_SUBSCRIBE: 'publish-subscribe',
    PRIORITY: 'priority',
    DEAD_LETTER: 'dead-letter'
};

/**
 * Channel Status
 */
const ChannelStatus = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    CLOSED: 'closed'
};

/**
 * Channel Error
 */
class ChannelError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'ChannelError';
        this.code = code;
    }
}

/**
 * Base Message Channel
 */
class MessageChannel extends EventEmitter {
    constructor(name, options = {}) {
        super();
        this.name = name;
        this.type = options.type || ChannelType.POINT_TO_POINT;
        this.capacity = options.capacity || Infinity;
        this.status = ChannelStatus.ACTIVE;
        this.queue = [];
        this.subscribers = new Set();
        this.interceptors = [];
        this.messageCount = 0;
        this.errorCount = 0;
        this.startTime = Date.now();
    }

    /**
     * Send message to channel
     */
    send(message) {
        if (this.status === ChannelStatus.CLOSED) {
            throw new ChannelError('Channel is closed', 'CHANNEL_CLOSED');
        }

        if (this.status === ChannelStatus.PAUSED) {
            throw new ChannelError('Channel is paused', 'CHANNEL_PAUSED');
        }

        if (this.queue.length >= this.capacity) {
            throw new ChannelError('Channel capacity exceeded', 'CAPACITY_EXCEEDED');
        }

        try {
            const processedMessage = this._applyInterceptors(message, 'preSend');
            this.queue.push(processedMessage);
            this.messageCount++;
            this.emit('message', processedMessage);
            this._deliver();
            return true;
        } catch (error) {
            this.errorCount++;
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Receive message from channel
     */
    receive(timeout = 0) {
        return new Promise((resolve, reject) => {
            if (this.status === ChannelStatus.CLOSED) {
                reject(new ChannelError('Channel is closed', 'CHANNEL_CLOSED'));
                return;
            }

            if (this.queue.length > 0) {
                const message = this.queue.shift();
                const processedMessage = this._applyInterceptors(message, 'postReceive');
                resolve(processedMessage);
                return;
            }

            if (timeout === 0) {
                resolve(null);
                return;
            }

            const timeoutId = setTimeout(() => {
                this.removeListener('message', messageHandler);
                resolve(null);
            }, timeout);

            const messageHandler = (message) => {
                clearTimeout(timeoutId);
                const processedMessage = this._applyInterceptors(message, 'postReceive');
                resolve(processedMessage);
            };

            this.once('message', messageHandler);
        });
    }

    /**
     * Subscribe to channel (for publish-subscribe)
     */
    subscribe(handler) {
        if (this.type !== ChannelType.PUBLISH_SUBSCRIBE) {
            throw new ChannelError(
                'Subscribe only available for publish-subscribe channels',
                'INVALID_OPERATION'
            );
        }

        this.subscribers.add(handler);
        return () => this.unsubscribe(handler);
    }

    /**
     * Unsubscribe from channel
     */
    unsubscribe(handler) {
        this.subscribers.delete(handler);
    }

    /**
     * Add channel interceptor
     */
    addInterceptor(interceptor) {
        this.interceptors.push(interceptor);
        return this;
    }

    /**
     * Remove channel interceptor
     */
    removeInterceptor(interceptor) {
        const index = this.interceptors.indexOf(interceptor);
        if (index > -1) {
            this.interceptors.splice(index, 1);
        }
        return this;
    }

    /**
     * Apply interceptors to message
     */
    _applyInterceptors(message, phase) {
        let processedMessage = message;

        for (const interceptor of this.interceptors) {
            if (interceptor[phase]) {
                processedMessage = interceptor[phase](processedMessage, this);
            }
        }

        return processedMessage;
    }

    /**
     * Deliver message to subscribers
     */
    _deliver() {
        if (this.type === ChannelType.PUBLISH_SUBSCRIBE && this.queue.length > 0) {
            const message = this.queue.shift();
            this.subscribers.forEach(handler => {
                try {
                    handler(message);
                } catch (error) {
                    this.emit('subscriber-error', error, handler);
                }
            });
        }
    }

    /**
     * Pause channel
     */
    pause() {
        this.status = ChannelStatus.PAUSED;
        this.emit('paused');
        return this;
    }

    /**
     * Resume channel
     */
    resume() {
        this.status = ChannelStatus.ACTIVE;
        this.emit('resumed');
        return this;
    }

    /**
     * Close channel
     */
    close() {
        this.status = ChannelStatus.CLOSED;
        this.queue = [];
        this.subscribers.clear();
        this.emit('closed');
        this.removeAllListeners();
        return this;
    }

    /**
     * Get channel statistics
     */
    getStats() {
        return {
            name: this.name,
            type: this.type,
            status: this.status,
            queueSize: this.queue.length,
            capacity: this.capacity,
            subscriberCount: this.subscribers.size,
            messageCount: this.messageCount,
            errorCount: this.errorCount,
            uptime: Date.now() - this.startTime
        };
    }

    /**
     * Clear channel queue
     */
    clear() {
        const clearedCount = this.queue.length;
        this.queue = [];
        this.emit('cleared', clearedCount);
        return clearedCount;
    }
}

/**
 * Point-to-Point Channel
 */
class PointToPointChannel extends MessageChannel {
    constructor(name, options = {}) {
        super(name, { ...options, type: ChannelType.POINT_TO_POINT });
    }
}

/**
 * Publish-Subscribe Channel
 */
class PublishSubscribeChannel extends MessageChannel {
    constructor(name, options = {}) {
        super(name, { ...options, type: ChannelType.PUBLISH_SUBSCRIBE });
    }

    /**
     * Publish message to all subscribers
     */
    publish(message) {
        return this.send(message);
    }
}

/**
 * Priority Channel
 */
class PriorityChannel extends MessageChannel {
    constructor(name, options = {}) {
        super(name, { ...options, type: ChannelType.PRIORITY });
    }

    /**
     * Send message with priority sorting
     */
    send(message) {
        if (this.status === ChannelStatus.CLOSED) {
            throw new ChannelError('Channel is closed', 'CHANNEL_CLOSED');
        }

        if (this.queue.length >= this.capacity) {
            throw new ChannelError('Channel capacity exceeded', 'CAPACITY_EXCEEDED');
        }

        const processedMessage = this._applyInterceptors(message, 'preSend');
        this.queue.push(processedMessage);
        this.queue.sort((a, b) => {
            const priorityA = a.getHeader ? (a.getHeader('priority') || 3) : 3;
            const priorityB = b.getHeader ? (b.getHeader('priority') || 3) : 3;
            return priorityA - priorityB;
        });

        this.messageCount++;
        this.emit('message', processedMessage);
        return true;
    }
}

/**
 * Logging Interceptor
 */
class LoggingInterceptor {
    constructor(logger = console) {
        this.logger = logger;
    }

    preSend(message, channel) {
        this.logger.log(`[${channel.name}] Sending message:`, message.getId ? message.getId() : 'unknown');
        return message;
    }

    postReceive(message, channel) {
        this.logger.log(`[${channel.name}] Received message:`, message.getId ? message.getId() : 'unknown');
        return message;
    }
}

/**
 * Validation Interceptor
 */
class ValidationInterceptor {
    constructor(validator) {
        this.validator = validator;
    }

    preSend(message, channel) {
        if (!this.validator(message)) {
            throw new ChannelError('Message validation failed', 'VALIDATION_FAILED');
        }
        return message;
    }
}

/**
 * Transformation Interceptor
 */
class TransformationInterceptor {
    constructor(transformer) {
        this.transformer = transformer;
    }

    preSend(message, channel) {
        return this.transformer(message);
    }
}

/**
 * Channel Manager
 */
class ChannelManager {
    constructor() {
        this.channels = new Map();
    }

    /**
     * Create channel
     */
    createChannel(name, type = ChannelType.POINT_TO_POINT, options = {}) {
        if (this.channels.has(name)) {
            throw new ChannelError(`Channel ${name} already exists`, 'CHANNEL_EXISTS');
        }

        let channel;
        switch (type) {
            case ChannelType.PUBLISH_SUBSCRIBE:
                channel = new PublishSubscribeChannel(name, options);
                break;
            case ChannelType.PRIORITY:
                channel = new PriorityChannel(name, options);
                break;
            default:
                channel = new PointToPointChannel(name, options);
        }

        this.channels.set(name, channel);
        return channel;
    }

    /**
     * Get channel
     */
    getChannel(name) {
        const channel = this.channels.get(name);
        if (!channel) {
            throw new ChannelError(`Channel ${name} not found`, 'CHANNEL_NOT_FOUND');
        }
        return channel;
    }

    /**
     * Delete channel
     */
    deleteChannel(name) {
        const channel = this.channels.get(name);
        if (channel) {
            channel.close();
            this.channels.delete(name);
            return true;
        }
        return false;
    }

    /**
     * List all channels
     */
    listChannels() {
        return Array.from(this.channels.keys());
    }

    /**
     * Get all channel statistics
     */
    getAllStats() {
        const stats = {};
        for (const [name, channel] of this.channels.entries()) {
            stats[name] = channel.getStats();
        }
        return stats;
    }

    /**
     * Close all channels
     */
    closeAll() {
        for (const channel of this.channels.values()) {
            channel.close();
        }
        this.channels.clear();
    }
}

/**
 * Example Usage and Testing
 */
function demonstrateMessageChannelPattern() {
    console.log('=== MessageChannel Pattern Demonstration ===\n');

    // Example 1: Point-to-Point Channel
    console.log('1. Point-to-Point Channel:');
    const p2pChannel = new PointToPointChannel('orders', { capacity: 100 });
    p2pChannel.send({ orderId: '123', amount: 99.99 });
    p2pChannel.send({ orderId: '124', amount: 49.99 });

    p2pChannel.receive().then(message => {
        console.log('Received message:', message);
    });
    console.log('Queue size:', p2pChannel.queue.length);
    console.log();

    // Example 2: Publish-Subscribe Channel
    console.log('2. Publish-Subscribe Channel:');
    const pubSubChannel = new PublishSubscribeChannel('events');

    const unsubscribe1 = pubSubChannel.subscribe(msg => {
        console.log('Subscriber 1 received:', msg);
    });

    pubSubChannel.subscribe(msg => {
        console.log('Subscriber 2 received:', msg);
    });

    pubSubChannel.publish({ event: 'user.login', userId: '999' });
    console.log();

    // Example 3: Channel with Interceptors
    console.log('3. Channel with Interceptors:');
    const channelWithInterceptors = new PointToPointChannel('secure-channel');
    channelWithInterceptors.addInterceptor(new LoggingInterceptor());
    channelWithInterceptors.addInterceptor(new ValidationInterceptor(msg => msg !== null));

    channelWithInterceptors.send({ data: 'important message' });
    console.log();

    // Example 4: Priority Channel
    console.log('4. Priority Channel:');
    const priorityChannel = new PriorityChannel('tasks');

    priorityChannel.send({ task: 'low priority', getHeader: () => 4 });
    priorityChannel.send({ task: 'critical', getHeader: () => 1 });
    priorityChannel.send({ task: 'normal', getHeader: () => 3 });

    console.log('Messages in priority order:', priorityChannel.queue.map(m => m.task));
    console.log();

    // Example 5: Channel Manager
    console.log('5. Channel Manager:');
    const manager = new ChannelManager();
    manager.createChannel('orders', ChannelType.POINT_TO_POINT);
    manager.createChannel('notifications', ChannelType.PUBLISH_SUBSCRIBE);

    console.log('All channels:', manager.listChannels());
    console.log('Channel stats:', manager.getAllStats());
}

// Export classes
module.exports = {
    MessageChannel,
    PointToPointChannel,
    PublishSubscribeChannel,
    PriorityChannel,
    LoggingInterceptor,
    ValidationInterceptor,
    TransformationInterceptor,
    ChannelManager,
    ChannelType,
    ChannelStatus,
    ChannelError,
    demonstrateMessageChannelPattern
};

// Run demonstration if executed directly
if (require.main === module) {
    demonstrateMessageChannelPattern();
}
