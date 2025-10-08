using System;

namespace Integration.Endpoints.TransactionalClient;

/// <summary>
/// Implementation of TransactionalClient pattern.
/// Makes messaging transactional
/// </summary>
public class TransactionalClientImplementation : ITransactionalClient
{
    public void Execute()
    {
        Console.WriteLine("TransactionalClient pattern executing...");
    }
}
