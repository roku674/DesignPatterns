using System;

namespace Integration.Routing.ScatterGather;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ScatterGather Pattern Demo ===\n");
        IScatterGather pattern = new ScatterGatherImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
