using System;

namespace Cloud.SchedulerAgentSupervisor;

/// <summary>
/// Implementation of SchedulerAgentSupervisor pattern.
/// Coordinates set of actions across distributed services
/// </summary>
public class SchedulerAgentSupervisorImplementation : ISchedulerAgentSupervisor
{
    public void Execute()
    {
        Console.WriteLine("SchedulerAgentSupervisor pattern executing...");
    }
}
