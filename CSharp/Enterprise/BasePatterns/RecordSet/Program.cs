using System;

namespace Enterprise.BasePatterns.RecordSet;

/// <summary>
/// Demonstrates the RecordSet pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== RecordSet Pattern Demo ===\n");

        IRecordSet pattern = new RecordSetImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
