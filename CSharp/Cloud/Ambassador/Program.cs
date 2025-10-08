using System;

namespace Cloud.Ambassador;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Ambassador Pattern Demo ===\n");
        IAmbassador pattern = new AmbassadorImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
