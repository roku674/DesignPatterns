# Builder Pattern

## What is the Builder Pattern?

The Builder pattern separates the construction of a complex object from its representation, allowing the same construction process to create different representations. It's especially useful when an object has many optional parameters or when the construction process is complex.

## When to Use It

- When creating an object requires many steps or parameters
- When you want to create different representations of an object using the same construction code
- When you have many optional parameters (avoids telescoping constructors)
- When you want to construct complex objects step by step
- When the construction algorithm should be independent of the parts that make up the object
- When you want immutable objects with many fields

## Implementation Details

This implementation demonstrates:
- **Product** (`Computer`) - the complex object being built
- **Builder** (`ComputerBuilder`) - provides methods to configure the product
- **Fluent Interface** - method chaining for readable construction
- **Immutability** - final fields ensure the built object can't be modified
- **Required vs Optional** - constructor for required fields, methods for optional

## Real-World Example

The example demonstrates building computers with various configurations:
- Office computers with basic specs
- Gaming computers with high-end components
- Workstations for video editing
- Development machines
- Budget builds

Each computer can have different combinations of components, and the builder makes it easy to create these variations without complicated constructors.

## How to Compile and Run

```bash
# Compile
javac Computer.java Main.java

# Run
java Main
```

## Expected Output

```
=== Builder Pattern Demo ===

--- Building Office Computer ---

=== Computer Specifications ===
CPU: Intel i5
RAM: 8GB
Storage: 512GB SSD
GPU: Integrated Graphics
Motherboard: Standard
Power Supply: Standard
Cooling: Stock Cooler
WiFi: Enabled
Bluetooth: Disabled
==============================

--- Building Gaming Computer ---

=== Computer Specifications ===
CPU: AMD Ryzen 9 5900X
RAM: 32GB DDR4
Storage: 2TB NVMe SSD
GPU: NVIDIA RTX 4080
Motherboard: ASUS ROG Strix X570-E
Power Supply: 850W 80+ Gold
Cooling: Liquid Cooling AIO 360mm
WiFi: Enabled
Bluetooth: Enabled
==============================

[... additional computer configurations ...]
```

## Key Benefits

1. **Avoids Telescoping Constructors** - No need for multiple constructor overloads
2. **Fluent Interface** - Readable and intuitive object construction
3. **Immutability** - Built objects are immutable (final fields)
4. **Flexibility** - Easy to add new optional parameters without breaking existing code
5. **Single Responsibility** - Construction logic separated from business logic
6. **Step-by-Step Construction** - Can build objects incrementally

## Pattern Variations

### 1. Classic Builder (Gang of Four)
Separate Director class that controls the building process.

### 2. Fluent Builder (Modern Java)
This implementation - builder returns itself for method chaining.

### 3. Lombok @Builder
Java library that generates builder code automatically.

## Comparison with Other Patterns

- **Builder vs Constructor**: Builder is better for objects with many optional parameters
- **Builder vs Factory Method**: Builder focuses on step-by-step construction; Factory Method on creating objects of different types
- **Builder vs Abstract Factory**: Builder constructs complex objects step-by-step; Abstract Factory creates families of related objects
- **Builder vs Prototype**: Builder provides more control over construction; Prototype copies existing objects

## Common Use Cases

- Building HTTP requests/responses (URL builders)
- Creating database queries (SQL query builders)
- Constructing complex documents (HTML, XML builders)
- Configuring test objects (test data builders)
- Creating immutable objects with many fields
- Building UI components with many options
- Creating configuration objects

## Advanced Considerations

- Consider adding validation in the `build()` method
- Can implement Director class for common configurations
- Can be combined with Factory pattern to select appropriate builders
- Consider using @Builder annotation from Lombok for less boilerplate
- For nested builders, consider recursive generic types

## Code Smell It Prevents

**Telescoping Constructor Anti-Pattern:**
```java
// BAD - Telescoping constructors
public Computer(String cpu, String ram) { ... }
public Computer(String cpu, String ram, String storage) { ... }
public Computer(String cpu, String ram, String storage, String gpu) { ... }
public Computer(String cpu, String ram, String storage, String gpu, String mb) { ... }
// ... many more constructors

// GOOD - Builder pattern
Computer computer = new Computer.ComputerBuilder("CPU", "RAM")
    .storage("1TB")
    .gpu("RTX 4080")
    .build();
```
