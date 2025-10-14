/**
 * Log Aggregation Pattern
 *
 * Purpose: Centralize logging from multiple microservices into a single
 * aggregation point for monitoring, analysis, and troubleshooting.
 *
 * Key Components:
 * - Log Producer: Individual services that generate logs
 * - Log Shipper: Transports logs from services to aggregator
 * - Log Aggregator: Centralized service that collects and stores logs
 * - Log Query Service: Provides search and analysis capabilities
 *
 * Benefits:
 * - Centralized monitoring across distributed services
 * - Correlation of events across service boundaries
 * - Simplified troubleshooting and debugging
 * - Performance metrics and analytics
 * - Audit trail and compliance
 */

const EventEmitter = require('events');
const crypto = require('crypto');

// Log Levels
const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
};

const LogLevelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

/**
 * Structured Log Entry
 */
class LogEntry {
    constructor(level, message, metadata = {}) {
        this.id = crypto.randomUUID();
        this.timestamp = new Date().toISOString();
        this.level = level;
        this.levelName = LogLevelNames[level];
        this.message = message;
        this.metadata = metadata;
        this.serviceId = metadata.serviceId || 'unknown';
        this.correlationId = metadata.correlationId || null;
        this.userId = metadata.userId || null;
        this.traceId = metadata.traceId || null;
        this.spanId = metadata.spanId || null;
    }

    toString() {
        return JSON.stringify(this, null, 2);
    }
}

/**
 * Log Producer - Generates logs from individual services
 */
class LogProducer {
    constructor(serviceId, shipper) {
        this.serviceId = serviceId;
        this.shipper = shipper;
        this.minLevel = LogLevel.DEBUG;
    }

    setMinLevel(level) {
        this.minLevel = level;
    }

    log(level, message, metadata = {}) {
        if (level < this.minLevel) {
            return;
        }

        const entry = new LogEntry(level, message, {
            ...metadata,
            serviceId: this.serviceId
        });

        this.shipper.ship(entry);
        return entry;
    }

    debug(message, metadata = {}) {
        return this.log(LogLevel.DEBUG, message, metadata);
    }

    info(message, metadata = {}) {
        return this.log(LogLevel.INFO, message, metadata);
    }

    warn(message, metadata = {}) {
        return this.log(LogLevel.WARN, message, metadata);
    }

    error(message, metadata = {}) {
        return this.log(LogLevel.ERROR, message, metadata);
    }

    fatal(message, metadata = {}) {
        return this.log(LogLevel.FATAL, message, metadata);
    }

    withCorrelation(correlationId) {
        return new CorrelatedLogger(this, correlationId);
    }
}

/**
 * Correlated Logger - Maintains correlation ID across log entries
 */
class CorrelatedLogger {
    constructor(producer, correlationId) {
        this.producer = producer;
        this.correlationId = correlationId;
    }

    log(level, message, metadata = {}) {
        return this.producer.log(level, message, {
            ...metadata,
            correlationId: this.correlationId
        });
    }

    debug(message, metadata = {}) {
        return this.log(LogLevel.DEBUG, message, metadata);
    }

    info(message, metadata = {}) {
        return this.log(LogLevel.INFO, message, metadata);
    }

    warn(message, metadata = {}) {
        return this.log(LogLevel.WARN, message, metadata);
    }

    error(message, metadata = {}) {
        return this.log(LogLevel.ERROR, message, metadata);
    }

    fatal(message, metadata = {}) {
        return this.log(LogLevel.FATAL, message, metadata);
    }
}

/**
 * Log Shipper - Transports logs to aggregator
 */
class LogShipper extends EventEmitter {
    constructor() {
        super();
        this.buffer = [];
        this.batchSize = 10;
        this.flushInterval = 5000;
        this.flushTimer = null;
        this.startFlushTimer();
    }

    ship(logEntry) {
        this.buffer.push(logEntry);

        if (this.buffer.length >= this.batchSize) {
            this.flush();
        }
    }

    flush() {
        if (this.buffer.length === 0) {
            return;
        }

        const batch = [...this.buffer];
        this.buffer = [];

        this.emit('batch', batch);
    }

    startFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }

    stop() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
        this.flush();
    }
}

/**
 * Log Aggregator - Centralized log collection service
 */
class LogAggregator extends EventEmitter {
    constructor() {
        super();
        this.logs = [];
        this.indexByService = new Map();
        this.indexByCorrelation = new Map();
        this.indexByLevel = new Map();
        this.stats = {
            totalLogs: 0,
            byService: {},
            byLevel: {}
        };
    }

    ingest(logEntries) {
        for (const entry of logEntries) {
            this.addLog(entry);
        }

        this.emit('ingested', logEntries.length);
    }

    addLog(entry) {
        this.logs.push(entry);
        this.indexLog(entry);
        this.updateStats(entry);
        this.emit('log', entry);

        // Check for alerts
        if (entry.level >= LogLevel.ERROR) {
            this.emit('alert', entry);
        }
    }

    indexLog(entry) {
        // Index by service
        if (!this.indexByService.has(entry.serviceId)) {
            this.indexByService.set(entry.serviceId, []);
        }
        this.indexByService.get(entry.serviceId).push(entry);

        // Index by correlation ID
        if (entry.correlationId) {
            if (!this.indexByCorrelation.has(entry.correlationId)) {
                this.indexByCorrelation.set(entry.correlationId, []);
            }
            this.indexByCorrelation.get(entry.correlationId).push(entry);
        }

        // Index by level
        const levelName = entry.levelName;
        if (!this.indexByLevel.has(levelName)) {
            this.indexByLevel.set(levelName, []);
        }
        this.indexByLevel.get(levelName).push(entry);
    }

    updateStats(entry) {
        this.stats.totalLogs++;

        if (!this.stats.byService[entry.serviceId]) {
            this.stats.byService[entry.serviceId] = 0;
        }
        this.stats.byService[entry.serviceId]++;

        if (!this.stats.byLevel[entry.levelName]) {
            this.stats.byLevel[entry.levelName] = 0;
        }
        this.stats.byLevel[entry.levelName]++;
    }

    query(filter = {}) {
        let results = [...this.logs];

        if (filter.serviceId) {
            results = this.indexByService.get(filter.serviceId) || [];
        }

        if (filter.correlationId) {
            results = this.indexByCorrelation.get(filter.correlationId) || [];
        }

        if (filter.level !== undefined) {
            const levelName = LogLevelNames[filter.level];
            results = results.filter(log => log.levelName === levelName);
        }

        if (filter.startTime) {
            results = results.filter(log =>
                new Date(log.timestamp) >= new Date(filter.startTime)
            );
        }

        if (filter.endTime) {
            results = results.filter(log =>
                new Date(log.timestamp) <= new Date(filter.endTime)
            );
        }

        if (filter.search) {
            const search = filter.search.toLowerCase();
            results = results.filter(log =>
                log.message.toLowerCase().includes(search) ||
                JSON.stringify(log.metadata).toLowerCase().includes(search)
            );
        }

        if (filter.limit) {
            results = results.slice(0, filter.limit);
        }

        return results;
    }

    getStats() {
        return { ...this.stats };
    }

    getServiceLogs(serviceId) {
        return this.indexByService.get(serviceId) || [];
    }

    getCorrelatedLogs(correlationId) {
        return this.indexByCorrelation.get(correlationId) || [];
    }

    clear() {
        this.logs = [];
        this.indexByService.clear();
        this.indexByCorrelation.clear();
        this.indexByLevel.clear();
        this.stats = {
            totalLogs: 0,
            byService: {},
            byLevel: {}
        };
    }
}

/**
 * Log Query Service - Provides advanced search and analysis
 */
class LogQueryService {
    constructor(aggregator) {
        this.aggregator = aggregator;
    }

    findByTimeRange(startTime, endTime) {
        return this.aggregator.query({ startTime, endTime });
    }

    findByService(serviceId) {
        return this.aggregator.getServiceLogs(serviceId);
    }

    findByCorrelation(correlationId) {
        return this.aggregator.getCorrelatedLogs(correlationId);
    }

    findErrors(serviceId = null) {
        const filter = { level: LogLevel.ERROR };
        if (serviceId) {
            filter.serviceId = serviceId;
        }
        return this.aggregator.query(filter);
    }

    search(searchTerm, options = {}) {
        return this.aggregator.query({
            search: searchTerm,
            ...options
        });
    }

    getServiceStats(serviceId) {
        const logs = this.aggregator.getServiceLogs(serviceId);
        const stats = {
            total: logs.length,
            byLevel: {}
        };

        for (const log of logs) {
            if (!stats.byLevel[log.levelName]) {
                stats.byLevel[log.levelName] = 0;
            }
            stats.byLevel[log.levelName]++;
        }

        return stats;
    }

    traceRequest(correlationId) {
        const logs = this.aggregator.getCorrelatedLogs(correlationId);
        return logs.sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );
    }
}

// Demonstration
function demonstrateLogAggregation() {
    console.log('=== Log Aggregation Pattern Demo ===\n');

    // Create aggregator and shipper
    const aggregator = new LogAggregator();
    const shipper = new LogShipper();

    // Connect shipper to aggregator
    shipper.on('batch', (batch) => {
        aggregator.ingest(batch);
    });

    // Create log producers for different services
    const userServiceLogger = new LogProducer('user-service', shipper);
    const orderServiceLogger = new LogProducer('order-service', shipper);
    const paymentServiceLogger = new LogProducer('payment-service', shipper);

    // Simulate a request flow with correlation
    const correlationId = crypto.randomUUID();
    console.log(`Simulating request with correlation ID: ${correlationId}\n`);

    const userLogger = userServiceLogger.withCorrelation(correlationId);
    const orderLogger = orderServiceLogger.withCorrelation(correlationId);
    const paymentLogger = paymentServiceLogger.withCorrelation(correlationId);

    // User service logs
    userLogger.info('User authentication requested', { userId: 'user-123' });
    userLogger.info('User authenticated successfully', { userId: 'user-123' });

    // Order service logs
    orderLogger.info('Order creation started', {
        userId: 'user-123',
        items: 3,
        total: 150.00
    });
    orderLogger.debug('Validating order items', { itemCount: 3 });
    orderLogger.info('Order created', { orderId: 'order-456' });

    // Payment service logs
    paymentLogger.info('Payment processing started', {
        orderId: 'order-456',
        amount: 150.00
    });
    paymentLogger.warn('Payment gateway slow response', {
        responseTime: 2500
    });
    paymentLogger.info('Payment completed', {
        orderId: 'order-456',
        transactionId: 'txn-789'
    });

    // Simulate some errors
    orderServiceLogger.error('Database connection timeout', {
        database: 'orders-db',
        timeout: 5000
    });

    // Flush logs
    shipper.flush();

    // Query logs
    const queryService = new LogQueryService(aggregator);

    console.log('Overall Statistics:');
    console.log(JSON.stringify(aggregator.getStats(), null, 2));
    console.log();

    console.log('Correlated logs for request:');
    const trace = queryService.traceRequest(correlationId);
    trace.forEach(log => {
        console.log(`[${log.timestamp}] [${log.serviceId}] [${log.levelName}] ${log.message}`);
    });
    console.log();

    console.log('All errors:');
    const errors = queryService.findErrors();
    errors.forEach(log => {
        console.log(`[${log.serviceId}] ${log.message}`);
        console.log(`  Metadata: ${JSON.stringify(log.metadata)}`);
    });
    console.log();

    console.log('User service statistics:');
    console.log(JSON.stringify(queryService.getServiceStats('user-service'), null, 2));

    // Alert monitoring
    aggregator.on('alert', (entry) => {
        console.log(`\nALERT: [${entry.serviceId}] ${entry.levelName} - ${entry.message}`);
    });

    // Stop shipper
    shipper.stop();
}

// Run demonstration
if (require.main === module) {
    demonstrateLogAggregation();
}

module.exports = {
    LogLevel,
    LogEntry,
    LogProducer,
    LogShipper,
    LogAggregator,
    LogQueryService
};
