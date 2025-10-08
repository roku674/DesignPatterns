using System;

namespace Enterprise.BasePatterns.LayerSupertype;

/// <summary>
/// Demonstrates the LayerSupertype pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== LayerSupertype Pattern Demo ===\n");

        ILayerSupertype pattern = new LayerSupertypeImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
