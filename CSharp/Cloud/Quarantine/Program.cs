using System;

namespace Cloud.Quarantine;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Quarantine Pattern Demo ===\n");
        IQuarantine pattern = new QuarantineImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
