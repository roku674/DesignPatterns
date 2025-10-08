namespace Integration.Channels.DeadLetterChannel;

/// <summary>
/// Handles undeliverable messages
/// </summary>
public interface IDeadLetterChannel
{
    void Execute();
}
