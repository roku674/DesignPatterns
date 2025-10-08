# Builder Pattern

## Intent
Builder is a creational design pattern that lets you construct complex objects step by step. The pattern allows you to produce different types and representations of an object using the same construction code.

## What It Does
- Separates the construction of a complex object from its representation
- Allows the same construction process to create various representations
- Provides control over the construction process
- Isolates code for construction and representation
- Gives finer control over the construction process

## When to Use It
- When you need to create complex objects with numerous optional parameters or configuration options
- When the algorithm for creating a complex object should be independent of the parts that make up the object and how they're assembled
- When the construction process must allow different representations for the object being constructed
- When you want to avoid "telescoping constructor" anti-pattern (constructors with many parameters)

## Real-World Example
This implementation demonstrates a **computer configuration system** where different types of computers need to be built with various components:

- **GamingComputerBuilder**: Builds high-performance gaming computers
- **OfficeComputerBuilder**: Builds productivity-focused office computers
- **ComputerDirector**: Provides predefined configurations (High-End Gaming, Budget Gaming, Office)

The pattern allows building computers with various combinations of:
- CPU, RAM, Storage, GPU, Motherboard
- Power Supply, Cooling System
- Optional features: WiFi, Bluetooth

## Structure
```
Computer (Product)
    └── Complex object with multiple components

IComputerBuilder (Builder Interface)
    ├── GamingComputerBuilder
    └── OfficeComputerBuilder

ComputerDirector (Director - Optional)
    └── Defines common construction sequences
```

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Creational/Builder
dotnet run
```

## Key Features Demonstrated

### 1. Fluent Interface
The builder uses method chaining for readable code:
```csharp
Computer pc = builder
    .SetCPU("Intel i9")
    .SetRAM("64GB")
    .SetGPU("RTX 4090")
    .Build();
```

### 2. Director Pattern
Encapsulates common construction sequences:
```csharp
director.ConstructHighEndGamingPC(builder);
director.ConstructOfficePC(builder);
```

### 3. Flexible Construction
Client can build objects with or without the director:
```csharp
// With Director
Computer pc1 = director.ConstructGamingPC(builder);

// Without Director (custom configuration)
Computer pc2 = builder
    .SetCPU("AMD Ryzen")
    .SetRAM("32GB")
    .Build();
```

## Key Benefits
- **Complex object construction**: Breaks down the construction of complex objects into simple steps
- **Reusability**: The same construction code can produce different representations
- **Single Responsibility Principle**: Isolates complex construction code from business logic
- **Readability**: Fluent interface makes code easy to read and understand
- **Flexibility**: Allows creating objects with different configurations without constructor pollution

## Common Use Cases
- Building complex UI components
- Constructing documents (PDF, HTML) with various formats
- Creating database queries with multiple optional clauses
- Configuring network requests with many parameters
- Assembling game characters with different equipment/attributes

## Builder vs Constructor
**Without Builder (Telescoping Constructor Anti-pattern):**
```csharp
Computer pc = new Computer("Intel i9", "64GB", "2TB SSD",
    "RTX 4090", "ASUS ROG", "1000W", "Liquid", true, true);
// Hard to read, easy to make mistakes with parameter order
```

**With Builder:**
```csharp
Computer pc = builder
    .SetCPU("Intel i9")
    .SetRAM("64GB")
    .SetStorage("2TB SSD")
    .SetGPU("RTX 4090")
    // ... clear and readable
    .Build();
```

## Related Patterns
- **Abstract Factory**: Similar goal but focuses on families of products
- **Composite**: Builder often builds Composite trees
- **Prototype**: Can be used with Builder to clone construction steps
