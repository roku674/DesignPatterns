using System;

namespace Integration.Channels.PublishSubscribeChannel;

/// <summary>
/// Implementation of PublishSubscribeChannel pattern.
/// Delivers copy to each subscriber
/// </summary>
public class PublishSubscribeChannelImplementation : IPublishSubscribeChannel
{
    public void Execute()
    {
        Console.WriteLine("PublishSubscribeChannel pattern executing...");
    }
}
