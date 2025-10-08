using System;

namespace Concurrency.Interceptor;

/// <summary>
/// Demonstrates the Interceptor pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Interceptor Pattern Demo ===\n");

        IInterceptor pattern = new InterceptorImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
