using System;

namespace Integration.SystemManagement.MessageStore;

/// <summary>
/// Implementation of MessageStore pattern.
/// Stores messages for later retrieval
/// </summary>
public class MessageStoreImplementation : IMessageStore
{
    public void Execute()
    {
        Console.WriteLine("MessageStore pattern executing...");
    }
}
