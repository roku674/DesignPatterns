using System;

namespace Integration.Endpoints.SelectiveConsumer;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== SelectiveConsumer Pattern Demo ===\n");
        ISelectiveConsumer pattern = new SelectiveConsumerImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
