using System;

namespace Cloud.GatewayOffloading;

/// <summary>
/// Implementation of GatewayOffloading pattern.
/// Offloads shared functionality to gateway proxy
/// </summary>
public class GatewayOffloadingImplementation : IGatewayOffloading
{
    public void Execute()
    {
        Console.WriteLine("GatewayOffloading pattern executing...");
    }
}
