using System;

namespace Integration.Transformation.Normalizer;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Normalizer Pattern Demo ===\n");
        INormalizer pattern = new NormalizerImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
