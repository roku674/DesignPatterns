namespace Microservices.Observability.ApplicationMetrics;

/// <summary>
/// Instruments services to gather metrics
/// </summary>
public interface IApplicationMetrics
{
    void Execute();
}
