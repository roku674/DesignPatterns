namespace Integration.Endpoints.TransactionalClient;

/// <summary>
/// Makes messaging transactional
/// </summary>
public interface ITransactionalClient
{
    void Execute();
}
