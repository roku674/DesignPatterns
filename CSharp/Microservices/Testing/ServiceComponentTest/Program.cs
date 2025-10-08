using System;

namespace Microservices.Testing.ServiceComponentTest;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ServiceComponentTest Pattern Demo ===\n");
        IServiceComponentTest pattern = new ServiceComponentTestImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
