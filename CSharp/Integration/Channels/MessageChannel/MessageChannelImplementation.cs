using System;

namespace Integration.Channels.MessageChannel;

/// <summary>
/// Implementation of MessageChannel pattern.
/// Connects applications via messaging
/// </summary>
public class MessageChannelImplementation : IMessageChannel
{
    public void Execute()
    {
        Console.WriteLine("MessageChannel pattern executing...");
    }
}
