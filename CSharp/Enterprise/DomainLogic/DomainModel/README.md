# Domain Model Pattern

## Intent
An object model of the domain that incorporates both behavior and data. Business logic is embedded in the domain objects themselves, creating a rich model with objects that contain both data and behavior.

## When to Use
- Complex business logic with many interconnected rules
- Rich domain with significant business behavior
- When you need object-oriented design benefits (inheritance, polymorphism)
- Long-term projects where maintainability is important
- When multiple operations need to interact with the same domain concepts

## Structure
- **Entity**: Objects with identity that persists over time (Order, Customer, Product)
- **Value Object**: Objects defined by their attributes without identity (OrderLine, Money)
- **Aggregate**: Cluster of objects treated as a unit (Order aggregate containing OrderLines)
- **Repository**: Provides persistence for aggregates
- Domain objects encapsulate business rules and validation

## Real-World Example
This implementation shows an e-commerce domain model with:
- **Customer**: Entity with credit limit management and VIP status
- **Product**: Entity with inventory management (stock, reserved stock)
- **Order**: Aggregate root managing order lifecycle and business rules
- **OrderLine**: Value object representing line items
- Rich business logic: discount calculation, inventory reservation, order state transitions

## Key Concepts
- **Encapsulation**: Business rules are inside domain objects
- **Rich Behavior**: Objects do things, not just hold data
- **State Transitions**: Objects manage their own state changes
- **Business Invariants**: Rules enforced by the objects themselves

## Advantages
- Centralizes business logic in one place
- Object-oriented design benefits
- Easier to test business rules
- More maintainable for complex domains
- Supports refactoring and evolution

## Disadvantages
- Steeper learning curve
- More complex than Transaction Script
- Requires good OO design skills
- May be overkill for simple applications
- Can be harder to map to database

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Enterprise/DomainLogic/DomainModel
dotnet run
```

## Example Output
```
=== Domain Model Pattern Demo ===

Customer: John Doe, Credit Limit: $5000
Product: Laptop, Price: $999.99, Stock: 10
Product: Mouse, Price: $29.99, Stock: 50

Creating new order...
Added 2 Laptops
Added 3 Mouses

Order Total: $2089.95
Discount: $208.99 (10% for orders over $1000)
Final Total: $1880.96

Placing order...
Order placed successfully! Status: Placed
Laptop available stock: 8
Mouse available stock: 47
```
