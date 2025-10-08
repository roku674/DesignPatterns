using System;

namespace Cloud.Geode;

/// <summary>
/// Implementation of Geode pattern.
/// Deploys backend services into set of geographical nodes
/// </summary>
public class GeodeImplementation : IGeode
{
    public void Execute()
    {
        Console.WriteLine("Geode pattern executing...");
    }
}
