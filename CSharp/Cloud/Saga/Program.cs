using System;

namespace Cloud.Saga;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Saga Pattern Demo ===\n");
        ISaga pattern = new SagaImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
