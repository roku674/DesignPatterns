# Builder Pattern

## Intent
The Builder pattern lets you construct complex objects step by step. It allows you to produce different types and representations of an object using the same construction process.

## Problem
Imagine a complex object that requires laborious, step-by-step initialization of many fields and nested objects. Creating such objects directly using a constructor would result in:
- A constructor with many parameters (some may be optional)
- Code that is hard to read and maintain
- Need for multiple constructor overloads for different configurations
- Difficulty in creating different representations of the same object

## Solution
The Builder pattern suggests extracting the object construction code out of its own class and move it to separate objects called builders. The pattern organizes object construction into a set of steps. To create an object, you execute a series of these steps on a builder object. The important part is that you don't need to call all of the steps - only those required for a particular configuration.

## Real-World Analogy
Think about ordering a pizza. You don't get a pre-made pizza - you build it step by step:
1. Choose size (small, medium, large)
2. Choose crust type (thin, thick, stuffed)
3. Choose sauce (tomato, white, BBQ)
4. Choose cheese (mozzarella, cheddar, vegan)
5. Add toppings (pepperoni, mushrooms, etc.)
6. Choose cooking method (wood-fired, brick oven)

The same building process can create different pizzas based on your choices.

## Structure
- **Product (Pizza)**: The complex object being constructed
- **Builder (PizzaBuilder)**: Interface declaring construction steps common to all builders
- **Concrete Builder (StandardPizzaBuilder)**: Implements building steps and keeps track of the product
- **Director (PizzaDirector)**: Defines the order of building steps to create specific configurations
- **Client**: Associates a builder with a director and initiates construction

## Example Use Case
This implementation demonstrates a pizza ordering system where:
- Customers can build custom pizzas step by step
- Predefined recipes (Margherita, Pepperoni, etc.) can be created via Director
- The same building process creates different pizza configurations
- Not all steps are required (e.g., toppings are optional)

## When to Use
- When you want to avoid a "telescoping constructor" (constructor with many parameters)
- When your code needs to create different representations of the same product
- When you want to construct complex objects with many optional components
- When construction process must allow different representations of the constructed object

## Benefits
- Construct objects step by step, defer construction steps, or run steps recursively
- Reuse the same construction code when building various representations of products
- Single Responsibility Principle: isolate complex construction code from business logic
- Fluent interface makes code more readable
- Can construct different product representations using the same building process

## Trade-offs
- Overall code complexity increases since the pattern requires creating multiple new classes
- Client code may become more verbose

## How to Run
```bash
node index.js
```

## Output
The demo shows:
1. Building a custom pizza step by step
2. Using Director to create predefined pizza recipes
3. Building multiple pizzas in sequence
4. Creating minimal configurations with optional steps omitted
