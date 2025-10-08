using System;

namespace Cloud.ClaimCheck;

/// <summary>
/// Implementation of ClaimCheck pattern.
/// Splits large message into claim check and payload
/// </summary>
public class ClaimCheckImplementation : IClaimCheck
{
    public void Execute()
    {
        Console.WriteLine("ClaimCheck pattern executing...");
    }
}
