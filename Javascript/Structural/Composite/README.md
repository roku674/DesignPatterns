# Composite Pattern

## Intent
The Composite pattern lets you compose objects into tree structures to represent part-whole hierarchies. It allows clients to treat individual objects and compositions of objects uniformly.

## Problem
When working with tree-like structures (file systems, UI components, organization charts), you often need to:
- Treat individual objects and groups of objects the same way
- Perform recursive operations on hierarchical structures
- Calculate aggregate values from nested structures

Without the Composite pattern, clients must distinguish between leaf and composite objects, leading to complex conditional code.

## Solution
Define a common interface for both simple (leaf) and complex (composite) objects. Composites can contain leaves and other composites, forming a recursive tree structure. Clients work with all objects through the common interface.

## Real-World Analogy
Consider a military organizational structure:
- **Leaf**: Individual soldiers
- **Composite**: Squads, platoons, companies, battalions

When a commander gives an order to a battalion, it cascades down through companies, platoons, squads, to individual soldiers. The commander doesn't need to know whether they're addressing an individual or a group - the interface is the same.

Similarly, in a file system:
- **Leaf**: Files
- **Composite**: Directories (which can contain files and other directories)

## Structure
- **Component (FileSystemNode)**: Common interface for leaves and composites
- **Leaf (File)**: Represents leaf objects (no children)
- **Composite (Directory)**: Stores children and implements child-related operations
- **Client**: Manipulates objects through the component interface

## Example Use Case
This implementation demonstrates a file system where:
- Files are leaf nodes
- Directories are composite nodes that can contain files and other directories
- Both files and directories implement common operations (getName, getSize, print)
- Recursive operations (calculating total size, counting files) work seamlessly
- Clients treat files and directories uniformly

## When to Use
- You want to represent part-whole hierarchies of objects
- You want clients to ignore the difference between compositions and individual objects
- You're working with tree-structured data (file systems, GUI components, documents)
- You need to apply operations recursively through a tree structure

## Benefits
1. **Uniform treatment**: Clients treat leaves and composites the same
2. **Easy to add new components**: New leaf or composite types integrate easily
3. **Simplified client code**: No need to distinguish between object types
4. **Recursive composition**: Can build complex trees from simple elements
5. **Open/Closed Principle**: New component types don't require changing existing code

## Trade-offs
- Can make design overly general
- Hard to restrict components of a composite (if you need type-specific children)
- May require runtime type checking for specific operations

## Implementation Notes

### Key Methods
1. **Operation methods** (getSize, print): Implemented by both leaves and composites
2. **Child management** (add, remove, getChild): Only meaningful for composites
3. **Recursive operations**: Composites delegate to children

### Design Decisions
- Should children be in the Component interface or only in Composite?
  - **Transparency**: All methods in Component (our choice) - simpler client code
  - **Safety**: Child methods only in Composite - safer but requires type checking

## Related Patterns
- **Iterator**: Often used with Composite to traverse tree structures
- **Visitor**: Can apply operations to Composite structures
- **Decorator**: Similar recursive structure, different intent
- **Flyweight**: Can be used to share leaf nodes and save memory

## How to Run
```bash
node index.js
```

## Output
The demo shows:
1. Building a hierarchical file system
2. Printing tree structure with indentation
3. Calculating sizes recursively
4. Counting files and directories
5. Searching for files by extension
6. Finding files by size criteria
7. Uniform treatment of leaves and composites
8. Modifying the tree structure
9. Practical use case (backup size calculator)
