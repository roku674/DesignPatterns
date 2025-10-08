# Facade Pattern

## Intent
The Facade pattern provides a unified interface to a set of interfaces in a subsystem. It defines a higher-level interface that makes the subsystem easier to use by wrapping a complex system with a simpler API.

## Problem
Working directly with complex subsystems (libraries, frameworks, sets of classes) can be challenging:
- Many classes with different interfaces
- Complex initialization sequences
- Tight coupling between client code and subsystem
- Difficult to understand and use correctly
- Subsystem changes ripple through client code

## Solution
Create a Facade class that provides simple methods to handle common tasks. The Facade delegates calls to the subsystem objects. Clients interact with the Facade instead of the subsystem directly.

## Real-World Analogy
Imagine ordering food at a restaurant:

**Without Facade**: You'd have to:
- Go to the kitchen and tell the chef what to cook
- Manage the oven temperature
- Coordinate with multiple cooks
- Plate the food yourself
- Clean the kitchen

**With Facade (Waiter)**: You:
- Tell the waiter what you want
- Waiter coordinates everything
- Food arrives ready to eat

The waiter is a facade that simplifies the complex restaurant subsystem.

Similarly, starting a home theater:

**Without Facade**: 12+ steps to control amplifier, DVD player, projector, screen, lights, etc.

**With Facade**: `homeTheater.watchMovie("The Matrix")`

## Structure
- **Facade (HomeTheaterFacade)**: Provides simple methods, delegates to subsystem
- **Subsystem Classes (Amplifier, DVDPlayer, Projector, etc.)**: Implement subsystem functionality, handle work assigned by facade
- **Client**: Uses facade instead of subsystem classes directly

## Example Use Case
This implementation demonstrates a home theater system where:
- Multiple components: Amplifier, DVD player, projector, screen, lights, popcorn maker, streaming player
- Complex sequences to watch a movie or stream content
- Facade simplifies operations to single method calls
- Encapsulates the complexity of coordinating multiple devices

## When to Use
- You want to provide a simple interface to a complex subsystem
- There are many dependencies between clients and implementation classes
- You want to layer your subsystems
- You need to decouple subsystem from clients and other subsystems
- You want to wrap a poorly designed API with a better one

## Benefits
1. **Simplicity**: Simple interface to complex subsystem
2. **Decoupling**: Isolates clients from subsystem components
3. **Layering**: Can use facade to define entry points to subsystem layers
4. **Easier to use**: Fewer objects to deal with, simpler API
5. **Easier to test**: Can mock the facade instead of many classes
6. **Promotes weak coupling**: Changes to subsystem don't affect clients

## Trade-offs
- Facade can become a god object coupled to all subsystem classes
- Doesn't prevent clients from using subsystem classes directly if needed
- May need multiple facades for complex systems

## Facade vs Related Patterns

### Facade vs Adapter
- **Facade**: Simplifies interface to subsystem (many classes)
- **Adapter**: Makes one interface compatible with another

### Facade vs Mediator
- **Facade**: Unidirectional (client → facade → subsystem)
- **Mediator**: Multidirectional (colleagues communicate through mediator)

### Facade vs Proxy
- **Facade**: Simplifies and provides alternative interface
- **Proxy**: Same interface, controls access

## Design Considerations

### Multiple Facades
Large systems may have multiple facades for different purposes:
- `MovieTheaterFacade` - For watching movies
- `MusicTheaterFacade` - For listening to music
- `GamingTheaterFacade` - For playing games

### Subsystem Access
Decide whether clients can access subsystem classes directly:
- **Yes**: More flexibility for advanced users
- **No**: Stronger encapsulation

Our implementation allows both.

### Facade Responsibilities
Keep facade focused:
- Don't put business logic in facade
- Facade should coordinate, not implement
- Delegate to subsystem classes

## Related Patterns
- **Abstract Factory**: Can be used with Facade to create subsystem objects
- **Mediator**: Similar structure, different purpose (coordination vs simplification)
- **Singleton**: Facade objects are often Singletons

## How to Run
```bash
node index.js
```

## Output
The demo shows:
1. Complexity of using subsystem directly (without facade)
2. Simplicity of using facade
3. Watching movies with one method call
4. Streaming content easily
5. Music mode
6. Multiple sessions (movie marathon)
7. Benefits comparison
8. Custom component configuration
