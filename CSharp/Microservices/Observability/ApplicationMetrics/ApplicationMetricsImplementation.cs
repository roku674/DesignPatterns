using System;

namespace Microservices.Observability.ApplicationMetrics;

/// <summary>
/// Implementation of ApplicationMetrics pattern.
/// Instruments services to gather metrics
/// </summary>
public class ApplicationMetricsImplementation : IApplicationMetrics
{
    public void Execute()
    {
        Console.WriteLine("ApplicationMetrics pattern executing...");
    }
}
