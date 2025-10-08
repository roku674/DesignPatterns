using System;

namespace Integration.Routing.Resequencer;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Resequencer Pattern Demo ===\n");
        IResequencer pattern = new ResequencerImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
