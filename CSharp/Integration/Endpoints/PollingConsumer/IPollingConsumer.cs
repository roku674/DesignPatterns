namespace Integration.Endpoints.PollingConsumer;

/// <summary>
/// Consumer polls for messages
/// </summary>
public interface IPollingConsumer
{
    void Execute();
}
