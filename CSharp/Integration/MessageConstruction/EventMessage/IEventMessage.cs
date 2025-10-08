namespace Integration.MessageConstruction.EventMessage;

/// <summary>
/// Notifies changes to receivers
/// </summary>
public interface IEventMessage
{
    void Execute();
}
