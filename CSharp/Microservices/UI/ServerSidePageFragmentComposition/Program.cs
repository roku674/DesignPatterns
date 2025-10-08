using System;

namespace Microservices.UI.ServerSidePageFragmentComposition;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ServerSidePageFragmentComposition Pattern Demo ===\n");
        IServerSidePageFragmentComposition pattern = new ServerSidePageFragmentCompositionImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
