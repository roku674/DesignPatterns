using System;

namespace Cloud.QueueBasedLoadLeveling;

/// <summary>
/// Implementation of QueueBasedLoadLeveling pattern.
/// Uses queue as buffer between task and service
/// </summary>
public class QueueBasedLoadLevelingImplementation : IQueueBasedLoadLeveling
{
    public void Execute()
    {
        Console.WriteLine("QueueBasedLoadLeveling pattern executing...");
    }
}
