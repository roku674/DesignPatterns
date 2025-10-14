# Repository Pattern with Entity Framework Core

## Intent
Provide an abstraction layer over Entity Framework Core data access operations, enabling easier testing, maintenance, and consistent data access patterns across the application.

## Pattern Type
Structural Pattern (Data Access Layer)

## Also Known As
- Data Access Layer Pattern
- DAO (Data Access Object)

## Motivation
Direct use of DbContext throughout application code creates tight coupling and makes unit testing difficult. The Repository pattern abstracts EF Core operations behind interfaces, providing a clean separation between business logic and data access.

## Applicability
Use Repository Pattern when:
- You need to abstract data access logic
- Unit testing with mocked data is required
- Multiple data sources might be used
- Consistent data access API is needed
- Complex queries need centralization
- Domain-driven design is employed

## Structure
```
┌─────────────────────────────────────┐
│      Service Layer                  │
│  - Business Logic                   │
│  - Domain Services                  │
└───────────┬─────────────────────────┘
            │ Uses
    ┌───────▼──────────────────────────┐
    │     IUnitOfWork                  │
    │  - Coordinates Repositories      │
    │  - Manages Transactions          │
    │  - SaveChanges()                 │
    └───────┬──────────────────────────┘
            │ Contains
    ┌───────▼──────────┬───────────────┐
    │  IProductRepo    │  IOrderRepo   │
    │  - GetById()     │  - GetById()  │
    │  - GetAll()      │  - GetAll()   │
    │  - Add()         │  - Add()      │
    │  - Update()      │  - Update()   │
    │  - Delete()      │  - Delete()   │
    └───────┬──────────┴───────┬───────┘
            │                  │
    ┌───────▼──────────────────▼───────┐
    │      ApplicationDbContext        │
    │  - DbSet<Product>                │
    │  - DbSet<Order>                  │
    │  - SaveChangesAsync()            │
    └──────────────────────────────────┘
```

## Real-World Applications
1. **E-Commerce**: Product catalog, order management
2. **CMS**: Content repositories, media storage
3. **Enterprise Apps**: Customer data, inventory systems
4. **Microservices**: Data access abstraction per service
5. **Clean Architecture**: Infrastructure layer implementation

## Best Practices
1. Keep repositories focused on data access only
2. Use Unit of Work for transaction management
3. Implement generic repository for common operations
4. Create specialized repositories for complex queries
5. Don't expose IQueryable - return collections
6. Use async methods for all database operations
7. Implement proper disposal patterns
8. Cache repositories in Unit of Work

## Technology Stack
- Entity Framework Core 6.0+
- Microsoft.EntityFrameworkCore.InMemory (for testing)
- LINQ expressions for dynamic queries

## Key Takeaways
1. Repository abstracts EF Core implementation details
2. Improves testability with interface-based design
3. Centralizes data access logic
4. Unit of Work manages transactions across repositories
5. Generic repository reduces code duplication
6. Specialized repositories handle complex queries
7. Service layer remains independent of data access technology
8. Enables easier migration to different data sources
