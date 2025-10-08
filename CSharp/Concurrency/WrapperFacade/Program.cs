using System;

namespace Concurrency.WrapperFacade;

/// <summary>
/// Demonstrates the WrapperFacade pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== WrapperFacade Pattern Demo ===\n");

        IWrapperFacade pattern = new WrapperFacadeImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
