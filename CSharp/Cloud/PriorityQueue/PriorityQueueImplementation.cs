using System;

namespace Cloud.PriorityQueue;

/// <summary>
/// Implementation of PriorityQueue pattern.
/// Prioritizes requests sent to services
/// </summary>
public class PriorityQueueImplementation : IPriorityQueue
{
    public void Execute()
    {
        Console.WriteLine("PriorityQueue pattern executing...");
    }
}
