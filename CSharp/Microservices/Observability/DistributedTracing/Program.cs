using System;

namespace Microservices.Observability.DistributedTracing;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DistributedTracing Pattern Demo ===\n");
        IDistributedTracing pattern = new DistributedTracingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
