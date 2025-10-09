using System.Collections.Generic;

namespace Flyweight;

/// <summary>
/// Document that contains many characters, demonstrating memory savings from Flyweight pattern.
/// </summary>
public class Document
{
    private readonly List<Character> _characters = new List<Character>();
    private readonly StyleFactory _styleFactory;

    public Document(StyleFactory styleFactory)
    {
        _styleFactory = styleFactory ?? throw new ArgumentNullException(nameof(styleFactory));
    }

    /// <summary>
    /// Adds a character with specific style to the document.
    /// The style is obtained from the factory (shared flyweight).
    /// </summary>
    public void AddCharacter(char c, int x, int y, string fontFamily, int fontSize, string color, bool isBold = false, bool isItalic = false)
    {
        CharacterStyle style = _styleFactory.GetStyle(fontFamily, fontSize, color, isBold, isItalic);
        Character character = new Character(c, x, y, style);
        _characters.Add(character);
    }

    /// <summary>
    /// Renders all characters in the document.
    /// </summary>
    public void Render()
    {
        Console.WriteLine($"\n--- Rendering Document ({_characters.Count} characters) ---");
        foreach (Character character in _characters)
        {
            character.Render();
        }
    }

    /// <summary>
    /// Gets total character count.
    /// </summary>
    public int GetCharacterCount()
    {
        return _characters.Count;
    }

    /// <summary>
    /// Calculates memory usage with flyweight pattern.
    /// </summary>
    public int GetMemoryUsage()
    {
        int characterMemory = 0;
        foreach (Character character in _characters)
        {
            characterMemory += character.GetMemorySize();
        }

        int styleMemory = _styleFactory.GetTotalMemoryUsage();

        return characterMemory + styleMemory;
    }

    /// <summary>
    /// Calculates what memory usage would be WITHOUT flyweight pattern.
    /// (if each character had its own style copy)
    /// </summary>
    public int GetMemoryUsageWithoutFlyweight()
    {
        // Assume each character would need ~50 bytes for its own style
        return _characters.Count * (18 + 50);
    }

    /// <summary>
    /// Gets document statistics.
    /// </summary>
    public DocumentStats GetStats()
    {
        int memoryWith = GetMemoryUsage();
        int memoryWithout = GetMemoryUsageWithoutFlyweight();
        double savings = ((memoryWithout - memoryWith) / (double)memoryWithout) * 100;

        return new DocumentStats
        {
            CharacterCount = _characters.Count,
            UniqueStyles = _styleFactory.GetPoolSize(),
            MemoryWithFlyweight = memoryWith,
            MemoryWithoutFlyweight = memoryWithout,
            MemorySavings = memoryWithout - memoryWith,
            SavingsPercentage = savings
        };
    }
}

public class DocumentStats
{
    public int CharacterCount { get; set; }
    public int UniqueStyles { get; set; }
    public int MemoryWithFlyweight { get; set; }
    public int MemoryWithoutFlyweight { get; set; }
    public int MemorySavings { get; set; }
    public double SavingsPercentage { get; set; }
}
