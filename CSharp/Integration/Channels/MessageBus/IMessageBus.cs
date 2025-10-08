namespace Integration.Channels.MessageBus;

/// <summary>
/// Enables separate applications to work together
/// </summary>
public interface IMessageBus
{
    void Execute();
}
