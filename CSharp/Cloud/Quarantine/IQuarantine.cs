namespace Cloud.Quarantine;

/// <summary>
/// Validates external inputs before routing to application
/// </summary>
public interface IQuarantine
{
    void Execute();
}
