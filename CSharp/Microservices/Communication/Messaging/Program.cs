using System;

namespace Microservices.Communication.Messaging;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Messaging Pattern Demo ===\n");
        IMessaging pattern = new MessagingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
