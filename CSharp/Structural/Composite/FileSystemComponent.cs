using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Composite;

/// <summary>
/// Component interface for the Composite pattern.
/// Represents both individual files and directories in a REAL file system.
/// </summary>
public abstract class FileSystemComponent
{
    public abstract string Name { get; }
    public abstract string Path { get; }
    public abstract long GetSize();
    public abstract Task<long> GetSizeAsync();
    public abstract void Display(int depth = 0);
    public abstract bool IsDirectory();
    public abstract Task<bool> DeleteAsync();
    public abstract Task<bool> CopyToAsync(string destinationPath);
    public abstract FileSystemComponent? Find(string name);
    public abstract List<FileSystemComponent> GetAll();
}
