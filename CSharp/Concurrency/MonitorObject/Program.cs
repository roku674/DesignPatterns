using System;

namespace Concurrency.MonitorObject;

/// <summary>
/// Demonstrates the MonitorObject pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MonitorObject Pattern Demo ===\n");

        IMonitorObject pattern = new MonitorObjectImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
