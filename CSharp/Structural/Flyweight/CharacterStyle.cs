namespace Flyweight;

/// <summary>
/// Flyweight interface - represents shared intrinsic state.
/// Intrinsic state is independent of context and can be shared.
/// </summary>
public class CharacterStyle
{
    // Intrinsic state (shared)
    public string FontFamily { get; }
    public int FontSize { get; }
    public string Color { get; }
    public bool IsBold { get; }
    public bool IsItalic { get; }

    public CharacterStyle(string fontFamily, int fontSize, string color, bool isBold, bool isItalic)
    {
        FontFamily = fontFamily;
        FontSize = fontSize;
        Color = color;
        IsBold = isBold;
        IsItalic = isItalic;

        Console.WriteLine($"[Flyweight] Created new CharacterStyle: {GetStyleKey()}");
    }

    /// <summary>
    /// Renders a character with this style at a specific position.
    /// Position is extrinsic state (not shared).
    /// </summary>
    public void Render(char character, int x, int y)
    {
        string bold = IsBold ? "B" : "";
        string italic = IsItalic ? "I" : "";
        string style = string.IsNullOrEmpty(bold + italic) ? "" : $"[{bold}{italic}]";

        Console.WriteLine($"  Rendering '{character}' at ({x},{y}) - {FontFamily} {FontSize}pt {Color} {style}");
    }

    public string GetStyleKey()
    {
        return $"{FontFamily}_{FontSize}_{Color}_{IsBold}_{IsItalic}";
    }

    /// <summary>
    /// Calculates approximate memory size of this flyweight.
    /// </summary>
    public int GetMemorySize()
    {
        // Rough estimation: strings + primitives
        return FontFamily.Length * 2 + 4 + Color.Length * 2 + 2; // bytes
    }
}
