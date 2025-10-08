using System;

namespace Enterprise.ObjectRelational.EmbeddedValue;

/// <summary>
/// Demonstrates the EmbeddedValue pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== EmbeddedValue Pattern Demo ===\n");

        IEmbeddedValue pattern = new EmbeddedValueImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
