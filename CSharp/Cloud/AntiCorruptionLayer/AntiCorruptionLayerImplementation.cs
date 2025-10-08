using System;

namespace Cloud.AntiCorruptionLayer;

/// <summary>
/// Implementation of AntiCorruptionLayer pattern.
/// Implements facade between modern and legacy applications
/// </summary>
public class AntiCorruptionLayerImplementation : IAntiCorruptionLayer
{
    public void Execute()
    {
        Console.WriteLine("AntiCorruptionLayer pattern executing...");
    }
}
