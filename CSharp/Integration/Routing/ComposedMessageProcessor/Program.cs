using System;

namespace Integration.Routing.ComposedMessageProcessor;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ComposedMessageProcessor Pattern Demo ===\n");
        IComposedMessageProcessor pattern = new ComposedMessageProcessorImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
