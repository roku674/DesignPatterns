using System;

namespace Cloud.Bulkhead;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Bulkhead Pattern Demo ===\n");
        IBulkhead pattern = new BulkheadImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
