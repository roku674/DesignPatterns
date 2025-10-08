using System;

namespace Enterprise.ObjectRelational.LazyLoad;

/// <summary>
/// Demonstrates the LazyLoad pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== LazyLoad Pattern Demo ===\n");

        ILazyLoad pattern = new LazyLoadImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
