using System;

namespace Integration.Channels.InvalidMessageChannel;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== InvalidMessageChannel Pattern Demo ===\n");
        IInvalidMessageChannel pattern = new InvalidMessageChannelImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
