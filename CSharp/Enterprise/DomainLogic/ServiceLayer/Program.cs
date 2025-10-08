using System;

namespace Enterprise.DomainLogic.ServiceLayer;

/// <summary>
/// Demonstrates the ServiceLayer pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ServiceLayer Pattern Demo ===\n");

        IServiceLayer pattern = new ServiceLayerImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
