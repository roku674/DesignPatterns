using System;

namespace Enterprise.BasePatterns.Registry;

/// <summary>
/// Demonstrates the Registry pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Registry Pattern Demo ===\n");

        IRegistry pattern = new RegistryImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
