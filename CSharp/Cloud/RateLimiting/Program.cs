using System;

namespace Cloud.RateLimiting;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== RateLimiting Pattern Demo ===\n");
        IRateLimiting pattern = new RateLimitingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
