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

        IActiveObject pattern = new ActiveObjectImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
