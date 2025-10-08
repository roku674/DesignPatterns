namespace Cloud.CircuitBreaker;

/// <summary>
/// Handles faults that might take variable time to fix
/// </summary>
public interface ICircuitBreaker
{
    void Execute();
}
