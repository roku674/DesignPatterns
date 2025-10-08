using System;

namespace Integration.Endpoints.EventDrivenConsumer;

/// <summary>
/// Implementation of EventDrivenConsumer pattern.
/// Invoked automatically when message arrives
/// </summary>
public class EventDrivenConsumerImplementation : IEventDrivenConsumer
{
    public void Execute()
    {
        Console.WriteLine("EventDrivenConsumer pattern executing...");
    }
}
