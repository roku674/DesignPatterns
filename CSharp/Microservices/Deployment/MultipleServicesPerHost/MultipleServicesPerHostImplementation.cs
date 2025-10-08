using System;

namespace Microservices.Deployment.MultipleServicesPerHost;

/// <summary>
/// Implementation of MultipleServicesPerHost pattern.
/// Deploys multiple service instances on single host
/// </summary>
public class MultipleServicesPerHostImplementation : IMultipleServicesPerHost
{
    public void Execute()
    {
        Console.WriteLine("MultipleServicesPerHost pattern executing...");
    }
}
