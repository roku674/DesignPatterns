# Prototype Pattern

## Intent
The Prototype pattern lets you copy existing objects without making your code dependent on their classes. It delegates the cloning process to the actual objects that are being cloned.

## Problem
You have an object and want to create an exact copy of it. How do you do it? You'd need to:
1. Create a new object of the same class
2. Go through all fields of the original object
3. Copy their values to the new object

Problems with this approach:
- Not all objects can be copied this way (some fields may be private)
- You must know the object's class to create a duplicate (code becomes dependent on classes)
- Sometimes you only know the interface the object follows, not its concrete class

## Solution
The Prototype pattern delegates the cloning process to the actual objects being cloned. The pattern declares a common interface for all objects that support cloning. This interface lets you clone an object without coupling your code to the class of that object. Usually, such an interface contains just a single `clone` method.

## Real-World Analogy
Think about document templates in a word processor. Instead of creating a new document from scratch each time, you:
1. Create a template document with standard formatting, headers, and structure
2. Clone this template whenever you need a new document
3. Fill in the specific details for each new document

This is much faster than recreating the same structure repeatedly. The same applies to cell division in biology - cells clone themselves rather than being built from scratch.

## Structure
- **Prototype**: Declares the cloning interface (usually just a `clone` method)
- **Concrete Prototype (Document, ReportDocument, TemplateDocument)**: Implements the cloning method
- **Client**: Creates a new object by asking a prototype to clone itself
- **Prototype Registry**: Provides an easy way to access frequently-used prototypes

## Example Use Case
This implementation demonstrates a document management system where:
- Standard documents can be cloned to create similar documents quickly
- Report documents with complex structures (sections, charts) can be duplicated
- Template documents can be cloned and customized with different values
- A registry maintains commonly-used document prototypes
- Cloning is faster than creating complex objects from scratch

## When to Use
- When your code shouldn't depend on the concrete classes of objects you need to copy
- When you want to reduce the number of subclasses that only differ in the way they initialize objects
- When creating an object is expensive (database queries, network calls, complex initialization)
- When you need to create many similar objects that differ only in some properties

## Benefits
- Clone objects without coupling to their concrete classes
- Eliminate repeated initialization code
- Produce complex objects more conveniently
- Get an alternative to inheritance for dealing with configuration presets
- Often faster than creating objects from scratch (especially for complex objects)

## Trade-offs
- Cloning complex objects with circular references can be tricky
- Deep cloning requires careful implementation to avoid sharing references
- May require implementing clone methods for all classes in a hierarchy

## Implementation Notes
In JavaScript, you can implement cloning in several ways:
1. **Manual cloning** (as shown): Explicitly copy each property
2. **Spread operator**: `{ ...object }` (shallow copy)
3. **Object.assign()**: `Object.assign({}, object)` (shallow copy)
4. **JSON parse/stringify**: `JSON.parse(JSON.stringify(object))` (deep copy, but loses methods and special types)
5. **structuredClone()**: Modern deep cloning (Node.js 17+)

Our implementation uses manual cloning for full control and to demonstrate the pattern clearly.

## How to Run
```bash
node index.js
```

## Output
The demo shows:
1. Basic document cloning and modification
2. Cloning complex report documents with nested structures
3. Using document templates with placeholder substitution
4. Managing prototypes with a registry
5. Performance comparison between creating from scratch vs. cloning
