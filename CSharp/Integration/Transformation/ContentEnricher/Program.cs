using System;

namespace Integration.Transformation.ContentEnricher;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ContentEnricher Pattern Demo ===\n");
        IContentEnricher pattern = new ContentEnricherImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
