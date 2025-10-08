using System;

namespace Concurrency.DoubleCheckedLockingOptimization;

/// <summary>
/// Demonstrates the DoubleCheckedLockingOptimization pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DoubleCheckedLockingOptimization Pattern Demo ===\n");

        IDoubleCheckedLockingOptimization pattern = new DoubleCheckedLockingOptimizationImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
