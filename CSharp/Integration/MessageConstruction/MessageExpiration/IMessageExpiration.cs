namespace Integration.MessageConstruction.MessageExpiration;

/// <summary>
/// Prevents stale messages
/// </summary>
public interface IMessageExpiration
{
    void Execute();
}
