using System;

namespace Integration.MessageConstruction.CorrelationIdentifier;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== CorrelationIdentifier Pattern Demo ===\n");
        ICorrelationIdentifier pattern = new CorrelationIdentifierImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
