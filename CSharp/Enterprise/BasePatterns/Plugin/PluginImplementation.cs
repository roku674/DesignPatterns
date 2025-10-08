using System;

namespace Enterprise.BasePatterns.Plugin;

/// <summary>
/// Concrete implementation of Plugin pattern.
/// Links classes during configuration rather than compilation
/// </summary>
public class PluginImplementation : IPlugin
{
    public void Execute()
    {
        Console.WriteLine("Plugin pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
