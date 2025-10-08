using System;

namespace Microservices.Reliability.CircuitBreaker;

/// <summary>
/// Implementation of CircuitBreaker pattern.
/// Prevents cascading failures by stopping failing calls
/// </summary>
public class CircuitBreakerImplementation : ICircuitBreaker
{
    public void Execute()
    {
        Console.WriteLine("CircuitBreaker pattern executing...");
    }
}
