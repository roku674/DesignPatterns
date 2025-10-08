using System;

namespace Integration.Channels.MessageChannel;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageChannel Pattern Demo ===\n");
        IMessageChannel pattern = new MessageChannelImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
