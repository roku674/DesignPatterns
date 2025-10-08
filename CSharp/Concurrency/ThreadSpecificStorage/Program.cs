using System;

namespace Concurrency.ThreadSpecificStorage;

/// <summary>
/// Demonstrates the ThreadSpecificStorage pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ThreadSpecificStorage Pattern Demo ===\n");

        IThreadSpecificStorage pattern = new ThreadSpecificStorageImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
