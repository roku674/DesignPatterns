using System;

namespace Microservices.CrossCutting.MicroserviceChassis;

/// <summary>
/// Implementation of MicroserviceChassis pattern.
/// Framework providing cross-cutting concerns
/// </summary>
public class MicroserviceChassisImplementation : IMicroserviceChassis
{
    public void Execute()
    {
        Console.WriteLine("MicroserviceChassis pattern executing...");
    }
}
