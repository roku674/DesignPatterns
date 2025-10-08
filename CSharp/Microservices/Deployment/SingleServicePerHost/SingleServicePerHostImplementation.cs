using System;

namespace Microservices.Deployment.SingleServicePerHost;

/// <summary>
/// Implementation of SingleServicePerHost pattern.
/// Deploys each service instance on its own host
/// </summary>
public class SingleServicePerHostImplementation : ISingleServicePerHost
{
    public void Execute()
    {
        Console.WriteLine("SingleServicePerHost pattern executing...");
    }
}
