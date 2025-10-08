using System;

namespace Integration.Endpoints.ServiceActivator;

/// <summary>
/// Implementation of ServiceActivator pattern.
/// Connects service to messaging system
/// </summary>
public class ServiceActivatorImplementation : IServiceActivator
{
    public void Execute()
    {
        Console.WriteLine("ServiceActivator pattern executing...");
    }
}
