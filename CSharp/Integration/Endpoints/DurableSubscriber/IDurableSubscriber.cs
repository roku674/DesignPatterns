namespace Integration.Endpoints.DurableSubscriber;

/// <summary>
/// Receives messages even when disconnected
/// </summary>
public interface IDurableSubscriber
{
    void Execute();
}
