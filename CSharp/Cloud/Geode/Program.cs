using System;

namespace Cloud.Geode;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Geode Pattern Demo ===\n");
        IGeode pattern = new GeodeImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
