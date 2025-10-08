namespace Microservices.Discovery.ServerSideDiscovery;

/// <summary>
/// Router queries service registry to discover instances
/// </summary>
public interface IServerSideDiscovery
{
    void Execute();
}
