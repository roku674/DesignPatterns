using System;

namespace Integration.Endpoints.ServiceActivator;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ServiceActivator Pattern Demo ===\n");
        IServiceActivator pattern = new ServiceActivatorImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
