# Singleton Pattern

## Intent
The Singleton pattern ensures a class has only one instance and provides a global point of access to that instance.

## Problem
Sometimes you need to ensure that a class has exactly one instance. For example:
- A single database connection shared across the application
- A single configuration manager
- A single logger instance
- A single cache manager

Why can't we just use global variables?
1. Global variables don't prevent multiple instantiation
2. They don't provide lazy initialization
3. They can be reassigned or modified

## Solution
The Singleton pattern makes a class responsible for keeping track of its sole instance. The class ensures that no other instance can be created and provides a way to access that instance.

Implementation strategies:
1. Make the constructor private (or control instantiation)
2. Create a static method that returns the instance
3. Store the instance in a static variable
4. Return the same instance on every call

## Real-World Analogy
A country can have only one official government. No matter how many people are in the government, the phrase "The Government of X" refers to the same group of people. The government is a singleton - a global point of access to a group of people in charge.

Similarly, a computer has one operating system kernel, one printer spooler, one window manager. These are all singletons in their respective contexts.

## Structure
- **Singleton Class**:
  - Private static instance variable
  - Private constructor (or controlled instantiation)
  - Public static getInstance() method
  - Regular methods to implement business logic

## JavaScript Implementations

### 1. Classic Singleton (Class-based)
```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
  }

  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}
```

### 2. Module Singleton (ES6)
```javascript
class Singleton { /* ... */ }
const instance = new Singleton();
Object.freeze(instance);
export default instance;
```

### 3. IIFE Singleton (Legacy)
```javascript
const Singleton = (function() {
  let instance;
  function createInstance() { /* ... */ }
  return {
    getInstance: function() {
      if (!instance) instance = createInstance();
      return instance;
    }
  };
})();
```

## Example Use Cases

This implementation demonstrates:

1. **DatabaseConnection**: Single database connection shared across the app
2. **ConfigurationManager**: Single configuration object (Module pattern)
3. **Logger**: Single logging instance for consistent logging

## When to Use

Use Singleton when:
- A class should have exactly one instance accessible to all clients
- You need strict control over global variables
- You need lazy initialization of a global object
- Managing shared resources (database connections, file systems, caches)

## When NOT to Use

Avoid Singleton when:
- You need multiple instances (obviously)
- In unit testing (makes tests harder to isolate)
- When it would create tight coupling
- As a substitute for global variables (consider dependency injection instead)

## Benefits

1. **Controlled access**: Strict control over the sole instance
2. **Reduced namespace pollution**: Better than global variables
3. **Lazy initialization**: Instance created only when needed
4. **Resource efficiency**: Shared resources like database connections
5. **Consistent state**: Single source of truth for configuration, logging, etc.

## Trade-offs

1. **Violates Single Responsibility Principle**: Class controls its instantiation AND implements business logic
2. **Global state**: Can make code harder to test and debug
3. **Tight coupling**: Code becomes dependent on the Singleton
4. **Concurrency issues**: Requires careful handling in multi-threaded environments
5. **Testing difficulties**: Difficult to mock or replace in unit tests

## Modern Alternatives

Consider these instead of Singleton in modern applications:

1. **Dependency Injection**: Pass shared instances through constructors
2. **Module System**: Use ES6 modules for single instances
3. **Context/State Management**: React Context, Redux, Vuex, etc.
4. **Service Locator**: For managing application-wide services

## Testing Considerations

Our implementation includes a `reset()` method specifically for testing:

```javascript
DatabaseConnection.reset(); // Clear singleton for next test
```

This allows tests to start with a fresh instance.

## How to Run

```bash
node index.js
```

## Output

The demo shows:
1. Classic Singleton pattern with getInstance()
2. Multiple references pointing to the same instance
3. Module Singleton pattern for configuration
4. Logger Singleton used across multiple modules
5. Concurrent access returning same instance
6. Resource management benefits
7. Resetting singleton for testing

## Best Practices

1. **Use sparingly**: Not every class should be a Singleton
2. **Consider alternatives**: Dependency injection is often better
3. **Document clearly**: Make it obvious a class is a Singleton
4. **Thread safety**: In multi-threaded environments, ensure thread-safe initialization
5. **Testing**: Provide a way to reset the instance for testing
6. **Immutability**: Consider freezing the instance with `Object.freeze()`
