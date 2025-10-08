namespace Concurrency.ScopedLocking;

/// <summary>
/// Ensures lock automatically released when control leaves scope
/// </summary>
public interface IScopedLocking
{
    void Execute();
}
