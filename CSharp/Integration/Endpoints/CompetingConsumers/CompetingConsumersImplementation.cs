using System;

namespace Integration.Endpoints.CompetingConsumers;

/// <summary>
/// Implementation of CompetingConsumers pattern.
/// Multiple consumers compete for messages
/// </summary>
public class CompetingConsumersImplementation : ICompetingConsumers
{
    public void Execute()
    {
        Console.WriteLine("CompetingConsumers pattern executing...");
    }
}
