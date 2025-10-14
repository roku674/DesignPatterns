# Unit of Work Pattern

## Overview
The Unit of Work pattern maintains a list of objects affected by a business transaction and coordinates the writing out of changes. It tracks all changes made during a business transaction and commits them as a single atomic operation.

## Purpose
- **Maintain transaction boundaries**: Ensures all database operations succeed or fail together
- **Track changes**: Keeps track of new, modified, and deleted entities
- **Optimize database calls**: Batches multiple operations into a single transaction
- **Ensure consistency**: Guarantees data integrity across multiple repository operations

## Implementation Details

### Key Components

1. **IUnitOfWork Interface**
   - Provides repositories for different entity types
   - Methods to register new, dirty (modified), and deleted entities
   - Commit/Rollback methods for transaction control

2. **UnitOfWorkImplementation**
   - Tracks entity changes in separate collections
   - Performs batch operations on commit
   - Handles transaction rollback
   - Implements IDisposable for resource cleanup

3. **Repository Pattern Integration**
   - Works with IRepository<T> for entity operations
   - Coordinates multiple repositories in a single transaction

4. **Entity Tracking**
   - New entities: Will be inserted on commit
   - Dirty entities: Will be updated on commit
   - Deleted entities: Will be removed on commit

## Usage Examples

### Basic Transaction
```csharp
using (IUnitOfWork uow = new UnitOfWorkImplementation(customerRepo, orderRepo, itemRepo))
{
    Customer customer = new Customer("John Doe", "john@example.com");
    uow.RegisterNew(customer);

    Order order = new Order(customer.Id) { TotalAmount = 299.99m };
    uow.RegisterNew(order);

    await uow.CommitAsync();
}
```

### Complex Multi-Entity Transaction
```csharp
using (IUnitOfWork uow = new UnitOfWorkImplementation(customerRepo, orderRepo, itemRepo))
{
    Customer customer = new Customer("Alice Smith", "alice@example.com");
    uow.RegisterNew(customer);

    Order order = new Order(customer.Id);
    uow.RegisterNew(order);

    OrderItem item1 = new OrderItem(order.Id, "Laptop", 1, 1299.99m);
    OrderItem item2 = new OrderItem(order.Id, "Mouse", 2, 29.99m);

    uow.RegisterNew(item1);
    uow.RegisterNew(item2);

    order.TotalAmount = item1.Price + (item2.Price * item2.Quantity);

    await uow.CommitAsync();
}
```

### Update Existing Entities
```csharp
using (IUnitOfWork uow = new UnitOfWorkImplementation(customerRepo, orderRepo, itemRepo))
{
    customer.Email = "newemail@example.com";
    uow.RegisterDirty(customer);

    order.Status = OrderStatus.Shipped;
    uow.RegisterDirty(order);

    uow.Commit();
}
```

### Transaction Rollback
```csharp
using (IUnitOfWork uow = new UnitOfWorkImplementation(customerRepo, orderRepo, itemRepo))
{
    try
    {
        // Register changes
        uow.RegisterNew(customer);
        uow.RegisterNew(order);

        // Something goes wrong
        if (error)
        {
            uow.Rollback();
        }
        else
        {
            uow.Commit();
        }
    }
    catch
    {
        uow.Rollback();
        throw;
    }
}
```

## Scenarios Demonstrated

1. **Simple Transaction**: Creating a customer and order together
2. **Complex Multi-Entity Transaction**: Creating customer with multiple order items
3. **Transaction Rollback**: Rolling back changes when errors occur
4. **Updating Entities**: Modifying existing entities and committing changes
5. **Deleting Entities**: Removing entities from the database
6. **Dispose Without Commit**: Shows warning when disposing without committing

## Benefits

- **Atomicity**: All changes succeed or fail together
- **Performance**: Batches database operations
- **Consistency**: Maintains data integrity
- **Separation of Concerns**: Business logic separate from persistence
- **Testability**: Easy to mock and test

## When to Use

- When you need transactional consistency across multiple entities
- When coordinating changes across multiple repositories
- In complex business operations involving multiple database tables
- When you need to optimize database round trips

## Related Patterns

- **Repository**: Often used together for data access
- **Identity Map**: Ensures loaded objects are tracked
- **Data Mapper**: Separates domain objects from persistence
- **Domain Model**: Business logic separate from data access

## Build and Run

```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Enterprise/ObjectRelational/UnitOfWork
dotnet build
dotnet run
```

## References
- Martin Fowler's Patterns of Enterprise Application Architecture
- Design Patterns: Elements of Reusable Object-Oriented Software
