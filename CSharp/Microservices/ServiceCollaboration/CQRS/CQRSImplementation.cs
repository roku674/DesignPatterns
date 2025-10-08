using System;

namespace Microservices.ServiceCollaboration.CQRS;

/// <summary>
/// Implementation of CQRS pattern.
/// Separates read and write models
/// </summary>
public class CQRSImplementation : ICQRS
{
    public void Execute()
    {
        Console.WriteLine("CQRS pattern executing...");
    }
}
