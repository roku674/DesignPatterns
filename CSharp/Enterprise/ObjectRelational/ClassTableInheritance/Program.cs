using System;

namespace Enterprise.ObjectRelational.ClassTableInheritance;

/// <summary>
/// Demonstrates the ClassTableInheritance pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ClassTableInheritance Pattern Demo ===\n");

        IClassTableInheritance pattern = new ClassTableInheritanceImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
