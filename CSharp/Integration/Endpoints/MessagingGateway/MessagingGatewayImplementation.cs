using System;

namespace Integration.Endpoints.MessagingGateway;

/// <summary>
/// Implementation of MessagingGateway pattern.
/// Encapsulates messaging system
/// </summary>
public class MessagingGatewayImplementation : IMessagingGateway
{
    public void Execute()
    {
        Console.WriteLine("MessagingGateway pattern executing...");
    }
}
