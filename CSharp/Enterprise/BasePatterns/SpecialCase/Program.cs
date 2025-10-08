using System;

namespace Enterprise.BasePatterns.SpecialCase;

/// <summary>
/// Demonstrates the SpecialCase pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== SpecialCase Pattern Demo ===\n");

        ISpecialCase pattern = new SpecialCaseImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
