using System;

namespace Integration.Routing.ScatterGather;

/// <summary>
/// Implementation of ScatterGather pattern.
/// Broadcasts and aggregates replies
/// </summary>
public class ScatterGatherImplementation : IScatterGather
{
    public void Execute()
    {
        Console.WriteLine("ScatterGather pattern executing...");
    }
}
