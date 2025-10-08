namespace Microservices.ServiceCollaboration.CQRS;

/// <summary>
/// Separates read and write models
/// </summary>
public interface ICQRS
{
    void Execute();
}
