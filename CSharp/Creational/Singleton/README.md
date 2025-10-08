# Singleton Pattern

## Intent
Singleton is a creational design pattern that ensures a class has only one instance and provides a global point of access to that instance.

## What It Does
- Ensures a class has only one instance
- Provides a global access point to that instance
- Lazy initialization - instance is created only when needed
- Thread-safe implementation prevents race conditions
- Controls access to shared resources

## When to Use It
- When exactly one instance of a class is needed across the system
- When you need stricter control over global variables
- When the sole instance should be extensible by subclassing
- For managing shared resources (database connections, file managers, print spoolers)
- For logging, caching, thread pools, configuration settings

## Real-World Examples

### 1. Database Connection Manager
Ensures only one connection pool exists in the application:
- Prevents multiple connection pools consuming resources
- Centralizes database access
- Maintains connection statistics

### 2. Logger
Centralized logging system for the entire application:
- All log messages go through one instance
- Maintains log history in one place
- Prevents log file conflicts

### 3. Configuration Manager
Single source of truth for application settings:
- Loads configuration once
- Provides consistent settings across the app
- Allows runtime configuration updates

## Structure
```
Singleton Class
    ├── Private static instance
    ├── Private constructor (prevents external instantiation)
    ├── Public static Instance property (access point)
    └── Business logic methods
```

## Implementation Approaches in C#

### 1. Lazy<T> Initialization (Recommended)
```csharp
public sealed class Singleton
{
    private static readonly Lazy<Singleton> _instance =
        new Lazy<Singleton>(() => new Singleton());

    public static Singleton Instance => _instance.Value;

    private Singleton() { }
}
```

**Benefits:**
- Thread-safe by default
- Lazy initialization
- Simple and clean code
- Best performance

### 2. Double-Check Locking
```csharp
public sealed class Singleton
{
    private static Singleton? _instance;
    private static readonly object _lock = new object();

    public static Singleton Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_lock)
                {
                    if (_instance == null)
                    {
                        _instance = new Singleton();
                    }
                }
            }
            return _instance;
        }
    }

    private Singleton() { }
}
```

**Benefits:**
- Thread-safe
- Good performance (locking only on first access)
- More control over initialization

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Creational/Singleton
dotnet run
```

## Key Features Demonstrated

### 1. Instance Uniqueness
```csharp
Singleton s1 = Singleton.Instance;
Singleton s2 = Singleton.Instance;
Console.WriteLine(ReferenceEquals(s1, s2)); // True
```

### 2. Thread Safety
Multiple threads can safely access the instance:
- `Lazy<T>` handles thread synchronization
- No race conditions during initialization

### 3. Lazy Initialization
Instance is created only when first accessed:
```csharp
// No instance created yet
Logger logger = Logger.Instance; // Instance created here
Logger same = Logger.Instance;   // Returns existing instance
```

## Key Benefits
- **Controlled access**: Single point of access to the instance
- **Reduced namespace pollution**: Better than global variables
- **Lazy initialization**: Resources used only when needed
- **Thread safety**: Prevents concurrency issues
- **Flexibility**: Can be extended to control number of instances

## Common Use Cases
1. **Database Connections**: Connection pools, transaction managers
2. **Logging**: Centralized logging system
3. **Configuration**: Application settings manager
4. **Caching**: Cache manager for application data
5. **Thread Pools**: Managing worker threads
6. **Device Drivers**: Printer spoolers, file system managers
7. **Window Managers**: Desktop applications with single main window

## Important Considerations

### Pros
✅ Guaranteed single instance
✅ Global access point
✅ Lazy initialization
✅ Thread-safe (with proper implementation)

### Cons
❌ Violates Single Responsibility Principle (controls instantiation + business logic)
❌ Can be difficult to unit test
❌ Hides dependencies (not visible in constructor)
❌ Can create tight coupling
❌ Requires special treatment in multithreaded environments

### Modern Alternatives
In modern applications, consider:
- **Dependency Injection**: IoC containers can manage singleton lifetime
- **Service Locator**: For service discovery
- **Static Classes**: For stateless utility methods

```csharp
// Modern approach with DI
services.AddSingleton<ILogger, Logger>();
```

## Best Practices

1. **Use `sealed` keyword**: Prevents subclassing
```csharp
public sealed class Singleton { }
```

2. **Make constructor private**: Prevents external instantiation
```csharp
private Singleton() { }
```

3. **Prefer Lazy<T>**: Simplest thread-safe implementation
```csharp
private static readonly Lazy<Singleton> _instance = new(...);
```

4. **Consider Dependency Injection**: For better testability
```csharp
// Instead of: Logger.Instance.Log()
// Use: constructor injection
public MyClass(ILogger logger) { _logger = logger; }
```

## Testing Considerations

Singletons can be difficult to test because:
- Can't easily mock or replace the instance
- State persists between tests
- Creates hidden dependencies

**Solutions:**
- Extract interface and use DI
- Provide reset/clear methods for testing
- Use IoC container with singleton scope

## Related Patterns
- **Abstract Factory**: Can be implemented as Singleton
- **Builder**: Can be implemented as Singleton
- **Prototype**: Can be implemented as Singleton
- **Facade**: Often implemented as Singleton
