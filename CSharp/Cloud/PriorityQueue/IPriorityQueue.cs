namespace Cloud.PriorityQueue;

/// <summary>
/// Prioritizes requests sent to services
/// </summary>
public interface IPriorityQueue
{
    void Execute();
}
