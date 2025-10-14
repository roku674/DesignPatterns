# Application Controller Pattern

A centralized point for handling screen navigation and the flow of an application. The Application Controller manages the logic of which screen to display next and coordinates the workflow between different views and controllers.

## Use Cases

- Complex navigation flows in web applications
- Wizard-style interfaces and multi-step forms
- Workflow management and business process automation
- Single Page Application (SPA) routing
- State machine implementations for UI flows

## Implementation

This pattern provides four controller types:

1. **ApplicationController**: Base controller with command registration and view navigation
2. **WebApplicationController**: Web-specific controller with routing, middleware, and error handling
3. **WizardController**: Multi-step wizard with validation and state management
4. **FlowController**: Business process flow management with state machines

## Key Benefits

- Centralizes navigation logic
- Reduces coupling between views
- Makes navigation flows testable
- Supports complex workflows
- Enables reusable navigation components

## Related Patterns

- Front Controller
- Page Controller
- Model-View-Controller (MVC)
- State Pattern

## Run
```bash
node index.js
```
