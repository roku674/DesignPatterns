# Proxy Pattern

## What is the Proxy Pattern?

Provides a surrogate or placeholder for another object to control access to it. The proxy has the same interface as the real object.

## When to Use It

- Lazy initialization (virtual proxy) - create expensive objects on demand
- Access control (protection proxy) - control access to sensitive objects
- Remote proxy - represent objects in different address spaces
- Logging/caching - add functionality before/after accessing real object

## Implementation Details

- **Subject** (`Image`) - interface for RealSubject and Proxy
- **RealSubject** (`RealImage`) - actual object that proxy represents
- **Proxy** (`ProxyImage`) - maintains reference to RealSubject

## How to Compile and Run

```bash
javac *.java
java Main
```

## Key Benefits

- Controls access to object
- Lazy initialization saves resources
- Can add functionality transparently
