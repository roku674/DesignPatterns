using System;

namespace Concurrency.ActiveObject;

/// <summary>
/// Concrete implementation of ActiveObject pattern.
/// Decouples method execution from invocation
/// </summary>
public class ActiveObjectImplementation : IActiveObject
{
    public void Execute()
    {
        Console.WriteLine("ActiveObject pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
