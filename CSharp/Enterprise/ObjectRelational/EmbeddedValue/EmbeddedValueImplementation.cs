using System;

namespace Enterprise.ObjectRelational.EmbeddedValue;

/// <summary>
/// Concrete implementation of EmbeddedValue pattern.
/// Maps object into several fields of owner's table
/// </summary>
public class EmbeddedValueImplementation : IEmbeddedValue
{
    public void Execute()
    {
        Console.WriteLine("EmbeddedValue pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
