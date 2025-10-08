# Flyweight Pattern

## What is the Flyweight Pattern?

Uses sharing to support large numbers of fine-grained objects efficiently by sharing common parts of object state among multiple objects.

## When to Use It

- When an application uses a large number of objects
- When storage costs are high because of the quantity of objects
- When most object state can be made extrinsic
- When many groups of objects may be replaced by relatively few shared objects

## Implementation Details

- **Flyweight** (`TreeType`) - stores intrinsic state (shared)
- **Context** (`Tree`) - stores extrinsic state (unique)
- **Factory** (`TreeFactory`) - manages flyweight objects

## How to Compile and Run

```bash
javac *.java
java Main
```

## Key Benefits

- Reduces memory usage
- Improves performance for large numbers of objects
- Centralizes shared state management
