using System;

namespace Integration.Channels.InvalidMessageChannel;

/// <summary>
/// Implementation of InvalidMessageChannel pattern.
/// Handles messages that can't be processed
/// </summary>
public class InvalidMessageChannelImplementation : IInvalidMessageChannel
{
    public void Execute()
    {
        Console.WriteLine("InvalidMessageChannel pattern executing...");
    }
}
