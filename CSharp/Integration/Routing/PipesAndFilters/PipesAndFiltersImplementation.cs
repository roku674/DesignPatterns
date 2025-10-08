using System;

namespace Integration.Routing.PipesAndFilters;

/// <summary>
/// Implementation of PipesAndFilters pattern.
/// Divides large processing task into sequence
/// </summary>
public class PipesAndFiltersImplementation : IPipesAndFilters
{
    public void Execute()
    {
        Console.WriteLine("PipesAndFilters pattern executing...");
    }
}
