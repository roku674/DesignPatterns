using System;

namespace Cloud.Throttling;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Throttling Pattern Demo ===\n");
        IThrottling pattern = new ThrottlingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
