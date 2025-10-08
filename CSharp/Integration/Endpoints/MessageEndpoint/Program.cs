using System;

namespace Integration.Endpoints.MessageEndpoint;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageEndpoint Pattern Demo ===\n");
        IMessageEndpoint pattern = new MessageEndpointImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
