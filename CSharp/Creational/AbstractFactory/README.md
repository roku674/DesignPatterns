# Abstract Factory Pattern

## Intent
Abstract Factory is a creational design pattern that lets you produce families of related objects without specifying their concrete classes.

## What It Does
- Provides an interface for creating families of related or dependent objects without specifying their concrete classes
- Encapsulates a group of individual factories with a common theme
- Isolates concrete classes from the client
- Makes exchanging product families easy

## When to Use It
- When your code needs to work with various families of related products, but you don't want it to depend on the concrete classes of those products
- When you have a class with a set of Factory Methods that blur its primary responsibility
- When you want to provide a library of products, revealing only their interfaces but not their implementations
- When the system should be independent of how its products are created, composed, and represented

## Real-World Example
This implementation demonstrates a **cross-platform GUI application** that needs to create UI components (buttons and checkboxes) that match the look and feel of different operating systems:

- **WindowsFactory** creates Windows-styled buttons and checkboxes (blue theme, square checkboxes)
- **MacFactory** creates macOS-styled buttons and checkboxes (rounded corners, circular checkboxes)

The application code remains the same regardless of which platform it's running on - only the factory changes.

## Structure
```
IGUIFactory (Abstract Factory)
    ├── WindowsFactory → creates WindowsButton & WindowsCheckbox
    └── MacFactory → creates MacButton & MacCheckbox

IButton (Abstract Product)
    ├── WindowsButton
    └── MacButton

ICheckbox (Abstract Product)
    ├── WindowsCheckbox
    └── MacCheckbox

Application (Client)
    └── Uses IGUIFactory to create products
```

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Creational/AbstractFactory
dotnet run
```

## Expected Output
```
=== Abstract Factory Pattern Demo ===
Cross-Platform GUI Application

Detected platform: Windows

--- Rendering Application UI ---
Rendering Windows-style button with blue theme
Rendering Windows-style checkbox with square design

--- User Interaction ---
Windows button clicked - Standard Windows behavior
Windows checkbox toggled - Checkmark animation

==================================================

Switching to different platform...

Platform: Mac

--- Rendering Application UI ---
Rendering macOS-style button with rounded corners
Rendering macOS-style checkbox with circular design

--- User Interaction ---
Mac button clicked - Smooth fade animation
Mac checkbox toggled - Smooth slide animation
```

## Key Benefits
- **Isolation of concrete classes**: Factory encapsulates the responsibility and the process of creating product objects
- **Easy product family exchange**: The class of a concrete factory appears only once (where it's instantiated)
- **Product consistency**: When product objects from one family are designed to work together, it's important that an application use objects from only one family at a time
- **Single Responsibility Principle**: Product creation code is in one place
- **Open/Closed Principle**: New variants of products can be introduced without breaking existing client code

## Key Differences from Factory Method
- **Factory Method** uses inheritance and relies on a subclass to handle object creation
- **Abstract Factory** uses object composition and delegates object creation to factory objects
- **Factory Method** creates one product, **Abstract Factory** creates families of related products

## Related Patterns
- **Factory Method**: Often used to implement Abstract Factory
- **Singleton**: Concrete factories are often singletons
- **Prototype**: Can be used instead of Abstract Factory when there are many product families
