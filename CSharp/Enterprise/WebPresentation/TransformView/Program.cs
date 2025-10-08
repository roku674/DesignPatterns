using System;

namespace Enterprise.WebPresentation.TransformView;

/// <summary>
/// Demonstrates the TransformView pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== TransformView Pattern Demo ===\n");

        ITransformView pattern = new TransformViewImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
