using System;

namespace Enterprise.Concurrency.CoarseGrainedLock;

/// <summary>
/// Concrete implementation of CoarseGrainedLock pattern.
/// Locks set of related objects with single lock
/// </summary>
public class CoarseGrainedLockImplementation : ICoarseGrainedLock
{
    public void Execute()
    {
        Console.WriteLine("CoarseGrainedLock pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
