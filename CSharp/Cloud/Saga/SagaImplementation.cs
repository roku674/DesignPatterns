using System;

namespace Cloud.Saga;

/// <summary>
/// Implementation of Saga pattern.
/// Manages data consistency across microservices in distributed transactions
/// </summary>
public class SagaImplementation : ISaga
{
    public void Execute()
    {
        Console.WriteLine("Saga pattern executing...");
    }
}
