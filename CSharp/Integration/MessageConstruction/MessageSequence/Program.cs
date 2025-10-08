using System;

namespace Integration.MessageConstruction.MessageSequence;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageSequence Pattern Demo ===\n");
        IMessageSequence pattern = new MessageSequenceImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
