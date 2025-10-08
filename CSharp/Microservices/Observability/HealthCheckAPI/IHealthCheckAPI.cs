namespace Microservices.Observability.HealthCheckAPI;

/// <summary>
/// Service exposes health check endpoint
/// </summary>
public interface IHealthCheckAPI
{
    void Execute();
}
