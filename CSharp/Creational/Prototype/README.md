# Prototype Pattern

## Intent
Prototype is a creational design pattern that lets you copy existing objects without making your code dependent on their classes. The pattern delegates the cloning process to the actual objects that are being cloned.

## What It Does
- Specifies the kinds of objects to create using a prototypical instance
- Creates new objects by copying this prototype
- Hides the complexities of making new instances from the client
- Allows adding and removing objects at runtime
- Reduces the need for creating subclasses

## When to Use It
- When the classes to instantiate are specified at runtime
- When you want to avoid building a class hierarchy of factories that parallels the class hierarchy of products
- When instances of a class can have only a few different combinations of state
- When object creation is expensive (database calls, network requests, complex initialization)
- When you need to create objects that are similar to existing objects

## Real-World Example
This implementation demonstrates **two practical scenarios**:

### 1. Person Cloning
Creating new person records based on templates (e.g., employee templates with company address):
- Deep cloning of nested objects (Address)
- Proper handling of collections (PhoneNumbers list)
- Each clone is independent - modifications don't affect the original

### 2. Document Cloning
Creating new documents from templates (e.g., project proposals, reports):
- Template documents serve as prototypes
- Clone and customize for specific projects
- Maintains metadata and tags independently

### 3. Prototype Registry
Central repository for managing common prototypes:
- Register frequently used templates (Employee, Customer, etc.)
- Create new instances by key
- Easy management of prototype catalog

## Structure
```
IPrototype<T> (Prototype Interface)
    └── Clone() method

Person : IPrototype<Person>
    ├── Has nested Address object
    └── Deep clones all fields

Document : IPrototype<Document>
    ├── Has collections (Tags, Metadata)
    └── Deep clones all collections

PrototypeRegistry<T>
    ├── Stores prototype instances
    └── Creates clones on demand
```

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Creational/Prototype
dotnet run
```

## Key Concepts Demonstrated

### 1. Deep vs Shallow Cloning
**Shallow Clone** (wrong way):
```csharp
// Shallow copy - Address reference is shared
Person clone = this;  // Both objects share same Address instance
```

**Deep Clone** (correct way):
```csharp
// Deep copy - Address is cloned too
Address = source.Address.Clone();  // Independent Address object
```

### 2. Copy Constructor Pattern
```csharp
private Person(Person source)
{
    // Copy all fields
    FirstName = source.FirstName;
    // Deep copy nested objects
    Address = source.Address.Clone();
    // Deep copy collections
    PhoneNumbers = new List<string>(source.PhoneNumbers);
}
```

### 3. Prototype Registry Pattern
```csharp
registry.Register("Employee", employeeTemplate);
Person newEmployee = registry.Create("Employee");
```

## Key Benefits
- **Reduced initialization cost**: Cloning can be faster than creating from scratch
- **Reduced subclassing**: No need for Creator hierarchy
- **Dynamic configuration**: Add/remove prototypes at runtime
- **Simplified object creation**: Hide complex initialization logic
- **Preserve object state**: Clone configured objects instead of reconfiguring

## Common Use Cases
- **UI Component Libraries**: Clone pre-configured widgets
- **Game Development**: Clone enemy/item templates
- **Configuration Management**: Clone configuration objects
- **Document Templates**: Word processors, spreadsheets
- **Database Records**: Clone similar records with modifications

## Prototype vs Other Patterns

### Prototype vs Factory Method
- **Prototype**: Clones existing objects
- **Factory Method**: Creates new objects from scratch

### Prototype vs Abstract Factory
- **Prototype**: Stores pre-configured instances
- **Abstract Factory**: Creates families of related objects

## Important Considerations

### 1. Deep Cloning Complexity
Must properly handle:
- Nested objects (Address)
- Collections (Lists, Dictionaries)
- Circular references
- Immutable vs mutable objects

### 2. C# IClonable Interface
This implementation uses custom `IPrototype<T>` instead of `ICloneable` because:
- `ICloneable.Clone()` returns `object` (not type-safe)
- Doesn't specify deep vs shallow clone
- Modern C# prefers generic interfaces

### 3. Alternative: Record Types (C# 9+)
For simple objects, C# records provide built-in cloning:
```csharp
public record Person(string Name, int Age);
Person clone = original with { Age = 30 };
```

## Related Patterns
- **Abstract Factory**: Can use Prototype instead of defining factory methods
- **Composite**: Often benefit from Prototype for copying tree structures
- **Decorator**: Often used together with Prototype
