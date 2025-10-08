namespace Enterprise.Concurrency.CoarseGrainedLock;

/// <summary>
/// Locks set of related objects with single lock
/// </summary>
public interface ICoarseGrainedLock
{
    void Execute();
}
