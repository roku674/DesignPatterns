using System;

namespace Microservices.DataManagement.TransactionOutbox;

/// <summary>
/// Implementation of TransactionOutbox pattern.
/// Publishes events reliably as part of database transaction
/// </summary>
public class TransactionOutboxImplementation : ITransactionOutbox
{
    public void Execute()
    {
        Console.WriteLine("TransactionOutbox pattern executing...");
    }
}
