using System;

namespace Integration.Transformation.CanonicalDataModel;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== CanonicalDataModel Pattern Demo ===\n");
        ICanonicalDataModel pattern = new CanonicalDataModelImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
