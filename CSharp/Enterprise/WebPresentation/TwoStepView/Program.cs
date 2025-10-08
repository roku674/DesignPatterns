using System;

namespace Enterprise.WebPresentation.TwoStepView;

/// <summary>
/// Demonstrates the TwoStepView pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== TwoStepView Pattern Demo ===\n");

        ITwoStepView pattern = new TwoStepViewImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
