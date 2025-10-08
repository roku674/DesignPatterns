# Singleton Pattern

## What is the Singleton Pattern?

The Singleton pattern ensures that a class has only one instance and provides a global point of access to that instance. It's one of the most commonly used creational design patterns.

## When to Use It

- When exactly one instance of a class is needed to coordinate actions across the system
- When you need to control access to shared resources (databases, file systems, hardware interfaces)
- When you want to replace global variables with a better controlled mechanism
- For logging, driver objects, caching, thread pools, and configuration settings

## Implementation Details

This implementation uses the **Bill Pugh Singleton Design** which:
- Is thread-safe without requiring synchronization
- Provides lazy initialization (instance created only when first accessed)
- Has no performance overhead of synchronized methods
- Uses static inner class that's loaded only when `getInstance()` is called

## Real-World Example

The example demonstrates a database connection manager where:
- Only one database connection instance exists throughout the application
- Multiple parts of the application can access the same connection
- Resources are properly managed and shared

## How to Compile and Run

```bash
# Compile
javac DatabaseConnection.java Main.java

# Run
java Main
```

## Expected Output

```
=== Singleton Pattern Demo ===

DatabaseConnection instance created
Connected to database: jdbc:mysql://localhost:3306/mydb
Executing query: SELECT * FROM users

Executing query: INSERT INTO users VALUES (1, 'John')

Are db1 and db2 the same instance? true
db1 hashCode: [same number]
db2 hashCode: [same number]

Disconnected from database
Error: Not connected to database
```

## Key Benefits

1. **Controlled access to sole instance** - Exactly one instance is guaranteed
2. **Reduced namespace pollution** - Better than global variables
3. **Permits refinement** - Can be subclassed if needed
4. **Thread-safe** - This implementation is inherently thread-safe
5. **Lazy initialization** - Instance created only when needed

## Common Pitfalls to Avoid

- Beware of serialization/deserialization creating new instances
- Be careful with reflection attacks
- Consider using enums for simpler singleton implementation in Java
- Avoid overusing singletons - they can make testing difficult
