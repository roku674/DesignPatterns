using System;

namespace Microservices.API.APIGateway;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== APIGateway Pattern Demo ===\n");
        IAPIGateway pattern = new APIGatewayImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
