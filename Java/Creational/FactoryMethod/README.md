# Factory Method Pattern

## What is the Factory Method Pattern?

The Factory Method pattern defines an interface for creating objects, but lets subclasses decide which class to instantiate. It lets a class defer instantiation to subclasses, promoting loose coupling between the creator and the concrete products.

## When to Use It

- When a class can't anticipate the type of objects it needs to create
- When a class wants its subclasses to specify the objects to create
- When you want to delegate the responsibility of object creation to helper subclasses
- When you need to provide a library of products and want to reveal only their interfaces, not implementations
- When creating objects requires complex logic that shouldn't be duplicated

## Implementation Details

This implementation demonstrates:
- **Product Interface** (`Notification`) - defines the interface for objects the factory creates
- **Concrete Products** (`EmailNotification`, `SMSNotification`, `PushNotification`) - specific implementations
- **Creator** (`NotificationFactory`) - declares the factory method
- **Concrete Creators** (`EmailNotificationFactory`, etc.) - override the factory method to create specific products

## Real-World Example

The example demonstrates a notification system where:
- Different types of notifications (Email, SMS, Push) need to be created
- The client code doesn't need to know the specific notification class
- New notification types can be added without modifying existing code
- Runtime selection of notification type based on user preferences

## How to Compile and Run

```bash
# Compile
javac *.java

# Run
java Main
```

## Expected Output

```
=== Factory Method Pattern Demo ===

--- Email Notification ---
Created notification of type: EMAIL
Sending EMAIL to: user@example.com
Subject: Notification
Message: Your order has been shipped!
Email sent successfully!

--- SMS Notification ---
Created notification of type: SMS
Sending SMS to: +1-555-1234
Message: Your verification code is: 123456
SMS sent successfully!

--- Push Notification ---
Created notification of type: PUSH
Sending PUSH notification to device: device-token-xyz123
Message: New message received!
Push notification sent successfully!

--- Runtime Selection Demo ---
Created notification of type: EMAIL
Sending EMAIL to: dynamic@example.com
Subject: Notification
Message: This is a dynamically selected notification!
Email sent successfully!
```

## Key Benefits

1. **Open/Closed Principle** - Open for extension, closed for modification
2. **Single Responsibility** - Object creation code is in one place
3. **Loose Coupling** - Client code doesn't depend on concrete classes
4. **Flexibility** - Easy to add new product types without changing existing code
5. **Polymorphism** - Products are used through their common interface

## Comparison with Other Patterns

- **Factory Method vs Abstract Factory**: Factory Method creates one product, Abstract Factory creates families of related products
- **Factory Method vs Simple Factory**: Factory Method uses inheritance and subclasses, Simple Factory uses a single class with parameters

## Common Use Cases

- UI frameworks (creating buttons, windows for different operating systems)
- Document frameworks (creating different document types)
- Connection pools (creating different database connections)
- Plugin architectures (loading different plugin types)
