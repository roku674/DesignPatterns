using System;

namespace Integration.Routing.Aggregator;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Aggregator Pattern Demo ===\n");
        IAggregator pattern = new AggregatorImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
