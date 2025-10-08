using System;

namespace Enterprise.Concurrency.ImplicitLock;

/// <summary>
/// Concrete implementation of ImplicitLock pattern.
/// Framework manages locks automatically
/// </summary>
public class ImplicitLockImplementation : IImplicitLock
{
    public void Execute()
    {
        Console.WriteLine("ImplicitLock pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
