using System;

namespace Microservices.Observability.LogAggregation;

/// <summary>
/// Implementation of LogAggregation pattern.
/// Aggregates logs from all service instances
/// </summary>
public class LogAggregationImplementation : ILogAggregation
{
    public void Execute()
    {
        Console.WriteLine("LogAggregation pattern executing...");
    }
}
