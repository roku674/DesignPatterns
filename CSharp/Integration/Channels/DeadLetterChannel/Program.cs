using System;

namespace Integration.Channels.DeadLetterChannel;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DeadLetterChannel Pattern Demo ===\n");
        IDeadLetterChannel pattern = new DeadLetterChannelImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
