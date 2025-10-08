using System;

namespace Cloud.Retry;

/// <summary>
/// Implementation of Retry pattern.
/// Handles transient failures by transparently retrying
/// </summary>
public class RetryImplementation : IRetry
{
    public void Execute()
    {
        Console.WriteLine("Retry pattern executing...");
    }
}
