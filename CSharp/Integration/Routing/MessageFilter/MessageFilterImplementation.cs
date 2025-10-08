using System;

namespace Integration.Routing.MessageFilter;

/// <summary>
/// Implementation of MessageFilter pattern.
/// Filters unwanted messages
/// </summary>
public class MessageFilterImplementation : IMessageFilter
{
    public void Execute()
    {
        Console.WriteLine("MessageFilter pattern executing...");
    }
}
