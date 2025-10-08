using System;

namespace Microservices.Discovery.ClientSideDiscovery;

/// <summary>
/// Implementation of ClientSideDiscovery pattern.
/// Client queries service registry to discover instances
/// </summary>
public class ClientSideDiscoveryImplementation : IClientSideDiscovery
{
    public void Execute()
    {
        Console.WriteLine("ClientSideDiscovery pattern executing...");
    }
}
