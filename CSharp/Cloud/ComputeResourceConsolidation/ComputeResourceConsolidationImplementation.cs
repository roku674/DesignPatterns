using System;

namespace Cloud.ComputeResourceConsolidation;

/// <summary>
/// Implementation of ComputeResourceConsolidation pattern.
/// Consolidates multiple tasks into single compute unit
/// </summary>
public class ComputeResourceConsolidationImplementation : IComputeResourceConsolidation
{
    public void Execute()
    {
        Console.WriteLine("ComputeResourceConsolidation pattern executing...");
    }
}
