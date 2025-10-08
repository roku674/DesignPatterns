using System;

namespace Integration.Endpoints.DurableSubscriber;

/// <summary>
/// Implementation of DurableSubscriber pattern.
/// Receives messages even when disconnected
/// </summary>
public class DurableSubscriberImplementation : IDurableSubscriber
{
    public void Execute()
    {
        Console.WriteLine("DurableSubscriber pattern executing...");
    }
}
