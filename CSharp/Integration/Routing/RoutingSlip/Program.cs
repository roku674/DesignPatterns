using System;

namespace Integration.Routing.RoutingSlip;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== RoutingSlip Pattern Demo ===\n");
        IRoutingSlip pattern = new RoutingSlipImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
