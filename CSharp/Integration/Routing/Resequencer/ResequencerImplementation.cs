using System;

namespace Integration.Routing.Resequencer;

/// <summary>
/// Implementation of Resequencer pattern.
/// Restores correct message order
/// </summary>
public class ResequencerImplementation : IResequencer
{
    public void Execute()
    {
        Console.WriteLine("Resequencer pattern executing...");
    }
}
