namespace Composite;

/// <summary>
/// Leaf class representing a file in the file system.
/// Files cannot have children.
/// </summary>
public class File : FileSystemComponent
{
    private readonly int _size;

    public File(string name, int size) : base(name)
    {
        _size = size;
    }

    public override int GetSize() => _size;

    public override void Display(int depth = 0)
    {
        Console.WriteLine($"{new string(' ', depth * 2)}📄 {_name} ({_size} KB)");
    }

    public override bool IsComposite() => false;
}
