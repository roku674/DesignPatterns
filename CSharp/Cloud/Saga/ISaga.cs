namespace Cloud.Saga;

/// <summary>
/// Manages data consistency across microservices in distributed transactions
/// </summary>
public interface ISaga
{
    void Execute();
}
