namespace Cloud.SchedulerAgentSupervisor;

/// <summary>
/// Coordinates set of actions across distributed services
/// </summary>
public interface ISchedulerAgentSupervisor
{
    void Execute();
}
