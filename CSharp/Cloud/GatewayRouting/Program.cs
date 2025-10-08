using System;

namespace Cloud.GatewayRouting;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== GatewayRouting Pattern Demo ===\n");
        IGatewayRouting pattern = new GatewayRoutingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
