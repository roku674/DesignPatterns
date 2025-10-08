# Flyweight Pattern

## Intent
The Flyweight pattern minimizes memory use by sharing as much data as possible with similar objects. It's useful when you need to create a large number of similar objects.

## Problem
Your application needs to support a huge number of objects that barely fit in RAM. Analysis reveals that many objects contain duplicate data that could be shared. However, creating each object with all its data leads to memory exhaustion.

Example: A text editor with 100,000 characters. If each character object stores font, size, color, and style, you'd need massive memory even for simple text.

## Solution
The pattern extracts the common state shared between many objects and stores it in shared "flyweight" objects. Each original object then stores only a reference to the flyweight plus any unique state.

**Key Concepts**:
- **Intrinsic State**: Shared state stored in flyweight (font, size, color, style)
- **Extrinsic State**: Unique state stored in context (character value, position)

## Real-World Analogy
Think about a forest in a video game:
- **Without Flyweight**: Each tree object stores mesh, texture, color, size
  - 100,000 trees = huge memory usage
- **With Flyweight**: Trees share mesh and texture (flyweight)
  - 100,000 trees reference maybe 10 tree types
  - Each tree stores only position and scale
  - Massive memory savings

Similarly, in text rendering:
- **Without Flyweight**: Each character stores complete style
- **With Flyweight**: Characters share style objects
- 1000 characters might use only 5 style objects

## Structure
- **Flyweight (CharacterStyle)**: Stores intrinsic state (shared data)
- **Concrete Flyweight**: Implements flyweight interface, must be sharable
- **Flyweight Factory (CharacterStyleFactory)**: Creates and manages flyweights
- **Context (Character)**: Stores extrinsic state and reference to flyweight
- **Client (TextEditor)**: Maintains references to flyweights and extrinsic state

## Example Use Case
This implementation demonstrates a text editor where:
- Character styles (font, size, color, bold, italic) are shared flyweights
- Each character stores only its value and position (extrinsic state)
- Thousands of characters can share a handful of style objects
- Factory ensures styles are shared, not duplicated
- Memory savings of 70-90% for typical documents

## When to Use
- Application uses large number of objects
- Storage costs are high due to sheer quantity
- Most object state can be made extrinsic
- Many objects can share few flyweights
- Application doesn't depend on object identity (can use shared instances)

## Benefits
1. **Memory savings**: Dramatic reduction in memory usage
2. **Performance**: Fewer objects for garbage collector
3. **Scalability**: Support more objects than would otherwise be possible
4. **Efficiency**: Reduced overhead of object creation

## Trade-offs
- Increased complexity: Must separate intrinsic/extrinsic state
- Runtime costs: May need to recompute extrinsic state
- Factory overhead: Managing flyweight pool adds complexity
- Thread safety: Shared objects must be immutable or thread-safe

## Intrinsic vs Extrinsic State

### Intrinsic State (in Flyweight)
- Shared among many objects
- Independent of context
- Immutable (shouldn't change)
- Examples: font, size, color, texture, mesh

### Extrinsic State (in Context)
- Unique to each object
- Depends on context
- Can change
- Examples: position, character value, rotation, scale

## Implementation Considerations

### Immutability
Flyweights should be immutable. If multiple objects share a flyweight and one modifies it, all objects are affected.

### Factory Management
Use a factory to ensure flyweights are shared:
```javascript
getStyle(font, size, color) {
  const key = `${font}-${size}-${color}`;
  if (!this.styles.has(key)) {
    this.styles.set(key, new CharacterStyle(font, size, color));
  }
  return this.styles.get(key);
}
```

### Memory vs Performance
- **Saves memory**: Shared objects
- **May cost performance**: Computing extrinsic state, factory lookups

Usually the memory savings far outweigh the performance costs.

## Related Patterns
- **Composite**: Flyweight often used with Composite for shared leaf nodes
- **State/Strategy**: These can be flyweights if they have no extrinsic state
- **Singleton**: Flyweight factory often implemented as Singleton
- **Factory**: Flyweight requires a factory to manage shared instances

## Real-World Applications
- **Text Editors**: Character formatting (our example)
- **Game Development**: Trees, particles, bullets, enemies
- **Graphics**: Textures, meshes, materials
- **UI Frameworks**: Shared style objects
- **Databases**: Connection pools

## How to Run
```bash
node index.js
```

## Output
The demo shows:
1. Creating document with shared styles
2. Rendering characters with flyweight styles
3. Memory usage statistics with vs without flyweight
4. Large document with 1000+ characters
5. Object reuse demonstration
6. Benefits and trade-offs
7. Memory savings of 70-90%
