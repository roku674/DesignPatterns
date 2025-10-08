using System;

namespace Integration.MessageConstruction.Message;

/// <summary>
/// Implementation of Message pattern.
/// Basic unit of data transmitted
/// </summary>
public class MessageImplementation : IMessage
{
    public void Execute()
    {
        Console.WriteLine("Message pattern executing...");
    }
}
