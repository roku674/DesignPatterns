using System;

namespace Microservices.Communication.Messaging;

/// <summary>
/// Implementation of Messaging pattern.
/// Uses asynchronous messaging for inter-service communication
/// </summary>
public class MessagingImplementation : IMessaging
{
    public void Execute()
    {
        Console.WriteLine("Messaging pattern executing...");
    }
}
