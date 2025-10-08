using System;

namespace Cloud.CQRS;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== CQRS Pattern Demo ===\n");
        ICQRS pattern = new CQRSImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
