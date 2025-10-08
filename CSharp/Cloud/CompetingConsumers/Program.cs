using System;

namespace Cloud.CompetingConsumers;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== CompetingConsumers Pattern Demo ===\n");
        ICompetingConsumers pattern = new CompetingConsumersImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
