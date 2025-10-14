/**
 * Service Template Pattern
 *
 * The Service Template pattern provides reusable templates for creating microservices
 * with standardized structure, common functionality, and best practices built-in.
 * This pattern ensures consistency across services and reduces boilerplate code.
 *
 * Key Components:
 * - ServiceTemplate: Base template with common functionality
 * - TemplateRegistry: Catalog of available templates
 * - ServiceGenerator: Creates services from templates
 * - TemplateCustomizer: Allows template customization
 *
 * Benefits:
 * - Consistency across microservices
 * - Reduced development time
 * - Standardized best practices
 * - Easier onboarding for new developers
 * - Simplified maintenance
 *
 * Use Cases:
 * - Rapid microservice development
 * - Standardizing service architecture
 * - Enterprise-wide service patterns
 * - Polyglot microservice environments
 */

const EventEmitter = require('events');
const http = require('http');

/**
 * ServiceTemplate - Base template for creating microservices
 */
class ServiceTemplate {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description || '';
        this.version = config.version || '1.0.0';
        this.baseComponents = config.baseComponents || [];
        this.middleware = config.middleware || [];
        this.endpoints = config.endpoints || [];
        this.dependencies = config.dependencies || [];
        this.configuration = config.configuration || {};
        this.metadata = config.metadata || {};
    }

    /**
     * Get template information
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            version: this.version,
            componentCount: this.baseComponents.length,
            endpointCount: this.endpoints.length,
            metadata: this.metadata
        };
    }

    /**
     * Validate template configuration
     */
    validate() {
        const errors = [];

        if (!this.id || !this.name) {
            errors.push('Template must have id and name');
        }

        if (this.baseComponents.length === 0) {
            errors.push('Template must have at least one component');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Clone template with customization
     */
    clone(customization = {}) {
        return new ServiceTemplate({
            ...this,
            ...customization,
            id: customization.id || `${this.id}-clone`,
            baseComponents: [...this.baseComponents, ...(customization.additionalComponents || [])],
            middleware: [...this.middleware, ...(customization.additionalMiddleware || [])],
            endpoints: [...this.endpoints, ...(customization.additionalEndpoints || [])]
        });
    }
}

/**
 * TemplateRegistry - Manages available service templates
 */
class TemplateRegistry extends EventEmitter {
    constructor() {
        super();
        this.templates = new Map();
        this.categories = new Map();
        this.initializeDefaultTemplates();
    }

    /**
     * Initialize default templates
     */
    initializeDefaultTemplates() {
        // REST API Template
        this.registerTemplate(new ServiceTemplate({
            id: 'rest-api',
            name: 'REST API Service',
            description: 'Standard REST API microservice template',
            baseComponents: [
                'http-server',
                'request-logger',
                'error-handler',
                'health-check',
                'metrics'
            ],
            middleware: [
                'cors',
                'body-parser',
                'authentication',
                'rate-limiting'
            ],
            endpoints: [
                { path: '/health', method: 'GET', handler: 'healthCheck' },
                { path: '/metrics', method: 'GET', handler: 'metrics' },
                { path: '/api/*', method: 'ALL', handler: 'apiHandler' }
            ],
            configuration: {
                port: 3000,
                timeout: 30000,
                maxRequestSize: '10mb'
            },
            metadata: {
                category: 'api',
                technology: 'nodejs',
                protocol: 'http'
            }
        }));

        // Event-Driven Template
        this.registerTemplate(new ServiceTemplate({
            id: 'event-driven',
            name: 'Event-Driven Service',
            description: 'Event-driven microservice with message queue',
            baseComponents: [
                'event-bus',
                'message-queue',
                'event-handler',
                'event-publisher',
                'health-check'
            ],
            middleware: [
                'event-validator',
                'dead-letter-queue',
                'retry-mechanism'
            ],
            configuration: {
                queueType: 'rabbitmq',
                maxRetries: 3,
                deadLetterQueue: true
            },
            metadata: {
                category: 'event',
                technology: 'nodejs',
                protocol: 'amqp'
            }
        }));

        // Data Processing Template
        this.registerTemplate(new ServiceTemplate({
            id: 'data-processor',
            name: 'Data Processing Service',
            description: 'Batch/stream data processing service',
            baseComponents: [
                'data-ingestion',
                'data-processor',
                'data-output',
                'scheduler',
                'health-check'
            ],
            middleware: [
                'data-validator',
                'error-handler',
                'performance-monitor'
            ],
            configuration: {
                batchSize: 1000,
                processingInterval: 60000,
                parallelWorkers: 4
            },
            metadata: {
                category: 'data',
                technology: 'nodejs',
                protocol: 'batch'
            }
        }));
    }

    /**
     * Register a new template
     */
    registerTemplate(template) {
        const validation = template.validate();

        if (!validation.valid) {
            throw new Error(`Invalid template: ${validation.errors.join(', ')}`);
        }

        this.templates.set(template.id, template);

        // Categorize template
        const category = template.metadata.category || 'uncategorized';
        if (!this.categories.has(category)) {
            this.categories.set(category, []);
        }
        this.categories.get(category).push(template.id);

        this.emit('templateRegistered', template);
        console.log(`[Registry] Template registered: ${template.name}`);

        return { success: true, templateId: template.id };
    }

    /**
     * Get template by ID
     */
    getTemplate(templateId) {
        return this.templates.get(templateId);
    }

    /**
     * Get templates by category
     */
    getTemplatesByCategory(category) {
        const templateIds = this.categories.get(category) || [];
        return templateIds.map(id => this.templates.get(id));
    }

    /**
     * Get all templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    /**
     * Search templates
     */
    searchTemplates(query) {
        const results = [];

        for (const [id, template] of this.templates.entries()) {
            if (
                template.name.toLowerCase().includes(query.toLowerCase()) ||
                template.description.toLowerCase().includes(query.toLowerCase())
            ) {
                results.push(template);
            }
        }

        return results;
    }

    /**
     * Get registry statistics
     */
    getStatistics() {
        const categoryCounts = {};
        for (const [category, templates] of this.categories.entries()) {
            categoryCounts[category] = templates.length;
        }

        return {
            totalTemplates: this.templates.size,
            categories: categoryCounts
        };
    }
}

/**
 * TemplateCustomizer - Customizes templates for specific use cases
 */
class TemplateCustomizer {
    constructor(template) {
        this.baseTemplate = template;
        this.customizations = {
            components: [],
            middleware: [],
            endpoints: [],
            configuration: {}
        };
    }

    /**
     * Add custom component
     */
    addComponent(component) {
        this.customizations.components.push(component);
        return this;
    }

    /**
     * Add custom middleware
     */
    addMiddleware(middleware) {
        this.customizations.middleware.push(middleware);
        return this;
    }

    /**
     * Add custom endpoint
     */
    addEndpoint(endpoint) {
        this.customizations.endpoints.push(endpoint);
        return this;
    }

    /**
     * Set configuration
     */
    setConfiguration(key, value) {
        this.customizations.configuration[key] = value;
        return this;
    }

    /**
     * Build customized template
     */
    build() {
        return new ServiceTemplate({
            id: `${this.baseTemplate.id}-customized`,
            name: `${this.baseTemplate.name} (Customized)`,
            description: this.baseTemplate.description,
            version: this.baseTemplate.version,
            baseComponents: [
                ...this.baseTemplate.baseComponents,
                ...this.customizations.components
            ],
            middleware: [
                ...this.baseTemplate.middleware,
                ...this.customizations.middleware
            ],
            endpoints: [
                ...this.baseTemplate.endpoints,
                ...this.customizations.endpoints
            ],
            configuration: {
                ...this.baseTemplate.configuration,
                ...this.customizations.configuration
            },
            dependencies: this.baseTemplate.dependencies,
            metadata: {
                ...this.baseTemplate.metadata,
                customized: true
            }
        });
    }
}

/**
 * ServiceGenerator - Generates microservices from templates
 */
class ServiceGenerator extends EventEmitter {
    constructor(registry) {
        this.registry = registry;
        this.generatedServices = [];
    }

    /**
     * Generate service from template
     */
    async generateService(templateId, serviceConfig) {
        const template = this.registry.getTemplate(templateId);

        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        console.log(`[Generator] Generating service from template: ${template.name}`);

        const service = new TemplatedService({
            ...serviceConfig,
            template: template,
            components: template.baseComponents,
            middleware: template.middleware,
            endpoints: template.endpoints,
            configuration: {
                ...template.configuration,
                ...serviceConfig.configuration
            }
        });

        this.generatedServices.push({
            service,
            template: template.id,
            generatedAt: new Date()
        });

        this.emit('serviceGenerated', service);

        console.log(`[Generator] Service generated: ${service.name}`);

        return service;
    }

    /**
     * Generate service from customized template
     */
    async generateFromCustomTemplate(customTemplate, serviceConfig) {
        const service = new TemplatedService({
            ...serviceConfig,
            template: customTemplate,
            components: customTemplate.baseComponents,
            middleware: customTemplate.middleware,
            endpoints: customTemplate.endpoints,
            configuration: {
                ...customTemplate.configuration,
                ...serviceConfig.configuration
            }
        });

        this.generatedServices.push({
            service,
            template: 'custom',
            generatedAt: new Date()
        });

        return service;
    }

    /**
     * Get generated services
     */
    getGeneratedServices() {
        return this.generatedServices;
    }

    /**
     * Get generation statistics
     */
    getStatistics() {
        const templateUsage = {};

        for (const { template } of this.generatedServices) {
            templateUsage[template] = (templateUsage[template] || 0) + 1;
        }

        return {
            totalGenerated: this.generatedServices.length,
            templateUsage
        };
    }
}

/**
 * TemplatedService - Service created from a template
 */
class TemplatedService extends EventEmitter {
    constructor(config) {
        super();
        this.id = config.id || this.generateId();
        this.name = config.name;
        this.template = config.template;
        this.port = config.port || config.configuration.port || 3000;
        this.host = config.host || 'localhost';
        this.components = config.components || [];
        this.middleware = config.middleware || [];
        this.endpoints = config.endpoints || [];
        this.configuration = config.configuration || {};
        this.server = null;
        this.status = 'stopped';
        this.metrics = {
            requests: 0,
            errors: 0,
            startTime: null
        };
    }

    /**
     * Generate service ID
     */
    generateId() {
        return `svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Start the service
     */
    async start() {
        console.log(`[Service ${this.name}] Starting...`);
        console.log(`  Template: ${this.template.name}`);
        console.log(`  Components: ${this.components.join(', ')}`);

        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        await new Promise((resolve) => {
            this.server.listen(this.port, this.host, () => {
                this.status = 'running';
                this.metrics.startTime = new Date();
                console.log(`[Service ${this.name}] Running on ${this.host}:${this.port}`);
                this.emit('started', this);
                resolve();
            });
        });
    }

    /**
     * Stop the service
     */
    async stop() {
        console.log(`[Service ${this.name}] Stopping...`);

        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(() => {
                    this.status = 'stopped';
                    this.emit('stopped', this);
                    resolve();
                });
            });
        }

        console.log(`[Service ${this.name}] Stopped`);
    }

    /**
     * Handle incoming requests
     */
    async handleRequest(req, res) {
        this.metrics.requests++;

        // Apply middleware
        for (const middlewareName of this.middleware) {
            await this.applyMiddleware(middlewareName, req, res);
        }

        // Route to endpoint
        const endpoint = this.findEndpoint(req.url, req.method);

        if (!endpoint) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
            return;
        }

        // Execute handler
        await this.executeHandler(endpoint.handler, req, res);
    }

    /**
     * Apply middleware
     */
    async applyMiddleware(middlewareName, req, res) {
        // Simulate middleware execution
        console.log(`[Service ${this.name}] Applying middleware: ${middlewareName}`);
    }

    /**
     * Find matching endpoint
     */
    findEndpoint(path, method) {
        for (const endpoint of this.endpoints) {
            if (endpoint.path === path && (endpoint.method === 'ALL' || endpoint.method === method)) {
                return endpoint;
            }
        }
        return null;
    }

    /**
     * Execute endpoint handler
     */
    async executeHandler(handlerName, req, res) {
        if (handlerName === 'healthCheck') {
            this.handleHealthCheck(req, res);
        } else if (handlerName === 'metrics') {
            this.handleMetrics(req, res);
        } else {
            this.handleDefault(req, res);
        }
    }

    /**
     * Health check handler
     */
    handleHealthCheck(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            service: this.name,
            uptime: this.metrics.startTime ? Date.now() - this.metrics.startTime.getTime() : 0
        }));
    }

    /**
     * Metrics handler
     */
    handleMetrics(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            service: this.name,
            metrics: this.metrics
        }));
    }

    /**
     * Default handler
     */
    handleDefault(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            service: this.name,
            message: 'Response from templated service',
            timestamp: new Date()
        }));
    }

    /**
     * Get service information
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            template: this.template.name,
            port: this.port,
            status: this.status,
            components: this.components,
            middleware: this.middleware,
            endpointCount: this.endpoints.length,
            metrics: this.metrics
        };
    }
}

// Demonstration
async function demonstrateServiceTemplate() {
    console.log('=== Service Template Pattern Demonstration ===\n');

    // Create template registry
    const registry = new TemplateRegistry();

    // Show available templates
    console.log('--- Available Templates ---');
    const templates = registry.getAllTemplates();
    templates.forEach(template => {
        console.log(`${template.name} (${template.id})`);
        console.log(`  Category: ${template.metadata.category}`);
        console.log(`  Components: ${template.baseComponents.length}`);
    });

    // Create service generator
    const generator = new ServiceGenerator(registry);

    // Generate services from templates
    console.log('\n--- Generating Services from Templates ---');

    const userService = await generator.generateService('rest-api', {
        name: 'user-service',
        port: 8001,
        configuration: {
            timeout: 60000
        }
    });

    const orderService = await generator.generateService('rest-api', {
        name: 'order-service',
        port: 8002
    });

    const eventService = await generator.generateService('event-driven', {
        name: 'notification-service',
        port: 8003,
        configuration: {
            queueType: 'kafka'
        }
    });

    // Customize a template
    console.log('\n--- Customizing Template ---');
    const restTemplate = registry.getTemplate('rest-api');
    const customizer = new TemplateCustomizer(restTemplate);

    customizer
        .addComponent('cache')
        .addComponent('database-connector')
        .addMiddleware('compression')
        .addEndpoint({ path: '/admin', method: 'GET', handler: 'adminHandler' })
        .setConfiguration('maxConnections', 100);

    const customTemplate = customizer.build();
    console.log(`Custom template created: ${customTemplate.name}`);

    // Generate service from custom template
    const customService = await generator.generateFromCustomTemplate(customTemplate, {
        name: 'custom-api-service',
        port: 8004
    });

    // Start services
    console.log('\n--- Starting Services ---');
    await userService.start();
    await orderService.start();
    await eventService.start();
    await customService.start();

    // Show service information
    console.log('\n--- Service Information ---');
    console.log('User Service:', JSON.stringify(userService.getInfo(), null, 2));

    // Show generator statistics
    console.log('\n--- Generator Statistics ---');
    const stats = generator.getStatistics();
    console.log(JSON.stringify(stats, null, 2));

    // Show registry statistics
    console.log('\n--- Registry Statistics ---');
    const registryStats = registry.getStatistics();
    console.log(JSON.stringify(registryStats, null, 2));

    // Search templates
    console.log('\n--- Searching Templates ---');
    const searchResults = registry.searchTemplates('api');
    console.log(`Found ${searchResults.length} templates matching 'api'`);
    searchResults.forEach(t => console.log(`  - ${t.name}`));
}

// Export classes
module.exports = {
    ServiceTemplate,
    TemplateRegistry,
    TemplateCustomizer,
    ServiceGenerator,
    TemplatedService
};

if (require.main === module) {
    demonstrateServiceTemplate().catch(console.error);
}
