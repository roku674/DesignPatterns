using System;

namespace Integration.Channels.DatatypeChannel;

/// <summary>
/// Implementation of DatatypeChannel pattern.
/// Uses separate channel per data type
/// </summary>
public class DatatypeChannelImplementation : IDatatypeChannel
{
    public void Execute()
    {
        Console.WriteLine("DatatypeChannel pattern executing...");
    }
}
