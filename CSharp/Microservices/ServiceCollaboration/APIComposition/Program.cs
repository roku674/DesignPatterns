using System;

namespace Microservices.ServiceCollaboration.APIComposition;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== APIComposition Pattern Demo ===\n");
        IAPIComposition pattern = new APICompositionImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
