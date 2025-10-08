namespace Concurrency.ThreadSafeInterface;

/// <summary>
/// Minimizes locking overhead
/// </summary>
public interface IThreadSafeInterface
{
    void Execute();
}
