using System;

namespace Cloud.SequentialConvoy;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== SequentialConvoy Pattern Demo ===\n");
        ISequentialConvoy pattern = new SequentialConvoyImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
