using System;

namespace Enterprise.DataSource.DataMapper;

/// <summary>
/// Demonstrates the DataMapper pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DataMapper Pattern Demo ===\n");

        IDataMapper pattern = new DataMapperImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
