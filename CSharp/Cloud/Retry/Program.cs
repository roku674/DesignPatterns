using System;

namespace Cloud.Retry;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Retry Pattern Demo ===\n");
        IRetry pattern = new RetryImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
