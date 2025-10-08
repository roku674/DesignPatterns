using System;

namespace Integration.Endpoints.MessagingGateway;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessagingGateway Pattern Demo ===\n");
        IMessagingGateway pattern = new MessagingGatewayImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
