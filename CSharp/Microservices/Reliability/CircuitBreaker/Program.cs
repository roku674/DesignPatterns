using System;

namespace Microservices.Reliability.CircuitBreaker;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== CircuitBreaker Pattern Demo ===\n");
        ICircuitBreaker pattern = new CircuitBreakerImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
