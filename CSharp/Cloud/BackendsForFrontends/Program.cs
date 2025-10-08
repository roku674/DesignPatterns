using System;

namespace Cloud.BackendsForFrontends;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== BackendsForFrontends Pattern Demo ===\n");
        IBackendsForFrontends pattern = new BackendsForFrontendsImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
