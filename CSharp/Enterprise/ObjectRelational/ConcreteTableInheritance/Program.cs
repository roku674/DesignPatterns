using System;

namespace Enterprise.ObjectRelational.ConcreteTableInheritance;

/// <summary>
/// Demonstrates the ConcreteTableInheritance pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ConcreteTableInheritance Pattern Demo ===\n");

        IConcreteTableInheritance pattern = new ConcreteTableInheritanceImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
