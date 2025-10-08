using System;

namespace Cloud.PublisherSubscriber;

/// <summary>
/// Implementation of PublisherSubscriber pattern.
/// Enables asynchronous communication for distributed applications
/// </summary>
public class PublisherSubscriberImplementation : IPublisherSubscriber
{
    public void Execute()
    {
        Console.WriteLine("PublisherSubscriber pattern executing...");
    }
}
