namespace Integration.MessageConstruction.CommandMessage;

/// <summary>
/// Invokes procedure in receiver
/// </summary>
public interface ICommandMessage
{
    void Execute();
}
