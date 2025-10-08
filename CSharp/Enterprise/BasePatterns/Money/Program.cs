using System;

namespace Enterprise.BasePatterns.Money;

/// <summary>
/// Demonstrates the Money pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Money Pattern Demo ===\n");

        IMoney pattern = new MoneyImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
