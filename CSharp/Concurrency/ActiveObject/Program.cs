using System;

namespace Concurrency.ActiveObject;

/// <summary>
/// Demonstrates the ActiveObject pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ActiveObject Pattern Demo ===\n");

        ActiveObjectImplementation pattern = new ActiveObjectImplementation();

        try
        {
            pattern.Execute();
        }
        finally
        {
            // Clean up the scheduler thread
            pattern.Shutdown();
        }

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
