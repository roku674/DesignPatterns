using System;

namespace Enterprise.DomainLogic.TableModule;

/// <summary>
/// Demonstrates the TableModule pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== TableModule Pattern Demo ===\n");

        ITableModule pattern = new TableModuleImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
