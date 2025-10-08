using System;

namespace Enterprise.Concurrency.OptimisticOfflineLock;

/// <summary>
/// Demonstrates the OptimisticOfflineLock pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== OptimisticOfflineLock Pattern Demo ===\n");

        IOptimisticOfflineLock pattern = new OptimisticOfflineLockImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
