using System;

namespace Microservices.Observability.HealthCheckAPI;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== HealthCheckAPI Pattern Demo ===\n");
        IHealthCheckAPI pattern = new HealthCheckAPIImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
