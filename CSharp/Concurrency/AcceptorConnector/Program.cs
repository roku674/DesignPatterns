using System;

namespace Concurrency.AcceptorConnector;

/// <summary>
/// Demonstrates the AcceptorConnector pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== AcceptorConnector Pattern Demo ===\n");

        IAcceptorConnector pattern = new AcceptorConnectorImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
