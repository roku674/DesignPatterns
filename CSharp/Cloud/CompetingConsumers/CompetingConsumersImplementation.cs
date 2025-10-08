using System;

namespace Cloud.CompetingConsumers;

/// <summary>
/// Implementation of CompetingConsumers pattern.
/// Enables multiple consumers to process messages concurrently
/// </summary>
public class CompetingConsumersImplementation : ICompetingConsumers
{
    public void Execute()
    {
        Console.WriteLine("CompetingConsumers pattern executing...");
    }
}
