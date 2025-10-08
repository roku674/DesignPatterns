using System;

namespace Integration.Routing.ProcessManager;

/// <summary>
/// Implementation of ProcessManager pattern.
/// Routes process flow
/// </summary>
public class ProcessManagerImplementation : IProcessManager
{
    public void Execute()
    {
        Console.WriteLine("ProcessManager pattern executing...");
    }
}
