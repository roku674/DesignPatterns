namespace Integration.Routing.MessageBroker;

/// <summary>
/// Decouples sender from receiver
/// </summary>
public interface IMessageBroker
{
    void Execute();
}
