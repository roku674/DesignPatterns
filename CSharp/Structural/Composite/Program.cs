using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Composite;

/// <summary>
/// Demonstrates REAL Composite pattern with actual file system operations.
/// Shows how to treat individual files and directories uniformly through a common interface.
/// </summary>
public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== REAL Composite Pattern Demo ===");
        Console.WriteLine("Production-Ready File System Operations\n");

        // Create a test directory structure
        string testPath = Path.Combine(Path.GetTempPath(), "CompositePatternTest");
        await CreateTestStructure(testPath);

        Console.WriteLine("--- Scenario 1: Display Directory Tree ---\n");
        Directory rootDir = new Directory(testPath);
        rootDir.Display();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 2: Calculate sizes
        Console.WriteLine("--- Scenario 2: Calculate Sizes ---\n");
        long totalSize = await rootDir.GetSizeAsync();
        Console.WriteLine($"Total size of {rootDir.Name}: {FormatBytes(totalSize)}");

        Directory? subdirDocs = rootDir.Find("Documents") as Directory;
        if (subdirDocs != null)
        {
            long docsSize = await subdirDocs.GetSizeAsync();
            Console.WriteLine($"Size of Documents folder: {FormatBytes(docsSize)}");
        }

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 3: Search operations
        Console.WriteLine("--- Scenario 3: Search Operations ---\n");
        string[] searchTerms = { "test1.txt", "Documents", "nonexistent.txt" };

        foreach (string term in searchTerms)
        {
            FileSystemComponent? found = rootDir.Find(term);
            if (found != null)
            {
                Console.WriteLine($"Found: {found.Name} ({(found.IsDirectory() ? "Directory" : "File")})");
                Console.WriteLine($"  Path: {found.Path}");
                Console.WriteLine($"  Size: {FormatBytes(found.GetSize())}");
            }
            else
            {
                Console.WriteLine($"Not found: {term}");
            }
            Console.WriteLine();
        }

        Console.WriteLine(new string('=', 70) + "\n");

        // Example 4: Statistics
        Console.WriteLine("--- Scenario 4: Directory Statistics ---\n");
        Console.WriteLine($"Total files: {rootDir.GetFileCount()}");
        Console.WriteLine($"Total subdirectories: {rootDir.GetDirectoryCount()}");

        List<FileSystemComponent> allComponents = rootDir.GetAll();
        Console.WriteLine($"Total components: {allComponents.Count}");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 5: Create new items
        Console.WriteLine("--- Scenario 5: Create New Items ---\n");
        Directory? images = rootDir.Find("Images") as Directory;
        if (images != null)
        {
            await images.CreateFileAsync("newphoto.jpg", "Simulated image data");
            await images.CreateSubdirectoryAsync("Vacation2024");
        }

        Console.WriteLine("\nUpdated structure:");
        if (images != null)
        {
            images.Display();
        }

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 6: Copy operations
        Console.WriteLine("--- Scenario 6: Copy Operations ---\n");
        string copyDestination = Path.Combine(Path.GetTempPath(), "CompositePatternTestCopy");

        if (System.IO.Directory.Exists(copyDestination))
        {
            System.IO.Directory.Delete(copyDestination, true);
        }

        bool copySuccess = await rootDir.CopyToAsync(copyDestination);
        if (copySuccess)
        {
            Console.WriteLine($"\nVerifying copy:");
            Directory copiedDir = new Directory(copyDestination);
            Console.WriteLine($"Original size: {FormatBytes(await rootDir.GetSizeAsync())}");
            Console.WriteLine($"Copied size: {FormatBytes(await copiedDir.GetSizeAsync())}");
            Console.WriteLine($"Copy verified: {await rootDir.GetSizeAsync() == await copiedDir.GetSizeAsync()}");
        }

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 7: Polymorphic treatment
        Console.WriteLine("--- Scenario 7: Polymorphic Treatment ---\n");
        Console.WriteLine("Treating files and directories uniformly:\n");

        FileSystemComponent[] components = new FileSystemComponent[3];
        components[0] = rootDir;
        components[1] = subdirDocs ?? rootDir;
        components[2] = rootDir.Find("test1.txt") ?? rootDir;

        foreach (FileSystemComponent component in components)
        {
            Console.WriteLine($"Component: {component.Name}");
            Console.WriteLine($"  Type: {(component.IsDirectory() ? "Directory" : "File")}");
            Console.WriteLine($"  Size: {FormatBytes(component.GetSize())}");
            Console.WriteLine($"  Path: {component.Path}");
            Console.WriteLine();
        }

        Console.WriteLine(new string('=', 70) + "\n");

        // Example 8: Working with actual system directories
        Console.WriteLine("--- Scenario 8: Working with Real System Directories ---\n");
        string currentDirectory = System.IO.Directory.GetCurrentDirectory();
        Console.WriteLine($"Analyzing current directory: {currentDirectory}\n");

        try
        {
            Directory currentDir = new Directory(currentDirectory);
            Console.WriteLine($"Directory: {currentDir.Name}");
            Console.WriteLine($"Total size: {FormatBytes(await currentDir.GetSizeAsync())}");
            Console.WriteLine($"File count: {currentDir.GetFileCount()}");
            Console.WriteLine($"Subdirectory count: {currentDir.GetDirectoryCount()}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }

        // Cleanup
        Console.WriteLine("\n" + new string('=', 70) + "\n");
        Console.WriteLine("--- Cleanup ---\n");
        Console.WriteLine("Deleting test directories...");

        try
        {
            if (System.IO.Directory.Exists(testPath))
            {
                System.IO.Directory.Delete(testPath, true);
                Console.WriteLine($"Deleted: {testPath}");
            }

            if (System.IO.Directory.Exists(copyDestination))
            {
                System.IO.Directory.Delete(copyDestination, true);
                Console.WriteLine($"Deleted: {copyDestination}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Cleanup error: {ex.Message}");
        }

        Console.WriteLine("\n" + new string('=', 70));
        Console.WriteLine("\nComposite pattern provides:");
        Console.WriteLine("  ✓ Uniform treatment of individual objects and compositions");
        Console.WriteLine("  ✓ Recursive operations on tree structures");
        Console.WriteLine("  ✓ Easy addition of new component types");
        Console.WriteLine("  ✓ Simplified client code");
        Console.WriteLine("  ✓ Natural representation of hierarchical structures");
    }

    /// <summary>
    /// Creates a test directory structure with real files.
    /// </summary>
    private static async Task CreateTestStructure(string rootPath)
    {
        if (System.IO.Directory.Exists(rootPath))
        {
            System.IO.Directory.Delete(rootPath, true);
        }

        System.IO.Directory.CreateDirectory(rootPath);

        // Create root files
        await System.IO.File.WriteAllTextAsync(Path.Combine(rootPath, "test1.txt"), "Root level test file 1");
        await System.IO.File.WriteAllTextAsync(Path.Combine(rootPath, "test2.txt"), "Root level test file 2");

        // Create Documents folder
        string docsPath = Path.Combine(rootPath, "Documents");
        System.IO.Directory.CreateDirectory(docsPath);
        await System.IO.File.WriteAllTextAsync(Path.Combine(docsPath, "document1.txt"), "Document 1 content");
        await System.IO.File.WriteAllTextAsync(Path.Combine(docsPath, "document2.txt"), "Document 2 content");

        // Create Work subfolder
        string workPath = Path.Combine(docsPath, "Work");
        System.IO.Directory.CreateDirectory(workPath);
        await System.IO.File.WriteAllTextAsync(Path.Combine(workPath, "report.txt"), "Work report content");
        await System.IO.File.WriteAllTextAsync(Path.Combine(workPath, "notes.txt"), "Work notes content");

        // Create Images folder
        string imagesPath = Path.Combine(rootPath, "Images");
        System.IO.Directory.CreateDirectory(imagesPath);
        await System.IO.File.WriteAllTextAsync(Path.Combine(imagesPath, "photo1.jpg"), "Simulated photo data 1");
        await System.IO.File.WriteAllTextAsync(Path.Combine(imagesPath, "photo2.jpg"), "Simulated photo data 2");

        Console.WriteLine($"Created test structure at: {rootPath}\n");
    }

    private static string FormatBytes(long bytes)
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
