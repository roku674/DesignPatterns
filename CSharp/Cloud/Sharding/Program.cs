using System;

namespace Cloud.Sharding;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Sharding Pattern Demo ===\n");
        ISharding pattern = new ShardingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
