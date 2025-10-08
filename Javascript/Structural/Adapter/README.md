# Adapter Pattern

## Intent
The Adapter pattern allows objects with incompatible interfaces to collaborate. It acts as a wrapper between two objects, catching calls for one object and transforming them to format and interface recognizable by the second object.

## Also Known As
Wrapper

## Problem
You have existing code that expects certain interfaces, but you need to integrate with third-party libraries or legacy code that has incompatible interfaces. You can't modify the third-party code, and rewriting your application to match their interface would be costly and error-prone.

## Solution
Create an adapter class that translates the interface of one class into an interface expected by the client. The adapter wraps the incompatible object and provides the interface the client expects.

## Real-World Analogy
When you travel from the US to Europe, you can't plug your laptop directly into a European power outlet because they have different shapes and voltage. You need a power adapter that:
1. Accepts your US plug (the interface you have)
2. Converts it to fit European outlets (the interface you need)
3. May also convert voltage (transforms the format)

Similarly, in software, when you need to integrate with a payment gateway like Stripe, PayPal, or Square, each has its own API interface. The Adapter pattern lets you create a uniform interface for all of them.

## Structure

- **Target (PaymentProcessor)**: The interface your application expects
- **Adaptee (StripeAPI, PayPalSDK, SquareAPI)**: The existing class with incompatible interface
- **Adapter (StripeAdapter, PayPalAdapter, SquareAdapter)**: Wraps the adaptee and implements the target interface
- **Client**: Works with objects through the target interface

## Example Use Case

This implementation demonstrates a payment processing system where:
- Your application expects a uniform `PaymentProcessor` interface
- Three different payment gateways (Stripe, PayPal, Square) have different APIs
- Adapters translate your interface to each gateway's specific requirements
- You can easily switch between payment providers without changing client code

### Differences Adapted:
- **Stripe**: Uses cents for amounts, different method names
- **PayPal**: Different data structure, separate name fields
- **Square**: Money object format, different status codes

## When to Use

Use the Adapter pattern when:
- You want to use an existing class with an incompatible interface
- You want to create a reusable class that cooperates with classes that have incompatible interfaces
- You need to use several existing subclasses but can't adapt their interface by subclassing each one
- You're integrating with third-party libraries that you can't modify

## Benefits

1. **Single Responsibility Principle**: Separates interface conversion from business logic
2. **Open/Closed Principle**: Add new adapters without modifying existing code
3. **Flexibility**: Easy to switch between different implementations
4. **Reusability**: Adapter can be reused with different clients
5. **Testability**: Mock the target interface instead of multiple adaptee interfaces

## Trade-offs

- **Increased complexity**: Adds extra layer of indirection
- **Performance**: Slight overhead from method calls through adapter
- **May be overkill**: For simple conversions, direct calls might be simpler

## Types of Adapters

### Class Adapter (Multiple Inheritance)
Not shown here because JavaScript doesn't support true multiple inheritance, but uses inheritance to adapt.

### Object Adapter (Composition)
Our implementation uses composition - the adapter contains an instance of the adaptee and delegates calls to it.

## Related Patterns

- **Bridge**: Similar structure but different intent (separates abstraction from implementation)
- **Decorator**: Similar structure but adds responsibilities rather than converting interface
- **Proxy**: Similar structure but same interface, different purpose (access control)
- **Facade**: Simplifies complex subsystem, adapter makes incompatible interfaces work together

## Implementation Considerations

1. **One-way vs Two-way Adapters**: Our adapters are one-way (client → adaptee). Two-way adapters work in both directions.
2. **Pluggable Adapters**: Design target interface to be easy to adapt
3. **Parameter Conversion**: Adapters may need to convert data types, units, structures
4. **Error Handling**: Translate exceptions/errors to expected format

## Modern JavaScript Considerations

- Use ES6 classes for clarity
- Consider using Object composition over inheritance
- Leverage JavaScript's dynamic nature for flexible adapters
- Use TypeScript interfaces for stronger contracts (in TypeScript projects)

## How to Run

```bash
node index.js
```

## Output

The demo shows:
1. Processing payments with three different gateways
2. Processing refunds with adapted interfaces
3. Runtime selection of payment processors
4. Benefits of using the adapter pattern
5. Each adapter translating the standard interface to gateway-specific calls
