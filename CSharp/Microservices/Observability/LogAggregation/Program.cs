using System;

namespace Microservices.Observability.LogAggregation;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== LogAggregation Pattern Demo ===\n");
        ILogAggregation pattern = new LogAggregationImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
