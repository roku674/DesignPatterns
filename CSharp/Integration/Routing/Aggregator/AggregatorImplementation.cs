using System;

namespace Integration.Routing.Aggregator;

/// <summary>
/// Implementation of Aggregator pattern.
/// Combines related messages
/// </summary>
public class AggregatorImplementation : IAggregator
{
    public void Execute()
    {
        Console.WriteLine("Aggregator pattern executing...");
    }
}
