using System;

namespace Integration.Routing.MessageRouter;

/// <summary>
/// Implementation of MessageRouter pattern.
/// Routes message to different consumers
/// </summary>
public class MessageRouterImplementation : IMessageRouter
{
    public void Execute()
    {
        Console.WriteLine("MessageRouter pattern executing...");
    }
}
