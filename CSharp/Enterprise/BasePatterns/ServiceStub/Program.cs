using System;

namespace Enterprise.BasePatterns.ServiceStub;

/// <summary>
/// Demonstrates the ServiceStub pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ServiceStub Pattern Demo ===\n");

        IServiceStub pattern = new ServiceStubImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
