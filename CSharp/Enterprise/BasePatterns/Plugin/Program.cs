using System;

namespace Enterprise.BasePatterns.Plugin;

/// <summary>
/// Demonstrates the Plugin pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Plugin Pattern Demo ===\n");

        IPlugin pattern = new PluginImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
