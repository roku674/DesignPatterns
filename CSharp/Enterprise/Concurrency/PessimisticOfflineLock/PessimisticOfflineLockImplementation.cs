using System;

namespace Enterprise.Concurrency.PessimisticOfflineLock;

/// <summary>
/// Concrete implementation of PessimisticOfflineLock pattern.
/// Prevents conflicts by locking data
/// </summary>
public class PessimisticOfflineLockImplementation : IPessimisticOfflineLock
{
    public void Execute()
    {
        Console.WriteLine("PessimisticOfflineLock pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
