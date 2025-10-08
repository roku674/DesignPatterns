using System;

namespace Enterprise.BasePatterns.SeparatedInterface;

/// <summary>
/// Demonstrates the SeparatedInterface pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== SeparatedInterface Pattern Demo ===\n");

        ISeparatedInterface pattern = new SeparatedInterfaceImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
