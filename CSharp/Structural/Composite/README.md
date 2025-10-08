# Composite Pattern

## Intent
Composite is a structural design pattern that lets you compose objects into tree structures and then work with these structures as if they were individual objects. It allows clients to treat individual objects and compositions of objects uniformly.

## What It Does
- Composes objects into tree structures to represent part-whole hierarchies
- Lets clients treat individual objects and compositions uniformly
- Makes it easier to add new kinds of components
- Provides a structure for building a hierarchy of objects

## When to Use It
- When you need to implement a tree-like object structure
- When you want clients to treat simple and complex elements uniformly
- When you have part-whole hierarchies of objects
- When you want to represent hierarchies of objects
- When the structure can have any level of complexity and you want to work with all objects in a uniform manner

## Real-World Example
This implementation demonstrates a **file system hierarchy**:
- **File** (Leaf): Individual files with a size
- **Directory** (Composite): Can contain files and other directories
- Both implement the same interface, allowing uniform treatment

Other examples:
- GUI component hierarchies (panels containing buttons, labels, other panels)
- Organization charts (employees and departments)
- Menu systems (menus containing menu items and submenus)
- Document structures (documents containing paragraphs, images, sections)

## Structure
```
FileSystemComponent (Component)
    ├── File (Leaf) - Cannot have children
    └── Directory (Composite) - Can have children
            ├── Contains List<FileSystemComponent>
            └── Operations are executed recursively on children
```

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Structural/Composite
dotnet run
```

## Key Concepts

### Component Interface
```csharp
public abstract class FileSystemComponent
{
    public abstract int GetSize();
    public abstract void Display(int depth);
    public virtual void Add(FileSystemComponent component) { }
    public virtual void Remove(FileSystemComponent component) { }
}
```

### Leaf (Cannot have children)
```csharp
public class File : FileSystemComponent
{
    public override int GetSize() => _size;
    public override void Display(int depth) { ... }
    // Does not implement Add/Remove
}
```

### Composite (Can have children)
```csharp
public class Directory : FileSystemComponent
{
    private List<FileSystemComponent> _children;

    public override int GetSize()
    {
        int total = 0;
        foreach (var child in _children)
            total += child.GetSize(); // Recursion!
        return total;
    }

    public override void Add(FileSystemComponent component)
    {
        _children.Add(component);
    }
}
```

## Key Benefits
- **Single Responsibility**: Each component handles its own behavior
- **Open/Closed**: Easy to add new component types
- **Uniform treatment**: Client code doesn't distinguish between leaves and composites
- **Recursive composition**: Natural representation of tree structures
- **Flexibility**: Easy to add new levels to the hierarchy

## Common Use Cases

### 1. GUI Frameworks
```csharp
Panel mainPanel = new Panel();
mainPanel.Add(new Button("OK"));
mainPanel.Add(new Label("Name:"));

Panel subPanel = new Panel();
subPanel.Add(new TextBox());
mainPanel.Add(subPanel);

mainPanel.Render(); // Renders all components recursively
```

### 2. Graphics Systems
```csharp
GraphicsGroup scene = new GraphicsGroup();
scene.Add(new Circle(10, 10, 5));
scene.Add(new Rectangle(20, 20, 30, 40));

GraphicsGroup house = new GraphicsGroup();
house.Add(new Rectangle(0, 0, 100, 100)); // walls
house.Add(new Triangle(0, -50, 100, 50));  // roof
scene.Add(house);

scene.Draw(); // Draws everything
```

### 3. Menu Systems
```csharp
Menu fileMenu = new Menu("File");
fileMenu.Add(new MenuItem("New"));
fileMenu.Add(new MenuItem("Open"));

Menu recentMenu = new Menu("Recent Files");
recentMenu.Add(new MenuItem("Doc1.txt"));
recentMenu.Add(new MenuItem("Doc2.txt"));
fileMenu.Add(recentMenu);

fileMenu.Display(); // Shows menu hierarchy
```

## Composite vs Decorator

| Aspect | Composite | Decorator |
|--------|-----------|-----------|
| **Purpose** | Part-whole hierarchy | Add responsibilities |
| **Structure** | Tree structure | Wrapper chain |
| **Focus** | Structural composition | Behavioral enhancement |
| **Children** | Multiple children | One wrapped object |

## Advantages and Disadvantages

### Advantages
✅ Simplifies client code - treats all objects uniformly
✅ Makes it easy to add new component types
✅ Natural representation of tree structures
✅ Recursive operations are straightforward
✅ Flexible - can build complex trees from simple parts

### Disadvantages
❌ Can make design overly general
❌ Difficult to restrict component types in composition
❌ Operations may not make sense for all components
❌ Can be harder to understand for simple hierarchies

## Design Decisions

### 1. Where to declare child management operations?

**Option A: In Component base class (used in this example)**
- Pros: Uniform interface
- Cons: Leaf classes inherit unnecessary methods

**Option B: Only in Composite class**
- Pros: Type safety
- Cons: Client must check type before adding children

### 2. Should Component store parent reference?
- Makes traversing up the tree easier
- Increases coupling and complexity
- This example doesn't use parent references

### 3. Who should delete children?
- In C# with garbage collection: automatic
- In C++ or manual memory management: Composite typically handles deletion

## Best Practices

1. **Use consistent interfaces**: All components should implement the same core operations
2. **Handle edge cases**: Empty directories, single-item directories, etc.
3. **Consider caching**: For expensive operations like GetSize(), cache results
4. **Provide utility methods**: Find, Search, Filter operations
5. **Document limitations**: Make clear which operations apply to which components

## Related Patterns
- **Iterator**: Often used to traverse Composite structures
- **Visitor**: Can apply operations to Composite structures
- **Decorator**: Similar structure but different intent
- **Chain of Responsibility**: Can be used with Composite for event handling
- **Command**: Leaf commands can be composed into macro commands (Composite)
