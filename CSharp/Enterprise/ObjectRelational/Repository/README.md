# Repository Pattern

## Intent
Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects. Provides a more object-oriented view of the persistence layer.

## When to Use
- When you want to decouple domain logic from data access logic
- To provide a centralized location for data access logic
- When you need to support multiple data sources
- To make unit testing easier by mocking the repository
- When you want collection-like operations on domain objects

## Structure
- **IRepository<T>**: Generic repository interface defining CRUD operations
- **InMemoryRepository<T>**: Concrete implementation (in production, use EF Core or other ORM)
- **Domain Entities**: Objects managed by repositories (Customer, Product)
- **IEntity**: Base interface providing Id property

## Key Concepts
- **Collection-Like Interface**: Repositories expose methods similar to collections
- **Abstraction**: Hides data access details from domain layer
- **Testability**: Easy to mock for unit testing
- **LINQ Support**: Allows expressive queries with lambda expressions
- **Generic Implementation**: Reusable across different entity types

## Real-World Example
This implementation demonstrates:
- Generic repository interface with common operations
- Type-safe queries using Expression<Func<T, bool>>
- In-memory storage for demonstration
- CRUD operations: Create, Read, Update, Delete
- Predicate-based querying
- Entity existence checking and counting

## Advantages
- Centralizes data access logic
- Provides consistent API across different entities
- Easy to test (mock repositories in unit tests)
- Reduces code duplication
- Shields domain layer from data access details
- Easy to swap implementations

## Disadvantages
- Can become too generic and lose domain-specific operations
- May add unnecessary abstraction for simple applications
- Can lead to "leaky abstractions" if not careful
- Performance overhead from abstraction layer

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Enterprise/ObjectRelational/Repository
dotnet run
```

## Example Output
```
=== Repository Pattern Demo ===

Adding customers...
Added 3 customers

Adding products...
Added 4 products

All customers:
  Customer[1]: John Doe (john@example.com) - Active: True
  Customer[2]: Jane Smith (jane@example.com) - Active: True
  Customer[3]: Bob Wilson (bob@example.com) - Active: True
```

## Best Practices
- Keep repositories focused on data access, not business logic
- Use specification pattern for complex queries
- Consider implementing Unit of Work pattern alongside Repository
- Don't expose IQueryable from repositories (breaks encapsulation)
- Implement async versions for production applications

## References
- Martin Fowler's Patterns of Enterprise Application Architecture
- Design Patterns: Elements of Reusable Object-Oriented Software
