using System;

namespace Enterprise.BasePatterns.ServiceStub;

/// <summary>
/// Concrete implementation of ServiceStub pattern.
/// Removes dependence on services during testing
/// </summary>
public class ServiceStubImplementation : IServiceStub
{
    public void Execute()
    {
        Console.WriteLine("ServiceStub pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
