using System;

namespace Enterprise.ObjectRelational.ForeignKeyMapping;

/// <summary>
/// Demonstrates the ForeignKeyMapping pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ForeignKeyMapping Pattern Demo ===\n");

        IForeignKeyMapping pattern = new ForeignKeyMappingImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
