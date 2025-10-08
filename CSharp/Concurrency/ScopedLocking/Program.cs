using System;

namespace Concurrency.ScopedLocking;

/// <summary>
/// Demonstrates the ScopedLocking pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ScopedLocking Pattern Demo ===\n");

        IScopedLocking pattern = new ScopedLockingImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
