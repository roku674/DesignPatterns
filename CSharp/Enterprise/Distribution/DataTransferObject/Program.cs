using System;

namespace Enterprise.Distribution.DataTransferObject;

/// <summary>
/// Demonstrates the DataTransferObject pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DataTransferObject Pattern Demo ===\n");

        IDataTransferObject pattern = new DataTransferObjectImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
