using System;

namespace Integration.Routing.ContentBasedRouter;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ContentBasedRouter Pattern Demo ===\n");
        IContentBasedRouter pattern = new ContentBasedRouterImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
