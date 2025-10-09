using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Composite;

/// <summary>
/// Composite class representing a REAL directory that can contain files and subdirectories.
/// Uses actual DirectoryInfo to perform real file system operations.
/// </summary>
public class Directory : FileSystemComponent
{
    private readonly DirectoryInfo _directoryInfo;
    private List<FileSystemComponent>? _children;

    public Directory(string directoryPath)
    {
        if (!System.IO.Directory.Exists(directoryPath))
        {
            throw new DirectoryNotFoundException($"Directory not found: {directoryPath}");
        }

        _directoryInfo = new DirectoryInfo(directoryPath);
    }

    public Directory(DirectoryInfo directoryInfo)
    {
        _directoryInfo = directoryInfo ?? throw new ArgumentNullException(nameof(directoryInfo));
    }

    public override string Name => _directoryInfo.Name;
    public override string Path => _directoryInfo.FullName;

    public override long GetSize()
    {
        long totalSize = 0;

        try
        {
            FileInfo[] files = _directoryInfo.GetFiles();
            foreach (FileInfo file in files)
            {
                totalSize += file.Length;
            }

            DirectoryInfo[] subdirectories = _directoryInfo.GetDirectories();
            foreach (DirectoryInfo subdir in subdirectories)
            {
                Directory subdirComponent = new Directory(subdir);
                totalSize += subdirComponent.GetSize();
            }
        }
        catch (UnauthorizedAccessException)
        {
            Console.WriteLine($"Access denied to directory: {Path}");
        }

        return totalSize;
    }

    public override async Task<long> GetSizeAsync()
    {
        return await Task.Run(() => GetSize());
    }

    public override void Display(int depth = 0)
    {
        string indent = new string(' ', depth * 2);
        long sizeBytes = GetSize();
        string sizeStr = FormatSize(sizeBytes);
        Console.WriteLine($"{indent}[DIR] {Name}/ ({sizeStr})");

        try
        {
            LoadChildren();

            if (_children != null)
            {
                foreach (FileSystemComponent child in _children)
                {
                    child.Display(depth + 1);
                }
            }
        }
        catch (UnauthorizedAccessException)
        {
            Console.WriteLine($"{indent}  [Access Denied]");
        }
    }

    public override bool IsDirectory() => true;

    public override async Task<bool> DeleteAsync()
    {
        try
        {
            await Task.Run(() => _directoryInfo.Delete(true)); // Recursive delete
            Console.WriteLine($"Deleted directory: {Path}");
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to delete {Path}: {ex.Message}");
            return false;
        }
    }

    public override async Task<bool> CopyToAsync(string destinationPath)
    {
        try
        {
            await Task.Run(() => CopyDirectory(_directoryInfo.FullName, destinationPath));
            Console.WriteLine($"Copied {Name} to {destinationPath}");
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to copy {Name}: {ex.Message}");
            return false;
        }
    }

    public override FileSystemComponent? Find(string name)
    {
        if (Name.Equals(name, StringComparison.OrdinalIgnoreCase))
        {
            return this;
        }

        LoadChildren();

        if (_children == null)
        {
            return null;
        }

        foreach (FileSystemComponent child in _children)
        {
            FileSystemComponent? found = child.Find(name);
            if (found != null)
            {
                return found;
            }
        }

        return null;
    }

    public override List<FileSystemComponent> GetAll()
    {
        List<FileSystemComponent> all = new List<FileSystemComponent> { this };

        LoadChildren();

        if (_children != null)
        {
            foreach (FileSystemComponent child in _children)
            {
                all.AddRange(child.GetAll());
            }
        }

        return all;
    }

    /// <summary>
    /// Gets count of all files recursively.
    /// </summary>
    public int GetFileCount()
    {
        return GetAll().Count(c => !c.IsDirectory());
    }

    /// <summary>
    /// Gets count of all subdirectories recursively.
    /// </summary>
    public int GetDirectoryCount()
    {
        return GetAll().Count(c => c.IsDirectory()) - 1; // Exclude self
    }

    /// <summary>
    /// Creates a new subdirectory.
    /// </summary>
    public async Task<Directory> CreateSubdirectoryAsync(string name)
    {
        string newPath = System.IO.Path.Combine(Path, name);
        await Task.Run(() => System.IO.Directory.CreateDirectory(newPath));
        Console.WriteLine($"Created subdirectory: {newPath}");
        _children = null; // Invalidate cache
        return new Directory(newPath);
    }

    /// <summary>
    /// Creates a new file in this directory.
    /// </summary>
    public async Task<File> CreateFileAsync(string fileName, string content = "")
    {
        string filePath = System.IO.Path.Combine(Path, fileName);
        await System.IO.File.WriteAllTextAsync(filePath, content);
        Console.WriteLine($"Created file: {filePath}");
        _children = null; // Invalidate cache
        return new File(filePath);
    }

    private void LoadChildren()
    {
        if (_children != null)
        {
            return;
        }

        _children = new List<FileSystemComponent>();

        try
        {
            FileInfo[] files = _directoryInfo.GetFiles();
            foreach (FileInfo fileInfo in files)
            {
                _children.Add(new File(fileInfo));
            }

            DirectoryInfo[] subdirectories = _directoryInfo.GetDirectories();
            foreach (DirectoryInfo subdirInfo in subdirectories)
            {
                _children.Add(new Directory(subdirInfo));
            }
        }
        catch (UnauthorizedAccessException)
        {
            // Access denied - leave children empty
        }
    }

    private void CopyDirectory(string sourcePath, string destinationPath)
    {
        DirectoryInfo sourceDir = new DirectoryInfo(sourcePath);

        if (!sourceDir.Exists)
        {
            throw new DirectoryNotFoundException($"Source directory not found: {sourcePath}");
        }

        System.IO.Directory.CreateDirectory(destinationPath);

        foreach (FileInfo file in sourceDir.GetFiles())
        {
            string targetFilePath = System.IO.Path.Combine(destinationPath, file.Name);
            file.CopyTo(targetFilePath, true);
        }

        foreach (DirectoryInfo subdir in sourceDir.GetDirectories())
        {
            string targetSubdirPath = System.IO.Path.Combine(destinationPath, subdir.Name);
            CopyDirectory(subdir.FullName, targetSubdirPath);
        }
    }

    private string FormatSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB" };
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
}
