using System;

namespace Integration.Channels.MessagingBridge;

/// <summary>
/// Implementation of MessagingBridge pattern.
/// Connects messaging systems
/// </summary>
public class MessagingBridgeImplementation : IMessagingBridge
{
    public void Execute()
    {
        Console.WriteLine("MessagingBridge pattern executing...");
    }
}
