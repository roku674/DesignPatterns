using System;
using System.Threading.Tasks;

namespace Cloud.CircuitBreaker;

/// <summary>
/// Handles faults that might take variable time to fix
/// </summary>
public interface ICircuitBreaker
{
    void Execute();
}

/// <summary>
/// Circuit breaker states
/// </summary>
public enum CircuitState
{
    Closed,     // Normal operation
    Open,       // Blocking requests
    HalfOpen    // Testing if service recovered
}

/// <summary>
/// Generic circuit breaker for protecting service calls
/// </summary>
public interface ICircuitBreaker<T>
{
    Task<T> ExecuteAsync(Func<Task<T>> operation);
    CircuitState State { get; }
    int FailureCount { get; }
    DateTime? LastFailureTime { get; }
    void Reset();
}

/// <summary>
/// Circuit breaker exception thrown when circuit is open
/// </summary>
public class CircuitBreakerOpenException : Exception
{
    public CircuitBreakerOpenException()
        : base("Circuit breaker is open")
    {
    }

    public CircuitBreakerOpenException(string message)
        : base(message)
    {
    }
}
