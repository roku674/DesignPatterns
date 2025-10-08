# Domain Model Pattern

## Intent
An object model of the domain that incorporates both behavior and data. Domain objects contain business logic and are not just data holders.

## When to Use
- Complex business logic that benefits from OOP
- Rich domain with business rules
- When business logic needs to be in one place
- Applications with complex validation and calculations
- When you need polymorphism and inheritance

## Structure
```
Domain Model (Rich Objects with Behavior)
├─ Customer
│  ├─ canPlaceOrder()
│  ├─ calculateOutstandingBalance()
│  └─ increaseCreditLimit()
├─ Order
│  ├─ getTotal()
│  ├─ processPayment()
│  └─ cancel()
└─ Product
   ├─ isInStock()
   └─ reserveStock()
```

## vs Transaction Script
- Transaction Script: Procedural, business logic in procedures
- Domain Model: OO, business logic in domain objects
- Transaction Script: Simple, direct database access
- Domain Model: Complex, layered architecture

## Advantages
- Business logic is centralized in domain objects
- Object-oriented benefits (polymorphism, inheritance)
- Easier to test in isolation
- More maintainable for complex domains
- Clearer business intent
- Reusable business rules

## Disadvantages
- Higher learning curve
- More complex setup
- Requires ORM or data mapping
- Overkill for simple applications
- More code than Transaction Script

## Implementation Details
- Rich domain objects with behavior
- Business rules in domain classes
- Objects collaborate to implement use cases
- Separated from database concerns
- Uses Repository or Data Mapper for persistence

## Compile and Run
```bash
# Compile
javac Enterprise/DomainModel/*.java

# Run
java Enterprise.DomainModel.Main
```

## Example Output
```
=== Domain Model Pattern Demo ===

Created customer: John Doe
Customer type: PREMIUM
Credit limit: $5000
Discount: 5%

--- Placing Order ---
Order placed successfully
Order total: $2046.25
Outstanding balance: $2046.25

--- Processing Payment ---
Payment processed. Order status: PAID
```
