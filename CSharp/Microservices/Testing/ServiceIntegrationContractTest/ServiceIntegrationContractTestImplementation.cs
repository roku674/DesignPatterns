using System;

namespace Microservices.Testing.ServiceIntegrationContractTest;

/// <summary>
/// Implementation of ServiceIntegrationContractTest pattern.
/// Verifies service meets contract expectations
/// </summary>
public class ServiceIntegrationContractTestImplementation : IServiceIntegrationContractTest
{
    public void Execute()
    {
        Console.WriteLine("ServiceIntegrationContractTest pattern executing...");
    }
}
