using System;

namespace Cloud.IndexTable;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== IndexTable Pattern Demo ===\n");
        IIndexTable pattern = new IndexTableImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
