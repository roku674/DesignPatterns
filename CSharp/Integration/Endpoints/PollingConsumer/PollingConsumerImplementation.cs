using System;

namespace Integration.Endpoints.PollingConsumer;

/// <summary>
/// Implementation of PollingConsumer pattern.
/// Consumer polls for messages
/// </summary>
public class PollingConsumerImplementation : IPollingConsumer
{
    public void Execute()
    {
        Console.WriteLine("PollingConsumer pattern executing...");
    }
}
