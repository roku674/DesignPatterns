using System;

namespace Concurrency.Reactor;

/// <summary>
/// Demonstrates the Reactor pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Reactor Pattern Demo ===\n");

        IReactor pattern = new ReactorImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
