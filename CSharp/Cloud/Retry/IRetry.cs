namespace Cloud.Retry;

/// <summary>
/// Handles transient failures by transparently retrying
/// </summary>
public interface IRetry
{
    void Execute();
}
