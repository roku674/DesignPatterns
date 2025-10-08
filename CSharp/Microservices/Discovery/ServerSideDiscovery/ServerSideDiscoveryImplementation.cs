using System;

namespace Microservices.Discovery.ServerSideDiscovery;

/// <summary>
/// Implementation of ServerSideDiscovery pattern.
/// Router queries service registry to discover instances
/// </summary>
public class ServerSideDiscoveryImplementation : IServerSideDiscovery
{
    public void Execute()
    {
        Console.WriteLine("ServerSideDiscovery pattern executing...");
    }
}
