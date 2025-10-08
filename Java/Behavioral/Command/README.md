# Command Pattern

## What is the Command Pattern?

Encapsulates a request as an object, allowing you to parameterize clients with different requests, queue or log requests, and support undoable operations.

## When to Use It

- To parameterize objects with operations
- To queue, schedule, and execute requests at different times
- To support undo/redo operations
- To structure a system around high-level operations built on primitives

## How to Compile and Run

```bash
javac *.java
java Main
```

## Key Benefits

- Decouples invoker from receiver
- Supports undo/redo
- Commands can be assembled into composite commands
