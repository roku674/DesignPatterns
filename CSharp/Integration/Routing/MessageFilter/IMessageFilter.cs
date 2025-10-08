namespace Integration.Routing.MessageFilter;

/// <summary>
/// Filters unwanted messages
/// </summary>
public interface IMessageFilter
{
    void Execute();
}
