using System;

namespace Microservices.Security.AccessToken;

/// <summary>
/// Implementation of AccessToken pattern.
/// Uses tokens for inter-service authentication
/// </summary>
public class AccessTokenImplementation : IAccessToken
{
    public void Execute()
    {
        Console.WriteLine("AccessToken pattern executing...");
    }
}
