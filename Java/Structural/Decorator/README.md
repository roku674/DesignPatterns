# Decorator Pattern

## What is the Decorator Pattern?

The Decorator pattern attaches additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.

## When to Use It

- To add responsibilities to individual objects dynamically and transparently
- For responsibilities that can be withdrawn
- When extension by subclassing is impractical
- To avoid an explosion of subclasses

## Implementation Details

- **Component** (`Coffee`) - defines interface for objects
- **Concrete Component** (`SimpleCoffee`) - object to which additional responsibilities can be attached
- **Decorator** (`CoffeeDecorator`) - maintains reference to Component
- **Concrete Decorators** - add responsibilities to the component

## How to Compile and Run

```bash
javac *.java
java Main
```

## Key Benefits

- More flexibility than static inheritance
- Avoids feature-laden classes high up in hierarchy
- Can add/remove responsibilities at runtime
