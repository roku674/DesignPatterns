# Identity Map Pattern

## Overview
The Identity Map pattern ensures that each object gets loaded only once by keeping every loaded object in a map. It looks up objects using the map when referring to them, preventing duplicate instances and ensuring object identity consistency.

## Purpose
- **Prevent duplicate loading**: Ensures each entity is loaded from the database exactly once
- **Maintain object identity**: Guarantees the same entity always returns the same object reference
- **Performance optimization**: Reduces database queries by caching loaded entities
- **Consistency**: Prevents conflicting updates to different instances of the same entity

## Implementation Details

### Key Components

1. **IIdentityMap<T> Interface**
   - Generic interface for managing entity caching
   - Methods: Add, Get, Contains, Remove, Clear, GetAll
   - Thread-safe operations

2. **IdentityMapImplementation<T>**
   - Basic implementation using Dictionary<Guid, T>
   - Thread-safe using lock synchronization
   - Provides cache hit/miss logging

3. **ExpiringIdentityMap<T>**
   - Advanced implementation with time-based expiration
   - Automatically cleans expired entries
   - Configurable expiration duration

4. **Repository Integration**
   - Repositories check Identity Map before database access
   - Loads from database only on cache miss
   - Adds newly loaded entities to the map

## Usage Examples

### Basic Identity Map
```csharp
IIdentityMap<Product> identityMap = new IdentityMapImplementation<Product>();
ProductRepository repository = new ProductRepository(identityMap, dataStore);

// First request loads from database
Product product1 = repository.FindById(productId);

// Second request returns cached instance (same object reference)
Product product2 = repository.FindById(productId);

Console.WriteLine(ReferenceEquals(product1, product2)); // True
```

### Expiring Cache
```csharp
// Create identity map with 5-minute expiration
IIdentityMap<Customer> expiringMap = new ExpiringIdentityMap<Customer>(TimeSpan.FromMinutes(5));
CustomerRepository repository = new CustomerRepository(expiringMap, dataStore);

// Entities automatically expire after 5 minutes
Customer customer = repository.FindById(customerId);
```

### Performance Optimization
```csharp
// Without Identity Map: 100ms+ per database query
// With Identity Map: <1ms for cached entities

for (int i = 0; i < 1000; i++)
{
    Product product = repository.FindById(productId); // Only first call hits database
}
```

### Thread-Safe Concurrent Access
```csharp
IIdentityMap<Product> identityMap = new IdentityMapImplementation<Product>();

// Multiple threads can safely access the same identity map
Parallel.For(0, 100, i =>
{
    Product product = repository.FindById(productId);
    // All threads get the same object instance
});
```

## Scenarios Demonstrated

1. **Basic Identity Map**: Loading and caching entities
2. **Performance Comparison**: Database vs. cache access times
3. **Object Identity Guarantee**: Same ID always returns same object reference
4. **Expiring Cache**: Automatic cache expiration after timeout
5. **Concurrent Access**: Thread-safe access from multiple threads

## Benefits

- **Performance**: Dramatically reduces database queries
- **Consistency**: Same entity always returns same object
- **Memory Efficiency**: Controls object lifetime and prevents duplicates
- **Thread Safety**: Built-in synchronization for concurrent access
- **Flexibility**: Support for both permanent and expiring caches

## When to Use

- In ORM implementations (Entity Framework, NHibernate use this pattern)
- When the same entity is accessed multiple times in a request
- When maintaining object identity is critical
- In systems with read-heavy workloads
- When implementing Unit of Work pattern

## When NOT to Use

- In stateless, distributed systems where object identity isn't important
- When memory constraints are tight and caching isn't feasible
- In systems where entities change frequently and cache invalidation is complex
- When each request needs the latest data from the database

## Related Patterns

- **Unit of Work**: Often combined to track entity changes
- **Repository**: Provides the data access layer that uses Identity Map
- **Data Mapper**: Separates domain objects from database
- **Lazy Load**: Can be combined to delay loading until needed

## Build and Run

```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Enterprise/ObjectRelational/IdentityMap
dotnet build
dotnet run
```

## References
- Martin Fowler's Patterns of Enterprise Application Architecture
- Entity Framework Core's DbContext uses this pattern internally
