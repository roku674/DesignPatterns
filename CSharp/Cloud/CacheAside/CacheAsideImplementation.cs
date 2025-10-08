using System;

namespace Cloud.CacheAside;

/// <summary>
/// Implementation of CacheAside pattern.
/// Loads data on demand into cache from data store
/// </summary>
public class CacheAsideImplementation : ICacheAside
{
    public void Execute()
    {
        Console.WriteLine("CacheAside pattern executing...");
    }
}
