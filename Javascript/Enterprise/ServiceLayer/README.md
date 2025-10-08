# Service Layer Pattern

## Intent
Defines an application's boundary with a layer of services that establishes a set of available operations and coordinates the application's response in each operation.

## When to Use
- Multiple clients need to access business logic
- Complex business operations span multiple domain objects
- Need transaction management across operations
- Want to decouple presentation from business logic
- Need a clear API for the application

## Structure
- **Service classes** encapsulate business operations
- Coordinate multiple domain objects and repositories
- Manage transactions and error handling
- Emit domain events
- Call external services

## Example
- **BankingService** - Coordinates money transfers, manages transactions
- **OrderService** - Orchestrates order placement across inventory, payment, shipping

## Benefits
- Clear separation of concerns
- Reusable business operations
- Transaction boundary management
- Easy to test
- Multiple clients can use same services

## Drawbacks
- Can become anemic if overused
- Might duplicate domain logic
- Additional layer of complexity

## Run
```bash
node index.js
```
