using System;

namespace Enterprise.Concurrency.CoarseGrainedLock;

/// <summary>
/// Demonstrates the CoarseGrainedLock pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== CoarseGrainedLock Pattern Demo ===\n");

        ICoarseGrainedLock pattern = new CoarseGrainedLockImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
