using System;

namespace Concurrency.ExtensionInterface;

/// <summary>
/// Demonstrates the ExtensionInterface pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ExtensionInterface Pattern Demo ===\n");

        IExtensionInterface pattern = new ExtensionInterfaceImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
