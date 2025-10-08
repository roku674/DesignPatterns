using System;

namespace Concurrency.Proactor;

/// <summary>
/// Demonstrates the Proactor pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Proactor Pattern Demo ===\n");

        IProactor pattern = new ProactorImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
