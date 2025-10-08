using System;

namespace Microservices.CrossCutting.MicroserviceChassis;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MicroserviceChassis Pattern Demo ===\n");
        IMicroserviceChassis pattern = new MicroserviceChassisImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
