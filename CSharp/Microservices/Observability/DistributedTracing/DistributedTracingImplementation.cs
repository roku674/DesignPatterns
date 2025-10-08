using System;

namespace Microservices.Observability.DistributedTracing;

/// <summary>
/// Implementation of DistributedTracing pattern.
/// Traces requests as they flow through services
/// </summary>
public class DistributedTracingImplementation : IDistributedTracing
{
    public void Execute()
    {
        Console.WriteLine("DistributedTracing pattern executing...");
    }
}
