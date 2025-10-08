namespace Integration.MessageConstruction.CorrelationIdentifier;

/// <summary>
/// Matches request with reply
/// </summary>
public interface ICorrelationIdentifier
{
    void Execute();
}
