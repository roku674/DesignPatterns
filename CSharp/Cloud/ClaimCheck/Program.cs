using System;

namespace Cloud.ClaimCheck;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ClaimCheck Pattern Demo ===\n");
        IClaimCheck pattern = new ClaimCheckImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
