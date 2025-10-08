using System;

namespace Enterprise.WebPresentation.ApplicationController;

/// <summary>
/// Demonstrates the ApplicationController pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ApplicationController Pattern Demo ===\n");

        IApplicationController pattern = new ApplicationControllerImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
