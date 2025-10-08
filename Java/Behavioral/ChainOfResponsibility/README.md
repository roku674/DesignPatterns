# Chain of Responsibility Pattern

## What is the Chain of Responsibility Pattern?

Passes a request along a chain of handlers. Each handler decides either to process the request or to pass it to the next handler in the chain.

## When to Use It

- More than one object can handle a request
- The handler isn't known in advance
- The set of handlers should be specified dynamically

## How to Compile and Run

```bash
javac *.java
java Main
```

## Key Benefits

- Decouples sender and receiver
- Flexibility in assigning responsibilities
- Easy to add new handlers
