using System;

namespace Enterprise.ObjectRelational.LazyLoad;

/// <summary>
/// Concrete implementation of LazyLoad pattern.
/// Object that doesn't contain all data but knows how to get it
/// </summary>
public class LazyLoadImplementation : ILazyLoad
{
    public void Execute()
    {
        Console.WriteLine("LazyLoad pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
