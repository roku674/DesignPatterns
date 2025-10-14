/**
 * Application Controller Pattern
 *
 * A centralized point for handling screen navigation and the flow of an application.
 * It manages the logic of which screen to display next and coordinates the workflow
 * between different views and controllers.
 *
 * Use Cases:
 * - Complex navigation flows
 * - Wizard-style interfaces
 * - Multi-step forms
 * - Workflow management
 * - Single Page Applications (SPA) routing
 */

/**
 * Base Application Controller
 * Manages the overall flow and navigation of the application
 */
class ApplicationController {
  constructor() {
    this.commands = new Map();
    this.currentView = null;
    this.navigationHistory = [];
    this.viewStack = [];
  }

  /**
   * Register a command with its handler
   * @param {string} commandName - Command identifier
   * @param {Function} handler - Command handler function
   */
  registerCommand(commandName, handler) {
    this.commands.set(commandName, handler);
  }

  /**
   * Execute a command
   * @param {string} commandName - Command to execute
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Command result
   */
  async executeCommand(commandName, context = {}) {
    const handler = this.commands.get(commandName);

    if (!handler) {
      throw new Error(`Command not found: ${commandName}`);
    }

    this.navigationHistory.push({
      command: commandName,
      timestamp: new Date(),
      context
    });

    return await handler(context);
  }

  /**
   * Navigate to a view
   * @param {string} viewName - View identifier
   * @param {Object} data - Data to pass to view
   */
  navigateTo(viewName, data = {}) {
    if (this.currentView) {
      this.viewStack.push(this.currentView);
    }

    this.currentView = {
      name: viewName,
      data,
      timestamp: new Date()
    };

    return this.currentView;
  }

  /**
   * Navigate back to previous view
   * @returns {Object|null} Previous view
   */
  navigateBack() {
    if (this.viewStack.length === 0) {
      return null;
    }

    this.currentView = this.viewStack.pop();
    return this.currentView;
  }

  /**
   * Get navigation history
   * @returns {Array} Navigation history
   */
  getNavigationHistory() {
    return this.navigationHistory;
  }

  /**
   * Clear navigation history
   */
  clearHistory() {
    this.navigationHistory = [];
    this.viewStack = [];
  }
}

/**
 * Web Application Controller
 * Handles web-specific navigation and routing
 */
class WebApplicationController extends ApplicationController {
  constructor() {
    super();
    this.routes = new Map();
    this.middlewares = [];
    this.errorHandlers = [];
  }

  /**
   * Register a route
   * @param {string} path - URL path
   * @param {string} method - HTTP method
   * @param {Function} handler - Route handler
   */
  registerRoute(path, method, handler) {
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, handler);
  }

  /**
   * Add middleware
   * @param {Function} middleware - Middleware function
   */
  use(middleware) {
    this.middlewares.push(middleware);
  }

  /**
   * Add error handler
   * @param {Function} handler - Error handler function
   */
  onError(handler) {
    this.errorHandlers.push(handler);
  }

  /**
   * Handle HTTP request
   * @param {Object} request - HTTP request
   * @returns {Promise<Object>} HTTP response
   */
  async handleRequest(request) {
    try {
      // Execute middlewares
      let context = { request, response: {} };

      for (const middleware of this.middlewares) {
        const result = await middleware(context);
        if (result === false) {
          return context.response;
        }
      }

      // Find and execute route handler
      const key = `${request.method}:${request.path}`;
      const handler = this.routes.get(key);

      if (!handler) {
        return {
          status: 404,
          body: { error: 'Route not found' }
        };
      }

      const response = await handler(context);
      return response;

    } catch (error) {
      // Execute error handlers
      for (const errorHandler of this.errorHandlers) {
        const response = await errorHandler(error, request);
        if (response) {
          return response;
        }
      }

      return {
        status: 500,
        body: { error: error.message }
      };
    }
  }
}

/**
 * Wizard Controller
 * Manages multi-step wizard flows
 */
class WizardController extends ApplicationController {
  constructor(steps) {
    super();
    this.steps = steps;
    this.currentStepIndex = 0;
    this.wizardData = {};
  }

  /**
   * Get current step
   * @returns {Object} Current step
   */
  getCurrentStep() {
    return {
      step: this.steps[this.currentStepIndex],
      index: this.currentStepIndex,
      total: this.steps.length,
      data: this.wizardData
    };
  }

  /**
   * Move to next step
   * @param {Object} stepData - Data from current step
   * @returns {Object|null} Next step or null if complete
   */
  next(stepData = {}) {
    // Store current step data
    const currentStep = this.steps[this.currentStepIndex];
    this.wizardData[currentStep.name] = stepData;

    // Validate if validator exists
    if (currentStep.validate) {
      const validation = currentStep.validate(stepData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Move to next step
    this.currentStepIndex++;

    if (this.currentStepIndex >= this.steps.length) {
      return null; // Wizard complete
    }

    return this.getCurrentStep();
  }

  /**
   * Move to previous step
   * @returns {Object|null} Previous step or null if at start
   */
  previous() {
    if (this.currentStepIndex === 0) {
      return null;
    }

    this.currentStepIndex--;
    return this.getCurrentStep();
  }

  /**
   * Jump to specific step
   * @param {number} stepIndex - Step index
   * @returns {Object} Step at index
   */
  jumpToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      throw new Error('Invalid step index');
    }

    this.currentStepIndex = stepIndex;
    return this.getCurrentStep();
  }

  /**
   * Check if wizard is complete
   * @returns {boolean} True if all steps completed
   */
  isComplete() {
    return this.currentStepIndex >= this.steps.length;
  }

  /**
   * Get all wizard data
   * @returns {Object} Complete wizard data
   */
  getWizardData() {
    return this.wizardData;
  }

  /**
   * Reset wizard
   */
  reset() {
    this.currentStepIndex = 0;
    this.wizardData = {};
  }
}

/**
 * Flow Controller
 * Manages complex business process flows
 */
class FlowController extends ApplicationController {
  constructor() {
    super();
    this.flows = new Map();
    this.activeFlows = new Map();
  }

  /**
   * Define a flow
   * @param {string} flowName - Flow identifier
   * @param {Object} flowDefinition - Flow definition
   */
  defineFlow(flowName, flowDefinition) {
    this.flows.set(flowName, flowDefinition);
  }

  /**
   * Start a flow
   * @param {string} flowName - Flow to start
   * @param {Object} initialData - Initial flow data
   * @returns {string} Flow instance ID
   */
  startFlow(flowName, initialData = {}) {
    const flowDef = this.flows.get(flowName);

    if (!flowDef) {
      throw new Error(`Flow not found: ${flowName}`);
    }

    const flowId = `${flowName}_${Date.now()}`;

    this.activeFlows.set(flowId, {
      name: flowName,
      definition: flowDef,
      currentState: flowDef.initialState,
      data: initialData,
      history: [],
      startedAt: new Date()
    });

    return flowId;
  }

  /**
   * Transition flow state
   * @param {string} flowId - Flow instance ID
   * @param {string} event - Event to trigger
   * @param {Object} eventData - Event data
   * @returns {Object} New flow state
   */
  async transition(flowId, event, eventData = {}) {
    const flow = this.activeFlows.get(flowId);

    if (!flow) {
      throw new Error(`Flow not found: ${flowId}`);
    }

    const currentState = flow.definition.states[flow.currentState];
    const transition = currentState.transitions[event];

    if (!transition) {
      throw new Error(`Invalid transition: ${event} from state ${flow.currentState}`);
    }

    // Execute transition action if exists
    if (transition.action) {
      await transition.action(flow.data, eventData);
    }

    // Record history
    flow.history.push({
      from: flow.currentState,
      to: transition.nextState,
      event,
      timestamp: new Date(),
      data: eventData
    });

    // Update state
    flow.currentState = transition.nextState;

    // Check if flow is complete
    if (flow.definition.states[flow.currentState].isFinal) {
      flow.completedAt = new Date();
    }

    return {
      flowId,
      currentState: flow.currentState,
      isFinal: flow.definition.states[flow.currentState].isFinal || false,
      data: flow.data
    };
  }

  /**
   * Get flow status
   * @param {string} flowId - Flow instance ID
   * @returns {Object} Flow status
   */
  getFlowStatus(flowId) {
    const flow = this.activeFlows.get(flowId);

    if (!flow) {
      throw new Error(`Flow not found: ${flowId}`);
    }

    return {
      flowId,
      name: flow.name,
      currentState: flow.currentState,
      isComplete: flow.definition.states[flow.currentState].isFinal || false,
      startedAt: flow.startedAt,
      completedAt: flow.completedAt,
      history: flow.history
    };
  }

  /**
   * Cancel a flow
   * @param {string} flowId - Flow instance ID
   */
  cancelFlow(flowId) {
    this.activeFlows.delete(flowId);
  }
}

module.exports = {
  ApplicationController,
  WebApplicationController,
  WizardController,
  FlowController
};
