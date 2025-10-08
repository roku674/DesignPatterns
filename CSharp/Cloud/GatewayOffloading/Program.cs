using System;

namespace Cloud.GatewayOffloading;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== GatewayOffloading Pattern Demo ===\n");
        IGatewayOffloading pattern = new GatewayOffloadingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
