using System;

namespace Enterprise.BasePatterns.Mapper;

/// <summary>
/// Demonstrates the Mapper pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Mapper Pattern Demo ===\n");

        IMapper pattern = new MapperImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
