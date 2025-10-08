# Domain Model Pattern

## Intent
Create an object model of the domain that incorporates both behavior and data. Business logic is distributed across domain objects rather than being centralized in transaction scripts.

## When to Use
- Complex business logic and rules
- Rich domain behavior
- Applications that will grow and evolve
- When you need a robust object model
- When business rules are complex and interrelated

## Structure
- **Entities**: Objects with identity (Account, Order, Customer)
- **Value Objects**: Objects defined by their values (Money, Address)
- **Business Logic**: Embedded in domain objects
- **Behavior**: Rich methods that enforce business rules

## Example
This implementation demonstrates:
1. **Money** - Value object with currency-safe operations
2. **Account** - Entity managing balance and transactions
3. **Order** - Entity with complex workflow and business rules
4. **Customer** - Entity with membership levels

## Benefits
- Business logic is object-oriented and reusable
- Easy to understand and maintain complex domains
- Facilitates refactoring and extension
- Better encapsulation of business rules
- Supports rich domain behavior

## Drawbacks
- More complex than transaction scripts
- Requires good OOP knowledge
- Can be overkill for simple applications
- Needs careful design

## Run
```bash
node index.js
```
