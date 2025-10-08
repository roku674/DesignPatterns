using System;

namespace Microservices.Testing.ServiceIntegrationContractTest;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ServiceIntegrationContractTest Pattern Demo ===\n");
        IServiceIntegrationContractTest pattern = new ServiceIntegrationContractTestImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
