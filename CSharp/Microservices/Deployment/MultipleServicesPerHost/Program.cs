using System;

namespace Microservices.Deployment.MultipleServicesPerHost;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MultipleServicesPerHost Pattern Demo ===\n");
        IMultipleServicesPerHost pattern = new MultipleServicesPerHostImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
