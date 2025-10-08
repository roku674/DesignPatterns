using System;

namespace Enterprise.BasePatterns.Gateway;

/// <summary>
/// Demonstrates the Gateway pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Gateway Pattern Demo ===\n");

        IGateway pattern = new GatewayImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
