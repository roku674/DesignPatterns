using System;

namespace Integration.Transformation.ClaimCheck;

/// <summary>
/// Implementation of ClaimCheck pattern.
/// Reduces message size using reference
/// </summary>
public class ClaimCheckImplementation : IClaimCheck
{
    public void Execute()
    {
        Console.WriteLine("ClaimCheck pattern executing...");
    }
}
