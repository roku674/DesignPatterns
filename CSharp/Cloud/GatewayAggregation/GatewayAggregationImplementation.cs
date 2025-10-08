using System;

namespace Cloud.GatewayAggregation;

/// <summary>
/// Implementation of GatewayAggregation pattern.
/// Aggregates requests to multiple microservices
/// </summary>
public class GatewayAggregationImplementation : IGatewayAggregation
{
    public void Execute()
    {
        Console.WriteLine("GatewayAggregation pattern executing...");
    }
}
