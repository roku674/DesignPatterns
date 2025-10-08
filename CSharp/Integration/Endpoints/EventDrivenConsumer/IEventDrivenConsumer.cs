namespace Integration.Endpoints.EventDrivenConsumer;

/// <summary>
/// Invoked automatically when message arrives
/// </summary>
public interface IEventDrivenConsumer
{
    void Execute();
}
