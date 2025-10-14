/**
 * Distributed Tracing Pattern
 *
 * Purpose:
 * Distributed Tracing tracks requests as they flow through multiple services,
 * providing visibility into latency, errors, and dependencies across the
 * entire system.
 *
 * Use Cases:
 * - Performance monitoring
 * - Root cause analysis
 * - Service dependency mapping
 * - Latency analysis
 * - Debugging distributed systems
 *
 * Components:
 * - TraceContext: Maintains trace and span context
 * - SpanCollector: Collects and stores spans
 * - TracePropagator: Propagates trace context across services
 * - TraceAnalyzer: Analyzes trace data
 */

const http = require('http');

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class TraceContext {
    constructor(traceId, spanId, parentSpanId = null) {
        this.traceId = traceId || generateUUID();
        this.spanId = spanId || generateUUID();
        this.parentSpanId = parentSpanId;
        this.baggage = {};
    }

    setBaggage(key, value) {
        this.baggage[key] = value;
    }

    getBaggage(key) {
        return this.baggage[key];
    }

    createChildContext() {
        return new TraceContext(this.traceId, generateUUID(), this.spanId);
    }

    toHeaders() {
        return {
            'X-Trace-ID': this.traceId,
            'X-Span-ID': this.spanId,
            'X-Parent-Span-ID': this.parentSpanId || '',
            'X-Baggage': JSON.stringify(this.baggage)
        };
    }

    static fromHeaders(headers) {
        const traceId = headers['x-trace-id'];
        const spanId = headers['x-span-id'];
        const parentSpanId = headers['x-parent-span-id'];
        
        if (!traceId || !spanId) {
            return new TraceContext();
        }

        const context = new TraceContext(traceId, spanId, parentSpanId || null);
        
        try {
            const baggage = JSON.parse(headers['x-baggage'] || '{}');
            context.baggage = baggage;
        } catch (e) {
            // Invalid baggage
        }

        return context;
    }
}

class Span {
    constructor(traceId, spanId, parentSpanId, operationName, serviceName) {
        this.traceId = traceId;
        this.spanId = spanId;
        this.parentSpanId = parentSpanId;
        this.operationName = operationName;
        this.serviceName = serviceName;
        this.startTime = Date.now();
        this.endTime = null;
        this.tags = {};
        this.logs = [];
        this.status = 'in_progress';
    }

    setTag(key, value) {
        this.tags[key] = value;
    }

    log(message, metadata = {}) {
        this.logs.push({
            timestamp: Date.now(),
            message: message,
            metadata: metadata
        });
    }

    finish(status = 'success') {
        this.endTime = Date.now();
        this.status = status;
        this.duration = this.endTime - this.startTime;
    }

    toJSON() {
        return {
            traceId: this.traceId,
            spanId: this.spanId,
            parentSpanId: this.parentSpanId,
            operationName: this.operationName,
            serviceName: this.serviceName,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration,
            status: this.status,
            tags: this.tags,
            logs: this.logs
        };
    }
}

class SpanCollector {
    constructor() {
        this.spans = new Map(); // traceId -> spans[]
        this.maxTraces = 1000;
    }

    addSpan(span) {
        if (!this.spans.has(span.traceId)) {
            this.spans.set(span.traceId, []);
        }

        this.spans.get(span.traceId).push(span.toJSON());

        // Limit number of traces
        if (this.spans.size > this.maxTraces) {
            const firstKey = this.spans.keys().next().value;
            this.spans.delete(firstKey);
        }

        console.log(`[SpanCollector] Collected span: ${span.operationName} (${span.duration}ms)`);
    }

    getTrace(traceId) {
        return this.spans.get(traceId) || [];
    }

    getAllTraces() {
        const traces = [];
        this.spans.forEach((spans, traceId) => {
            traces.push({
                traceId: traceId,
                spans: spans,
                totalSpans: spans.length,
                totalDuration: this.calculateTotalDuration(spans)
            });
        });
        return traces;
    }

    calculateTotalDuration(spans) {
        if (spans.length === 0) return 0;
        
        const startTimes = spans.map(s => s.startTime);
        const endTimes = spans.map(s => s.endTime).filter(t => t !== null);
        
        if (endTimes.length === 0) return 0;
        
        return Math.max(...endTimes) - Math.min(...startTimes);
    }
}

class TracePropagator {
    injectContext(context, headers = {}) {
        return {
            ...headers,
            ...context.toHeaders()
        };
    }

    extractContext(headers) {
        return TraceContext.fromHeaders(headers);
    }
}

class TraceAnalyzer {
    constructor(collector) {
        this.collector = collector;
    }

    analyzeTrace(traceId) {
        const spans = this.collector.getTrace(traceId);
        
        if (spans.length === 0) {
            return { error: 'Trace not found' };
        }

        const services = new Set(spans.map(s => s.serviceName));
        const operations = new Set(spans.map(s => s.operationName));
        const errors = spans.filter(s => s.status === 'error');
        
        const avgDuration = spans.reduce((sum, s) => sum + (s.duration || 0), 0) / spans.length;
        const totalDuration = this.collector.calculateTotalDuration(spans);

        return {
            traceId: traceId,
            totalSpans: spans.length,
            services: Array.from(services),
            operations: Array.from(operations),
            totalDuration: totalDuration,
            avgSpanDuration: Math.round(avgDuration),
            errors: errors.length,
            hasErrors: errors.length > 0,
            spans: spans
        };
    }

    getServiceDependencies(traceId) {
        const spans = this.collector.getTrace(traceId);
        const dependencies = new Map();

        spans.forEach(span => {
            if (span.parentSpanId) {
                const parentSpan = spans.find(s => s.spanId === span.parentSpanId);
                if (parentSpan && parentSpan.serviceName !== span.serviceName) {
                    const key = `${parentSpan.serviceName}->${span.serviceName}`;
                    dependencies.set(key, {
                        from: parentSpan.serviceName,
                        to: span.serviceName,
                        operation: span.operationName
                    });
                }
            }
        });

        return Array.from(dependencies.values());
    }
}

class DistributedTracing {
    constructor(serviceName, port = 9411) {
        this.serviceName = serviceName;
        this.port = port;
        this.collector = new SpanCollector();
        this.propagator = new TracePropagator();
        this.analyzer = new TraceAnalyzer(this.collector);
        this.activeSpans = new Map();
    }

    startSpan(operationName, context = null) {
        const traceContext = context || new TraceContext();
        
        const span = new Span(
            traceContext.traceId,
            traceContext.spanId,
            traceContext.parentSpanId,
            operationName,
            this.serviceName
        );

        this.activeSpans.set(span.spanId, span);

        return {
            span: span,
            context: traceContext
        };
    }

    finishSpan(spanId, status = 'success') {
        const span = this.activeSpans.get(spanId);
        if (span) {
            span.finish(status);
            this.collector.addSpan(span);
            this.activeSpans.delete(spanId);
        }
    }

    extractContext(headers) {
        return this.propagator.extractContext(headers);
    }

    injectContext(context, headers = {}) {
        return this.propagator.injectContext(context, headers);
    }

    async handleRequest(req, res) {
        const path = req.url.split('?')[0];

        if (path === '/traces') {
            const traces = this.collector.getAllTraces();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ traces: traces, total: traces.length }, null, 2));
            return;
        }

        if (path.startsWith('/trace/')) {
            const traceId = path.split('/')[2];
            const analysis = this.analyzer.analyzeTrace(traceId);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(analysis, null, 2));
            return;
        }

        if (path.startsWith('/dependencies/')) {
            const traceId = path.split('/')[2];
            const deps = this.analyzer.getServiceDependencies(traceId);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ dependencies: deps }, null, 2));
            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }

    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, () => {
            console.log(`[DistributedTracing] Service started on port ${this.port}`);
        });
    }

    stop() {
        if (this.server) {
            this.server.close(() => {
                console.log('[DistributedTracing] Service stopped');
            });
        }
    }
}

// Example usage
if (require.main === module) {
    const tracer = new DistributedTracing('example-service', 9411);

    // Simulate distributed trace
    const { span, context } = tracer.startSpan('handleRequest');
    span.setTag('http.method', 'GET');
    span.setTag('http.url', '/api/users');
    span.log('Request received');

    setTimeout(() => {
        const childContext = context.createChildContext();
        const { span: childSpan } = tracer.startSpan('database-query', childContext);
        childSpan.setTag('db.type', 'postgresql');
        childSpan.log('Executing query');
        
        setTimeout(() => {
            tracer.finishSpan(childSpan.spanId, 'success');
            tracer.finishSpan(span.spanId, 'success');
        }, 100);
    }, 50);

    tracer.start();

    console.log('\n=== Distributed Tracing Pattern Demo ===\n');
    console.log('Tracing Service running on http://localhost:9411');
    console.log('\nAvailable endpoints:');
    console.log('  - http://localhost:9411/traces');
    console.log('  - http://localhost:9411/trace/{traceId}');
    console.log('  - http://localhost:9411/dependencies/{traceId}');
}

module.exports = {
    DistributedTracing,
    TraceContext,
    Span,
    SpanCollector,
    TracePropagator,
    TraceAnalyzer
};
