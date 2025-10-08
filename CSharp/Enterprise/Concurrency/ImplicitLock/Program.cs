using System;

namespace Enterprise.Concurrency.ImplicitLock;

/// <summary>
/// Demonstrates the ImplicitLock pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ImplicitLock Pattern Demo ===\n");

        IImplicitLock pattern = new ImplicitLockImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
