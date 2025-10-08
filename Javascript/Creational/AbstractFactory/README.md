# Abstract Factory Pattern

## Intent
The Abstract Factory pattern provides an interface for creating families of related or dependent objects without specifying their concrete classes.

## Problem
When you need to create families of related objects (like UI components for different operating systems), you want to ensure that the created objects are compatible with each other. Creating these objects directly makes your code dependent on specific classes, making it hard to add new variants.

## Solution
The Abstract Factory pattern suggests explicitly declaring interfaces for each distinct product type (Button, Checkbox, Input). Then you create abstract factory classes that declare methods for creating all product types. Each concrete factory corresponds to a specific product variant (Windows, Mac, Linux) and creates only those products.

## Real-World Analogy
Consider a furniture shop that sells chairs, sofas, and tables. These items are available in different styles: Modern, Victorian, and Art Deco. You need a way to create furniture items so that individual items match each other in style. The Abstract Factory provides factories for each style, ensuring all created furniture matches.

In this example, we create cross-platform UI components. A Windows factory creates Windows-styled buttons, checkboxes, and inputs. A Mac factory creates Mac-styled components. All components from the same factory are guaranteed to match in style and behavior.

## Structure
- **Abstract Factory (GUIFactory)**: Declares methods for creating abstract products
- **Concrete Factories (WindowsFactory, MacFactory, LinuxFactory)**: Implement creation methods to produce concrete products
- **Abstract Products (Button, Checkbox, Input)**: Declare interfaces for product types
- **Concrete Products (WindowsButton, MacButton, etc.)**: Implement abstract product interfaces

## Example Use Case
This implementation demonstrates a cross-platform UI system where:
- Each platform (Windows, Mac, Linux) has its own look and feel
- Components from the same platform are guaranteed to be compatible
- The application can switch between platforms without changing core logic
- New platforms can be added by creating new concrete factories

## When to Use
- Your code needs to work with various families of related products
- You want to ensure that products from one family are compatible with each other
- You want to provide a class library of products, revealing only interfaces, not implementations
- The system should be independent of how its products are created

## Benefits
- Ensures compatibility between created products
- Isolates concrete classes from client code
- Single Responsibility Principle: product creation code is in one place
- Open/Closed Principle: new product variants can be added without breaking existing code
- Consistency among products from the same family

## Trade-offs
- The code may become more complicated due to multiple new interfaces and classes
- Adding new product types requires changing all factory classes

## How to Run
```bash
node index.js
```

## Output
The demo shows how different platform factories create their respective UI components with platform-specific styling and behavior.
