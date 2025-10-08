using System;

namespace Cloud.BackendsForFrontends;

/// <summary>
/// Implementation of BackendsForFrontends pattern.
/// Creates separate backend services for frontend applications
/// </summary>
public class BackendsForFrontendsImplementation : IBackendsForFrontends
{
    public void Execute()
    {
        Console.WriteLine("BackendsForFrontends pattern executing...");
    }
}
