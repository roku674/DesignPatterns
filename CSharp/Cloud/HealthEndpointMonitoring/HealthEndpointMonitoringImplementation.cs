using System;

namespace Cloud.HealthEndpointMonitoring;

/// <summary>
/// Implementation of HealthEndpointMonitoring pattern.
/// Implements functional checks in application
/// </summary>
public class HealthEndpointMonitoringImplementation : IHealthEndpointMonitoring
{
    public void Execute()
    {
        Console.WriteLine("HealthEndpointMonitoring pattern executing...");
    }
}
