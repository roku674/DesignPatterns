# Prototype Pattern

## What is the Prototype Pattern?

The Prototype pattern creates new objects by copying existing objects (prototypes) rather than creating new instances from scratch. It's useful when object creation is expensive or when you want to create objects that are similar to existing ones.

## When to Use It

- When object creation is expensive (requires database access, file I/O, network calls)
- When you want to avoid subclasses of an object creator (like in Factory Method)
- When instances of a class can have only a few different combinations of state
- When you want to create objects dynamically at runtime
- When you need to create many objects that share most of their state
- When you want to keep the number of classes in a system to a minimum

## Implementation Details

This implementation demonstrates:
- **Prototype Interface** (`Document`) - declares the cloning method
- **Concrete Prototypes** (`ReportDocument`, `ProposalDocument`) - implement cloning
- **Prototype Registry** (`DocumentRegistry`) - manages and provides access to prototypes
- **Deep Cloning** - ensures complete independence of cloned objects
- **Template Pattern** - prototypes serve as templates for new objects

## Real-World Example

The example demonstrates a document management system where:
- Pre-configured document templates are stored in a registry
- New documents are created by cloning templates
- Each clone can be customized independently
- Prototypes include reports and proposals with different structures
- Creation is faster than building documents from scratch

## How to Compile and Run

```bash
# Compile
javac *.java

# Run
java Main
```

## Expected Output

```
=== Prototype Pattern Demo ===

--- Creating Prototype Templates ---

Templates registered in the registry.

--- Creating Documents from Templates ---

Creating January Report:

=== REPORT DOCUMENT ===
Title: January 2024 Sales Report
Author: System Generated
Department: Sales
Report Type: Monthly
Content: Sales data for January 2024: Revenue increased by 15%
Tags: [monthly, sales, report]
=======================

Creating February Report:

=== REPORT DOCUMENT ===
Title: February 2024 Sales Report
Author: System Generated
Department: Sales
Report Type: Monthly
Content: Sales data for February 2024: Revenue increased by 12%
Tags: [monthly, sales, report, Q1]
=======================

[... additional documents ...]

--- Demonstrating Prototype Independence ---

Original monthly report template:

=== REPORT DOCUMENT ===
Title: Monthly Report Template
[...]

Notice: Changes to the clone don't affect the original template!
```

## Key Benefits

1. **Performance** - Faster than creating objects from scratch
2. **Reduced Subclassing** - Avoids factory hierarchies
3. **Dynamic Object Creation** - Add and remove prototypes at runtime
4. **Simplified Object Creation** - Client doesn't need to know about concrete classes
5. **Flexibility** - Easy to create variations of objects
6. **Encapsulation** - Hides complex initialization logic

## Deep vs Shallow Cloning

### Shallow Clone
- Copies primitive values
- Copies references to objects (not the objects themselves)
- Changes to referenced objects affect both original and clone

### Deep Clone (Used in this implementation)
- Copies primitive values
- Creates new copies of referenced objects
- Clone is completely independent of the original

```java
// Deep copy example from implementation
cloned.tags = new ArrayList<>(this.tags); // Creates new list
```

## Pattern Structure

```
Prototype (interface/abstract class)
    └── clone() method
         ↑
         |
Concrete Prototype A        Concrete Prototype B
    └── clone()                 └── clone()
         |                           |
    Creates copy of A          Creates copy of B

Prototype Registry (optional)
    └── Stores and manages prototypes
```

## Comparison with Other Patterns

- **Prototype vs Factory Method**: Prototype clones objects; Factory creates new instances
- **Prototype vs Builder**: Prototype copies existing objects; Builder constructs step-by-step
- **Prototype vs Abstract Factory**: Can be used together - factory can store and return prototypes
- **Prototype vs Singleton**: Opposite approaches - Singleton ensures one instance, Prototype creates many copies

## Common Use Cases

- Game development (cloning game objects, enemies, items)
- Document management systems (templates)
- UI component libraries (widget templates)
- Database record copying
- Configuration management (copying configurations)
- Undo/Redo functionality
- Object pooling

## Implementation Considerations

### Java-Specific
- Implements `Cloneable` interface
- Override `Object.clone()` method
- Be careful with `CloneNotSupportedException`
- Consider using copy constructors as an alternative

### Best Practices
1. Always implement deep cloning for mutable objects
2. Document whether your clone is deep or shallow
3. Consider using a copy constructor instead of clone()
4. Be careful with final fields (can't be reassigned in clone)
5. Handle exceptions properly

## Advanced Features

### Prototype Registry
The registry pattern (demonstrated in `DocumentRegistry`) provides:
- Centralized management of prototypes
- Runtime registration/removal of prototypes
- Named access to prototypes
- Caching of pre-configured objects

### Copy Constructor Alternative
Instead of clone(), you can use copy constructors:
```java
public ReportDocument(ReportDocument original) {
    this.title = original.title;
    this.tags = new ArrayList<>(original.tags);
    // ... copy other fields
}
```

## Common Pitfalls

1. **Shallow cloning when deep is needed** - Causes shared state bugs
2. **Not handling circular references** - Can cause infinite loops
3. **Forgetting to clone collections** - Lists, maps, etc. need deep copies
4. **Not overriding clone() properly** - Always call super.clone() first in classic approach
5. **Cloning objects with system resources** - File handles, database connections, etc.

## Testing Prototype Pattern

Key things to test:
- Clones are independent (changes don't affect each other)
- Deep cloning works correctly for nested objects
- Registry correctly stores and retrieves prototypes
- Cloned objects are fully functional
- Performance improvements vs creating from scratch
