using System;

namespace Microservices.Discovery.ClientSideDiscovery;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ClientSideDiscovery Pattern Demo ===\n");
        IClientSideDiscovery pattern = new ClientSideDiscoveryImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
