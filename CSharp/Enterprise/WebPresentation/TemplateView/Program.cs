using System;

namespace Enterprise.WebPresentation.TemplateView;

/// <summary>
/// Demonstrates the TemplateView pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== TemplateView Pattern Demo ===\n");

        ITemplateView pattern = new TemplateViewImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
