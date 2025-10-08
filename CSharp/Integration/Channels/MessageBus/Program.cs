using System;

namespace Integration.Channels.MessageBus;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageBus Pattern Demo ===\n");
        IMessageBus pattern = new MessageBusImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
