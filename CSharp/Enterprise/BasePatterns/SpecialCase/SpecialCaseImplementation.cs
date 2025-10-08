using System;

namespace Enterprise.BasePatterns.SpecialCase;

/// <summary>
/// Concrete implementation of SpecialCase pattern.
/// Subclass providing special behavior for cases
/// </summary>
public class SpecialCaseImplementation : ISpecialCase
{
    public void Execute()
    {
        Console.WriteLine("SpecialCase pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
