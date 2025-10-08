using System;

namespace Microservices.UI.ClientSideUIComposition;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ClientSideUIComposition Pattern Demo ===\n");
        IClientSideUIComposition pattern = new ClientSideUICompositionImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
