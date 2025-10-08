namespace Cloud.QueueBasedLoadLeveling;

/// <summary>
/// Uses queue as buffer between task and service
/// </summary>
public interface IQueueBasedLoadLeveling
{
    void Execute();
}
