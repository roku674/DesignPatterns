namespace Integration.Routing.Aggregator;

/// <summary>
/// Combines related messages
/// </summary>
public interface IAggregator
{
    void Execute();
}
