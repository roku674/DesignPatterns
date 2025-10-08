using System;

namespace Integration.MessageConstruction.EventMessage;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== EventMessage Pattern Demo ===\n");
        IEventMessage pattern = new EventMessageImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
