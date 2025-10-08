using System;

namespace Concurrency.HalfSyncHalfAsync;

/// <summary>
/// Demonstrates the HalfSyncHalfAsync pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== HalfSyncHalfAsync Pattern Demo ===\n");

        IHalfSyncHalfAsync pattern = new HalfSyncHalfAsyncImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
