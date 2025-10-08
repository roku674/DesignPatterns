namespace Prototype;

/// <summary>
/// Another concrete prototype example representing a document.
/// Useful for scenarios where you need to create similar documents with slight modifications.
/// </summary>
public class Document : IPrototype<Document>
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public List<string> Tags { get; set; } = new List<string>();
    public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();

    public Document()
    {
        CreatedDate = DateTime.Now;
    }

    /// <summary>
    /// Copy constructor for deep cloning.
    /// </summary>
    private Document(Document source)
    {
        Title = source.Title;
        Content = source.Content;
        Author = source.Author;
        CreatedDate = DateTime.Now; // New creation date for the clone

        // Deep copy of collections
        Tags = new List<string>(source.Tags);
        Metadata = new Dictionary<string, string>(source.Metadata);
    }

    /// <summary>
    /// Creates a deep copy of the document.
    /// </summary>
    public Document Clone()
    {
        return new Document(this);
    }

    public void DisplayInfo()
    {
        Console.WriteLine($"\nDocument Information:");
        Console.WriteLine($"Title: {Title}");
        Console.WriteLine($"Author: {Author}");
        Console.WriteLine($"Created: {CreatedDate:yyyy-MM-dd HH:mm:ss}");
        Console.WriteLine($"Content Preview: {(Content.Length > 50 ? Content.Substring(0, 50) + "..." : Content)}");
        Console.WriteLine($"Tags: {string.Join(", ", Tags)}");
        Console.WriteLine($"Metadata Entries: {Metadata.Count}");
        Console.WriteLine($"Object Hash Code: {GetHashCode()}");
    }
}
