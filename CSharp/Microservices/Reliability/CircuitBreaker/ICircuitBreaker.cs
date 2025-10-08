namespace Microservices.Reliability.CircuitBreaker;

/// <summary>
/// Prevents cascading failures by stopping failing calls
/// </summary>
public interface ICircuitBreaker
{
    void Execute();
}
