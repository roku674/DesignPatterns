namespace Microservices.Deployment.SingleServicePerHost;

/// <summary>
/// Deploys each service instance on its own host
/// </summary>
public interface ISingleServicePerHost
{
    void Execute();
}
