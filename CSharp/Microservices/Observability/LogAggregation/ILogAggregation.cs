namespace Microservices.Observability.LogAggregation;

/// <summary>
/// Aggregates logs from all service instances
/// </summary>
public interface ILogAggregation
{
    void Execute();
}
