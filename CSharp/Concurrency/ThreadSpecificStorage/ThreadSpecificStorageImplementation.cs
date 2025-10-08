using System;

namespace Concurrency.ThreadSpecificStorage;

/// <summary>
/// Concrete implementation of ThreadSpecificStorage pattern.
/// Allows multiple threads to use logically global access
/// </summary>
public class ThreadSpecificStorageImplementation : IThreadSpecificStorage
{
    public void Execute()
    {
        Console.WriteLine("ThreadSpecificStorage pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
