namespace Integration.Endpoints.MessageDispatcher;

/// <summary>
/// Distributes work to performers
/// </summary>
public interface IMessageDispatcher
{
    void Execute();
}
