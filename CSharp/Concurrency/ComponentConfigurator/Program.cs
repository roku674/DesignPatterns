using System;

namespace Concurrency.ComponentConfigurator;

/// <summary>
/// Demonstrates the ComponentConfigurator pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ComponentConfigurator Pattern Demo ===\n");

        IComponentConfigurator pattern = new ComponentConfiguratorImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
