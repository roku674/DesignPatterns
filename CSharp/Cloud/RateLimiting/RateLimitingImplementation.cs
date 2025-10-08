using System;

namespace Cloud.RateLimiting;

/// <summary>
/// Implementation of RateLimiting pattern.
/// Controls resource consumption by limiting rate of requests
/// </summary>
public class RateLimitingImplementation : IRateLimiting
{
    public void Execute()
    {
        Console.WriteLine("RateLimiting pattern executing...");
    }
}
