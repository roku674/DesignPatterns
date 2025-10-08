using System;

namespace Integration.MessageConstruction.EventMessage;

/// <summary>
/// Implementation of EventMessage pattern.
/// Notifies changes to receivers
/// </summary>
public class EventMessageImplementation : IEventMessage
{
    public void Execute()
    {
        Console.WriteLine("EventMessage pattern executing...");
    }
}
