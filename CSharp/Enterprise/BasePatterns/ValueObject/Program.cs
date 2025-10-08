using System;

namespace Enterprise.BasePatterns.ValueObject;

/// <summary>
/// Demonstrates the ValueObject pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ValueObject Pattern Demo ===\n");

        IValueObject pattern = new ValueObjectImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
