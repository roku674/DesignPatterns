using System;

namespace Enterprise.ObjectRelational.QueryObject;

/// <summary>
/// Demonstrates the QueryObject pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== QueryObject Pattern Demo ===\n");

        IQueryObject pattern = new QueryObjectImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
