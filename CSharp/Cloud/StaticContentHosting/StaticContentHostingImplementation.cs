using System;

namespace Cloud.StaticContentHosting;

/// <summary>
/// Implementation of StaticContentHosting pattern.
/// Deploys static content to cloud storage service
/// </summary>
public class StaticContentHostingImplementation : IStaticContentHosting
{
    public void Execute()
    {
        Console.WriteLine("StaticContentHosting pattern executing...");
    }
}
