using System;

namespace Enterprise.BasePatterns.SeparatedInterface;

/// <summary>
/// Concrete implementation of SeparatedInterface pattern.
/// Defines interface in separate package
/// </summary>
public class SeparatedInterfaceImplementation : ISeparatedInterface
{
    public void Execute()
    {
        Console.WriteLine("SeparatedInterface pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
