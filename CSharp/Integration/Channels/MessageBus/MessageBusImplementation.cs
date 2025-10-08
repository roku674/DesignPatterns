using System;

namespace Integration.Channels.MessageBus;

/// <summary>
/// Implementation of MessageBus pattern.
/// Enables separate applications to work together
/// </summary>
public class MessageBusImplementation : IMessageBus
{
    public void Execute()
    {
        Console.WriteLine("MessageBus pattern executing...");
    }
}
