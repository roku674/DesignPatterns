using System;

namespace Cloud.CacheAside;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== CacheAside Pattern Demo ===\n");
        ICacheAside pattern = new CacheAsideImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
