using System;

namespace Cloud.PipesAndFilters;

/// <summary>
/// Implementation of PipesAndFilters pattern.
/// Breaks down complex processing into series of reusable elements
/// </summary>
public class PipesAndFiltersImplementation : IPipesAndFilters
{
    public void Execute()
    {
        Console.WriteLine("PipesAndFilters pattern executing...");
    }
}
