using System;

namespace Microservices.API.APIGateway;

/// <summary>
/// Implementation of APIGateway pattern.
/// Single entry point for all clients
/// </summary>
public class APIGatewayImplementation : IAPIGateway
{
    public void Execute()
    {
        Console.WriteLine("APIGateway pattern executing...");
    }
}
