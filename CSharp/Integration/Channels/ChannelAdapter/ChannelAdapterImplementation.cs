using System;

namespace Integration.Channels.ChannelAdapter;

/// <summary>
/// Implementation of ChannelAdapter pattern.
/// Connects application to channel
/// </summary>
public class ChannelAdapterImplementation : IChannelAdapter
{
    public void Execute()
    {
        Console.WriteLine("ChannelAdapter pattern executing...");
    }
}
