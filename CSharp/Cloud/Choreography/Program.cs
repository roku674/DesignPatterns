using System;

namespace Cloud.Choreography;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Choreography Pattern Demo ===\n");
        IChoreography pattern = new ChoreographyImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
