using System;

namespace Cloud.StaticContentHosting;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== StaticContentHosting Pattern Demo ===\n");
        IStaticContentHosting pattern = new StaticContentHostingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
