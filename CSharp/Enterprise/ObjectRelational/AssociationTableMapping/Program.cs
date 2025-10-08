using System;

namespace Enterprise.ObjectRelational.AssociationTableMapping;

/// <summary>
/// Demonstrates the AssociationTableMapping pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== AssociationTableMapping Pattern Demo ===\n");

        IAssociationTableMapping pattern = new AssociationTableMappingImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
