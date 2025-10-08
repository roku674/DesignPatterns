using System;

namespace Cloud.Throttling;

/// <summary>
/// Implementation of Throttling pattern.
/// Controls consumption of resources by application instance
/// </summary>
public class ThrottlingImplementation : IThrottling
{
    public void Execute()
    {
        Console.WriteLine("Throttling pattern executing...");
    }
}
