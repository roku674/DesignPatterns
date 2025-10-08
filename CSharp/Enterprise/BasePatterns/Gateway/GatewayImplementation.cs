using System;

namespace Enterprise.BasePatterns.Gateway;

/// <summary>
/// Concrete implementation of Gateway pattern.
/// Object encapsulating access to external system
/// </summary>
public class GatewayImplementation : IGateway
{
    public void Execute()
    {
        Console.WriteLine("Gateway pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
