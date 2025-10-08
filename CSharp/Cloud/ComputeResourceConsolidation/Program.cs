using System;

namespace Cloud.ComputeResourceConsolidation;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ComputeResourceConsolidation Pattern Demo ===\n");
        IComputeResourceConsolidation pattern = new ComputeResourceConsolidationImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
