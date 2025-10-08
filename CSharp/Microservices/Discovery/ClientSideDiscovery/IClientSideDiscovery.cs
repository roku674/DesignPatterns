namespace Microservices.Discovery.ClientSideDiscovery;

/// <summary>
/// Client queries service registry to discover instances
/// </summary>
public interface IClientSideDiscovery
{
    void Execute();
}
