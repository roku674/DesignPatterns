using System;

namespace Concurrency.ThreadSafeInterface;

/// <summary>
/// Concrete implementation of ThreadSafeInterface pattern.
/// Minimizes locking overhead
/// </summary>
public class ThreadSafeInterfaceImplementation : IThreadSafeInterface
{
    public void Execute()
    {
        Console.WriteLine("ThreadSafeInterface pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
