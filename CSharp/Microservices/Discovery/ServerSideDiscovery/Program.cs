using System;

namespace Microservices.Discovery.ServerSideDiscovery;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ServerSideDiscovery Pattern Demo ===\n");
        IServerSideDiscovery pattern = new ServerSideDiscoveryImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
