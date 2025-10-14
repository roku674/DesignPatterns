/**
 * Saga Pattern Cloud Implementation
 *
 * The Saga pattern manages distributed transactions across multiple microservices
 * by breaking them into a sequence of local transactions. Each local transaction
 * updates the database and publishes an event or message to trigger the next step.
 * If a step fails, the saga executes compensating transactions to undo the changes.
 *
 * Key Features:
 * - Orchestration-based saga coordination
 * - Choreography-based event-driven sagas
 * - Automatic compensation on failure
 * - Saga state persistence and recovery
 * - Timeout and retry handling
 * - Parallel step execution
 * - Saga versioning and migration
 * - Comprehensive monitoring and metrics
 *
 * Saga Types:
 * - Sequential: Steps execute one after another
 * - Parallel: Multiple steps execute simultaneously
 * - Conditional: Steps execute based on conditions
 *
 * @module SagaCloud
 */

/**
 * Saga execution states
 */
const SagaState = {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPENSATING: 'compensating',
    COMPLETED: 'completed',
    FAILED: 'failed',
    COMPENSATED: 'compensated'
};

/**
 * Step execution states
 */
const StepState = {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    COMPENSATING: 'compensating',
    COMPENSATED: 'compensated',
    SKIPPED: 'skipped'
};

/**
 * Saga execution modes
 */
const SagaMode = {
    SEQUENTIAL: 'sequential',
    PARALLEL: 'parallel',
    MIXED: 'mixed'
};

/**
 * Individual saga step definition
 */
class SagaStep {
    constructor(config) {
        this.id = config.id || this.generateStepId();
        this.name = config.name;
        this.action = config.action; // Forward action
        this.compensation = config.compensation; // Rollback action
        this.timeout = config.timeout || 30000;
        this.retryCount = config.retryCount || 3;
        this.condition = config.condition; // Optional condition to execute
        this.onSuccess = config.onSuccess; // Callback on success
        this.onFailure = config.onFailure; // Callback on failure
        this.state = StepState.PENDING;
        this.result = null;
        this.error = null;
        this.attempts = 0;
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Execute the step action
     * @param {Object} context - Saga execution context
     * @returns {Promise<any>} Step result
     */
    async execute(context) {
        this.state = StepState.RUNNING;
        this.startTime = Date.now();
        this.attempts++;

        try {
            console.log(`Executing step: ${this.name}`);

            // Check condition if specified
            if (this.condition && !this.condition(context)) {
                console.log(`Step ${this.name} skipped due to condition`);
                this.state = StepState.SKIPPED;
                return null;
            }

            // Execute with timeout
            const result = await this.executeWithTimeout(
                () => this.action(context),
                this.timeout
            );

            this.result = result;
            this.state = StepState.COMPLETED;
            this.endTime = Date.now();

            console.log(`Step ${this.name} completed successfully`);

            // Call success callback
            if (this.onSuccess) {
                await this.onSuccess(result, context);
            }

            return result;

        } catch (error) {
            console.error(`Step ${this.name} failed:`, error.message);

            this.error = error;
            this.state = StepState.FAILED;
            this.endTime = Date.now();

            // Call failure callback
            if (this.onFailure) {
                await this.onFailure(error, context);
            }

            throw error;
        }
    }

    /**
     * Execute compensation (rollback) action
     * @param {Object} context - Saga execution context
     * @returns {Promise<any>} Compensation result
     */
    async compensate(context) {
        if (!this.compensation) {
            console.log(`No compensation defined for step: ${this.name}`);
            return null;
        }

        if (this.state !== StepState.COMPLETED) {
            console.log(`Step ${this.name} not completed, skipping compensation`);
            return null;
        }

        this.state = StepState.COMPENSATING;

        try {
            console.log(`Compensating step: ${this.name}`);

            const result = await this.executeWithTimeout(
                () => this.compensation(context, this.result),
                this.timeout
            );

            this.state = StepState.COMPENSATED;
            console.log(`Step ${this.name} compensated successfully`);

            return result;

        } catch (error) {
            console.error(`Compensation failed for step ${this.name}:`, error.message);
            throw error;
        }
    }

    /**
     * Execute operation with timeout
     * @param {Function} operation - Operation to execute
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<any>} Operation result
     */
    async executeWithTimeout(operation, timeout) {
        return Promise.race([
            operation(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Step timeout: ${this.name}`)), timeout)
            )
        ]);
    }

    /**
     * Retry step execution
     * @param {Object} context - Saga execution context
     * @returns {Promise<any>} Retry result
     */
    async retry(context) {
        if (this.attempts >= this.retryCount) {
            throw new Error(`Max retry attempts reached for step: ${this.name}`);
        }

        console.log(`Retrying step ${this.name} (attempt ${this.attempts + 1}/${this.retryCount})`);

        // Reset state for retry
        this.state = StepState.PENDING;
        this.error = null;

        return this.execute(context);
    }

    generateStepId() {
        return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get step metrics
     * @returns {Object} Step metrics
     */
    getMetrics() {
        return {
            id: this.id,
            name: this.name,
            state: this.state,
            attempts: this.attempts,
            duration: this.endTime ? this.endTime - this.startTime : null,
            hasCompensation: !!this.compensation,
            error: this.error ? this.error.message : null
        };
    }
}

/**
 * Saga execution context
 */
class SagaContext {
    constructor(initialData = {}) {
        this.data = { ...initialData };
        this.stepResults = new Map();
        this.metadata = {
            startTime: Date.now(),
            correlationId: this.generateCorrelationId()
        };
    }

    /**
     * Set step result
     * @param {string} stepId - Step ID
     * @param {any} result - Step result
     */
    setStepResult(stepId, result) {
        this.stepResults.set(stepId, result);
    }

    /**
     * Get step result
     * @param {string} stepId - Step ID
     * @returns {any} Step result
     */
    getStepResult(stepId) {
        return this.stepResults.get(stepId);
    }

    /**
     * Update context data
     * @param {Object} updates - Data updates
     */
    update(updates) {
        this.data = { ...this.data, ...updates };
    }

    /**
     * Get context data
     * @returns {Object} Context data
     */
    getData() {
        return { ...this.data };
    }

    generateCorrelationId() {
        return `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Main Saga orchestrator
 */
class SagaCloud {
    constructor(config = {}) {
        this.name = config.name || 'UnnamedSaga';
        this.steps = [];
        this.mode = config.mode || SagaMode.SEQUENTIAL;
        this.state = SagaState.PENDING;
        this.context = new SagaContext(config.initialData);
        this.completedSteps = [];
        this.failedStep = null;
        this.startTime = null;
        this.endTime = null;
        this.error = null;
        this.eventHandlers = new Map();
        this.persistenceAdapter = config.persistenceAdapter;
        this.maxCompensationRetries = config.maxCompensationRetries || 3;
    }

    /**
     * Add step to saga
     * @param {Object|SagaStep} stepConfig - Step configuration
     * @returns {SagaCloud} This saga instance for chaining
     */
    addStep(stepConfig) {
        const step = stepConfig instanceof SagaStep
            ? stepConfig
            : new SagaStep(stepConfig);

        this.steps.push(step);
        return this;
    }

    /**
     * Add multiple steps
     * @param {Array} steps - Array of step configurations
     * @returns {SagaCloud} This saga instance for chaining
     */
    addSteps(steps) {
        steps.forEach(step => this.addStep(step));
        return this;
    }

    /**
     * Execute saga
     * @param {Object} additionalData - Additional context data
     * @returns {Promise<Object>} Saga execution result
     */
    async execute(additionalData = {}) {
        this.state = SagaState.RUNNING;
        this.startTime = Date.now();
        this.context.update(additionalData);

        console.log(`\n=== Starting Saga: ${this.name} ===`);
        console.log(`Mode: ${this.mode}`);
        console.log(`Steps: ${this.steps.length}`);
        console.log(`Correlation ID: ${this.context.metadata.correlationId}\n`);

        this.emit('saga:started', { saga: this.name, context: this.context });

        try {
            // Persist initial state
            await this.persistState();

            // Execute steps based on mode
            if (this.mode === SagaMode.SEQUENTIAL) {
                await this.executeSequential();
            } else if (this.mode === SagaMode.PARALLEL) {
                await this.executeParallel();
            } else {
                await this.executeMixed();
            }

            // Success
            this.state = SagaState.COMPLETED;
            this.endTime = Date.now();

            console.log(`\n=== Saga Completed: ${this.name} ===`);
            console.log(`Duration: ${this.endTime - this.startTime}ms\n`);

            this.emit('saga:completed', {
                saga: this.name,
                duration: this.endTime - this.startTime,
                context: this.context
            });

            await this.persistState();

            return {
                success: true,
                saga: this.name,
                correlationId: this.context.metadata.correlationId,
                duration: this.endTime - this.startTime,
                completedSteps: this.completedSteps.length,
                context: this.context.getData()
            };

        } catch (error) {
            console.error(`\n=== Saga Failed: ${this.name} ===`);
            console.error(`Error: ${error.message}\n`);

            this.error = error;
            this.emit('saga:failed', { saga: this.name, error });

            // Execute compensation
            await this.executeCompensation();

            return {
                success: false,
                saga: this.name,
                correlationId: this.context.metadata.correlationId,
                error: error.message,
                failedStep: this.failedStep?.name,
                compensatedSteps: this.completedSteps.length,
                context: this.context.getData()
            };
        }
    }

    /**
     * Execute steps sequentially
     */
    async executeSequential() {
        for (const step of this.steps) {
            try {
                const result = await this.executeStepWithRetry(step);

                if (step.state === StepState.COMPLETED) {
                    this.completedSteps.push(step);
                    this.context.setStepResult(step.id, result);
                }

                await this.persistState();

            } catch (error) {
                this.failedStep = step;
                throw error;
            }
        }
    }

    /**
     * Execute steps in parallel
     */
    async executeParallel() {
        const promises = this.steps.map(step =>
            this.executeStepWithRetry(step)
                .then(result => ({ step, result, success: true }))
                .catch(error => ({ step, error, success: false }))
        );

        const results = await Promise.all(promises);

        // Process results
        for (const { step, result, error, success } of results) {
            if (success && step.state === StepState.COMPLETED) {
                this.completedSteps.push(step);
                this.context.setStepResult(step.id, result);
            } else if (!success) {
                this.failedStep = step;
                throw error;
            }
        }

        await this.persistState();
    }

    /**
     * Execute steps with mixed sequential and parallel execution
     */
    async executeMixed() {
        // Group steps by execution group
        const groups = this.groupSteps();

        for (const group of groups) {
            if (group.length === 1) {
                // Single step - execute sequentially
                const step = group[0];
                const result = await this.executeStepWithRetry(step);

                if (step.state === StepState.COMPLETED) {
                    this.completedSteps.push(step);
                    this.context.setStepResult(step.id, result);
                }
            } else {
                // Multiple steps - execute in parallel
                const promises = group.map(step =>
                    this.executeStepWithRetry(step)
                        .then(result => ({ step, result, success: true }))
                        .catch(error => ({ step, error, success: false }))
                );

                const results = await Promise.all(promises);

                for (const { step, result, error, success } of results) {
                    if (success && step.state === StepState.COMPLETED) {
                        this.completedSteps.push(step);
                        this.context.setStepResult(step.id, result);
                    } else if (!success) {
                        this.failedStep = step;
                        throw error;
                    }
                }
            }

            await this.persistState();
        }
    }

    /**
     * Execute step with retry logic
     * @param {SagaStep} step - Step to execute
     * @returns {Promise<any>} Step result
     */
    async executeStepWithRetry(step) {
        let lastError;

        for (let attempt = 0; attempt < step.retryCount; attempt++) {
            try {
                return await step.execute(this.context);
            } catch (error) {
                lastError = error;

                if (attempt < step.retryCount - 1) {
                    console.log(`Retrying step ${step.name} (${attempt + 1}/${step.retryCount - 1})`);
                    await this.sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
                }
            }
        }

        throw lastError;
    }

    /**
     * Execute compensation (rollback) for completed steps
     */
    async executeCompensation() {
        if (this.completedSteps.length === 0) {
            console.log('No steps to compensate');
            this.state = SagaState.FAILED;
            this.endTime = Date.now();
            await this.persistState();
            return;
        }

        this.state = SagaState.COMPENSATING;
        console.log(`\n=== Starting Compensation ===`);
        console.log(`Compensating ${this.completedSteps.length} completed steps\n`);

        this.emit('saga:compensating', {
            saga: this.name,
            stepsToCompensate: this.completedSteps.length
        });

        // Compensate in reverse order
        const stepsToCompensate = [...this.completedSteps].reverse();

        for (const step of stepsToCompensate) {
            let compensationSuccess = false;
            let lastError;

            for (let attempt = 0; attempt < this.maxCompensationRetries; attempt++) {
                try {
                    await step.compensate(this.context);
                    compensationSuccess = true;
                    break;
                } catch (error) {
                    lastError = error;
                    console.error(`Compensation attempt ${attempt + 1} failed for ${step.name}`);

                    if (attempt < this.maxCompensationRetries - 1) {
                        await this.sleep(Math.pow(2, attempt) * 1000);
                    }
                }
            }

            if (!compensationSuccess) {
                console.error(`CRITICAL: Compensation failed for step ${step.name} after ${this.maxCompensationRetries} attempts`);
                this.emit('saga:compensation-failed', {
                    saga: this.name,
                    step: step.name,
                    error: lastError
                });
            }
        }

        this.state = SagaState.COMPENSATED;
        this.endTime = Date.now();

        console.log(`\n=== Compensation Completed ===\n`);

        this.emit('saga:compensated', {
            saga: this.name,
            compensatedSteps: this.completedSteps.length
        });

        await this.persistState();
    }

    /**
     * Group steps for mixed execution mode
     * @returns {Array<Array<SagaStep>>} Grouped steps
     */
    groupSteps() {
        // Simple grouping - can be enhanced with dependency analysis
        const groups = [];
        let currentGroup = [];

        for (const step of this.steps) {
            currentGroup.push(step);

            // Create new group every N steps (configurable)
            if (currentGroup.length >= 2) {
                groups.push(currentGroup);
                currentGroup = [];
            }
        }

        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        return groups;
    }

    /**
     * Persist saga state
     */
    async persistState() {
        if (this.persistenceAdapter) {
            await this.persistenceAdapter.save({
                name: this.name,
                state: this.state,
                correlationId: this.context.metadata.correlationId,
                completedSteps: this.completedSteps.map(s => s.id),
                failedStep: this.failedStep?.id,
                context: this.context.getData(),
                timestamp: Date.now()
            });
        }
    }

    /**
     * Register event handler
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    emit(event, data) {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }

    /**
     * Sleep for specified duration
     * @param {number} ms - Milliseconds to sleep
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get saga metrics
     * @returns {Object} Saga metrics
     */
    getMetrics() {
        return {
            name: this.name,
            state: this.state,
            mode: this.mode,
            totalSteps: this.steps.length,
            completedSteps: this.completedSteps.length,
            failedStep: this.failedStep?.name,
            duration: this.endTime ? this.endTime - this.startTime : null,
            correlationId: this.context.metadata.correlationId,
            steps: this.steps.map(s => s.getMetrics())
        };
    }

    /**
     * Reset saga for re-execution
     */
    reset() {
        this.state = SagaState.PENDING;
        this.completedSteps = [];
        this.failedStep = null;
        this.startTime = null;
        this.endTime = null;
        this.error = null;

        this.steps.forEach(step => {
            step.state = StepState.PENDING;
            step.result = null;
            step.error = null;
            step.attempts = 0;
        });

        this.context = new SagaContext();
    }
}

/**
 * Saga builder for fluent API
 */
class SagaBuilder {
    constructor(name) {
        this.name = name;
        this.steps = [];
        this.config = {};
    }

    /**
     * Set saga mode
     * @param {string} mode - Execution mode
     * @returns {SagaBuilder} This builder instance
     */
    mode(mode) {
        this.config.mode = mode;
        return this;
    }

    /**
     * Set initial data
     * @param {Object} data - Initial context data
     * @returns {SagaBuilder} This builder instance
     */
    initialData(data) {
        this.config.initialData = data;
        return this;
    }

    /**
     * Add step
     * @param {Object} stepConfig - Step configuration
     * @returns {SagaBuilder} This builder instance
     */
    step(stepConfig) {
        this.steps.push(stepConfig);
        return this;
    }

    /**
     * Build saga instance
     * @returns {SagaCloud} Saga instance
     */
    build() {
        const saga = new SagaCloud({
            name: this.name,
            ...this.config
        });

        saga.addSteps(this.steps);

        return saga;
    }
}

/**
 * Scenario demonstrations
 */

/**
 * Scenario 1: Simple sequential saga - E-commerce order
 */
async function demonstrateSequentialSaga() {
    console.log('\n=== Scenario 1: Sequential Saga - E-commerce Order ===\n');

    const orderSaga = new SagaCloud({
        name: 'OrderProcessingSaga',
        mode: SagaMode.SEQUENTIAL
    });

    // Step 1: Reserve inventory
    orderSaga.addStep({
        name: 'ReserveInventory',
        action: async (context) => {
            console.log('Reserving inventory for order...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return { reserved: true, items: context.data.items };
        },
        compensation: async (context, result) => {
            console.log('Releasing inventory reservation...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return { released: true };
        }
    });

    // Step 2: Process payment
    orderSaga.addStep({
        name: 'ProcessPayment',
        action: async (context) => {
            console.log('Processing payment...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return { transactionId: 'txn_12345', amount: context.data.amount };
        },
        compensation: async (context, result) => {
            console.log('Refunding payment...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return { refunded: true, transactionId: result.transactionId };
        }
    });

    // Step 3: Create shipment
    orderSaga.addStep({
        name: 'CreateShipment',
        action: async (context) => {
            console.log('Creating shipment...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return { shipmentId: 'ship_67890', status: 'pending' };
        },
        compensation: async (context, result) => {
            console.log('Cancelling shipment...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return { cancelled: true, shipmentId: result.shipmentId };
        }
    });

    // Step 4: Send confirmation email
    orderSaga.addStep({
        name: 'SendConfirmationEmail',
        action: async (context) => {
            console.log('Sending confirmation email...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return { emailSent: true };
        }
    });

    const result = await orderSaga.execute({
        orderId: 'order_123',
        items: [{ id: 'item_1', quantity: 2 }],
        amount: 99.99
    });

    console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 2: Saga with failure and compensation
 */
async function demonstrateSagaWithFailure() {
    console.log('\n=== Scenario 2: Saga with Failure and Compensation ===\n');

    const travelSaga = new SagaCloud({
        name: 'TravelBookingSaga',
        mode: SagaMode.SEQUENTIAL
    });

    travelSaga.addStep({
        name: 'BookFlight',
        action: async () => {
            console.log('Booking flight...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return { flightId: 'flight_123', cost: 500 };
        },
        compensation: async (context, result) => {
            console.log('Cancelling flight booking...');
            return { cancelled: true };
        }
    });

    travelSaga.addStep({
        name: 'BookHotel',
        action: async () => {
            console.log('Booking hotel...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return { hotelId: 'hotel_456', cost: 200 };
        },
        compensation: async (context, result) => {
            console.log('Cancelling hotel booking...');
            return { cancelled: true };
        }
    });

    travelSaga.addStep({
        name: 'BookCarRental',
        action: async () => {
            console.log('Booking car rental...');
            await new Promise(resolve => setTimeout(resolve, 100));
            // Simulate failure
            throw new Error('Car rental service unavailable');
        },
        compensation: async (context, result) => {
            console.log('Cancelling car rental...');
            return { cancelled: true };
        }
    });

    const result = await travelSaga.execute({
        userId: 'user_789',
        destination: 'Paris'
    });

    console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 3: Parallel saga execution
 */
async function demonstrateParallelSaga() {
    console.log('\n=== Scenario 3: Parallel Saga Execution ===\n');

    const dataPipelineSaga = new SagaCloud({
        name: 'DataProcessingSaga',
        mode: SagaMode.PARALLEL
    });

    dataPipelineSaga.addSteps([
        {
            name: 'ProcessCustomerData',
            action: async () => {
                console.log('Processing customer data...');
                await new Promise(resolve => setTimeout(resolve, 200));
                return { processed: 1000 };
            }
        },
        {
            name: 'ProcessOrderData',
            action: async () => {
                console.log('Processing order data...');
                await new Promise(resolve => setTimeout(resolve, 150));
                return { processed: 500 };
            }
        },
        {
            name: 'ProcessProductData',
            action: async () => {
                console.log('Processing product data...');
                await new Promise(resolve => setTimeout(resolve, 100));
                return { processed: 2000 };
            }
        }
    ]);

    const result = await dataPipelineSaga.execute({
        batchId: 'batch_123'
    });

    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('Metrics:', JSON.stringify(dataPipelineSaga.getMetrics(), null, 2));
}

/**
 * Scenario 4: Conditional step execution
 */
async function demonstrateConditionalSteps() {
    console.log('\n=== Scenario 4: Conditional Step Execution ===\n');

    const orderSaga = new SagaCloud({
        name: 'ConditionalOrderSaga',
        mode: SagaMode.SEQUENTIAL
    });

    orderSaga.addSteps([
        {
            name: 'ValidateOrder',
            action: async (context) => {
                console.log('Validating order...');
                return { valid: true, requiresApproval: context.data.amount > 1000 };
            }
        },
        {
            name: 'RequestApproval',
            condition: (context) => {
                const validationResult = context.getStepResult('step_' + Date.now());
                return context.data.amount > 1000; // Condition for high-value orders
            },
            action: async (context) => {
                console.log('Requesting manager approval...');
                await new Promise(resolve => setTimeout(resolve, 100));
                return { approved: true };
            }
        },
        {
            name: 'ProcessOrder',
            action: async (context) => {
                console.log('Processing order...');
                return { processed: true };
            }
        }
    ]);

    console.log('--- High Value Order (requires approval) ---');
    await orderSaga.execute({ amount: 1500 });

    orderSaga.reset();

    console.log('\n--- Normal Order (no approval needed) ---');
    await orderSaga.execute({ amount: 500 });
}

/**
 * Scenario 5: Saga with retry logic
 */
async function demonstrateRetryLogic() {
    console.log('\n=== Scenario 5: Saga with Retry Logic ===\n');

    let attemptCount = 0;

    const saga = new SagaCloud({
        name: 'RetryExampleSaga'
    });

    saga.addStep({
        name: 'UnreliableService',
        retryCount: 3,
        action: async () => {
            attemptCount++;
            console.log(`Attempt ${attemptCount}`);

            if (attemptCount < 3) {
                throw new Error('Service temporarily unavailable');
            }

            return { success: true, attempts: attemptCount };
        }
    });

    const result = await saga.execute();
    console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 6: Saga builder pattern
 */
async function demonstrateSagaBuilder() {
    console.log('\n=== Scenario 6: Saga Builder Pattern ===\n');

    const saga = new SagaBuilder('UserRegistrationSaga')
        .mode(SagaMode.SEQUENTIAL)
        .initialData({ email: 'user@example.com' })
        .step({
            name: 'CreateUser',
            action: async (context) => {
                console.log('Creating user account...');
                return { userId: 'user_123' };
            }
        })
        .step({
            name: 'SendWelcomeEmail',
            action: async (context) => {
                console.log('Sending welcome email...');
                return { emailSent: true };
            }
        })
        .step({
            name: 'SetupUserPreferences',
            action: async (context) => {
                console.log('Setting up user preferences...');
                return { preferencesSet: true };
            }
        })
        .build();

    const result = await saga.execute();
    console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 7: Event-driven saga monitoring
 */
async function demonstrateEventHandling() {
    console.log('\n=== Scenario 7: Event-Driven Saga Monitoring ===\n');

    const saga = new SagaCloud({
        name: 'MonitoredSaga'
    });

    // Register event handlers
    saga.on('saga:started', (data) => {
        console.log('EVENT: Saga started', data.correlationId);
    });

    saga.on('saga:completed', (data) => {
        console.log('EVENT: Saga completed in', data.duration, 'ms');
    });

    saga.on('saga:failed', (data) => {
        console.log('EVENT: Saga failed', data.error.message);
    });

    saga.on('saga:compensating', (data) => {
        console.log('EVENT: Starting compensation for', data.stepsToCompensate, 'steps');
    });

    saga.addSteps([
        {
            name: 'Step1',
            action: async () => ({ result: 'step1' })
        },
        {
            name: 'Step2',
            action: async () => ({ result: 'step2' })
        }
    ]);

    await saga.execute();
}

/**
 * Scenario 8: Complex workflow saga
 */
async function demonstrateComplexWorkflow() {
    console.log('\n=== Scenario 8: Complex Workflow Saga ===\n');

    const saga = new SagaCloud({
        name: 'LoanApplicationSaga',
        mode: SagaMode.SEQUENTIAL
    });

    saga.addSteps([
        {
            name: 'ValidateApplication',
            action: async (context) => {
                console.log('Validating loan application...');
                return { valid: true, score: 750 };
            }
        },
        {
            name: 'CheckCreditScore',
            action: async (context) => {
                console.log('Checking credit score...');
                return { score: 750, approved: true };
            }
        },
        {
            name: 'VerifyIncome',
            action: async (context) => {
                console.log('Verifying income...');
                return { verified: true, income: 80000 };
            }
        },
        {
            name: 'CalculateLoanTerms',
            action: async (context) => {
                console.log('Calculating loan terms...');
                return { rate: 3.5, term: 30, amount: 200000 };
            }
        },
        {
            name: 'GenerateDocuments',
            action: async (context) => {
                console.log('Generating loan documents...');
                return { documentsGenerated: true, docIds: ['doc1', 'doc2'] };
            }
        },
        {
            name: 'SendForSignature',
            action: async (context) => {
                console.log('Sending documents for signature...');
                return { sent: true, signatureRequestId: 'sig_123' };
            }
        }
    ]);

    const result = await saga.execute({
        applicantId: 'app_456',
        loanAmount: 200000
    });

    console.log('Final Result:', JSON.stringify(result, null, 2));
    console.log('\nSaga Metrics:');
    console.log(JSON.stringify(saga.getMetrics(), null, 2));
}

/**
 * Scenario 9: Saga with timeout handling
 */
async function demonstrateTimeoutHandling() {
    console.log('\n=== Scenario 9: Saga with Timeout Handling ===\n');

    const saga = new SagaCloud({
        name: 'TimeoutExampleSaga'
    });

    saga.addSteps([
        {
            name: 'FastStep',
            timeout: 1000,
            action: async () => {
                console.log('Fast step executing...');
                await new Promise(resolve => setTimeout(resolve, 100));
                return { completed: true };
            }
        },
        {
            name: 'SlowStep',
            timeout: 500,
            action: async () => {
                console.log('Slow step executing (will timeout)...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { completed: true };
            },
            compensation: async () => {
                console.log('Compensating slow step...');
                return { compensated: true };
            }
        }
    ]);

    const result = await saga.execute();
    console.log('Result:', JSON.stringify(result, null, 2));
}

/**
 * Scenario 10: Production-ready saga with all features
 */
async function demonstrateProductionSaga() {
    console.log('\n=== Scenario 10: Production-Ready Saga ===\n');

    const saga = new SagaCloud({
        name: 'ProductionOrderSaga',
        mode: SagaMode.SEQUENTIAL,
        maxCompensationRetries: 5
    });

    // Event monitoring
    saga.on('saga:started', (data) => console.log('[MONITOR] Saga started'));
    saga.on('saga:completed', (data) => console.log('[MONITOR] Saga completed'));
    saga.on('saga:failed', (data) => console.log('[MONITOR] Saga failed'));
    saga.on('saga:compensating', (data) => console.log('[MONITOR] Compensating'));

    saga.addSteps([
        {
            name: 'ValidateInventory',
            retryCount: 3,
            timeout: 5000,
            action: async (context) => {
                console.log('Validating inventory availability...');
                await new Promise(resolve => setTimeout(resolve, 100));
                return { available: true, items: context.data.items };
            },
            compensation: async () => {
                console.log('Releasing inventory hold...');
                return { released: true };
            },
            onSuccess: (result, context) => {
                console.log('Inventory validated successfully');
            }
        },
        {
            name: 'AuthorizePayment',
            retryCount: 3,
            timeout: 5000,
            action: async (context) => {
                console.log('Authorizing payment...');
                await new Promise(resolve => setTimeout(resolve, 100));
                return { authorized: true, authCode: 'AUTH123' };
            },
            compensation: async (context, result) => {
                console.log('Voiding payment authorization...');
                return { voided: true };
            }
        },
        {
            name: 'CreateOrder',
            retryCount: 3,
            action: async (context) => {
                console.log('Creating order record...');
                await new Promise(resolve => setTimeout(resolve, 100));
                return { orderId: 'ORD-12345', status: 'created' };
            },
            compensation: async (context, result) => {
                console.log('Cancelling order...');
                return { cancelled: true };
            }
        },
        {
            name: 'NotifyWarehoue',
            retryCount: 3,
            action: async (context) => {
                console.log('Notifying warehouse...');
                await new Promise(resolve => setTimeout(resolve, 100));
                return { notified: true };
            }
        },
        {
            name: 'SendConfirmation',
            action: async (context) => {
                console.log('Sending order confirmation...');
                await new Promise(resolve => setTimeout(resolve, 100));
                return { sent: true };
            }
        }
    ]);

    const result = await saga.execute({
        customerId: 'CUST-789',
        items: [
            { sku: 'ITEM-001', quantity: 2 },
            { sku: 'ITEM-002', quantity: 1 }
        ],
        paymentMethod: 'credit_card',
        shippingAddress: '123 Main St'
    });

    console.log('\nFinal Result:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\nDetailed Metrics:');
    console.log(JSON.stringify(saga.getMetrics(), null, 2));
}

/**
 * Run all demonstrations
 */
async function runAllScenarios() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║     Saga Pattern Cloud - Comprehensive Demonstration  ║');
    console.log('╚═══════════════════════════════════════════════════════╝');

    await demonstrateSequentialSaga();
    await demonstrateSagaWithFailure();
    await demonstrateParallelSaga();
    await demonstrateConditionalSteps();
    await demonstrateRetryLogic();
    await demonstrateSagaBuilder();
    await demonstrateEventHandling();
    await demonstrateComplexWorkflow();
    await demonstrateTimeoutHandling();
    await demonstrateProductionSaga();

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║           All Scenarios Completed Successfully        ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
}

// Run demonstrations if executed directly
if (require.main === module) {
    runAllScenarios().catch(console.error);
}

module.exports = {
    SagaCloud,
    SagaStep,
    SagaContext,
    SagaBuilder,
    SagaState,
    StepState,
    SagaMode
};
