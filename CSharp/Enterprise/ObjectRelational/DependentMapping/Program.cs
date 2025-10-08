using System;

namespace Enterprise.ObjectRelational.DependentMapping;

/// <summary>
/// Demonstrates the DependentMapping pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DependentMapping Pattern Demo ===\n");

        IDependentMapping pattern = new DependentMappingImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
