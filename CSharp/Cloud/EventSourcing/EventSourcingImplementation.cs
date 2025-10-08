using System;

namespace Cloud.EventSourcing;

/// <summary>
/// Implementation of EventSourcing pattern.
/// Uses append-only store to record full series of events
/// </summary>
public class EventSourcingImplementation : IEventSourcing
{
    public void Execute()
    {
        Console.WriteLine("EventSourcing pattern executing...");
    }
}
