using System.Collections.Generic;

namespace Flyweight;

/// <summary>
/// Flyweight factory that manages and reuses CharacterStyle instances.
/// This is the core of the Flyweight pattern - ensures styles are shared, not duplicated.
/// </summary>
public class StyleFactory
{
    private readonly Dictionary<string, CharacterStyle> _stylesPool = new Dictionary<string, CharacterStyle>();
    private int _requestCount = 0;
    private int _cacheHits = 0;

    /// <summary>
    /// Gets or creates a CharacterStyle flyweight.
    /// Returns existing instance if style already exists (flyweight sharing).
    /// </summary>
    public CharacterStyle GetStyle(string fontFamily, int fontSize, string color, bool isBold = false, bool isItalic = false)
    {
        _requestCount++;

        string key = $"{fontFamily}_{fontSize}_{color}_{isBold}_{isItalic}";

        if (_stylesPool.ContainsKey(key))
        {
            _cacheHits++;
            Console.WriteLine($"[StyleFactory] Reusing existing style: {key} (Hit rate: {GetHitRate():F1}%)");
            return _stylesPool[key];
        }

        CharacterStyle newStyle = new CharacterStyle(fontFamily, fontSize, color, isBold, isItalic);
        _stylesPool[key] = newStyle;

        Console.WriteLine($"[StyleFactory] Created new style in pool (Total styles: {_stylesPool.Count})");

        return newStyle;
    }

    /// <summary>
    /// Gets count of unique styles in the pool.
    /// </summary>
    public int GetPoolSize()
    {
        return _stylesPool.Count;
    }

    /// <summary>
    /// Gets total memory used by flyweights in bytes.
    /// </summary>
    public int GetTotalMemoryUsage()
    {
        int totalBytes = 0;
        foreach (CharacterStyle style in _stylesPool.Values)
        {
            totalBytes += style.GetMemorySize();
        }
        return totalBytes;
    }

    /// <summary>
    /// Gets cache hit rate percentage.
    /// </summary>
    public double GetHitRate()
    {
        if (_requestCount == 0)
        {
            return 0;
        }
        return (_cacheHits / (double)_requestCount) * 100;
    }

    /// <summary>
    /// Gets statistics about flyweight usage.
    /// </summary>
    public FlyweightStats GetStats()
    {
        return new FlyweightStats
        {
            UniqueStyles = _stylesPool.Count,
            TotalRequests = _requestCount,
            CacheHits = _cacheHits,
            CacheMisses = _requestCount - _cacheHits,
            HitRate = GetHitRate(),
            MemoryUsed = GetTotalMemoryUsage()
        };
    }

    /// <summary>
    /// Clears the flyweight pool.
    /// </summary>
    public void Clear()
    {
        int count = _stylesPool.Count;
        _stylesPool.Clear();
        _requestCount = 0;
        _cacheHits = 0;
        Console.WriteLine($"[StyleFactory] Cleared pool ({count} styles removed)");
    }
}

public class FlyweightStats
{
    public int UniqueStyles { get; set; }
    public int TotalRequests { get; set; }
    public int CacheHits { get; set; }
    public int CacheMisses { get; set; }
    public double HitRate { get; set; }
    public int MemoryUsed { get; set; }
}
