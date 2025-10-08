using System;

namespace Integration.Endpoints.MessageDispatcher;

/// <summary>
/// Implementation of MessageDispatcher pattern.
/// Distributes work to performers
/// </summary>
public class MessageDispatcherImplementation : IMessageDispatcher
{
    public void Execute()
    {
        Console.WriteLine("MessageDispatcher pattern executing...");
    }
}
