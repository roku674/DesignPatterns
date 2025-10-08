using System;

namespace Integration.Routing.DynamicRouter;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DynamicRouter Pattern Demo ===\n");
        IDynamicRouter pattern = new DynamicRouterImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
