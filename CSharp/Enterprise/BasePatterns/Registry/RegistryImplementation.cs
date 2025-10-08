using System;

namespace Enterprise.BasePatterns.Registry;

/// <summary>
/// Concrete implementation of Registry pattern.
/// Well-known object that other objects find/register
/// </summary>
public class RegistryImplementation : IRegistry
{
    public void Execute()
    {
        Console.WriteLine("Registry pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
