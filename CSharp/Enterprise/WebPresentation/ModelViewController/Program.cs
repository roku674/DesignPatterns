using System;

namespace Enterprise.WebPresentation.ModelViewController;

/// <summary>
/// Demonstrates the ModelViewController pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ModelViewController Pattern Demo ===\n");

        IModelViewController pattern = new ModelViewControllerImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
