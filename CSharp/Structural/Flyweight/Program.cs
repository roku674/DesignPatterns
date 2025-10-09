using System;

namespace Flyweight;

/// <summary>
/// Demonstrates REAL Flyweight pattern with object pooling and memory optimization.
/// Shows how to minimize memory usage by sharing common state among many objects.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== REAL Flyweight Pattern Demo ===");
        Console.WriteLine("Production-Ready Character Rendering with Memory Optimization\n");

        StyleFactory factory = new StyleFactory();

        // Example 1: Simple document with repeated styles
        Console.WriteLine("--- Scenario 1: Simple Document ---\n");
        Document doc1 = new Document(factory);

        string text1 = "Hello World!";
        int xPos = 0;

        foreach (char c in text1)
        {
            doc1.AddCharacter(c, xPos, 0, "Arial", 12, "Black");
            xPos += 10;
        }

        doc1.Render();

        DocumentStats stats1 = doc1.GetStats();
        Console.WriteLine($"\nDocument Stats:");
        Console.WriteLine($"  Characters: {stats1.CharacterCount}");
        Console.WriteLine($"  Unique Styles: {stats1.UniqueStyles}");
        Console.WriteLine($"  Memory (with Flyweight): {stats1.MemoryWithFlyweight} bytes");
        Console.WriteLine($"  Memory (without Flyweight): {stats1.MemoryWithoutFlyweight} bytes");
        Console.WriteLine($"  Memory Savings: {stats1.MemorySavings} bytes ({stats1.SavingsPercentage:F1}%)");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 2: Large document with multiple styles
        Console.WriteLine("--- Scenario 2: Large Document with Multiple Styles ---\n");

        factory.Clear();
        Document doc2 = new Document(factory);

        // Add 1000 characters with various styles
        string sampleText = "The quick brown fox jumps over the lazy dog. ";
        int y = 0;

        for (int i = 0; i < 20; i++)
        {
            xPos = 0;
            foreach (char c in sampleText)
            {
                // Vary styles but reuse many
                string font = i % 3 == 0 ? "Arial" : (i % 3 == 1 ? "Times" : "Courier");
                int size = i % 2 == 0 ? 12 : 14;
                string color = i % 4 == 0 ? "Black" : (i % 4 == 1 ? "Blue" : (i % 4 == 2 ? "Red" : "Green"));
                bool bold = i % 5 == 0;
                bool italic = i % 7 == 0;

                doc2.AddCharacter(c, xPos, y, font, size, color, bold, italic);
                xPos += 10;
            }
            y += 20;
        }

        Console.WriteLine($"\nCreated document with {doc2.GetCharacterCount()} characters\n");

        FlyweightStats factoryStats = factory.GetStats();
        Console.WriteLine($"Flyweight Factory Stats:");
        Console.WriteLine($"  Unique Styles Created: {factoryStats.UniqueStyles}");
        Console.WriteLine($"  Total Style Requests: {factoryStats.TotalRequests}");
        Console.WriteLine($"  Cache Hits: {factoryStats.CacheHits}");
        Console.WriteLine($"  Cache Misses: {factoryStats.CacheMisses}");
        Console.WriteLine($"  Hit Rate: {factoryStats.HitRate:F1}%");
        Console.WriteLine($"  Memory Used by Styles: {factoryStats.MemoryUsed} bytes");

        DocumentStats stats2 = doc2.GetStats();
        Console.WriteLine($"\nDocument Memory Analysis:");
        Console.WriteLine($"  Memory with Flyweight: {stats2.MemoryWithFlyweight} bytes");
        Console.WriteLine($"  Memory without Flyweight: {stats2.MemoryWithoutFlyweight} bytes");
        Console.WriteLine($"  Savings: {stats2.MemorySavings} bytes ({stats2.SavingsPercentage:F1}%)");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 3: Demonstrate memory efficiency
        Console.WriteLine("--- Scenario 3: Memory Efficiency Comparison ---\n");

        factory.Clear();
        Document largeDoc = new Document(factory);

        // Create a very large document (10,000 characters) with limited styles
        Console.WriteLine("Creating document with 10,000 characters using only 5 different styles...\n");

        string[] styles = { "Arial_12_Black", "Arial_12_Bold", "Times_14_Blue", "Courier_10_Green", "Arial_16_Red" };

        for (int i = 0; i < 10000; i++)
        {
            int styleIndex = i % 5;
            char c = (char)('A' + (i % 26));
            int x = (i % 100) * 10;
            int yCoord = (i / 100) * 20;

            bool bold = styleIndex == 1;
            string font = styleIndex == 2 ? "Times" : (styleIndex == 3 ? "Courier" : "Arial");
            int fontSize = styleIndex == 2 ? 14 : (styleIndex == 3 ? 10 : (styleIndex == 4 ? 16 : 12));
            string color = styleIndex == 2 ? "Blue" : (styleIndex == 3 ? "Green" : (styleIndex == 4 ? "Red" : "Black"));

            largeDoc.AddCharacter(c, x, yCoord, font, fontSize, color, bold);
        }

        DocumentStats stats3 = largeDoc.GetStats();
        FlyweightStats factoryStats3 = factory.GetStats();

        Console.WriteLine($"Large Document Results:");
        Console.WriteLine($"  Total Characters: {stats3.CharacterCount:N0}");
        Console.WriteLine($"  Unique Styles: {stats3.UniqueStyles}");
        Console.WriteLine($"  Style Reuse Rate: {factoryStats3.HitRate:F2}%");
        Console.WriteLine($"\nMemory Comparison:");
        Console.WriteLine($"  WITH Flyweight:    {stats3.MemoryWithFlyweight:N0} bytes ({stats3.MemoryWithFlyweight / 1024.0:F2} KB)");
        Console.WriteLine($"  WITHOUT Flyweight: {stats3.MemoryWithoutFlyweight:N0} bytes ({stats3.MemoryWithoutFlyweight / 1024.0:F2} KB)");
        Console.WriteLine($"  Memory Saved:      {stats3.MemorySavings:N0} bytes ({stats3.MemorySavings / 1024.0:F2} KB)");
        Console.WriteLine($"  Reduction:         {stats3.SavingsPercentage:F1}%");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 4: Show actual object sharing
        Console.WriteLine("--- Scenario 4: Object Sharing Verification ---\n");

        factory.Clear();

        CharacterStyle style1 = factory.GetStyle("Arial", 12, "Black");
        CharacterStyle style2 = factory.GetStyle("Arial", 12, "Black");
        CharacterStyle style3 = factory.GetStyle("Arial", 14, "Black");

        Console.WriteLine($"\nObject Reference Comparison:");
        Console.WriteLine($"  style1 == style2: {ReferenceEquals(style1, style2)} (Same style parameters)");
        Console.WriteLine($"  style1 == style3: {ReferenceEquals(style1, style3)} (Different size)");
        Console.WriteLine($"\nThis proves that identical styles share the SAME object instance!");

        Console.WriteLine("\n" + new string('=', 70));
        Console.WriteLine("\nFlyweight pattern provides:");
        Console.WriteLine("  ✓ Significant memory savings (70%+ reduction)");
        Console.WriteLine("  ✓ Shared intrinsic state across many objects");
        Console.WriteLine("  ✓ Efficient handling of large numbers of objects");
        Console.WriteLine("  ✓ Transparent object sharing");
        Console.WriteLine("  ✓ Reduced memory allocation overhead");
        Console.WriteLine("  ✓ Better cache locality and performance");
    }
}
