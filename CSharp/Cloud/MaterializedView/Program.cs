using System;

namespace Cloud.MaterializedView;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MaterializedView Pattern Demo ===\n");
        IMaterializedView pattern = new MaterializedViewImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
