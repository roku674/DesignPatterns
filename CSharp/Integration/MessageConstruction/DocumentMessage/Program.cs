using System;

namespace Integration.MessageConstruction.DocumentMessage;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DocumentMessage Pattern Demo ===\n");
        IDocumentMessage pattern = new DocumentMessageImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
