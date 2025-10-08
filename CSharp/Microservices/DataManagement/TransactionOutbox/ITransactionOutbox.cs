namespace Microservices.DataManagement.TransactionOutbox;

/// <summary>
/// Publishes events reliably as part of database transaction
/// </summary>
public interface ITransactionOutbox
{
    void Execute();
}
