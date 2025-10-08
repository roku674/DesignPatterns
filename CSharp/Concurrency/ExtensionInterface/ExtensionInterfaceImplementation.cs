using System;

namespace Concurrency.ExtensionInterface;

/// <summary>
/// Concrete implementation of ExtensionInterface pattern.
/// Allows multiple interfaces to single component
/// </summary>
public class ExtensionInterfaceImplementation : IExtensionInterface
{
    public void Execute()
    {
        Console.WriteLine("ExtensionInterface pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
