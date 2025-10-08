using System;

namespace Enterprise.ObjectRelational.SingleTableInheritance;

/// <summary>
/// Demonstrates the SingleTableInheritance pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== SingleTableInheritance Pattern Demo ===\n");

        ISingleTableInheritance pattern = new SingleTableInheritanceImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
