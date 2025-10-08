using System;

namespace Enterprise.ObjectRelational.UnitOfWork;

/// <summary>
/// Demonstrates the UnitOfWork pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== UnitOfWork Pattern Demo ===\n");

        IUnitOfWork pattern = new UnitOfWorkImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
