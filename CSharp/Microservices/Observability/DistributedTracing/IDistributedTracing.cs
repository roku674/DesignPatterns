namespace Microservices.Observability.DistributedTracing;

/// <summary>
/// Traces requests as they flow through services
/// </summary>
public interface IDistributedTracing
{
    void Execute();
}
