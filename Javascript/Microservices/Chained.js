/**
 * Chained Pattern
 *
 * The Chained pattern executes microservice calls sequentially, where the output
 * of one service becomes the input for the next service in the chain. This pattern
 * is useful when services have dependencies on each other's results and need to
 * be executed in a specific order.
 *
 * Key Components:
 * - ChainLink: Represents a single service in the chain
 * - ChainCoordinator: Manages the execution chain
 * - DataTransformer: Transforms data between chain links
 * - ChainContext: Maintains state throughout chain execution
 *
 * Benefits:
 * - Clear service dependency management
 * - Sequential data transformation
 * - Simplified error handling
 * - State management across services
 * - Easy to understand flow
 *
 * Use Cases:
 * - Multi-step data processing pipelines
 * - Workflow orchestration
 * - Sequential business processes
 * - Data enrichment chains
 */

const EventEmitter = require('events');

/**
 * ChainContext - Maintains state throughout chain execution
 */
class ChainContext {
    constructor(initialData = {}) {
        this.data = { ...initialData };
        this.metadata = {
            startTime: Date.now(),
            executedLinks: [],
            errors: []
        };
    }

    /**
     * Set data for a key
     */
    set(key, value) {
        this.data[key] = value;
    }

    /**
     * Get data by key
     */
    get(key) {
        return this.data[key];
    }

    /**
     * Get all data
     */
    getAll() {
        return { ...this.data };
    }

    /**
     * Merge data into context
     */
    merge(newData) {
        this.data = { ...this.data, ...newData };
    }

    /**
     * Add executed link to history
     */
    addExecutedLink(linkName, result) {
        this.metadata.executedLinks.push({
            linkName,
            timestamp: Date.now(),
            success: result.success,
            executionTime: result.executionTime
        });
    }

    /**
     * Add error
     */
    addError(linkName, error) {
        this.metadata.errors.push({
            linkName,
            error: error.message || error,
            timestamp: Date.now()
        });
    }

    /**
     * Get execution metadata
     */
    getMetadata() {
        return {
            ...this.metadata,
            totalTime: Date.now() - this.metadata.startTime,
            linksExecuted: this.metadata.executedLinks.length
        };
    }
}

/**
 * DataTransformer - Transforms data between chain links
 */
class DataTransformer {
    constructor() {
        this.transformers = new Map();
        this.initializeDefaultTransformers();
    }

    /**
     * Initialize default transformers
     */
    initializeDefaultTransformers() {
        // Pass-through transformer
        this.transformers.set('passthrough', (data, context) => data);

        // Extract transformer - extracts specific fields
        this.transformers.set('extract', (data, context, fields = []) => {
            const extracted = {};
            for (const field of fields) {
                if (data.hasOwnProperty(field)) {
                    extracted[field] = data[field];
                }
            }
            return extracted;
        });

        // Merge transformer - merges with context
        this.transformers.set('merge', (data, context) => {
            return { ...context.getAll(), ...data };
        });

        // Map transformer - maps fields to new names
        this.transformers.set('map', (data, context, mapping = {}) => {
            const mapped = {};
            for (const [sourceField, targetField] of Object.entries(mapping)) {
                if (data.hasOwnProperty(sourceField)) {
                    mapped[targetField] = data[sourceField];
                }
            }
            return mapped;
        });

        // Filter transformer - filters array data
        this.transformers.set('filter', (data, context, predicate) => {
            if (Array.isArray(data)) {
                return data.filter(predicate);
            }
            return data;
        });
    }

    /**
     * Transform data
     */
    transform(transformerName, data, context, options = {}) {
        const transformer = this.transformers.get(transformerName);

        if (!transformer) {
            throw new Error(`Unknown transformer: ${transformerName}`);
        }

        return transformer(data, context, options);
    }

    /**
     * Add custom transformer
     */
    addTransformer(name, transformerFunction) {
        this.transformers.set(name, transformerFunction);
    }
}

/**
 * ChainLink - Represents a single service in the chain
 */
class ChainLink extends EventEmitter {
    constructor(config) {
        super();
        this.id = config.id || this.generateId();
        this.name = config.name;
        this.serviceName = config.serviceName;
        this.endpoint = config.endpoint;
        this.method = config.method || 'GET';
        this.timeout = config.timeout || 5000;
        this.retries = config.retries || 0;
        this.inputTransformer = config.inputTransformer || null;
        this.outputTransformer = config.outputTransformer || null;
        this.errorHandler = config.errorHandler || null;
        this.skipOnError = config.skipOnError || false;
        this.required = config.required !== false;
        this.condition = config.condition || null; // Function to determine if link should execute
        this.metadata = config.metadata || {};
    }

    /**
     * Generate link ID
     */
    generateId() {
        return `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Execute the chain link
     */
    async execute(context, transformer) {
        const startTime = Date.now();

        console.log(`[Link ${this.name}] Executing...`);

        this.emit('linkStarted', {
            linkId: this.id,
            linkName: this.name
        });

        try {
            // Check condition if specified
            if (this.condition && !this.condition(context)) {
                console.log(`[Link ${this.name}] Skipped due to condition`);
                return {
                    linkId: this.id,
                    linkName: this.name,
                    success: true,
                    skipped: true,
                    executionTime: Date.now() - startTime
                };
            }

            // Transform input data
            let inputData = context.getAll();
            if (this.inputTransformer) {
                inputData = transformer.transform(
                    this.inputTransformer.type,
                    inputData,
                    context,
                    this.inputTransformer.options
                );
            }

            // Execute service call
            const rawResult = await this.executeService(inputData);

            // Transform output data
            let outputData = rawResult;
            if (this.outputTransformer) {
                outputData = transformer.transform(
                    this.outputTransformer.type,
                    outputData,
                    context,
                    this.outputTransformer.options
                );
            }

            // Update context
            context.merge(outputData);

            const executionTime = Date.now() - startTime;

            const result = {
                linkId: this.id,
                linkName: this.name,
                success: true,
                data: outputData,
                executionTime
            };

            this.emit('linkCompleted', result);

            console.log(`[Link ${this.name}] Completed in ${executionTime}ms`);

            return result;
        } catch (error) {
            const executionTime = Date.now() - startTime;

            console.log(`[Link ${this.name}] Failed: ${error.message}`);

            // Handle error
            if (this.errorHandler) {
                try {
                    const fallbackData = await this.errorHandler(error, context);
                    context.merge(fallbackData);

                    return {
                        linkId: this.id,
                        linkName: this.name,
                        success: true,
                        data: fallbackData,
                        executionTime,
                        fallback: true
                    };
                } catch (handlerError) {
                    error = handlerError;
                }
            }

            const result = {
                linkId: this.id,
                linkName: this.name,
                success: false,
                error: error.message,
                executionTime
            };

            this.emit('linkFailed', result);

            // Add error to context
            context.addError(this.name, error);

            // Throw if required
            if (this.required && !this.skipOnError) {
                throw error;
            }

            return result;
        }
    }

    /**
     * Execute service call
     */
    async executeService(inputData) {
        // Simulate service call
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Service call timeout'));
            }, this.timeout);

            setTimeout(() => {
                clearTimeout(timer);

                // Simulate occasional failures
                if (Math.random() < 0.1) { // 10% failure rate
                    reject(new Error(`Service ${this.serviceName} failed`));
                } else {
                    resolve({
                        service: this.serviceName,
                        endpoint: this.endpoint,
                        input: inputData,
                        result: {
                            message: `Processed by ${this.serviceName}`,
                            timestamp: new Date(),
                            data: this.processData(inputData)
                        }
                    });
                }
            }, Math.random() * 300);
        });
    }

    /**
     * Process input data (simulate business logic)
     */
    processData(inputData) {
        // Simulate data processing
        return {
            ...inputData,
            processedBy: this.serviceName,
            processedAt: new Date()
        };
    }

    /**
     * Execute with retries
     */
    async executeWithRetries(context, transformer) {
        let lastError;

        for (let attempt = 0; attempt <= this.retries; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`[Link ${this.name}] Retry attempt ${attempt}`);
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }

                return await this.execute(context, transformer);
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError;
    }
}

/**
 * ChainCoordinator - Manages the execution of a service chain
 */
class ChainCoordinator extends EventEmitter {
    constructor(config = {}) {
        super();
        this.name = config.name || 'ChainCoordinator';
        this.links = [];
        this.transformer = new DataTransformer();
        this.stopOnError = config.stopOnError !== false;
        this.timeout = config.timeout || 60000;
    }

    /**
     * Add a link to the chain
     */
    addLink(linkConfig) {
        const link = new ChainLink(linkConfig);

        // Forward link events
        link.on('linkStarted', (data) => this.emit('linkStarted', data));
        link.on('linkCompleted', (data) => this.emit('linkCompleted', data));
        link.on('linkFailed', (data) => this.emit('linkFailed', data));

        this.links.push(link);

        console.log(`[${this.name}] Link added: ${link.name} (position: ${this.links.length})`);

        return this;
    }

    /**
     * Execute the entire chain
     */
    async executeChain(initialData = {}, options = {}) {
        console.log(`[${this.name}] Executing chain with ${this.links.length} links`);

        const startTime = Date.now();
        const context = new ChainContext(initialData);

        this.emit('chainStarted', {
            linkCount: this.links.length,
            timestamp: new Date()
        });

        try {
            // Execute each link in sequence
            for (let i = 0; i < this.links.length; i++) {
                const link = this.links[i];

                console.log(`[${this.name}] Executing link ${i + 1}/${this.links.length}: ${link.name}`);

                let result;

                if (link.retries > 0) {
                    result = await link.executeWithRetries(context, this.transformer);
                } else {
                    result = await link.execute(context, this.transformer);
                }

                // Add to context metadata
                context.addExecutedLink(link.name, result);

                // Check if should stop on error
                if (!result.success && this.stopOnError) {
                    throw new Error(`Chain stopped at link ${link.name}: ${result.error}`);
                }

                // Check timeout
                if (Date.now() - startTime > this.timeout) {
                    throw new Error('Chain execution timeout');
                }
            }

            const executionTime = Date.now() - startTime;

            this.emit('chainCompleted', {
                linkCount: this.links.length,
                executionTime,
                timestamp: new Date()
            });

            console.log(`[${this.name}] Chain completed in ${executionTime}ms`);

            return {
                success: true,
                data: context.getAll(),
                metadata: context.getMetadata()
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;

            this.emit('chainFailed', {
                error: error.message,
                executionTime,
                timestamp: new Date()
            });

            console.log(`[${this.name}] Chain failed: ${error.message}`);

            return {
                success: false,
                error: error.message,
                data: context.getAll(),
                metadata: context.getMetadata()
            };
        }
    }

    /**
     * Execute chain with specific links
     */
    async executePartial(linkNames, initialData = {}) {
        const filteredLinks = this.links.filter(link => linkNames.includes(link.name));

        if (filteredLinks.length === 0) {
            throw new Error('No matching links found');
        }

        console.log(`[${this.name}] Executing partial chain with ${filteredLinks.length} links`);

        const tempCoordinator = new ChainCoordinator({ name: `${this.name}-partial` });
        filteredLinks.forEach(link => tempCoordinator.links.push(link));

        return await tempCoordinator.executeChain(initialData);
    }

    /**
     * Add custom data transformer
     */
    addTransformer(name, transformerFunction) {
        this.transformer.addTransformer(name, transformerFunction);
    }

    /**
     * Get chain information
     */
    getChainInfo() {
        return {
            name: this.name,
            linkCount: this.links.length,
            links: this.links.map((link, index) => ({
                position: index + 1,
                name: link.name,
                serviceName: link.serviceName,
                required: link.required
            }))
        };
    }

    /**
     * Validate chain configuration
     */
    validateChain() {
        const errors = [];

        if (this.links.length === 0) {
            errors.push('Chain has no links');
        }

        // Check for duplicate link names
        const names = new Set();
        for (const link of this.links) {
            if (names.has(link.name)) {
                errors.push(`Duplicate link name: ${link.name}`);
            }
            names.add(link.name);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

// Demonstration
async function demonstrateChained() {
    console.log('=== Chained Pattern Demonstration ===\n');

    // Create chain coordinator
    const orderProcessingChain = new ChainCoordinator({
        name: 'OrderProcessingChain',
        stopOnError: false,
        timeout: 30000
    });

    // Listen to events
    orderProcessingChain.on('chainStarted', (data) => {
        console.log(`\n[Event] Chain started with ${data.linkCount} links`);
    });

    orderProcessingChain.on('linkCompleted', (result) => {
        console.log(`[Event] Link completed: ${result.linkName} (${result.executionTime}ms)`);
    });

    orderProcessingChain.on('linkFailed', (result) => {
        console.log(`[Event] Link failed: ${result.linkName} - ${result.error}`);
    });

    orderProcessingChain.on('chainCompleted', (data) => {
        console.log(`[Event] Chain completed in ${data.executionTime}ms`);
    });

    // Build the chain
    console.log('--- Building Order Processing Chain ---');

    orderProcessingChain
        .addLink({
            name: 'validate-order',
            serviceName: 'validation-service',
            endpoint: '/api/validate',
            timeout: 3000,
            retries: 1,
            inputTransformer: {
                type: 'extract',
                options: ['orderId', 'customerId', 'items']
            },
            outputTransformer: {
                type: 'merge'
            }
        })
        .addLink({
            name: 'check-inventory',
            serviceName: 'inventory-service',
            endpoint: '/api/check',
            timeout: 4000,
            condition: (context) => context.get('orderId') != null,
            outputTransformer: {
                type: 'merge'
            }
        })
        .addLink({
            name: 'calculate-price',
            serviceName: 'pricing-service',
            endpoint: '/api/calculate',
            timeout: 3000,
            retries: 2,
            outputTransformer: {
                type: 'merge'
            }
        })
        .addLink({
            name: 'process-payment',
            serviceName: 'payment-service',
            endpoint: '/api/charge',
            timeout: 5000,
            required: true,
            errorHandler: async (error, context) => {
                console.log('[ErrorHandler] Payment failed, using alternative payment');
                return { paymentStatus: 'pending', paymentMethod: 'alternative' };
            },
            outputTransformer: {
                type: 'merge'
            }
        })
        .addLink({
            name: 'create-shipment',
            serviceName: 'shipping-service',
            endpoint: '/api/shipment',
            timeout: 4000,
            required: false,
            skipOnError: true,
            outputTransformer: {
                type: 'merge'
            }
        })
        .addLink({
            name: 'send-confirmation',
            serviceName: 'notification-service',
            endpoint: '/api/notify',
            timeout: 2000,
            required: false,
            outputTransformer: {
                type: 'merge'
            }
        });

    // Validate chain
    console.log('\n--- Validating Chain ---');
    const validation = orderProcessingChain.validateChain();
    if (validation.valid) {
        console.log('Chain configuration is valid');
    } else {
        console.log('Chain validation errors:', validation.errors);
    }

    // Show chain info
    console.log('\n--- Chain Information ---');
    const chainInfo = orderProcessingChain.getChainInfo();
    console.log(JSON.stringify(chainInfo, null, 2));

    // Execute the chain
    console.log('\n--- Executing Chain ---');
    const initialData = {
        orderId: 'ORD-12345',
        customerId: 'CUST-789',
        items: [
            { productId: 'PROD-1', quantity: 2 },
            { productId: 'PROD-2', quantity: 1 }
        ]
    };

    const result = await orderProcessingChain.executeChain(initialData);

    console.log('\n--- Chain Result ---');
    console.log('Success:', result.success);
    console.log('Final Data:', JSON.stringify(result.data, null, 2));
    console.log('\n--- Chain Metadata ---');
    console.log(JSON.stringify(result.metadata, null, 2));

    // Test partial execution
    console.log('\n--- Testing Partial Chain Execution ---');
    const partialResult = await orderProcessingChain.executePartial(
        ['validate-order', 'check-inventory', 'calculate-price'],
        initialData
    );
    console.log('Partial execution success:', partialResult.success);
    console.log('Links executed:', partialResult.metadata.linksExecuted);
}

// Export classes
module.exports = {
    ChainContext,
    DataTransformer,
    ChainLink,
    ChainCoordinator
};

if (require.main === module) {
    demonstrateChained().catch(console.error);
}
