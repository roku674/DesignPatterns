using System;

namespace Concurrency.MonitorObject;

/// <summary>
/// Concrete implementation of MonitorObject pattern.
/// Synchronizes concurrent method execution
/// </summary>
public class MonitorObjectImplementation : IMonitorObject
{
    public void Execute()
    {
        Console.WriteLine("MonitorObject pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
