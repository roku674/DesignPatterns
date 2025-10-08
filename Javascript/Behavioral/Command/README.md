# Command Pattern

## Intent
Encapsulates a request as an object, letting you parameterize clients with different requests, queue or log requests, and support undoable operations.

## Key Components
- **Command**: Declares interface for executing operations
- **ConcreteCommand**: Binds receiver with action
- **Invoker**: Asks command to carry out request
- **Receiver**: Knows how to perform operations

## How to Run
```bash
node index.js
```
