# Design Patterns Quick Reference Guide

## When to Use Which Pattern

### CREATIONAL PATTERNS

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Factory Method** | Need to create objects but don't know exact type until runtime | Different shipping methods (truck, ship, plane) |
| **Abstract Factory** | Need to create families of related objects | UI components for different platforms (Windows, Mac, Linux) |
| **Builder** | Need to construct complex objects step by step | Building a pizza with many optional toppings |
| **Prototype** | Creating new objects is expensive, want to clone existing ones | Document templates, game objects |
| **Singleton** | Need exactly one instance of a class | Database connection, configuration manager |

### STRUCTURAL PATTERNS

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Adapter** | Need to make incompatible interfaces work together | Integrating third-party payment gateways |
| **Bridge** | Want to separate abstraction from implementation | Message types (short, detailed, urgent) × Channels (email, SMS, Slack) |
| **Composite** | Need to work with tree structures | File system (files and directories) |
| **Decorator** | Want to add responsibilities to objects dynamically | Coffee with various add-ons (milk, mocha, whip) |
| **Facade** | Want to simplify a complex subsystem | Home theater system with many components |
| **Flyweight** | Need to support large numbers of similar objects efficiently | Text editor with thousands of characters sharing styles |
| **Proxy** | Need to control access to an object | Image lazy loading, access control, caching |

### BEHAVIORAL PATTERNS

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Chain of Responsibility** | Multiple objects can handle request, handler unknown until runtime | Customer support escalation (L1 → L2 → L3 → Management) |
| **Command** | Need to parameterize objects with operations, support undo | Smart home automation, text editor commands |
| **Interpreter** | Need to interpret a language or expressions | Math expression evaluator, query language |
| **Iterator** | Need to traverse a collection without exposing its structure | Book collection, playlist |
| **Mediator** | Many objects communicate in complex ways | Chat room, air traffic control |
| **Memento** | Need to save/restore object state | Text editor undo/redo, game save points |
| **Observer** | One object changes, many others need to be notified | News subscription, event listeners |
| **State** | Object behavior changes based on its state | Vending machine, TCP connection states |
| **Strategy** | Multiple algorithms for same task, want to switch at runtime | Payment methods, sorting algorithms |
| **Template Method** | Define algorithm skeleton, let subclasses override steps | Data processing pipeline (read → process → save) |
| **Visitor** | Need to add operations to class hierarchy without modifying classes | Shape area calculator, file system operations |

## Pattern Selection Flowchart

### Creating Objects?
- **Single object creation** → Factory Method
- **Families of objects** → Abstract Factory
- **Complex object step-by-step** → Builder
- **Copy existing object** → Prototype
- **Exactly one instance** → Singleton

### Structuring Objects?
- **Incompatible interfaces** → Adapter
- **Two independent hierarchies** → Bridge
- **Part-whole hierarchy** → Composite
- **Add responsibilities dynamically** → Decorator
- **Simplify complex system** → Facade
- **Many similar objects (memory)** → Flyweight
- **Control access** → Proxy

### Object Behavior/Communication?
- **Chain of handlers** → Chain of Responsibility
- **Encapsulate requests** → Command
- **Interpret language** → Interpreter
- **Traverse collection** → Iterator
- **Coordinate object interactions** → Mediator
- **Save/restore state** → Memento
- **One-to-many notifications** → Observer
- **Behavior changes with state** → State
- **Interchangeable algorithms** → Strategy
- **Algorithm skeleton** → Template Method
- **Operations on object structure** → Visitor

## Common Pattern Combinations

### Singleton + Factory
Use Singleton for the factory instance that creates other objects

### Composite + Iterator
Iterate through composite tree structure

### Observer + Mediator
Mediator acts as central hub, uses Observer to notify participants

### Command + Memento
Store command state to enable undo/redo

### Decorator + Factory
Factory creates decorated objects

### Strategy + Factory
Factory selects appropriate strategy

## Anti-Patterns to Avoid

❌ **Don't use patterns just because they exist**
- Patterns add complexity
- Use them to solve actual problems

❌ **Don't force patterns where they don't fit**
- Simple problems don't need complex solutions

❌ **Don't over-engineer**
- Start simple, refactor to patterns when needed

❌ **Don't use Singleton for everything**
- Singleton can become global state (testing nightmare)
- Consider dependency injection instead

## Testing Patterns

### Easy to Test
✅ Strategy, State, Command, Factory Method

### Moderate Difficulty
⚠️ Decorator, Proxy, Adapter, Observer

### Challenging to Test
❌ Singleton (use dependency injection instead)

## Performance Considerations

### Memory Optimized
- **Flyweight**: Shares objects to reduce memory
- **Prototype**: Faster than creating from scratch for complex objects

### Performance Overhead
- **Proxy**: Additional method calls
- **Decorator**: Multiple wrapper layers
- **Chain of Responsibility**: Request may traverse entire chain

## Modern JavaScript Alternatives

Some patterns are less needed in modern JavaScript:

| Pattern | Modern Alternative |
|---------|-------------------|
| Iterator | Use built-in iterators, for...of loops |
| Singleton | ES6 modules are singletons by default |
| Observer | Use EventEmitter, Promises, async/await |
| Strategy | Pass functions directly (first-class functions) |
| Command | Pass functions/callbacks directly |

## Quick Tips

1. **Start Simple**: Don't use patterns until you need them
2. **Refactor to Patterns**: Recognize when to introduce a pattern
3. **Know the Trade-offs**: Every pattern has costs
4. **Use Modern JavaScript**: Leverage ES6+ features
5. **Test Early**: Patterns should make code more testable, not less
6. **Document Intent**: Explain WHY you used a pattern
7. **Be Pragmatic**: Sometimes simple code is better than "perfect" pattern usage

## Running Examples

```bash
# Run specific pattern
cd Javascript/Creational/Singleton
node index.js

# Test all patterns
cd Javascript
node test-all-patterns.js
```

## Further Learning

1. **Read the Gang of Four book** - Original source
2. **Refactoring Guru** - Excellent visual explanations
3. **Patterns.dev** - Modern JavaScript patterns
4. **Practice** - Implement patterns in your projects
5. **Code Review** - See how others use patterns
