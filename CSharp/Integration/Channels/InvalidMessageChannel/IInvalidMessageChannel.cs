namespace Integration.Channels.InvalidMessageChannel;

/// <summary>
/// Handles messages that can't be processed
/// </summary>
public interface IInvalidMessageChannel
{
    void Execute();
}
