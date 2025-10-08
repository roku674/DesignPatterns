using System;

namespace Microservices.Observability.LogDeploymentsAndChanges;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== LogDeploymentsAndChanges Pattern Demo ===\n");
        ILogDeploymentsAndChanges pattern = new LogDeploymentsAndChangesImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
