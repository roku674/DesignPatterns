namespace Enterprise.SessionState.DatabaseSessionState;

/// <summary>
/// Stores session state in database
/// </summary>
public interface IDatabaseSessionState
{
    void Execute();
}
