namespace Composite;

/// <summary>
/// Demonstrates the Composite pattern with a file system example.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Composite Pattern Demo ===");
        Console.WriteLine("File System Hierarchy\n");

        // Create root directory
        Directory root = new Directory("Root");

        // Create subdirectories
        Directory documents = new Directory("Documents");
        Directory pictures = new Directory("Pictures");
        Directory music = new Directory("Music");

        // Create files in Documents
        documents.Add(new File("Resume.pdf", 250));
        documents.Add(new File("CoverLetter.docx", 180));

        // Create work subdirectory under Documents
        Directory work = new Directory("Work");
        work.Add(new File("Project.xlsx", 420));
        work.Add(new File("Presentation.pptx", 1200));
        work.Add(new File("Notes.txt", 15));
        documents.Add(work);

        // Create files in Pictures
        pictures.Add(new File("Vacation.jpg", 2500));
        pictures.Add(new File("Family.png", 3200));

        // Create subdirectory under Pictures
        Directory screenshots = new Directory("Screenshots");
        screenshots.Add(new File("Screenshot1.png", 450));
        screenshots.Add(new File("Screenshot2.png", 380));
        pictures.Add(screenshots);

        // Create files in Music
        music.Add(new File("Song1.mp3", 4500));
        music.Add(new File("Song2.mp3", 5200));
        music.Add(new File("Playlist.m3u", 2));

        // Add all to root
        root.Add(documents);
        root.Add(pictures);
        root.Add(music);

        // Add some files directly to root
        root.Add(new File("README.txt", 5));
        root.Add(new File("Config.json", 8));

        // Display entire file system
        Console.WriteLine("--- Complete File System Structure ---\n");
        root.Display();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Demonstrate treating individual objects and compositions uniformly
        Console.WriteLine("--- Treating Files and Directories Uniformly ---\n");

        FileSystemComponent[] components = { documents, work, new File("SingleFile.txt", 100) };

        foreach (FileSystemComponent component in components)
        {
            Console.WriteLine($"Component: {component.GetName()}");
            Console.WriteLine($"  Size: {component.GetSize()} KB");
            Console.WriteLine($"  Is Composite: {component.IsComposite()}");
            Console.WriteLine();
        }

        Console.WriteLine(new string('=', 60) + "\n");

        // Search functionality
        Console.WriteLine("--- Searching for Components ---\n");

        string[] searchTerms = { "Work", "Song1.mp3", "NonExistent" };

        foreach (string term in searchTerms)
        {
            FileSystemComponent? found = root.Find(term);
            if (found != null)
            {
                Console.WriteLine($"Found: {found.GetName()} ({found.GetSize()} KB)");
            }
            else
            {
                Console.WriteLine($"Not found: {term}");
            }
        }

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Statistics
        Console.WriteLine("--- File System Statistics ---\n");
        Console.WriteLine($"Total size of root directory: {root.GetSize()} KB");
        Console.WriteLine($"Size of Documents folder: {documents.GetSize()} KB");
        Console.WriteLine($"Size of Pictures folder: {pictures.GetSize()} KB");
        Console.WriteLine($"Size of Music folder: {music.GetSize()} KB");
    }
}
