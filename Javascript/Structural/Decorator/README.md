# Decorator Pattern

## Intent
The Decorator pattern lets you attach new behaviors to objects by placing these objects inside special wrapper objects that contain the behaviors. It provides a flexible alternative to subclassing for extending functionality.

## Also Known As
Wrapper

## Problem
You need to add responsibilities to objects dynamically and transparently without affecting other objects. Using inheritance to add all possible combinations of features would result in an explosion of subclasses.

Example: A coffee shop with 4 beverage types and 7 add-ons would need potentially 4 × 2^7 = 512 classes to represent all combinations!

## Solution
Create decorator classes that wrap the original object and add new behavior while keeping the class signature intact. Decorators can be stacked, with each decorator adding its functionality to the wrapped object.

## Real-World Analogy
Think about getting dressed:
- You start with base clothing (t-shirt, pants)
- You can add layers: sweater, jacket, scarf, hat
- Each layer wraps the previous one and adds functionality (warmth)
- You can add/remove layers as needed
- The order can matter (you don't put a t-shirt over a jacket)

Similarly, in coffee:
- Base: Espresso
- Add decorations: +Milk, +Mocha, +Whip, +Caramel
- Each addition wraps the previous beverage and adds to the cost
- You can stack decorators: Espresso + Mocha + Mocha + Whip

## Structure
- **Component (Beverage)**: Interface for objects that can have responsibilities added
- **Concrete Component (Espresso, HouseBlend)**: Objects to which additional responsibilities can be attached
- **Decorator (BeverageDecorator)**: Maintains reference to a Component and conforms to Component interface
- **Concrete Decorators (Milk, Mocha, Whip)**: Add responsibilities to the component

## Example Use Case
This implementation demonstrates a coffee shop where:
- Base beverages (Espresso, House Blend, Dark Roast, Decaf)
- Add-ons as decorators (Milk, Mocha, Whip, Soy, Syrups, Extra Shot)
- Each decorator wraps the beverage and adds to description and cost
- Decorators can be stacked in any combination
- New add-ons can be added without modifying existing code

## When to Use
- You want to add responsibilities to individual objects dynamically and transparently
- Responsibilities can be withdrawn
- Extension by subclassing is impractical (would lead to too many subclasses)
- You need to add features to objects without affecting other objects of the same class

## Benefits
1. **More flexible than inheritance**: Add/remove responsibilities at runtime
2. **Avoids feature-laden classes high up in the hierarchy**: Pay-as-you-go approach
3. **Simplicity**: Instead of complex features in one class, divide among several
4. **Open/Closed Principle**: Extend behavior without modifying existing code
5. **Single Responsibility Principle**: Divide functionality among classes
6. **Combinable**: Multiple decorators can be combined

## Trade-offs
- Lots of small objects: Can result in many small, similar-looking objects
- Harder to debug: Tracing through decorator chains can be confusing
- Order-dependent: Some decorator combinations are order-sensitive
- Identity issues: Decorated object isn't identical to original

## Decorator vs Similar Patterns

### Decorator vs Adapter
- **Decorator**: Adds responsibilities, same interface
- **Adapter**: Changes interface to make incompatible objects work together

### Decorator vs Proxy
- **Decorator**: Adds functionality
- **Proxy**: Controls access to object

### Decorator vs Composite
- **Decorator**: Adds responsibilities to single objects (linear chain)
- **Composite**: Composes objects into tree structures (hierarchical)

## Implementation Considerations

### Keeping Component Simple
- Component interface should be simple
- Decorators should be easy to compose

### Omitting Abstract Decorator
- Can skip abstract Decorator class if only one decorator
- Abstract decorator helpful when there are many decorators

### Decorator Order
- Some decorators may be order-dependent
- Document any ordering requirements

## Related Patterns
- **Adapter**: Changes interface; Decorator enhances responsibilities
- **Composite**: Decorator is a degenerate composite with one component
- **Strategy**: Decorator changes object's skin; Strategy changes its guts

## How to Run
```bash
node index.js
```

## Output
The demo shows:
1. Simple beverages without decorators
2. Beverages with single decorator
3. Beverages with multiple decorators
4. Complex custom orders
5. Dynamic order building
6. Price comparisons
7. Popular menu items built with decorators
8. Benefits over class explosion
9. Practical receipt generation system
