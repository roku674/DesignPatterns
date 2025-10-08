using System;

namespace Integration.Endpoints.MessagingMapper;

/// <summary>
/// Implementation of MessagingMapper pattern.
/// Maps domain objects to messages
/// </summary>
public class MessagingMapperImplementation : IMessagingMapper
{
    public void Execute()
    {
        Console.WriteLine("MessagingMapper pattern executing...");
    }
}
