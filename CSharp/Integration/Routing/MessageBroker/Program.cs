using System;

namespace Integration.Routing.MessageBroker;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageBroker Pattern Demo ===\n");
        IMessageBroker pattern = new MessageBrokerImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
