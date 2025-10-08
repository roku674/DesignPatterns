using System;

namespace Cloud.HealthEndpointMonitoring;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== HealthEndpointMonitoring Pattern Demo ===\n");
        IHealthEndpointMonitoring pattern = new HealthEndpointMonitoringImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
