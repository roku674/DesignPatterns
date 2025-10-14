# Data Mapper Pattern

## Overview
The Data Mapper pattern is a layer of software that moves data between objects and a database while keeping them independent of each other. The domain objects don't know about the database, and the database schema doesn't reflect the domain object structure.

## Purpose
- **Complete separation**: Domain objects have no knowledge of persistence
- **Independent evolution**: Database schema and domain model can change independently
- **Clean architecture**: Business logic stays separate from data access logic
- **Testability**: Domain objects can be tested without database dependency
- **Flexibility**: Easy to change persistence strategies without affecting domain

## Implementation Details

### Key Components

1. **Domain Objects**
   - Pure business logic with no database knowledge
   - Rich behavior (GetAge(), GetFullName(), etc.)
   - No persistence attributes or annotations
   - Can have computed properties

2. **Data Mapper Interface**
   - Generic IDataMapper<T> interface
   - Standard CRUD operations: Find, FindAll, Insert, Update, Delete
   - Translates between database and domain representations

3. **Mapper Implementations**
   - PersonDataMapper: Maps Person domain objects
   - ProductDataMapper: Maps Product domain objects
   - Each mapper knows database schema for its entity type
   - Handles field name translation

4. **Database Layer**
   - Completely separate from domain
   - Uses different naming conventions (snake_case vs PascalCase)
   - Mapper handles all translation

## Usage Examples

### Basic Find Operation
```csharp
PersonDataMapper mapper = new PersonDataMapper(database);

// Find by ID - mapper handles all translation
Person person = mapper.Find(personId);
Console.WriteLine(person.GetFullName()); // Domain method
Console.WriteLine(person.HomeAddress);   // Nested object
```

### Insert New Entity
```csharp
// Create domain object with no database knowledge
Person newPerson = new Person(
    Guid.NewGuid(),
    "Alice",
    "Williams",
    new DateTime(1995, 7, 20),
    "alice.williams@example.com"
);
newPerson.HomeAddress = new Address("321 Elm St", "Seattle", "WA", "98101", "USA");

// Mapper handles conversion to database format
mapper.Insert(newPerson);
```

### Update Existing Entity
```csharp
// Load from database
Person person = mapper.Find(personId);

// Modify domain object
person.EmailAddress = "newemail@example.com";
person.HomeAddress = new Address("999 New St", "Denver", "CO", "80201", "USA");

// Save changes - mapper handles update
mapper.Update(person);
```

### Find All Entities
```csharp
List<Person> persons = mapper.FindAll();

foreach (Person person in persons)
{
    // Use rich domain behavior
    Console.WriteLine($"{person.GetFullName()} is {person.GetAge()} years old");
    Console.WriteLine($"Lives at: {person.HomeAddress}");
}
```

## Key Benefits

### Complete Independence
```csharp
// Domain object has NO database knowledge
public class Person
{
    public Guid Id { get; private set; }
    public string FirstName { get; set; }
    // No [Table], [Column], or other persistence attributes!

    public int GetAge()
    {
        // Pure business logic
        return DateTime.Today.Year - DateOfBirth.Year;
    }
}
```

### Different Naming Conventions
```csharp
// Database uses snake_case:
// person_id, first_name, birth_date, address_street

// Domain uses PascalCase:
// Id, FirstName, DateOfBirth, HomeAddress.Street

// Mapper handles all translation!
```

## Scenarios Demonstrated

1. **Basic CRUD Operations**: Find, Insert, Update, Delete
2. **Finding All Entities**: Bulk loading with mapping
3. **Domain Logic Independence**: Rich behavior separate from persistence
4. **Multiple Mappers**: Different entities with different schemas
5. **Update Operations**: Modifying and persisting changes

## Benefits

- **Clean Separation**: Domain logic completely independent of database
- **Testability**: Test domain objects without database
- **Flexibility**: Change database schema without changing domain
- **Rich Domain Model**: Objects can have methods and computed properties
- **Multiple Databases**: Easy to support different database backends

## When to Use

- When you want a rich domain model with business logic
- When database schema and object model differ significantly
- In complex business applications with evolving requirements
- When you need complete independence between layers
- In systems requiring multiple data sources

## When NOT to Use

- In simple CRUD applications with no business logic
- When database schema perfectly matches object structure
- In systems with very tight performance requirements (mapping has overhead)
- When Active Record pattern is simpler and sufficient

## Comparison with Active Record

### Data Mapper (This Pattern)
- Domain objects have no database knowledge
- Separate mapper handles persistence
- More flexibility, better for complex domains
- Used by: Entity Framework Core with DbContext

### Active Record
- Domain objects know how to save themselves
- persistence methods on domain objects
- Simpler for basic CRUD
- Used by: Rails ActiveRecord, Laravel Eloquent

## Related Patterns

- **Repository**: Higher-level abstraction over Data Mapper
- **Unit of Work**: Tracks changes and coordinates commits
- **Identity Map**: Ensures object identity consistency
- **Lazy Load**: Delays loading until needed

## Build and Run

```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Enterprise/DataSource/DataMapper
dotnet build
dotnet run
```

## References
- Martin Fowler's Patterns of Enterprise Application Architecture
- Entity Framework Core uses Data Mapper approach
- Dapper can be used to implement Data Mapper pattern
