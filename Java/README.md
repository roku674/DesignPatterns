# Gang of Four Design Patterns in Java

This repository contains complete, production-ready implementations of all 23 Gang of Four design patterns in Java.

## Quick Navigation

📂 **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete detailed documentation of all patterns

## Pattern Categories

### Creational Patterns (5)
1. [Singleton](Creational/Singleton/) - Ensure only one instance exists
2. [Factory Method](Creational/FactoryMethod/) - Create objects without specifying exact class
3. [Abstract Factory](Creational/AbstractFactory/) - Create families of related objects
4. [Builder](Creational/Builder/) - Construct complex objects step by step
5. [Prototype](Creational/Prototype/) - Clone existing objects

### Structural Patterns (7)
6. [Adapter](Structural/Adapter/) - Make incompatible interfaces work together
7. [Bridge](Structural/Bridge/) - Separate abstraction from implementation
8. [Composite](Structural/Composite/) - Compose objects into tree structures
9. [Decorator](Structural/Decorator/) - Add responsibilities to objects dynamically
10. [Facade](Structural/Facade/) - Provide simplified interface to complex system
11. [Flyweight](Structural/Flyweight/) - Share objects to save memory
12. [Proxy](Structural/Proxy/) - Control access to objects

### Behavioral Patterns (11)
13. [Chain of Responsibility](Behavioral/ChainOfResponsibility/) - Pass request along chain of handlers
14. [Command](Behavioral/Command/) - Encapsulate requests as objects
15. [Interpreter](Behavioral/Interpreter/) - Define grammar and interpreter
16. [Iterator](Behavioral/Iterator/) - Access elements sequentially
17. [Mediator](Behavioral/Mediator/) - Encapsulate object interactions
18. [Memento](Behavioral/Memento/) - Capture and restore object state
19. [Observer](Behavioral/Observer/) - Notify dependents of state changes
20. [State](Behavioral/State/) - Alter behavior when state changes
21. [Strategy](Behavioral/Strategy/) - Define family of interchangeable algorithms
22. [Template Method](Behavioral/TemplateMethod/) - Define algorithm skeleton
23. [Visitor](Behavioral/Visitor/) - Add operations without changing classes

## Getting Started

Each pattern directory contains:
- **Main.java** - Demonstrates the pattern in action
- **README.md** - Explains when and how to use the pattern
- **Implementation files** - Production-quality Java code

### Running a Pattern

```bash
cd Creational/Singleton
javac *.java
java Main
```

## Features

✅ All 23 GoF patterns implemented
✅ Production-ready code quality
✅ Real-world, practical examples
✅ Comprehensive documentation
✅ Java 11+ compatible
✅ SOLID principles
✅ Javadoc comments

## Learn More

See **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** for:
- Detailed explanations of each pattern
- When to use each pattern
- Code examples and usage
- Pattern selection guide
- Learning resources

## Requirements

- Java 11 or higher
- No external dependencies

## Project Structure

```
Java/
├── README.md (this file)
├── IMPLEMENTATION_SUMMARY.md (detailed documentation)
├── Creational/
│   ├── Singleton/
│   ├── FactoryMethod/
│   ├── AbstractFactory/
│   ├── Builder/
│   └── Prototype/
├── Structural/
│   ├── Adapter/
│   ├── Bridge/
│   ├── Composite/
│   ├── Decorator/
│   ├── Facade/
│   ├── Flyweight/
│   └── Proxy/
└── Behavioral/
    ├── ChainOfResponsibility/
    ├── Command/
    ├── Interpreter/
    ├── Iterator/
    ├── Mediator/
    ├── Memento/
    ├── Observer/
    ├── State/
    ├── Strategy/
    ├── TemplateMethod/
    └── Visitor/
```

## Credits

Based on the seminal work "Design Patterns: Elements of Reusable Object-Oriented Software" by Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides (Gang of Four).

## License

Educational and reference use. Code follows industry best practices and modern Java conventions.
