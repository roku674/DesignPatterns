using System;

namespace Concurrency.StrategizedLocking;

/// <summary>
/// Demonstrates the StrategizedLocking pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== StrategizedLocking Pattern Demo ===\n");

        IStrategizedLocking pattern = new StrategizedLockingImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
