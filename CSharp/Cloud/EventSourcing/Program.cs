using System;

namespace Cloud.EventSourcing;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== EventSourcing Pattern Demo ===\n");
        IEventSourcing pattern = new EventSourcingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
