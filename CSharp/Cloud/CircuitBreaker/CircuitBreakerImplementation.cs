using System;

namespace Cloud.CircuitBreaker;

/// <summary>
/// Implementation of CircuitBreaker pattern.
/// Handles faults that might take variable time to fix
/// </summary>
public class CircuitBreakerImplementation : ICircuitBreaker
{
    public void Execute()
    {
        Console.WriteLine("CircuitBreaker pattern executing...");
    }
}
