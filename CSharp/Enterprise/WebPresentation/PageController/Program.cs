using System;

namespace Enterprise.WebPresentation.PageController;

/// <summary>
/// Demonstrates the PageController pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== PageController Pattern Demo ===\n");

        IPageController pattern = new PageControllerImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
