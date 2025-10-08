# Bridge Pattern

## Intent
The Bridge pattern separates an abstraction from its implementation so that the two can vary independently. It uses composition to combine abstraction and implementation rather than inheritance.

## Also Known As
Handle/Body

## Problem
When you have a class hierarchy that combines two independent dimensions (for example, message types × delivery channels), the number of classes grows exponentially. For `n` abstractions and `m` implementations, you'd need `n × m` classes with traditional inheritance.

Example: If you have 3 message types (Short, Detailed, Urgent) and 4 delivery channels (Email, SMS, Slack, Push), you'd need 12 classes: ShortEmailMessage, ShortSMSMessage, DetailedEmailMessage, etc.

## Solution
The Bridge pattern solves this by splitting the hierarchy into two separate hierarchies:
1. **Abstraction**: The high-level control layer (Message types)
2. **Implementation**: The platform/implementation layer (Delivery channels)

The abstraction contains a reference to the implementation and delegates the actual work to it.

## Real-World Analogy
Think about remote controls and devices:
- **Abstraction**: Different remote controls (Basic Remote, Advanced Remote, Touch Remote)
- **Implementation**: Different devices (TV, Radio, Projector)

You can use any remote with any device - they're independent dimensions. You don't need BasicRemoteForTV, BasicRemoteForRadio, AdvancedRemoteForTV, etc. Instead, you have 3 remotes + 3 devices = 6 classes instead of 9.

## Structure
- **Abstraction (Message)**: Defines the abstraction's interface and maintains a reference to an Implementor
- **Refined Abstraction (ShortMessage, DetailedMessage, UrgentMessage)**: Extends the abstraction
- **Implementor (MessageSender)**: Defines the interface for implementation classes
- **Concrete Implementor (EmailSender, SMSSender, etc.)**: Implements the Implementor interface

## Example Use Case
This implementation demonstrates a messaging system where:
- **Abstraction dimension**: Message types (short, detailed, urgent)
- **Implementation dimension**: Delivery channels (email, SMS, Slack, push)
- Message types can use any delivery channel
- New message types don't require new channel implementations
- New channels don't require new message type classes

## When to Use
- You want to avoid permanent binding between abstraction and implementation
- Both abstraction and implementation should be extensible through subclassing
- Changes in implementation shouldn't affect clients
- You have a proliferation of classes due to combining two independent hierarchies
- You want to share implementation among multiple objects
- You need to switch implementations at runtime

## Benefits
1. **Platform independence**: Abstraction not bound to specific implementation
2. **Extensibility**: Extend abstraction and implementation independently
3. **Hide implementation details**: Clients don't see implementation details
4. **Reduced class count**: n + m classes instead of n × m
5. **Runtime binding**: Can switch implementation at runtime
6. **Single Responsibility Principle**: Separate high-level logic from platform details

## Trade-offs
- Increased complexity for simple scenarios
- More indirection in code
- May be overkill if only one implementation exists

## Bridge vs Adapter
- **Bridge**: Designed upfront to let abstraction and implementation vary independently
- **Adapter**: Used to make unrelated classes work together (usually after design)
- **Bridge**: Abstraction and implementation are both defined by you
- **Adapter**: Adapter wraps existing class you can't modify

## Related Patterns
- **Abstract Factory**: Can create and configure a particular Bridge
- **Adapter**: Makes unrelated classes work together; Bridge separates interface from implementation upfront
- **Strategy**: Similar structure but different intent (Bridge is structural, Strategy is behavioral)

## How to Run
```bash
node index.js
```

## Output
The demo shows:
1. Sending different message types via different channels
2. Broadcasting messages to multiple recipients
3. Switching implementations at runtime
4. Independence of abstraction and implementation dimensions
5. Practical notification system using user preferences
6. Benefits of n+m classes instead of n×m classes
