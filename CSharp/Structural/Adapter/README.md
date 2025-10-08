# Adapter Pattern

## Intent
Adapter is a structural design pattern that allows objects with incompatible interfaces to collaborate. It acts as a wrapper between two objects, catching calls for one object and transforming them to format and interface recognizable by the second object.

## What It Does
- Converts the interface of a class into another interface clients expect
- Lets classes work together that couldn't otherwise because of incompatible interfaces
- Wraps an existing class with a new interface
- Enables reuse of existing classes even if they don't fit the interface you need

## When to Use It
- When you want to use an existing class but its interface doesn't match the one you need
- When you want to create a reusable class that cooperates with unrelated or unforeseen classes
- When you need to use several existing subclasses, but it's impractical to adapt their interface by subclassing
- When integrating third-party libraries with incompatible interfaces
- When working with legacy code that you can't modify

## Real-World Example
This implementation demonstrates a **media player application** that needs to play different audio/video formats:

- **AudioPlayer**: Can play MP3 files natively
- **Third-party libraries**: VlcPlayer and Mp4Player with different interfaces
- **MediaAdapter**: Bridges the gap, allowing AudioPlayer to use third-party players
- Result: AudioPlayer can play MP3, VLC, and MP4 formats through a unified interface

Common real-world scenarios:
- Integrating payment gateways (Stripe, PayPal) with different APIs
- Connecting to various database systems with different drivers
- Using different logging frameworks through a common interface
- Adapting cloud storage providers (AWS S3, Azure Blob, Google Cloud Storage)

## Structure
```
IMediaPlayer (Target Interface)
    └── AudioPlayer
            ├── Plays MP3 natively
            └── Uses MediaAdapter for VLC/MP4

MediaAdapter : IMediaPlayer (Adapter)
    └── Uses IAdvancedMediaPlayer (Adaptee Interface)
            ├── VlcPlayer
            └── Mp4Player
```

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Structural/Adapter
dotnet run
```

## Key Concepts

### 1. Target Interface
The interface that the client expects:
```csharp
public interface IMediaPlayer
{
    void Play(string audioType, string fileName);
}
```

### 2. Adaptee Interface
The incompatible interface that needs adapting:
```csharp
public interface IAdvancedMediaPlayer
{
    void PlayVlc(string fileName);
    void PlayMp4(string fileName);
}
```

### 3. Adapter
Bridges the gap between Target and Adaptee:
```csharp
public class MediaAdapter : IMediaPlayer
{
    private readonly IAdvancedMediaPlayer _advancedMediaPlayer;

    public void Play(string audioType, string fileName)
    {
        // Translates calls to appropriate adaptee methods
        _advancedMediaPlayer.PlayVlc(fileName);
        // or
        _advancedMediaPlayer.PlayMp4(fileName);
    }
}
```

## Two Types of Adapters

### 1. Object Adapter (Composition) - Used in this example
- Uses composition (has-a relationship)
- Adapter contains an instance of Adaptee
- More flexible - can adapt multiple Adaptees
- Preferred in C# and most modern languages

```csharp
public class Adapter : ITarget
{
    private readonly Adaptee _adaptee;  // Composition

    public void Request()
    {
        _adaptee.SpecificRequest();
    }
}
```

### 2. Class Adapter (Inheritance) - Not shown
- Uses inheritance (is-a relationship)
- Requires multiple inheritance (not supported in C#)
- More common in C++ where multiple inheritance exists

## Key Benefits
- **Single Responsibility Principle**: Separates interface/data conversion from business logic
- **Open/Closed Principle**: Can introduce new adapters without changing existing code
- **Reuse existing classes**: Work with legacy code or third-party libraries
- **Flexibility**: Easy to add support for new formats/services
- **Maintainability**: Changes to adaptee don't affect client code

## Common Use Cases

### 1. Third-Party Library Integration
```csharp
// Your interface
public interface IPaymentProcessor
{
    void ProcessPayment(decimal amount);
}

// Adapter for Stripe
public class StripeAdapter : IPaymentProcessor
{
    private readonly StripeAPI _stripe;

    public void ProcessPayment(decimal amount)
    {
        _stripe.ChargeCard(amount * 100); // Stripe uses cents
    }
}
```

### 2. Legacy System Integration
```csharp
// Modern interface
public interface IUserRepository
{
    User GetUser(int id);
}

// Adapter for legacy database
public class LegacyDatabaseAdapter : IUserRepository
{
    private readonly LegacyDB _legacyDb;

    public User GetUser(int id)
    {
        // Convert legacy data format to modern User object
        LegacyRecord record = _legacyDb.FetchRecord(id);
        return ConvertToUser(record);
    }
}
```

### 3. Data Format Conversion
```csharp
// Convert XML API to JSON
public class XmlToJsonAdapter : IJsonAPI
{
    private readonly IXmlAPI _xmlApi;

    public string GetData()
    {
        string xml = _xmlApi.GetXmlData();
        return ConvertXmlToJson(xml);
    }
}
```

## Adapter vs Facade vs Bridge

| Pattern | Purpose | Structure |
|---------|---------|-----------|
| **Adapter** | Make incompatible interfaces work together | Wraps existing interface |
| **Facade** | Simplify complex subsystem | Provides simple interface to complex system |
| **Bridge** | Separate abstraction from implementation | Connects two independent hierarchies |

## Advantages and Disadvantages

### Advantages
✅ Makes incompatible interfaces compatible
✅ Increases reusability of existing code
✅ Improves code flexibility and maintainability
✅ Follows Open/Closed Principle
✅ Single Responsibility - interface conversion separated from logic

### Disadvantages
❌ Increases overall code complexity
❌ Adds extra layer of indirection
❌ Sometimes simpler to just update the original class
❌ Can impact performance (minimal, usually negligible)

## Best Practices

1. **Use interfaces**: Depend on abstractions, not concrete classes
2. **Keep adapter thin**: Don't add business logic to adapters
3. **Consider two-way adapters**: If you need bidirectional communication
4. **Document adaptee limitations**: Make it clear what the adapter can and cannot do
5. **Handle errors gracefully**: Third-party libraries may throw unexpected exceptions

## Related Patterns
- **Bridge**: Similar structure but different intent (design-time vs runtime)
- **Decorator**: Changes behavior, Adapter changes interface
- **Proxy**: Same interface, Adapter provides different interface
- **Facade**: Simplifies interface, Adapter changes interface to match target
