using System;

namespace Enterprise.DataSource.TableDataGateway;

/// <summary>
/// Demonstrates the TableDataGateway pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== TableDataGateway Pattern Demo ===\n");

        ITableDataGateway pattern = new TableDataGatewayImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
