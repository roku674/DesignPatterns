const {
  ApplicationController,
  WebApplicationController,
  WizardController,
  FlowController
} = require('./ApplicationController');

console.log('=== Application Controller Pattern Demonstrations ===\n');

/**
 * Scenario 1: Basic Command Registration and Execution
 */
async function demonstrateBasicController() {
  console.log('--- Scenario 1: Basic Command Registration ---');

  const controller = new ApplicationController();

  // Register commands
  controller.registerCommand('login', async (context) => {
    console.log(`Executing login for user: ${context.username}`);
    return { success: true, userId: 'USER123' };
  });

  controller.registerCommand('logout', async (context) => {
    console.log(`Logging out user: ${context.userId}`);
    return { success: true };
  });

  // Execute commands
  const loginResult = await controller.executeCommand('login', {
    username: 'john.doe@example.com'
  });
  console.log('Login result:', loginResult);

  const logoutResult = await controller.executeCommand('logout', {
    userId: 'USER123'
  });
  console.log('Logout result:', logoutResult);

  console.log('Command history:', controller.getNavigationHistory().length, 'commands');
  console.log();
}

/**
 * Scenario 2: View Navigation
 */
function demonstrateNavigation() {
  console.log('--- Scenario 2: View Navigation ---');

  const controller = new ApplicationController();

  // Navigate through views
  controller.navigateTo('home', { userId: 'USER123' });
  console.log('Current view:', controller.currentView.name);

  controller.navigateTo('profile', { userId: 'USER123', edit: true });
  console.log('Current view:', controller.currentView.name);

  controller.navigateTo('settings', { section: 'privacy' });
  console.log('Current view:', controller.currentView.name);

  // Navigate back
  controller.navigateBack();
  console.log('After back:', controller.currentView.name);

  controller.navigateBack();
  console.log('After back:', controller.currentView.name);

  console.log();
}

/**
 * Scenario 3: Web Application Controller with Routes
 */
async function demonstrateWebController() {
  console.log('--- Scenario 3: Web Application Controller ---');

  const webController = new WebApplicationController();

  // Add middleware
  webController.use(async (context) => {
    console.log(`[Middleware] ${context.request.method} ${context.request.path}`);
    context.request.timestamp = new Date();
    return true; // Continue
  });

  webController.use(async (context) => {
    // Authentication middleware
    if (!context.request.headers?.authorization) {
      context.response = {
        status: 401,
        body: { error: 'Unauthorized' }
      };
      return false; // Stop processing
    }
    return true;
  });

  // Register routes
  webController.registerRoute('/api/users', 'GET', async (context) => {
    return {
      status: 200,
      body: { users: ['John', 'Jane', 'Bob'] }
    };
  });

  webController.registerRoute('/api/users/:id', 'GET', async (context) => {
    return {
      status: 200,
      body: { user: { id: context.request.params.id, name: 'John Doe' } }
    };
  });

  // Add error handler
  webController.onError(async (error, request) => {
    console.log('[Error Handler] Error occurred:', error.message);
    return {
      status: 500,
      body: { error: 'Internal Server Error' }
    };
  });

  // Test requests
  const request1 = {
    method: 'GET',
    path: '/api/users',
    headers: { authorization: 'Bearer token123' }
  };

  const response1 = await webController.handleRequest(request1);
  console.log('Response 1:', response1);

  const request2 = {
    method: 'GET',
    path: '/api/users',
    headers: {} // No authorization
  };

  const response2 = await webController.handleRequest(request2);
  console.log('Response 2:', response2);

  console.log();
}

/**
 * Scenario 4: Wizard Controller for Multi-Step Form
 */
function demonstrateWizard() {
  console.log('--- Scenario 4: Wizard Controller ---');

  const wizardSteps = [
    {
      name: 'personal',
      title: 'Personal Information',
      validate: (data) => {
        if (!data.name || !data.email) {
          return { valid: false, errors: ['Name and email required'] };
        }
        return { valid: true };
      }
    },
    {
      name: 'address',
      title: 'Address Information',
      validate: (data) => {
        if (!data.street || !data.city) {
          return { valid: false, errors: ['Street and city required'] };
        }
        return { valid: true };
      }
    },
    {
      name: 'payment',
      title: 'Payment Information',
      validate: (data) => {
        if (!data.cardNumber) {
          return { valid: false, errors: ['Card number required'] };
        }
        return { valid: true };
      }
    },
    {
      name: 'confirmation',
      title: 'Review and Confirm'
    }
  ];

  const wizard = new WizardController(wizardSteps);

  console.log('Starting wizard...');
  console.log('Current step:', wizard.getCurrentStep().step.title);

  // Step 1: Personal info
  wizard.next({
    name: 'John Doe',
    email: 'john@example.com'
  });
  console.log('After step 1:', wizard.getCurrentStep().step.title);

  // Step 2: Address
  wizard.next({
    street: '123 Main St',
    city: 'Anytown',
    zip: '12345'
  });
  console.log('After step 2:', wizard.getCurrentStep().step.title);

  // Go back
  wizard.previous();
  console.log('After going back:', wizard.getCurrentStep().step.title);

  // Go forward again
  wizard.next({
    street: '123 Main St',
    city: 'Anytown',
    zip: '12345'
  });

  // Step 3: Payment
  wizard.next({
    cardNumber: '**** **** **** 1234',
    expiryDate: '12/25'
  });
  console.log('After step 3:', wizard.getCurrentStep().step.title);

  // Finish
  wizard.next();
  console.log('Wizard complete:', wizard.isComplete());
  console.log('All wizard data:', Object.keys(wizard.getWizardData()));

  console.log();
}

/**
 * Scenario 5: Flow Controller for Business Process
 */
async function demonstrateFlowController() {
  console.log('--- Scenario 5: Flow Controller (Order Processing) ---');

  const flowController = new FlowController();

  // Define order processing flow
  flowController.defineFlow('orderProcessing', {
    initialState: 'draft',
    states: {
      draft: {
        transitions: {
          submit: {
            nextState: 'pending_payment',
            action: async (flowData, eventData) => {
              console.log('[Action] Order submitted, awaiting payment');
              flowData.orderId = 'ORD' + Date.now();
            }
          }
        }
      },
      pending_payment: {
        transitions: {
          pay: {
            nextState: 'processing',
            action: async (flowData, eventData) => {
              console.log('[Action] Payment received, processing order');
              flowData.paymentId = eventData.paymentId;
            }
          },
          cancel: {
            nextState: 'cancelled'
          }
        }
      },
      processing: {
        transitions: {
          ship: {
            nextState: 'shipped',
            action: async (flowData, eventData) => {
              console.log('[Action] Order shipped');
              flowData.trackingNumber = eventData.trackingNumber;
            }
          },
          fail: {
            nextState: 'failed'
          }
        }
      },
      shipped: {
        transitions: {
          deliver: {
            nextState: 'delivered',
            action: async (flowData) => {
              console.log('[Action] Order delivered');
            }
          }
        },
        isFinal: false
      },
      delivered: {
        isFinal: true
      },
      cancelled: {
        isFinal: true
      },
      failed: {
        isFinal: true
      }
    }
  });

  // Start flow
  const flowId = flowController.startFlow('orderProcessing', {
    customerId: 'CUST123',
    items: ['ITEM1', 'ITEM2']
  });

  console.log('Flow started:', flowId);

  // Transition through states
  await flowController.transition(flowId, 'submit');
  console.log('Status:', flowController.getFlowStatus(flowId).currentState);

  await flowController.transition(flowId, 'pay', {
    paymentId: 'PAY123456'
  });
  console.log('Status:', flowController.getFlowStatus(flowId).currentState);

  await flowController.transition(flowId, 'ship', {
    trackingNumber: 'TRACK789'
  });
  console.log('Status:', flowController.getFlowStatus(flowId).currentState);

  await flowController.transition(flowId, 'deliver');
  console.log('Status:', flowController.getFlowStatus(flowId).currentState);

  const finalStatus = flowController.getFlowStatus(flowId);
  console.log('Flow complete:', finalStatus.isComplete);
  console.log('State transitions:', finalStatus.history.length);

  console.log();
}

/**
 * Scenario 6: Multi-Flow Management
 */
async function demonstrateMultiFlow() {
  console.log('--- Scenario 6: Multi-Flow Management ---');

  const flowController = new FlowController();

  // Define approval flow
  flowController.defineFlow('approval', {
    initialState: 'pending',
    states: {
      pending: {
        transitions: {
          approve: { nextState: 'approved' },
          reject: { nextState: 'rejected' }
        }
      },
      approved: { isFinal: true },
      rejected: { isFinal: true }
    }
  });

  // Start multiple flows
  const flow1 = flowController.startFlow('approval', { document: 'DOC1' });
  const flow2 = flowController.startFlow('approval', { document: 'DOC2' });
  const flow3 = flowController.startFlow('approval', { document: 'DOC3' });

  console.log('Started 3 approval flows');

  // Process flows differently
  await flowController.transition(flow1, 'approve');
  await flowController.transition(flow2, 'reject');
  // flow3 still pending

  console.log('Flow 1:', flowController.getFlowStatus(flow1).currentState);
  console.log('Flow 2:', flowController.getFlowStatus(flow2).currentState);
  console.log('Flow 3:', flowController.getFlowStatus(flow3).currentState);

  console.log();
}

/**
 * Scenario 7: Error Handling in Wizard
 */
function demonstrateWizardErrorHandling() {
  console.log('--- Scenario 7: Wizard Validation Errors ---');

  const wizard = new WizardController([
    {
      name: 'step1',
      title: 'Step 1',
      validate: (data) => {
        if (!data.required) {
          return { valid: false, errors: ['Required field missing'] };
        }
        return { valid: true };
      }
    },
    {
      name: 'step2',
      title: 'Step 2'
    }
  ]);

  try {
    // Try to proceed without required data
    wizard.next({ optional: 'value' });
  } catch (error) {
    console.log('Validation error caught:', error.message);
  }

  // Now with valid data
  wizard.next({ required: 'value' });
  console.log('Proceeded to step 2 successfully');

  console.log();
}

// Run all demonstrations
(async () => {
  await demonstrateBasicController();
  demonstrateNavigation();
  await demonstrateWebController();
  demonstrateWizard();
  await demonstrateFlowController();
  await demonstrateMultiFlow();
  demonstrateWizardErrorHandling();

  console.log('=== All demonstrations complete ===');
})();
