using System;

namespace Enterprise.ObjectRelational.IdentityMap;

/// <summary>
/// Demonstrates the IdentityMap pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== IdentityMap Pattern Demo ===\n");

        IIdentityMap pattern = new IdentityMapImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
