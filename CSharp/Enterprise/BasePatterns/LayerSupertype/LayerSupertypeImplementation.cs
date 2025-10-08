using System;

namespace Enterprise.BasePatterns.LayerSupertype;

/// <summary>
/// Concrete implementation of LayerSupertype pattern.
/// Type all types in layer inherit from
/// </summary>
public class LayerSupertypeImplementation : ILayerSupertype
{
    public void Execute()
    {
        Console.WriteLine("LayerSupertype pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
