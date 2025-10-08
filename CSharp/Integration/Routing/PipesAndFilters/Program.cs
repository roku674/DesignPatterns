using System;

namespace Integration.Routing.PipesAndFilters;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== PipesAndFilters Pattern Demo ===\n");
        IPipesAndFilters pattern = new PipesAndFiltersImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
