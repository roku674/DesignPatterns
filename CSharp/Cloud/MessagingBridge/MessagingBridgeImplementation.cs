using System;

namespace Cloud.MessagingBridge;

/// <summary>
/// Implementation of MessagingBridge pattern.
/// Connects messaging systems for message exchange
/// </summary>
public class MessagingBridgeImplementation : IMessagingBridge
{
    public void Execute()
    {
        Console.WriteLine("MessagingBridge pattern executing...");
    }
}
