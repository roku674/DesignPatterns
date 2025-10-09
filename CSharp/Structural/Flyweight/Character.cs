namespace Flyweight;

/// <summary>
/// Context class that uses flyweights.
/// Contains both intrinsic (shared via flyweight) and extrinsic (unique) state.
/// </summary>
public class Character
{
    // Extrinsic state (unique to this character instance)
    public char Value { get; }
    public int X { get; }
    public int Y { get; }

    // Intrinsic state (shared via flyweight reference)
    private readonly CharacterStyle _style;

    public Character(char value, int x, int y, CharacterStyle style)
    {
        Value = value;
        X = x;
        Y = y;
        _style = style ?? throw new ArgumentNullException(nameof(style));
    }

    /// <summary>
    /// Renders this character using its flyweight style.
    /// </summary>
    public void Render()
    {
        _style.Render(Value, X, Y);
    }

    /// <summary>
    /// Gets memory usage (only extrinsic state + reference).
    /// Intrinsic state is shared, so not counted per-character.
    /// </summary>
    public int GetMemorySize()
    {
        // char (2 bytes) + int (4) + int (4) + reference (8) = 18 bytes
        return 18;
    }
}
