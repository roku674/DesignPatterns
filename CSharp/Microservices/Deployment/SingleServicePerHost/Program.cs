using System;

namespace Microservices.Deployment.SingleServicePerHost;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== SingleServicePerHost Pattern Demo ===\n");
        ISingleServicePerHost pattern = new SingleServicePerHostImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
