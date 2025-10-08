namespace Integration.Endpoints.IdempotentReceiver;

/// <summary>
/// Handles duplicate messages
/// </summary>
public interface IIdempotentReceiver
{
    void Execute();
}
