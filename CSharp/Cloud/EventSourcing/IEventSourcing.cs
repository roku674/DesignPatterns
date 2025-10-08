namespace Cloud.EventSourcing;

/// <summary>
/// Uses append-only store to record full series of events
/// </summary>
public interface IEventSourcing
{
    void Execute();
}
