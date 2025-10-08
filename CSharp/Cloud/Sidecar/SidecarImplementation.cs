using System;

namespace Cloud.Sidecar;

/// <summary>
/// Implementation of Sidecar pattern.
/// Deploys components into separate process for isolation
/// </summary>
public class SidecarImplementation : ISidecar
{
    public void Execute()
    {
        Console.WriteLine("Sidecar pattern executing...");
    }
}
