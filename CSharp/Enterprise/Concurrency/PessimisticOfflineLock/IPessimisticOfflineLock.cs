namespace Enterprise.Concurrency.PessimisticOfflineLock;

/// <summary>
/// Prevents conflicts by locking data
/// </summary>
public interface IPessimisticOfflineLock
{
    void Execute();
}
