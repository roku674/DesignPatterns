using System;

namespace Microservices.Observability.ExceptionTracking;

/// <summary>
/// Implementation of ExceptionTracking pattern.
/// Reports exceptions to centralized service
/// </summary>
public class ExceptionTrackingImplementation : IExceptionTracking
{
    public void Execute()
    {
        Console.WriteLine("ExceptionTracking pattern executing...");
    }
}
