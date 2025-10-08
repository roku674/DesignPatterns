using System;

namespace Integration.Transformation.Normalizer;

/// <summary>
/// Implementation of Normalizer pattern.
/// Routes variants to canonical form
/// </summary>
public class NormalizerImplementation : INormalizer
{
    public void Execute()
    {
        Console.WriteLine("Normalizer pattern executing...");
    }
}
