# Transaction Script Pattern

## Intent
Organizes business logic by procedures where each procedure handles a single request from the presentation layer. All logic for a transaction is contained in a single procedure.

## When to Use
- Simple business logic that doesn't benefit from domain model
- Small applications with straightforward processing
- Quick development with minimal complexity
- When developers are more comfortable with procedural programming
- CRUD operations without complex business rules

## Structure
```
OrderService (Transaction Scripts)
  ├─ createOrder()
  ├─ processPayment()
  ├─ cancelOrder()
  └─ getCustomerOrders()
```

## Implementation Details
- Each method is a complete transaction script
- Contains validation, business logic, and data access
- Scripts work directly with database
- No domain object behavior
- Simple to understand and implement

## Advantages
- Simple and easy to understand
- Quick to implement
- Good for simple applications
- Low learning curve
- Direct database access

## Disadvantages
- Code duplication across scripts
- Difficult to maintain as complexity grows
- No object-oriented benefits
- Business logic scattered
- Hard to test in isolation

## Compile and Run
```bash
# Compile
javac -cp ".:h2-*.jar" Enterprise/TransactionScript/*.java

# Run
java -cp ".:h2-*.jar" Enterprise.TransactionScript.Main
```

## Example Output
```
=== Transaction Script Pattern Demo ===

1. Creating orders...
Created order #1
Created order #2

2. Processing payment for order #1
Payment processed successfully

3. Cancelling order #2
Order cancelled

4. Retrieving all orders for customer...
Order{id=1, customerId=1, totalAmount=110.00, status='PAID'}
Order{id=2, customerId=1, totalAmount=275.00, status='CANCELLED'}
```
