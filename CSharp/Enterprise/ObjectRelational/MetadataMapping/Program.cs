using System;

namespace Enterprise.ObjectRelational.MetadataMapping;

/// <summary>
/// Demonstrates the MetadataMapping pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MetadataMapping Pattern Demo ===\n");

        IMetadataMapping pattern = new MetadataMappingImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
