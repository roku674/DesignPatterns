namespace Microservices.DataManagement.DatabasePerService;

/// <summary>
/// Each service has its own private database
/// </summary>
public interface IDatabasePerService
{
    void Execute();
}
