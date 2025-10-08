using System;

namespace Cloud.SchedulerAgentSupervisor;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== SchedulerAgentSupervisor Pattern Demo ===\n");
        ISchedulerAgentSupervisor pattern = new SchedulerAgentSupervisorImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
