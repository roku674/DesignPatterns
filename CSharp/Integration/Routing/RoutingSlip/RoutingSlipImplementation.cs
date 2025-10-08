using System;

namespace Integration.Routing.RoutingSlip;

/// <summary>
/// Implementation of RoutingSlip pattern.
/// Routes message through steps
/// </summary>
public class RoutingSlipImplementation : IRoutingSlip
{
    public void Execute()
    {
        Console.WriteLine("RoutingSlip pattern executing...");
    }
}
