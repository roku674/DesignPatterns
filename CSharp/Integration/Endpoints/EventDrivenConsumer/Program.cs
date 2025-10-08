using System;

namespace Integration.Endpoints.EventDrivenConsumer;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== EventDrivenConsumer Pattern Demo ===\n");
        IEventDrivenConsumer pattern = new EventDrivenConsumerImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
