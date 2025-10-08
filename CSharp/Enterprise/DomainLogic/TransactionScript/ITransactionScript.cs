namespace Enterprise.DomainLogic.TransactionScript;

/// <summary>
/// Base interface for transaction scripts.
/// Transaction Script organizes business logic by procedures where each procedure handles a single request from the presentation.
/// </summary>
public interface ITransactionScript
{
    /// <summary>
    /// Executes the transaction script.
    /// </summary>
    void Execute();
}
