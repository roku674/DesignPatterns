# Transaction Script Pattern

## Intent
Organizes business logic by procedures where each procedure handles a single request from the presentation layer. All the logic for a transaction is contained in a single procedure.

## When to Use
- Simple business logic that doesn't require complex domain models
- CRUD-heavy applications
- Quick prototypes and simple applications
- When you want straightforward, easy-to-understand code
- Applications with minimal business rules

## Structure
Each transaction script:
- Is a single procedure/method
- Contains all logic for one transaction
- Handles database access directly
- Manages its own transaction boundaries

## Example
This implementation shows:
1. **MoneyTransferScript** - Handles bank account transfers
2. **OrderProcessingScript** - Processes customer orders

Each script encapsulates the complete business logic for its transaction, including validation, data access, and external service calls.

## Benefits
- Simple and straightforward
- Easy to understand and maintain for simple logic
- No complex object-relational mapping needed
- Quick to implement

## Drawbacks
- Code duplication across similar transactions
- Becomes unwieldy as business logic grows
- Difficult to refactor and extend
- No domain model to work with

## Run
```bash
node index.js
```
