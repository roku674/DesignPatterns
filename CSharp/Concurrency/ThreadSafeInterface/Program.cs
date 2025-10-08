using System;

namespace Concurrency.ThreadSafeInterface;

/// <summary>
/// Demonstrates the ThreadSafeInterface pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ThreadSafeInterface Pattern Demo ===\n");

        IThreadSafeInterface pattern = new ThreadSafeInterfaceImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
