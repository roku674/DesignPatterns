using System;

namespace Integration.Endpoints.MessageEndpoint;

/// <summary>
/// Implementation of MessageEndpoint pattern.
/// Connects application to channel
/// </summary>
public class MessageEndpointImplementation : IMessageEndpoint
{
    public void Execute()
    {
        Console.WriteLine("MessageEndpoint pattern executing...");
    }
}
