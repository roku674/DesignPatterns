# Bridge Pattern

## What is the Bridge Pattern?

The Bridge pattern separates an object's abstraction from its implementation so that the two can vary independently. It uses composition over inheritance to achieve this separation, creating a "bridge" between the abstraction and implementation hierarchies.

## When to Use It

- When you want to avoid permanent binding between abstraction and implementation
- When both abstractions and implementations should be extensible through subclassing
- When changes in implementation should not impact clients
- When you want to share an implementation among multiple objects
- When you have a proliferation of classes from a coupled interface and implementation

## Implementation Details

This implementation demonstrates:
- **Implementor** (`Device`) - defines interface for implementation classes
- **Concrete Implementors** (`TV`, `Radio`) - implement the Device interface
- **Abstraction** (`RemoteControl`) - defines abstraction interface, maintains reference to Implementor
- **Refined Abstraction** (`AdvancedRemoteControl`) - extends the abstraction interface

## Real-World Example

A remote control system where:
- Remote controls (abstractions) can work with different devices
- Devices (implementations) can be controlled by different remotes
- New device types can be added without changing remotes
- New remote types can be added without changing devices

## How to Compile and Run

```bash
# Compile
javac *.java

# Run
java Main
```

## Key Benefits

1. **Decoupling** - Abstraction and implementation can vary independently
2. **Open/Closed Principle** - Open for extension without modification
3. **Single Responsibility** - Separate high-level logic from platform details
4. **Composition over Inheritance** - More flexible than class inheritance

## Common Use Cases

- GUI frameworks (abstraction: windows, implementation: OS-specific rendering)
- Database drivers (abstraction: database operations, implementation: specific database)
- Graphics rendering (abstraction: shapes, implementation: rendering APIs)
- Message sending (abstraction: message, implementation: delivery channel)
