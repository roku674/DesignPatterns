using System;

namespace Enterprise.ObjectRelational.InheritanceMappers;

/// <summary>
/// Demonstrates the InheritanceMappers pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== InheritanceMappers Pattern Demo ===\n");

        IInheritanceMappers pattern = new InheritanceMappersImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
