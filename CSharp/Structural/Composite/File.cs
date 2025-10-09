using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Composite;

/// <summary>
/// Leaf class representing a REAL file in the file system.
/// Files cannot have children and represent actual FileInfo objects.
/// </summary>
public class File : FileSystemComponent
{
    private readonly FileInfo _fileInfo;

    public File(string filePath)
    {
        if (!System.IO.File.Exists(filePath))
        {
            throw new FileNotFoundException($"File not found: {filePath}");
        }

        _fileInfo = new FileInfo(filePath);
    }

    public File(FileInfo fileInfo)
    {
        _fileInfo = fileInfo ?? throw new ArgumentNullException(nameof(fileInfo));
    }

    public override string Name => _fileInfo.Name;
    public override string Path => _fileInfo.FullName;

    public override long GetSize()
    {
        _fileInfo.Refresh();
        return _fileInfo.Length;
    }

    public override Task<long> GetSizeAsync()
    {
        return Task.FromResult(GetSize());
    }

    public override void Display(int depth = 0)
    {
        string indent = new string(' ', depth * 2);
        long sizeBytes = GetSize();
        string sizeStr = FormatSize(sizeBytes);
        Console.WriteLine($"{indent}[FILE] {Name} ({sizeStr})");
    }

    public override bool IsDirectory() => false;

    public override async Task<bool> DeleteAsync()
    {
        try
        {
            await Task.Run(() => _fileInfo.Delete());
            Console.WriteLine($"Deleted file: {Path}");
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
            await Task.Run(() => _fileInfo.CopyTo(destinationPath, true));
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
        return Name.Equals(name, StringComparison.OrdinalIgnoreCase) ? this : null;
    }

    public override List<FileSystemComponent> GetAll()
    {
        return new List<FileSystemComponent> { this };
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
