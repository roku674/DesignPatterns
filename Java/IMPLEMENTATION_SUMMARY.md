# Gang of Four Design Patterns - Complete Java Implementation

## Overview

This directory contains production-ready implementations of all 23 Gang of Four (GoF) design patterns in Java. Each pattern includes:
- Well-commented, high-quality Java code
- Practical, real-world examples
- A Main.java demonstrating usage
- Comprehensive README.md with explanations

## Directory Structure

```
Java/
├── Creational/          (5 patterns)
├── Structural/          (7 patterns)
├── Behavioral/          (11 patterns)
└── IMPLEMENTATION_SUMMARY.md (this file)
```

---

## Creational Patterns (5)

Creational patterns deal with object creation mechanisms, trying to create objects in a manner suitable to the situation.

### 1. Singleton
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Creational/Singleton/`

**Purpose:** Ensures a class has only one instance and provides a global point of access to it.

**Implementation:** Thread-safe Bill Pugh Singleton using static inner class for lazy initialization.

**Example:** DatabaseConnection - ensures only one database connection instance exists.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Creational/Singleton
javac *.java
java Main
```

---

### 2. Factory Method
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Creational/FactoryMethod/`

**Purpose:** Defines an interface for creating objects, but lets subclasses decide which class to instantiate.

**Implementation:** Notification system with Email, SMS, and Push notification factories.

**Example:** NotificationFactory creates different types of notifications (Email, SMS, Push) based on user preferences.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Creational/FactoryMethod
javac *.java
java Main
```

---

### 3. Abstract Factory
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Creational/AbstractFactory/`

**Purpose:** Provides an interface for creating families of related or dependent objects without specifying their concrete classes.

**Implementation:** Cross-platform UI components (Windows and Mac factories creating buttons and checkboxes).

**Example:** GUIFactory creates families of UI components (buttons, checkboxes) for different operating systems.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Creational/AbstractFactory
javac *.java
java Main
```

---

### 4. Builder
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Creational/Builder/`

**Purpose:** Separates the construction of a complex object from its representation, allowing step-by-step construction.

**Implementation:** Computer builder with fluent interface for configuring components (CPU, RAM, GPU, etc.).

**Example:** ComputerBuilder allows building custom computers with various configurations (gaming, office, workstation).

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Creational/Builder
javac *.java
java Main
```

---

### 5. Prototype
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Creational/Prototype/`

**Purpose:** Creates new objects by copying existing objects (prototypes) rather than creating from scratch.

**Implementation:** Document management system with cloneable ReportDocument and ProposalDocument.

**Example:** DocumentRegistry stores document templates that can be cloned and customized.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Creational/Prototype
javac *.java
java Main
```

---

## Structural Patterns (7)

Structural patterns deal with object composition, creating relationships between objects to form larger structures.

### 6. Adapter
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Structural/Adapter/`

**Purpose:** Allows objects with incompatible interfaces to collaborate by converting one interface to another.

**Implementation:** Media player that adapts VLC and MP4 players to a common MediaPlayer interface.

**Example:** AudioPlayer plays MP3 natively but uses adapters to play VLC and MP4 formats.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Structural/Adapter
javac *.java
java Main
```

---

### 7. Bridge
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Structural/Bridge/`

**Purpose:** Separates abstraction from implementation so they can vary independently.

**Implementation:** Remote controls (abstraction) controlling different devices (implementation).

**Example:** RemoteControl and AdvancedRemoteControl work with TV and Radio devices independently.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Structural/Bridge
javac *.java
java Main
```

---

### 8. Composite
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Structural/Composite/`

**Purpose:** Composes objects into tree structures to represent part-whole hierarchies.

**Implementation:** Product packaging system with individual products and boxes containing products.

**Example:** Box can contain Products and other Boxes, forming a tree structure for shipments.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Structural/Composite
javac *.java
java Main
```

---

### 9. Decorator
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Structural/Decorator/`

**Purpose:** Attaches additional responsibilities to an object dynamically, providing a flexible alternative to subclassing.

**Implementation:** Coffee shop system adding ingredients (milk, sugar, whipped cream) to coffee.

**Example:** SimpleCoffee can be decorated with MilkDecorator, SugarDecorator, and WhippedCreamDecorator.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Structural/Decorator
javac *.java
java Main
```

---

### 10. Facade
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Structural/Facade/`

**Purpose:** Provides a simplified interface to a complex subsystem.

**Implementation:** Computer startup system hiding complex subsystem interactions.

**Example:** ComputerFacade simplifies the complex startup process involving CPU, Memory, and HardDrive.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Structural/Facade
javac *.java
java Main
```

---

### 11. Flyweight
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Structural/Flyweight/`

**Purpose:** Uses sharing to support large numbers of fine-grained objects efficiently.

**Implementation:** Forest rendering system sharing TreeType objects among many Tree instances.

**Example:** TreeFactory ensures TreeTypes are shared, reducing memory usage when rendering thousands of trees.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Structural/Flyweight
javac *.java
java Main
```

---

### 12. Proxy
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Structural/Proxy/`

**Purpose:** Provides a surrogate or placeholder for another object to control access to it.

**Implementation:** Image loading system with lazy initialization and caching.

**Example:** ProxyImage delays loading of RealImage until actually needed, improving performance.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Structural/Proxy
javac *.java
java Main
```

---

## Behavioral Patterns (11)

Behavioral patterns deal with algorithms and the assignment of responsibilities between objects.

### 13. Chain of Responsibility
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Behavioral/ChainOfResponsibility/`

**Purpose:** Passes a request along a chain of handlers, with each handler deciding to process or pass it on.

**Implementation:** Support ticket system with Level 1, Level 2, and Level 3 support handlers.

**Example:** Issues are escalated through support levels based on priority.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Behavioral/ChainOfResponsibility
javac *.java
java Main
```

---

### 14. Command
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Behavioral/Command/`

**Purpose:** Encapsulates a request as an object, allowing parameterization and queuing of requests.

**Implementation:** Remote control system with commands for turning lights on/off with undo support.

**Example:** LightOnCommand and LightOffCommand encapsulate operations on Light with undo capability.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Behavioral/Command
javac *.java
java Main
```

---

### 15. Interpreter
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Behavioral/Interpreter/`

**Purpose:** Defines a representation for a grammar and an interpreter for sentences in the language.

**Implementation:** Simple arithmetic expression evaluator.

**Example:** AddExpression and SubtractExpression interpret mathematical expressions.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Behavioral/Interpreter
javac *.java
java Main
```

---

### 16. Iterator
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Behavioral/Iterator/`

**Purpose:** Provides a way to access elements of a collection sequentially without exposing underlying representation.

**Implementation:** Library book collection with custom iterator.

**Example:** BookCollection with BookIterator for traversing books.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Behavioral/Iterator
javac *.java
java Main
```

---

### 17. Mediator
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Behavioral/Mediator/`

**Purpose:** Defines an object that encapsulates how a set of objects interact, promoting loose coupling.

**Implementation:** Chat room system where users communicate through a mediator.

**Example:** ChatRoom mediates messages between multiple User objects.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Behavioral/Mediator
javac *.java
java Main
```

---

### 18. Memento
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Behavioral/Memento/`

**Purpose:** Captures and externalizes an object's internal state for restoration later.

**Implementation:** Text editor with undo functionality.

**Example:** TextEditor saves state as Memento objects managed by History for undo operations.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Behavioral/Memento
javac *.java
java Main
```

---

### 19. Observer
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Behavioral/Observer/`

**Purpose:** Defines a one-to-many dependency so when one object changes state, dependents are notified.

**Implementation:** News agency publishing system with subscribers.

**Example:** Subject notifies multiple NewsSubscriber observers when news is published.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Behavioral/Observer
javac *.java
java Main
```

---

### 20. State
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Behavioral/State/`

**Purpose:** Allows an object to alter its behavior when its internal state changes.

**Implementation:** Vending machine with different states (NoCoin, HasCoin).

**Example:** VendingMachine behavior changes based on whether it has a coin or not.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Behavioral/State
javac *.java
java Main
```

---

### 21. Strategy
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Behavioral/Strategy/`

**Purpose:** Defines a family of algorithms, encapsulates each one, and makes them interchangeable.

**Implementation:** Payment processing system with multiple payment strategies.

**Example:** ShoppingCart can use CreditCardStrategy, PayPalStrategy, or BitcoinStrategy interchangeably.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Behavioral/Strategy
javac *.java
java Main
```

---

### 22. Template Method
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Behavioral/TemplateMethod/`

**Purpose:** Defines the skeleton of an algorithm, deferring some steps to subclasses.

**Implementation:** Data processing framework with CSV and JSON processors.

**Example:** DataProcessor defines template (read, process, write) implemented differently by CSVDataProcessor and JSONDataProcessor.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Behavioral/TemplateMethod
javac *.java
java Main
```

---

### 23. Visitor
**Location:** `/home/roku674/Alex/DesignPatterns/Java/Behavioral/Visitor/`

**Purpose:** Represents an operation to be performed on elements, allowing new operations without changing element classes.

**Implementation:** Shopping cart price calculator for different item types.

**Example:** PriceCalculator visitor calculates total cost for Book and Fruit elements.

**How to Run:**
```bash
cd /home/roku674/Alex/DesignPatterns/Java/Behavioral/Visitor
javac *.java
java Main
```

---

## Quick Reference Guide

### Pattern Selection Guide

**Need to create objects?** → Use **Creational** patterns
- Single instance needed? → **Singleton**
- Complex object construction? → **Builder**
- Copy existing objects? → **Prototype**
- Create object families? → **Abstract Factory**
- Defer instantiation to subclasses? → **Factory Method**

**Need to compose objects?** → Use **Structural** patterns
- Incompatible interfaces? → **Adapter**
- Separate abstraction from implementation? → **Bridge**
- Tree structures? → **Composite**
- Add responsibilities dynamically? → **Decorator**
- Simplified interface to complex system? → **Facade**
- Share objects to save memory? → **Flyweight**
- Control access to an object? → **Proxy**

**Need to define object interactions?** → Use **Behavioral** patterns
- Chain of handlers? → **Chain of Responsibility**
- Encapsulate requests as objects? → **Command**
- Define a language grammar? → **Interpreter**
- Traverse a collection? → **Iterator**
- Centralize complex communications? → **Mediator**
- Capture and restore state? → **Memento**
- Notify dependents of changes? → **Observer**
- State-dependent behavior? → **State**
- Interchangeable algorithms? → **Strategy**
- Define algorithm skeleton? → **Template Method**
- Add operations to object structure? → **Visitor**

---

## Code Quality Features

All implementations include:
- ✅ Javadoc comments on classes and methods
- ✅ Meaningful variable and class names
- ✅ Proper exception handling where needed
- ✅ SOLID principles compliance
- ✅ Java 11+ compatible code
- ✅ Production-ready quality
- ✅ Real-world, practical examples
- ✅ Demonstration of usage in Main.java
- ✅ Comprehensive README.md documentation

---

## Testing All Patterns

To test all patterns at once, you can use this script:

```bash
#!/bin/bash
cd /home/roku674/Alex/DesignPatterns/Java

# Test all Creational patterns
for pattern in Creational/*/; do
    echo "Testing $pattern"
    cd "$pattern"
    javac *.java && java Main
    cd ../..
done

# Test all Structural patterns
for pattern in Structural/*/; do
    echo "Testing $pattern"
    cd "$pattern"
    javac *.java && java Main
    cd ../..
done

# Test all Behavioral patterns
for pattern in Behavioral/*/; do
    echo "Testing $pattern"
    cd "$pattern"
    javac *.java && java Main
    cd ../..
done
```

---

## Challenges Encountered

1. **Pattern Complexity**: Some patterns (like Abstract Factory and Visitor) required careful design to demonstrate their value clearly.

2. **Real-World Examples**: Finding practical, non-trivial examples that clearly demonstrate each pattern's purpose was important.

3. **Java Constraints**: Working within Java's single inheritance limitation required careful use of interfaces and composition.

4. **Balance**: Balancing between keeping examples simple enough to understand while complex enough to be realistic.

---

## Learning Resources

These implementations were based on best practices from:
- Gang of Four "Design Patterns" book
- Refactoring.Guru (https://refactoring.guru/design-patterns)
- GeeksforGeeks Design Patterns guides
- Modern Java design pattern implementations

---

## Summary Statistics

- **Total Patterns Implemented:** 23
- **Total Java Files:** ~92 (.java files)
- **Total README Files:** 23
- **Creational Patterns:** 5
- **Structural Patterns:** 7
- **Behavioral Patterns:** 11

---

## Conclusion

This comprehensive implementation demonstrates all 23 Gang of Four design patterns in modern Java. Each pattern is:
- Fully functional and tested
- Documented with clear explanations
- Demonstrated with practical examples
- Ready for production use or educational purposes

All code follows Java best practices and naming conventions, making it suitable for both learning and reference purposes.

**Last Updated:** 2025
**Java Version:** 11+
**Author:** Implementation following Gang of Four design patterns
