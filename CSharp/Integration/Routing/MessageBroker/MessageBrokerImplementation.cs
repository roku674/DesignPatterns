using System;

namespace Integration.Routing.MessageBroker;

/// <summary>
/// Implementation of MessageBroker pattern.
/// Decouples sender from receiver
/// </summary>
public class MessageBrokerImplementation : IMessageBroker
{
    public void Execute()
    {
        Console.WriteLine("MessageBroker pattern executing...");
    }
}
