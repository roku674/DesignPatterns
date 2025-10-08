# Factory Method Pattern

## Intent
The Factory Method pattern provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.

## Problem
When you have a class that creates objects, but you want subclasses to decide which class to instantiate. This is useful when:
- You don't know beforehand the exact types of objects you need to create
- You want to provide a way to extend your library or framework
- You want to save system resources by reusing existing objects instead of rebuilding them

## Solution
The Factory Method pattern suggests replacing direct object construction calls (using `new`) with calls to a special factory method. Objects are still created via `new`, but it's being called from within the factory method.

## Real-World Analogy
Consider a logistics company that needs to deliver packages. Initially, they only use trucks (road logistics). Later, they expand to sea freight and air freight. Instead of rewriting the entire delivery planning system, they use the Factory Method pattern where each logistics type creates its appropriate transport vehicle.

## Structure
- **Product (Transport)**: Declares the interface for objects the factory method creates
- **Concrete Products (Truck, Ship, Plane)**: Implement the Product interface
- **Creator (Logistics)**: Declares the factory method that returns Product objects
- **Concrete Creators (RoadLogistics, SeaLogistics, AirLogistics)**: Override the factory method to return different product types

## Example Use Case
This implementation demonstrates a logistics management system where:
- Different logistics types (road, sea, air) create different transport vehicles
- The delivery planning logic is shared across all logistics types
- New transport types can be added without modifying existing code

## When to Use
- When you don't know beforehand the exact types and dependencies of objects your code should work with
- When you want to provide users of your library/framework with a way to extend its internal components
- When you want to save system resources by reusing existing objects instead of rebuilding them each time

## Benefits
- Avoids tight coupling between creator and concrete products
- Single Responsibility Principle: product creation code is in one place
- Open/Closed Principle: new product types can be introduced without breaking existing code
- More flexible than simple factory functions

## How to Run
```bash
node index.js
```

## Output
The demo shows how different logistics types create their appropriate transport methods and plan deliveries accordingly.
