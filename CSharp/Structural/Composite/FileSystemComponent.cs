namespace Composite;

/// <summary>
/// Base component class for both files and directories.
/// Declares common operations for both simple and complex objects.
/// </summary>
public abstract class FileSystemComponent
{
    protected string _name;

    public FileSystemComponent(string name)
    {
        _name = name;
    }

    public virtual string GetName() => _name;

    /// <summary>
    /// Returns the size of the component in KB.
    /// </summary>
    public abstract int GetSize();

    /// <summary>
    /// Displays the component structure.
    /// </summary>
    public abstract void Display(int depth = 0);

    /// <summary>
    /// Adds a child component. Default implementation throws exception.
    /// Only implemented by Composite (Directory).
    /// </summary>
    public virtual void Add(FileSystemComponent component)
    {
        throw new NotImplementedException("Cannot add to a leaf component");
    }

    /// <summary>
    /// Removes a child component.
    /// </summary>
    public virtual void Remove(FileSystemComponent component)
    {
        throw new NotImplementedException("Cannot remove from a leaf component");
    }

    /// <summary>
    /// Checks if this component can have children.
    /// </summary>
    public virtual bool IsComposite() => false;
}
