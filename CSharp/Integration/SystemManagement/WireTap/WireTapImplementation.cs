using System;

namespace Integration.SystemManagement.WireTap;

/// <summary>
/// Implementation of WireTap pattern.
/// Inspects messages on channel
/// </summary>
public class WireTapImplementation : IWireTap
{
    public void Execute()
    {
        Console.WriteLine("WireTap pattern executing...");
    }
}
