# Transaction Script Pattern

## Intent
Organizes business logic by procedures where each procedure handles a single request from the presentation layer. Each transaction is handled by a single procedural script.

## When to Use
- Simple business logic that doesn't require complex domain models
- Applications with few business rules
- When procedures map naturally to system transactions
- Small to medium-sized applications
- When developers are more comfortable with procedural code

## Structure
- **Transaction Script**: A procedure that handles a single business transaction
- **Data Gateway**: Provides access to the data source
- Each script contains all logic for one transaction (validation, calculation, persistence)

## Real-World Example
This implementation shows an order processing system where:
- `PlaceOrder` handles all logic for creating an order (validation, inventory check, order creation, inventory update)
- `CancelOrder` handles order cancellation and inventory restoration
- Each method is a complete, self-contained transaction

## Advantages
- Simple and easy to understand
- Quick to implement for straightforward logic
- Easy to test individual transactions
- No complex object-relational mapping needed

## Disadvantages
- Code duplication across similar transactions
- Difficult to maintain as complexity grows
- No reuse of domain logic
- Can lead to scattered business rules

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Enterprise/DomainLogic/TransactionScript
dotnet run
```

## Example Output
```
=== Transaction Script Pattern Demo ===

1. Placing order for customer 1:
Order 1 placed successfully. Total: $1999.98

2. Placing another order:
Order 2 placed successfully. Total: $149.95

3. Cancelling first order:
Order 1 cancelled successfully

4. Attempting to place order with insufficient stock:
Error: Insufficient stock
```
