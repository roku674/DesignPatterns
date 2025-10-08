using System;

namespace Microservices.Testing.ServiceComponentTest;

/// <summary>
/// Implementation of ServiceComponentTest pattern.
/// Tests service in isolation using test doubles
/// </summary>
public class ServiceComponentTestImplementation : IServiceComponentTest
{
    public void Execute()
    {
        Console.WriteLine("ServiceComponentTest pattern executing...");
    }
}
