using System;

namespace Microservices.ServiceCollaboration.Saga;

/// <summary>
/// Implementation of Saga pattern.
/// Manages distributed transactions across services
/// </summary>
public class SagaImplementation : ISaga
{
    public void Execute()
    {
        Console.WriteLine("Saga pattern executing...");
    }
}
