using System;

namespace Microservices.Observability.HealthCheckAPI;

/// <summary>
/// Implementation of HealthCheckAPI pattern.
/// Service exposes health check endpoint
/// </summary>
public class HealthCheckAPIImplementation : IHealthCheckAPI
{
    public void Execute()
    {
        Console.WriteLine("HealthCheckAPI pattern executing...");
    }
}
