using System;

namespace Enterprise.BasePatterns.ValueObject;

/// <summary>
/// Concrete implementation of ValueObject pattern.
/// Small object where equality based on value
/// </summary>
public class ValueObjectImplementation : IValueObject
{
    public void Execute()
    {
        Console.WriteLine("ValueObject pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
