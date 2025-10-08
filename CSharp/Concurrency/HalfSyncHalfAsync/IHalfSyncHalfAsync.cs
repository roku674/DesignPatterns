namespace Concurrency.HalfSyncHalfAsync;

/// <summary>
/// Decouples async and sync service processing
/// </summary>
public interface IHalfSyncHalfAsync
{
    void Execute();
}
