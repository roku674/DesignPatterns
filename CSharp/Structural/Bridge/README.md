# Bridge Pattern

## Intent
Bridge is a structural design pattern that lets you split a large class or a set of closely related classes into two separate hierarchies—abstraction and implementation—which can be developed independently of each other.

## What It Does
- Separates abstraction from its implementation so they can vary independently
- Decouples an abstraction from its implementation
- Enables compile-time binding between abstraction and implementation
- Promotes loose coupling
- Improves extensibility - can extend abstraction and implementation hierarchies independently

## When to Use It
- When you want to avoid a permanent binding between abstraction and implementation
- When both abstractions and implementations should be extensible by subclassing
- When changes in implementation shouldn't impact clients
- When you have a proliferation of classes from coupled abstractions and implementations
- When you want to share an implementation among multiple objects and hide this from the client

## Real-World Example
This implementation demonstrates a **remote control and device system**:

**Abstraction Hierarchy (Remote Controls):**
- RemoteControl (basic functionality)
- AdvancedRemoteControl (extended features like mute, direct channel selection)

**Implementation Hierarchy (Devices):**
- Television
- Radio

**Key Benefit**: You can pair ANY remote with ANY device at runtime. Add new remotes or devices without modifying existing code.

Other real-world examples:
- Graphics rendering systems (Shape abstraction + Rendering implementation)
- Database drivers (Database abstraction + Driver implementation)
- UI themes (Component abstraction + Theme implementation)
- Payment systems (Payment abstraction + Gateway implementation)

## Structure
```
Abstraction (RemoteControl)
    └── RefinedAbstraction (AdvancedRemoteControl)

Implementation (IDevice)
    ├── Television
    └── Radio

The bridge connects: RemoteControl --has-a--> IDevice
```

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Structural/Bridge
dotnet run
```

## Key Concepts

### Two Independent Hierarchies

**1. Abstraction (What the client uses)**
```csharp
public class RemoteControl
{
    protected IDevice _device;  // Bridge to implementation

    public RemoteControl(IDevice device)
    {
        _device = device;  // Composition, not inheritance!
    }

    public void VolumeUp()
    {
        _device.SetVolume(_device.GetVolume() + 10);
    }
}
```

**2. Implementation (How it actually works)**
```csharp
public interface IDevice
{
    void SetVolume(int percent);
    int GetVolume();
    // ... other device operations
}

public class Television : IDevice
{
    // TV-specific implementation
}

public class Radio : IDevice
{
    // Radio-specific implementation
}
```

### The Bridge Connection
The abstraction holds a reference to the implementation (composition):
```csharp
protected IDevice _device;  // This is the "bridge"
```

## Matrix Explosion Problem (Solved by Bridge)

### Without Bridge Pattern
If we used inheritance, we'd need:
- BasicRemoteForTV
- BasicRemoteForRadio
- AdvancedRemoteForTV
- AdvancedRemoteForRadio

For N remotes and M devices, we need **N × M classes**.

### With Bridge Pattern
We only need:
- RemoteControl
- AdvancedRemoteControl
- Television
- Radio

For N remotes and M devices, we need **N + M classes**.

## Key Benefits
- **Single Responsibility Principle**: Abstraction handles high-level logic, implementation handles platform details
- **Open/Closed Principle**: Can introduce new abstractions and implementations independently
- **Reduced coupling**: Abstraction and implementation can vary independently
- **Platform independence**: Hide implementation details from clients
- **Improved extensibility**: Add new remotes or devices without modifying existing code

## Bridge vs Adapter

| Aspect | Bridge | Adapter |
|--------|--------|---------|
| **Intent** | Design-time separation | Make incompatible interfaces work |
| **When designed** | Upfront architectural decision | Retrofitted to existing code |
| **Relationship** | Both hierarchies evolve together | Wraps existing incompatible code |
| **Knowledge** | Abstraction knows implementation exists | Client unaware of adaptation |

## Bridge vs Strategy

| Aspect | Bridge | Strategy |
|--------|--------|----------|
| **Purpose** | Structural decoupling | Behavioral flexibility |
| **Scope** | Entire object structure | Single algorithm/behavior |
| **Change** | Implementation can vary | Algorithm can vary |
| **Focus** | "How" something is done | "What" algorithm is used |

## Real-World Use Cases

### 1. Graphics API
```csharp
// Abstraction
public abstract class Shape
{
    protected IRenderer _renderer;

    public abstract void Draw();
}

// Implementation
public interface IRenderer
{
    void RenderCircle(float x, float y, float radius);
    void RenderRectangle(float x, float y, float w, float h);
}

public class OpenGLRenderer : IRenderer { }
public class DirectXRenderer : IRenderer { }
public class VulkanRenderer : IRenderer { }
```

### 2. Database Access
```csharp
// Abstraction
public class Database
{
    protected IDbDriver _driver;

    public void Query(string sql)
    {
        _driver.Execute(sql);
    }
}

// Implementation
public interface IDbDriver
{
    void Execute(string sql);
}

public class MySqlDriver : IDbDriver { }
public class PostgreSqlDriver : IDbDriver { }
public class SqlServerDriver : IDbDriver { }
```

### 3. Notification System
```csharp
// Abstraction
public abstract class Notification
{
    protected ISender _sender;

    public abstract void Send(string message);
}

// Implementation
public interface ISender
{
    void SendMessage(string message);
}

public class EmailSender : ISender { }
public class SmsSender : ISender { }
public class PushNotificationSender : ISender { }
```

## Advantages and Disadvantages

### Advantages
✅ Platform-independent code
✅ Single Responsibility - separation of concerns
✅ Open/Closed - extend without modifying
✅ Reduces class explosion
✅ Runtime binding of implementation

### Disadvantages
❌ Increases complexity
❌ More classes and interfaces
❌ May be overkill for simple scenarios
❌ Requires careful initial design

## Best Practices

1. **Use composition over inheritance**: The bridge uses composition to connect abstraction and implementation
2. **Design interfaces carefully**: Implementation interface should be stable
3. **Keep implementation details hidden**: Client should only see abstraction
4. **Consider future extensions**: Bridge is most valuable when both hierarchies will grow
5. **Document the separation**: Make it clear which classes are abstractions vs implementations

## When NOT to Use Bridge

- When you only have one implementation (use simple inheritance)
- When abstraction and implementation won't change independently
- When the added complexity isn't justified
- In simple scenarios where direct implementation is clearer

## Related Patterns
- **Abstract Factory**: Can create and configure bridges
- **Adapter**: Similar structure but different intent (Bridge is designed upfront, Adapter is retrofitted)
- **State/Strategy**: Can be implemented using Bridge
- **Decorator**: Often used with Bridge to add behaviors
