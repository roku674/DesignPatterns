# Gang of Four Design Patterns - JavaScript Implementation

This repository contains production-ready implementations of all 23 Gang of Four design patterns in modern JavaScript (ES6+).

## Overview

Design patterns are reusable solutions to commonly occurring problems in software design. The Gang of Four (GoF) patterns, documented in the book "Design Patterns: Elements of Reusable Object-Oriented Software" by Gamma, Helm, Johnson, and Vlissides, are foundational patterns every software developer should know.

## Pattern Categories

### Creational Patterns (5)
Creational patterns deal with object creation mechanisms, trying to create objects in a manner suitable to the situation.

1. **Factory Method** - Define an interface for creating objects, but let subclasses decide which class to instantiate
2. **Abstract Factory** - Create families of related objects without specifying their concrete classes
3. **Builder** - Construct complex objects step by step
4. **Prototype** - Clone objects instead of creating new instances
5. **Singleton** - Ensure a class has only one instance with global access point

### Structural Patterns (7)
Structural patterns explain how to assemble objects and classes into larger structures while keeping these structures flexible and efficient.

6. **Adapter** - Make incompatible interfaces work together
7. **Bridge** - Separate abstraction from implementation so they can vary independently
8. **Composite** - Compose objects into tree structures to represent part-whole hierarchies
9. **Decorator** - Add new responsibilities to objects dynamically
10. **Facade** - Provide a simplified interface to a complex subsystem
11. **Flyweight** - Share objects to support large numbers efficiently
12. **Proxy** - Provide a placeholder or surrogate to control access to an object

### Behavioral Patterns (11)
Behavioral patterns are concerned with algorithms and the assignment of responsibilities between objects.

13. **Chain of Responsibility** - Pass requests along a chain of handlers
14. **Command** - Encapsulate requests as objects
15. **Interpreter** - Implement a language interpreter
16. **Iterator** - Access elements of a collection sequentially
17. **Mediator** - Reduce coupling between components by making them communicate through a mediator
18. **Memento** - Capture and restore an object's internal state
19. **Observer** - Notify multiple objects about state changes
20. **State** - Alter object behavior when its internal state changes
21. **Strategy** - Define a family of interchangeable algorithms
22. **Template Method** - Define algorithm skeleton, let subclasses override specific steps
23. **Visitor** - Separate algorithms from objects they operate on

## Project Structure

```
Javascript/
├── Creational/
│   ├── FactoryMethod/
│   ├── AbstractFactory/
│   ├── Builder/
│   ├── Prototype/
│   └── Singleton/
├── Structural/
│   ├── Adapter/
│   ├── Bridge/
│   ├── Composite/
│   ├── Decorator/
│   ├── Facade/
│   ├── Flyweight/
│   └── Proxy/
├── Behavioral/
│   ├── ChainOfResponsibility/
│   ├── Command/
│   ├── Interpreter/
│   ├── Iterator/
│   ├── Mediator/
│   ├── Memento/
│   ├── Observer/
│   ├── State/
│   ├── Strategy/
│   ├── TemplateMethod/
│   └── Visitor/
├── test-all-patterns.js
└── README.md
```

Each pattern directory contains:
- **Implementation file(s)**: Core pattern implementation
- **index.js**: Demonstration/example usage
- **README.md**: Pattern explanation and documentation

## Running the Patterns

### Test All Patterns
```bash
cd Javascript
node test-all-patterns.js
```

### Run Individual Pattern
```bash
cd Javascript/Creational/Singleton
node index.js
```

## Features

- **Modern JavaScript**: All patterns use ES6+ features (classes, arrow functions, modules, destructuring, etc.)
- **Production-Ready**: Well-structured, commented, and following best practices
- **Practical Examples**: Each pattern uses real-world scenarios instead of abstract examples
- **Comprehensive Documentation**: Every pattern has detailed README explaining when/how to use it
- **Working Code**: All patterns are tested and runnable

## Code Quality Standards

- ES6+ class syntax for clarity
- JSDoc comments for documentation
- Meaningful variable and class names
- Proper error handling
- JavaScript naming conventions (camelCase for variables/functions, PascalCase for classes)
- No var declarations (const/let only)

## Pattern Implementation Highlights

### Creational
- **Factory Method**: Logistics system with different transport types
- **Abstract Factory**: Cross-platform UI components
- **Builder**: Pizza construction with fluent interface
- **Prototype**: Document cloning system
- **Singleton**: Database connection management

### Structural
- **Adapter**: Payment gateway integration
- **Bridge**: Messaging system separating message types from channels
- **Composite**: File system hierarchy
- **Decorator**: Coffee shop beverage customization
- **Facade**: Home theater system simplification
- **Flyweight**: Text editor character rendering
- **Proxy**: Image loading with lazy loading, caching, and access control

### Behavioral
- **Chain of Responsibility**: Customer support escalation system
- **Command**: Smart home automation with undo
- **Interpreter**: Mathematical expression evaluator
- **Iterator**: Book collection traversal
- **Mediator**: Chat room communication
- **Memento**: Text editor with undo/redo
- **Observer**: News agency subscription system
- **State**: Vending machine state management
- **Strategy**: Payment method selection
- **Template Method**: Data processing pipeline
- **Visitor**: Shape area calculation

## Learning Resources

- [Refactoring Guru - Design Patterns](https://refactoring.guru/design-patterns)
- [Patterns.dev](https://www.patterns.dev/)
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Requirements

- Node.js 12+ (for ES6 module support)
- No external dependencies required

## License

This is an educational implementation of the Gang of Four design patterns.

## Author

Implemented with modern JavaScript best practices and real-world examples.

---

**Note**: Design patterns are tools, not rules. Use them when they solve a problem, not just because they exist. Understanding when NOT to use a pattern is as important as knowing how to implement it.
