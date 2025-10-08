namespace Microservices.ServiceCollaboration.Saga;

/// <summary>
/// Manages distributed transactions across services
/// </summary>
public interface ISaga
{
    void Execute();
}
