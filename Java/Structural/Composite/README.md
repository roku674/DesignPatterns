# Composite Pattern

## What is the Composite Pattern?

The Composite pattern lets you compose objects into tree structures to represent part-whole hierarchies. It allows clients to treat individual objects and compositions uniformly.

## When to Use It

- When you want to represent part-whole hierarchies of objects
- When you want clients to treat individual objects and compositions uniformly
- When you want to create tree-like structures

## Implementation Details

- **Component** - interface for all objects in composition
- **Leaf** (`Product`) - represents leaf objects with no children
- **Composite** (`Box`) - stores child components and implements child-related operations

## How to Compile and Run

```bash
javac *.java
java Main
```

## Key Benefits

- Uniform treatment of objects and compositions
- Easy to add new component types
- Simplifies client code
