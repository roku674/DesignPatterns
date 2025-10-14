# Design Patterns

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive collection of software design patterns implemented in **C#**, **Java**, and **JavaScript** with practical, easy-to-understand examples.

## 📖 About

This repository contains implementations of all 23 Gang of Four (GoF) design patterns across three popular programming languages. Each pattern includes:

- Clear, well-commented code examples
- Practical use cases
- Implementation in C#, Java, and JavaScript
- Easy-to-follow structure

Whether you're preparing for interviews, working with legacy code, or improving your software architecture skills, this repository serves as a practical reference guide.

## 🎯 What Are Design Patterns?

Design patterns are reusable solutions to common problems in software design. They represent best practices developed over time by experienced software engineers. The Gang of Four (GoF) patterns were documented in the influential 1994 book "Design Patterns: Elements of Reusable Object-Oriented Software" by Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides.

## 📚 The 23 Gang of Four Patterns

### Creational Patterns (5)
Creational patterns deal with object creation mechanisms, trying to create objects in a manner suitable to the situation.

1. **Factory Method** - Defines an interface for creating objects but delegates instantiation to subclasses
2. **Abstract Factory** - Produces families of related objects without specifying their concrete classes
3. **Builder** - Provides a step-by-step approach to construct complex objects
4. **Prototype** - Creates new objects by copying existing ones instead of constructing from scratch
5. **Singleton** - Ensures only one instance of a class exists and provides global access to it

### Structural Patterns (7)
Structural patterns deal with object composition and typically identify simple ways to realize relationships between different objects.

1. **Adapter** - Allows incompatible interfaces to work together by wrapping an interface around an existing class
2. **Bridge** - Decouples an abstraction from its implementation so they can vary independently
3. **Composite** - Composes objects into tree structures to represent part-whole hierarchies
4. **Decorator** - Dynamically adds new behavior to objects without modifying their structure
5. **Facade** - Provides a simplified interface to a larger and more complex system
6. **Flyweight** - Shares common object instances to minimize memory usage
7. **Proxy** - Acts as a placeholder to control access to an object

### Behavioral Patterns (11)
Behavioral patterns are concerned with algorithms and the assignment of responsibilities between objects.

1. **Chain of Responsibility** - Passes requests along a chain of handlers until one handles it
2. **Command** - Encapsulates a request as an object, allowing undo and queuing mechanisms
3. **Interpreter** - Defines a representation for grammar along with an interpreter
4. **Iterator** - Provides a way to traverse a collection without exposing its internal details
5. **Mediator** - Reduces direct dependencies between objects by centralizing communication
6. **Memento** - Captures an object's state for later restoration
7. **Observer** - Establishes a dependency between objects for change notifications
8. **State** - Allows an object to alter its behavior when its internal state changes
9. **Strategy** - Defines a family of algorithms, encapsulates each one, and makes them interchangeable
10. **Template Method** - Defines the skeleton of an algorithm, allowing subclasses to provide concrete behavior
11. **Visitor** - Separates an algorithm from an object structure

## 📁 Repository Structure

```
DesignPatterns/
├── CSharp/
│   ├── Creational/
│   │   ├── FactoryMethod/
│   │   ├── AbstractFactory/
│   │   ├── Builder/
│   │   ├── Prototype/
│   │   └── Singleton/
│   ├── Structural/
│   │   ├── Adapter/
│   │   ├── Bridge/
│   │   ├── Composite/
│   │   ├── Decorator/
│   │   ├── Facade/
│   │   ├── Flyweight/
│   │   └── Proxy/
│   └── Behavioral/
│       ├── ChainOfResponsibility/
│       ├── Command/
│       ├── Interpreter/
│       ├── Iterator/
│       ├── Mediator/
│       ├── Memento/
│       ├── Observer/
│       ├── State/
│       ├── Strategy/
│       ├── TemplateMethod/
│       └── Visitor/
├── Java/
│   └── (same structure as CSharp)
└── Javascript/
    └── (same structure as CSharp)
```

## 🚀 Getting Started

### Prerequisites

- **C#**: .NET SDK 6.0 or later
- **Java**: JDK 11 or later
- **JavaScript**: Node.js 14 or later

### Running Examples

Navigate to any pattern directory in your language of choice and follow the instructions in the pattern's README file.

**C# Example:**
```bash
cd CSharp/Creational/Singleton
dotnet run
```

**Java Example:**
```bash
cd Java/Creational/Singleton
javac *.java
java Main
```

**JavaScript Example:**
```bash
cd Javascript/Creational/Singleton
node index.js
```

## 🎓 Learning Path

If you're new to design patterns, we recommend studying them in this order:

1. **Start with Creational patterns** - Understanding object creation is fundamental
2. **Move to Structural patterns** - Learn how to compose objects effectively
3. **Finish with Behavioral patterns** - Master object interaction and responsibility

## 💡 Use Cases

- **Interview Preparation**: Master the patterns commonly asked in technical interviews
- **Code Review**: Identify and apply appropriate patterns in your codebase
- **Architecture Design**: Make informed decisions about software structure
- **Legacy Code**: Understand and refactor existing codebases
- **Team Communication**: Use pattern names as a shared vocabulary

## 🤝 Contributing

Contributions are welcome! If you'd like to:

- Add implementations in additional languages
- Improve existing examples
- Fix bugs or typos
- Add more detailed explanations

Please feel free to submit a pull request.

## 📖 Additional Resources

- [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612) - The original Gang of Four book
- [Refactoring.Guru - Design Patterns](https://refactoring.guru/design-patterns) - Excellent visual explanations
- [SourceMaking - Design Patterns](https://sourcemaking.com/design_patterns) - Comprehensive pattern catalog

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⭐ Acknowledgments

- The Gang of Four (Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides) for documenting these timeless patterns
- The open-source community for continuous learning and knowledge sharing

## 💖 Support This Project

If you find this repository helpful and would like to support continued development, please consider donating:

**[Visit my website to donate](https://www.alexanderfields.me)**

Your support helps maintain and expand this educational resource!

---

**Found this helpful? Give it a ⭐️ to show your support!**
