using System;

namespace Integration.MessageConstruction.MessageExpiration;

/// <summary>
/// Implementation of MessageExpiration pattern.
/// Prevents stale messages
/// </summary>
public class MessageExpirationImplementation : IMessageExpiration
{
    public void Execute()
    {
        Console.WriteLine("MessageExpiration pattern executing...");
    }
}
