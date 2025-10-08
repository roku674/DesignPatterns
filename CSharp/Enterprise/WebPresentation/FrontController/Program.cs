using System;

namespace Enterprise.WebPresentation.FrontController;

/// <summary>
/// Demonstrates the FrontController pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== FrontController Pattern Demo ===\n");

        IFrontController pattern = new FrontControllerImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
