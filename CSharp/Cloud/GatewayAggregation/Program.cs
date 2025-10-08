using System;

namespace Cloud.GatewayAggregation;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== GatewayAggregation Pattern Demo ===\n");
        IGatewayAggregation pattern = new GatewayAggregationImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
