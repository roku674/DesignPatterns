using System;

namespace Concurrency.AsynchronousCompletionToken;

/// <summary>
/// Demonstrates the AsynchronousCompletionToken pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== AsynchronousCompletionToken Pattern Demo ===\n");

        IAsynchronousCompletionToken pattern = new AsynchronousCompletionTokenImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
