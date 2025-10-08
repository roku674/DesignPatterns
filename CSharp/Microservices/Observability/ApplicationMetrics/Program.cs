using System;

namespace Microservices.Observability.ApplicationMetrics;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ApplicationMetrics Pattern Demo ===\n");
        IApplicationMetrics pattern = new ApplicationMetricsImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
