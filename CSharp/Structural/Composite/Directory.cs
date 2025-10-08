namespace Composite;

/// <summary>
/// Composite class representing a directory that can contain files and subdirectories.
/// </summary>
public class Directory : FileSystemComponent
{
    private readonly List<FileSystemComponent> _children = new List<FileSystemComponent>();

    public Directory(string name) : base(name)
    {
    }

    public override void Add(FileSystemComponent component)
    {
        _children.Add(component);
    }

    public override void Remove(FileSystemComponent component)
    {
        _children.Remove(component);
    }

    public override int GetSize()
    {
        int totalSize = 0;
        foreach (FileSystemComponent child in _children)
        {
            totalSize += child.GetSize();
        }
        return totalSize;
    }

    public override void Display(int depth = 0)
    {
        Console.WriteLine($"{new string(' ', depth * 2)}📁 {_name}/ ({GetSize()} KB total)");
        foreach (FileSystemComponent child in _children)
        {
            child.Display(depth + 1);
        }
    }

    public override bool IsComposite() => true;

    /// <summary>
    /// Gets the number of items (files and directories) in this directory.
    /// </summary>
    public int GetItemCount() => _children.Count;

    /// <summary>
    /// Searches for a component by name recursively.
    /// </summary>
    public FileSystemComponent? Find(string name)
    {
        if (_name.Equals(name, StringComparison.OrdinalIgnoreCase))
        {
            return this;
        }

        foreach (FileSystemComponent child in _children)
        {
            if (child.GetName().Equals(name, StringComparison.OrdinalIgnoreCase))
            {
                return child;
            }

            if (child.IsComposite())
            {
                Directory? dir = child as Directory;
                FileSystemComponent? found = dir?.Find(name);
                if (found != null)
                {
                    return found;
                }
            }
        }

        return null;
    }
}
