namespace Integration.Channels.MessageChannel;

/// <summary>
/// Connects applications via messaging
/// </summary>
public interface IMessageChannel
{
    void Execute();
}
