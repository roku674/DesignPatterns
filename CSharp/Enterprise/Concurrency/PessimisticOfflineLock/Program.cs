using System;

namespace Enterprise.Concurrency.PessimisticOfflineLock;

/// <summary>
/// Demonstrates the PessimisticOfflineLock pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== PessimisticOfflineLock Pattern Demo ===\n");

        IPessimisticOfflineLock pattern = new PessimisticOfflineLockImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
