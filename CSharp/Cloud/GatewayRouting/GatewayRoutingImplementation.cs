using System;

namespace Cloud.GatewayRouting;

/// <summary>
/// Implementation of GatewayRouting pattern.
/// Routes requests to multiple services using single endpoint
/// </summary>
public class GatewayRoutingImplementation : IGatewayRouting
{
    public void Execute()
    {
        Console.WriteLine("GatewayRouting pattern executing...");
    }
}
