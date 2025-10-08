using System;

namespace Cloud.Sidecar;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Sidecar Pattern Demo ===\n");
        ISidecar pattern = new SidecarImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
