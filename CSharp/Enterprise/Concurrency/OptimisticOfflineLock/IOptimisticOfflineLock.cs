namespace Enterprise.Concurrency.OptimisticOfflineLock;

/// <summary>
/// Prevents conflicts with conflict detection
/// </summary>
public interface IOptimisticOfflineLock
{
    void Execute();
}
