using System;

namespace Microservices.DataManagement.DatabasePerService;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DatabasePerService Pattern Demo ===\n");
        IDatabasePerService pattern = new DatabasePerServiceImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
