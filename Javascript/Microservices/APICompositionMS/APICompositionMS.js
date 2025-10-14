/**
 * API Composition Microservice Pattern
 *
 * Purpose:
 * API Composition implemented as a dedicated microservice that aggregates
 * data from multiple downstream services. This is a specialized variant
 * focused on being a standalone composition service.
 *
 * Use Cases:
 * - Backend for Frontend (BFF) pattern
 * - Mobile API aggregation
 * - Complex data composition workflows
 * - Service mesh data aggregation
 *
 * Components:
 * - CompositionService: Main HTTP service
 * - ServiceOrchestrator: Manages service calls
 * - ResponseBuilder: Builds composed responses
 * - ErrorHandler: Handles composition errors
 */

const http = require('http');
const https = require('https');
const url = require('url');

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class ServiceOrchestrator {
    constructor() {
        this.services = new Map();
        this.timeout = 5000;
    }

    registerService(name, url, options = {}) {
        this.services.set(name, {
            url: url,
            required: options.required !== false,
            timeout: options.timeout || this.timeout
        });
    }

    async callService(name, correlationId) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service ${name} not registered`);
        }

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({
                        service: name,
                        data: { message: 'Data from ' + name },
                        correlationId: correlationId
                    });
                } else {
                    reject(new Error(`${name} unavailable`));
                }
            }, Math.random() * 100 + 50);
        });
    }

    async orchestrate(serviceNames, correlationId) {
        const promises = serviceNames.map(name => 
            this.callService(name, correlationId)
                .catch(err => {
                    const service = this.services.get(name);
                    if (service.required) {
                        throw err;
                    }
                    return { service: name, data: null, error: err.message };
                })
        );

        return Promise.all(promises);
    }
}

class ResponseBuilder {
    build(results, correlationId) {
        const composed = {};
        const errors = [];

        results.forEach(result => {
            if (result.error) {
                errors.push({ service: result.service, error: result.error });
            } else if (result.data) {
                composed[result.service] = result.data;
            }
        });

        return {
            correlationId: correlationId,
            data: composed,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: Date.now()
        };
    }
}

class ErrorHandler {
    handle(error, correlationId) {
        console.error(`[ErrorHandler] ${correlationId}:`, error.message);
        
        return {
            correlationId: correlationId,
            error: {
                message: error.message,
                type: error.constructor.name
            },
            timestamp: Date.now()
        };
    }
}

class APICompositionMS {
    constructor(port = 3000) {
        this.port = port;
        this.orchestrator = new ServiceOrchestrator();
        this.responseBuilder = new ResponseBuilder();
        this.errorHandler = new ErrorHandler();
        this.compositions = new Map();
    }

    registerComposition(path, serviceNames, options = {}) {
        this.compositions.set(path, {
            services: serviceNames,
            options: options
        });
        console.log(`[APICompositionMS] Registered composition: ${path}`);
    }

    registerService(name, url, options = {}) {
        this.orchestrator.registerService(name, url, options);
    }

    async handleRequest(req, res) {
        const correlationId = req.headers['x-correlation-id'] || generateUUID();
        const parsedUrl = url.parse(req.url);
        const path = parsedUrl.pathname;

        const composition = this.compositions.get(path);
        if (!composition) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Composition not found' }));
            return;
        }

        try {
            console.log(`[APICompositionMS] Composing ${path} (${correlationId})`);
            
            const results = await this.orchestrator.orchestrate(
                composition.services,
                correlationId
            );

            const response = this.responseBuilder.build(results, correlationId);

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
            });
            res.end(JSON.stringify(response));

        } catch (error) {
            const errorResponse = this.errorHandler.handle(error, correlationId);
            
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'X-Correlation-ID': correlationId
            });
            res.end(JSON.stringify(errorResponse));
        }
    }

    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, () => {
            console.log(`[APICompositionMS] Service started on port ${this.port}`);
        });
    }

    stop() {
        if (this.server) {
            this.server.close(() => {
                console.log('[APICompositionMS] Service stopped');
            });
        }
    }
}

// Example usage
if (require.main === module) {
    const compositionService = new APICompositionMS(3000);

    // Register services
    compositionService.registerService('user-service', 'http://localhost:3001', { required: true });
    compositionService.registerService('order-service', 'http://localhost:3002', { required: true });
    compositionService.registerService('product-service', 'http://localhost:3003', { required: false });

    // Register compositions
    compositionService.registerComposition('/user-profile', [
        'user-service',
        'order-service',
        'product-service'
    ]);

    compositionService.start();

    console.log('\n=== API Composition Microservice Pattern Demo ===\n');
    console.log('Composition service running on http://localhost:3000');
    console.log('Available endpoints:');
    console.log('  - http://localhost:3000/user-profile');
}

module.exports = {
    APICompositionMS,
    ServiceOrchestrator,
    ResponseBuilder,
    ErrorHandler
};
