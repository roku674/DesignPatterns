# Factory Method Pattern

## Intent
Factory Method is a creational design pattern that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.

## What It Does
- Defines an interface for creating an object, but lets subclasses decide which class to instantiate
- Lets a class defer instantiation to subclasses
- Promotes loose coupling by eliminating the need to bind application-specific classes into your code

## When to Use It
- When you don't know beforehand the exact types and dependencies of the objects your code should work with
- When you want to provide users of your library or framework with a way to extend its internal components
- When you want to save system resources by reusing existing objects instead of rebuilding them each time
- When you need to provide a high level of flexibility for your code

## Real-World Example
This implementation demonstrates a **logistics/shipping system** where different logistics companies use different transportation methods:

- **RoadLogistics** creates **CarShipping** for local deliveries
- **SeaLogistics** creates **ShipShipping** for overseas freight
- **AirLogistics** creates **AirShipping** for express worldwide delivery

The client code doesn't need to know which specific logistics provider or transport method is being used - it just calls `PlanDelivery()` and gets the appropriate result.

## Structure
```
LogisticsCreator (Abstract Creator)
    ├── RoadLogistics (Concrete Creator A) → creates CarShipping
    ├── SeaLogistics (Concrete Creator B) → creates ShipShipping
    └── AirLogistics (Concrete Creator C) → creates AirShipping

IProduct (Product Interface)
    ├── CarShipping (Concrete Product A)
    ├── ShipShipping (Concrete Product B)
    └── AirShipping (Concrete Product C)
```

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Creational/FactoryMethod
dotnet run
```

## Expected Output
```
=== Factory Method Pattern Demo ===

Client: Using Road Logistics
Client: I'm not aware of the creator's class, but it still works.
Logistics: Planning delivery using -> Shipping by car - Fast delivery within city limits

Client: Using Sea Logistics
Client: I'm not aware of the creator's class, but it still works.
Logistics: Planning delivery using -> Shipping by ship - Economical for overseas delivery

Client: Using Air Logistics
Client: I'm not aware of the creator's class, but it still works.
Logistics: Planning delivery using -> Shipping by air - Express delivery worldwide
```

## Key Benefits
- **Single Responsibility Principle**: Product creation code is in one place
- **Open/Closed Principle**: New types of products can be introduced without breaking existing client code
- Avoids tight coupling between creator and concrete products
- Makes code more flexible and reusable

## Related Patterns
- **Abstract Factory**: Often implemented with Factory Methods
- **Prototype**: Doesn't require subclassing, but often requires an Initialize operation
- **Template Method**: Factory Method is a specialization of Template Method
