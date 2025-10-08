using System;

namespace Enterprise.ObjectRelational.IdentityField;

/// <summary>
/// Demonstrates the IdentityField pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== IdentityField Pattern Demo ===\n");

        IIdentityField pattern = new IdentityFieldImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
