using System;

namespace Enterprise.DataSource.RowDataGateway;

/// <summary>
/// Demonstrates the RowDataGateway pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== RowDataGateway Pattern Demo ===\n");

        IRowDataGateway pattern = new RowDataGatewayImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
