namespace Cloud.GatewayAggregation;

/// <summary>
/// Aggregates requests to multiple microservices
/// </summary>
public interface IGatewayAggregation
{
    void Execute();
}
