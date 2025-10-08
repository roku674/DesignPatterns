namespace Integration.SystemManagement.MessageStore;

/// <summary>
/// Stores messages for later retrieval
/// </summary>
public interface IMessageStore
{
    void Execute();
}
